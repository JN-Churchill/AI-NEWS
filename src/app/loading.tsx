import { Container } from "@/app/_components/container";

export default function Loading() {
  return (
    <main>
      <Container className="py-8">
        <div className="grid gap-4 lg:grid-cols-[260px_1fr_320px]">
          <div className="h-72 animate-pulse rounded-md bg-neutral-200" />
          <div className="space-y-4">
            <div className="h-44 animate-pulse rounded-md bg-neutral-200" />
            <div className="h-44 animate-pulse rounded-md bg-neutral-200" />
            <div className="h-44 animate-pulse rounded-md bg-neutral-200" />
          </div>
          <div className="h-72 animate-pulse rounded-md bg-neutral-200" />
        </div>
      </Container>
    </main>
  );
}
