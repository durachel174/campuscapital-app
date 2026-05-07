"""
Case Study 1: CS Enrollment Boom/Bust

Produces:
- national_trend: annual total CS completions across all target schools
- by_university: per-school CS enrollment timeline
- labor_overlay: tech wage & employment data for context
- overexposed: schools that grew CS fastest and face highest exposure
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import func
from api.database import SessionLocal
from api.models import University, Enrollment, TechEmploymentData, Program

CS_CIP = "11.0701"


def run(db: Session) -> dict:
    # Total CS completions by year (bachelor's + master's, all target schools)
    rows = (
        db.query(Enrollment.academic_year, func.sum(Enrollment.total_enrolled).label("total"))
        .join(Program, Enrollment.program_id == Program.id)
        .filter(Program.is_cs == True, Enrollment.cip_code == CS_CIP)
        .group_by(Enrollment.academic_year)
        .order_by(Enrollment.academic_year)
        .all()
    )
    national_trend = [{"year": r.academic_year, "completions": r.total} for r in rows]

    # Per-university CS enrollment timeline (bachelor's only)
    unis = db.query(University).filter_by(is_target=True).all()
    by_university = []
    for uni in unis:
        enr_rows = (
            db.query(Enrollment.academic_year, func.sum(Enrollment.total_enrolled).label("total"))
            .filter(
                Enrollment.university_id == uni.id,
                Enrollment.cip_code == CS_CIP,
                Enrollment.award_level == "3",
            )
            .group_by(Enrollment.academic_year)
            .order_by(Enrollment.academic_year)
            .all()
        )
        if not enr_rows:
            continue
        data_points = [{"year": r.academic_year, "completions": r.total} for r in enr_rows]
        peak = max(data_points, key=lambda x: x["completions"])
        latest = data_points[-1] if data_points else None
        change_pct = None
        if peak["completions"] and latest:
            change_pct = round((latest["completions"] / peak["completions"] - 1) * 100, 1)

        by_university.append({
            "id": uni.id,
            "name": uni.name,
            "alias": uni.alias,
            "state": uni.state,
            "archetype": uni.archetype,
            "control": uni.control,
            "data": data_points,
            "peak_year": peak["year"],
            "peak_completions": peak["completions"],
            "latest_completions": latest["completions"] if latest else None,
            "change_from_peak_pct": change_pct,
        })

    # Labor market overlay — tech wages
    tech_rows = (
        db.query(TechEmploymentData)
        .filter(TechEmploymentData.occupation_code == "15-1252")
        .order_by(TechEmploymentData.year)
        .all()
    )
    labor_overlay = [
        {"year": r.year, "median_wage": r.median_annual_wage}
        for r in tech_rows
    ]

    # Overexposed: schools that grew fastest 2012-2019 and are now softening
    overexposed = []
    for u in by_university:
        data = {d["year"]: d["completions"] for d in u["data"]}
        v2012 = data.get(2012)
        v2019 = data.get(2019)
        v2023 = data.get(2023)
        if not (v2012 and v2019 and v2023 and v2012 > 0):
            continue
        boom = (v2019 / v2012 - 1) * 100
        bust = (v2023 / v2019 - 1) * 100
        overexposed.append({
            "id": u["id"],
            "name": u["name"],
            "alias": u["alias"],
            "archetype": u["archetype"],
            "boom_pct": round(boom, 1),
            "bust_pct": round(bust, 1),
            "exposure_score": round(boom - bust * 2, 1),
        })
    overexposed.sort(key=lambda x: x["exposure_score"], reverse=True)

    return {
        "national_trend": national_trend,
        "by_university": sorted(by_university, key=lambda x: -(x["latest_completions"] or 0)),
        "labor_overlay": labor_overlay,
        "overexposed": overexposed[:15],
    }


if __name__ == "__main__":
    import json
    db = SessionLocal()
    result = run(db)
    db.close()
    print(json.dumps(result, indent=2, default=str))
