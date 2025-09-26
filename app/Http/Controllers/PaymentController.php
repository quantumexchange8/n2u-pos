<?php

namespace App\Http\Controllers;

use App\Models\Tenant\FloorTable;
use App\Models\Tenant\Order;
use App\Models\Tenant\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function payment(Request $request)
    {

        $findOrder = Order::with(['user'])->find($request->order);
        $findTable = FloorTable::find($request->table);

        if ($findOrder->status === 'completed') {
            return redirect()->route('dashboard');
        } else {
            return Inertia::render('Payment/Payment', [
                'order' => $findOrder,
                'table' => $findTable,
            ]);
        }
    }

    public function paymentSuccess(Request $request)
    {

        $findInvoice = Payment::where('receipt_no', $request->receipt_no)->first();

        return Inertia::render('Payment/PaymentSuccess', [
            'findInvoice' => $findInvoice, 
        ]);
    }
}
