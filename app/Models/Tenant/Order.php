<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'shift_id',
        'user_id',
        'order_no',
        'customer_id',
        'table_id',
        'table_name',
        'status',
        'subtotal',
        'tax',
        'discount',
        'total',
        'remark',
        'pax',
        'tax_rate',
        'service_rate',
        'rounding',
        'service_charge',
        'payment_status',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id', 'id');
    }
}
