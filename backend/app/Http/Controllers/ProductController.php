<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('supplier')->where('is_active', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('name_am', 'like', '%' . $request->search . '%')
                  ->orWhere('name_or', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhere('description_am', 'like', '%' . $request->search . '%')
                  ->orWhere('description_or', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->paginate($request->integer('per_page', 12));

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Product::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_am' => 'nullable|string|max:255',
            'name_or' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_am' => 'nullable|string',
            'description_or' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'quantity' => 'required|integer|min:0',
            'category' => 'required|string',
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = '/storage/' . $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $validated['name'],
            'name_am' => $validated['name_am'] ?? null,
            'name_or' => $validated['name_or'] ?? null,
            'description' => $validated['description'] ?? null,
            'description_am' => $validated['description_am'] ?? null,
            'description_or' => $validated['description_or'] ?? null,
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'] ?? null,
            'quantity' => $validated['quantity'],
            'category' => $validated['category'],
            'supplier_id' => $validated['supplier_id'] ?? null,
            'image_path' => $imagePath,
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorize('update', Product::class);

        $product = Product::find($id);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_am' => 'nullable|string|max:255',
            'name_or' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_am' => 'nullable|string',
            'description_or' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'quantity' => 'sometimes|integer|min:0',
            'category' => 'sometimes|string',
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = '/storage/' . $request->file('image')->store('products', 'public');
            $validated['image_path'] = $imagePath;
        }
        unset($validated['image']);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    public function destroy($id)
    {
        $this->authorize('delete', Product::class);

        $product = Product::find($id);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
