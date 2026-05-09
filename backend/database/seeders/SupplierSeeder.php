<?php

namespace Database\Seeders;

use App\Models\Supplier;
use Illuminate\Database\Seeder;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            ['company_name' => 'Jimma Farmers Union', 'contact_person' => 'Bekele Tufa', 'phone' => '0912000101', 'email' => 'jimma.farmers@example.com', 'address' => 'Jimma, Oromia', 'contract_terms' => 'Monthly grains and legumes supply.'],
            ['company_name' => 'Bosa Addis Wholesale', 'contact_person' => 'Marta Alemu', 'phone' => '0912000102', 'email' => 'bosa.wholesale@example.com', 'address' => 'Bosa Addis Kebele', 'contract_terms' => 'Household essentials and stationery supply.'],
            ['company_name' => 'Kaffa Coffee Supply', 'contact_person' => 'Tadesse Gemechu', 'phone' => '0912000103', 'email' => 'kaffa.coffee@example.com', 'address' => 'Kaffa Zone', 'contract_terms' => 'Coffee and beverage supply every two weeks.'],
            ['company_name' => 'Sheger Dairy Distributors', 'contact_person' => 'Hana Tesema', 'phone' => '0912000104', 'email' => 'sheger.dairy@example.com', 'address' => 'Addis Ababa', 'contract_terms' => 'Dairy and packaged goods supply.'],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::updateOrCreate(
                ['company_name' => $supplier['company_name']],
                $supplier + ['is_active' => true]
            );
        }
    }
}
