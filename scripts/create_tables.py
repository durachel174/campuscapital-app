"""Create all database tables."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import engine, Base
import api.models  # noqa: F401 — registers all models

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("All tables created.")
