import { PaymentMethodType } from "@prisma/client";

export const DEFAULT_THEME_ID = "terminal-dark";

export const THEME_TOKENS: Record<
  string,
  {
    bg: string;
    panel: string;
    text: string;
    muted: string;
    border: string;
    accent: string;
  }
> = {
  "terminal-dark": {
    bg: "11 12 14",
    panel: "16 18 20",
    text: "237 232 220",
    muted: "163 156 140",
    border: "52 55 58",
    accent: "118 150 92"
  },
  "amber-paper": {
    bg: "15 16 17",
    panel: "20 22 24",
    text: "238 229 212",
    muted: "178 166 146",
    border: "58 53 44",
    accent: "166 129 74"
  }
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  PAYPAL: "PayPal",
  BITCOIN: "Bitcoin",
  ETHEREUM: "Ethereum",
  MONERO: "Monero",
  LITECOIN: "Litecoin",
  SOLANA: "Solana",
  USDT: "USDT",
  REVOLUT: "Revolut",
  BANK_TRANSFER: "Bank Transfer",
  CUSTOM: "Custom"
};

export const PAYMENT_METHOD_TYPES = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethodType[];

export const USDT_NETWORKS = ["ERC20", "TRC20", "BEP20", "SOL", "POLYGON"] as const;

export const SUPPORTS_QR = new Set<PaymentMethodType>([
  "PAYPAL",
  "BITCOIN",
  "ETHEREUM",
  "MONERO",
  "LITECOIN",
  "SOLANA",
  "USDT",
  "REVOLUT",
  "BANK_TRANSFER",
  "CUSTOM"
]);
