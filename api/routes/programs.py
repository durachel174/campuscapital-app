from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.database import get_db
from analysis import cs_enrollment, ai_programs

router = APIRouter(prefix="/programs", tags=["programs"])

_cs_cache = None
_ai_cache = None


@router.get("/cs/trends")
def cs_trends(db: Session = Depends(get_db)):
    global _cs_cache
    if _cs_cache is None:
        _cs_cache = cs_enrollment.run(db)
    return _cs_cache


@router.get("/ai/expansion")
def ai_expansion(db: Session = Depends(get_db)):
    global _ai_cache
    if _ai_cache is None:
        _ai_cache = ai_programs.run(db)
    return _ai_cache
