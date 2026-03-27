"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/session";
import { sanitizePlainText } from "@/lib/sanitize";
import { socialLinkSchema } from "@/lib/validators/social-link";

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
      socialLinks: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });
}

export async function createSocialLinkAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const parsed = socialLinkSchema.safeParse({
    label: sanitizePlainText(String(formData.get("label") ?? "")),
    url: sanitizePlainText(String(formData.get("url") ?? "")),
    isVisible: parseCheckboxValue(formData.get("isVisible"))
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid social link" };
  }

  await db.socialLink.create({
    data: {
      profileId: profile.id,
      label: parsed.data.label,
      url: parsed.data.url,
      isVisible: parsed.data.isVisible,
      sortOrder: profile.socialLinks.length
    }
  });

  revalidatePath("/dashboard/social-links");
  revalidatePath(`/u/${profile.username}`);

  return { success: true, message: "Social link added" };
}

export async function deleteSocialLinkAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const socialLinkId = sanitizePlainText(String(formData.get("id") ?? ""));
  const owned = profile.socialLinks.find((link) => link.id === socialLinkId);
  if (!owned) {
    return { success: false, message: "Social link not found" };
  }

  await db.socialLink.delete({ where: { id: socialLinkId } });

  const remaining = await db.socialLink.findMany({
    where: { profileId: profile.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  await db.$transaction(
    remaining.map((link, index) =>
      db.socialLink.update({
        where: { id: link.id },
        data: { sortOrder: index }
      })
    )
  );

  revalidatePath("/dashboard/social-links");
  revalidatePath(`/u/${profile.username}`);

  return { success: true, message: "Social link deleted" };
}

export async function toggleSocialLinkAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const socialLinkId = sanitizePlainText(String(formData.get("id") ?? ""));
  const owned = profile.socialLinks.find((link) => link.id === socialLinkId);
  if (!owned) {
    return { success: false, message: "Social link not found" };
  }

  await db.socialLink.update({
    where: { id: socialLinkId },
    data: { isVisible: !owned.isVisible }
  });

  revalidatePath("/dashboard/social-links");
  revalidatePath(`/u/${profile.username}`);

  return {
    success: true,
    message: owned.isVisible ? "Social link hidden" : "Social link visible"
  };
}

export async function moveSocialLinkAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const profile = await getOwnedProfile(user.id);

  if (!profile) {
    return { success: false, message: "Profile not found" };
  }

  const socialLinkId = sanitizePlainText(String(formData.get("id") ?? ""));
  const direction = sanitizePlainText(String(formData.get("direction") ?? ""));
  const index = profile.socialLinks.findIndex((link) => link.id === socialLinkId);

  if (index === -1) {
    return { success: false, message: "Social link not found" };
  }

  if (direction !== "up" && direction !== "down") {
    return { success: false, message: "Invalid sort direction" };
  }

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= profile.socialLinks.length) {
    return { success: false, message: "Cannot move further" };
  }

  const current = profile.socialLinks[index];
  const swapWith = profile.socialLinks[swapIndex];

  await db.$transaction([
    db.socialLink.update({ where: { id: current.id }, data: { sortOrder: swapWith.sortOrder } }),
    db.socialLink.update({ where: { id: swapWith.id }, data: { sortOrder: current.sortOrder } })
  ]);

  revalidatePath("/dashboard/social-links");
  revalidatePath(`/u/${profile.username}`);

  return { success: true, message: "Order updated" };
}
