import { PaymentMethodType } from "@prisma/client";
import { buildPaymentUri } from "@/lib/payment-uri";

export function getQrPayload(type: PaymentMethodType, value: string, network?: string | null) {
  return buildPaymentUri(type, value, network);
}
