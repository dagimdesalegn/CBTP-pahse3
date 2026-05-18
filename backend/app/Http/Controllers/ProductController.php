<?php

namespace App\Http\Controllers;

use App\Models\InventoryLog;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Product::with('supplier')->where('is_active', true);
        $this->applyProductScope($query, $user, $request);

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

        if ($request->filled('stock_status')) {
            match ($request->input('stock_status')) {
                'out' => $query->where('quantity', 0),
                'low' => $query->where('quantity', '>', 0)->where('quantity', '<=', 10),
                'in_stock' => $query->where('quantity', '>', 10),
                default => null,
            };
        }

        $products = $query
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 12));

        return response()->json($products);
    }

    public function show(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $this->ensureProductInUserScope($product, $request->user());

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
            'kebele' => 'nullable|string|max:255',
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
            'kebele' => $this->productKebeleForCreate($request),
            'supplier_id' => $validated['supplier_id'] ?? null,
            'image_path' => $imagePath,
        ]);

        if ((int) $product->quantity > 0) {
            InventoryLog::create([
                'product_id' => $product->id,
                'change_amount' => (int) $product->quantity,
                'previous_quantity' => 0,
                'new_quantity' => (int) $product->quantity,
                'reason' => 'Product created with opening stock',
                'type' => 'product_create',
                'manager_id' => $request->user()->id,
                'reference_type' => Product::class,
                'reference_id' => $product->id,
            ]);
        }

        NotificationService::notifyStockAvailable($product, (int) $product->quantity, 'new');

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
        $this->ensureProductInUserScope($product, $request->user());

        if ($request->filled('discount_price') && !$request->has('price')) {
            $request->merge(['price' => $product->price]);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_am' => 'nullable|string|max:255',
            'name_or' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_am' => 'nullable|string',
            'description_or' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'quantity' => 'sometimes|integer|min:0',
            'category' => 'sometimes|string',
            'kebele' => 'nullable|string|max:255',
            'supplier_id' => 'nullable|integer|exists:suppliers,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = '/storage/' . $request->file('image')->store('products', 'public');
            $validated['image_path'] = $imagePath;
        }
        unset($validated['image']);
        if ($request->user()->role === 'manager') {
            unset($validated['kebele']);
        }

        [$product, $previousQuantity, $wasActive] = DB::transaction(function () use ($id, $validated, $request) {
            $product = Product::whereKey($id)->lockForUpdate()->firstOrFail();
            $this->ensureProductInUserScope($product, $request->user());
            $previousQuantity = $product->quantity;
            $wasActive = $product->is_active;

            $product->update($validated);
            $product->refresh();

            $addedQuantity = $product->quantity - $previousQuantity;
            if (array_key_exists('quantity', $validated) && $addedQuantity !== 0) {
                InventoryLog::create([
                    'product_id' => $product->id,
                    'change_amount' => $addedQuantity,
                    'previous_quantity' => $previousQuantity,
                    'new_quantity' => (int) $product->quantity,
                    'reason' => $request->input('inventory_reason', 'Product quantity update'),
                    'type' => 'product_update',
                    'manager_id' => $request->user()->id,
                    'reference_type' => Product::class,
                    'reference_id' => $product->id,
                ]);
            }

            return [$product, $previousQuantity, $wasActive];
        });

        $addedQuantity = $product->quantity - $previousQuantity;
        $becameAvailable = $previousQuantity <= 0 && $product->quantity > 0;
        $becameActiveWithStock = !$wasActive && $product->is_active && $product->quantity > 0;

        if ($addedQuantity > 0 || $becameAvailable || $becameActiveWithStock) {
            NotificationService::notifyStockAvailable($product, max($addedQuantity, $product->quantity), 'restock');
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $this->authorize('delete', Product::class);

        $product = Product::find($id);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        $this->ensureProductInUserScope($product, $request->user());

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    private function applyProductScope($query, $user, Request $request): void
    {
        if (!$user) {
            $query->whereRaw('1 = 0');
            return;
        }

        if ($user->role === 'member') {
            $this->whereKebeleMatches($query, $user->verification_kebele);
            return;
        }

        if ($user->role === 'manager') {
            $this->whereKebeleMatches($query, $user->manager_kebele);
            return;
        }

        if ($user->role === 'admin' && $request->filled('kebele')) {
            $this->whereKebeleMatches($query, $request->input('kebele'));
        }
    }

    private function productKebeleForCreate(Request $request): ?string
    {
        $user = $request->user();
        if ($user->role === 'manager') {
            abort_if(!$user->manager_kebele, 422, 'Manager must be assigned to a Kebele before creating products.');
            return $user->manager_kebele;
        }

        return $request->input('kebele') ?: 'Bosa Addis Kebele';
    }

    private function productIsInUserScope(Product $product, $user): bool
    {
        if (!$user) {
            return false;
        }

        if ($user->role === 'member') {
            return $this->normalizeKebele($product->kebele) === $this->normalizeKebele($user->verification_kebele);
        }

        if ($user->role === 'manager') {
            return $this->normalizeKebele($product->kebele) === $this->normalizeKebele($user->manager_kebele);
        }

        return true;
    }

    private function ensureProductInUserScope(Product $product, $user): void
    {
        abort_unless($this->productIsInUserScope($product, $user), 404, 'Product not found');
    }

    private function whereKebeleMatches($query, ?string $kebele): void
    {
        $normalized = $this->normalizeKebele($kebele);
        if (!$normalized) {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->whereRaw("TRIM(REPLACE(LOWER(kebele), ' kebele', '')) = ?", [$normalized]);
    }

    private function normalizeKebele(?string $kebele): string
    {
        return strtolower(trim(str_ireplace(' Kebele', '', $kebele ?? '')));
    }
}
