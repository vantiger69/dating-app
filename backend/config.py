import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

    # Database URL from .env or default to SQLite in /tmp
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:////tmp/database.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ENV = os.getenv('FLASK_ENV', 'development')
