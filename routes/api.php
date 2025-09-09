<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\PlaceOrderController;
use App\Http\Controllers\API\TableLayoutController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::controller(AuthController::class)->group(function () {
    Route::post('login', 'login');
    Route::post('logout', 'logout')->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/getFloors', [TableLayoutController::class, 'getFloors']);
    Route::get('/getFloorPlans', [TableLayoutController::class, 'getFloorPlans']);
    Route::get('/getTables', [TableLayoutController::class, 'getTables']);

    Route::post('/place-order', [PlaceOrderController::class, 'placeOrder']);
});
