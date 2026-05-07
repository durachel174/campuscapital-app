"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { CsTrends } from "@/lib/api";

export function CsNationalTrendChart({ data, labor }: { data: CsTrends["national_trend"]; labor: CsTrends["labor_overlay"] }) {
  const combined = data.map((d) => ({
    year: d.year,
    completions: d.completions,
    wage: labor.find((l) => l.year === d.year)?.median_wage,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={combined} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v, name) => [
          typeof v === "number" ? (name === "completions" ? v.toLocaleString() : `$${v.toLocaleString()}`) : v,
          name === "completions" ? "CS Completions" : "Median Wage (SW Dev)"
        ]} />
        <Legend />
        <ReferenceLine yAxisId="left" x={2022} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "Layoffs", fontSize: 10, fill: "#ef4444" }} />
        <Line yAxisId="left" type="monotone" dataKey="completions" name="CS Completions" stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="wage" name="SW Dev Wage" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CsUniversityChart({ schools }: { schools: CsTrends["by_university"] }) {
  const top10 = schools.slice(0, 10);
  const colors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#14b8a6"];

  const years = Array.from(new Set(top10.flatMap((u) => u.data.map((d) => d.year)))).sort();
  const combined = years.map((yr) => {
    const row: Record<string, number | string> = { year: yr };
    top10.forEach((u) => {
      const pt = u.data.find((d) => d.year === yr);
      row[u.alias || u.name] = pt?.completions || 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={combined} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${v}`} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {top10.map((u, i) => (
          <Line
            key={u.id} type="monotone"
            dataKey={u.alias || u.name}
            stroke={colors[i % colors.length]}
            strokeWidth={1.5} dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
