<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Shift;
use App\Services\RunningNumberService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ShiftController extends Controller
{
    public function checkShift(Request $request)
    {

        $checkShift = $this->checkExistingShift();

        if ($checkShift) {
            return response()->json([
                'message' => 'A shift is already active today',
                'shift'   => $checkShift
            ], 403);
        } else {
            return response()->json([
                'message' => 'No shift is opened can proceed',
            ], 200);

        }

    }

    public function openShift(Request $request)
    {

        $user = Auth::user();
        $todayDate = Carbon::now();
        $nowtime = Carbon::now()->toTimeString();

        $checkShift = $this->checkExistingShift();

        if ($checkShift) {
            return response()->json([
                'message' => 'A shift is already active today',
                'shift'   => $checkShift
            ], 403);
        }

        $shift = Shift::create([
            'shift_date' => $todayDate,
            'shift_number' => RunningNumberService::getID('shift'),
            'opened_user_id' => $user->id,
            'opening_time' => $nowtime,
            'starting_cash' => $request->cash,
            'shift_status' => 'active',
        ]);

        return response()->json([
            'shift' => $shift,
            'messages' => 'shift ' . $shift->shift_number . ' opened at ' . $shift->shift_date,
        ], 200);
    }

    protected function checkExistingShift()
    {

        $todayDate = Carbon::now()->toDateString(); // e.g. "2025-08-29"

        // check if there's already an active shift today
        $checkShift = Shift::where('shift_status', 'active')
            ->whereDate('shift_date', $todayDate) // ignores the time portion
            ->first();

        return $checkShift;

    }
}
