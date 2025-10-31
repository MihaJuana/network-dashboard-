import mysql.connector
from config import DB_HOST, DB_PORT

def connect_db(user, password, database=None):
    cfg = {
        "host": DB_HOST,
        "port": DB_PORT,
        "user": user,
        "password": password,
    }
    if database:
        cfg["database"] = database
    return mysql.connector.connect(**cfg)
