import { apiFetch } from "./client";

// =================================
//  FUNCTIONS
// =================================
export function subscribeToPush(token: string, subscription: PushSubscriptionJSON) {
  return apiFetch<null>("/push-subscriptions", {
    method: "POST",
    body: subscription,
    token,
  });
}

export function unsubscribeFromPush(token: string, endpoint: string) {
  return apiFetch<null>("/push-subscriptions", {
    method: "DELETE",
    body: { endpoint },
    token,
  });
}
