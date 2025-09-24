<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class DraftOrderItemModifier extends Model
{
    protected $fillable = [
        'order_item_id',
        'modifier_group_id',
        'modifier_group_item_id',
        'name',
        'modifier_name',
        'modifier_price',
    ];
    
}
