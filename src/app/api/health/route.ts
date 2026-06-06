import { getAllIssues } from "@/lib/issues";
import { getEnabledSources } from "@/lib/sources";

export const dynamic = "force-dynamic";

export function GET() {
  const issues = getAllIssues();
  const latestIssue = issues[0] ?? null;
  const sources = getEnabledSources();

  return Response.json(
    {
      ok: latestIssue !== null && sources.length > 0,
      generatedAt: new Date().toISOString(),
      publicIssueCount: issues.length,
      latestIssueDate: latestIssue?.date ?? null,
      latestIssueStatus: latestIssue?.status ?? null,
      enabledSourceCount: sources.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
