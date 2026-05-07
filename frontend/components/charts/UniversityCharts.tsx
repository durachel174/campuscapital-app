"use client";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import type { UniversityDetail } from "@/lib/api";

export function TuitionHistoryChart({ data }: { data: UniversityDetail["tuition_history"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => typeof v === "number" ? `$${v.toLocaleString()}` : v} />
        <Legend />
        <Line type="monotone" dataKey="published_in_state" name="In-State" stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="avg_net_price" name="Net Price" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 3" />
        <Line type="monotone" dataKey="published_out_state" name="Out-of-State" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function FinancialsChart({ data }: { data: UniversityDetail["financials_history"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1e9).toFixed(1)}B`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => typeof v === "number" ? `$${(v / 1e6).toFixed(0)}M` : v} />
        <Legend />
        <Area type="monotone" dataKey="total_revenue" name="Total Revenue" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
        <Area type="monotone" dataKey="tuition_revenue" name="Tuition Revenue" stroke="#f59e0b" fill="#fef3c7" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CsTimelineChart({ data }: { data: UniversityDetail["cs_timeline"] }) {
  const bs = data.filter((d) => d.award_level === "3");
  const ms = data.filter((d) => d.award_level === "5");
  const years = Array.from(new Set(data.map((d) => d.year))).sort();
  const combined = years.map((yr) => ({
    year: yr,
    bachelor: bs.find((d) => d.year === yr)?.enrolled,
    master: ms.find((d) => d.year === yr)?.enrolled,
  }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={combined} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="bachelor" name="Bachelor's" fill="#6366f1" stackId="a" />
        <Bar dataKey="master" name="Master's" fill="#a5b4fc" stackId="a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TuitionDependenceChart({ data }: { data: UniversityDetail["financials_history"] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
        <Tooltip formatter={(v) => typeof v === "number" ? `${v.toFixed(1)}%` : v} />
        <Line type="monotone" dataKey="tuition_dependence_pct" name="Tuition Dep. %" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
