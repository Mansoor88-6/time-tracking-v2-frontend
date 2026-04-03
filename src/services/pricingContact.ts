const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type PricingPlanType = "standard" | "enterprise";

export interface CreatePricingContactPayload {
  planType: PricingPlanType;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
}

/**
 * Public endpoint — no auth. Used from marketing home page.
 */
export async function submitPricingContact(
  payload: CreatePricingContactPayload
): Promise<void> {
  const res = await fetch(`${BASE_URL}/pricing/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.status === 429) {
    throw new Error("Too many requests. Please try again in a minute.");
  }

  if (!res.ok) {
    let msg = "Could not send your request.";
    try {
      const data = (await res.json()) as { message?: string | string[] };
      if (data.message) {
        msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      }
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
}
