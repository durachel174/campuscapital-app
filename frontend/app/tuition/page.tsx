export const dynamic = "force-dynamic";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { ArchetypeTag } from "@/components/ui/ArchetypeTag";
import { fmt } from "@/lib/format";
import { NationalComparisonChart, StickerVsNetChart, IncomeBracketsChart, RealCostBarChart } from "@/components/charts/TuitionCharts";
import Link from "next/link";

export default async function TuitionPage() {
  const data = await api.tuitionInflation();

  const base2012 = data.national_comparison[0];
  const latest = data.national_comparison[data.national_comparison.length - 1];
  const publicGrowth = base2012?.public_tuition_abs && latest?.public_tuition_abs
    ? ((latest.public_tuition_abs / base2012.public_tuition_abs - 1) * 100).toFixed(1) : "N/A";
  const cpiGrowth = base2012?.cpi_all_index && latest?.cpi_all_index
    ? (latest.cpi_all_index - 100).toFixed(1) : "N/A";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tuition vs Inflation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Higher education price dynamics 2012–2023. Published tuition vs CPI benchmarks, net price evolution, and real cost change by institution.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Public Tuition Growth" value={`+${publicGrowth}%`} sub="2012–2023 nominal" accent="red" />
        <StatCard label="CPI Growth Same Period" value={`+${cpiGrowth}%`} sub="all items baseline" />
        <StatCard label="Beat Inflation" value={`${data.beat_inflation_count}/${data.total_schools}`} sub="schools in real terms" accent="amber" />
        <StatCard label="Tuition Index 2023" value={fmt.score(latest?.public_tuition_index)} sub="2012 = 100" accent="indigo" />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold">Tuition Growth vs CPI (Indexed: 2012 = 100)</h2>
        <p className="mb-4 text-xs text-gray-500">
          Public university tuition has consistently outpaced general inflation. The gap narrowed temporarily during 2020 (COVID enrollment pressures) but resumed post-2021.
        </p>
        <NationalComparisonChart data={data.national_comparison} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold">Sticker Price vs Net Price — The Discount Gap</h2>
        <p className="mb-4 text-xs text-gray-500">
          Published (sticker) tuition is a marketing number. Net price — what families actually pay after institutional aid — tells the real story. Private schools discount most aggressively to close selectivity gaps.
        </p>
        <StickerVsNetChart data={data.sticker_vs_net} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold">Net Price by Family Income Bracket</h2>
        <p className="mb-4 text-xs text-gray-500">
          Low-income families see the most aid. Upper-middle-income families ($75–110k) face the steepest real burden — too wealthy for grants, too modest for sticker-insensitivity.
        </p>
        <IncomeBracketsChart data={data.income_brackets} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-1 text-sm font-semibold">Real Tuition Change 2012–2023 (Top 20 Schools)</h2>
        <p className="mb-4 text-xs text-gray-500">
          Inflation-adjusted change in published tuition. Positive = the school raised tuition faster than CPI. Schools in this range extracted real purchasing power from students and families.
        </p>
        <RealCostBarChart data={data.real_cost_change} />
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold">Real Tuition Change — All Schools</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left">Archetype</th>
                <th className="px-4 py-3 text-right">2012</th>
                <th className="px-4 py-3 text-right">2023</th>
                <th className="px-4 py-3 text-right">Nominal Δ</th>
                <th className="px-4 py-3 text-right">Real Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.real_cost_change.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/universities/${u.id}`} className="font-medium text-indigo-700 hover:underline">
                      {u.alias || u.name}
                    </Link>
                    <span className="ml-2 text-xs text-gray-400">{u.state}</span>
                  </td>
                  <td className="px-4 py-3"><ArchetypeTag archetype={u.archetype} /></td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{fmt.currency(u.tuition_2012)}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">{fmt.currency(u.tuition_2023)}</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-600">+{u.nominal_change_pct}%</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${u.beat_inflation ? "text-red-600" : "text-emerald-600"}`}>
                    {u.real_change_pct > 0 ? "+" : ""}{u.real_change_pct}%
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
