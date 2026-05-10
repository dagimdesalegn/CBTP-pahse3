<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('verification_region')->nullable()->after('verification_submitted_at');
            $table->string('verification_city')->nullable()->after('verification_region');
            $table->string('verification_woreda_subcity')->nullable()->after('verification_city');
            $table->string('verification_kebele')->nullable()->after('verification_woreda_subcity');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'verification_region',
                'verification_city',
                'verification_woreda_subcity',
                'verification_kebele',
            ]);
        });
    }
};
