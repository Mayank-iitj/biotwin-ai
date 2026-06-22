"""Routers package"""
from app.routers import auth, users, health_data, twin, risk, simulate, recommendations, coach, dashboard, privacy

__all__ = [
    "auth",
    "users",
    "health_data",
    "twin",
    "risk",
    "simulate",
    "recommendations",
    "coach",
    "dashboard",
    "privacy"
]