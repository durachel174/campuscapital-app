from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, Text,
    ForeignKey, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship
from api.database import Base


class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True)
    unit_id = Column(Integer, unique=True, nullable=False)   # IPEDS UNITID
    scorecard_id = Column(Integer, unique=True, nullable=True)
    name = Column(String(255), nullable=False)
    alias = Column(String(100))
    state = Column(String(2))
    city = Column(String(100))
    zip_code = Column(String(10))
    control = Column(String(20))          # public / private-nonprofit / private-for-profit
    carnegie_class = Column(String(100))
    website = Column(String(255))
    archetype = Column(String(50))        # Prestige Fortress / Expansion Player / Regional Value / Tuition Dependent
    is_target = Column(Boolean, default=True)

    enrollments = relationship("Enrollment", back_populates="university")
    tuitions = relationship("Tuition", back_populates="university")
    financials = relationship("UniversityFinancials", back_populates="university")
    programs = relationship("Program", back_populates="university")
    health_scores = relationship("HealthScore", back_populates="university")
    outcomes = relationship("OutcomeData", back_populates="university")


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    cip_code = Column(String(10))         # Classification of Instructional Programs
    cip_title = Column(String(255))
    award_level = Column(String(50))      # bachelor / master / doctoral / certificate
    program_name = Column(String(255))
    is_online = Column(Boolean, default=False)
    year_established = Column(Integer)
    is_ai_ml = Column(Boolean, default=False)
    is_cs = Column(Boolean, default=False)

    university = relationship("University", back_populates="programs")
    enrollments = relationship("Enrollment", back_populates="program")

    __table_args__ = (
        UniqueConstraint("university_id", "cip_code", "award_level", name="uq_program"),
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=True)
    academic_year = Column(Integer, nullable=False)  # e.g. 2023 means AY 2023-24
    total_enrolled = Column(Integer)
    full_time = Column(Integer)
    part_time = Column(Integer)
    undergrad = Column(Integer)
    graduate = Column(Integer)
    international_pct = Column(Float)
    cip_code = Column(String(10))

    award_level = Column(String(10))          # 3=bachelor, 5=master, 7=doctoral

    university = relationship("University", back_populates="enrollments")
    program = relationship("Program", back_populates="enrollments")

    __table_args__ = (
        UniqueConstraint("university_id", "cip_code", "award_level", "academic_year", name="uq_enrollment"),
        Index("ix_enrollment_year", "academic_year"),
    )


class Tuition(Base):
    __tablename__ = "tuition"

    id = Column(Integer, primary_key=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    academic_year = Column(Integer, nullable=False)
    published_in_state = Column(Float)
    published_out_state = Column(Float)
    net_price_0_30k = Column(Float)       # net price for families earning $0-30k
    net_price_30_48k = Column(Float)
    net_price_48_75k = Column(Float)
    net_price_75_110k = Column(Float)
    net_price_110k_plus = Column(Float)
    avg_net_price = Column(Float)
    fees = Column(Float)
    room_board = Column(Float)

    university = relationship("University", back_populates="tuitions")

    __table_args__ = (
        UniqueConstraint("university_id", "academic_year", name="uq_tuition"),
        Index("ix_tuition_year", "academic_year"),
    )


class UniversityFinancials(Base):
    __tablename__ = "university_financials"

    id = Column(Integer, primary_key=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    total_revenue = Column(Float)
    tuition_revenue = Column(Float)
    federal_grants = Column(Float)
    state_appropriations = Column(Float)
    endowment_assets = Column(Float)
    total_expenses = Column(Float)
    instruction_expenses = Column(Float)
    research_expenses = Column(Float)
    total_enrollment_headcount = Column(Integer)

    university = relationship("University", back_populates="financials")

    __table_args__ = (
        UniqueConstraint("university_id", "fiscal_year", name="uq_financials"),
    )


class HealthScore(Base):
    __tablename__ = "health_scores"

    id = Column(Integer, primary_key=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False, unique=True)
    computed_at = Column(Date)
    tuition_dependence_pct = Column(Float)    # tuition revenue / total revenue
    endowment_per_student = Column(Float)
    international_student_pct = Column(Float)
    net_tuition_growth_rate = Column(Float)   # 5-year CAGR
    enrollment_trend = Column(Float)          # 5-year enrollment change %
    composite_score = Column(Float)           # 0–100
    archetype = Column(String(50))
    archetype_rationale = Column(Text)

    university = relationship("University", back_populates="health_scores")


class OutcomeData(Base):
    __tablename__ = "outcome_data"

    id = Column(Integer, primary_key=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    academic_year = Column(Integer, nullable=False)
    median_earnings_6yr = Column(Float)
    median_earnings_10yr = Column(Float)
    median_debt_completers = Column(Float)
    repayment_rate_3yr = Column(Float)
    completion_rate = Column(Float)

    university = relationship("University", back_populates="outcomes")

    __table_args__ = (
        UniqueConstraint("university_id", "academic_year", name="uq_outcomes"),
    )


class CPIData(Base):
    __tablename__ = "cpi_data"

    id = Column(Integer, primary_key=True)
    year = Column(Integer, unique=True, nullable=False)
    cpi_value = Column(Float)
    cpi_education = Column(Float)
    cpi_college_tuition = Column(Float)
    yoy_change_pct = Column(Float)


class TechEmploymentData(Base):
    __tablename__ = "tech_employment"

    id = Column(Integer, primary_key=True)
    year = Column(Integer, nullable=False)
    occupation_code = Column(String(10))
    occupation_title = Column(String(255))
    total_employed = Column(Integer)
    median_annual_wage = Column(Float)
    job_openings = Column(Integer)

    __table_args__ = (
        UniqueConstraint("year", "occupation_code", name="uq_tech_employment"),
    )
