<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Remove old users if they exist
        User::whereIn('role', ['admin', 'manager'])->delete();

        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone' => '0911111111',
            'kebele_id' => 'ADMIN001',
            'password' => Hash::make('admin@123456'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        User::create([
            'name' => 'Store Manager',
            'email' => 'manager@example.com',
            'phone' => '0922222222',
            'kebele_id' => 'MANAGER001',
            'password' => Hash::make('manager@123456'),
            'role' => 'manager',
            'is_verified' => true,
        ]);

        // Create a demo member user
        User::create([
            'name' => 'Demo Member',
            'email' => 'member@example.com',
            'phone' => '0933333333',
            'kebele_id' => 'MEMBER001',
            'password' => Hash::make('member@123456'),
            'role' => 'member',
            'is_verified' => true,
        ]);
    }
}
