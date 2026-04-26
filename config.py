import os

class Config:
    SECRET_KEY = 'tomatomato'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///notella.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False