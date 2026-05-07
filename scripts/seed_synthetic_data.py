"""
Seed synthetic but realistic data for all 50 target universities.
Mimics real IPEDS/Scorecard patterns so the analysis layer works
before live API pulls complete.
"""
import sys
import os
import random
import math
from datetime import date
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

random.seed(42)

from api.database import SessionLocal
from api.models import (
    University, Enrollment, Tuition, UniversityFinancials,
    Program, HealthScore, OutcomeData, CPIData, TechEmploymentData
)
from etl.universities_seed import TARGET_UNIVERSITIES

YEARS = list(range(2012, 2024))

# Historical CPI-U (all items) 2012-2023
CPI_HISTORY = {
    2012: 229.6, 2013: 233.0, 2014: 236.7, 2015: 237.0,
    2016: 240.0, 2017: 245.1, 2018: 251.1, 2019: 255.7,
    2020: 258.8, 2021: 270.9, 2022: 292.7, 2023: 304.7,
}
CPI_EDUCATION = {
    2012: 218.0, 2013: 225.0, 2014: 232.0, 2015: 238.5,
    2016: 244.0, 2017: 249.5, 2018: 255.0, 2019: 260.0,
    2020: 263.5, 2021: 266.0, 2022: 272.0, 2023: 278.0,
}
CPI_TUITION = {
    2012: 215.0, 2013: 223.0, 2014: 231.0, 2015: 238.0,
    2016: 245.0, 2017: 252.0, 2018: 259.0, 2019: 265.0,
    2020: 268.0, 2021: 270.0, 2022: 275.0, 2023: 280.0,
}

TECH_WAGES = {
    2012: 92000, 2013: 95000, 2014: 99000, 2015: 105000,
    2016: 110000, 2017: 115000, 2018: 122000, 2019: 127000,
    2020: 132000, 2021: 140000, 2022: 148000, 2023: 143000,
}

ARCHETYPES = {
    "Prestige Fortress": {
        "base_tuition_private": 56000, "base_tuition_public": 14000,
        "tuition_growth": 0.025, "endowment_per_student": 180000,
        "tuition_dependence": 0.18, "base_enrollment": 12000,
        "cs_share_2012": 0.06, "cs_growth_rate": 0.08,
        "intl_pct": 0.24, "completion_rate": 0.95,
        "median_earnings_10yr": 95000, "median_debt": 18000,
    },
    "Expansion Player": {
        "base_tuition_private": 52000, "base_tuition_public": 12000,
        "tuition_growth": 0.035, "endowment_per_student": 25000,
        "tuition_dependence": 0.42, "base_enrollment": 32000,
        "cs_share_2012": 0.07, "cs_growth_rate": 0.12,
        "intl_pct": 0.18, "completion_rate": 0.82,
        "median_earnings_10yr": 72000, "median_debt": 25000,
    },
    "Regional Value": {
        "base_tuition_private": 32000, "base_tuition_public": 9000,
        "tuition_growth": 0.04, "endowment_per_student": 8000,
        "tuition_dependence": 0.62, "base_enrollment": 18000,
        "cs_share_2012": 0.04, "cs_growth_rate": 0.06,
        "intl_pct": 0.08, "completion_rate": 0.68,
        "median_earnings_10yr": 58000, "median_debt": 28000,
    },
    "Tuition Dependent": {
        "base_tuition_private": 44000, "base_tuition_public": 0,
        "tuition_growth": 0.045, "endowment_per_student": 4000,
        "tuition_dependence": 0.80, "base_enrollment": 8000,
        "cs_share_2012": 0.03, "cs_growth_rate": 0.07,
        "intl_pct": 0.12, "completion_rate": 0.72,
        "median_earnings_10yr": 55000, "median_debt": 32000,
    },
}

CS_CIP = "11.0701"
AI_CIP = "30.7001"

AI_PROGRAM_LAUNCH_YEARS = {
    "Prestige Fortress": 2018,
    "Expansion Player": 2019,
    "Regional Value": 2021,
    "Tuition Dependent": 2022,
}

AI_TUITION_PREMIUM = {
    "Prestige Fortress": 1.1,
    "Expansion Player": 1.35,
    "Regional Value": 1.20,
    "Tuition Dependent": 1.30,
}


def jitter(base, pct=0.10):
    return base * (1 + random.uniform(-pct, pct))


def cagr(start, end, years):
    if start <= 0 or years == 0:
        return 0.0
    return (end / start) ** (1 / years) - 1


def seed_all(db):
    # --- CPI ---
    for year in YEARS:
        if not db.query(CPIData).filter_by(year=year).first():
            yoy = (CPI_HISTORY[year] / CPI_HISTORY[year - 1] - 1) * 100 if year > 2012 else 0
            db.add(CPIData(
                year=year,
                cpi_value=CPI_HISTORY[year],
                cpi_education=CPI_EDUCATION[year],
                cpi_college_tuition=CPI_TUITION[year],
                yoy_change_pct=yoy,
            ))

    # --- Tech employment ---
    for year in YEARS:
        if not db.query(TechEmploymentData).filter_by(year=year, occupation_code="15-1252").first():
            db.add(TechEmploymentData(
                year=year, occupation_code="15-1252",
                occupation_title="Software Developers",
                median_annual_wage=jitter(TECH_WAGES[year], 0.02),
            ))
        if not db.query(TechEmploymentData).filter_by(year=year, occupation_code="15-2051").first():
            db.add(TechEmploymentData(
                year=year, occupation_code="15-2051",
                occupation_title="Data Scientists",
                median_annual_wage=jitter(TECH_WAGES[year] * 0.95, 0.02),
            ))
    db.commit()

    # --- Universities ---
    for u_seed in TARGET_UNIVERSITIES:
        uni = db.query(University).filter_by(unit_id=u_seed["unit_id"]).first()
        if not uni:
            uni = University(**{k: v for k, v in u_seed.items()}, is_target=True)
            db.add(uni)
            db.flush()

        archetype = u_seed["archetype"]
        profile = ARCHETYPES[archetype]
        is_public = u_seed["control"] == "public"

        base_tuition = profile["base_tuition_public"] if is_public else profile["base_tuition_private"]
        base_tuition = jitter(base_tuition, 0.15)
        total_enrollment = jitter(profile["base_enrollment"], 0.30)

        # --- CS Program ---
        cs_prog = db.query(Program).filter_by(
            university_id=uni.id, cip_code=CS_CIP, award_level="3"
        ).first()
        if not cs_prog:
            cs_prog = Program(
                university_id=uni.id, cip_code=CS_CIP,
                cip_title="Computer Science", award_level="3",
                program_name="Computer Science (Bachelor's)",
                is_cs=True, is_ai_ml=False,
            )
            db.add(cs_prog)
            db.flush()

        # CS Master's
        cs_ms_prog = db.query(Program).filter_by(
            university_id=uni.id, cip_code=CS_CIP, award_level="5"
        ).first()
        if not cs_ms_prog:
            cs_ms_prog = Program(
                university_id=uni.id, cip_code=CS_CIP,
                cip_title="Computer Science", award_level="5",
                program_name="Computer Science (Master's)",
                is_cs=True, is_ai_ml=False,
            )
            db.add(cs_ms_prog)
            db.flush()

        # AI Program (launched post-2018)
        ai_launch = AI_PROGRAM_LAUNCH_YEARS[archetype]
        ai_prog = db.query(Program).filter_by(
            university_id=uni.id, cip_code=AI_CIP, award_level="5"
        ).first()
        if not ai_prog:
            ai_prog = Program(
                university_id=uni.id, cip_code=AI_CIP,
                cip_title="Data Science, General", award_level="5",
                program_name="Artificial Intelligence / Machine Learning (Master's)",
                is_cs=True, is_ai_ml=True,
                year_established=ai_launch,
            )
            db.add(ai_prog)
            db.flush()

        for year in YEARS:
            # Enrollment trends: CS boom 2012–2019, plateau/modest decline 2020-2023
            t = year - 2012
            cs_share = profile["cs_share_2012"] * (1 + profile["cs_growth_rate"]) ** min(t, 7)
            # Post-2022 layoff effect: modest softening
            if year >= 2022:
                cs_share *= (1 - 0.03 * (year - 2021))
            cs_completions = int(total_enrollment * cs_share * jitter(1.0, 0.05))

            for prog, val in [(cs_prog, cs_completions), (cs_ms_prog, int(cs_completions * 0.4))]:
                existing = db.query(Enrollment).filter_by(
                    university_id=uni.id, cip_code=prog.cip_code,
                    award_level=prog.award_level, academic_year=year
                ).first()
                if not existing and val > 0:
                    db.add(Enrollment(
                        university_id=uni.id, program_id=prog.id,
                        academic_year=year, cip_code=prog.cip_code,
                        award_level=prog.award_level,
                        total_enrolled=val,
                    ))

            # AI enrollment (only after launch year)
            if year >= ai_launch:
                ai_t = year - ai_launch
                ai_enroll = int(cs_completions * 0.15 * (1.25 ** ai_t) * jitter(1.0, 0.08))
                ai_enroll = min(ai_enroll, int(cs_completions * 0.6))
                existing_ai = db.query(Enrollment).filter_by(
                    university_id=uni.id, cip_code=AI_CIP,
                    award_level=ai_prog.award_level, academic_year=year
                ).first()
                if not existing_ai and ai_enroll > 0:
                    db.add(Enrollment(
                        university_id=uni.id, program_id=ai_prog.id,
                        academic_year=year, cip_code=AI_CIP,
                        award_level=ai_prog.award_level,
                        total_enrolled=ai_enroll,
                    ))

            # Tuition
            tuition_yr = base_tuition * (1 + profile["tuition_growth"]) ** t
            net_price = tuition_yr * jitter(0.68 if is_public else 0.55, 0.08)
            ai_premium = AI_TUITION_PREMIUM[archetype] if year >= ai_launch else 1.0
            existing_t = db.query(Tuition).filter_by(
                university_id=uni.id, academic_year=year
            ).first()
            if not existing_t:
                db.add(Tuition(
                    university_id=uni.id, academic_year=year,
                    published_in_state=round(tuition_yr, 0) if is_public else None,
                    published_out_state=round(tuition_yr * 2.5, 0) if is_public else None,
                    avg_net_price=round(net_price, 0),
                    net_price_0_30k=round(net_price * 0.35, 0),
                    net_price_30_48k=round(net_price * 0.55, 0),
                    net_price_48_75k=round(net_price * 0.75, 0),
                    net_price_75_110k=round(net_price * 0.90, 0),
                    net_price_110k_plus=round(tuition_yr * (ai_premium if not is_public else 1.0), 0),
                    fees=round(jitter(1800, 0.3), 0),
                    room_board=round(jitter(14000, 0.2), 0),
                ))

            # Financials
            enroll_total = int(total_enrollment * (1 + 0.005 * t))
            tuition_rev = tuition_yr * enroll_total * (0.55 if is_public else 0.65)
            total_rev = tuition_rev / profile["tuition_dependence"]
            existing_f = db.query(UniversityFinancials).filter_by(
                university_id=uni.id, fiscal_year=year
            ).first()
            if not existing_f:
                db.add(UniversityFinancials(
                    university_id=uni.id, fiscal_year=year,
                    total_revenue=round(total_rev, 0),
                    tuition_revenue=round(tuition_rev, 0),
                    federal_grants=round(total_rev * jitter(0.15, 0.3), 0),
                    state_appropriations=round(total_rev * (0.20 if is_public else 0.01), 0),
                    endowment_assets=round(
                        profile["endowment_per_student"] * enroll_total * (1.07 ** t), 0
                    ),
                    total_expenses=round(total_rev * jitter(0.95, 0.05), 0),
                    instruction_expenses=round(total_rev * jitter(0.30, 0.05), 0),
                    research_expenses=round(total_rev * jitter(0.12, 0.10), 0),
                    total_enrollment_headcount=enroll_total,
                ))

        # Outcomes
        existing_od = db.query(OutcomeData).filter_by(
            university_id=uni.id, academic_year=2022
        ).first()
        if not existing_od:
            db.add(OutcomeData(
                university_id=uni.id, academic_year=2022,
                median_earnings_6yr=round(jitter(profile["median_earnings_10yr"] * 0.78, 0.12), 0),
                median_earnings_10yr=round(jitter(profile["median_earnings_10yr"], 0.12), 0),
                median_debt_completers=round(jitter(profile["median_debt"], 0.15), 0),
                repayment_rate_3yr=round(jitter(0.85 if archetype == "Prestige Fortress" else 0.72, 0.08), 3),
                completion_rate=round(jitter(profile["completion_rate"], 0.05), 3),
            ))

        db.commit()

    # Compute health scores
    _compute_health_scores(db)
    db.commit()
    print(f"Synthetic data seeded for {len(TARGET_UNIVERSITIES)} universities.")


def _compute_health_scores(db):
    universities = db.query(University).filter_by(is_target=True).all()
    for uni in universities:
        fin_recent = db.query(UniversityFinancials).filter_by(
            university_id=uni.id, fiscal_year=2022
        ).first()
        fin_old = db.query(UniversityFinancials).filter_by(
            university_id=uni.id, fiscal_year=2017
        ).first()
        tuition_recent = db.query(Tuition).filter_by(
            university_id=uni.id, academic_year=2022
        ).first()
        tuition_old = db.query(Tuition).filter_by(
            university_id=uni.id, academic_year=2017
        ).first()

        tuition_dep = 0.0
        endow_per_student = 0.0
        net_tuition_growth = 0.0
        enroll_trend = 0.0

        if fin_recent:
            if fin_recent.total_revenue and fin_recent.tuition_revenue:
                tuition_dep = fin_recent.tuition_revenue / fin_recent.total_revenue
            if fin_recent.endowment_assets and fin_recent.total_enrollment_headcount:
                endow_per_student = fin_recent.endowment_assets / max(fin_recent.total_enrollment_headcount, 1)

        if tuition_recent and tuition_old:
            t_now = tuition_recent.avg_net_price or tuition_recent.published_in_state or 0
            t_old = tuition_old.avg_net_price or tuition_old.published_in_state or 0
            if t_old > 0:
                net_tuition_growth = cagr(t_old, t_now, 5) * 100

        if fin_recent and fin_old:
            e_now = fin_recent.total_enrollment_headcount or 0
            e_old = fin_old.total_enrollment_headcount or 0
            if e_old > 0:
                enroll_trend = (e_now / e_old - 1) * 100

        # Composite score (higher = healthier)
        # Components: low tuition dependence, high endowment, strong enrollment growth, moderate tuition growth
        score = 50.0
        score += (0.50 - tuition_dep) * 60         # -30 to +30
        score += math.log10(max(endow_per_student, 1)) * 5  # 0 to ~30
        score += min(enroll_trend * 0.5, 10)        # cap at +10
        score -= max(net_tuition_growth - 3.0, 0) * 2  # penalty for beating inflation too hard
        score = max(0.0, min(100.0, score))

        archetype = uni.archetype
        if tuition_dep > 0.70:
            archetype = "Tuition Dependent"
        elif endow_per_student > 100000:
            archetype = "Prestige Fortress"
        elif enroll_trend > 5:
            archetype = "Expansion Player"
        elif score < 45:
            archetype = "Regional Value"

        existing = db.query(HealthScore).filter_by(university_id=uni.id).first()
        if not existing:
            db.add(HealthScore(
                university_id=uni.id,
                computed_at=date(2024, 1, 1),
                tuition_dependence_pct=round(tuition_dep * 100, 1),
                endowment_per_student=round(endow_per_student, 0),
                international_student_pct=round(ARCHETYPES[uni.archetype]["intl_pct"] * 100, 1),
                net_tuition_growth_rate=round(net_tuition_growth, 2),
                enrollment_trend=round(enroll_trend, 2),
                composite_score=round(score, 1),
                archetype=archetype,
                archetype_rationale=_rationale(archetype, tuition_dep, endow_per_student),
            ))
        else:
            existing.tuition_dependence_pct = round(tuition_dep * 100, 1)
            existing.endowment_per_student = round(endow_per_student, 0)
            existing.composite_score = round(score, 1)
            existing.archetype = archetype


def _rationale(archetype, tuition_dep, endow_per_student):
    if archetype == "Prestige Fortress":
        return f"Low tuition dependence ({tuition_dep:.0%}) and strong endowment buffer (${endow_per_student:,.0f}/student)."
    if archetype == "Expansion Player":
        return "Rapid program growth and enrollment expansion offset moderate endowment."
    if archetype == "Regional Value":
        return "Affordability positioning with employment-focused programs, limited endowment cushion."
    return f"High revenue reliance on tuition ({tuition_dep:.0%}) creates vulnerability to enrollment shocks."


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()
