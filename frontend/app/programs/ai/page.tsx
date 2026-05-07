export const dynamic = "force-dynamic";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { ArchetypeTag } from "@/components/ui/ArchetypeTag";
import { fmt } from "@/lib/format";
import { AiLaunchTimelineChart, AiTuitionComparisonChart, AiEnrollmentGrowthChart } from "@/components/charts/AiProgramsChart";
import Link from "next/link";

export default async function AiProgramsPage() {
  const data = await api.aiExpansion();

  const totalEnroll = data.enrollment_growth[data.enrollment_growth.length - 1]?.enrolled || 0;
  const avgPremium = data.monetization_flags.reduce((s, u) => s + (u.tuition_premium_pct || 0), 0) / (data.monetization_flags.length || 1);
  const latestTuition = data.tuition_comparison[data.tuition_comparison.length - 1];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Master's Program Expansion</h1>
        <p className="mt-1 text-sm text-gray-500">
          Universities monetizing the AI moment: program launches, enrollment velocity, and tuition premiums post-2018.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Schools with AI Programs" value={data.by_university.length} sub="of 49 tracked" accent="amber" />
        <StatCard label="Total AI Enrollment (2023)" value={fmt.number(totalEnroll)} sub="master's level" />
        <StatCard label="Avg Tuition Premium" value={fmt.pct(avgPremium)} sub="AI vs undergrad net price" accent="red" />
        <StatCard label="AI Avg Net Price" value={fmt.currency(latestTuition?.ai_masters_avg)} sub="2023 average" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold">AI Program Launch Timeline</h2>
          <p className="mb-4 text-xs text-gray-500">
            Rapid proliferation 2018–2020 as schools rushed to brand graduate programs around the AI moment. Expansion Players launched fastest; Tuition Dependent schools followed in 2022.
          </p>
          <AiLaunchTimelineChart data={data.launch_timeline} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold">AI Program Enrollment Growth</h2>
          <p className="mb-4 text-xs text-gray-500">
            Aggregate AI/ML master's enrollment across all target schools. Strong growth from near-zero in 2018 reflects both new program launches and demand from the tech sector.
          </p>
          <AiEnrollmentGrowthChart data={data.enrollment_growth} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold">Net Price: AI Master's vs CS Master's vs Undergrad (2018–2023)</h2>
        <p className="mb-4 text-xs text-gray-500">
          AI programs are priced at a significant premium over traditional programs, treating the "AI" brand as justification for higher tuition. The gap has widened since 2020.
        </p>
        <AiTuitionComparisonChart data={data.tuition_comparison} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Highest AI Tuition Premiums — Monetization Watch</h2>
        <p className="mb-3 text-xs text-gray-500">
          Premium = AI master's net price ÷ institution's average undergrad net price. High premiums signal aggressive brand monetization, particularly from Expansion Players.
        </p>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Archetype</th>
                <th className="px-4 py-3 text-right">Launch</th>
                <th className="px-4 py-3 text-right">AI Net Price</th>
                <th className="px-4 py-3 text-right">Avg Net Price</th>
                <th className="px-4 py-3 text-right">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.monetization_flags.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/universities/${u.id}`} className="font-medium text-indigo-700 hover:underline">
                      {u.alias || u.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><ArchetypeTag archetype={u.archetype} /></td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{u.launch_year}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmt.currency(u.ai_tuition_2023)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{fmt.currency(u.avg_net_price_2023)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${(u.tuition_premium_pct || 0) > 40 ? "text-red-600" : "text-amber-600"}`}>
                    +{fmt.pct(u.tuition_premium_pct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold">All AI Programs — University Breakdown</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Archetype</th>
                <th className="px-4 py-3 text-right">Launch</th>
                <th className="px-4 py-3 text-right">Enrollment (2023)</th>
                <th className="px-4 py-3 text-right">CAGR</th>
                <th className="px-4 py-3 text-right">Tuition Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.by_university.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/universities/${u.id}`} className="font-medium text-indigo-700 hover:underline">
                      {u.alias || u.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><ArchetypeTag archetype={u.archetype} /></td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{u.launch_year}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmt.number(u.enrollment_2023)}</td>
                  <td className={`px-4 py-3 text-right font-mono ${(u.enrollment_cagr_pct || 0) > 20 ? "text-emerald-600" : "text-gray-600"}`}>
                    {u.enrollment_cagr_pct != null ? `+${u.enrollment_cagr_pct}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-amber-600">
                    {u.tuition_premium_pct != null ? `+${fmt.pct(u.tuition_premium_pct)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
