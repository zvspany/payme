import { z } from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,32}$/, "Username must be 3-32 chars (a-z, 0-9, _)")
    .max(32),
  displayName: z.string().trim().min(2).max(60),
  bio: z.string().trim().max(280).optional().or(z.literal("")),
  avatarUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => {
      if (!value) {
        return true;
      }

      if (value.startsWith("/uploads/avatars/")) {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Avatar must be a valid URL or uploaded file path")
    .optional()
    .or(z.literal("")),
  themeId: z.string().trim().min(1),
  isPublic: z.boolean()
});

export type ProfileInput = z.infer<typeof profileSchema>;
