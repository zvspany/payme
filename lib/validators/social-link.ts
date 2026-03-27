import { z } from "zod";

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(2).max(50),
  url: z.string().trim().url("Social link must be a valid URL").max(500),
  isVisible: z.boolean().default(true)
});

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
