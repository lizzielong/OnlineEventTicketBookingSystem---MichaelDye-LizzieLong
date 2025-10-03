import os
from dotenv import load_dotenv


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
# Load .env from repo root if present
load_dotenv(os.path.join(BASE_DIR, ".env"))
DEFAULT_SQLITE_PATH = os.path.join(BASE_DIR, "database", "dev.db")
# Ensure the database directory exists for SQLite fallback
os.makedirs(os.path.dirname(DEFAULT_SQLITE_PATH), exist_ok=True)


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    # Default to MySQL local dev; allow override via DATABASE_URL or fallback to SQLite
    DEFAULT_MYSQL_URL = "mysql+pymysql://ticket:ENCE_420_project@localhost:3306/online_event"
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        DEFAULT_MYSQL_URL if os.path.exists(os.path.join(BASE_DIR, "instance")) else f"sqlite:///{DEFAULT_SQLITE_PATH}",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    AUTO_CREATE_TABLES = os.environ.get("AUTO_CREATE_TABLES", "true").lower() == "true"


