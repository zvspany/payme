"use client";

import { useMemo, useState, useTransition } from "react";
import { PaymentMethodType } from "@prisma/client";
import {
  deletePaymentMethodAction,
  movePaymentMethodAction,
  togglePaymentMethodVisibilityAction,
  updatePaymentMethodAction
} from "@/actions/payment-methods";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_TYPES, USDT_NETWORKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type PaymentMethodsListProps = {
  methods: MethodItem[];
};

type MethodItem = {
  id: string;
  type: PaymentMethodType;
  label: string;
  value: string;
  network: string | null;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
};

type EditorState = {
  id: string;
  type: PaymentMethodType;
  label: string;
  value: string;
  network: string;
  description: string;
  isVisible: boolean;
};

function toEditor(method: MethodItem): EditorState {
  return {
    id: method.id,
    type: method.type,
    label: method.label,
    value: method.value,
    network: method.network ?? "",
    description: method.description ?? "",
    isVisible: method.isVisible
  };
}

export function PaymentMethodsList({ methods }: PaymentMethodsListProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);

  const indexed = useMemo(() => methods.map((method, index) => ({ method, index })), [methods]);

  function runAction(executor: () => Promise<{ success: boolean; message: string }>) {
    setMessage(null);

    startTransition(async () => {
      const result = await executor();
      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        setEditor(null);
      }
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    runAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("direction", direction);
      return movePaymentMethodAction(formData);
    });
  }

  function handleToggle(id: string) {
    runAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      return togglePaymentMethodVisibilityAction(formData);
    });
  }

  function handleDelete(id: string) {
    runAction(async () => {
      const formData = new FormData();
      formData.set("id", id);
      return deletePaymentMethodAction(formData);
    });
  }

  function handleUpdate() {
    if (!editor) {
      return;
    }

    runAction(async () => {
      const formData = new FormData();
      formData.set("id", editor.id);
      formData.set("type", editor.type);
      formData.set("label", editor.label);
      formData.set("value", editor.value);
      formData.set("network", editor.network);
      formData.set("description", editor.description);
      if (editor.isVisible) {
        formData.set("isVisible", "on");
      }
      return updatePaymentMethodAction(formData);
    });
  }

  if (methods.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
        No payment methods yet. Add one above.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="terminal-heading">Current Methods</h2>

      {message ? <p className={isError ? "text-sm text-red-300" : "text-sm text-accent"}>{message}</p> : null}

      {indexed.map(({ method, index }) => {
        const editing = editor?.id === method.id;

        return (
          <article key={method.id} className="terminal-card space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-text">
                  {method.label} <span className="text-muted">({PAYMENT_METHOD_LABELS[method.type]})</span>
                </p>
                <p className="mt-2 break-all text-sm text-muted">{method.value}</p>
                {method.network ? <p className="mt-1 text-xs text-muted">Network: {method.network}</p> : null}
                {method.description ? <p className="mt-1 text-xs text-muted">{method.description}</p> : null}
                {!method.isVisible ? <p className="mt-1 text-xs text-amber-200">Hidden on public profile</p> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="dashboard-action-small" disabled={isPending || index === 0} onClick={() => handleMove(method.id, "up")}>↑</Button>
                <Button className="dashboard-action-small" disabled={isPending || index === methods.length - 1} onClick={() => handleMove(method.id, "down")}>↓</Button>
                <Button className="dashboard-action-small" disabled={isPending} onClick={() => handleToggle(method.id)}>
                  {method.isVisible ? "Hide" : "Show"}
                </Button>
                <Button className="dashboard-action-small" disabled={isPending} onClick={() => setEditor(editing ? null : toEditor(method))}>
                  {editing ? "Cancel" : "Edit"}
                </Button>
                <Button className="dashboard-action-small" variant="danger" disabled={isPending} onClick={() => handleDelete(method.id)}>
                  Delete
                </Button>
              </div>
            </div>

            {editing && editor ? (
              <div className="space-y-4 border-t border-border/70 pt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="form-label">Type</span>
                    <Select
                      value={editor.type}
                      onChange={(event) =>
                        setEditor((previous) =>
                          previous
                            ? {
                                ...previous,
                                type: event.target.value as PaymentMethodType,
                                network: event.target.value === "USDT" ? previous.network : ""
                              }
                            : previous
                        )
                      }
                    >
                      {PAYMENT_METHOD_TYPES.map((methodType) => (
                        <option key={methodType} value={methodType}>
                          {PAYMENT_METHOD_LABELS[methodType]}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="form-label">Label</span>
                    <Input
                      value={editor.label}
                      onChange={(event) =>
                        setEditor((previous) => (previous ? { ...previous, label: event.target.value } : previous))
                      }
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm">
                  <span className="form-label">Value</span>
                  <Input
                    value={editor.value}
                    onChange={(event) =>
                      setEditor((previous) => (previous ? { ...previous, value: event.target.value } : previous))
                    }
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="form-label">Network</span>
                  {editor.type === "USDT" ? (
                    <Select
                      value={editor.network}
                      onChange={(event) =>
                        setEditor((previous) => (previous ? { ...previous, network: event.target.value } : previous))
                      }
                    >
                      <option value="">Select a network</option>
                      {USDT_NETWORKS.map((network) => (
                        <option key={network} value={network}>
                          {network}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      value={editor.network}
                      onChange={(event) =>
                        setEditor((previous) => (previous ? { ...previous, network: event.target.value } : previous))
                      }
                    />
                  )}
                </label>

                <label className="space-y-2 text-sm">
                  <span className="form-label">Description</span>
                  <Textarea
                    rows={2}
                    value={editor.description}
                    onChange={(event) =>
                      setEditor((previous) => (previous ? { ...previous, description: event.target.value } : previous))
                    }
                  />
                </label>

                <label className="flex items-center gap-3 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={editor.isVisible}
                    onChange={(event) =>
                      setEditor((previous) => (previous ? { ...previous, isVisible: event.target.checked } : previous))
                    }
                    className="h-4 w-4 rounded border-border bg-panel text-accent focus:ring-accent"
                  />
                  Visible on public profile
                </label>

                <Button className="dashboard-action" variant="primary" disabled={isPending} onClick={handleUpdate}>
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
