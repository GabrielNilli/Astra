<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Notifications\ReminderDueNotification;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

#[Signature('reminders:send-due')]
#[Description('Invia le notifiche push per i reminder scaduti e fa avanzare quelli ricorrenti')]
class SendDueReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $dueReminders = Reminder::where('is_done', false)
            ->whereNull('notified_at')
            ->where('remind_at', '<=', now())
            ->with(['author', 'sharedWithUsers'])
            ->get();

        foreach ($dueReminders as $reminder) {
            $recipients = collect([$reminder->author])
                ->merge($reminder->sharedWithUsers)
                ->filter()
                ->unique('id')
                ->filter(fn ($user) => $user->pushSubscriptions()->exists());

            if ($recipients->isNotEmpty()) {
                Notification::send($recipients, new ReminderDueNotification($reminder));
            }

            $this->advance($reminder);
        }

        $this->info("Reminder processati: {$dueReminders->count()}");
    }

    private function advance(Reminder $reminder): void
    {
        if ($reminder->recurrence === 'none') {
            $reminder->update(['notified_at' => now()]);

            return;
        }

        $next = match ($reminder->recurrence) {
            'daily' => $reminder->remind_at->copy()->addDay(),
            'weekly' => $reminder->remind_at->copy()->addWeek(),
            'monthly' => $reminder->remind_at->copy()->addMonthNoOverflow(),
            'yearly' => $reminder->remind_at->copy()->addYear(),
        };

        $reminder->update([
            'remind_at' => $next,
            'next_run_at' => $next,
            'notified_at' => null,
        ]);
    }
}
