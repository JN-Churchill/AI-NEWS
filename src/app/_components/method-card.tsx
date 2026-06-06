import { ScoreMeter } from "@/app/_components/score-meter";

type MethodCardProps = {
  label: string;
  value: number;
  description: string;
};

export function MethodCard({ label, value, description }: MethodCardProps) {
  return (
    <div className="editorial-card flex items-start justify-between gap-6 rounded-md p-5">
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-neutral-950">{label}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
        <div className="mt-4 w-48 max-w-full">
          <ScoreMeter score={value} tone="mono" />
        </div>
      </div>
      <span className="shrink-0 rounded-md bg-neutral-950 px-2.5 py-1 text-sm font-semibold text-white">
        {value}%
      </span>
    </div>
  );
}
