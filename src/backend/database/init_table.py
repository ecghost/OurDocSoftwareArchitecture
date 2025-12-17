# src/database/init_tables.py
from database.connection import get_conn, put_conn


def init_tables():
    conn = get_conn()
    cur = conn.cursor()

    try:
        # ========== user 表 ==========
        cur.execute("""
        CREATE TABLE IF NOT EXISTS "user" (
            id VARCHAR(64) PRIMARY KEY,
            user_name VARCHAR(64),
            email VARCHAR(100),
            password VARCHAR(256)
        );
        """)

        # ========== document 表 ==========
        cur.execute("""
        CREATE TABLE IF NOT EXISTS document (
            room_id VARCHAR(64) PRIMARY KEY,
            room_name VARCHAR(128),
            create_time TIMESTAMP,
            overall_permission INT,
            owner_user_id VARCHAR(64)
        );
        """)

        # ========== permission 表 ==========
        cur.execute("""
        CREATE TABLE IF NOT EXISTS permission (
            room_id VARCHAR(64),
            user_id VARCHAR(64),
            permission INT,
            PRIMARY KEY (room_id, user_id)
        );
        """)

        # ========== content 表 ==========
        cur.execute("""
        CREATE TABLE IF NOT EXISTS content (
            room_id VARCHAR(64) PRIMARY KEY,
            content TEXT
        );
        """)

        conn.commit()
        print("All tables created successfully")

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cur.close()
        put_conn(conn)