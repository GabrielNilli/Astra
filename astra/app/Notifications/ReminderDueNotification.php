<?php

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Notifications\Notification;
use NotificationChannels\WebPush\WebPushChannel;
use NotificationChannels\WebPush\WebPushMessage;

class ReminderDueNotification extends Notification
{
    public function __construct(private readonly Reminder $reminder)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return [WebPushChannel::class];
    }

    public function toWebPush(object $notifiable, self $notification): WebPushMessage
    {
        return (new WebPushMessage)
            ->title($this->reminder->title)
            ->icon('/favicon.svg')
            ->body($this->reminder->description ?: 'Promemoria in scadenza')
            ->data(['url' => rtrim(config('app.frontend_url'), '/').'/notes'])
            ->tag('reminder-'.$this->reminder->id);
    }
}
