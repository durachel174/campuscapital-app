"""
Master ETL runner.
Runs all pipelines in order: universities seed → IPEDS → Scorecard → BLS.
"""
import sys
import os
import logging
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import SessionLocal
from etl.ipeds import upsert_universities, load_enrollment, load_tuition, load_financials
from etl.scorecard import load_scorecard
from etl.bls import load_tech_employment, load_cpi

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

if __name__ == "__main__":
    db = SessionLocal()
    try:
        log.info("=== Starting ETL pipeline ===")
        upsert_universities(db)
        load_enrollment(db)
        load_tuition(db)
        load_financials(db)
        load_scorecard(db)
        load_tech_employment(db)
        load_cpi(db)
        log.info("=== ETL complete ===")
    except Exception as e:
        log.error(f"ETL failed: {e}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()
