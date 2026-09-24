<?php

namespace App\Http\Controllers;

use App\Services\ReminderDispatcher;
use Illuminate\Http\Request;

class RemindersCronController extends Controller
{
    // Endpoint colpito da Cloud Scheduler ogni minuto: sfrutta il servizio web
    // già attivo (e quindi "caldo") invece di un Cloud Run Job, che parte a
    // freddo ad ogni esecuzione e rende i reminder lenti ad arrivare.
    public function sendDue(Request $request, ReminderDispatcher $dispatcher)
    {
        $secret = config('services.cron.secret');

        abort_if(
            ! $secret || ! hash_equals($secret, (string) $request->header('X-Cron-Secret')),
            403,
        );

        $count = $dispatcher->dispatchDue();

        return response()->json(['processed' => $count]);
    }
}
