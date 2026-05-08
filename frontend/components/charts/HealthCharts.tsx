"use client";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import type { HealthScores } from "@/lib/api";
import { ARCHETYPE_COLOR } from "@/lib/format";

const ARCHETYPES = ["Prestige Fortress", "Expansion Player", "Regional Value", "Tuition Dependent"];

export function ArchetypeScatterChart({ data }: { data: HealthScores["metric_scatter"] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 8, right: 24, bottom: 32, left: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="x"
            type="number"
            name="Tuition Dependence (%)"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Tuition Dependence (%)", position: "insideBottom", offset: -16, fontSize: 11, fill: "#6b7280" }}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name="Endowment / Student ($)"
            scale="log"
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
            label={{ value: "Endowment / Student", angle: -90, position: "insideLeft", offset: -30, fontSize: 11, fill: "#6b7280" }}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            allowDataOverflow={false}
          />
          <ZAxis dataKey="size" range={[40, 360]} name="Enrollment" />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
                  <p className="mb-1 font-semibold text-gray-800">{d.name}</p>
                  <div className="space-y-0.5 text-gray-600">
                    <p>Tuition dependence: <span className="font-mono font-medium">{d.x?.toFixed(1)}%</span></p>
                    <p>Endow / student: <span className="font-mono font-medium">${d.y?.toLocaleString()}</span></p>
                    <p>Enrollment: <span className="font-mono font-medium">{d.size?.toLocaleString()}</span></p>
                    <p>Health score: <span className="font-mono font-medium">{d.score?.toFixed(1)}</span></p>
                  </div>
                </div>
              );
            }}
          />
          {ARCHETYPES.map((arch) => (
            <Scatter
              key={arch}
              name={arch}
              data={data.filter((d) => d.archetype === arch)}
              fill={ARCHETYPE_COLOR[arch]}
              fillOpacity={0.75}
              stroke={ARCHETYPE_COLOR[arch]}
              strokeWidth={0.5}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      {/* HTML legend — lives outside the SVG so it can never overlap the axis label */}
      <div className="mt-3 flex flex-wrap justify-center gap-4">
        {ARCHETYPES.map((arch) => (
          <div key={arch} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: ARCHETYPE_COLOR[arch] }}
            />
            {arch}
          </div>
        ))}
      </div>
    </div>
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
