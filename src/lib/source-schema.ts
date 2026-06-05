import { z } from "zod";

export const sourceTypeSchema = z.enum(["official", "paper", "community", "media"]);
export const sourceFetchModeSchema = z.enum(["auto", "feed", "html", "api", "manual"]);
export const sourceParserSchema = z.enum(["auto", "rss", "atom", "html-links", "api", "manual"]);

export const sourceConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  type: sourceTypeSchema,
  url: z.string().url(),
  feedUrl: z.union([z.string().url(), z.literal("")]),
  fetchMode: sourceFetchModeSchema.default("auto"),
  parser: sourceParserSchema.default("auto"),
  requiresAuth: z.boolean().default(false),
  authEnv: z.string().default(""),
  notes: z.string().default(""),
  trustScore: z.number().min(0).max(100),
  enabled: z.boolean(),
});

export const sourceConfigListSchema = z.array(sourceConfigSchema);

export type SourceConfig = z.infer<typeof sourceConfigSchema>;
