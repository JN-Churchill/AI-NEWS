/**
 * AI HOT 日报看板的格式化工具。
 *
 * 所有时间都在服务端/build 期用 Intl 固定 Asia/Shanghai 时区格式化为"北京时间人话格式"，
 * 页面不出现 ISO 字符串，客户端也不做任何日期运算（避免水合时区不一致）。
 */

const TIME_ZONE = "Asia/Shanghai";

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: TIME_ZONE,
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateTitleFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: TIME_ZONE,
  weekday: "short",
});

/** "2026-09-05T00:01:54.610Z" → "9月5日 08:01" */
export function formatAihotDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/** "2026-09-05" → "2026年9月5日 周六" */
export function formatAihotDateTitle(date: string): string {
  // 用中午 12 点（北京时间）锚定，避免日期字符串被解析为 UTC 后跨日偏移
  const anchored = new Date(`${date}T12:00:00+08:00`);
  return `${dateTitleFormatter.format(anchored)} ${weekdayFormatter.format(anchored)}`;
}

/** 收录窗口：startIso → endIso，两段都是 "M月D日 HH:MM" */
export function formatAihotRange(startIso: string, endIso: string): string {
  return `${formatAihotDateTime(startIso)} → ${formatAihotDateTime(endIso)}`;
}

/** 卡片摘要：≤60 字；优先在句末标点收尾，否则硬截断加省略号 */
export function truncateSummary(text: string, max = 60): string {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= max) {
    return normalized;
  }

  const head = normalized.slice(0, max);

  for (let i = head.length - 1; i >= 30; i -= 1) {
    if ("。！？；…".includes(head[i - 1] ?? "")) {
      return head.slice(0, i);
    }
  }

  return `${head.slice(0, max - 1)}…`;
}

/* ---------- 版块配色（参考 ai-daily 仪表盘五色） ---------- */

export interface AihotSectionMeta {
  color: string;
  soft: string;
}

const SECTION_COLORS: Record<string, AihotSectionMeta> = {
  "模型发布/更新": { color: "#2563EB", soft: "rgba(37, 99, 235, 0.10)" },
  "产品发布/更新": { color: "#0D9488", soft: "rgba(13, 148, 136, 0.10)" },
  行业动态: { color: "#D97706", soft: "rgba(217, 119, 6, 0.10)" },
  论文研究: { color: "#7C3AED", soft: "rgba(124, 58, 237, 0.10)" },
  技巧与观点: { color: "#DB2777", soft: "rgba(219, 39, 119, 0.10)" },
};

const FALLBACK_SECTION_META: AihotSectionMeta = {
  color: "var(--muted)",
  soft: "rgba(120, 113, 108, 0.10)",
};

/** 未收录的版块名回落到中性灰，页面不因 AI HOT 改版块命名而崩 */
export function getSectionMeta(label: string): AihotSectionMeta {
  return SECTION_COLORS[label] ?? FALLBACK_SECTION_META;
}
