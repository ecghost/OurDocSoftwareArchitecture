# routers/dataset.py
from database.base import db_cursor


# ---------------- 主页面房间列表 ----------------
def main_page_dataset(user_id):
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT
                d.room_id,
                d.room_name,
                u.user_name AS owner_user_name,
                COALESCE(p.permission, d.overall_permission) AS permission
            FROM document d
            JOIN "user" u
                ON d.owner_user_id = u.id
            LEFT JOIN permission p
                ON d.room_id = p.room_id
               AND p.user_id = %s
            ORDER BY d.create_time DESC
            """,
            (user_id,)
        )

        rows = cur.fetchall()

        result = []
        for r in rows:
            result.append({
                "room_id": r[0],
                "room_name": r[1],
                "owner_user_name": r[2],
                "permission": r[3]
            })

        return result


def get_edit_permission_dataset(room_id, user_id):
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT
                CASE
                    WHEN d.owner_user_id = %s THEN 1
                    WHEN p.permission >= 2 THEN 1
                    ELSE 0
                END
            FROM document d
            LEFT JOIN permission p
                ON d.room_id = p.room_id
               AND p.user_id = %s
            WHERE d.room_id = %s
            """,
            (user_id, user_id, room_id)
        )

        row = cur.fetchone()
        return row[0] if row else 0


def get_read_permission_dataset(room_id, user_id):
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT
                CASE
                    WHEN d.owner_user_id = %s THEN 1
                    WHEN p.permission >= 1 THEN 1
                    WHEN d.overall_permission >= 1 THEN 1
                    ELSE 0
                END
            FROM document d
            LEFT JOIN permission p
                ON d.room_id = p.room_id
               AND p.user_id = %s
            WHERE d.room_id = %s
            """,
            (user_id, user_id, room_id)
        )

        row = cur.fetchone()
        return row[0] if row else 0
