import { Cpu, FileText, Lightbulb, Rocket, TrendingUp } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { ItemCard } from "@/components/item-card";
import type { IssueSection, SectionSlug } from "@/types/schema";

const SECTION_ICONS: Record<SectionSlug, React.ComponentType<{ className?: string }>> = {
  models: Cpu,
  products: Rocket,
  industry: TrendingUp,
  papers: FileText,
  insights: Lightbulb,
};

interface SectionBlockProps {
  section: IssueSection;
  id?: string;
}

export function SectionBlock({ section, id }: SectionBlockProps) {
  const Icon = SECTION_ICONS[section.slug];

  return (
    <section id={id ?? section.slug} className="scroll-mt-[80px] pt-12" aria-label={section.label}>
      <div className="flex items-center gap-3 pb-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-1)] to-[var(--color-brand-3)] text-[#05121a]">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-[19px] font-bold tracking-[-0.01em]">{section.label}</h2>
        <span className="chip shrink-0 font-mono">{section.items.length} 条</span>
        <span className="section-rule ml-2 hidden flex-1 sm:block" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item, index) => (
          <Reveal key={item.id} delay={index * 60}>
            <ItemCard item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
