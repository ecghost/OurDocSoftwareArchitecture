import uuid
from database.base import db_cursor

# 注册
def register_dataset(username, email, password_hash):
    user_id = str(uuid.uuid4())

    sql = """
    INSERT INTO "user"(id, user_name, email, password)
    VALUES (%s, %s, %s, %s)
    """

    try:
        with db_cursor() as cur:
            cur.execute(sql, (user_id, username, email, password_hash))
        return True
    except Exception as e:
        print("[register_dataset error]", e)
        return False


def reset_password_dataset(email, password_hash):
    sql = """
    UPDATE "user"
    SET password = %s
    WHERE email = %s
    """

    try:
        with db_cursor() as cur:
            cur.execute(sql, (password_hash, email))
            if cur.rowcount == 0:
                return False
        return True
    except Exception as e:
        print("[reset_password_dataset error]", e)
        return False
