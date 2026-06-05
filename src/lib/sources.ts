import fs from "fs";
import path from "path";
import { sourceConfigListSchema } from "@/lib/source-schema";

const sourcesPath = path.join(process.cwd(), "content", "sources.json");

export function getAllSources() {
  return sourceConfigListSchema.parse(JSON.parse(fs.readFileSync(sourcesPath, "utf8")));
}

export function getEnabledSources() {
  return getAllSources().filter((source) => source.enabled);
}
