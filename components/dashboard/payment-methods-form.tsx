"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { createPaymentMethodAction } from "@/actions/payment-methods";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_TYPES, USDT_NETWORKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function PaymentMethodsForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const [type, setType] = useState<(typeof PAYMENT_METHOD_TYPES)[number]>("PAYPAL");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [network, setNetwork] = useState("");
  const [description, setDescription] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const isUsdt = useMemo(() => type === "USDT", [type]);

  function resetForm() {
    setLabel("");
    setValue("");
    setNetwork("");
    setDescription("");
    setIsVisible(true);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.set("type", type);
    formData.set("label", label);
    formData.set("value", value);
    formData.set("network", network);
    formData.set("description", description);
    if (isVisible) {
      formData.set("isVisible", "on");
    }

    startTransition(async () => {
      const result = await createPaymentMethodAction(formData);
      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        resetForm();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="terminal-card space-y-5">
      <h2 className="terminal-heading">Add Payment Method</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="form-label">Type</span>
          <Select
            value={type}
            onChange={(event) => {
              const nextType = event.target.value as (typeof PAYMENT_METHOD_TYPES)[number];
              setType(nextType);
              if (nextType !== "USDT") {
                setNetwork("");
              }
            }}
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
          <Input required value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Primary wallet" />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="form-label">Value</span>
        <Input
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Address, username, IBAN, or link"
        />
      </label>

      <label className="space-y-2 text-sm">
        <span className="form-label">Network {isUsdt ? "(required for USDT)" : "(optional)"}</span>
        {isUsdt ? (
          <Select value={network} onChange={(event) => setNetwork(event.target.value)}>
            <option value="">Select a network</option>
            {USDT_NETWORKS.map((networkOption) => (
              <option key={networkOption} value={networkOption}>
                {networkOption}
              </option>
            ))}
          </Select>
        ) : (
          <Input value={network} onChange={(event) => setNetwork(event.target.value)} placeholder="ERC20, TRC20, ..." />
        )}
      </label>

      <label className="space-y-2 text-sm">
        <span className="form-label">Description (optional)</span>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={180}
          rows={3}
          placeholder="Use this for donation only"
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-muted">
        <input
          type="checkbox"
          checked={isVisible}
          onChange={(event) => setIsVisible(event.target.checked)}
          className="h-4 w-4 rounded border-border bg-panel text-accent focus:ring-accent"
        />
        Visible on public profile
      </label>

      {message ? <p className={isError ? "text-sm text-red-300" : "text-sm text-accent"}>{message}</p> : null}

      <div className="pt-2">
        <Button type="submit" variant="primary" className="dashboard-action" disabled={isPending}>
          {isPending ? "Adding..." : "Add method"}
        </Button>
      </div>
    </form>
  );
}
