import { z } from "zod";

const scoreSchema = z.number().min(0).max(100);

export const issueStatusSchema = z.enum(["draft", "published"]);

export const issueCategorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  score: scoreSchema,
  count: z.number().int().min(0),
});

export const signalMetricsSchema = z.object({
  utility: z.number().min(0).max(30),
  novelty: z.number().min(0).max(20),
  impact: z.number().min(0).max(20),
  credibility: z.number().min(0).max(15),
  audience: z.number().min(0).max(10),
  freshness: z.number().min(0).max(5),
});

export const signalItemSchema = z.object({
  rank: z.number().int().min(1),
  title: z.string().min(6),
  summary: z.string().min(12),
  whyItMatters: z.string().min(12),
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  source: z.string().min(1),
  sourceUrl: z.string(),
  publishedAt: z.string().datetime({ offset: true }),
  score: scoreSchema,
  metrics: signalMetricsSchema,
}).superRefine((item, ctx) => {
  const metricTotal = Object.values(item.metrics).reduce((sum, value) => sum + value, 0);

  if (Math.abs(metricTotal - item.score) > 0.1) {
    ctx.addIssue({
      code: "custom",
      path: ["metrics"],
      message: `metrics total ${metricTotal} must match score ${item.score}`,
    });
  }
});

export const dailyIssueSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    issueNo: z.string().min(1),
    status: issueStatusSchema,
    title: z.string().min(1),
    summary: z.string().min(12),
    totalScore: scoreSchema,
    candidateCount: z.number().int().min(0),
    selectedCount: z.number().int().min(0),
    readingMinutes: z.number().int().min(1),
    categories: z.array(issueCategorySchema).min(1),
    items: z.array(signalItemSchema).min(1),
  })
  .superRefine((issue, ctx) => {
    if (issue.selectedCount !== issue.items.length) {
      ctx.addIssue({
        code: "custom",
        path: ["selectedCount"],
        message: "selectedCount must match items.length",
      });
    }

    const categorySlugs = new Set(issue.categories.map((category) => category.slug));
    issue.items.forEach((item, index) => {
      if (!categorySlugs.has(item.category)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "category"],
          message: `Unknown category: ${item.category}`,
        });
      }
    });
  });

export type IssueStatus = z.infer<typeof issueStatusSchema>;
export type IssueCategory = z.infer<typeof issueCategorySchema>;
export type SignalMetrics = z.infer<typeof signalMetricsSchema>;
export type SignalItem = z.infer<typeof signalItemSchema>;
export type DailyIssue = z.infer<typeof dailyIssueSchema>;
