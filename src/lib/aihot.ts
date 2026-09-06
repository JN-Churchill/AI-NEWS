import fs from "fs";
import path from "path";

import { aihotDailySchema, type AihotDaily } from "@/lib/aihot-schema";

const aihotDirectory = path.join(process.cwd(), "content", "aihot");
let aihotDatesCache: string[] | null = null;
const aihotCache = new Map<string, AihotDaily>();

export function getAihotDates() {
  if (aihotDatesCache) {
    return aihotDatesCache;
  }

  if (!fs.existsSync(aihotDirectory)) {
    return [];
  }

  aihotDatesCache = fs
    .readdirSync(aihotDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => fileName.replace(/\.json$/, ""))
    .sort()
    .reverse();

  return aihotDatesCache;
}

export function getAihotByDate(date: string): AihotDaily | null {
  const cached = aihotCache.get(date);

  if (cached) {
    return cached;
  }

  const fullPath = path.join(aihotDirectory, `${date}.json`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const daily = aihotDailySchema.parse(JSON.parse(fs.readFileSync(fullPath, "utf8")));
  aihotCache.set(date, daily);
  return daily;
}

export function getLatestAihot(): AihotDaily | null {
  const [latestDate] = getAihotDates();

  if (!latestDate) {
    return null;
  }

  return getAihotByDate(latestDate);
}
