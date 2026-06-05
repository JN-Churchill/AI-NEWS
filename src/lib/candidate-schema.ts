import { z } from "zod";

export const candidateItemSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceId: z.string().min(1),
  sourceName: z.string().min(1),
  sourceType: z.enum(["official", "paper", "community", "media"]),
  category: z.string().min(1),
  title: z.string().min(4),
  url: z.string().url(),
  summary: z.string(),
  publishedAt: z.string().datetime(),
  fetchedAt: z.string().datetime(),
  score: z.number().min(0).max(100),
  tags: z.array(z.string().min(1)),
});

export const candidateSourceResultSchema = z.object({
  sourceId: z.string().min(1),
  sourceName: z.string().min(1),
  status: z.enum(["ok", "skipped", "failed"]),
  itemCount: z.number().int().min(0),
  message: z.string().optional(),
  fetchedAt: z.string().datetime(),
});

export const candidatePoolSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    generatedAt: z.string().datetime(),
    sourceCount: z.number().int().min(0),
    itemCount: z.number().int().min(0),
    sourceResults: z.array(candidateSourceResultSchema).default([]),
    items: z.array(candidateItemSchema),
  })
  .superRefine((pool, ctx) => {
    if (pool.itemCount !== pool.items.length) {
      ctx.addIssue({
        code: "custom",
        path: ["itemCount"],
        message: "itemCount must match items.length",
      });
    }
  });

export type CandidateItem = z.infer<typeof candidateItemSchema>;
export type CandidateSourceResult = z.infer<typeof candidateSourceResultSchema>;
export type CandidatePool = z.infer<typeof candidatePoolSchema>;
