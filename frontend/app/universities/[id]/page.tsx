export const dynamic = "force-dynamic";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { ArchetypeTag } from "@/components/ui/ArchetypeTag";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { fmt } from "@/lib/format";
import {
  TuitionHistoryChart, FinancialsChart,
  CsTimelineChart, TuitionDependenceChart,
} from "@/components/charts/UniversityCharts";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function UniversityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let uni;
  try {
    uni = await api.university(Number(id));
  } catch {
    notFound();
  }

  const AWARD_LABELS: Record<string, string> = { "3": "Bachelor's", "5": "Master's", "7": "Doctoral", "17": "Doctoral" };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/universities" className="text-xs text-indigo-600 hover:underline">← All Universities</Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{uni.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {uni.city}, {uni.state} · {uni.control} · {uni.unit_id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ArchetypeTag archetype={uni.archetype} />
          <ScoreBadge score={uni.composite_score} />
        </div>
      </div>

      {uni.archetype_rationale && (
        <div className="rounded-lg border-l-4 border-indigo-400 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
          {uni.archetype_rationale}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Health Score" value={fmt.score(uni.composite_score)} sub="composite 0–100"
          accent={uni.composite_score >= 70 ? "green" : uni.composite_score >= 50 ? "amber" : "red"} />
        <StatCard label="Tuition Dependence" value={fmt.pct(uni.tuition_dependence_pct)} sub="of total revenue"
          accent={(uni.tuition_dependence_pct || 0) > 60 ? "red" : "amber"} />
        <StatCard label="Endowment / Student" value={fmt.currency(uni.endowment_per_student)} sub="2022" />
        <StatCard label="Total Enrollment" value={fmt.number(uni.total_enrollment)} sub="headcount 2022" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Avg Net Price" value={fmt.currency(uni.avg_net_price_2023)} sub="2023" />
        <StatCard label="Median Earnings (10yr)" value={fmt.currency(uni.median_earnings_10yr)} sub="after entry" />
        <StatCard label="Median Debt" value={fmt.currency(uni.median_debt)} sub="completers" />
        <StatCard label="Completion Rate" value={fmt.pct((uni.completion_rate || 0) * 100)} sub="4-year" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold">Tuition History (2012–2023)</h2>
          <p className="mb-4 text-xs text-gray-500">Published tuition vs average net price after aid.</p>
          <TuitionHistoryChart data={uni.tuition_history} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold">Revenue Composition</h2>
          <p className="mb-4 text-xs text-gray-500">Total revenue and tuition revenue share over time.</p>
          <FinancialsChart data={uni.financials_history} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold">CS Program Completions</h2>
          <p className="mb-4 text-xs text-gray-500">Bachelor's and master's completions by year.</p>
          {uni.cs_timeline.length > 0 ? <CsTimelineChart data={uni.cs_timeline} /> : <p className="text-xs text-gray-400">No CS enrollment data available.</p>}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold">Tuition Dependence Trend</h2>
          <p className="mb-4 text-xs text-gray-500">Tuition revenue as % of total revenue. High values = enrollment shock vulnerability.</p>
          <TuitionDependenceChart data={uni.financials_history} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Financial Indicators</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Revenue" value={fmt.compact(uni.total_revenue)} sub="2022" />
          <StatCard label="Tuition Revenue" value={fmt.compact(uni.tuition_revenue)} sub="2022" />
          <StatCard label="Endowment Total" value={fmt.compact(uni.endowment_total)} sub="2022" />
          <StatCard label="Intl. Students" value={fmt.pct(uni.international_student_pct)} sub="% of enrollment"
            accent={(uni.international_student_pct || 0) > 20 ? "amber" : undefined} />
          <StatCard label="Enrollment Trend" value={fmt.pct(uni.enrollment_trend_pct)} sub="5-year change"
            accent={(uni.enrollment_trend_pct || 0) < -2 ? "red" : "green"} />
          <StatCard label="Net Tuition CAGR" value={fmt.pct(uni.net_tuition_growth_rate)} sub="5-year"
            accent={(uni.net_tuition_growth_rate || 0) > 5 ? "red" : "amber"} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Programs</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Program</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-left">CIP</th>
                <th className="px-4 py-3 text-center">CS</th>
                <th className="px-4 py-3 text-center">AI/ML</th>
                <th className="px-4 py-3 text-right">Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {uni.programs.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{AWARD_LABELS[p.award_level] || p.award_level}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.cip_code}</td>
                  <td className="px-4 py-3 text-center">{p.is_cs ? "✓" : ""}</td>
                  <td className="px-4 py-3 text-center">{p.is_ai_ml ? <span className="text-amber-600 font-semibold">✓</span> : ""}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-500">{p.year_established || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
