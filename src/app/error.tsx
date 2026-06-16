"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const reference = error.digest ? `错误编号：${error.digest}` : "错误编号暂不可用";

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-20 sm:px-6">
      <section className="surface-panel max-w-2xl p-7">
        <p className="section-kicker">Error</p>
        <h1
          className="font-editorial mt-3 text-[1.5rem] font-normal tracking-[-0.02em]"
          style={{ color: "var(--ink)" }}
        >
          页面加载失败
        </h1>
        <p className="mt-3 text-[14px] leading-[1.65]" style={{ color: "var(--muted)" }}>
          当前页面没有成功渲染。你可以重试一次；如果持续出现，请通过联系入口反馈页面地址和下方错误编号。
        </p>
        <p
          className="mt-4 rounded-lg px-3 py-2 font-mono text-[12px]"
          style={{ background: "var(--surface-alt)", color: "var(--muted)", border: "1px solid var(--line)" }}
        >
          {reference}
        </p>
        <button className="btn-primary mt-5" type="button" onClick={reset}>
          重试
        </button>
      </section>
    </main>
  );
}
