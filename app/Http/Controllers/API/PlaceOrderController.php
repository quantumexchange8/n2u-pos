<?php

namespace App\Http\Controllers\API;

use App\Events\TableStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant\FloorTable;
use App\Models\Tenant\Order;
use App\Models\Tenant\Shift;
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
}
