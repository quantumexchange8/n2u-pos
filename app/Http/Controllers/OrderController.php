<?php

namespace App\Http\Controllers;

use App\Models\Tenant\DraftOrder;
use App\Models\Tenant\FloorTable;
use App\Models\Tenant\Order;
use App\Models\Tenant\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function order(Request $request)
    {

        $table = FloorTable::where('table_id', $request->table_id)
            ->where('table_layout_id', $request->table_layout_id)
            ->with(['order.user'])
            ->first();

        $draftOrder = DraftOrder::where('table_id', $table->id)
            ->where('status', 'draft')
            ->with(['order_item.product', 'order_item.orderItemModifier'])
            ->first();

        if ($table->current_order_id) {
            // check order item have still pending havent serve
            $order = Order::find($table->current_order_id);

            if ($order->status === 'pending' && $order->payment_status === 'completed') {
                $orderItemInComplete = OrderItem::where('order_id', $order->id)->where('status', 'preparing')->with(['product', 'orderItemModifier'])->get();

                $orderItemInComplete->each(function ($item) {
                    if ($item->product) {
                        $item->product->product_image = $item->product->getFirstMediaUrl('product_image');
                    }
                });
            }
        }

        return Inertia::render('Order/Order', [
            'table' => $table,
            'paxs' => $request->pax ?? $table->order->pax,
            'draftOrder' => $draftOrder->order_item ?? null,
            'orderItemInComplete' => $orderItemInComplete ?? null,
        ]);
    }
}
