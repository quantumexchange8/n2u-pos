<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Order;
use App\Models\User;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function getCustomer()
    {

        $customer = User::where('role', 'member')->where('status', 'active')->get();

        return response()->json(
            $customer
        );
    }

    public function getCustomerDetails(Request $request)
    {

        $customer = User::with([
            'rank'
        ])->find($request->id);

        return response()->json($customer);
    }

    public function unassignedCustomer(Request $request)
    {

        $order = Order::find($request->params['order_id']);

        if ($order) {

            $user = User::find($request->params['customer_id']);

            if ($user) {
                // can logout
                $order->update([
                    'customer_id' => null,
                ]);

                return response()->json([
                    'success' => true
                ]);
            }

            return response()->json([
                'message' => 'user not found, please check again.'
            ]);
        }

        return response()->json([
            'message' => 'Order not found, please check again.'
        ]);
    }
}
