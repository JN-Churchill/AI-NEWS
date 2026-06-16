import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1200px] px-5 py-20 sm:px-6">
      <section className="surface-panel max-w-2xl p-7">
        <p className="section-kicker">404</p>
        <h1
          className="font-editorial mt-3 text-[1.5rem] font-normal tracking-[-0.02em]"
          style={{ color: "var(--ink)" }}
        >
          没有找到这期内容
        </h1>
        <p className="mt-3 text-[14px] leading-[1.65]" style={{ color: "var(--muted)" }}>
          这条链接可能还没有发布，或者对应日期的日报 JSON 不存在。
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/" className="btn-primary">
            回到今日
          </Link>
          <Link href="/archive" className="btn-secondary">
            查看归档
          </Link>
        </div>
      </section>
    </main>
  );
}
