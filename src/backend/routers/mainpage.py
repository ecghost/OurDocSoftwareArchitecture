from flask import Blueprint, request, jsonify
from database.components.mainpage import (
    main_page_dataset,
    get_edit_permission_dataset,
    get_read_permission_dataset
)

mainpage_bp = Blueprint("mainpage", __name__)

 
# ---------------- 获取房间列表 ----------------
@mainpage_bp.route("/rooms", methods=["GET"])
def get_rooms():
    userid = request.args.get("userid")

    if not userid:
        return jsonify({"error": "userid 参数缺失"}), 400

    room_data = main_page_dataset(userid)

    # room_data 应该是：
    # [
    #   {
    #     "room_id": "...",
    #     "room_name": "...",
    #     "owner_user_name": "...",
    #     "permission": 1
    #   }
    # ]
    return jsonify(room_data)


# ---------------- 编辑权限 ----------------
@mainpage_bp.route("/main/edit_permission", methods=["GET"])
def edit_permission():
    room_id = request.args.get("room_id")
    user_id = request.args.get("user_id")

    if not room_id or not user_id:
        return jsonify({"error": "room_id 或 user_id 参数缺失"}), 400

    value = get_edit_permission_dataset(room_id, user_id)
    return jsonify(bool(value))


# ---------------- 读取权限 ----------------
@mainpage_bp.route("/main/read_permission", methods=["GET"])
def read_permission():
    room_id = request.args.get("room_id")
    user_id = request.args.get("user_id")

    if not room_id or not user_id:
        return jsonify({"error": "room_id 或 user_id 参数缺失"}), 400

    value = get_read_permission_dataset(room_id, user_id)
    return jsonify(bool(value))
