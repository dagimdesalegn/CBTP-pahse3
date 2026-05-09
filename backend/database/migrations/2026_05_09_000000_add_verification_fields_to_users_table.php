<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('kebele_id_image_path')->nullable()->after('kebele_id');
            $table->string('coupon_id')->nullable()->after('kebele_id_image_path');
            $table->timestamp('verification_submitted_at')->nullable()->after('coupon_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['kebele_id_image_path', 'coupon_id', 'verification_submitted_at']);
        });
    }
};
