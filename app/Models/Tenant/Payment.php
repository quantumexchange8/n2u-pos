<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'receipt_no',
        'payment_method',
        'paid_for_item',
        'amount',
        'sst_amount',
        'sst_rate',
        'service_charge',
        'service_rate',
        'discount_amount',
        'rounding',
        'total_amount',
        'pay_in_amount',
        'change_balance',
        'points',
        'status',
        'payment_time',
        'handle_by',
    ];

}
