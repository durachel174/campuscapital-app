"use client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { TuitionInflation } from "@/lib/api";

export function NationalComparisonChart({ data }: { data: TuitionInflation["national_comparison"] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis domain={[95, 145]} tickFormatter={(v) => `${v}`} tick={{ fontSize: 11 }} label={{ value: "Index (2012=100)", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip formatter={(v) => typeof v === "number" ? v.toFixed(1) : v} />
        <Legend />
        <Line type="monotone" dataKey="public_tuition_index" name="Public Tuition" stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="cpi_all_index" name="CPI (All Items)" stroke="#9ca3af" strokeWidth={2} dot={false} strokeDasharray="5 3" />
        <Line type="monotone" dataKey="cpi_tuition_index" name="CPI (College Tuition)" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StickerVsNetChart({ data }: { data: TuitionInflation["sticker_vs_net"] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => typeof v === "number" ? `$${v.toLocaleString()}` : v} />
        <Legend />
        <Line type="monotone" dataKey="public_sticker" name="Public Sticker" stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="public_net" name="Public Net" stroke="#6366f1" strokeWidth={2} dot={false} strokeDasharray="5 3" />
        <Line type="monotone" dataKey="private_sticker" name="Private Sticker" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="private_net" name="Private Net" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function IncomeBracketsChart({ data }: { data: TuitionInflation["income_brackets"] }) {
  const brackets = ["$0–30k", "$30–48k", "$48–75k", "$75–110k", "$110k+"];
  const colors = ["#10b981", "#6366f1", "#f59e0b", "#f97316", "#ef4444"];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => typeof v === "number" ? `$${v.toLocaleString()}` : v} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {brackets.map((b, i) => (
          <Line key={b} type="monotone" dataKey={b} stroke={colors[i]} strokeWidth={1.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RealCostBarChart({ data }: { data: TuitionInflation["real_cost_change"] }) {
  const top20 = data.slice(0, 20);
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={top20} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 120 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
        <YAxis dataKey="alias" type="category" tick={{ fontSize: 10 }} width={110} />
        <Tooltip formatter={(v) => typeof v === "number" ? `${v.toFixed(1)}%` : v} />
        <Bar dataKey="real_change_pct" name="Real Tuition Change" fill="#6366f1"
          radius={[0, 3, 3, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
