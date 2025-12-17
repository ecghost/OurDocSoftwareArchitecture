from database.base import db_cursor


# ---------------- 创建文档 ----------------
def create_doc_dataset(
    room_id,
    room_name,
    create_time,
    user_id,
    content,
    overall_permission,
    permission
):
    try:
        with db_cursor() as cur:
            # 1️⃣ document 表
            cur.execute(
                """
                INSERT INTO document
                (room_id, room_name, create_time, overall_permission, owner_user_id)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (room_id, room_name, create_time, overall_permission, user_id)
            )

            # 2️⃣ content 表
            cur.execute(
                """
                INSERT INTO content (room_id, content)
                VALUES (%s, %s)
                """,
                (room_id, content)
            )

            # 3️⃣ permission 表（创建者默认权限）
            cur.execute(
                """
                INSERT INTO permission (room_id, user_id, permission)
                VALUES (%s, %s, %s)
                """,
                (room_id, user_id, permission)
            )

        return {
            "msg": "文档创建成功",
            "room_id": room_id
        }

    except Exception as e:
        print("[create_doc_dataset error]", e)
        return {
            "error": "文档创建失败"
        }


# ---------------- 获取文档内容 ----------------
def get_content_dataset(room_id):
    try:
        with db_cursor() as cur:
            cur.execute(
                """
                SELECT content
                FROM content
                WHERE room_id = %s
                """,
                (room_id,)
            )
            row = cur.fetchone()
            return row[0] if row else ""

    except Exception as e:
        print("[get_content_dataset error]", e)
        return ""


# ---------------- 更新文档内容 ----------------
def update_dataset(room_id, content):
    try:
        with db_cursor() as cur:
            cur.execute(
                """
                UPDATE content
                SET content = %s
                WHERE room_id = %s
                """,
                (content, room_id)
            )
        return True

    except Exception as e:
        print("[update_dataset error]", e)
        return False
