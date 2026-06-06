import fs from "fs";
import path from "path";
import { ZodError } from "zod";
import { candidatePoolSchema } from "../src/lib/candidate-schema";
import { dailyIssueSchema } from "../src/lib/issue-schema";
import { sourceConfigListSchema } from "../src/lib/source-schema";
import { getPublicIssueQualityErrors } from "./issue-quality";

const issuesDirectory = path.join(process.cwd(), "content", "issues");
const candidatesDirectory = path.join(process.cwd(), "content", "candidates");
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

function getCandidateFiles() {
  if (!fs.existsSync(candidatesDirectory)) {
    return [];
  }

  return fs
    .readdirSync(candidatesDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .filter((fileName) => !targetDate || fileName === `${targetDate}.json`)
    .map((fileName) => path.join(candidatesDirectory, fileName));
}

const files = getIssueFiles();
const candidateFiles = getCandidateFiles();

if (files.length === 0) {
  console.error(targetDate ? `No issue found for ${targetDate}.` : "No issue files found.");
  process.exit(1);
}

let failed = false;
let publicIssueCount = 0;

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
    console.log(`OK ${issue.date} ${issue.status} ${issue.items.length} items`);

    if (issue.status !== "draft") {
      publicIssueCount += 1;
      const qualityErrors = getPublicIssueQualityErrors(issue);

      if (qualityErrors.length > 0) {
        failed = true;
        console.error(`FAILED quality ${path.relative(process.cwd(), file)}`);
        qualityErrors.forEach((error) => {
          console.error(`- ${error}`);
        });
      }
    }
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

if (!targetDate && publicIssueCount === 0) {
  failed = true;
  console.error("FAILED content/issues: at least one non-draft issue is required for public deployment.");
}

for (const file of candidateFiles) {
  try {
    const pool = candidatePoolSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    console.log(`OK candidates ${pool.date} ${pool.items.length} items`);
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
