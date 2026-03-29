"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[220] grid place-items-center bg-black/80 p-4 md:p-6"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-modal="true"
        aria-label={title}
        role="dialog"
        className="w-full max-w-[34rem] rounded-lg border border-border bg-panel p-5 max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-text">{title}</h2>
          <Button variant="ghost" className="px-2 py-1" onClick={onClose}>
            Close
          </Button>
        </header>
        {children}
      </section>
    </div>,
    document.body
  );
}
