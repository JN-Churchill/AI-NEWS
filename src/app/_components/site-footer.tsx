import Link from "next/link";
import { Container } from "@/app/_components/container";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-950">{SITE_NAME}</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-neutral-500">
            {SITE_DESCRIPTION}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-neutral-500">
          <Link href="/rss.xml" className="hover:text-neutral-950 transition">
            RSS
          </Link>
          <Link href="/sitemap.xml" className="hover:text-neutral-950 transition">
            Sitemap
          </Link>
          <Link href="/about" className="hover:text-neutral-950 transition">
            Method
          </Link>
        </div>
      </Container>
    </footer>
  );
}
