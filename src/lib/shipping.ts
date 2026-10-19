export const DELIVERY_METHODS = [
  "pickup_krusevac",
  "pickup_beograd",
  "courier",
] as const;

export const CHECKOUT_METHODS = ["pickup_krusevac", "courier"] as const;

export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];
export type CheckoutMethod = (typeof CHECKOUT_METHODS)[number];

export function isDeliveryMethod(value: string): value is DeliveryMethod {
  return DELIVERY_METHODS.includes(value as DeliveryMethod);
}

export function isCheckoutMethod(value: string): value is CheckoutMethod {
  return CHECKOUT_METHODS.includes(value as CheckoutMethod);
}

export function deliveryLabel(method: DeliveryMethod) {
  if (method === "pickup_krusevac") {
    return "Lično preuzimanje — MIRKA atelje, Balkanska 26, Kruševac";
  }
  if (method === "pickup_beograd") {
    return "Lično preuzimanje — Just Machine, Kneginje Zorke 81, Beograd";
  }
  return "Kurirska služba";
}
