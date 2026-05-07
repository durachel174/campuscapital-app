from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.database import get_db
from analysis import tuition_inflation

router = APIRouter(prefix="/tuition", tags=["tuition"])

_cache = None


@router.get("/inflation")
def inflation(db: Session = Depends(get_db)):
    global _cache
    if _cache is None:
        _cache = tuition_inflation.run(db)
    return _cache
