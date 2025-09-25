<?php

namespace App\Http\Controllers\API;

use App\Events\TableStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant\FloorTable;
use App\Models\Tenant\Order;
use App\Models\Tenant\OrderItem;
use App\Models\Tenant\Payment;
use App\Models\Tenant\PaymentMethod;
use App\Models\Tenant\Shift;
use App\Services\RunningNumberService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function getPaymentMethod()
    {

        $paymentMethods = PaymentMethod::where('status', 'active')->get();

        return response()->json($paymentMethods);
    }

    public function getOrderItems(Request $request)
    {

        $orders = OrderItem::where('order_id', $request->id)->with(['orderItemModifier', 'product'])
        ->whereIn('status', ['preparing', 'served'])
        ->get();

        return response()->json($orders);
    }

    public function makePayment(Request $request)
    {
        // dd($request->params['uid']);

        $user = Auth::user();

        if ($request->params['payment_method'] === 'cash') {
            $payment = $this->PayByCash($request->params, $user);

            $uuid = md5($payment->receipt_no . $payment->order_id . $payment->total_amount);

            return response()->json([
                'success' => true,
                'payment' => $payment,
                'uuid' => $uuid,
            ]);

        }
        

        return response()->json([
            'error' => 'Internal error'
        ], 500);
    }

    private function PayByCash ($params, $user) {

        $findOrder = Order::where('id', $params['order_id'])->where('order_no', $params['order_no'])->first();

        if ($findOrder) {

            $change_balance = $params['pay_amount'] - $findOrder->total;

            // calculate points
            $this->CalculatePoint();

            // create payment table
            $payment = Payment::create([
                'order_id' => $findOrder->id,
                'receipt_no' => RunningNumberService::getID('inv'),
                'payment_method' => 'Cash',
                'amount' => $findOrder->subtotal,
                'sst_amount' => $findOrder->tax,
                'sst_rate' => $findOrder->tax_rate,
                'service_charge' => $findOrder->service_charge,
                'service_rate' => $findOrder->service_rate,
                'rounding' => $findOrder->rounding,
                'total_amount' => $findOrder->total,
                'pay_in_amount' => $params['pay_amount'],
                'change_balance' => $change_balance,
                'status' => 'completed',
                'payment_time' => Carbon::now(),
                'handle_by' => $user->id,
            ]);

            $this->updateOrderTable($findOrder);

            $this->UpdateCashShift($findOrder->shift_id, $payment);

            return $payment;
        }
    }

    private function PayByCard () {
        
    }

    private function PayByTng () {
        
    }

    private function CalculatePoint () {
        return;
    }

    private function UpdateCashShift ($shiftId, $payment) {

        $currentShift = Shift::find($shiftId);

        if (! $currentShift) {
            throw new \Exception("Shift not found");
        }

        $currentShift->total_cash_sales += $payment->total_amount;
        $currentShift->total_sales += $payment->total_amount;
        $currentShift->save();
    }

    private function updateOrderTable($findOrder) {

        $findTable = FloorTable::find($findOrder->table_id);

        $checkOrderItems = OrderItem::where('order_id', $findOrder->id)->pluck('status');

        if ($checkOrderItems->contains('preparing')) {
            // At least one item still preparing
            $findOrder->update([
                'status' => 'pending',   // still active
                'payment_status' => 'completed'
            ]);

             $findTable->update([
                'status' => 'completed',
            ]);
        
        } else {
            // No preparing items left, all served (or cancelled)
            $findOrder->update([
                'status' => 'completed',
                'payment_status' => 'completed'
            ]);

             $findTable->update([
                'status' => 'completed',
                'current_order_id' => null,
                'lock_status' => null,
                'locked_by' => null,
            ]);
        }

       
        // broadcast(new TableStatus($findTable))->toOthers();
        
    }

    public function returnFromSuccess(Request $request)
    {

        $findOrder = Order::find($request->order_id);

        $findTable = FloorTable::find($findOrder->table_id);

        if ($findOrder->status === 'pending') {
            $findTable->update([
                'lock_status' => null,
                'locked_by' => null,
            ]);
        }

        if ($findOrder->status === 'completed') {
            $findTable->update([
                'lock_status' => null,
                'locked_by' => null,
                'status' => 'available',
                'current_order_id' => null,
            ]);
        }

        return response()->json([
            'success' => true,
        ]);

    }
}
