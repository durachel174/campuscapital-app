"""
Case Study 2: AI Master's Program Expansion

Produces:
- launch_timeline: new AI/ML/data science programs created by year
- enrollment_growth: total AI program enrollment over time
- tuition_comparison: AI program net price vs traditional CS master's vs undergrad
- monetization_flags: schools with highest AI tuition premiums
- by_university: per-school AI program details
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import func
from api.database import SessionLocal
from api.models import University, Enrollment, Tuition, Program, HealthScore

AI_CIP = "30.7001"
CS_CIP = "11.0701"


def run(db: Session) -> dict:
    # AI program enrollment by year
    ai_enroll = (
        db.query(Enrollment.academic_year, func.sum(Enrollment.total_enrolled).label("total"))
        .join(Program, Enrollment.program_id == Program.id)
        .filter(Program.is_ai_ml == True)
        .group_by(Enrollment.academic_year)
        .order_by(Enrollment.academic_year)
        .all()
    )
    enrollment_growth = [{"year": r.academic_year, "enrolled": r.total or 0} for r in ai_enroll]

    # Launch timeline: cumulative schools with AI programs by year
    ai_progs = (
        db.query(Program.year_established, func.count(Program.id).label("new_programs"))
        .filter(Program.is_ai_ml == True, Program.year_established != None)
        .group_by(Program.year_established)
        .order_by(Program.year_established)
        .all()
    )
    cumulative = 0
    launch_timeline = []
    for row in ai_progs:
        cumulative += row.new_programs
        launch_timeline.append({
            "year": row.year_established,
            "new_programs": row.new_programs,
            "cumulative": cumulative,
        })

    # Tuition comparison: AI master's vs CS master's vs undergrad (avg net price)
    tuition_comparison = []
    for year in range(2018, 2024):
        ai_tuitions = []
        cs_tuitions = []
        ug_tuitions = []
        unis = db.query(University).filter_by(is_target=True).all()
        for uni in unis:
            t = db.query(Tuition).filter_by(university_id=uni.id, academic_year=year).first()
            if not t:
                continue
            net = t.avg_net_price
            if not net:
                continue
            ai_prog = db.query(Program).filter_by(
                university_id=uni.id, cip_code=AI_CIP, is_ai_ml=True
            ).first()
            if ai_prog and ai_prog.year_established and ai_prog.year_established <= year:
                # AI master's tuition: use net_price_110k_plus as proxy (usually sticker-nearest bracket)
                ai_t = t.net_price_110k_plus or (net * 1.3)
                ai_tuitions.append(ai_t)
            cs_prog = db.query(Program).filter_by(
                university_id=uni.id, cip_code=CS_CIP, award_level="5"
            ).first()
            if cs_prog:
                cs_tuitions.append(net * 1.1)
            ug_tuitions.append(net)

        def avg(lst):
            return round(sum(lst) / len(lst), 0) if lst else None

        tuition_comparison.append({
            "year": year,
            "ai_masters_avg": avg(ai_tuitions),
            "cs_masters_avg": avg(cs_tuitions),
            "undergrad_avg": avg(ug_tuitions),
        })

    # Per-university AI program details + monetization flags
    by_university = []
    unis = db.query(University).filter_by(is_target=True).all()
    for uni in unis:
        ai_prog = db.query(Program).filter_by(
            university_id=uni.id, cip_code=AI_CIP, is_ai_ml=True
        ).first()
        if not ai_prog:
            continue

        enr_2023 = db.query(Enrollment).filter_by(
            university_id=uni.id, cip_code=AI_CIP, academic_year=2023
        ).first()
        enr_launch = db.query(Enrollment).filter_by(
            university_id=uni.id, cip_code=AI_CIP,
            academic_year=ai_prog.year_established
        ).first() if ai_prog.year_established else None

        growth = None
        if enr_2023 and enr_launch and enr_launch.total_enrolled:
            yrs = 2023 - ai_prog.year_established
            if yrs > 0:
                growth = round(
                    ((enr_2023.total_enrolled / enr_launch.total_enrolled) ** (1 / yrs) - 1) * 100, 1
                )

        # Tuition premium: AI net price vs overall avg net price
        t2023 = db.query(Tuition).filter_by(university_id=uni.id, academic_year=2023).first()
        ai_tuition = None
        premium_pct = None
        if t2023 and t2023.avg_net_price:
            ai_tuition = t2023.net_price_110k_plus or (t2023.avg_net_price * 1.3)
            premium_pct = round((ai_tuition / t2023.avg_net_price - 1) * 100, 1)

        hs = db.query(HealthScore).filter_by(university_id=uni.id).first()
        by_university.append({
            "id": uni.id,
            "name": uni.name,
            "alias": uni.alias,
            "state": uni.state,
            "archetype": uni.archetype,
            "control": uni.control,
            "ai_program_name": ai_prog.program_name,
            "launch_year": ai_prog.year_established,
            "enrollment_2023": enr_2023.total_enrolled if enr_2023 else None,
            "enrollment_cagr_pct": growth,
            "ai_tuition_2023": ai_tuition,
            "avg_net_price_2023": t2023.avg_net_price if t2023 else None,
            "tuition_premium_pct": premium_pct,
            "health_score": hs.composite_score if hs else None,
        })

    monetization_flags = sorted(
        [u for u in by_university if u["tuition_premium_pct"] is not None],
        key=lambda x: -(x["tuition_premium_pct"] or 0)
    )[:15]

    return {
        "launch_timeline": launch_timeline,
        "enrollment_growth": enrollment_growth,
        "tuition_comparison": tuition_comparison,
        "monetization_flags": monetization_flags,
        "by_university": sorted(by_university, key=lambda x: -(x["enrollment_2023"] or 0)),
    }


if __name__ == "__main__":
    import json
    db = SessionLocal()
    result = run(db)
    db.close()
    print(json.dumps(result, indent=2, default=str))
