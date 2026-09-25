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
        Schema::table('chart_entries', function (Blueprint $table) {
            $table->foreignId('chart_id')->after('id')->constrained('charts')->cascadeOnDelete();
        });

        Schema::table('chart_entries', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn(['created_by', 'category', 'is_shared']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chart_entries', function (Blueprint $table) {
            $table->foreignId('created_by')->after('id')->constrained('users')->cascadeOnDelete();
            $table->string('category')->after('created_by');
            $table->boolean('is_shared')->default(false);
        });

        Schema::table('chart_entries', function (Blueprint $table) {
            $table->dropForeign(['chart_id']);
            $table->dropColumn('chart_id');
        });
    }
};
