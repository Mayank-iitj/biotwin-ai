"""
BioTwin AI - FastAPI Backend
Preventive healthcare platform with disease risk forecasting
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import uuid
from datetime import datetime

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, users, health_data, twin, risk, simulate, recommendations, coach, dashboard, privacy

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

DISCLAIMER_TEXT = "BioTwin AI provides wellness risk estimates, not medical diagnoses. Consult a licensed healthcare provider."


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    logger.info("Starting BioTwin AI API...")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Database initialized")
    yield

    logger.info("Shutting down BioTwin AI API...")
    await engine.dispose()


app = FastAPI(
    title="BioTwin AI API",
    description="Preventive healthcare platform API - Disease risk forecasting and AI health coaching",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware for OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SESSION_SECRET_KEY
)


# Request ID middleware for tracing
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# Error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "request_id": getattr(request.state, "request_id", None)
        }
    )


# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "biotwin-api",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(health_data.router, prefix="/api/v1/health-data", tags=["Health Data"])
app.include_router(twin.router, prefix="/api/v1/twin", tags=["Digital Twin"])
app.include_router(risk.router, prefix="/api/v1/risk", tags=["Risk Assessment"])
app.include_router(simulate.router, prefix="/api/v1/simulate", tags=["Simulation"])
app.include_router(recommendations.router, prefix="/api/v1/recommendations", tags=["Recommendations"])
app.include_router(coach.router, prefix="/api/v1/coach", tags=["AI Health Coach"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(privacy.router, prefix="/api/v1/privacy", tags=["Privacy"])


# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "BioTwin AI API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "disclaimer": DISCLAIMER_TEXT
    }


# Response wrapper for consistent API responses
@app.middleware("http")
async def add_response_envelope(request: Request, call_next):
    response = await call_next(request)

    # Don't wrap docs/redoc/health endpoints
    if request.url.path.startswith(("/api/docs", "/api/redoc", "/health", "/openapi")):
        return response

    return response