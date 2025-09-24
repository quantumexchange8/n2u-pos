<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function getCategories()
    {

        $query = Category::where('status', 'active')
            ->where('visibility', 'display')
            ->with(['product'])
            ->orderBy('order_no');
        
        $categories = $query->get();

        return response()->json($categories);
    }
}
