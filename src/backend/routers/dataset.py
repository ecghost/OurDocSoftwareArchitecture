import httpx
import zlib
from typing import Union, List, Dict, Tuple, Optional
from fastapi import APIRouter, HTTPException
router = APIRouter()

GO_BASE_URL = "http://localhost:8080/api/dataset"

def generate_user_id(email: str) -> str:
    hash_int = zlib.crc32(email.encode("utf-8"))
    user_id = str(hash_int % 1000000).zfill(6)
    return user_id

class GoDatasetClient:
    def __init__(self, base_url=GO_BASE_URL):
        self.base_url = base_url
        self.client = httpx.Client()

    # 根据主键读数据库
    def read_dataset(self, dataset_name: str, main_key: Union[str, Tuple], goal_key: str = "*"):
        params = {"dataset_name": dataset_name, "main_key": str(main_key), "goal_key": goal_key}
        resp = self.client.get(f"{self.base_url}/read", params=params)
        resp.raise_for_status()
        return resp.json()["result"]
        
    # 条件查询数据库
    def read_dataset_condition(self, dataset_name: str, key_name: str, key_value: str, goal_key: str = "*"):
        params = {
            "dataset_name": dataset_name,
            "key_name": key_name,
            "key_value": key_value,
            "goal_key": goal_key
        }
        resp = self.client.get(f"{self.base_url}/read_condition", params=params)
        resp.raise_for_status()
        return resp.json()["result"]
    
    # 插入数据到数据库
    def insert_data_into_dataset(self, dataset_name: str, data: Dict):
        payload = {"dataset_name": dataset_name, "data": data}
        resp = self.client.post(f"{self.base_url}/insert", json=payload)
        resp.raise_for_status()
        return resp.json()
    
    # 修改数据库中某个键的值
    def modify_dataset_condition(self, dataset_name: str, key_name, key_value, goal_key: str, goal_value):
        payload = {
            "dataset_name": dataset_name,
            "key_name": key_name,
            "key_value": key_value,
            "goal_key": goal_key,
            "goal_value": goal_value
        }
        resp = self.client.post(f"{self.base_url}/modify", json=payload)
        resp.raise_for_status()
        return resp.json()["modified"]
    
    # 读取数据库的整列
    def read_columns_values(self, dataset_name: str, keys: Union[str, Tuple]):
        if dataset_name == "user":
            key = "id"
        elif dataset_name == "document":
            key = "room_id"
        elif dataset_name == "permission":
            key = ("room_id", "user_id")
        elif dataset_name == "content":
            key = "room_id"
        result = self.read_dataset(dataset_name, "*", "*")  # 读取整表
        if not result:
            return []
        if isinstance(keys, str):
            return [row.get(keys) for row in result]
        elif isinstance(keys, tuple):
            return [{k: row.get(k) for k in keys} for row in result]
        else:
            raise ValueError("keys 必须是 str 或 tuple")
        
    # 查询多个值
    def read_multidataset_condition(self, dataset_name: str, keys, condition_key, condition_value):
        if dataset_name == "user":
            key = "id"
        elif dataset_name == "document":
            key = "room_id"
        elif dataset_name == "permission":
            key = ("room_id", "user_id")
        elif dataset_name == "content":
            key = "room_id"
        all_rows = self.read_dataset(dataset_name,"*", "*")  # 读取整表
        if not all_rows:
            return []
        if isinstance(keys, str):
            return [row.get(keys) for row in all_rows if row.get(condition_key) == condition_value]
        elif isinstance(keys, tuple):
            return [
                {k: row.get(k) for k in keys} 
                for row in all_rows 
                if row.get(condition_key) == condition_value
            ]
        else:
            raise ValueError("keys 必须是 str 或 tuple")
    
    # 删除数据库中的行（单字段或复合主键）
    def remove_dataset_mainkey(self, dataset_name: str, main_key: Union[str, Tuple], main_value: Union[str, Tuple]):
        payload = {
            "dataset_name": dataset_name,
            "main_key": main_key,
            "main_value": main_value
        }
        resp = self.client.post(f"{self.base_url}/remove", json=payload)
        resp.raise_for_status()
        return resp.json().get("success", False)
        

dataset_client = GoDatasetClient(GO_BASE_URL)

# 注册
def register_dataset(user_name: str, email: str, password: str) -> bool:
    existing_user = dataset_client.read_dataset_condition("user", "email", email)
    if existing_user is not None:
        return False
    
    user_id = generate_user_id(email)

    if not user_name:
        user_name = user_id

    data = {
        "id": user_id,
        "user_name": user_name,
        "email": email,
        "password": password
    }

    dataset_client.insert_data_into_dataset("user", data)
    return True

# 注册数据库
def reset_password_dataset(email: str, password: str) -> bool:
    modified = dataset_client.modify_dataset_condition("user", "email", email, "password", password)
    return bool(modified)

# 登录数据库
def login_dataset(email: str) -> Optional[Tuple[str, str]]:
    password = dataset_client.read_dataset_condition("user", "email", email, "password")
    if password is None:
        return None
    user_id = dataset_client.read_dataset_condition("user", "email", email, "id")
    if user_id is None:
        return None
    return password, user_id

# 创建文档数据库
def create_doc_dataset(
    room_id: str,
    room_name: str,
    create_time: str,
    user_id: str,
    content: str,
    overall_permission: str,
    permission: str
) -> dict:

    dataset_client.insert_data_into_dataset("document", {
        "room_id": room_id,
        "room_name": room_name,
        "create_time": create_time,
        "overall_permission": overall_permission,
        "owner_user_id": user_id
    })
    dataset_client.insert_data_into_dataset("permission", {
        "room_id": room_id,
        "user_id": user_id,
        "permission": permission
    })
    dataset_client.insert_data_into_dataset("content", {
        "room_id": room_id,
        "content": content
    })

    return {
        "room_id": room_id,
        "room_name": room_name,
        "create_time": create_time,
        "overall_permission": overall_permission,
        "msg": "创建成功",
        "success": True
    }


# g根据房间ID查询房间内容
def get_content_dataset(room_id: str) -> str:
    result = dataset_client.read_dataset_condition(
        dataset_name="content",
        key_name="room_id",
        key_value=room_id,
        goal_key="content"
    )

    if result is None:
        return "" 
    return result


# 更新房间内容
def update_dataset(room_id: str, content: str) -> bool:
    try:
        dataset_client.modify_dataset_condition(
            dataset_name="content",
            key_name="room_id",
            key_value=room_id,
            goal_key="content",
            goal_value=content
        )
        return True
    except Exception as e:
        print(f"更新房间内容失败: {e}")
        return False
    

# 主页面获取房间列表
def main_page_dataset(user_id: str) -> list:
    try:
        rooms = dataset_client.read_columns_values(
            dataset_name="document",
            keys=("room_id", "room_name", "owner_user_id", "overall_permission")
        )
    except Exception as e:
        print(f"获取房间列表失败: {e}")
        return []
    result = []
    for room in rooms:
        try:
            rid = room.get("room_id")
            rname = room.get("room_name")
            owner_id = room.get("owner_user_id")
            overall_perm = room.get("overall_permission")
            owner_name = dataset_client.read_dataset_condition("user", "id", owner_id, "user_name")
            if owner_name is None:
                owner_name = "未知"

            result.append({
                "room_id": rid,
                "room_name": rname,
                "owner_user_name": owner_name,
                "permission": overall_perm
            })
        except Exception as e:
            print(f"处理房间 {room} 时失败: {e}")
            continue
    return result


# 查看可写权限
def get_edit_permission_dataset(room_id: str, user_id: str) -> bool:
    try:
        overall_permission = dataset_client.read_dataset_condition("document", "room_id", room_id, "overall_permission")
        owner_user_id = dataset_client.read_dataset_condition("document", "room_id", room_id, "owner_user_id")

        # 拥有者或全局编辑权限
        if user_id == owner_user_id or overall_permission == 1:
            return True

        # 自定义权限表
        if overall_permission == 3:
            perm = dataset_client.read_dataset_condition("permission", "room_id", room_id, "permission")
            if isinstance(perm, dict):
                # 如果返回是 dict，需要找到当前用户的 permission
                perm_value = perm.get(user_id)
            else:
                perm_value = perm

            # 默认权限为不可编辑
            if perm_value is None or perm_value == 1:
                return False
            return True

        # 其他情况默认不可编辑
        return False

    except Exception as e:
        print(f"判断编辑权限失败: {e}")
        return False


# 查看可读权限
def get_read_permission_dataset(room_id: str, user_id: str) -> bool:
    try:
        overall_permission = dataset_client.read_dataset_condition("document", "room_id", room_id, "overall_permission")
        owner_user_id = dataset_client.read_dataset_condition("document", "room_id", room_id, "owner_user_id")

        # 拥有者或全局可读权限
        if user_id == owner_user_id or overall_permission in (1, 2):
            return True

        # 自定义权限表
        if overall_permission == 3:
            perm = dataset_client.read_multidataset_condition(
                dataset_name="permission",
                keys="permission",
                condition_key="user_id",
                condition_value=user_id
            )
            if perm:
                return True
            return False

        # 其他情况默认不可读
        return False

    except Exception as e:
        print(f"判断读取权限失败: {e}")
        return False


# 获取所有用户
def get_user_list():
    try:
        users = dataset_client.read_columns_values("user", ("id", "user_name", "email"))
        if not users:
            return []
        return users
    except Exception as e:
        print(f"获取用户列表失败: {e}")
        return []


# 获取文档列表
def get_doc_list(user_id: str):
    try:
        datas = dataset_client.read_multidataset_condition(
            "document",
            ("room_id", "room_name", "create_time", "overall_permission"),
            "owner_user_id",
            user_id
        )

        for data in datas:
            room_id = data['room_id']
            room_permissions = dataset_client.read_multidataset_condition(
                "permission",
                ("user_id", "permission"),
                "room_id",
                room_id
            )

            permission_info = {}
            for perm in room_permissions:
                if perm['permission'] not in [2, 3]:  # 只处理特定权限
                    continue
                user_id_each = perm['user_id']
                user_info_list = dataset_client.read_multidataset_condition(
                    "user",
                    ("id", "user_name", "email"),
                    "id",
                    user_id_each
                )
                if user_info_list:
                    user_info = user_info_list[0]
                    user_info['permission'] = perm['permission']
                    permission_info[user_id_each] = user_info

            data['permissions'] = permission_info

        return datas
    except Exception as e:
        print(f"获取文档列表失败: {e}")
        return []


# 更新总权限
def update_visibility_dataset(room_id: str, overall_permission: int) -> bool:
    try:
        modified = dataset_client.modify_dataset_condition(
            "document",
            "room_id",
            room_id,
            "overall_permission",
            overall_permission
        )
        return modified
    except Exception as e:
        print(f"更新房间整体权限失败: {e}")
        return False

# 给房间添加用户权限
def add_user_permission_dataset(room_id: str, user_id: str, permission: int) -> bool:
    try:
        dataset_client.insert_data_into_dataset(
            "permission",
            {"room_id": room_id, "user_id": user_id, "permission": permission}
        )
        return True
    except Exception as e:
        print(f"添加用户权限失败: {e}")
        return False


# 移除房间用户
def remove_user_dataset(room_id: str, user_id: str) -> bool:
    try:
        removed = dataset_client.remove_dataset_mainkey(
            "permission",
            ("room_id", "user_id"),
            (room_id, user_id)
        )
        return removed
    except Exception as e:
        print(f"移除房间用户失败: {e}")
        return False

# 修改房间中某个用户的权限
def change_user_permission_dataset(room_id: str, user_id: str, permission: int) -> bool:
    try:
        modified = dataset_client.modify_dataset_condition(
            "permission",
            ("room_id", "user_id"),
            (room_id, user_id),
            "permission",
            permission
        )
        return modified
    except Exception as e:
        print(f"修改用户权限失败: {e}")
        return False

# 修改房间名称
def change_room_name_dataset(room_id: str, room_name: str) -> bool:
    try:
        modified = dataset_client.modify_dataset_condition(
            "document",
            "room_id",
            room_id,
            "room_name",
            room_name
        )
        return modified
    except Exception as e:
        print(f"修改房间名称失败: {e}")
        return False

# 删除房间权限表中某个用户的记录
def remove_user_dataset(room_id: str, user_id: str) -> bool:
    success = dataset_client.remove_dataset_mainkey(
        "permission",
        ("room_id", "user_id"),
        (room_id, user_id)
    )
    return success

# 删除整个房间，包括房间表、权限表和内容表
def delete_room_dataset(room_id: str) -> bool:
    remove_1 = dataset_client.remove_dataset_mainkey("document", "room_id", room_id)
    remove_2 = dataset_client.remove_dataset_mainkey("permission", "room_id", room_id)
    remove_3 = dataset_client.remove_dataset_mainkey("content", "room_id", room_id)

    return remove_1 and remove_2 and remove_3