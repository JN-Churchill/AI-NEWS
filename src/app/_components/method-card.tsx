import { ScoreMeter } from "@/app/_components/score-meter";

type MethodCardProps = {
  label: string;
  value: number;
  description: string;
};

export function MethodCard({ label, value, description }: MethodCardProps) {
  return (
    <div className="flex items-start justify-between gap-6 py-5">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-neutral-950">{label}</h3>
        <p className="mt-1.5 text-sm leading-6 text-neutral-500">{description}</p>
        <div className="mt-3 w-48">
          <ScoreMeter score={value} tone="mono" />
        </div>
      </div>
      <span className="shrink-0 rounded bg-neutral-950 px-2.5 py-1 text-sm font-semibold text-white">
        {value}%
      </span>
    </div>
  );
}
