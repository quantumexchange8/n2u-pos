<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {

        $credentials = $request->only('uid', 'password');

        // Validate the request data
        $validator = Validator::make($credentials, [
            'uid' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'user' => null,
                'message' => 'Validation error',
                'status' => 'failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $merchant = User::where('uid', $credentials['uid'])->first();
        
        if (!$merchant || !Hash::check($credentials['password'], $merchant->password)) {
            return response()->json([
                'user' => null,
                'message' => 'Invalid login details',
                'status' => 'failed',
            ], 200);
        }

        if ($merchant->status === 'Inactive') {
            return response()->json([
                'message' => 'This merchant is Inactive',
                'status' => 'failed',
            ], 200);
        }

        // Create a token for the authenticated merchant
        $token = $merchant->createToken('API Token')->plainTextToken;

        $user_loggedin = [
            'uid' => $merchant->uid,
            'message' => 'Login successful',
            'data' => [
                'user' => $merchant,
                'token' => $token,
            ],
        ];

        return response()->json($user_loggedin, 200);

    }

    public function logout(Request $request)
    {

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
        ]);

    }
}
