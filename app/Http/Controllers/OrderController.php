<?php

namespace App\Http\Controllers;

use App\Models\Tenant\FloorTable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function order(Request $request)
    {

        $table = FloorTable::where('table_id', $request->table_id)
            ->where('table_layout_id', $request->table_layout_id)
            ->first();


        return Inertia::render('Order/Order', [
            'table' => $table,
        ]);
    }
}
