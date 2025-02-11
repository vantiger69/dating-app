import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    
    # Use relative path for local development and /tmp for production
    database_path = os.path.join(os.path.dirname(__file__), 'database.db')  # Local development
    # database_path = os.path.join('/tmp', 'database.db')  # For Render or production environments
    
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{database_path}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ENV = os.getenv('FLASK_ENV', 'development')
