"""
Case Study 4: University Financial Health Scoring

Produces:
- scored_universities: all 49 schools with composite health scores + archetypes
- archetype_distribution: breakdown by archetype
- risk_flags: schools with elevated exposure indicators
- metric_scatter: endowment vs tuition dependence scatter data
- score_histogram: distribution of composite scores
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import func
from api.database import SessionLocal
from api.models import University, HealthScore, UniversityFinancials, Tuition, OutcomeData

ARCHETYPES = ["Prestige Fortress", "Expansion Player", "Regional Value", "Tuition Dependent"]


def run(db: Session) -> dict:
    unis = db.query(University).filter_by(is_target=True).all()

    scored_universities = []
    for uni in unis:
        hs = db.query(HealthScore).filter_by(university_id=uni.id).first()
        fin = db.query(UniversityFinancials).filter_by(
            university_id=uni.id, fiscal_year=2022
        ).first()
        od = db.query(OutcomeData).filter_by(
            university_id=uni.id, academic_year=2022
        ).first()
        t2023 = db.query(Tuition).filter_by(
            university_id=uni.id, academic_year=2023
        ).first()

        # 5-year enrollment trend
        fin_2017 = db.query(UniversityFinancials).filter_by(
            university_id=uni.id, fiscal_year=2017
        ).first()
        enroll_trend_pct = None
        if fin and fin_2017 and fin_2017.total_enrollment_headcount:
            e_now = fin.total_enrollment_headcount or 0
            e_old = fin_2017.total_enrollment_headcount or 1
            enroll_trend_pct = round((e_now / e_old - 1) * 100, 1)

        risk_flags = []
        if hs:
            if (hs.tuition_dependence_pct or 0) > 65:
                risk_flags.append("High tuition dependence")
            if (hs.international_student_pct or 0) > 20:
                risk_flags.append("International student revenue risk")
            if (hs.endowment_per_student or 0) < 10000:
                risk_flags.append("Low endowment buffer")
            if (hs.enrollment_trend or 0) < -3:
                risk_flags.append("Enrollment declining")
            if (hs.net_tuition_growth_rate or 0) > 5:
                risk_flags.append("Aggressive tuition inflation")

        scored_universities.append({
            "id": uni.id,
            "unit_id": uni.unit_id,
            "name": uni.name,
            "alias": uni.alias,
            "state": uni.state,
            "city": uni.city,
            "control": uni.control,
            "archetype": hs.archetype if hs else uni.archetype,
            "archetype_rationale": hs.archetype_rationale if hs else None,
            "composite_score": hs.composite_score if hs else None,
            "tuition_dependence_pct": hs.tuition_dependence_pct if hs else None,
            "endowment_per_student": hs.endowment_per_student if hs else None,
            "international_student_pct": hs.international_student_pct if hs else None,
            "net_tuition_growth_rate": hs.net_tuition_growth_rate if hs else None,
            "enrollment_trend_pct": enroll_trend_pct,
            "total_revenue": fin.total_revenue if fin else None,
            "tuition_revenue": fin.tuition_revenue if fin else None,
            "endowment_total": fin.endowment_assets if fin else None,
            "total_enrollment": fin.total_enrollment_headcount if fin else None,
            "avg_net_price_2023": t2023.avg_net_price if t2023 else None,
            "median_earnings_10yr": od.median_earnings_10yr if od else None,
            "median_debt": od.median_debt_completers if od else None,
            "completion_rate": od.completion_rate if od else None,
            "risk_flags": risk_flags,
            "risk_count": len(risk_flags),
        })

    scored_universities.sort(key=lambda x: -(x["composite_score"] or 0))

    # Archetype distribution
    archetype_distribution = []
    for arch in ARCHETYPES:
        schools = [u for u in scored_universities if u["archetype"] == arch]
        scores = [u["composite_score"] for u in schools if u["composite_score"]]
        archetype_distribution.append({
            "archetype": arch,
            "count": len(schools),
            "avg_score": round(sum(scores) / len(scores), 1) if scores else None,
            "avg_tuition_dependence": round(
                sum(u["tuition_dependence_pct"] or 0 for u in schools) / max(len(schools), 1), 1
            ),
            "avg_endowment_per_student": round(
                sum(u["endowment_per_student"] or 0 for u in schools) / max(len(schools), 1), 0
            ),
        })

    # Risk flags summary
    risk_flags_summary = {}
    for u in scored_universities:
        for flag in u["risk_flags"]:
            risk_flags_summary[flag] = risk_flags_summary.get(flag, 0) + 1

    # Scatter data: endowment per student vs tuition dependence (bubble = total enrollment)
    metric_scatter = [
        {
            "id": u["id"],
            "name": u["alias"] or u["name"],
            "archetype": u["archetype"],
            "x": u["tuition_dependence_pct"],
            "y": u["endowment_per_student"],
            "size": u["total_enrollment"],
            "score": u["composite_score"],
        }
        for u in scored_universities
        if u["tuition_dependence_pct"] and u["endowment_per_student"]
    ]

    # Score histogram buckets
    buckets = [(0, 20), (20, 40), (40, 60), (60, 80), (80, 100)]
    score_histogram = []
    for lo, hi in buckets:
        count = sum(
            1 for u in scored_universities
            if u["composite_score"] is not None and lo <= u["composite_score"] < hi
        )
        score_histogram.append({"range": f"{lo}–{hi}", "count": count})

    return {
        "scored_universities": scored_universities,
        "archetype_distribution": archetype_distribution,
        "risk_flags_summary": [
            {"flag": k, "count": v}
            for k, v in sorted(risk_flags_summary.items(), key=lambda x: -x[1])
        ],
        "metric_scatter": metric_scatter,
        "score_histogram": score_histogram,
        "high_risk_schools": [u for u in scored_universities if u["risk_count"] >= 3],
    }


if __name__ == "__main__":
    import json
    db = SessionLocal()
    result = run(db)
    db.close()
    print(json.dumps(result, indent=2, default=str))
