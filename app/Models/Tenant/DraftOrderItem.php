<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class DraftOrderItem extends Model
{
    
    protected $fillable = [
        'draft_order_id',
        'product_id',
        'type',
        'qty',
        'price',
        'total_price',
        'remarks',
        'status',
    ];

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function orderItemModifier(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DraftOrderItemModifier::class, 'order_item_id', 'id');
    }

}
