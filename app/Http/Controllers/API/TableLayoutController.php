<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\FloorTable;
use App\Models\TableLayout;
use Illuminate\Http\Request;

class TableLayoutController extends Controller
{
    public function getFloors()
    {

        $floors = TableLayout::orderBy('order_no')->get();

        return response()->json([
            'floors' => $floors,
        ], 200);
    }

    public function getFloorPlans(Request $request)
    {

        $query = TableLayout::with('table')->orderBy('order_no');

        if ($request->has('selectedFloor')) {
            $selectedFloor = $request->get('selectedFloor');
            $query->where('id', $selectedFloor);
        }

        $floorPlan = $query->first();

        return response()->json([
            'floorPlan' => json_decode($floorPlan->layout_json, true),
            'table' => $floorPlan->table,
        ]);
    }

    public function getTables(Request $request)
    {

        $query = FloorTable::query();


        if ($request->has('selectedFloor')) {
            $selectedFloor = $request->get('selectedFloor');
            $query->where('table_layout_id', $selectedFloor);
        }

        $tables = $query->get();

        return response()->json($tables);
    }
}
