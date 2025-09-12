<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function getProducts(Request $request)
    {

        $query = Product::with([
            'category:id,name', 
            'product_modifier_group.product_modifier_group_item',
            'product_modifier_group.modifier_group',
        ]);

        if ($request->filled('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
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
