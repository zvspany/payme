"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Modal } from "@/components/ui/modal";

type QrModalProps = {
  title: string;
  payload: string;
};

export function QrModal({ title, payload }: QrModalProps) {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    QRCode.toDataURL(payload, { margin: 1, width: 280 })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
        setError(null);
      })
      .catch(() => {
        setQrDataUrl(null);
        setError("Could not generate QR code");
      });
  }, [open, payload]);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
        aria-label="Show QR code"
        className="method-action"
      >
        QR
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-3">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR code"
              className="mx-auto h-56 w-56 rounded-md border border-border bg-white p-2 md:h-64 md:w-64"
            />
          ) : (
            <div className="flex h-56 items-center justify-center rounded-md border border-border bg-bg/40 text-sm text-muted md:h-64">
              {error ?? "Generating QR..."}
            </div>
          )}
          <p className="max-h-28 overflow-y-auto break-all text-xs text-muted">{payload}</p>
        </div>
      </Modal>
    </>
  );
}
