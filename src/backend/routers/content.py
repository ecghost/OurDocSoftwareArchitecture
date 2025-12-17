from flask import Blueprint, request, jsonify
from datetime import datetime
import zlib

from database.components.content import (
    create_doc_dataset,
    get_content_dataset,
    update_dataset
)

content_bp = Blueprint("content", __name__)


# ---------------- 工具函数 ----------------
def generate_room_id(name: str) -> str:
    hash_int = zlib.crc32(name.encode("utf-8"))
    room_id = str(hash_int % 1000000).zfill(6)
    return room_id


# ---------------- 创建文档 ----------------
@content_bp.route("/content/createdoc", methods=["POST"])
def createdoc():
    data = request.get_json()

    room_name = data.get("room_name")
    user_id = data.get("user_id")

    if not room_name or not user_id:
        return jsonify({"error": "room_name 和 user_id 不能为空"}), 400

    room_id = generate_room_id(room_name)
    create_time = datetime.now().strftime("%Y-%m-%d")

    content = ""
    overall_permission = 1
    permission = 1

    res = create_doc_dataset(
        room_id,
        room_name,
        create_time,
        user_id,
        content,
        overall_permission,
        permission
    )

    return jsonify(res)


# ---------------- 获取文档内容 ----------------
@content_bp.route("/content/getcontent", methods=["GET"])
def get_content():
    room_id = request.args.get("room_id")

    if not room_id:
        return jsonify({"error": "room_id 参数缺失"}), 400

    contents = get_content_dataset(room_id)

    return jsonify({
        "room_id": room_id,
        "room_name": "",
        "content": contents
    })


# ---------------- 更新文档内容 ----------------
@content_bp.route("/content/update", methods=["POST"])
def update():
    data = request.get_json()

    room_id = data.get("room_id")
    content = data.get("content")

    if not room_id:
        return jsonify({"error": "room_id 不能为空"}), 400

    update_dataset(room_id, content)

    return jsonify({
        "msg": "保存成功",
        "room_id": room_id
    })
