import Link from "next/link";
import { Container } from "@/app/_components/container";

export default function NotFound() {
  return (
    <main>
      <Container className="py-16">
        <section className="max-w-2xl rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neutral-500">404</p>
          <h1 className="mt-3 text-3xl font-semibold text-neutral-950">没有找到这期内容</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            这条链接可能还没有发布，或者对应日期的日报 JSON 不存在。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              回到今日
            </Link>
            <Link
              href="/archive"
              className="inline-flex h-10 items-center rounded-md border border-neutral-200 px-4 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400"
            >
              查看归档
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}
