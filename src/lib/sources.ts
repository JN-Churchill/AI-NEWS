import fs from "fs";
import path from "path";
import { sourceConfigListSchema, type SourceConfig } from "@/lib/source-schema";

const sourcesPath = path.join(process.cwd(), "content", "sources.json");
let sourcesCache: SourceConfig[] | null = null;

export function getAllSources() {
  if (sourcesCache) {
    return sourcesCache;
  }

  sourcesCache = sourceConfigListSchema.parse(JSON.parse(fs.readFileSync(sourcesPath, "utf8")));
  return sourcesCache;
}

export function getEnabledSources() {
  return getAllSources().filter((source) => source.enabled);
}
