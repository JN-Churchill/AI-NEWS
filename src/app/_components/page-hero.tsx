import { Container } from "@/app/_components/container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, aside }: PageHeroProps) {
  return (
    <section className="ink-panel border-b border-neutral-950 text-white">
      <Container className="grid gap-6 py-9 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-300">{eyebrow}</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-300">{description}</p>
        </div>
        {aside ? (
          <div className="rounded-md border border-white/15 bg-white/[0.06] p-5 text-neutral-300 backdrop-blur">{aside}</div>
        ) : null}
      </Container>
    </section>
  );
}
