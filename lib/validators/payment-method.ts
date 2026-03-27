import { PaymentMethodType } from "@prisma/client";
import { z } from "zod";
import { USDT_NETWORKS } from "@/lib/constants";

const BTC_REGEX = /^(bc1[a-z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;
const ETH_REGEX = /^0x[a-fA-F0-9]{40}$/;
const XMR_REGEX = /^(4|8)[1-9A-HJ-NP-Za-km-z]{94,105}$/;
const LTC_REGEX = /^(ltc1[a-z0-9]{39,59}|[LM3][a-km-zA-HJ-NP-Z1-9]{26,34})$/;
const SOL_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const PAYPAL_USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,64}$/;
const REVOLUT_REGEX = /^[a-zA-Z0-9._-]{3,32}$/;

function isPayPalValue(value: string) {
  if (PAYPAL_USERNAME_REGEX.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.hostname.includes("paypal.com") || url.hostname.includes("paypal.me");
  } catch {
    return false;
  }
}

function isRevolutValue(value: string) {
  if (REVOLUT_REGEX.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.hostname.includes("revolut.com") || url.hostname.includes("revolut.me");
  } catch {
    return false;
  }
}

function isValidIban(value: string) {
  const iban = value.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) {
    return false;
  }

  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let transformed = "";
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    transformed += code >= 65 && code <= 90 ? String(code - 55) : char;
  }

  let remainder = 0;
  for (const digit of transformed) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }

  return remainder === 1;
}

export const paymentMethodSchema = z
  .object({
    id: z.string().optional(),
    type: z.nativeEnum(PaymentMethodType),
    label: z.string().trim().min(1).max(60),
    value: z.string().trim().min(1).max(500),
    network: z.string().trim().max(30).optional().or(z.literal("")),
    description: z.string().trim().max(180).optional().or(z.literal("")),
    isVisible: z.boolean().default(true)
  })
  .superRefine((input, ctx) => {
    const value = input.value.trim();
    const network = input.network?.trim();

    if (input.type === "PAYPAL" && !isPayPalValue(value)) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "PayPal value must be a PayPal username or paypal.com/paypal.me URL"
      });
    }

    if (input.type === "BITCOIN" && !BTC_REGEX.test(value)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Invalid Bitcoin address format" });
    }

    if (input.type === "ETHEREUM" && !ETH_REGEX.test(value)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Invalid Ethereum address format" });
    }

    if (input.type === "MONERO" && !XMR_REGEX.test(value)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Invalid Monero address format" });
    }

    if (input.type === "LITECOIN" && !LTC_REGEX.test(value)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Invalid Litecoin address format" });
    }

    if (input.type === "SOLANA" && !SOL_REGEX.test(value)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Invalid Solana address format" });
    }

    if (input.type === "USDT") {
      if (!network || !USDT_NETWORKS.includes(network as (typeof USDT_NETWORKS)[number])) {
        ctx.addIssue({
          code: "custom",
          path: ["network"],
          message: `USDT network must be one of: ${USDT_NETWORKS.join(", ")}`
        });
      }

      const looksLikeWallet = ETH_REGEX.test(value) || SOL_REGEX.test(value) || /^[T][1-9A-HJ-NP-Za-km-z]{33}$/.test(value);
      if (!looksLikeWallet) {
        ctx.addIssue({
          code: "custom",
          path: ["value"],
          message: "Invalid USDT wallet address format for common networks"
        });
      }
    }

    if (input.type === "REVOLUT" && !isRevolutValue(value)) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Revolut value must be a username or revolut.com/revolut.me URL"
      });
    }

    if (input.type === "BANK_TRANSFER" && !isValidIban(value)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Invalid IBAN format" });
    }
  });

export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
