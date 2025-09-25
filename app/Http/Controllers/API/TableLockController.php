<?php

namespace App\Http\Controllers\API;

use App\Events\TableLocked;
use App\Events\TableUnlocked;
use App\Http\Controllers\Controller;
use App\Models\Tenant\FloorTable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TableLockController extends Controller
{
    protected function lockKey(FloorTable $table) {
        return "lock:table:{$table->id}";
    }

    public function lock(Request $request, FloorTable $table) 
    {

        $userId = $request->user()->id;
         // 60s lease (auto-release if client disconnects)
        $lock = Cache::lock($this->lockKey($table), 60); // Lock for 5 minutes

        if ($lock->get()) {
            // Optionally remember who owns the lock
            Cache::put($this->lockKey($table).":owner", $userId, 60);

            // broadcast(new TableLocked($table->id))->toOthers();

            return response()->json(['locked' => true, 'owner' => $userId]);
        }

        $owner = Cache::get($this->lockKey($table).":owner");

        return response()->json(['locked' => false, 'owner' => $owner], 423); // 423 Locked

    }

    public function unlock(Request $request, FloorTable $table)
    {
        $owner = Cache::get($this->lockKey($table).":owner");
        // Only the owner (or managers) can unlock; add your own policy check
        if ($owner && ($owner == $request->user()->id || $request->user()->role === 'manager')) {
            Cache::forget($this->lockKey($table).":owner");
            // Release the lock if still held
            optional(Cache::lock($this->lockKey($table)))->release();
            // broadcast(new TableUnlocked($table->id))->toOthers();

            return response()->json(['unlocked' => true]);
        }

        return response()->json(['unlocked' => false], 403);
    }

    public function refresh(Request $request, FloorTable $table) {
        $owner = Cache::get("lock:table:{$table->id}:owner");
        if ($owner == $request->user()->id) {
            Cache::put("lock:table:{$table->id}:owner", $owner, 60);
            return response()->json(['ok' => true]);
        }
        return response()->json(['ok' => false], 409);
    }

}
