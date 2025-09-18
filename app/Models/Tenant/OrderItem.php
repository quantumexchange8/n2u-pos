<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'type',
        'qty',
        'price',
        'remarks',
        'total_price',
        'status',
        'sys_remarks',
    ];

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function orderItemModifier(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OrderItemModifier::class, 'order_item_id', 'id');
    }
}
