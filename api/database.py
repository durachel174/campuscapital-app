import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings


def _default_db_url() -> str:
    # Railway injects DATABASE_URL (Postgres plugin) or DATABASE_PRIVATE_URL
    for key in ("DATABASE_URL", "DATABASE_PRIVATE_URL", "PGURL"):
        val = os.environ.get(key, "")
        if val:
            # Railway uses postgres:// scheme; SQLAlchemy needs postgresql://
            return val.replace("postgres://", "postgresql://", 1)
    return "postgresql://campuscapital:campuscapital@localhost:5432/campuscapital"


class Settings(BaseSettings):
    database_url: str = _default_db_url()
    college_scorecard_api_key: str = "DEMO_KEY"
    bls_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
