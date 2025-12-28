from flask import Flask, request, jsonify
import openai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

openai.api_key = "sk-ovRcRdRZIB1PMdovB6851069A8Ce43A2B330BaA85eC85e8e"
openai.base_url = "https://api.gpt.ge/v1/"
openai.default_headers = {"x-foo": "true"}

@app.route("/ai/chat", methods=["POST"])
def chat_with_ai():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "请求体不能为空"}), 400

    room_content = data.get("room_content")
    message = data.get("message")
    include_doc = data.get("include_doc", False)

    if not message:
        return jsonify({"error": "message missing"}), 400

    # 构造 prompt
    if include_doc and room_content:
        prompt = f"""请参考以下文档内容回答问题：

{room_content}

问题：{message}
"""
    else:
        prompt = message
    print(prompt)

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
        print("AI Error:", str(e))
        return jsonify({
            "error": "AI 服务异常",
            "detail": str(e)
        }), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
