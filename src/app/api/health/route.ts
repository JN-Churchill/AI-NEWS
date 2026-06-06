import { getSiteHealth } from "@/lib/site-health";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    getSiteHealth(),
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
