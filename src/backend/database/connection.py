# src/database/connection.py
import psycopg2
from psycopg2.pool import SimpleConnectionPool

_pool = None


def init_db_pool(app=None):
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host="119.3.183.42",
            port=5432,
            database="db",
            user="ourdoc",
            password="1234Abcd!",
            sslmode="disable"
        )


def get_conn():
    if _pool is None:
        raise RuntimeError("Database pool not initialized")
    return _pool.getconn()


def put_conn(conn):
    _pool.putconn(conn)
