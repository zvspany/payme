import { PaymentMethodType } from "@prisma/client";

function looksLikeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function buildPaymentUri(type: PaymentMethodType, value: string, network?: string | null) {
  const cleaned = value.trim();

  switch (type) {
    case "PAYPAL": {
      if (looksLikeUrl(cleaned)) {
        return cleaned;
      }
      return `https://paypal.me/${cleaned}`;
    }
    case "BITCOIN":
      return `bitcoin:${cleaned}`;
    case "ETHEREUM":
      return `ethereum:${cleaned}`;
    case "MONERO":
      return `monero:${cleaned}`;
    case "LITECOIN":
      return `litecoin:${cleaned}`;
    case "SOLANA":
      return `solana:${cleaned}`;
    case "USDT":
      return network ? `usdt:${network}:${cleaned}` : `usdt:${cleaned}`;
    case "REVOLUT": {
      if (looksLikeUrl(cleaned)) {
        return cleaned;
      }
      return `https://revolut.me/${cleaned}`;
    }
    case "BANK_TRANSFER":
      return cleaned;
    case "CUSTOM":
      return cleaned;
    default:
      return cleaned;
  }
}
