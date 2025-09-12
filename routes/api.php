<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\CategoryController;
use App\Http\Controllers\API\MemberController;
use App\Http\Controllers\API\PlaceOrderController;
use App\Http\Controllers\API\ProductController;
use App\Http\Controllers\API\ShiftController;
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

    Route::post('/checkShift', [ShiftController::class, 'checkShift']);

    /**
     * ==============================
     *          Member
     * ==============================
    */
    Route::get('/getCustomer', [MemberController::class, 'getCustomer']);

    /**
     * ==============================
     *          Open Shift
     * ==============================
    */
    Route::post('/openShift', [ShiftController::class, 'openShift']);

    /**
     * ==============================
     *  Floor & Table Layout Routes
     * ==============================
    */
    Route::prefix('floor_table_layout')->group(function () {
        Route::get('/getFloors', [TableLayoutController::class, 'getFloors']);
        Route::get('/getFloorPlans', [TableLayoutController::class, 'getFloorPlans']);
        Route::get('/getTables', [TableLayoutController::class, 'getTables']);

    });

    

    /**
     * ==============================
     *       Categories Routes
     * ==============================
    */
    Route::prefix('category')->group(function () {
        Route::get('/getCategories', [CategoryController::class, 'getCategories']);
    });
    
    /**
     * ==============================
     *       Products Routes
     * ==============================
    */
    Route::prefix('products')->group(function () {
        Route::get('/getProducts', [ProductController::class, 'getProducts']);
    });

    /**
     * ==============================
     *    Open table & place order
     * ==============================
    */
    Route::post('/update-table', [PlaceOrderController::class, 'updateTable']);
    Route::post('/place-order', [PlaceOrderController::class, 'placeOrder']);
    Route::post('/update-order-pax', [PlaceOrderController::class, 'updateOrderPax']);
    Route::post('/add-customer-to-order', [PlaceOrderController::class, 'addCustomerToOrder']);

    
    
    
});
