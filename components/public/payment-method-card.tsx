"use client";

import { PaymentMethod, PaymentMethodType } from "@prisma/client";
import { PAYMENT_METHOD_LABELS, SUPPORTS_QR } from "@/lib/constants";
import { buildPaymentUri } from "@/lib/payment-uri";
import { CopyButton } from "@/components/public/copy-button";
import { QrModal } from "@/components/public/qr-modal";

type PublicPaymentMethod = Pick<
  PaymentMethod,
  "id" | "type" | "label" | "value" | "network" | "description" | "isVisible"
>;

type PaymentMethodCardProps = {
  method: PublicPaymentMethod;
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  const typeLabel = PAYMENT_METHOD_LABELS[method.type as PaymentMethodType];
  const qrPayload = buildPaymentUri(method.type, method.value, method.network);
  const linkTarget = isHttpUrl(qrPayload) ? qrPayload : null;

  return (
    <article className="method-card">
      <div className="method-card-grid">
        <div className="method-card-content">
          <p className="method-card-title">{method.label}</p>
          <p className="method-card-meta">
            {typeLabel}
            {method.network ? ` · ${method.network}` : ""}
          </p>
          <p className="method-card-value">{method.value}</p>
          {method.description ? <p className="method-card-description">{method.description}</p> : null}
        </div>

        <div className="method-actions">
          <CopyButton value={method.value} />
          {SUPPORTS_QR.has(method.type) ? <QrModal title={`${method.label} QR`} payload={qrPayload} /> : null}
          {linkTarget ? (
            <a href={linkTarget} target="_blank" rel="noreferrer" className="method-action">
              Open
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
