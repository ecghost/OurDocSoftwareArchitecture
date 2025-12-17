from flask import Blueprint, request, jsonify
from passlib.hash import bcrypt
import random
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr
from email.header import Header

from database.components.auth import register_dataset, reset_password_dataset

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

SMTP_HOST = "smtp.qq.com"
SMTP_PORT = 465
SMTP_USER = "1933920868@qq.com"
SMTP_PASS = "eltsxxlfrvfobfei"

# ⚠ Serverless 内存变量：冷启动会丢
verify_codes = {}

# ---------------- 发送验证码 ----------------
@auth_bp.route("/send-code", methods=["POST"])
def send_code():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "email 不能为空"}), 400

    code = str(random.randint(100000, 999999))
    verify_codes[email] = code

    # TODO：生产环境应改为 Redis / OBS / DCS
    print(f"[验证码] {email} -> {code}")

    return jsonify({"msg": "验证码已发送"})


# ---------------- 注册 ----------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    verify_code = data.get("verifyCode")

    if verify_code != verify_codes.get(email):
        return jsonify({"error": "验证码错误"}), 400

    hashed = bcrypt.hash(password[:72])

    msg = register_dataset(username, email, hashed)
    if msg:
        return jsonify({"msg": "注册成功"})
    else:
        return jsonify({"error": "注册失败"}), 400


# ---------------- 重置密码 ----------------
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()

    email = data.get("email")
    new_password = data.get("newPassword")
    verify_code = data.get("verifyCode")

    if verify_code != verify_codes.get(email):
        return jsonify({"error": "验证码错误"}), 400

    hashed = bcrypt.hash(new_password[:72])
    msg = reset_password_dataset(email, hashed)

    if msg:
        return jsonify({"msg": "密码重置成功"})
    else:
        return jsonify({"error": "密码重置失败"}), 400
