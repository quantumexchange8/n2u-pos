<?php

namespace App\Http\Controllers\API;

use App\Events\TableStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant\FloorTable;
use App\Models\Tenant\Order;
use App\Models\Tenant\OrderItem;
use App\Models\Tenant\OrderItemModifier;
use App\Models\Tenant\Shift;
use App\Models\Tenant\TaxSetting;
use App\Models\User;
use App\Services\RunningNumberService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlaceOrderController extends Controller
{
    public function updateTable(Request $request)
    {
        $user = Auth::user();
        $table = FloorTable::where('table_id', $request->table_id)
            ->where('table_layout_id', $request->table_layout_id)
            ->first();

        $currentShift = Shift::where('shift_status', 'active')->first();

        if ($table->status !== 'available') {
            if ($table->status === 'occupied') {
                return response()->json([
                    'message' => 'This table is in occupied',
                    'table' => $table,
                ], 200);
            }

            if ($table->status === 'reserved') {
                return response()->json([
                    'message' => 'This table is in reserved',
                    'table' => $table,
                ], 200);
            }
        } 


        if ($table && $currentShift) {
            $order = Order::create([
                'shift_id' => $currentShift->id,
                'user_id' => $user->id,
                'order_no' => RunningNumberService::getID('order_no'),
                'table_id' => $table->id,
                'table_name' => $table->table_name,
                'status' => 'draft',
                'pax' => $table->pax,
            ]);
    
            $table->update([
                'status' => 'occupied',
                'current_order_id' => $order->id,
            ]);

            return response()->json([
                'message' => 'Order created: ' . $order->order_no . ' & table updated: ' . $table->status,
                'order' => $order,
                'table' => $table,
            ], 200);
        }

        return response()->json([
            'message' => 'table not found / current shift is not active'
        ], 400);
    }

    public function placeOrder(Request $request)
    {

        $table = FloorTable::where('table_layout_id', $request->table_layout_id)
            ->where('table_id', $request->table_id)
            ->first();

        $table->update([
            'status' => $request->status
        ]);

        broadcast(new TableStatus($table))->toOthers();

        return response()->json(['success' => true]);
    }

    public function updateOrderPax(Request $request)
    {

        $order = Order::where('id', $request->order_id)->where('order_no', $request->order_no)->first();

        $order->update([
            'pax' => $request->pax,
        ]);

        return response()->json([
            'success' => true
        ]);
    }

    public function addCustomerToOrder(Request $request)
    {

        $order = Order::find($request->order_id);

        if ($order) {
            $customer = User::find($request->member_id);

            if ($customer) {
                $order->update([
                    'customer_id' => $customer->id,
                ]);

                return response()->json(['success' => true]);
            }

            return response()->json([
                'message' => 'customer not found.'
            ]);
        }

        return response()->json([
            'message' => 'order not found.'
        ]);
    }

    public function placeOrderItem(Request $request)
    {
        // dd($request->products);
        $order = Order::where('id', $request->order_id)->where('order_no', $request->order_no)->first();
        
        if ($order) {

            $sst = TaxSetting::where('type', 'sst')->first();
            $service_charge = TaxSetting::where('type', 'service_charge')->first();
            
            // get and calculate tax & service charge
            $tax = $request->total_amount * ($sst->percentage / 100);
            $service_tax = $request->total_amount * ($service_charge->percentage / 100);

            $total = $request->total_amount + $tax + $service_tax;

            $order->update([
                'subtotal' => $request->total_amount,
                'tax' => $tax,
                'service_charge' => $service_tax,
                'total' => $total,
                'status' => 'pending',
            ]);

            foreach ($request->products as $item) {

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'type' => 'order',
                    'qty' => $item['quantity'],
                    'price' => $item['total_price'],
                    'total_price' => $item['total_price'] * $item['quantity'],
                    'remarks' => $item['remarks'],
                    'status' => 'preparing',
                ]);

                if (!empty($item['product_modifier'])) {
                    foreach ($item['product_modifier'] as $modifier) {
                        // dd($modifier['id']);

                        foreach ($modifier['product_item_ids'] as $prodItem ) {

                            $orderItemMod = OrderItemModifier::create([
                                'order_item_id' => $orderItem->id,
                                'modifier_group_id' => $modifier['id'],
                                'modifier_group_item_id' => $prodItem['id'],
                                'name' => $modifier['name'],
                                'modifier_name' => $prodItem['modifier_name'],
                                'modifier_price' => $prodItem['modifier_price'],
                            ]);
                        }
                    }
                }
            } 

            return response()->json([
                'success' => true,
                'message' => 'Order placed and sent to kitchen.'
            ], 200);

        }

        return response()->json([
            'message' => 'order not found.'
        ]);
    }

    public function serveOrderItem(Request $request)
    {

        if (!empty($request->params)) {
            $orderItemId = $request->params['order_item_id'];

            $orderitem = OrderItem::find($orderItemId);

            if ($orderitem) {

                if ($request->params['status'] === 'preparing') {
                    $orderitem->update([
                        'status' => 'served'
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Order item served.'
                    ]);
                }

                if ($request->params['status'] === 'served') {
                    $orderitem->update([
                        'status' => 'preparing'
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Order item unserved.'
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'item not found.'
            ]);
        }
        return response()->json([
            'success' => false,
            'message' => 'Invalid request.'
        ]);
        
    }

    public function voidOrderItem(Request $request)
    {

        $user = Auth::user();
        $params = $request->params;
        
        if ($user->pin === $params['pinNo']) {

            $orderItem = OrderItem::find($params['order_item_id']);

            if ($orderItem) {

                $orderItem->update([
                    'status' => 'void',
                    'sys_remarks' => $params['sysRemark'],
                ]);

                return response()->json([
                    'message' => 'Order item voided.'
                ], 200);

            }

            return response()->json([
                'message' => 'Order item not found',
            ]);

        }

        return response()->json([
            'message' => 'Invalid pin'
        ], 401);
    }

    public function getOrderHistory(Request $request)
    {

        $order = Order::find($request->id);

        if ($order) {

            // get all order item
            $orderItems = OrderItem::where('order_id', $order->id)->with([
                'product',
                'orderItemModifier',
            ])->get();

            return response()->json($orderItems);

        }

        return response()->json();
    }
}
