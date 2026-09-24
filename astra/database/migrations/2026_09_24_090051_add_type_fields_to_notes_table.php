<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->string('note_type')->default('plain')->after('icon');
            $table->json('block_data')->nullable()->after('note_type');
            $table->boolean('is_pinned')->default(false)->after('is_shared');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn(['note_type', 'block_data', 'is_pinned']);
        });
    }
};
