"""
Startup script for Railway deployment.
Creates tables and seeds synthetic data on first boot.
Idempotent — safe to run on every restart.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from api.database import engine, Base, SessionLocal
import api.models  # noqa: F401 — registers all models
from api.models import University

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)


def main():
    log.info("Running startup checks...")

    try:
        # 1. Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        log.info("Tables verified.")

        # 2. Seed data only if universities table is empty
        db = SessionLocal()
        try:
            count = db.query(University).count()
            if count == 0:
                log.info("Database is empty — seeding synthetic data...")
                from scripts.seed_synthetic_data import seed_all
                seed_all(db)
                log.info("Seed complete.")
            else:
                log.info(f"Database already populated ({count} universities). Skipping seed.")
        finally:
            db.close()

        log.info("Startup complete.")
    except Exception as e:
        log.error(f"Startup DB initialization failed (will continue): {e}")
        log.warning("API will start but may return errors until the database is reachable.")


if __name__ == "__main__":
    main()
