import { apiClient } from "@/lib/apiClient";

export interface PricingContactRequestRow {
  id: number;
  createdAt: string;
  updatedAt: string;
  planType: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
  readAt: string | null;
}

export async function listPricingContactRequests(): Promise<
  PricingContactRequestRow[]
> {
  return apiClient<PricingContactRequestRow[]>("/pricing/contact-requests");
}

export async function markPricingContactRead(
  id: number,
  read: boolean
): Promise<PricingContactRequestRow> {
  return apiClient<PricingContactRequestRow>(
    `/pricing/contact-requests/${id}/read`,
    {
      method: "PATCH",
      body: JSON.stringify({ read }),
    }
  );
}
