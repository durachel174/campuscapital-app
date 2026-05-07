"""
College Scorecard ETL pipeline.

Pulls outcomes, debt, earnings, and net price data from:
  https://api.data.gov/ed/collegescorecard/v1/schools

Free API — use DEMO_KEY for low-volume pulls or register at api.data.gov.
Rate limit: 1000 req/hr with DEMO_KEY, 10000/hr with a key.
"""
import sys
import os
import time
import logging
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Optional
import requests
from sqlalchemy.orm import Session
from api.database import SessionLocal, settings
from api.models import University, Tuition, OutcomeData
from etl.universities_seed import TARGET_UNIVERSITIES
from etl.normalize import safe_float, safe_int

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

SCORECARD_BASE = "https://api.data.gov/ed/collegescorecard/v1/schools"

FIELDS = ",".join([
    "id",
    "school.name",
    "school.city",
    "school.state",
    "school.zip",
    "school.ownership",
    "2022.cost.tuition.in_state",
    "2022.cost.tuition.out_of_state",
    "2022.cost.avg_net_price.public",
    "2022.cost.avg_net_price.private",
    "2022.cost.net_price.public.by_income_level.0-30000",
    "2022.cost.net_price.public.by_income_level.30001-48000",
    "2022.cost.net_price.public.by_income_level.48001-75000",
    "2022.cost.net_price.public.by_income_level.75001-110000",
    "2022.cost.net_price.public.by_income_level.110001-plus",
    "2022.cost.net_price.private.by_income_level.0-30000",
    "2022.cost.net_price.private.by_income_level.30001-48000",
    "2022.cost.net_price.private.by_income_level.48001-75000",
    "2022.cost.net_price.private.by_income_level.75001-110000",
    "2022.cost.net_price.private.by_income_level.110001-plus",
    "2022.earnings.6_yrs_after_entry.median",
    "2022.earnings.10_yrs_after_entry.median",
    "2022.repayment_rates.3_yr_repayment.overall",
    "2022.completion.completion_rate_4yr_100nt",
    "2022.aid.median_debt.completers.overall",
    "2022.student.size",
])


def _fetch_scorecard(unit_id: int) -> Optional[dict]:
    params = {
        "api_key": settings.college_scorecard_api_key,
        "ope6_id": "",
        "id": unit_id,
        "fields": FIELDS,
        "per_page": 1,
    }
    try:
        r = requests.get(SCORECARD_BASE, params=params, timeout=20)
        r.raise_for_status()
        data = r.json()
        results = data.get("results", [])
        return results[0] if results else None
    except Exception as e:
        log.warning(f"Scorecard fetch failed for unit_id={unit_id}: {e}")
        return None


def _net_price_fields(row: dict, control: str) -> dict:
    kind = "public" if "public" in control else "private"
    return {
        "net_price_0_30k": safe_float(row.get(f"2022.cost.net_price.{kind}.by_income_level.0-30000")),
        "net_price_30_48k": safe_float(row.get(f"2022.cost.net_price.{kind}.by_income_level.30001-48000")),
        "net_price_48_75k": safe_float(row.get(f"2022.cost.net_price.{kind}.by_income_level.48001-75000")),
        "net_price_75_110k": safe_float(row.get(f"2022.cost.net_price.{kind}.by_income_level.75001-110000")),
        "net_price_110k_plus": safe_float(row.get(f"2022.cost.net_price.{kind}.by_income_level.110001-plus")),
    }


def load_scorecard(db: Session):
    log.info("Loading College Scorecard data…")
    universities = db.query(University).filter_by(is_target=True).all()
    for uni in universities:
        log.info(f"  {uni.alias or uni.name}")
        row = _fetch_scorecard(uni.unit_id)
        if not row:
            continue

        # Update scorecard_id
        sc_id = safe_int(row.get("id"))
        if sc_id:
            uni.scorecard_id = sc_id

        # Net price enrichment on tuition row for year 2022
        net_prices = _net_price_fields(row, uni.control or "")
        avg_np_public = safe_float(row.get("2022.cost.avg_net_price.public"))
        avg_np_private = safe_float(row.get("2022.cost.avg_net_price.private"))
        avg_net_price = avg_np_public or avg_np_private

        tuition_row = db.query(Tuition).filter_by(
            university_id=uni.id, academic_year=2022
        ).first()
        if tuition_row:
            tuition_row.avg_net_price = avg_net_price
            for k, v in net_prices.items():
                if v is not None:
                    setattr(tuition_row, k, v)
        else:
            t = Tuition(
                university_id=uni.id,
                academic_year=2022,
                published_in_state=safe_float(row.get("2022.cost.tuition.in_state")),
                published_out_state=safe_float(row.get("2022.cost.tuition.out_of_state")),
                avg_net_price=avg_net_price,
                **net_prices,
            )
            db.add(t)

        # Outcome data
        existing_outcome = db.query(OutcomeData).filter_by(
            university_id=uni.id, academic_year=2022
        ).first()
        if not existing_outcome:
            od = OutcomeData(
                university_id=uni.id,
                academic_year=2022,
                median_earnings_6yr=safe_float(row.get("2022.earnings.6_yrs_after_entry.median")),
                median_earnings_10yr=safe_float(row.get("2022.earnings.10_yrs_after_entry.median")),
                median_debt_completers=safe_float(row.get("2022.aid.median_debt.completers.overall")),
                repayment_rate_3yr=safe_float(row.get("2022.repayment_rates.3_yr_repayment.overall")),
                completion_rate=safe_float(row.get("2022.completion.completion_rate_4yr_100nt")),
            )
            db.add(od)

        time.sleep(0.1)

    db.commit()
    log.info("Scorecard load complete.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        load_scorecard(db)
    finally:
        db.close()
