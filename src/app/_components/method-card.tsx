type MethodCardProps = {
  label: string;
  value: number;
  description: string;
};

export function MethodCard({ label, value, description }: MethodCardProps) {
  return (
    <div className="surface-panel card-hover flex items-start justify-between gap-4 p-5">
      <div className="min-w-0">
        <h3
          className="font-editorial text-[1.15rem] font-normal leading-[1.2] tracking-[-0.01em]"
          style={{ color: "var(--ink)" }}
        >
          {label}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: "var(--muted)" }}>
          {description}
        </p>
        <div
          className="mt-3 h-1.5 w-48 max-w-full overflow-hidden rounded-full"
          style={{ background: "var(--line)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(value, 100)}%`, background: "var(--ink)" }}
          />
        </div>
      </div>
      <span
        className="shrink-0 font-mono text-[1.35rem] font-semibold tracking-[-0.02em]"
        style={{ color: "var(--ink)" }}
      >
        {value}
      </span>
    </div>
  );
}
