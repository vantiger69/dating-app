import os

class Config:
    # Secret key for session management
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')

    # Database URL from .env
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///database.db')

    # Disable track modifications to save resources
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    ENV = os.getenv('FLASK_ENV','development')

