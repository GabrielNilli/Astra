<?php

namespace App\Services;

use App\Models\Reminder;
use App\Notifications\ReminderDueNotification;
use Illuminate\Support\Facades\Notification;

class ReminderDispatcher
{
    /**
     * Invia le notifiche push per i reminder scaduti e fa avanzare quelli ricorrenti.
     * Ritorna il numero di reminder processati.
     */
    public function dispatchDue(): int
    {
        $dueReminders = Reminder::where('is_done', false)
            ->whereNull('notified_at')
            ->where('remind_at', '<=', now())
            ->with(['author', 'sharedWithUsers', 'note'])
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

        return $dueReminders->count();
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
