<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
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
}
