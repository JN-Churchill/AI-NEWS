import fs from "fs";
import path from "path";
import { dailyIssueSchema, issueStatusSchema, type DailyIssue } from "../src/lib/issue-schema";
import { getPublicIssueQualityErrors } from "./issue-quality";

const args = process.argv.slice(2);

function getArg(name: string, fallback = "") {
  const index = args.indexOf(name);

  if (index >= 0) {
    return args[index + 1] ?? fallback;
  }

  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}

const date = getArg("--date", args.find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(arg)) ?? "");
const rawStatus = getArg(
  "--status",
  args.includes("--publish") ? "published" : args.includes("--unpublish") || args.includes("--draft") ? "draft" : "",
);
const dryRun = args.includes("--dry-run");

if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !rawStatus) {
  console.error("Usage: npm run issue:publish -- YYYY-MM-DD");
  console.error("   or: npm run issue:unpublish -- YYYY-MM-DD");
  console.error("   or: tsx scripts/set-issue-status.ts --date YYYY-MM-DD --status draft|demo|published [--dry-run]");
  process.exit(1);
}

const status = issueStatusSchema.parse(rawStatus);
const issuesDirectory = path.join(process.cwd(), "content", "issues");
const issuePath = path.join(issuesDirectory, `${date}.json`);

if (!fs.existsSync(issuePath)) {
  console.error(`${path.relative(process.cwd(), issuePath)} does not exist.`);
  process.exit(1);
}

const existing = dailyIssueSchema.parse(JSON.parse(fs.readFileSync(issuePath, "utf8")));
const nextIssue: DailyIssue = dailyIssueSchema.parse({
  ...existing,
  status,
});

if (status !== "draft") {
  const qualityErrors = getPublicIssueQualityErrors(nextIssue);

  if (qualityErrors.length > 0) {
    console.error(`${path.relative(process.cwd(), issuePath)} is not publishable:`);
    qualityErrors.forEach((error) => {
      console.error(`- ${error}`);
    });
    process.exit(1);
  }
}

if (dryRun) {
  console.log(`${path.relative(process.cwd(), issuePath)} ${existing.status} -> ${status} (dry-run)`);
  process.exit(0);
}

fs.writeFileSync(issuePath, `${JSON.stringify(nextIssue, null, 2)}\n`, "utf8");
console.log(`${path.relative(process.cwd(), issuePath)} ${existing.status} -> ${status}`);
