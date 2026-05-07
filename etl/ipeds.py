"""
IPEDS ETL pipeline.

Pulls data from the IPEDS Data Center API:
  - Institutional characteristics (HD tables)
  - Enrollment by CIP (C tables)
  - Tuition and fees (IC tables)
  - Financial data (F tables)

IPEDS REST API base: https://educationdata.urban.org/api/v1/college-university/ipeds/
(Urban Institute Education Data Portal — free, no key required)
"""
import sys
import os
import time
import logging
from typing import Optional
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from sqlalchemy.orm import Session
from api.database import SessionLocal
from api.models import University, Enrollment, Tuition, UniversityFinancials, Program
from etl.universities_seed import TARGET_UNIVERSITIES
from etl.normalize import safe_float, safe_int, normalize_cip, is_cs_program, is_ai_ml_program

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

URBAN_BASE = "https://educationdata.urban.org/api/v1/college-university/ipeds"
YEARS = list(range(2012, 2024))


def _get(url: str, params: dict = None, retries: int = 3) -> Optional[dict]:
    for attempt in range(retries):
        try:
            r = requests.get(url, params=params, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            wait = 2 ** attempt
            log.warning(f"Request failed ({e}), retrying in {wait}s… ({url})")
            time.sleep(wait)
    log.error(f"Failed after {retries} attempts: {url}")
    return None


def _paginate(url: str, params: dict = None) -> list:
    """Follow Urban Institute pagination (next links)."""
    results = []
    params = params or {}
    params["per_page"] = 1000
    data = _get(url, params)
    if not data:
        return results
    results.extend(data.get("results", []))
    while data.get("next"):
        data = _get(data["next"])
        if not data:
            break
        results.extend(data.get("results", []))
    return results


# ---------------------------------------------------------------------------
# Institutional characteristics
# ---------------------------------------------------------------------------

def upsert_universities(db: Session):
    """Seed universities from our target list into the DB."""
    log.info("Seeding target universities…")
    for u in TARGET_UNIVERSITIES:
        existing = db.query(University).filter_by(unit_id=u["unit_id"]).first()
        if not existing:
            inst = University(
                unit_id=u["unit_id"],
                name=u["name"],
                alias=u["alias"],
                state=u["state"],
                city=u["city"],
                control=u["control"],
                archetype=u["archetype"],
                is_target=True,
            )
            db.add(inst)
    db.commit()
    log.info(f"Universities seeded: {db.query(University).count()} rows")


# ---------------------------------------------------------------------------
# Enrollment by CIP code
# ---------------------------------------------------------------------------

def fetch_enrollment_by_cip(unit_id: int, year: int) -> list:
    url = f"{URBAN_BASE}/completions/cip-code/{year}/"
    params = {"unitid": unit_id, "award_level": "3,5,7,17,18,19"}  # bachelor + master + doctoral
    return _paginate(url, params)


def load_enrollment(db: Session):
    log.info("Loading enrollment data from IPEDS completions…")
    universities = db.query(University).filter_by(is_target=True).all()
    for uni in universities:
        log.info(f"  {uni.alias or uni.name}")
        for year in YEARS:
            rows = fetch_enrollment_by_cip(uni.unit_id, year)
            for row in rows:
                cip_raw = str(row.get("cipcode", "")).strip()
                cip = normalize_cip(cip_raw)
                award_level = str(row.get("award_level", ""))
                completions = safe_int(row.get("awards"))
                if completions is None or completions == 0:
                    continue

                # Upsert program
                prog = db.query(Program).filter_by(
                    university_id=uni.id, cip_code=cip, award_level=award_level
                ).first()
                if not prog:
                    prog = Program(
                        university_id=uni.id,
                        cip_code=cip,
                        cip_title=row.get("cipcode_label", ""),
                        award_level=award_level,
                        program_name=row.get("cipcode_label", ""),
                        is_cs=is_cs_program(cip),
                        is_ai_ml=is_ai_ml_program(cip, row.get("cipcode_label", "")),
                    )
                    db.add(prog)
                    db.flush()

                # Upsert enrollment
                existing = db.query(Enrollment).filter_by(
                    university_id=uni.id, cip_code=cip, academic_year=year
                ).first()
                if existing:
                    existing.total_enrolled = (existing.total_enrolled or 0) + completions
                else:
                    enr = Enrollment(
                        university_id=uni.id,
                        program_id=prog.id,
                        academic_year=year,
                        cip_code=cip,
                        total_enrolled=completions,
                    )
                    db.add(enr)
            time.sleep(0.1)
        db.commit()
    log.info("Enrollment load complete.")


# ---------------------------------------------------------------------------
# Tuition & fees
# ---------------------------------------------------------------------------

def fetch_tuition(unit_id: int, year: int) -> Optional[dict]:
    url = f"{URBAN_BASE}/institutional-characteristics/{year}/"
    params = {"unitid": unit_id}
    data = _get(url, params)
    if data and data.get("results"):
        return data["results"][0]
    return None


def load_tuition(db: Session):
    log.info("Loading tuition data from IPEDS…")
    universities = db.query(University).filter_by(is_target=True).all()
    for uni in universities:
        log.info(f"  {uni.alias or uni.name}")
        for year in YEARS:
            row = fetch_tuition(uni.unit_id, year)
            if not row:
                continue
            existing = db.query(Tuition).filter_by(
                university_id=uni.id, academic_year=year
            ).first()
            if not existing:
                t = Tuition(
                    university_id=uni.id,
                    academic_year=year,
                    published_in_state=safe_float(row.get("tuition_in_state")),
                    published_out_state=safe_float(row.get("tuition_out_of_state")),
                    fees=safe_float(row.get("fee_in_state")),
                    room_board=safe_float(row.get("room_board_on_campus")),
                )
                db.add(t)
            time.sleep(0.05)
        db.commit()
    log.info("Tuition load complete.")


# ---------------------------------------------------------------------------
# Financial data
# ---------------------------------------------------------------------------

def fetch_financials(unit_id: int, year: int) -> Optional[dict]:
    url = f"{URBAN_BASE}/finance/{year}/"
    params = {"unitid": unit_id}
    data = _get(url, params)
    if data and data.get("results"):
        return data["results"][0]
    return None


def load_financials(db: Session):
    log.info("Loading financial data from IPEDS…")
    universities = db.query(University).filter_by(is_target=True).all()
    for uni in universities:
        log.info(f"  {uni.alias or uni.name}")
        for year in YEARS:
            row = fetch_financials(uni.unit_id, year)
            if not row:
                continue
            existing = db.query(UniversityFinancials).filter_by(
                university_id=uni.id, fiscal_year=year
            ).first()
            if not existing:
                f = UniversityFinancials(
                    university_id=uni.id,
                    fiscal_year=year,
                    total_revenue=safe_float(row.get("rev_total_current")),
                    tuition_revenue=safe_float(row.get("rev_tuition_fees")),
                    federal_grants=safe_float(row.get("rev_fed_grants_contracts")),
                    state_appropriations=safe_float(row.get("rev_state_local_appropriations")),
                    endowment_assets=safe_float(row.get("endow_assets_end_year")),
                    total_expenses=safe_float(row.get("exp_total_current")),
                    instruction_expenses=safe_float(row.get("exp_instruction")),
                    research_expenses=safe_float(row.get("exp_research")),
                )
                db.add(f)
            time.sleep(0.05)
        db.commit()
    log.info("Financials load complete.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        upsert_universities(db)
        load_enrollment(db)
        load_tuition(db)
        load_financials(db)
    finally:
        db.close()
