from flask import Blueprint, request, jsonify
from database.components.mydoc import (
    get_user_list,
    get_doc_list,
    update_visibility_dataset,
    add_user_permission_dataset,
    remove_user_dataset,
    change_user_permission_dataset,
    change_room_name_dataset,
    delete_room_dataset
)

mydocs_bp = Blueprint("mydocs", __name__)


# ---------------- 工具函数 ----------------
def id_to_color(id: str) -> str:
    h = abs(hash(id))
    r = (h & 0xFF0000) >> 16
    g = (h & 0x00FF00) >> 8
    b = h & 0x0000FF
    return f"#{r:02x}{g:02x}{b:02x}"


# ---------------- 获取用户列表 ----------------
@mydocs_bp.route("/mydocs/getusers", methods=["GET"])
def get_users():
    datas = get_user_list()  # [{"id":..., "user_name":..., "email":...}, ...]

    for data in datas:
        data["avatarColor"] = id_to_color(data["id"])

    return jsonify({"users": datas})


# ---------------- 获取文档列表 ----------------
@mydocs_bp.route("/mydocs/getdocs", methods=["GET"])
def get_docs():
    user_id = request.args.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id 参数缺失"}), 400

    datas = get_doc_list(user_id)
    return jsonify({"docs": datas})


# ---------------- 修改文档可见性 ----------------
@mydocs_bp.route("/mydocs/update_visibility", methods=["POST"])
def update_visibility():
    data = request.get_json()

    room_id = data.get("room_id")
    overall_permission = data.get("overall_permission")

    modify = update_visibility_dataset(room_id, overall_permission)

    if modify:
        return jsonify({"msg": "修改成功"})
    else:
        return jsonify({"success": False}), 400


# ---------------- 添加用户权限 ----------------
@mydocs_bp.route("/mydocs/add_users", methods=["POST"])
def add_users():
    data = request.get_json()

    room_id = data.get("room_id")
    users = data.get("users", [])

    modify = False
    for user in users:
        modify = add_user_permission_dataset(
            room_id,
            user.get("user_id"),
            user.get("permission")
        )

    if modify:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False}), 400


# ---------------- 移除用户 ----------------
@mydocs_bp.route("/mydocs/remove_user", methods=["POST"])
def remove_user():
    data = request.get_json()

    room_id = data.get("room_id")
    user_id = data.get("user_id")

    modify = remove_user_dataset(room_id, user_id)

    if modify:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False}), 400


# ---------------- 修改用户权限 ----------------
@mydocs_bp.route("/mydocs/change_permission", methods=["POST"])
def change_permission():
    data = request.get_json()

    room_id = data.get("room_id")
    user_id = data.get("user_id")
    permission = data.get("permission")

    modify = change_user_permission_dataset(room_id, user_id, permission)

    if modify:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False}), 400


# ---------------- 重命名文档 ----------------
@mydocs_bp.route("/mydocs/rename_room", methods=["POST"])
def rename_room():
    data = request.get_json()

    room_id = data.get("room_id")
    room_name = data.get("room_name")

    modify = change_room_name_dataset(room_id, room_name)

    if modify:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False}), 400


# ---------------- 删除文档 ----------------
@mydocs_bp.route("/mydocs/delete_room", methods=["POST"])
def delete_room():
    data = request.get_json()

    room_id = data.get("room_id")
    modify = delete_room_dataset(room_id)

    if modify:
        return jsonify({"success": True})
    else:
        return jsonify({"success": False}), 400
