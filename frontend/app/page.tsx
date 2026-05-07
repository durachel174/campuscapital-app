import Link from "next/link";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { ArchetypeTag } from "@/components/ui/ArchetypeTag";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { fmt } from "@/lib/format";

export default async function OverviewPage() {
  const [unis, health, cs, ai, tuition] = await Promise.all([
    api.universities(),
    api.healthScores(),
    api.csTrends(),
    api.aiExpansion(),
    api.tuitionInflation(),
  ]);

  const totalEnroll = unis.reduce((s, u) => s + (u.total_enrollment || 0), 0);
  const avgScore = health.scored_universities.reduce((s, u) => s + (u.composite_score || 0), 0) / health.scored_universities.length;
  const csStart = cs.national_trend[0]?.completions || 1;
  const csEnd = cs.national_trend[cs.national_trend.length - 1]?.completions || 1;
  const csGrowth = ((csEnd / csStart - 1) * 100).toFixed(0);
  const highRisk = health.high_risk_schools.length;

  const caseStudies = [
    {
      href: "/programs/cs",
      title: "CS Enrollment Boom / Bust",
      desc: "Track CS completions 2012–2023 by school, overlaid with tech hiring cycles and post-layoff demand softening.",
      stat: `+${csGrowth}% peak growth`,
      color: "border-indigo-400",
    },
    {
      href: "/programs/ai",
      title: "AI Master's Program Expansion",
      desc: `${ai.by_university.length} schools now offer AI/ML master's programs. Examine when they launched, enrollment velocity, and tuition premiums.`,
      stat: `${ai.by_university.length} programs tracked`,
      color: "border-amber-400",
    },
    {
      href: "/tuition",
      title: "Tuition vs Inflation",
      desc: `${tuition.beat_inflation_count} of ${tuition.total_schools} schools beat CPI over the last decade. See who's pricing aggressively and where aid closes the gap.`,
      stat: `${tuition.beat_inflation_count}/${tuition.total_schools} beat CPI`,
      color: "border-emerald-400",
    },
    {
      href: "/universities",
      title: "University Financial Health",
      desc: "Composite scores from tuition dependence, endowment per student, enrollment trend, and revenue concentration.",
      stat: `${highRisk} high-risk schools`,
      color: "border-red-400",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Higher Education Market Intelligence</h1>
        <p className="mt-1 text-sm text-gray-500">
          49 universities analyzed as business entities. Data sources: IPEDS, College Scorecard, BLS.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Universities Tracked" value={fmt.number(unis.length)} sub="50-school target set" accent="indigo" />
        <StatCard label="Total Enrollment" value={fmt.compact(totalEnroll)} sub="students across all schools" />
        <StatCard label="Avg Health Score" value={fmt.score(avgScore)} sub="composite 0–100" accent="green" />
        <StatCard label="High-Risk Schools" value={highRisk} sub="3+ elevated risk flags" accent="red" />
      </div>

      <div>
        <h2 className="mb-4 text-base font-semibold">Four Case Studies</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {caseStudies.map((cs) => (
            <Link key={cs.href} href={cs.href}
              className={`group rounded-lg border-l-4 ${cs.color} bg-white p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700">{cs.title}</h3>
                <span className="ml-3 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-600">{cs.stat}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{cs.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Archetype Distribution</h2>
          <Link href="/universities" className="text-xs text-indigo-600 hover:underline">View all →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {health.archetype_distribution.map((a) => (
            <div key={a.archetype} className="rounded-lg bg-white p-4 shadow-sm">
              <ArchetypeTag archetype={a.archetype} />
              <p className="mt-2 text-2xl font-mono font-semibold">{a.count}</p>
              <p className="text-xs text-gray-500">Avg score: {fmt.score(a.avg_score)}</p>
              <p className="text-xs text-gray-500">Tuition dep: {fmt.pct(a.avg_tuition_dependence)}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">Top Institutions by Health Score</h2>
          <Link href="/universities" className="text-xs text-indigo-600 hover:underline">View all →</Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Archetype</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Tuition Dep.</th>
                <th className="px-4 py-3 text-right">Endow./Student</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {health.scored_universities.slice(0, 10).map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
