import type { CSSProperties, ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function PageHero({ eyebrow, title, description, aside }: PageHeroProps) {
  return (
    <section className="border-b" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
      <div className="mx-auto grid max-w-[1200px] gap-6 px-5 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="reveal-up">
          <p className="section-kicker">{eyebrow}</p>
          <h1
            className="font-editorial mt-4 text-[2rem] font-normal leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]"
            style={{ color: "var(--ink)" }}
          >
            {title}
          </h1>
          <p className="mt-3 max-w-[640px] text-[15px] leading-[1.65]" style={{ color: "var(--muted)" }}>
            {description}
          </p>
        </div>
        {aside ? (
          <aside className="reveal-up" style={{ "--delay": "90ms" } as CSSProperties}>
            {aside}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
