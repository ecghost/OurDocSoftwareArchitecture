from contextlib import contextmanager
from database.connection import get_conn, put_conn

@contextmanager
def db_cursor():
    conn = get_conn()
    cur = conn.cursor()
    try:
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        put_conn(conn)
