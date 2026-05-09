<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('name_am')->nullable()->after('name');
            $table->string('name_or')->nullable()->after('name_am');
            $table->text('description_am')->nullable()->after('description');
            $table->text('description_or')->nullable()->after('description_am');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['name_am', 'name_or', 'description_am', 'description_or']);
        });
    }
};
