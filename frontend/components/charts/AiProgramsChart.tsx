"use client";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { AiExpansion } from "@/lib/api";

export function AiLaunchTimelineChart({ data }: { data: AiExpansion["launch_timeline"] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="new_programs" name="New Programs" fill="#f59e0b" radius={[3, 3, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative" stroke="#6366f1" strokeWidth={2} dot={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AiTuitionComparisonChart({ data }: { data: AiExpansion["tuition_comparison"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => typeof v === "number" ? `$${v.toLocaleString()}` : v} />
        <Legend />
        <Line type="monotone" dataKey="ai_masters_avg" name="AI Master's" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="cs_masters_avg" name="CS Master's" stroke="#6366f1" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="undergrad_avg" name="Undergrad Avg" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 3" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AiEnrollmentGrowthChart({ data }: { data: AiExpansion["enrollment_growth"] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 24, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => typeof v === "number" ? v.toLocaleString() : v} />
        <Bar dataKey="enrolled" name="AI Program Enrollment" fill="#f59e0b" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
