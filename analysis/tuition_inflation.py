"""
Case Study 3: Tuition vs Inflation

Produces:
- national_comparison: avg published tuition vs CPI-All vs CPI-CollegeTuition annually
- by_control: tuition growth by institutional control (public vs private)
- sticker_vs_net: published sticker vs avg net price gap over time
- real_cost_change: real (inflation-adjusted) tuition change per school
- income_brackets: net price trends by family income bracket
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import func
from api.database import SessionLocal
from api.models import University, Tuition, CPIData

BASE_YEAR = 2012


def _index(value, base):
    if not base or not value:
        return None
    return round(value / base * 100, 1)


def run(db: Session) -> dict:
    years = list(range(2012, 2024))

    # CPI reference
    cpi_rows = {r.year: r for r in db.query(CPIData).all()}
    cpi_base = cpi_rows.get(BASE_YEAR)

    # National avg tuition (published in-state for public; out-of-state proxy for private)
    public_unis = [u.id for u in db.query(University).filter_by(control="public", is_target=True).all()]
    private_unis = [u.id for u in db.query(University).filter_by(is_target=True).filter(
        University.control != "public"
    ).all()]

    national_comparison = []
    for year in years:
        pub_avg = db.query(func.avg(Tuition.published_in_state)).filter(
            Tuition.academic_year == year,
            Tuition.university_id.in_(public_unis),
            Tuition.published_in_state != None,
        ).scalar()
        priv_avg = db.query(func.avg(Tuition.published_out_state)).filter(
            Tuition.academic_year == year,
            Tuition.university_id.in_(private_unis),
            Tuition.published_out_state != None,
        ).scalar()
        cpi = cpi_rows.get(year)
        national_comparison.append({
            "year": year,
            "public_tuition_index": _index(pub_avg, db.query(func.avg(Tuition.published_in_state)).filter(
                Tuition.academic_year == BASE_YEAR, Tuition.university_id.in_(public_unis),
                Tuition.published_in_state != None,
            ).scalar()),
            "private_tuition_index": _index(priv_avg, db.query(func.avg(Tuition.published_out_state)).filter(
                Tuition.academic_year == BASE_YEAR, Tuition.university_id.in_(private_unis),
                Tuition.published_out_state != None,
            ).scalar()),
            "cpi_all_index": _index(cpi.cpi_value, cpi_base.cpi_value) if cpi and cpi_base else None,
            "cpi_tuition_index": _index(cpi.cpi_college_tuition, cpi_base.cpi_college_tuition) if cpi and cpi_base else None,
            "public_tuition_abs": round(pub_avg, 0) if pub_avg else None,
            "private_tuition_abs": round(priv_avg, 0) if priv_avg else None,
        })

    # Sticker vs net price gap
    sticker_vs_net = []
    for year in years:
        pub_sticker = db.query(func.avg(Tuition.published_in_state)).filter(
            Tuition.academic_year == year, Tuition.university_id.in_(public_unis),
            Tuition.published_in_state != None,
        ).scalar()
        pub_net = db.query(func.avg(Tuition.avg_net_price)).filter(
            Tuition.academic_year == year, Tuition.university_id.in_(public_unis),
            Tuition.avg_net_price != None,
        ).scalar()
        priv_sticker = db.query(func.avg(Tuition.published_out_state)).filter(
            Tuition.academic_year == year, Tuition.university_id.in_(private_unis),
            Tuition.published_out_state != None,
        ).scalar()
        priv_net = db.query(func.avg(Tuition.avg_net_price)).filter(
            Tuition.academic_year == year, Tuition.university_id.in_(private_unis),
            Tuition.avg_net_price != None,
        ).scalar()
        sticker_vs_net.append({
            "year": year,
            "public_sticker": round(pub_sticker, 0) if pub_sticker else None,
            "public_net": round(pub_net, 0) if pub_net else None,
            "private_sticker": round(priv_sticker, 0) if priv_sticker else None,
            "private_net": round(priv_net, 0) if priv_net else None,
            "public_discount_pct": round((1 - pub_net / pub_sticker) * 100, 1) if pub_net and pub_sticker else None,
            "private_discount_pct": round((1 - priv_net / priv_sticker) * 100, 1) if priv_net and priv_sticker else None,
        })

    # Real cost change per school (inflation-adjusted 2012→2023)
    cpi_2012 = cpi_rows.get(2012)
    cpi_2023 = cpi_rows.get(2023)
    real_cost_change = []
    unis = db.query(University).filter_by(is_target=True).all()
    for uni in unis:
        t_base = db.query(Tuition).filter_by(university_id=uni.id, academic_year=2012).first()
        t_now = db.query(Tuition).filter_by(university_id=uni.id, academic_year=2023).first()
        if not (t_base and t_now):
            continue
        base_val = t_base.published_in_state if uni.control == "public" else t_base.published_out_state
        now_val = t_now.published_in_state if uni.control == "public" else t_now.published_out_state
        if not (base_val and now_val and cpi_2012 and cpi_2023):
            continue
        nominal_change_pct = (now_val / base_val - 1) * 100
        inflation_adj_base = base_val * (cpi_2023.cpi_value / cpi_2012.cpi_value)
        real_change_pct = (now_val / inflation_adj_base - 1) * 100
        real_cost_change.append({
            "id": uni.id,
            "name": uni.name,
            "alias": uni.alias,
            "state": uni.state,
            "archetype": uni.archetype,
            "control": uni.control,
            "tuition_2012": round(base_val, 0),
            "tuition_2023": round(now_val, 0),
            "nominal_change_pct": round(nominal_change_pct, 1),
            "real_change_pct": round(real_change_pct, 1),
            "beat_inflation": real_change_pct > 0,
        })
    real_cost_change.sort(key=lambda x: -x["real_change_pct"])

    # Income bracket net price trends (national avg)
    brackets = [
        ("net_price_0_30k", "$0–30k"),
        ("net_price_30_48k", "$30–48k"),
        ("net_price_48_75k", "$48–75k"),
        ("net_price_75_110k", "$75–110k"),
        ("net_price_110k_plus", "$110k+"),
    ]
    income_brackets = []
    for year in years:
        row = {"year": year}
        for field, label in brackets:
            avg_val = db.query(func.avg(getattr(Tuition, field))).filter(
                Tuition.academic_year == year,
                getattr(Tuition, field) != None,
            ).scalar()
            row[label] = round(avg_val, 0) if avg_val else None
        income_brackets.append(row)

    return {
        "national_comparison": national_comparison,
        "sticker_vs_net": sticker_vs_net,
        "real_cost_change": real_cost_change,
        "income_brackets": income_brackets,
        "beat_inflation_count": sum(1 for x in real_cost_change if x["beat_inflation"]),
        "total_schools": len(real_cost_change),
    }


if __name__ == "__main__":
    import json
    db = SessionLocal()
    result = run(db)
    db.close()
    print(json.dumps(result, indent=2, default=str))
