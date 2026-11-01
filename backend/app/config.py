import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def get_default_database_url() -> str:
    env_db = os.getenv("DATABASE_URL")
    if env_db:
        if env_db.startswith("sqlite:///./"):
            db_filename = env_db.replace("sqlite:///./", "")
            return f"sqlite:///{BASE_DIR / db_filename}"
        return env_db
    return f"sqlite:///{BASE_DIR / 'cit_scheduler.db'}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "CIT Smart Scheduler Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cit_scheduler_super_secret_jwt_key_change_in_production_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database URL: Supports PostgreSQL (e.g. postgresql://user:pass@host:5432/db)
    # Automatically falls back to high-performance local SQLite file in project root if PostgreSQL is not specified
    DATABASE_URL: str = get_default_database_url()

    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]

    # Gemini AI Assistant Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    GEMINI_PROJECT_NAME: str = os.getenv("GEMINI_PROJECT_NAME", "projects/925675273491")
    GEMINI_PROJECT_NUMBER: str = os.getenv("GEMINI_PROJECT_NUMBER", "925675273491")
    GEMINI_TIMEOUT_SECONDS: int = 30

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / "backend" / ".env"),
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
