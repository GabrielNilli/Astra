<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            // null = sezione preimpostata, condivisa da tutti gli utenti.
            $table->foreignId('created_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_preset')->default(false);
            $table->timestamps();
        });

        DB::table('sections')->insert([
            ['name' => 'Lavoro', 'is_preset' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Personale', 'is_preset' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Idee', 'is_preset' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Studio', 'is_preset' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
