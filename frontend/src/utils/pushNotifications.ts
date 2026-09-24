import { subscribeToPush, unsubscribeFromPush } from "../api/pushSubscriptions";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

// =================================
//  FUNCTIONS
// =================================
export function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(VAPID_PUBLIC_KEY)
  );
}

// Il browser vuole la chiave VAPID come ArrayBuffer, non come stringa base64url.
// (Uint8Array va bene a runtime, ma la sua versione generica non è sempre
// assegnabile a BufferSource a seconda della versione di TypeScript: si passa
// direttamente l'ArrayBuffer sottostante per evitare il problema.)
function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(normalized);
  const bytes = Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
  return bytes.buffer as ArrayBuffer;
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.register(
    "/service-worker.js",
  );
  return registration.pushManager.getSubscription();
}

export async function enablePushNotifications(token: string): Promise<void> {
  if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
    throw new Error("Le notifiche push non sono supportate su questo browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permesso per le notifiche negato.");
  }

  const registration = await navigator.serviceWorker.register(
    "/service-worker.js",
  );
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
  });

  await subscribeToPush(token, subscription.toJSON());
}

// Se il browser ricorda già un'iscrizione (es. dopo un reset lato server) la
// re-invia al backend: è un upsert per endpoint, quindi innocuo se già nota,
// ma evita che resti "fantasma" solo lato browser senza mai arrivare al server.
export async function syncExistingPushSubscription(
  token: string,
): Promise<boolean> {
  const subscription = await getExistingPushSubscription();
  if (!subscription) return false;

  await subscribeToPush(token, subscription.toJSON());
  return true;
}

export async function disablePushNotifications(token: string): Promise<void> {
  const subscription = await getExistingPushSubscription();
  if (!subscription) return;

  await subscription.unsubscribe();
  if (subscription.endpoint) {
    await unsubscribeFromPush(token, subscription.endpoint);
  }
}
