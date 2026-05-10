<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('manager_kebele')->nullable()->after('verification_kebele');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('kebele')->nullable()->after('category');
        });

        DB::table('products')
            ->whereNull('kebele')
            ->update(['kebele' => 'Bosa Addis Kebele']);

        DB::table('users')
            ->where('role', 'manager')
            ->whereNull('manager_kebele')
            ->update(['manager_kebele' => 'Bosa Addis Kebele']);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('kebele');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('manager_kebele');
        });
    }
};
