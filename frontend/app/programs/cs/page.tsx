export const dynamic = "force-dynamic";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { ArchetypeTag } from "@/components/ui/ArchetypeTag";
import { CsNationalTrendChart, CsUniversityChart } from "@/components/charts/CsTrendsChart";
import { fmt } from "@/lib/format";

export default async function CsTrendsPage() {
  const data = await api.csTrends();

  const national = data.national_trend;
  const peak = national.reduce((a, b) => (b.completions > a.completions ? b : a), national[0]);
  const latest = national[national.length - 1];
  const pctFromPeak = ((latest.completions / peak.completions - 1) * 100).toFixed(1);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CS Enrollment: Boom / Bust</h1>
        <p className="mt-1 text-sm text-gray-500">
          Computer science completion trends 2012–2023 across 49 target universities, overlaid with tech labor market signals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="2012 Completions" value={fmt.number(national[0]?.completions)} sub="baseline year" />
        <StatCard label="Peak Year" value={peak.year.toString()} sub={`${fmt.number(peak.completions)} completions`} accent="indigo" />
        <StatCard label="2023 Completions" value={fmt.number(latest?.completions)} sub="latest year" />
        <StatCard
          label="From Peak"
          value={`${pctFromPeak}%`}
          sub="2023 vs peak"
          accent={parseFloat(pctFromPeak) < 0 ? "red" : "green"}
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold">National CS Completions vs Software Dev Wages</h2>
        <p className="mb-4 text-xs text-gray-500">
          CS enrollment tracked the tech hiring wave through 2019, then stalled. Post-2022 layoffs accelerated the softening. Wage data: BLS OEWS Series 15-1252.
        </p>
        <CsNationalTrendChart data={data.national_trend} labor={data.labor_overlay} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold">CS Completions by University (Top 10 by Volume)</h2>
        <p className="mb-4 text-xs text-gray-500">
          Large public flagships dominate raw CS completion counts. Expansion Players show steeper growth curves and more pronounced post-peak softening.
        </p>
        <CsUniversityChart schools={data.by_university} />
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold">Most Overexposed: Largest Boom, Sharpest Reversal</h2>
        <p className="mb-3 text-xs text-gray-500">
          Exposure score = boom % − (bust % × 2). Schools that over-expanded CS capacity face the greatest mismatch risk as employer demand softens.
        </p>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Archetype</th>
                <th className="px-4 py-3 text-right">Boom (2012→2019)</th>
                <th className="px-4 py-3 text-right">Bust (2019→2023)</th>
                <th className="px-4 py-3 text-right">Exposure Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.overexposed.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.alias || u.name}</td>
                  <td className="px-4 py-3"><ArchetypeTag archetype={u.archetype} /></td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-600">+{u.boom_pct}%</td>
                  <td className="px-4 py-3 text-right font-mono text-red-600">{u.bust_pct}%</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{u.exposure_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold">All Universities — CS Enrollment Timeline</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Archetype</th>
                <th className="px-4 py-3 text-right">2012</th>
                <th className="px-4 py-3 text-right">2019</th>
                <th className="px-4 py-3 text-right">2023</th>
                <th className="px-4 py-3 text-right">Peak</th>
                <th className="px-4 py-3 text-right">From Peak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.by_university.map((u) => {
                const byYear = Object.fromEntries(u.data.map((d) => [d.year, d.completions]));
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-indigo-700">{u.alias || u.name}</td>
                    <td className="px-4 py-3"><ArchetypeTag archetype={u.archetype} /></td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600">{fmt.number(byYear[2012])}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600">{fmt.number(byYear[2019])}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600">{fmt.number(byYear[2023])}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-500">{u.peak_year}</td>
                    <td className={`px-4 py-3 text-right font-mono ${(u.change_from_peak_pct || 0) < 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {u.change_from_peak_pct != null ? `${u.change_from_peak_pct > 0 ? "+" : ""}${u.change_from_peak_pct}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
