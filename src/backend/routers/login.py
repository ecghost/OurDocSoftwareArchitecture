from flask import Blueprint, request, jsonify
from passlib.hash import bcrypt
from database.components.login import login_dataset

auth_bp = Blueprint("login", __name__, url_prefix="/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email 或 password 不能为空"}), 400

    hashed_password, user_id = login_dataset(email)

    if not hashed_password:
        return jsonify({"error": "用户不存在"}), 400

    # 验证密码
    if not bcrypt.verify(password, hashed_password):
        return jsonify({"error": "密码错误"}), 400

    return jsonify({
        "msg": "登录成功",
        "userId": user_id
    })
