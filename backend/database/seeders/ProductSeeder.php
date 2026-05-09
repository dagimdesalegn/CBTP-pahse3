<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Supplier;

class ProductSeeder extends Seeder
{
    private function imageFor(string $name): string
    {
        $images = [
            'White Teff - 5 kg' => 'white-teff.png',
            'Brown Teff - 5 kg' => 'brown-teff.png',
            'Wheat Flour - 5 kg' => 'wheat-flour.png',
            'Barley Flour - 3 kg' => 'barley-flour.png',
            'Long Grain Rice - 5 kg' => 'long-grain-rice.png',
            'Macaroni Pasta - 500 g' => 'macaroni-pasta.png',
            'Spaghetti - 500 g' => 'spaghetti.png',
            'Red Lentils - 1 kg' => 'red-lentils.png',
            'Green Lentils - 1 kg' => 'green-lentils.png',
            'Chickpeas - 1 kg' => 'chickpeas.png',
            'Split Peas - 1 kg' => 'split-peas.png',
            'Fava Beans - 1 kg' => 'fava-beans.png',
            'Sunflower Cooking Oil - 1 L' => 'sunflower-oil.png',
            'Vegetable Cooking Oil - 3 L' => 'vegetable-oil.png',
            'Sesame Oil - 500 ml' => 'sesame-oil.png',
            'Refined Sugar - 1 kg' => 'refined-sugar.png',
            'Brown Sugar - 1 kg' => 'brown-sugar.png',
            'Pure Honey - 500 g' => 'pure-honey.png',
            'Iodized Salt - 1 kg' => 'iodized-salt.png',
            'Berbere Spice - 250 g' => 'berbere-spice.png',
            'Shiro Powder - 1 kg' => 'shiro-powder.png',
            'Mitmita Spice - 100 g' => 'mitmita-spice.png',
            'Tomato Paste - 400 g' => 'tomato-paste.png',
            'Ethiopian Coffee Beans - 500 g' => 'coffee-beans.png',
            'Ground Coffee - 250 g' => 'ground-coffee.png',
            'Black Tea - 100 bags' => 'black-tea.png',
            'Powdered Milk - 400 g' => 'powdered-milk.png',
            'UHT Milk - 1 L' => 'uht-milk.png',
            'Laundry Detergent - 1 kg' => 'laundry-detergent.jpg',
            'Dish Soap - 750 ml' => 'dish-soap.jpg',
            'Bath Soap - 4 pack' => 'bath-soap.jpg',
            'Toilet Paper - 10 rolls' => 'toilet-paper.jpg',
            'Bleach - 1 L' => 'bleach.jpg',
            'Exercise Books - 10 pack' => 'exercise-books.jpg',
            'Ballpoint Pens - 12 pack' => 'ballpoint-pens.jpg',
            'AA Batteries - 4 pack' => 'aa-batteries.jpg',
        ];

        return '/storage/products/' . ($images[$name] ?? 'long-grain-rice.png');
    }

    public function run(): void
    {
        $supplierByCategory = [
            'Grains' => Supplier::where('company_name', 'Jimma Farmers Union')->value('id'),
            'Legumes' => Supplier::where('company_name', 'Jimma Farmers Union')->value('id'),
            'Oils' => Supplier::where('company_name', 'Bosa Addis Wholesale')->value('id'),
            'Sweeteners' => Supplier::where('company_name', 'Bosa Addis Wholesale')->value('id'),
            'Condiments' => Supplier::where('company_name', 'Bosa Addis Wholesale')->value('id'),
            'Beverages' => Supplier::where('company_name', 'Kaffa Coffee Supply')->value('id'),
            'Dairy' => Supplier::where('company_name', 'Sheger Dairy Distributors')->value('id'),
            'Household' => Supplier::where('company_name', 'Bosa Addis Wholesale')->value('id'),
            'Stationery' => Supplier::where('company_name', 'Bosa Addis Wholesale')->value('id'),
        ];

        $products = [
            ['name' => 'White Teff - 5 kg', 'description' => 'Premium cleaned white teff for soft injera and family baking.', 'price' => 620.00, 'quantity' => 74, 'category' => 'Grains'],
            ['name' => 'Brown Teff - 5 kg', 'description' => 'Nutty brown teff packed for weekly household consumption.', 'price' => 560.00, 'quantity' => 66, 'category' => 'Grains'],
            ['name' => 'Wheat Flour - 5 kg', 'description' => 'Fine wheat flour for bread, pasta, and everyday cooking.', 'price' => 310.00, 'quantity' => 120, 'category' => 'Grains'],
            ['name' => 'Barley Flour - 3 kg', 'description' => 'Fresh milled barley flour for traditional porridge and baking.', 'price' => 185.00, 'quantity' => 44, 'category' => 'Grains'],
            ['name' => 'Long Grain Rice - 5 kg', 'description' => 'Clean white rice with consistent grains and easy cooking texture.', 'price' => 490.00, 'quantity' => 82, 'category' => 'Grains'],
            ['name' => 'Macaroni Pasta - 500 g', 'description' => 'Durum wheat macaroni for quick family meals.', 'price' => 68.00, 'quantity' => 160, 'category' => 'Grains'],
            ['name' => 'Spaghetti - 500 g', 'description' => 'Classic spaghetti packed for pantry-ready meals.', 'price' => 72.00, 'quantity' => 135, 'category' => 'Grains'],
            ['name' => 'Red Lentils - 1 kg', 'description' => 'Sorted red lentils for misir wot, soups, and stews.', 'price' => 145.00, 'quantity' => 96, 'category' => 'Legumes'],
            ['name' => 'Green Lentils - 1 kg', 'description' => 'Whole green lentils with firm texture and rich flavor.', 'price' => 132.00, 'quantity' => 58, 'category' => 'Legumes'],
            ['name' => 'Chickpeas - 1 kg', 'description' => 'Clean chickpeas for shiro, salads, and roasted snacks.', 'price' => 118.00, 'quantity' => 83, 'category' => 'Legumes'],
            ['name' => 'Split Peas - 1 kg', 'description' => 'Yellow split peas for kik alicha and high-protein meals.', 'price' => 110.00, 'quantity' => 64, 'category' => 'Legumes'],
            ['name' => 'Fava Beans - 1 kg', 'description' => 'Selected fava beans for ful, nifro, and traditional dishes.', 'price' => 105.00, 'quantity' => 71, 'category' => 'Legumes'],
            ['name' => 'Sunflower Cooking Oil - 1 L', 'description' => 'Light cooking oil for frying, sauteing, and daily meals.', 'price' => 210.00, 'quantity' => 115, 'category' => 'Oils'],
            ['name' => 'Vegetable Cooking Oil - 3 L', 'description' => 'Family-size vegetable oil with dependable everyday quality.', 'price' => 590.00, 'quantity' => 48, 'category' => 'Oils'],
            ['name' => 'Sesame Oil - 500 ml', 'description' => 'Aromatic sesame oil for salads, sauces, and special dishes.', 'price' => 260.00, 'quantity' => 18, 'category' => 'Oils'],
            ['name' => 'Refined Sugar - 1 kg', 'description' => 'Clean refined sugar for tea, coffee, and home baking.', 'price' => 95.00, 'quantity' => 140, 'category' => 'Sweeteners'],
            ['name' => 'Brown Sugar - 1 kg', 'description' => 'Soft brown sugar with warm caramel flavor.', 'price' => 125.00, 'quantity' => 52, 'category' => 'Sweeteners'],
            ['name' => 'Pure Honey - 500 g', 'description' => 'Locally sourced honey with floral aroma and natural sweetness.', 'price' => 340.00, 'quantity' => 27, 'category' => 'Sweeteners'],
            ['name' => 'Iodized Salt - 1 kg', 'description' => 'Fine iodized salt for everyday cooking and seasoning.', 'price' => 35.00, 'quantity' => 210, 'category' => 'Condiments'],
            ['name' => 'Berbere Spice - 250 g', 'description' => 'Balanced Ethiopian spice blend with color, heat, and aroma.', 'price' => 155.00, 'quantity' => 42, 'category' => 'Condiments'],
            ['name' => 'Shiro Powder - 1 kg', 'description' => 'Smooth chickpea shiro blend for quick and flavorful meals.', 'price' => 175.00, 'quantity' => 59, 'category' => 'Condiments'],
            ['name' => 'Mitmita Spice - 100 g', 'description' => 'Hot traditional spice mix for kitfo and finishing dishes.', 'price' => 88.00, 'quantity' => 34, 'category' => 'Condiments'],
            ['name' => 'Tomato Paste - 400 g', 'description' => 'Rich tomato paste for stews, sauces, and family cooking.', 'price' => 76.00, 'quantity' => 95, 'category' => 'Condiments'],
            ['name' => 'Ethiopian Coffee Beans - 500 g', 'description' => 'Roasted Arabica beans with bright aroma and deep body.', 'price' => 430.00, 'quantity' => 38, 'category' => 'Beverages'],
            ['name' => 'Ground Coffee - 250 g', 'description' => 'Freshly ground coffee ready for jebena and filter brewing.', 'price' => 225.00, 'quantity' => 54, 'category' => 'Beverages'],
            ['name' => 'Black Tea - 100 bags', 'description' => 'Strong black tea bags for quick home and office service.', 'price' => 190.00, 'quantity' => 73, 'category' => 'Beverages'],
            ['name' => 'Powdered Milk - 400 g', 'description' => 'Creamy powdered milk for drinks, tea, and baking.', 'price' => 310.00, 'quantity' => 36, 'category' => 'Dairy'],
            ['name' => 'UHT Milk - 1 L', 'description' => 'Shelf-stable milk for families and small offices.', 'price' => 98.00, 'quantity' => 84, 'category' => 'Dairy'],
            ['name' => 'Laundry Detergent - 1 kg', 'description' => 'High-foam detergent powder for hand and machine wash.', 'price' => 165.00, 'quantity' => 70, 'category' => 'Household'],
            ['name' => 'Dish Soap - 750 ml', 'description' => 'Grease-cutting dish soap with fresh lemon scent.', 'price' => 92.00, 'quantity' => 63, 'category' => 'Household'],
            ['name' => 'Bath Soap - 4 pack', 'description' => 'Family bath soap pack with gentle everyday fragrance.', 'price' => 145.00, 'quantity' => 101, 'category' => 'Household'],
            ['name' => 'Toilet Paper - 10 rolls', 'description' => 'Soft two-ply toilet tissue for household use.', 'price' => 265.00, 'quantity' => 29, 'category' => 'Household'],
            ['name' => 'Bleach - 1 L', 'description' => 'Multipurpose bleach for cleaning and sanitation.', 'price' => 80.00, 'quantity' => 8, 'category' => 'Household'],
            ['name' => 'Exercise Books - 10 pack', 'description' => 'Ruled exercise books for students and office notes.', 'price' => 180.00, 'quantity' => 46, 'category' => 'Stationery'],
            ['name' => 'Ballpoint Pens - 12 pack', 'description' => 'Smooth blue ink pens for school, office, and counters.', 'price' => 95.00, 'quantity' => 6, 'category' => 'Stationery'],
            ['name' => 'AA Batteries - 4 pack', 'description' => 'Reliable alkaline batteries for remotes and small devices.', 'price' => 130.00, 'quantity' => 0, 'category' => 'Household'],
        ];

        foreach ($products as $product) {
            $product['supplier_id'] = $supplierByCategory[$product['category']] ?? null;
            $product['image_path'] = $this->imageFor($product['name']);

            if (in_array($product['name'], ['White Teff - 5 kg', 'Sunflower Cooking Oil - 1 L', 'Ground Coffee - 250 g', 'Laundry Detergent - 1 kg'])) {
                $product['discount_price'] = round($product['price'] * 0.9, 2);
            }

            Product::updateOrCreate(
                ['name' => $product['name']],
                $product + ['is_active' => true]
            );
        }
    }
}
