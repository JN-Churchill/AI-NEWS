import { z } from "zod";

/**
 * AI HOT 日报数据契约。
 *
 * rawAihot* 系列校验远程 API 的原始响应（宽松，仅供 ingest 内部使用）；
 * aihot* 系列校验 content/aihot/YYYY-MM-DD.json 的存储格式（严格，loader 与测试共用）。
 *
 * 注意：section 的 label 不用 enum 锁定，避免 AI HOT 未来调整版块命名时 ingest 直接崩溃；
 * 渲染层通过 aihot-format 的 getSectionMeta 做 fallback。
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoDateTime = z.string().datetime({ offset: true });

/* ---------- 远程 API 原始响应（宽松） ---------- */

export const rawAihotItemSchema = z.object({
  title: z.string().optional(),
  summary: z.string().nullable().optional(),
  source: z
    .object({ name: z.string().optional() })
    .partial()
    .nullable()
    .optional(),
  links: z
    .object({
      aihot: z.string().optional(),
      original: z.string().optional(),
    })
    .partial()
    .nullable()
    .optional(),
  attribution: z
    .object({
      name: z.string().optional(),
      url: z.string().optional(),
    })
    .partial()
    .nullable()
    .optional(),
});

export const rawAihotSectionSchema = z.object({
  label: z.string().min(1),
  items: z.array(rawAihotItemSchema),
});

export const rawAihotReportSchema = z.object({
  schemaVersion: z.number(),
  report: z.object({
    date: isoDate,
    generatedAt: z.string(),
    windowStart: z.string(),
    windowEnd: z.string(),
    lead: z.string().nullable().optional(),
    links: z
      .object({ aihot: z.string().optional() })
      .partial()
      .optional(),
    attribution: z
      .object({
        name: z.string().optional(),
        url: z.string().optional(),
      })
      .partial()
      .optional(),
    sections: z.array(rawAihotSectionSchema).min(1),
    flashes: z.array(z.unknown()).optional(),
  }),
});

/** GET /api/v1/dailies?limit=N 的列表响应 */
export const rawAihotDailyListSchema = z.object({
  items: z
    .array(
      z.object({
        date: isoDate,
        generatedAt: z.string().optional(),
      }),
    )
    .min(1),
});

/** GET /api/v1/items?mode=selected&window=7d 的响应（用于时间富化） */
export const rawAihotItemEntrySchema = z.object({
  id: z.string().optional(),
  links: z
    .object({
      aihot: z.string().optional(),
      original: z.string().optional(),
    })
    .partial()
    .optional(),
  publishedAt: z.string().nullable().optional(),
  discoveredAt: z.string().nullable().optional(),
});

export const rawAihotItemsResponseSchema = z.object({
  items: z.array(rawAihotItemEntrySchema).optional(),
});

/* ---------- content/aihot 存储契约（严格） ---------- */

export const aihotMatchSourceSchema = z.enum(["publishedAt", "discoveredAt", "none"]);

export const aihotItemSchema = z.object({
  title: z.string().min(1),
  summary: z.string(),
  sourceName: z.string(),
  aihotUrl: z.string(),
  originalUrl: z.string().optional(),
  section: z.string().min(1),
  /** 命中 items API 的 publishedAt（原文发布时间）或 discoveredAt（AI HOT 收录时间） */
  publishedAt: isoDateTime.optional(),
  isDiscoveryTime: z.boolean(),
  matchSource: aihotMatchSourceSchema,
});

export const aihotSectionSchema = z.object({
  label: z.string().min(1),
  items: z.array(aihotItemSchema),
});

export const aihotDailySchema = z
  .object({
    schemaVersion: z.literal(1),
    date: isoDate,
    generatedAt: isoDateTime,
    windowStart: isoDateTime,
    windowEnd: isoDateTime,
    sourceUrl: z.string(),
    attribution: z.object({
      name: z.string(),
      url: z.string(),
    }),
    lead: z.string().nullable(),
    itemCount: z.number().int().min(0),
    /** matchSource !== "none" 的条数 */
    matchedCount: z.number().int().min(0),
    /** isDiscoveryTime === true 的条数 */
    discoveryCount: z.number().int().min(0),
    ingestAt: isoDateTime,
    sections: z.array(aihotSectionSchema),
  })
  .superRefine((daily, ctx) => {
    const allItems = daily.sections.flatMap((section) => section.items);

    if (allItems.length !== daily.itemCount) {
      ctx.addIssue({
        code: "custom",
        path: ["itemCount"],
        message: `itemCount ${daily.itemCount} must match items length ${allItems.length}`,
      });
    }

    const matchedCount = allItems.filter((item) => item.matchSource !== "none").length;
    if (matchedCount !== daily.matchedCount) {
      ctx.addIssue({
        code: "custom",
        path: ["matchedCount"],
        message: `matchedCount ${daily.matchedCount} must match items ${matchedCount}`,
      });
    }

    const discoveryCount = allItems.filter((item) => item.isDiscoveryTime).length;
    if (discoveryCount !== daily.discoveryCount) {
      ctx.addIssue({
        code: "custom",
        path: ["discoveryCount"],
        message: `discoveryCount ${daily.discoveryCount} must match items ${discoveryCount}`,
      });
    }

    allItems.forEach((item, index) => {
      if (item.isDiscoveryTime && !item.publishedAt) {
        ctx.addIssue({
          code: "custom",
          path: ["sections", index],
          message: `item ${index} marked isDiscoveryTime but has no publishedAt`,
        });
      }
      if (item.matchSource === "none" && item.publishedAt) {
        ctx.addIssue({
          code: "custom",
          path: ["sections", index],
          message: `item ${index} has matchSource "none" but a publishedAt`,
        });
      }
      if (item.matchSource === "publishedAt" && item.isDiscoveryTime) {
        ctx.addIssue({
          code: "custom",
          path: ["sections", index],
          message: `item ${index} with publishedAt match must not be marked isDiscoveryTime`,
        });
      }
    });
  });

export type AihotItem = z.infer<typeof aihotItemSchema>;
export type AihotSection = z.infer<typeof aihotSectionSchema>;
export type AihotDaily = z.infer<typeof aihotDailySchema>;
export type AihotMatchSource = z.infer<typeof aihotMatchSourceSchema>;
