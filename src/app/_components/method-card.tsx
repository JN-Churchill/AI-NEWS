import { ScoreMeter } from "@/app/_components/score-meter";

type MethodCardProps = {
  label: string;
  value: number;
  description: string;
};

export function MethodCard({ label, value, description }: MethodCardProps) {
  return (
    <div className="rounded-md border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-950">{label}</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{description}</p>
        </div>
        <span className="rounded-md bg-neutral-950 px-2.5 py-1 text-sm font-semibold text-white">{value}%</span>
      </div>
      <div className="mt-4">
        <ScoreMeter score={value} tone="mono" />
      </div>
    </div>
  );
}
