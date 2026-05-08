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
            'email' => 'admin@gmail.com',
            'phone' => null,
            'kebele_id' => 'ADMIN001',
            'password' => Hash::make('admin@123456'),
            'role' => 'admin',
            'is_verified' => true,
        ]);

        User::create([
            'name' => 'Store Manager',
            'email' => 'manager@gmail.com',
            'phone' => null,
            'kebele_id' => 'MANAGER001',
            'password' => Hash::make('manager@123456'),
            'role' => 'manager',
            'is_verified' => true,
        ]);
    }
}
