<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Una nota può stare in più sezioni: la colonna notes.section_id viene
     * sostituita dalla tabella pivot note_section (i dati esistenti vengono copiati).
     */
    public function up(): void
    {
        Schema::create('note_section', function (Blueprint $table) {
            $table->id();
            $table->foreignId('note_id')->constrained('notes')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['note_id', 'section_id']);
        });

        DB::table('notes')
            ->whereNotNull('section_id')
            ->select('id', 'section_id')
            ->orderBy('id')
            ->each(fn ($note) => DB::table('note_section')->insert([
                'note_id' => $note->id,
                'section_id' => $note->section_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]));

        Schema::table('notes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('section_id');
        });
    }

    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->foreignId('section_id')->nullable()->after('created_by')->constrained('sections')->nullOnDelete();
        });

        // Il ritorno a una sola sezione tiene la prima associata.
        DB::table('note_section')
            ->orderBy('id')
            ->each(fn ($row) => DB::table('notes')
                ->where('id', $row->note_id)
                ->whereNull('section_id')
                ->update(['section_id' => $row->section_id]));

        Schema::dropIfExists('note_section');
    }
};
