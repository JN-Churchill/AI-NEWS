import { Cpu, GitMerge, Scale, Sparkles } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { HEAT_DIMENSIONS } from "@/types/schema";

export const metadata = {
  title: "评分方法",
  description: "AI 日报的热度指数如何计算：六维规则化评分，公开透明、可解释、不依赖黑盒模型。",
};

const PRINCIPLES = [
  {
    icon: Scale,
    title: "规则透明",
    desc: "热度完全由公开规则计算，逐条可解释，不依赖任何黑盒模型，也不产生额外 API 成本。",
  },
  {
    icon: GitMerge,
    title: "跨源验证",
    desc: "同一事件被多个独立来源报道时会获得加成，单一来源的孤证不会因为标题耸动而排到前面。",
  },
  {
    icon: Cpu,
    title: "自动运行",
    desc: "每天定时抓取、去重、打分、生成并发布，全流程无需人工干预，历史数据以 Git 版本留存。",
  },
  {
    icon: Sparkles,
    title: "持续迭代",
    desc: "评分权重与来源清单都在仓库中公开，可随行业变化随时调整并留下完整变更记录。",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-4">
      <section className="pt-8">
        <h1 className="text-[clamp(26px,4.4vw,38px)] font-extrabold leading-tight tracking-[-0.02em]">
          热度指数<span className="gradient-text">怎么算的</span>
        </h1>
        <p className="mt-3 max-w-[680px] text-[14.5px] leading-relaxed text-[var(--color-ink-2)]">
          每条热点都会被赋予一个 0-100 的热度分。它由六个维度加权求和得出，总分封顶 100
          分。之所以不用大模型打分，是因为规则可以完整公开、逐条复核，而且不产生任何调用成本。
        </p>
      </section>

      <Reveal>
        <section className="glass-strong mt-8 overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/8 px-6 py-3.5 text-[12.5px] font-semibold text-[var(--color-ink-3)]">
            <span>维度</span>
            <span>满分</span>
          </div>
          {HEAT_DIMENSIONS.map((dimension) => (
            <div
              key={dimension.key}
              className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/5 px-6 py-4 last:border-0"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[15px] font-bold">{dimension.name}</span>
                  <span className="chip !px-2 !py-0.5 !text-[11px]">{dimension.max} 分</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-2)]">{dimension.desc}</p>
              </div>
              <div className="hidden w-[120px] sm:block">
                <div className="heat-track">
                  <div className="heat-fill" style={{ width: `${(dimension.max / 30) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </section>
      </Reveal>

      <section className="mt-12">
        <h2 className="text-[19px] font-bold tracking-[-0.01em]">计算方式</h2>
        <div className="glass mt-4 p-6">
          <code className="block font-mono text-[13.5px] leading-relaxed text-[var(--color-brand-1)]">
            热度 = 实用性 + 新颖度 + 影响力 + 可信度 + 受众广度 + 时效 + 跨源加成
          </code>
          <ul className="mt-4 space-y-2 text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
            <li>· 可信度直接由来源权威度映射：权威度 95 的官方来源可得 14.25 分。</li>
            <li>· 时效按发布时间衰减：24 小时内满分 5 分，超过一周仅 1 分。</li>
            <li>· 跨源加成：每多一个独立报道来源加 5 分，最多 10 分。</li>
            <li>· 去重规则：URL 规范化后精确合并，再按标题相似度 0.82 阈值聚类。</li>
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[19px] font-bold tracking-[-0.01em]">设计原则</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {PRINCIPLES.map((principle, index) => (
            <Reveal key={principle.title} delay={index * 60}>
              <div className="card h-full p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-1)] to-[var(--color-brand-3)] text-[#05121a]">
                  <principle.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3.5 text-[15.5px] font-bold">{principle.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">{principle.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
