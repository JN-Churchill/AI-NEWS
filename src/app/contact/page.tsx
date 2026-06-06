import Link from "next/link";
import { Container } from "@/app/_components/container";
import { PageHero } from "@/app/_components/page-hero";

export const metadata = {
  title: "联系与投稿",
  description: "向 AI 信号指数提交来源推荐、纠错反馈、合作沟通和内容线索。",
  alternates: {
    canonical: "/contact",
  },
};

const repoIssueUrl = "https://github.com/JN-Churchill/AI-NEWS/issues/new";
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

const contactCards = [
  {
    eyebrow: "Source",
    title: "推荐来源",
    description: "官方博客、RSS、论文列表、开源项目、产品更新和高质量社区讨论都可以提交。请尽量附上原始链接和推荐理由。",
    action: "提交来源",
    href: repoIssueUrl,
  },
  {
    eyebrow: "Correction",
    title: "纠错反馈",
    description: "如果标题、摘要、分类、评分或来源链接存在问题，请带上日期和条目编号，方便快速定位并修正。",
    action: "提交纠错",
    href: repoIssueUrl,
  },
  {
    eyebrow: "Partnership",
    title: "合作与转载",
    description: "内容合作、数据引用、Newsletter 联动和企业内部分发需求，可以通过邮件或仓库 issue 联系。",
    action: contactEmail ? "发送邮件" : "发起沟通",
    href: contactEmail ? `mailto:${contactEmail}` : repoIssueUrl,
  },
];

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contact"
        title="联系与投稿"
        description="接收来源推荐、纠错反馈、合作沟通和内容线索。所有公开内容以原始来源、可复核事实和编辑判断为准。"
        aside={
          <div className="space-y-4 text-sm leading-6">
            <p className="font-semibold text-white">优先使用 GitHub Issue 留下可追踪记录。</p>
            <p>紧急纠错请写清日期、条目编号、问题位置和建议修正文本。</p>
          </div>
        }
      />

      <section className="editorial-shell">
        <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4 md:grid-cols-3">
            {contactCards.map((card) => (
              <article key={card.title} className="editorial-card flex min-h-64 flex-col rounded-md p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">{card.eyebrow}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">{card.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-neutral-600">{card.description}</p>
                <Link
                  href={card.href}
                  target={card.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={card.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  className="mt-5 inline-flex h-10 w-fit items-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  {card.action}
                </Link>
              </article>
            ))}
          </div>

          <aside className="editorial-card rounded-md p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Submission Format</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-neutral-950">建议提交格式</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-neutral-600">
              <p>
                <span className="font-semibold text-neutral-950">来源链接：</span>
                原始公告、论文、仓库、RSS 或讨论串。
              </p>
              <p>
                <span className="font-semibold text-neutral-950">推荐理由：</span>
                说明它影响模型、产品、开源、商业或基础设施的哪一类判断。
              </p>
              <p>
                <span className="font-semibold text-neutral-950">时效信息：</span>
                标注发布时间、更新日期或是否仍需继续观察。
              </p>
            </div>
          </aside>
        </Container>
      </section>
    </main>
  );
}
