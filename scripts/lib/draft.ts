import type { SectionSlug, SourceConfig } from "../../src/types/schema";

/** 适配器产出的原始条目（尚未打分/归类） */
export interface ItemDraft {
  title: string;
  summary: string;
  url: string;
  sourceId: string;
  sourceName: string;
  /** 来源自带版块（AI HOT 提供）；缺省时由 classify 推断 */
  section?: SectionSlug;
  publishedAt?: string;
}

export interface AdapterMeta {
  window?: { start: string; end: string };
  lead?: string;
  attribution?: { name: string; url: string };
}

export interface AdapterResult {
  items: ItemDraft[];
  meta?: AdapterMeta;
}

export type Adapter = (source: SourceConfig, date: string) => Promise<AdapterResult>;
