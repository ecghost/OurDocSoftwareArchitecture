from flask import Flask, jsonify
from flask_cors import CORS

# 导入所有 Blueprint
from routers.auth import auth_bp
from routers.login import auth_bp as login_bp
from routers.content import content_bp
from routers.mainpage import mainpage_bp
from routers.mydoc import mydocs_bp

# 数据库
from database.connection import init_db_pool


def create_app():
    app = Flask(__name__)

    # ---------------- CORS ----------------
    # 如果前后端分离，这是必须的
    CORS(app, supports_credentials=True)

    # ---------------- 数据库 ----------------
    init_db_pool(app)

    # ---------------- 注册 Blueprint ----------------
    app.register_blueprint(auth_bp)        # /auth/*
    app.register_blueprint(login_bp)       # /auth/login
    app.register_blueprint(content_bp)     # /content/*
    app.register_blueprint(mainpage_bp)    # /rooms /main/*
    app.register_blueprint(mydocs_bp)      # /mydocs/*

    # ---------------- 健康检查 ----------------
    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})

    return app


# Flask 实例
app = create_app()

for rule in app.url_map.iter_rules():
    print(
        f"endpoint={rule.endpoint:30s} "
        f"methods={','.join(rule.methods):20s} "
        f"path={rule.rule}"
    )

# ---------------- 本地启动 ----------------
if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=9000,
        debug=True
    )
