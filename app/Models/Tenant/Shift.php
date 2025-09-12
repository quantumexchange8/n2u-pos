<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    protected $fillable = [
        'shift_date',
        'shift_number',
        'terminal_id',
        'opened_user_id',
        'closed_user_id',
        'opening_time',
        'closing_time',
        'starting_cash',
        'total_pay_in',
        'total_pay_out',
        'actual_amount',
        'expected_closing_cash',
        'different_amount',
        'total_cash_sales',
        'total_card_sales',
        'total_ewallet_sales',
        'total_sales',
        'shift_status',
    ];
    
}
