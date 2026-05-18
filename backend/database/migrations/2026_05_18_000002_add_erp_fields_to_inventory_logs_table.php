<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->integer('previous_quantity')->nullable()->after('change_amount');
            $table->integer('new_quantity')->nullable()->after('previous_quantity');
            $table->string('type')->default('adjustment')->after('reason');
            $table->string('reference_type')->nullable()->after('manager_id');
            $table->unsignedBigInteger('reference_id')->nullable()->after('reference_type');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->dropColumn([
                'previous_quantity',
                'new_quantity',
                'type',
                'reference_type',
                'reference_id',
            ]);
        });
    }
};
