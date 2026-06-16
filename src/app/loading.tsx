export default function Loading() {
  return (
    <main className="mx-auto max-w-[1200px] px-5 py-6 sm:px-6">
      {/* Hero skeleton */}
      <div
        className="mb-6 rounded-xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <div className="h-3 w-24 animate-pulse rounded" style={{ background: "var(--line)" }} />
        <div className="mt-4 h-8 w-3/4 animate-pulse rounded" style={{ background: "var(--line)" }} />
        <div className="mt-3 h-4 w-1/2 animate-pulse rounded" style={{ background: "var(--line)" }} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl p-4"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <div
                className="h-7 w-7 shrink-0 animate-pulse rounded-md"
                style={{ background: "var(--surface-alt)" }}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded" style={{ background: "var(--line)" }} />
                <div className="h-4 w-5/6 animate-pulse rounded" style={{ background: "var(--line)" }} />
                <div className="h-3 w-full animate-pulse rounded" style={{ background: "var(--line)" }} />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden space-y-4 lg:block">
          <div
            className="h-36 animate-pulse rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          />
          <div
            className="h-52 animate-pulse rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          />
        </div>
      </div>
    </main>
  );
}
