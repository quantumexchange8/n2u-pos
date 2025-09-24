<?php

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FloorTable extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'table_layout_id',
        'table_id',
        'table_name',
        'pax',
        'status',
        'current_order_id',
        'available_color',
        'in_use_color',
        'reserved_color',
        'lock_status',
        'locked_by',
    ];

    public function order(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Order::class, 'current_order_id', 'id');
    }
}
