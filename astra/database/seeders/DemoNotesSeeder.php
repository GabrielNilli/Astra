<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\Reminder;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Popola un database di sviluppo con note di prova: tutti i tipi di nota,
 * sezioni (incluse note senza sezione), note fissate/preferite/archiviate,
 * promemoria e una nota condivisa con promemoria verso un secondo utente.
 *
 * Utenti creati (password "password"): test@example.com, shared@example.com
 */
class DemoNotesSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::factory()->create(['name' => 'Test User', 'email' => 'test@example.com']);
        $recipient = User::factory()->create(['name' => 'Shared With User', 'email' => 'shared@example.com']);

        $sections = Section::where('is_preset', true)->pluck('id', 'name');

        $notes = [
            [
                'title' => 'Riunione di lunedì',
                'content' => '<p>Punti da discutere: <strong>roadmap Q4</strong>, budget marketing, nuove assunzioni.</p>',
                'color' => '#2563eb',
                'is_pinned' => true,
                'sections' => ['Lavoro'],
            ],
            [
                'title' => 'Checklist rilascio',
                'content' => '',
                'note_type' => 'checklist',
                'block_data' => ['items' => [
                    ['text' => 'Aggiornare changelog', 'done' => true],
                    ['text' => 'Lanciare i test', 'done' => true],
                    ['text' => 'Deploy in staging', 'done' => false],
                    ['text' => 'Avvisare il team', 'done' => false],
                ]],
                'sections' => ['Lavoro'],
            ],
            [
                'title' => 'Query utenti attivi',
                'content' => '',
                'note_type' => 'code',
                'block_data' => [
                    'language' => 'sql',
                    'code' => "SELECT id, name\nFROM users\nWHERE last_login_at > now() - interval '30 days';",
                ],
                'sections' => ['Lavoro', 'Studio'],
            ],
            [
                'title' => 'Spesa',
                'content' => '',
                'note_type' => 'checklist',
                'color' => '#16a34a',
                'block_data' => ['items' => [
                    ['text' => 'Latte', 'done' => false],
                    ['text' => 'Pane', 'done' => true],
                    ['text' => 'Caffè', 'done' => false],
                ]],
                'sections' => ['Personale'],
            ],
            [
                'title' => 'Budget viaggio',
                'content' => '',
                'note_type' => 'table',
                'block_data' => [
                    'headers' => ['Voce', 'Costo', 'Pagato'],
                    'rows' => [
                        ['Volo', '220 €', 'Sì'],
                        ['Hotel', '480 €', 'No'],
                        ['Noleggio auto', '150 €', 'No'],
                    ],
                ],
                'is_favorite' => true,
                'sections' => ['Personale'],
            ],
            [
                'title' => 'App per ricette',
                'content' => '<p>Un\'app che suggerisce ricette in base a cosa hai in frigo. Magari con foto degli ingredienti?</p>',
                'color' => '#9333ea',
                'is_favorite' => true,
                'sections' => ['Idee'],
            ],
            [
                'title' => 'Libri da leggere',
                'content' => '<ul><li>Il nome della rosa</li><li>Clean Code</li><li>Sapiens</li></ul>',
                'sections' => ['Idee', 'Studio'],
            ],
            [
                'title' => 'Appunti esame',
                'content' => '<p>Ripassare i capitoli 3–5, esercizi sulle <em>transazioni</em> e sugli indici.</p>',
                'color' => '#f59e0b',
                'sections' => ['Studio'],
            ],
            [
                'title' => 'Password del Wi-Fi ospiti',
                'content' => '<p>Rete: Casa-Ospiti — chiedere a Marco la password nuova.</p>',
                'sections' => [],
            ],
            [
                'title' => null,
                'content' => '<p>Nota veloce senza titolo e senza sezione.</p>',
                'sections' => [],
            ],
            [
                'title' => 'Vecchio progetto',
                'content' => '<p>Nota archiviata: dovrebbe comparire solo nel filtro "Archiviate".</p>',
                'archived_at' => now()->subWeek(),
                'sections' => ['Lavoro'],
            ],
        ];

        foreach ($notes as $data) {
            $sectionNames = $data['sections'];
            unset($data['sections']);

            $note = Note::create(['created_by' => $owner->id, 'note_type' => 'plain', ...$data]);
            $note->sections()->sync($sectionNames ? $sections->only($sectionNames)->values() : []);
        }

        // Promemoria su una nota privata
        $this->addReminder($owner, Note::where('title', 'Appunti esame')->first(), now()->addDays(2));

        // Nota condivisa con promemoria: il destinatario deve ricevere la notifica
        // (scade tra 2 minuti, così si può provare subito con reminders:send-due)
        $shared = Note::create([
            'created_by' => $owner->id,
            'title' => 'Cena di venerdì',
            'content' => '<p>Prenotare il ristorante per le 20:30, siamo in 6.</p>',
            'color' => '#e11d48',
            'note_type' => 'plain',
            'is_shared' => true,
        ]);
        $shared->sections()->sync($sections->only(['Personale'])->values());
        $shared->sharedWithUsers()->sync([$recipient->id]);
        $this->addReminder($owner, $shared, now()->addMinutes(2));

        // Nota creata dal secondo utente e condivisa con il primo
        $fromRecipient = Note::create([
            'created_by' => $recipient->id,
            'title' => 'Regalo per Giulia',
            'content' => '<p>Idee: libro di fotografia, cuffie, corso di ceramica.</p>',
            'note_type' => 'plain',
            'is_shared' => true,
        ]);
        $fromRecipient->sharedWithUsers()->sync([$owner->id]);
    }

    private function addReminder(User $author, Note $note, $remindAt): void
    {
        Reminder::create([
            'note_id' => $note->id,
            'created_by' => $author->id,
            'title' => $note->title ?? 'Promemoria',
            'remind_at' => $remindAt,
            'recurrence' => 'none',
        ]);
    }
}
