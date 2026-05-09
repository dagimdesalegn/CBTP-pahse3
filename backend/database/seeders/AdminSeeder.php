<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Admin User', 'email' => 'admin@gmail.com', 'phone' => null, 'kebele_id' => 'ADMIN001', 'password' => 'admin@123456', 'role' => 'admin', 'access_level' => 'super_admin', 'is_verified' => true, 'account_balance' => 0],
            ['name' => 'Operations Admin', 'email' => 'operations.admin@example.com', 'phone' => '0911777001', 'kebele_id' => 'ADMIN002', 'password' => 'admin@123456', 'role' => 'admin', 'access_level' => 'operations_admin', 'is_verified' => true, 'account_balance' => 0],
            ['name' => 'Reports Admin', 'email' => 'reports.admin@example.com', 'phone' => '0911777002', 'kebele_id' => 'ADMIN003', 'password' => 'admin@123456', 'role' => 'admin', 'access_level' => 'report_admin', 'is_verified' => true, 'account_balance' => 0],
            ['name' => 'Support Admin', 'email' => 'support.admin@example.com', 'phone' => '0911777003', 'kebele_id' => 'ADMIN004', 'password' => 'admin@123456', 'role' => 'admin', 'access_level' => 'support_admin', 'is_verified' => true, 'account_balance' => 0],
            ['name' => 'Store Manager', 'email' => 'manager@gmail.com', 'phone' => null, 'kebele_id' => 'MANAGER001', 'password' => 'manager@123456', 'role' => 'manager', 'is_verified' => true],
            ['name' => 'Inventory Manager', 'email' => 'inventory.manager@example.com', 'phone' => '0911888001', 'kebele_id' => 'MANAGER002', 'password' => 'manager@123456', 'role' => 'manager', 'is_verified' => true],
            ['name' => 'Amanuel Bekele', 'email' => 'amanuel.member@example.com', 'phone' => '0911000001', 'kebele_id' => 'KEB-1001', 'coupon_id' => 'CPN-1001', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => true, 'account_balance' => 1250],
            ['name' => 'Mekdes Tadesse', 'email' => 'mekdes.member@example.com', 'phone' => '0911000002', 'kebele_id' => 'KEB-1002', 'coupon_id' => 'CPN-1002', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => true, 'account_balance' => 820],
            ['name' => 'Dawit Alemu', 'email' => 'dawit.member@example.com', 'phone' => '0911000003', 'kebele_id' => 'KEB-1003', 'coupon_id' => 'CPN-1003', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => true, 'account_balance' => 475],
            ['name' => 'Sara Kebede', 'email' => 'sara.member@example.com', 'phone' => '0911000004', 'kebele_id' => 'KEB-1004', 'coupon_id' => 'CPN-1004', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => false, 'account_balance' => 0],
            ['name' => 'Yonas Tesfaye', 'email' => 'yonas.member@example.com', 'phone' => '0911000005', 'kebele_id' => 'KEB-1005', 'coupon_id' => 'CPN-1005', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => true, 'account_balance' => 640],
            ['name' => 'Hana Getachew', 'email' => 'hana.member@example.com', 'phone' => '0911000006', 'kebele_id' => 'KEB-1006', 'coupon_id' => 'CPN-1006', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => false, 'account_balance' => 0],
            ['name' => 'Bethel Solomon', 'email' => 'bethel.member@example.com', 'phone' => '0911000007', 'kebele_id' => 'KEB-1007', 'coupon_id' => 'CPN-1007', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => true, 'account_balance' => 980],
            ['name' => 'Noah Girma', 'email' => 'noah.member@example.com', 'phone' => '0911000008', 'kebele_id' => 'KEB-1008', 'coupon_id' => 'CPN-1008', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => true, 'account_balance' => 315],
            ['name' => 'Liya Abebe', 'email' => 'liya.member@example.com', 'phone' => '0911000009', 'kebele_id' => 'KEB-1009', 'coupon_id' => 'CPN-1009', 'password' => 'member@123456', 'role' => 'member', 'is_verified' => false, 'account_balance' => 0],
        ];

        foreach ($users as $user) {
            $created = User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'phone' => $user['phone'],
                    'kebele_id' => $user['kebele_id'],
                    'coupon_id' => $user['coupon_id'] ?? null,
                    'password' => Hash::make($user['password']),
                    'role' => $user['role'],
                    'access_level' => $user['access_level'] ?? null,
                    'is_verified' => $user['is_verified'],
                    'account_balance' => $user['account_balance'] ?? 0,
                    'membership_status' => 'active',
                    'verification_submitted_at' => $user['role'] === 'member' ? now()->subDays(rand(1, 10)) : null,
                ]
            );

            if (($user['account_balance'] ?? 0) > 0 && $created->walletTransactions()->count() === 0) {
                WalletTransaction::create([
                    'user_id' => $created->id,
                    'type' => 'credit',
                    'amount' => $user['account_balance'],
                    'balance_after' => $user['account_balance'],
                    'description' => 'Opening member wallet balance',
                ]);
            }
        }
    }
}
