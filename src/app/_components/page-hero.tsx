import { Container } from "@/app/_components/container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, aside }: PageHeroProps) {
  return (
    <section className="border-b border-neutral-900 bg-neutral-950 text-white">
      <Container className="grid gap-6 py-8 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">{eyebrow}</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-300">{description}</p>
        </div>
        {aside && <div className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">{aside}</div>}
      </Container>
    </section>
  );
}
