from app import app

def handler(event, context):
    """
    华为云 FunctionGraph HTTP 触发器入口
    """
    return app(event, context)
