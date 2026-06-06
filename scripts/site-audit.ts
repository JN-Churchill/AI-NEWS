import { getPublicIssueQualityErrors } from "./issue-quality";
import { SITE_URL } from "../src/lib/constants";
import { getProductionContactEmailProblem, getProductionSiteUrlProblem } from "../src/lib/deployment-readiness";
import { getAllIssues } from "../src/lib/issues";
import { getSiteHealth } from "../src/lib/site-health";
import { getAllSources, getEnabledSources } from "../src/lib/sources";

const args = process.argv.slice(2);
const production = args.includes("--production");
const allowStale = args.includes("--allow-stale");
const problems: string[] = [];
const warnings: string[] = [];

const health = getSiteHealth();
const sources = getAllSources();
const enabledSources = getEnabledSources();
const feedSources = enabledSources.filter((source) => Boolean(source.feedUrl));
const publishedIssues = getAllIssues();

if (publishedIssues.length === 0) {
  problems.push("No published issue found.");
}

if (!health.contentFresh && !allowStale) {
  problems.push(`Latest published issue is stale: ${health.contentAgeDays ?? "unknown"} days old.`);
}

if (enabledSources.length < 6) {
  problems.push(`Enabled source coverage is low: ${enabledSources.length} sources.`);
}

if (feedSources.length < 3) {
  problems.push(`Stable feed coverage is low: ${feedSources.length} feed sources.`);
}

publishedIssues.forEach((issue) => {
  const qualityErrors = getPublicIssueQualityErrors(issue);

  if (qualityErrors.length > 0) {
    problems.push(`${issue.date} has public quality errors: ${qualityErrors.join("; ")}`);
  }
});

if (sources.some((source) => source.requiresAuth && source.enabled && !source.authEnv)) {
  problems.push("An enabled authenticated source is missing authEnv.");
}

if (production) {
  const siteUrlProblem = getProductionSiteUrlProblem(SITE_URL);
  const contactEmailProblem = getProductionContactEmailProblem(process.env.NEXT_PUBLIC_CONTACT_EMAIL);

  if (siteUrlProblem) {
    problems.push(siteUrlProblem);
  }

  if (contactEmailProblem) {
    problems.push(contactEmailProblem);
  }

  if (!process.env.NEXT_PUBLIC_NEWSLETTER_URL) {
    warnings.push("NEXT_PUBLIC_NEWSLETTER_URL is not configured; /subscribe will fall back to contact flow.");
  }
}

console.log(`Site URL: ${SITE_URL}`);
console.log(`Published issues: ${publishedIssues.length}`);
console.log(`Latest issue: ${health.latestIssueDate ?? "none"} (${health.contentAgeDays ?? "n/a"} days old)`);
console.log(`Enabled sources: ${enabledSources.length}/${sources.length}`);
console.log(`Feed sources: ${feedSources.length}`);

health.warnings.forEach((warning) => warnings.push(warning));

if (warnings.length > 0) {
  console.log("\nWarnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (problems.length > 0) {
  console.error("\nProblems:");
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exit(1);
}

console.log("\nSite audit passed.");
