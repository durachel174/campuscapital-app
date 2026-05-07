"use client";

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-600 bg-emerald-50";
  if (score >= 50) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

export function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-sm font-mono font-semibold ${scoreColor(score)}`}>
      {score.toFixed(1)}
    </span>
  );
}
