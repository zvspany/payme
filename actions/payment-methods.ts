"use server";

import { PaymentMethodType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/session";
import { sanitizeOptionalPlainText, sanitizePlainText } from "@/lib/sanitize";
import { paymentMethodSchema } from "@/lib/validators/payment-method";

export type ActionResult = {
  success: boolean;
  message: string;
};

function parseCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

async function getOwnedProfile(userId: string) {
  return db.profile.findUnique({
    where: { userId },
    include: {
      paymentMethods: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });
}

async function resequencePaymentMethods(profileId: string) {
  const methods = await db.paymentMethod.findMany({
    where: { profileId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  await db.$transaction(
    methods.map((method, index) =>
      db.paymentMethod.update({
        where: { id: method.id },
        data: { sortOrder: index }
      })
    )
  );
}

function parsePaymentInput(formData: FormData) {
  return paymentMethodSchema.safeParse({
    type: sanitizePlainText(String(formData.get("type") ?? "")) as PaymentMethodType,
    label: sanitizePlainText(String(formData.get("label") ?? "")),
    value: sanitizePlainText(String(formData.get("value") ?? "")),
    network: sanitizeOptionalPlainText(String(formData.get("network") ?? "")) ?? "",
    description: sanitizeOptionalPlainText(String(formData.get("description") ?? "")) ?? "",
    isVisible: parseCheckboxValue(formData.get("isVisible"))
  });
}

export async function createPaymentMethodAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const parsed = parsePaymentInput(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid payment method" };
  }

  const maxSortOrder = profile.paymentMethods.length;

  await db.paymentMethod.create({
    data: {
      profileId: profile.id,
      type: parsed.data.type,
      label: parsed.data.label,
      value: parsed.data.value,
      network: parsed.data.network || null,
      description: parsed.data.description || null,
      isVisible: parsed.data.isVisible,
      sortOrder: maxSortOrder
    }
  });

  revalidatePath("/dashboard/payment-methods");
  revalidatePath(`/u/${profile.username}`);

  return { success: true, message: "Payment method added" };
}

export async function updatePaymentMethodAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const paymentMethodId = sanitizePlainText(String(formData.get("id") ?? ""));
  const owned = profile.paymentMethods.find((method) => method.id === paymentMethodId);
  if (!owned) {
    return { success: false, message: "Payment method not found" };
  }

  const parsed = parsePaymentInput(formData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid payment method" };
  }

  await db.paymentMethod.update({
    where: { id: paymentMethodId },
    data: {
      type: parsed.data.type,
      label: parsed.data.label,
      value: parsed.data.value,
      network: parsed.data.network || null,
      description: parsed.data.description || null,
      isVisible: parsed.data.isVisible
    }
  });

  revalidatePath("/dashboard/payment-methods");
  revalidatePath(`/u/${profile.username}`);

  return { success: true, message: "Payment method updated" };
}

export async function deletePaymentMethodAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const paymentMethodId = sanitizePlainText(String(formData.get("id") ?? ""));
  const owned = profile.paymentMethods.find((method) => method.id === paymentMethodId);

  if (!owned) {
    return { success: false, message: "Payment method not found" };
  }

  await db.paymentMethod.delete({ where: { id: paymentMethodId } });
  await resequencePaymentMethods(profile.id);

  revalidatePath("/dashboard/payment-methods");
  revalidatePath(`/u/${profile.username}`);

  return { success: true, message: "Payment method deleted" };
}

export async function togglePaymentMethodVisibilityAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const paymentMethodId = sanitizePlainText(String(formData.get("id") ?? ""));
  const owned = profile.paymentMethods.find((method) => method.id === paymentMethodId);

  if (!owned) {
    return { success: false, message: "Payment method not found" };
  }

  await db.paymentMethod.update({
    where: { id: paymentMethodId },
    data: { isVisible: !owned.isVisible }
  });

  revalidatePath("/dashboard/payment-methods");
  revalidatePath(`/u/${profile.username}`);

  return {
    success: true,
    message: owned.isVisible ? "Payment method hidden" : "Payment method visible"
  };
}

export async function movePaymentMethodAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const paymentMethodId = sanitizePlainText(String(formData.get("id") ?? ""));
  const direction = sanitizePlainText(String(formData.get("direction") ?? ""));
  const index = profile.paymentMethods.findIndex((method) => method.id === paymentMethodId);

  if (index === -1) {
    return { success: false, message: "Payment method not found" };
  }

  if (direction !== "up" && direction !== "down") {
    return { success: false, message: "Invalid sort direction" };
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= profile.paymentMethods.length) {
    return { success: false, message: "Cannot move further" };
  }

  const current = profile.paymentMethods[index];
  const swapWith = profile.paymentMethods[swapIndex];

  await db.$transaction([
    db.paymentMethod.update({ where: { id: current.id }, data: { sortOrder: swapWith.sortOrder } }),
    db.paymentMethod.update({ where: { id: swapWith.id }, data: { sortOrder: current.sortOrder } })
  ]);

  revalidatePath("/dashboard/payment-methods");
  revalidatePath(`/u/${profile.username}`);

  return { success: true, message: "Order updated" };
}
