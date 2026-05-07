import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import universities, programs, tuition, scores

app = FastAPI(
    title="Higher Education Market Intelligence API",
    description="Treats universities as business entities. Data from IPEDS, College Scorecard, and BLS.",
    version="0.1.0",
)

# Allow any Railway/Vercel subdomain plus localhost
_extra_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        *_extra_origins,
    ],
    allow_origin_regex=r"https://.*\.(railway\.app|vercel\.app)$",
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(universities.router)
app.include_router(programs.router)
app.include_router(tuition.router)
app.include_router(scores.router)


@app.get("/")
def root():
    return {
        "name": "CampusCapital API",
        "endpoints": [
            "GET /universities/",
            "GET /universities/{id}",
            "GET /programs/cs/trends",
            "GET /programs/ai/expansion",
            "GET /tuition/inflation",
            "GET /scores/health",
        ],
    }
