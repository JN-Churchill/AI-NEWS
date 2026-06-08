import Link from "next/link";
import { Container } from "@/app/_components/container";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200/80 bg-white/80">
      <Container className="flex flex-col gap-5 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-950">{SITE_NAME}</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-neutral-500">
            {SITE_DESCRIPTION}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-neutral-500">
          <Link href="/subscribe" className="hover:text-neutral-950 transition">
            订阅
          </Link>
          <Link href="/rss.xml" className="hover:text-neutral-950 transition">
            RSS
          </Link>
          <Link href="/feed.json" className="hover:text-neutral-950 transition">
            JSON Feed
          </Link>
          <Link href="/sources" className="hover:text-neutral-950 transition">
            来源
          </Link>
          <Link href="/topics" className="hover:text-neutral-950 transition">
            主题
          </Link>
          <Link href="/editorial" className="hover:text-neutral-950 transition">
            编辑政策
          </Link>
          <Link href="/contact" className="hover:text-neutral-950 transition">
            联系
          </Link>
          <Link href="/sitemap.xml" className="hover:text-neutral-950 transition">
            站点地图
          </Link>
          <Link href="/about" className="hover:text-neutral-950 transition">
            方法
          </Link>
        </div>
      </Container>
    </footer>
  );
}
