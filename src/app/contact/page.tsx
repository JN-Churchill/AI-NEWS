import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";

export const metadata = {
  title: "联系",
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="联系与投稿"
        description="用于后续接收来源推荐、纠错反馈、合作和投稿。当前先保留静态说明，避免上线后缺少基本联系入口。"
      />
      <Container className="grid gap-4 py-6 lg:grid-cols-3">
        <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">来源推荐</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">推荐官方博客、RSS、论文列表、开源项目或高质量社区来源。</p>
        </section>
        <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">纠错反馈</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">如果摘要、来源、分类或评分存在问题，可以通过仓库 issue 反馈。</p>
        </section>
        <section className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">合作</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">后续可补充邮箱、表单或 newsletter 订阅入口。</p>
        </section>
      </Container>
    </main>
  );
}
