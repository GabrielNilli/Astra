// =================================
//  IMPORTS
// =================================
import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import {
  disablePushNotifications,
  enablePushNotifications,
  getExistingPushSubscription,
  isPushSupported,
} from "../../../../utils/pushNotifications";

// =================================
//  COMPONENT
// =================================
export default function NotificationsSection() {
  // =================================
  //  CONSTS
  // =================================
  const { token } = useAuth();
  const supported = isPushSupported();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =================================
  //  FUNCTIONS
  // =================================
  async function handleToggle() {
    if (!token) return;
    setError(null);
    setIsLoading(true);

    try {
      if (isEnabled) {
        await disablePushNotifications(token);
        setIsEnabled(false);
      } else {
        await enablePushNotifications(token);
        setIsEnabled(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossibile aggiornare le notifiche.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // =================================
  //  USE EFFECTS
  // =================================
  useEffect(() => {
    if (!supported) return;
    getExistingPushSubscription()
      .then((subscription) => setIsEnabled(subscription !== null))
      .catch(() => setIsEnabled(false));
  }, [supported]);

  // =================================
  //  RENDER
  // =================================
  return (
    <section className="rounded-2xl border border-base-mid/25 bg-white p-4 shadow-sm dark:bg-base-dark">
      <h2 className="mb-3 text-sm font-semibold">Notifiche</h2>

      {!supported ? (
        <p className="text-xs text-base-mid">
          Questo browser non supporta le notifiche push.
        </p>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-base-dark dark:text-base-light">
            {isEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            Promemoria push
          </div>
          <button
            type="button"
            onClick={() => void handleToggle()}
            disabled={isLoading}
            aria-pressed={isEnabled}
            className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              isEnabled ? "bg-accent" : "bg-base-mid/30"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                isEnabled ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </section>
  );
}
