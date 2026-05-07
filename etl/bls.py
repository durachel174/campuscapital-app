"""
BLS ETL pipeline.

Pulls Occupational Employment and Wage Statistics (OEWS) from the BLS
public data API v2: https://api.bls.gov/publicAPI/v2/timeseries/data/

CS / tech occupation codes tracked:
  15-1252 - Software Developers
  15-1242 - Database Administrators and Architects
  15-1211 - Computer Systems Analysts
  15-1244 - Network and Computer Systems Administrators
  15-2051 - Data Scientists
  15-1299 - Computer Occupations, All Other
"""
import sys
import os
import time
import logging
import json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import Optional
import requests
from sqlalchemy.orm import Session
from api.database import SessionLocal, settings
from api.models import TechEmploymentData, CPIData
from etl.normalize import safe_float, safe_int

log = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

# OEWS national annual series IDs: OEU + area(0000000) + industry(000000) + occ(XXXXXXX) + datatype(04=median wage)
TECH_SERIES = {
    "15-1252": ("Software Developers", "OEU000000000000015125204"),
    "15-2051": ("Data Scientists", "OEU000000000000015205104"),
    "15-1211": ("Computer Systems Analysts", "OEU000000000000015121104"),
    "15-1244": ("Network and Computer Systems Admins", "OEU000000000000015124404"),
}

# CPI-U All Items: CUUR0000SA0
# CPI-U Education: CUUR0000SAE1
# CPI-U College tuition and fees: CUUR0000SEEB01
CPI_SERIES = {
    "all": "CUUR0000SA0",
    "education": "CUUR0000SAE1",
    "college_tuition": "CUUR0000SEEB01",
}

YEARS = list(range(2012, 2024))


def _bls_request(series_ids: list, start_year: int, end_year: int) -> Optional[dict]:
    payload = {
        "seriesid": series_ids,
        "startyear": str(start_year),
        "endyear": str(end_year),
        "annualaverage": True,
    }
    if settings.bls_api_key:
        payload["registrationkey"] = settings.bls_api_key
    try:
        r = requests.post(BLS_API, json=payload, timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log.warning(f"BLS request failed: {e}")
        return None


def load_tech_employment(db: Session):
    """Load annual median wages for key CS/tech occupations."""
    log.info("Loading BLS tech employment data…")
    series_ids = [v[1] for v in TECH_SERIES.values()]
    id_to_meta = {v[1]: (k, v[0]) for k, v in TECH_SERIES.items()}

    # BLS API allows max 20 years per request in registered mode, 10 in anonymous
    data = _bls_request(series_ids, 2012, 2023)
    if not data:
        log.error("BLS API returned no data.")
        return

    for series in data.get("Results", {}).get("series", []):
        sid = series["seriesID"]
        occ_code, occ_title = id_to_meta.get(sid, (sid, "Unknown"))
        for item in series.get("data", []):
            if item.get("period") != "M13":  # M13 = annual average
                continue
            year = safe_int(item.get("year"))
            value = safe_float(item.get("value"))
            if not year or not value:
                continue
            existing = db.query(TechEmploymentData).filter_by(
                year=year, occupation_code=occ_code
            ).first()
            if not existing:
                db.add(TechEmploymentData(
                    year=year,
                    occupation_code=occ_code,
                    occupation_title=occ_title,
                    median_annual_wage=value,
                ))
    db.commit()
    log.info("Tech employment data loaded.")


def load_cpi(db: Session):
    """Load CPI-U annual averages (all items, education, college tuition)."""
    log.info("Loading BLS CPI data…")
    series_ids = list(CPI_SERIES.values())
    data = _bls_request(series_ids, 2012, 2023)
    if not data:
        log.error("BLS CPI API returned no data.")
        return

    # Collect by year
    by_year: dict = {}
    key_map = {v: k for k, v in CPI_SERIES.items()}

    for series in data.get("Results", {}).get("series", []):
        sid = series["seriesID"]
        field = key_map.get(sid, "")
        for item in series.get("data", []):
            if item.get("period") != "M13":
                continue
            year = safe_int(item.get("year"))
            value = safe_float(item.get("value"))
            if not year or not value:
                continue
            if year not in by_year:
                by_year[year] = {}
            by_year[year][field] = value

    for year, vals in sorted(by_year.items()):
        existing = db.query(CPIData).filter_by(year=year).first()
        if not existing:
            db.add(CPIData(
                year=year,
                cpi_value=vals.get("all"),
                cpi_education=vals.get("education"),
                cpi_college_tuition=vals.get("college_tuition"),
            ))
    db.commit()
    log.info("CPI data loaded.")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        load_tech_employment(db)
        load_cpi(db)
    finally:
        db.close()
