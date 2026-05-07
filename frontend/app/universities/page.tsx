import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { ArchetypeTag } from "@/components/ui/ArchetypeTag";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ArchetypeScatterChart, ScoreHistogram } from "@/components/charts/HealthCharts";
import { fmt } from "@/lib/format";
import Link from "next/link";

export default async function UniversitiesPage() {
  const data = await api.healthScores();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">University Financial Health</h1>
        <p className="mt-1 text-sm text-gray-500">
          Composite health scores derived from tuition dependence, endowment buffer, enrollment trend, and revenue concentration.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {data.archetype_distribution.map((a) => (
          <StatCard
            key={a.archetype}
            label={a.archetype}
            value={a.count}
            sub={`Avg score: ${fmt.score(a.avg_score)}`}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold">Endowment per Student vs Tuition Dependence</h2>
          <p className="mb-4 text-xs text-gray-500">
            Bubble size = total enrollment. Schools in the top-left (high endowment, low tuition dependence) have the most structural resilience. Bottom-right is the danger zone.
          </p>
          <ArchetypeScatterChart data={data.metric_scatter} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold">Score Distribution</h2>
          <p className="mb-4 text-xs text-gray-500">Composite health score (0–100) across all 49 target schools.</p>
          <ScoreHistogram data={data.score_histogram} />
          <div className="mt-4 space-y-2">
            {data.risk_flags_summary.slice(0, 5).map((r) => (
              <div key={r.flag} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{r.flag}</span>
                <span className="font-mono font-semibold text-red-600">{r.count} schools</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.high_risk_schools.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-red-700">High-Risk Schools (3+ Risk Flags)</h2>
          <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50">
            <table className="min-w-full divide-y divide-red-100 text-sm">
              <thead className="bg-red-100 text-xs uppercase tracking-wide text-red-600">
                <tr>
                  <th className="px-4 py-3 text-left">Institution</th>
                  <th className="px-4 py-3 text-left">Archetype</th>
                  <th className="px-4 py-3 text-right">Score</th>
                  <th className="px-4 py-3 text-left">Risk Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {data.high_risk_schools.map((u: any) => (
                  <tr key={u.id} className="hover:bg-red-100">
                    <td className="px-4 py-3">
                      <Link href={`/universities/${u.id}`} className="font-medium text-indigo-700 hover:underline">
                        {u.alias || u.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3"><ArchetypeTag archetype={u.archetype} /></td>
                    <td className="px-4 py-3 text-right"><ScoreBadge score={u.composite_score} /></td>
                    <td className="px-4 py-3 text-xs text-red-700">{u.risk_flags?.join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-sm font-semibold">All Universities — Full Ranking</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Archetype</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Tuition Dep.</th>
                <th className="px-4 py-3 text-right">Endow./Student</th>
                <th className="px-4 py-3 text-right">Intl. %</th>
                <th className="px-4 py-3 text-right">Median Earn.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.scored_universities.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/universities/${u.id}`} className="font-medium text-indigo-700 hover:underline">
                      {u.alias || u.name}
                    </Link>
                    <span className="ml-2 text-xs text-gray-400">{u.state}</span>
                  </td>
                  <td className="px-4 py-3"><ArchetypeTag archetype={u.archetype} /></td>
                  <td className="px-4 py-3 text-right"><ScoreBadge score={u.composite_score} /></td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{fmt.pct(u.tuition_dependence_pct)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{fmt.currency(u.endowment_per_student)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{fmt.pct(u.international_student_pct)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">{fmt.currency(u.median_earnings_10yr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
