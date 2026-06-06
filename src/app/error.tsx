"use client";

import { Container } from "@/app/_components/container";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const reference = error.digest ? `错误编号：${error.digest}` : "错误编号暂不可用";

  return (
    <main>
      <Container className="py-16">
        <section className="max-w-2xl rounded-md border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">Error</p>
          <h1 className="mt-3 text-3xl font-semibold text-neutral-950">页面加载失败</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            当前页面没有成功渲染。你可以重试一次；如果持续出现，请通过联系入口反馈页面地址和下方错误编号。
          </p>
          <p className="mt-4 rounded-md bg-neutral-50 p-3 text-xs font-medium text-neutral-500">{reference}</p>
          <button
            className="mt-5 h-10 rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            type="button"
            onClick={reset}
          >
            重试
          </button>
        </section>
      </Container>
    </main>
  );
}
