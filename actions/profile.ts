"use server";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { DEFAULT_THEME_ID } from "@/lib/constants";
import { requireCurrentUser } from "@/lib/session";
import { normalizeUsername, sanitizeOptionalPlainText, sanitizePlainText } from "@/lib/sanitize";
import { profileSchema } from "@/lib/validators/profile";

export type ActionResult = {
  success: boolean;
  message: string;
};

function parseCheckboxValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

const AVATAR_UPLOAD_DIR = join(process.cwd(), "public", "uploads", "avatars");
const AVATAR_WEB_PREFIX = "/uploads/avatars/";
const MAX_AVATAR_SIZE_BYTES = 4 * 1024 * 1024;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

async function deleteOldUploadedAvatar(avatarUrl: string | null | undefined) {
  if (!avatarUrl || !avatarUrl.startsWith(AVATAR_WEB_PREFIX)) {
    return;
  }

  const fileName = avatarUrl.slice(AVATAR_WEB_PREFIX.length);
  if (!fileName || fileName.includes("/") || fileName.includes("\\")) {
    return;
  }

  const fullPath = join(AVATAR_UPLOAD_DIR, fileName);
  try {
    await unlink(fullPath);
  } catch {
    // no-op, file may not exist
  }
}

async function saveAvatarFile(file: File) {
  if (file.size <= 0) {
    return { success: false as const, message: "Selected avatar file is empty" };
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return { success: false as const, message: "Avatar file is too large (max 4MB)" };
  }

  const extension = MIME_TO_EXTENSION[file.type];
  if (!extension) {
    return { success: false as const, message: "Avatar must be PNG, JPG, WEBP, or GIF" };
  }

  await mkdir(AVATAR_UPLOAD_DIR, { recursive: true });

  const fileName = `${randomUUID()}${extension}`;
  const fullPath = join(AVATAR_UPLOAD_DIR, fileName);
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(fullPath, new Uint8Array(arrayBuffer));

  return {
    success: true as const,
    avatarUrl: `${AVATAR_WEB_PREFIX}${fileName}`
  };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const currentUsername = user.profile?.username;
  const existingAvatarUrl = user.profile?.avatarUrl ?? null;
  const avatarFile = formData.get("avatarFile");
  let nextAvatarUrl = existingAvatarUrl ?? "";
  let uploadedAvatarUrl: string | null = null;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    const uploaded = await saveAvatarFile(avatarFile);
    if (!uploaded.success) {
      return { success: false, message: uploaded.message };
    }
    nextAvatarUrl = uploaded.avatarUrl;
    uploadedAvatarUrl = uploaded.avatarUrl;
  }

  const parsed = profileSchema.safeParse({
    username: normalizeUsername(String(formData.get("username") ?? "")),
    displayName: sanitizePlainText(String(formData.get("displayName") ?? "")),
    bio: sanitizeOptionalPlainText(String(formData.get("bio") ?? "")) ?? "",
    avatarUrl: nextAvatarUrl,
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

    if (nextAvatarUrl !== existingAvatarUrl) {
      await deleteOldUploadedAvatar(existingAvatarUrl);
    }

    if (currentUsername) {
      revalidatePath(`/u/${currentUsername}`);
    }
    revalidatePath(`/u/${parsed.data.username}`);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return { success: true, message: "Profile saved" };
  } catch (error) {
    if (uploadedAvatarUrl) {
      await deleteOldUploadedAvatar(uploadedAvatarUrl);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, message: "Username is already taken" };
    }

    return { success: false, message: "Could not update profile" };
  }
}

export async function resetAvatarAction(): Promise<ActionResult> {
  const user = await requireCurrentUser();
  const currentUsername = user.profile?.username;
  const existingAvatarUrl = user.profile?.avatarUrl ?? null;

  if (!user.profile) {
    return { success: false, message: "Profile not found" };
  }

  if (!existingAvatarUrl) {
    return { success: true, message: "Avatar is already empty" };
  }

  try {
    await db.profile.update({
      where: { userId: user.id },
      data: { avatarUrl: null }
    });

    await deleteOldUploadedAvatar(existingAvatarUrl);

    if (currentUsername) {
      revalidatePath(`/u/${currentUsername}`);
    }
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");

    return { success: true, message: "Avatar reset" };
  } catch {
    return { success: false, message: "Could not reset avatar" };
  }
}
