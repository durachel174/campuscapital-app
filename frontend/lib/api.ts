const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function get<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 300 } });
  } catch (e) {
    throw new Error(`Could not reach API at ${url} — is NEXT_PUBLIC_API_URL set correctly? (${e})`);
  }
  if (!res.ok) throw new Error(`API returned ${res.status} for ${url}`);
  return res.json();
}

export type University = {
  id: number;
  unit_id: number;
  name: string;
  alias: string;
  state: string;
  city: string;
  control: string;
  archetype: string;
  composite_score: number;
  tuition_dependence_pct: number;
  endowment_per_student: number;
  international_student_pct: number;
  net_tuition_growth_rate: number;
  enrollment_trend_pct: number;
  archetype_rationale: string;
  total_revenue: number;
  tuition_revenue: number;
  endowment_total: number;
  total_enrollment: number;
  avg_net_price_2023: number;
  median_earnings_10yr: number;
  median_debt: number;
  completion_rate: number;
};

export type UniversityDetail = University & {
  tuition_history: TuitionYear[];
  financials_history: FinancialsYear[];
  cs_timeline: CsTimelinePoint[];
  programs: Program[];
};

export type TuitionYear = {
  year: number;
  published_in_state: number | null;
  published_out_state: number | null;
  avg_net_price: number | null;
  net_price_0_30k: number | null;
  net_price_30_48k: number | null;
  net_price_48_75k: number | null;
  net_price_75_110k: number | null;
  net_price_110k_plus: number | null;
};

export type FinancialsYear = {
  year: number;
  total_revenue: number;
  tuition_revenue: number;
  endowment_assets: number;
  total_enrollment: number;
  tuition_dependence_pct: number;
};

export type CsTimelinePoint = { year: number; enrolled: number; award_level: string };
export type Program = { cip_code: string; name: string; award_level: string; is_cs: boolean; is_ai_ml: boolean; year_established: number | null };

export type CsTrends = {
  national_trend: { year: number; completions: number }[];
  by_university: {
    id: number; name: string; alias: string; state: string; archetype: string; control: string;
    data: { year: number; completions: number }[];
    peak_year: number; peak_completions: number; latest_completions: number; change_from_peak_pct: number;
  }[];
  labor_overlay: { year: number; median_wage: number }[];
  overexposed: { id: number; name: string; alias: string; archetype: string; boom_pct: number; bust_pct: number; exposure_score: number }[];
};

export type AiExpansion = {
  launch_timeline: { year: number; new_programs: number; cumulative: number }[];
  enrollment_growth: { year: number; enrolled: number }[];
  tuition_comparison: { year: number; ai_masters_avg: number | null; cs_masters_avg: number | null; undergrad_avg: number | null }[];
  monetization_flags: { id: number; name: string; alias: string; archetype: string; tuition_premium_pct: number; ai_tuition_2023: number; avg_net_price_2023: number; launch_year: number }[];
  by_university: { id: number; name: string; alias: string; archetype: string; launch_year: number; enrollment_2023: number; enrollment_cagr_pct: number; tuition_premium_pct: number }[];
};

export type TuitionInflation = {
  national_comparison: { year: number; public_tuition_index: number | null; private_tuition_index: number | null; cpi_all_index: number | null; cpi_tuition_index: number | null; public_tuition_abs: number | null; private_tuition_abs: number | null }[];
  sticker_vs_net: { year: number; public_sticker: number | null; public_net: number | null; private_sticker: number | null; private_net: number | null; public_discount_pct: number | null; private_discount_pct: number | null }[];
  real_cost_change: { id: number; name: string; alias: string; state: string; archetype: string; control: string; tuition_2012: number; tuition_2023: number; nominal_change_pct: number; real_change_pct: number; beat_inflation: boolean }[];
  income_brackets: Record<string, number | null>[];
  beat_inflation_count: number;
  total_schools: number;
};

export type HealthScores = {
  scored_universities: (University & { risk_flags: string[]; risk_count: number })[];
  archetype_distribution: { archetype: string; count: number; avg_score: number; avg_tuition_dependence: number; avg_endowment_per_student: number }[];
  risk_flags_summary: { flag: string; count: number }[];
  metric_scatter: { id: number; name: string; archetype: string; x: number; y: number; size: number; score: number }[];
  score_histogram: { range: string; count: number }[];
  high_risk_schools: University[];
};

export const api = {
  universities: () => get<University[]>("/universities/"),
  university: (id: number) => get<UniversityDetail>(`/universities/${id}`),
  csTrends: () => get<CsTrends>("/programs/cs/trends"),
  aiExpansion: () => get<AiExpansion>("/programs/ai/expansion"),
  tuitionInflation: () => get<TuitionInflation>("/tuition/inflation"),
  healthScores: () => get<HealthScores>("/scores/health"),
};
