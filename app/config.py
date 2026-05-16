import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024
    PROFILE_UPLOAD_FOLDER = 'images/profile_pictures'


class DeploymentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///notella.db'

    # Add when implementing AI quiz feature
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    TESTING = True

    # Add when implementing AI quiz feature
    # OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')