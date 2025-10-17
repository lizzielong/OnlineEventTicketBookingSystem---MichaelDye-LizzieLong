import os
from dotenv import load_dotenv

# Load .env from repo root
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    
    # REQUIRED: Only use MySQL, no fallbacks
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    
    # Validate that DATABASE_URL is set
    if not SQLALCHEMY_DATABASE_URI:
        raise ValueError("DATABASE_URL environment variable is required")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Add this line:
    AUTO_CREATE_TABLES = True