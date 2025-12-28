from flask import Blueprint, request, jsonify
from database.components.mainpage import (
    main_page_dataset,
    get_edit_permission_dataset,
    get_read_permission_dataset,
    get_room_content
)
import openai

mainpage_bp = Blueprint("mainpage", __name__)
openai.api_key = "sk-ovRcRdRZIB1PMdovB6851069A8Ce43A2B330BaA85eC85e8e"
openai.base_url = "https://api.gpt.ge/v1/"
openai.default_headers = {"x-foo": "true"}
 
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


# ---------------- AI功能 ----------------
@mainpage_bp.route("/ai/chat", methods=["POST"])
def chat_with_ai():
    data = request.get_json()

    if not data:
        return jsonify({"error": "请求体不能为空"}), 400

    room_content = data.get("room_content")
    message = data.get("message")
    include_doc = data.get("include_doc", False)

    if not room_content or not message:
        return jsonify({"error": "room_id or message missing"}), 400

    if include_doc and include_doc:
        document = room_content
        prompt = f"""
请参考以下文档内容回答问题：

{document}

问题：{message}
"""
    else:
        prompt = message

    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        reply = response.choices[0].message.content

        return jsonify({
            "reply": reply
        })

    except Exception as e:
        print(str(e))
        return jsonify({
            "error": "AI 服务异常",
            "detail": str(e)
        }), 500