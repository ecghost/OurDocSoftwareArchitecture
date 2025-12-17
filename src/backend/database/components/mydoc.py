from database.base import db_cursor


def get_user_list():
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT id, user_name, email
            FROM "user"
            ORDER BY user_name
            """
        )

        rows = cur.fetchall()
        return [
            {
                "id": r[0],
                "user_name": r[1],
                "email": r[2]
            }
            for r in rows
        ]


def get_doc_list(user_id):
    with db_cursor() as cur:
        cur.execute(
            """
            SELECT
                room_id,
                room_name,
                overall_permission
            FROM document
            WHERE owner_user_id = %s
            ORDER BY create_time DESC
            """,
            (user_id,)
        )

        rows = cur.fetchall()
        return [
            {
                "room_id": r[0],
                "room_name": r[1],
                "overall_permission": r[2]
            }
            for r in rows
        ]


def update_visibility_dataset(room_id, overall_permission):
    with db_cursor() as cur:
        cur.execute(
            """
            UPDATE document
            SET overall_permission = %s
            WHERE room_id = %s
            """,
            (overall_permission, room_id)
        )
        return cur.rowcount > 0


def add_user_permission_dataset(room_id, user_id, permission):
    with db_cursor() as cur:
        cur.execute(
            """
            INSERT INTO permission (room_id, user_id, permission)
            VALUES (%s, %s, %s)
            ON CONFLICT (room_id, user_id)
            DO UPDATE SET permission = EXCLUDED.permission
            """,
            (room_id, user_id, permission)
        )
        return True

def remove_user_dataset(room_id, user_id):
    with db_cursor() as cur:
        cur.execute(
            """
            DELETE FROM permission
            WHERE room_id = %s
              AND user_id = %s
            """,
            (room_id, user_id)
        )
        return cur.rowcount > 0
    

def change_user_permission_dataset(room_id, user_id, permission):
    with db_cursor() as cur:
        cur.execute(
            """
            UPDATE permission
            SET permission = %s
            WHERE room_id = %s
              AND user_id = %s
            """,
            (permission, room_id, user_id)
        )
        return cur.rowcount > 0


def change_room_name_dataset(room_id, room_name):
    with db_cursor() as cur:
        cur.execute(
            """
            UPDATE document
            SET room_name = %s
            WHERE room_id = %s
            """,
            (room_name, room_id)
        )
        return cur.rowcount > 0


def delete_room_dataset(room_id):
    with db_cursor() as cur:
        # 删除权限
        cur.execute(
            "DELETE FROM permission WHERE room_id = %s",
            (room_id,)
        )

        # 删除内容
        cur.execute(
            "DELETE FROM content WHERE room_id = %s",
            (room_id,)
        )

        # 删除文档
        cur.execute(
            "DELETE FROM document WHERE room_id = %s",
            (room_id,)
        )

        return cur.rowcount > 0
