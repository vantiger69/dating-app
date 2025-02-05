import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    # Expand the ~ to full path
    database_path = os.path.expanduser('~/Documents/my-app/database.db')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{database_path}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ENV = os.getenv('FLASK_ENV', 'development')
