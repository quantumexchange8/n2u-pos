<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function() {
    return Inertia::render('Auth/Login');
});

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    /**
     * ==============================
     *            Order
     * ==============================
    */
    Route::get('/order', [OrderController::class, 'order'])->name('order');

    /**
     * ==============================
     *            Payment
     * ==============================
    */
    Route::get('/payment', [PaymentController::class, 'payment'])->name('payment');
    Route::get('/payment-success', [PaymentController::class, 'paymentSuccess'])->name('payment-success');
    
});

require __DIR__.'/auth.php';
