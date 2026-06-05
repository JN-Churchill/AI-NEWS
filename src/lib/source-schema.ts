import { z } from "zod";

export const sourceConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(["official", "paper", "community", "media"]),
  url: z.string().url(),
  feedUrl: z.union([z.string().url(), z.literal("")]),
  trustScore: z.number().min(0).max(100),
  enabled: z.boolean(),
});

export const sourceConfigListSchema = z.array(sourceConfigSchema);

export type SourceConfig = z.infer<typeof sourceConfigSchema>;
