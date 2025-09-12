<?php

namespace App\Http\Controllers;

use App\Models\Tenant\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function dashboard()
    {

        $checkShift = Shift::where('shift_status', 'active')->first();


        
        return Inertia::render('Dashboard', [
            'checkShift' => $checkShift,
        ]);
    }
}
