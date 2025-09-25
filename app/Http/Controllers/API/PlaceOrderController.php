<?php

namespace App\Http\Controllers\API;

use App\Events\OrderHistory;
use App\Events\TableStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant\DraftOrder;
use App\Models\Tenant\DraftOrderItem;
use App\Models\Tenant\DraftOrderItemModifier;
use App\Models\Tenant\FloorTable;
use App\Models\Tenant\Order;
use App\Models\Tenant\OrderItem;
use App\Models\Tenant\OrderItemModifier;
use App\Models\Tenant\Otp;
use App\Models\Tenant\Shift;
use App\Models\Tenant\TaxSetting;
use App\Models\User;
use App\Services\RunningNumberService;
use Carbon\Carbon;
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

            $table->update([
                'lock_status' => 'locked',
                'locked_by' => $user->id,
            ]);

            // $order = Order::create([
            //     'shift_id' => $currentShift->id,
            //     'user_id' => $user->id,
            //     'order_no' => RunningNumberService::getID('order_no'),
            //     'table_id' => $table->id,
            //     'table_name' => $table->table_name,
            //     'status' => 'draft',
            //     'pax' => $table->pax,
            // ]);
    
            // $table->update([
            //     'status' => 'occupied',
            //     'current_order_id' => $order->id,
            // ]);

            broadcast(new TableStatus($table))->toOthers();

            return response()->json([
                // 'message' => 'Order created: ' . $order->order_no . ' & table updated: ' . $table->status,
                // 'order' => $order,
                'table' => $table,
                'pax' => $request->pax,
            ], 200);
        }

        return response()->json([
            'message' => 'table not found / current shift is not active'
        ], 400);
    }

    public function returnFromOrder(Request $request)
    {

        $table = FloorTable::find($request->table);

        $table->update([
            'lock_status' => null,
            'locked_by' => null,
        ]);

        broadcast(new TableStatus($table))->toOthers();

        return response()->json(['success' => true]);
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
        // dd($request->all());

        $findTable = FloorTable::find($request->table_id);
        $user = Auth::user();

        $currentShift = Shift::where('shift_status', 'active')->first();

        if (!$findTable->current_order_id) {
            
            $order = Order::create([
                'shift_id' => $currentShift->id,
                'user_id' => $user->id,
                'order_no' => RunningNumberService::getID('order_no'),
                'table_id' => $findTable->id,
                'table_name' => $findTable->table_name,
                'status' => 'draft',
                'pax' => $request->pax,
            ]);

            $findTable->update([
                'status' => 'occupied',
                'current_order_id' => $order->id,
            ]);

        } else {

            $order = Order::where('id', $request->order_id)->where('order_no', $request->order_no)->first();

        }

        if ($order) {

            $sst = TaxSetting::where('type', 'sst')->first();
            $service_charge = TaxSetting::where('type', 'service_charge')->first();
            
            // get and calculate tax & service charge
            $tax = $request->total_amount * ($sst->percentage / 100);
            $service_tax = $request->total_amount * ($service_charge->percentage / 100);

            $total = $request->total_amount + $tax + $service_tax;

            $rounded_total = round($total * 20) / 20;
            $rounding = $rounded_total - $total;

            $order->subtotal += $request->total_amount;
            $order->tax += $tax;
            $order->service_charge += $service_tax;
            $order->rounding += $rounding;
            $order->total += $rounded_total;
            $order->save();

            $order->update([
                'tax_rate' => $sst->percentage,
                'service_rate' => $service_charge->percentage,
                'status' => 'pending',
            ]);

            foreach ($request->products as $item) {

                $orderItem = OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'type' => 'product',
                    'qty' => $item['quantity'],
                    'price' => $item['prices'],
                    'total_price' => $item['total_price'] * $item['quantity'],
                    'remarks' => $item['remarks'],
                    'status' => 'preparing',
                ]);

                if (!empty($item['product_modifier'])) {
                    foreach ($item['product_modifier'] as $modifier) {
                        // dd($modifier['id']);

                        if (!empty($modifier['product_item_ids'])) {
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
            }

            broadcast(new OrderHistory($order->id))->toOthers();

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
            $orderId = $request->params['order_id'];

            $order = Order::find($orderId);
            $orderitem = OrderItem::find($orderItemId);

            if ($orderitem) {

                if ($request->params['status'] === 'preparing') {
                    $orderitem->update([
                        'status' => 'served'
                    ]);

                    broadcast(new OrderHistory($orderitem->order_id))->toOthers();

                    $itemsServed = false;
                    if ($order->payment_status === 'completed') {
                        $itemsServed = $this->checkAllOrderItem($order);
                    }
                    

                    return response()->json([
                        'success' => true,
                        'message' => 'Order item served.',
                        'items_served' => $itemsServed
                    ]);
                }

                if ($request->params['status'] === 'served') {
                    $orderitem->update([
                        'status' => 'preparing'
                    ]);

                    broadcast(new OrderHistory($orderitem->order_id))->toOthers();

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

            $order = Order::find($params['order_id']);
            $orderItem = OrderItem::find($params['order_item_id']);

            if ($orderItem && $order) {
                $orderItem->update([
                    'status' => 'void',
                    'sys_remarks' => $params['sysRemark'],
                ]);

                $sst = TaxSetting::where('type', 'sst')->first();
                $service_charge = TaxSetting::where('type', 'service_charge')->first();

                $remainingItems = OrderItem::where('order_id', $order->id)
                    ->where('status', '!=', 'void')
                    ->get();

                $subtotal = $remainingItems->sum('total_price');
                $tax_amount = $sst ? $subtotal * ($sst->percentage / 100) : 0;
                $service_tax = $service_charge ? $subtotal * ($service_charge->percentage / 100) : 0;

                $total = $subtotal + $tax_amount + $service_tax;

                // Round to nearest 0.05 (like Malaysia F&B)
                $rounded_total = round($total * 20) / 20;
                $rounding = $rounded_total - $total;

                // Update order
                $order->update([
                    'subtotal'       => $subtotal,
                    'tax'            => $tax_amount,
                    'service_charge' => $service_tax,
                    'rounding'       => $rounding,
                    'total'          => $rounded_total,
                ]);

                broadcast(new OrderHistory($orderItem->order_id))->toOthers();

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

        return response()->json([
            'error' => 'error fetching data',
        ]);
    }

    public function draftOrderItems(Request $request)
    {
        $user = Auth::user();
        $checkDraft = DraftOrder::where('table_id', $request->table_id)->where('status', 'draft')->first();

        if ($checkDraft) {

        }

        if (!$checkDraft) {
            $draft = DraftOrder::create([
                'table_id' => $request->table_id,
                'user_id' => $user->id,
                'status' => 'draft',
            ]);

            foreach ($request->products as $item) {
                // dd($item);

                $findDraftItem = DraftOrderItem::find($item['id']);

                if ($findDraftItem) {
                    $findDraftItem->update([
                        'product_id' => $item['product_id'],
                        'type' => 'product',
                        'qty' => $item['quantity'],
                        'price' => $item['total_price'],
                        'total_price' => $item['total_price'] * $item['quantity'],
                        'remarks' => $item['remarks'],
                        'status' => 'draft',
                    ]);
                } else {

                    $draftItem = DraftOrderItem::create([
                        'draft_order_id' => $draft->id,
                        'product_id' => $item['product_id'],
                        'type' => 'product',
                        'qty' => $item['quantity'],
                        'price' => $item['total_price'],
                        'total_price' => $item['total_price'] * $item['quantity'],
                        'remarks' => $item['remarks'],
                        'status' => 'draft',
                    ]);
                }

                if (!empty($item['product_modifier'])) {
                    foreach ($item['product_modifier'] as $modifier) {
                        // dd($modifier['id']);

                        if (!empty($modifier['product_item_ids'])) {
                            foreach ($modifier['product_item_ids'] as $prodItem ) {
    
                                $draftItemMod = DraftOrderItemModifier::create([
                                    'order_item_id' => $draftItem->id,
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
            }
        }

        return response()->json();
    }

    public function serveAllItem(Request $request)
    {

        if (!empty($request->items)) {
            foreach ($request->items as $item) {
                $findItem = OrderItem::find($item['id']);

                $findItem->update([
                    'status' => 'served',
                ]);
            }

            $order = Order::find($request->order_id);

            $itemsServed = false;
            if ($order->payment_status === 'completed') {
                $itemsServed = $this->checkAllOrderItem($order);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order item served.',
                'items_served' => $itemsServed
            ]);
        }

        return response()->json();
    }

    public function serveAllOrderHistory(Request $request)
    {

        $orderItem = OrderItem::where('order_id', $request->order_id)->where('status', 'preparing')->get();

        if ($orderItem->isNotEmpty()) {
            foreach ($orderItem as $item) {
                $item->update([
                    'status' => 'served',
                ]);
            }

            broadcast(new OrderHistory($request->order_id))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'All Order item served.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No item to be served.',
        ]);
    }

    public function voidOrderBill(Request $request)
    {

        $user = Auth::user();
        $params = $request->params;

        if ($user->pin === $params['pinNo']) {

            if ($params['remarks']) {

                $order = Order::find($params['order_id']);

                $table = FloorTable::find($order->table_id);

                if ($table && $order) {
                    $order->update([
                        'status' => 'voided',
                        'remark' => $params['remarks'],
                        'void_datetime' => Carbon::now(),
                        'voided_by' => $user->id,
                    ]);

                    $table->update([
                        'status' => 'available',
                        'current_order_id' => null,
                        'lock_status' => null,
                        'locked_by' => null,
                    ]);
                    
                    broadcast(new TableStatus($table))->toOthers();

                    return response()->json([
                        'success' => true
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Table or order is not found.',
                ], 400);
            }

            return response()->json([
                'remark' => 'Remarks is required.'
            ], 400);

        }

        return response()->json([
            'message' => 'Invalid pin'
        ], 401);
    }

    // Private Section
    private function checkAllOrderItem($order)
    {

        $checkOrderItems = OrderItem::where('order_id', $order->id)->pluck('status');

        if ($checkOrderItems->contains('preparing')) {
            // Still preparing → not all served
            return false;
        }

        // No preparing left → mark order completed
        $order->update([
            'status' => 'completed',
        ]);

        $findTable = FloorTable::find($order->table_id);
        $findTable->update([
            'status' => 'completed',
            'current_order_id' => null,
            'lock_status' => null,
            'locked_by' => null,
            'status' => 'available',
        ]);

        return true; // ✅ tell controller that all served

    }
}
