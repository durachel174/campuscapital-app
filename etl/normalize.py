"""Shared normalization utilities for ETL pipelines."""
import re
from typing import Optional


def safe_float(value) -> Optional[float]:
    if value is None:
        return None
    try:
        f = float(value)
        return None if f in (-1.0, -2.0, -999.0) else f
    except (TypeError, ValueError):
        return None


def safe_int(value) -> Optional[int]:
    if value is None:
        return None
    try:
        i = int(float(value))
        return None if i < 0 else i
    except (TypeError, ValueError):
        return None


def normalize_cip(cip: str) -> str:
    """Normalize CIP code to 6-digit dotted format: '11.0701'"""
    if not cip:
        return cip
    cip = str(cip).strip().zfill(6)
    if "." not in cip:
        cip = cip[:2] + "." + cip[2:]
    return cip


CS_CIP_PREFIXES = {"11"}
AI_ML_CIP_CODES = {
    "11.0701",  # Computer Science
    "11.0800",  # Computer Software & Media Applications
    "11.0802",  # Data Modeling
    "27.0501",  # Statistics
    "14.0901",  # Computer Engineering
    "11.0104",  # Informatics
    "30.7001",  # Data Science (multidisciplinary)
}
AI_ML_KEYWORDS = re.compile(
    r"\b(artificial intelligence|machine learning|data science|deep learning|"
    r"neural network|natural language processing|computer vision|mlops|llm)\b",
    re.IGNORECASE,
)


def is_cs_program(cip_code: str, title: str = "") -> bool:
    code = normalize_cip(cip_code or "")
    prefix = code.split(".")[0] if "." in code else code[:2]
    return prefix in CS_CIP_PREFIXES


def is_ai_ml_program(cip_code: str, title: str = "") -> bool:
    code = normalize_cip(cip_code or "")
    if code in AI_ML_CIP_CODES:
        return True
    return bool(AI_ML_KEYWORDS.search(title or ""))


def academic_year_label(year: int) -> str:
    """Convert integer year to AY label: 2023 → '2023-24'"""
    return f"{year}-{str(year + 1)[-2:]}"
