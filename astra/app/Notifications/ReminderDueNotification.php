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
        $note = $this->reminder->note;
        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        $title = $note?->title ?: $this->reminder->title;
        $body = $note
            ? $this->excerpt($note->content)
            : ($this->reminder->description ?: 'Promemoria in scadenza');

        $url = $note
            ? $frontendUrl.'/notes?note='.$note->id
            : $frontendUrl.'/notes';

        return (new WebPushMessage)
            ->title($title)
            ->icon('/favicon.svg')
            ->body($body ?: 'Promemoria in scadenza')
            ->data(['url' => $url])
            ->tag('reminder-'.$this->reminder->id);
    }

    // Il contenuto della nota può essere HTML (editor di testo ricco): la notifica
    // vuole solo testo semplice, troncato per restare leggibile in una push.
    private function excerpt(string $content, int $maxLength = 120): string
    {
        $text = trim(strip_tags($content));

        if ($text === '') {
            return '';
        }

        return mb_strlen($text) > $maxLength
            ? mb_substr($text, 0, $maxLength).'…'
            : $text;
    }
}
