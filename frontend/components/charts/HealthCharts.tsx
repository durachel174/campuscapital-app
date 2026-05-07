"use client";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import type { HealthScores } from "@/lib/api";
import { ARCHETYPE_COLOR } from "@/lib/format";

export function ArchetypeScatterChart({ data }: { data: HealthScores["metric_scatter"] }) {
  const archetypes = ["Prestige Fortress", "Expansion Player", "Regional Value", "Tuition Dependent"];
  return (
    <ResponsiveContainer width="100%" height={380}>
      <ScatterChart margin={{ top: 4, right: 24, bottom: 24, left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="x" type="number" name="Tuition Dependence (%)"
          label={{ value: "Tuition Dependence (%)", position: "insideBottom", offset: -15, fontSize: 11 }}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          dataKey="y" type="number" name="Endowment / Student ($)"
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          label={{ value: "Endowment / Student", angle: -90, position: "insideLeft", fontSize: 11 }}
          tick={{ fontSize: 10 }}
        />
        <ZAxis dataKey="size" range={[40, 400]} name="Enrollment" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded border border-gray-200 bg-white p-2 text-xs shadow">
                <p className="font-semibold">{d.name}</p>
                <p>Tuition dep: {d.x?.toFixed(1)}%</p>
                <p>Endow/student: ${d.y?.toLocaleString()}</p>
                <p>Score: {d.score?.toFixed(1)}</p>
              </div>
            );
          }}
        />
        <Legend />
        {archetypes.map((arch) => (
          <Scatter
            key={arch} name={arch}
            data={data.filter((d) => d.archetype === arch)}
            fill={ARCHETYPE_COLOR[arch]}
            fillOpacity={0.7}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function ScoreHistogram({ data }: { data: HealthScores["score_histogram"] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="range" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="count" name="Schools" fill="#6366f1" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
