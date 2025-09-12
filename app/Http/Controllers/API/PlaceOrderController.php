<?php

namespace App\Http\Controllers\API;

use App\Events\TableStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant\FloorTable;
use Illuminate\Http\Request;

class PlaceOrderController extends Controller
{
    public function placeOrder(Request $request)
    {

        $table = FloorTable::where('table_layout_id', $request->table_layout_id)
            ->where('table_id', $request->table_id)
            ->first();

        $table->update([
            'status' => $request->status
        ]);

        broadcast(new TableStatus($table))->toOthers();

        return response()->json(['success' => true]);
    }
}
