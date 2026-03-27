export function sanitizePlainText(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeOptionalPlainText(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const sanitized = sanitizePlainText(value);
  return sanitized.length > 0 ? sanitized : undefined;
}

export function normalizeUsername(value: string) {
  return sanitizePlainText(value).toLowerCase().replace(/^@+/, "");
}

export function safeUrl(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const sanitized = value.trim();
  try {
    const url = new URL(sanitized);
    if (!["http:", "https:"].includes(url.protocol)) {
      return undefined;
    }
    return sanitized;
  } catch {
    return undefined;
  }
}
