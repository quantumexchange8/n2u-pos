<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class SetMealItem extends Model
{
    protected $fillable = [
        'set_meal_id',
        'product_id',
        'quantity',
        'status',
    ];

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }


}
