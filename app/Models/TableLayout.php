<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TableLayout extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'name',
        'order_no',
        'layout_json',
        'floor',
        'table_id',
    ];

    public function table(): \Illuminate\Database\Eloquent\Relations\hasMany
    {
        return $this->hasMany(FloorTable::class, 'table_layout_id', 'id');
    }

}
