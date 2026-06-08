import { Container } from "@/app/_components/container";

export default function Loading() {
  return (
    <main>
      <Container className="py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-md bg-neutral-200/80" />
            <div className="h-36 animate-pulse rounded-md bg-neutral-200/80" />
            <div className="h-36 animate-pulse rounded-md bg-neutral-200/80" />
            <div className="h-36 animate-pulse rounded-md bg-neutral-200/80" />
          </div>
          <div className="space-y-4">
            <div className="h-56 animate-pulse rounded-md bg-neutral-200/80" />
            <div className="h-48 animate-pulse rounded-md bg-neutral-200/80" />
          </div>
        </div>
      </Container>
    </main>
  );
}
