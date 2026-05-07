from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.database import get_db
from analysis import university_health

router = APIRouter(prefix="/scores", tags=["scores"])

_cache = None


@router.get("/health")
def health_scores(db: Session = Depends(get_db)):
    global _cache
    if _cache is None:
        _cache = university_health.run(db)
    return _cache
