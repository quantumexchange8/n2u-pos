<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class DraftOrder extends Model
{
    
    protected $fillable = [
        'table_id',
        'user_id',
        'status',
    ];
    
    public function order_item(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(DraftOrderItem::class, 'draft_order_id', 'id');
    }

}
