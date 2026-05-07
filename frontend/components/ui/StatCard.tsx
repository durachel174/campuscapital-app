export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "red" | "green" | "amber" | "indigo";
}) {
  const colors = {
    red: "border-red-400",
    green: "border-emerald-400",
    amber: "border-amber-400",
    indigo: "border-indigo-400",
  };
  const border = accent ? colors[accent] : "border-gray-200";
  return (
    <div className={`rounded-lg border ${border} border-l-4 bg-white px-4 py-3`}>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900 font-mono">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
