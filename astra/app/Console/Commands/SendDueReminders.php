<?php

namespace App\Console\Commands;

use App\Services\ReminderDispatcher;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('reminders:send-due')]
#[Description('Invia le notifiche push per i reminder scaduti e fa avanzare quelli ricorrenti')]
class SendDueReminders extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(ReminderDispatcher $dispatcher): void
    {
        $count = $dispatcher->dispatchDue();

        $this->info("Reminder processati: {$count}");
    }
}
