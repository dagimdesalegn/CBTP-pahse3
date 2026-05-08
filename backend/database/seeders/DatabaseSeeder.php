<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'Whole Wheat Flour',
                'description' => 'Premium quality whole wheat flour',
                'price' => 45.00,
                'quantity' => 100,
                'category' => 'Grains',
                'is_active' => true,
            ],
            [
                'name' => 'White Teff',
                'description' => 'High quality white teff for injera',
                'price' => 60.00,
                'quantity' => 80,
                'category' => 'Grains',
                'is_active' => true,
            ],
            [
                'name' => 'Cooking Oil',
                'description' => 'Pure vegetable cooking oil - 1 liter',
                'price' => 35.00,
                'quantity' => 150,
                'category' => 'Oils',
                'is_active' => true,
            ],
            [
                'name' => 'Sugar',
                'description' => 'Refined sugar - 1 kg',
                'price' => 25.00,
                'quantity' => 200,
                'category' => 'Sweetener',
                'is_active' => true,
            ],
            [
                'name' => 'Salt',
                'description' => 'Iodized salt - 500g',
                'price' => 8.00,
                'quantity' => 300,
                'category' => 'Condiments',
                'is_active' => true,
            ],
            [
                'name' => 'Coffee Beans',
                'description' => 'Ethiopian coffee beans - 250g',
                'price' => 50.00,
                'quantity' => 50,
                'category' => 'Beverages',
                'is_active' => true,
            ],
            [
                'name' => 'Rice',
                'description' => 'Long grain white rice - 5 kg',
                'price' => 150.00,
                'quantity' => 40,
                'category' => 'Grains',
                'is_active' => true,
            ],
            [
                'name' => 'Lentils',
                'description' => 'Red lentils - 1 kg',
                'price' => 55.00,
                'quantity' => 60,
                'category' => 'Legumes',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
