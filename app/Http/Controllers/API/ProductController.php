<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Category;
use App\Models\Tenant\Product;
use App\Models\Tenant\SetMeal;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function getProducts(Request $request)
    {

        if ($request->category_id === 'all') {
            $query = Product::with([
                'category:id,name', 
                'product_modifier_group.product_modifier_group_item',
                'product_modifier_group.modifier_group',
            ]);
        }

        
        if ($request->category_id !== 'all') {
            $category = Category::find($request->category_id);

            if ($category->type === 'single') {
                $query = Product::with([
                    'category:id,name', 
                    'product_modifier_group.product_modifier_group_item',
                    'product_modifier_group.modifier_group',
                ]);
            }

            if ($category->type === 'set') {
                $query = SetMeal::with(['set_meal_item.product', 'set_meal_group.set_meal_group_item.set_meal_group_item.product']);
            }
        }

        

        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        // 🔎 filter by product name or item_code
        if ($request->filled('filterProduct')) {
            $filter = $request->get('filterProduct');
            $query->where(function($q) use ($filter) {
                $q->where('name', 'like', "%{$filter}%")
                ->orWhere('item_code', 'like', "%{$filter}%");
            });
        }

        $limit = $request->get('limit', 12);

        $products = $query->paginate($limit);

        $products->getCollection()->transform(function ($product) {
            $product->product_image = $product->getFirstMediaUrl('product_image');
            return $product;
        });
        
        return response()->json($products);
    }
}
