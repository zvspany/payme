"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { DEFAULT_THEME_ID } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/session";
import { normalizeUsername, safeUrl, sanitizeOptionalPlainText, sanitizePlainText } from "@/lib/sanitize";
import { profileSchema } from "@/lib/validators/profile";

export type ActionResult = {
  success: boolean;
  message: string;
};

function parseCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const currentUsername = user.profile?.username;

  const parsed = profileSchema.safeParse({
    username: normalizeUsername(String(formData.get("username") ?? "")),
    displayName: sanitizePlainText(String(formData.get("displayName") ?? "")),
    bio: sanitizeOptionalPlainText(String(formData.get("bio") ?? "")) ?? "",
    avatarUrl: safeUrl(String(formData.get("avatarUrl") ?? "")) ?? "",
    themeId: sanitizePlainText(String(formData.get("themeId") ?? DEFAULT_THEME_ID)),
    isPublic: parseCheckboxValue(formData.get("isPublic"))
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid profile input"
    };
  }

  const theme = await db.theme.findUnique({ where: { id: parsed.data.themeId } });
  if (!theme) {
    return { success: false, message: "Invalid theme selection" };
  }

  try {
    await db.profile.upsert({
      where: { userId: user.id },
      update: {
        username: parsed.data.username,
        displayName: parsed.data.displayName,
        bio: parsed.data.bio || null,
        avatarUrl: parsed.data.avatarUrl || null,
        themeId: parsed.data.themeId,
        isPublic: parsed.data.isPublic
      },
      create: {
        userId: user.id,
        username: parsed.data.username,
        displayName: parsed.data.displayName,
        bio: parsed.data.bio || null,
        avatarUrl: parsed.data.avatarUrl || null,
        themeId: parsed.data.themeId,
        isPublic: parsed.data.isPublic
      }
    });

    if (currentUsername) {
      revalidatePath(`/u/${currentUsername}`);
    }
    revalidatePath(`/u/${parsed.data.username}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return { success: true, message: "Profile saved" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, message: "Username is already taken" };
    }

    return { success: false, message: "Could not update profile" };
  }
}
