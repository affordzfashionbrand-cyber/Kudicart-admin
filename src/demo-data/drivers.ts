/**
 * KudiCart Central Ops — Frontend Demonstration Dataset: Delivery Partners & KYC
 *
 * Isolated frontend demonstration data for UI design review and testing.
 * Contains no network requests, runtime API connections, or backend dependencies.
 */

import { DeliveryPartner, DeliveryPartnerDetail } from "@/types/drivers";
import { MOCK_DELIVERY_PARTNERS, getDeliveryPartnerDetail } from "@/mocks/drivers";

export const DEMO_DELIVERY_PARTNERS: DeliveryPartner[] = MOCK_DELIVERY_PARTNERS;

/**
 * Retrieve demonstration delivery partners list
 */
export function getDemoDeliveryPartners(): DeliveryPartner[] {
  return DEMO_DELIVERY_PARTNERS;
}

/**
 * Retrieve a single demonstration delivery partner detail by ID including KYC documents
 */
export function getDemoDeliveryPartnerById(id: string): DeliveryPartnerDetail | null {
  if (!id) return null;
  const cleanId = id.trim().replace(/^#/, "");
  return getDeliveryPartnerDetail(cleanId) || null;
}
