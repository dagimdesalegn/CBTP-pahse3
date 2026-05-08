<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'phone' => '0911111111',
            'kebele_id' => 'ADMIN001',
            'password' => Hash::make('admin@123456'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        User::create([
            'name' => 'Store Manager',
            'phone' => '0922222222',
            'kebele_id' => 'MANAGER001',
            'password' => Hash::make('manager@123456'),
            'role' => 'manager',
            'is_verified' => true,
        ]);
    }
}
