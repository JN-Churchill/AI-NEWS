import fs from "fs";
import path from "path";
import { ZodError } from "zod";
import { dailyIssueSchema } from "../src/lib/issue-schema";
import { sourceConfigListSchema } from "../src/lib/source-schema";

const issuesDirectory = path.join(process.cwd(), "content", "issues");
const sourcesPath = path.join(process.cwd(), "content", "sources.json");
const targetDate = process.argv[2];

function getIssueFiles() {
  if (!fs.existsSync(issuesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(issuesDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .filter((fileName) => !targetDate || fileName === `${targetDate}.json`)
    .map((fileName) => path.join(issuesDirectory, fileName));
}

const files = getIssueFiles();

if (files.length === 0) {
  console.error(targetDate ? `No issue found for ${targetDate}.` : "No issue files found.");
  process.exit(1);
}

let failed = false;

try {
  const sources = sourceConfigListSchema.parse(JSON.parse(fs.readFileSync(sourcesPath, "utf8")));
  console.log(`OK sources ${sources.length} enabled=${sources.filter((source) => source.enabled).length}`);
} catch (error) {
  failed = true;
  console.error(`FAILED ${path.relative(process.cwd(), sourcesPath)}`);

  if (error instanceof ZodError) {
    error.issues.forEach((issue) => {
      console.error(`- ${issue.path.join(".") || "root"}: ${issue.message}`);
    });
  } else {
    console.error(error);
  }
}

for (const file of files) {
  try {
    const issue = dailyIssueSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    console.log(`OK ${issue.date} ${issue.items.length} items`);
  } catch (error) {
    failed = true;
    console.error(`FAILED ${path.relative(process.cwd(), file)}`);

    if (error instanceof ZodError) {
      error.issues.forEach((issue) => {
        console.error(`- ${issue.path.join(".") || "root"}: ${issue.message}`);
      });
    } else {
      console.error(error);
    }
  }
}

if (failed) {
  process.exit(1);
}
