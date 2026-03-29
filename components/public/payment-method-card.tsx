"use client";
/* eslint-disable @next/next/no-img-element */

import { PaymentMethod, PaymentMethodType } from "@prisma/client";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { CopyButton } from "@/components/public/copy-button";

type PublicPaymentMethod = Pick<
  PaymentMethod,
  "id" | "type" | "label" | "value" | "network" | "description" | "isVisible"
> & {
  qrPayload: string | null;
  qrDataUrl: string | null;
};

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
  const linkTarget = method.qrPayload && isHttpUrl(method.qrPayload) ? method.qrPayload : null;

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
          {method.qrPayload ? (
            <details className="method-qr-details">
              <summary className="method-action">QR</summary>
              <div className="method-qr-panel">
                <p className="method-qr-title">{method.label} QR</p>
                {method.qrDataUrl ? (
                  <img src={method.qrDataUrl} alt={`${method.label} QR code`} className="method-qr-image" />
                ) : (
                  <p className="text-xs text-muted">Could not generate QR code for this value.</p>
                )}
                <p className="method-qr-payload">{method.qrPayload}</p>
              </div>
            </details>
          ) : null}
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
