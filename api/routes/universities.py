from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.database import get_db
from api.models import University, HealthScore, UniversityFinancials, Tuition, OutcomeData, Enrollment, Program

router = APIRouter(prefix="/universities", tags=["universities"])


def _serialize_university(uni, db: Session) -> dict:
    hs = db.query(HealthScore).filter_by(university_id=uni.id).first()
    fin = db.query(UniversityFinancials).filter_by(university_id=uni.id, fiscal_year=2022).first()
    t = db.query(Tuition).filter_by(university_id=uni.id, academic_year=2023).first()
    od = db.query(OutcomeData).filter_by(university_id=uni.id, academic_year=2022).first()
    return {
        "id": uni.id,
        "unit_id": uni.unit_id,
        "name": uni.name,
        "alias": uni.alias,
        "state": uni.state,
        "city": uni.city,
        "control": uni.control,
        "archetype": hs.archetype if hs else uni.archetype,
        "composite_score": hs.composite_score if hs else None,
        "tuition_dependence_pct": hs.tuition_dependence_pct if hs else None,
        "endowment_per_student": hs.endowment_per_student if hs else None,
        "international_student_pct": hs.international_student_pct if hs else None,
        "net_tuition_growth_rate": hs.net_tuition_growth_rate if hs else None,
        "enrollment_trend_pct": hs.enrollment_trend if hs else None,
        "archetype_rationale": hs.archetype_rationale if hs else None,
        "total_revenue": fin.total_revenue if fin else None,
        "tuition_revenue": fin.tuition_revenue if fin else None,
        "endowment_total": fin.endowment_assets if fin else None,
        "total_enrollment": fin.total_enrollment_headcount if fin else None,
        "avg_net_price_2023": t.avg_net_price if t else None,
        "median_earnings_10yr": od.median_earnings_10yr if od else None,
        "median_debt": od.median_debt_completers if od else None,
        "completion_rate": od.completion_rate if od else None,
    }


@router.get("/")
def list_universities(db: Session = Depends(get_db)):
    unis = db.query(University).filter_by(is_target=True).order_by(University.name).all()
    return [_serialize_university(u, db) for u in unis]


@router.get("/{university_id}")
def get_university(university_id: int, db: Session = Depends(get_db)):
    uni = db.query(University).filter_by(id=university_id, is_target=True).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")

    base = _serialize_university(uni, db)

    # Full tuition history
    tuition_history = [
        {
            "year": t.academic_year,
            "published_in_state": t.published_in_state,
            "published_out_state": t.published_out_state,
            "avg_net_price": t.avg_net_price,
            "net_price_0_30k": t.net_price_0_30k,
            "net_price_30_48k": t.net_price_30_48k,
            "net_price_48_75k": t.net_price_48_75k,
            "net_price_75_110k": t.net_price_75_110k,
            "net_price_110k_plus": t.net_price_110k_plus,
        }
        for t in db.query(Tuition).filter_by(university_id=uni.id).order_by(Tuition.academic_year).all()
    ]

    # Full financial history
    financials_history = [
        {
            "year": f.fiscal_year,
            "total_revenue": f.total_revenue,
            "tuition_revenue": f.tuition_revenue,
            "endowment_assets": f.endowment_assets,
            "total_enrollment": f.total_enrollment_headcount,
            "tuition_dependence_pct": round(f.tuition_revenue / f.total_revenue * 100, 1)
            if f.total_revenue and f.tuition_revenue else None,
        }
        for f in db.query(UniversityFinancials).filter_by(university_id=uni.id)
        .order_by(UniversityFinancials.fiscal_year).all()
    ]

    # CS enrollment timeline
    cs_timeline = [
        {"year": e.academic_year, "enrolled": e.total_enrolled, "award_level": e.award_level}
        for e in db.query(Enrollment).filter_by(university_id=uni.id, cip_code="11.0701")
        .order_by(Enrollment.academic_year).all()
    ]

    # Programs
    programs = [
        {
            "cip_code": p.cip_code,
            "name": p.program_name,
            "award_level": p.award_level,
            "is_cs": p.is_cs,
            "is_ai_ml": p.is_ai_ml,
            "year_established": p.year_established,
        }
        for p in db.query(Program).filter_by(university_id=uni.id).all()
    ]

    return {**base, "tuition_history": tuition_history, "financials_history": financials_history,
            "cs_timeline": cs_timeline, "programs": programs}
