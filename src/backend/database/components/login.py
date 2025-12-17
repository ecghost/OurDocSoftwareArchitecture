from database.base import db_cursor


# ---------------- 登录查询 ----------------
def login_dataset(email):
    try:
        with db_cursor() as cur:
            cur.execute(
                """
                SELECT password, id
                FROM "user"
                WHERE email = %s
                """,
                (email,)
            )

            row = cur.fetchone()

            if not row:
                return None, None

            hashed_password, user_id = row
            return hashed_password, user_id

    except Exception as e:
        print("[login_dataset error]", e)
        return None, None
