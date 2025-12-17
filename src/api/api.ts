import axios from 'axios';

const BASE_URL = 'http://localhost:8000';  // 后端统一地址，可改成 config 文件引用

interface SendCodeParams {
  email: string;
}

interface RegisterParams {
  email: string;
  username?: string;
  password: string;
  verifyCode: string;
  confirmPassword: string;
}

interface LoginResponse {
  msg?: string;
  userid: string;
}

interface LoginParams {
  email: string;
  password: string;
}

export type DocVisibility = 0 | 1 | 2 | 3;

export type DocumentItem = {
    room_id: string;
    room_name: string;
    create_time: string;
    overall_permission: DocVisibility;
    permissions: Record<
        string,
        { id: string; user_name: string; email: string; permission: 2 | 3 }
    >;
};

export type User = {
    id: string;
    user_name: string;
    email: string;
    avatarColor?: string;
};

const USERID_KEY = 'UserId';


// =================================== authmodal ===================================

// 发送验证码
export const sendVerificationCode = async (params: SendCodeParams) => {
  return axios.post(`${BASE_URL}/auth/send-code`, params);
};

// 注册
export const registerUser = async (params: RegisterParams) => {
  return axios.post(`${BASE_URL}/auth/register`, params);
};

// 找回密码
export const resetPassword = async (params: RegisterParams) => {
  return axios.post(`${BASE_URL}/auth/reset-password`, params);
};


// =================================== Login ===================================

// 登录的
export const loginUser = async (params: LoginParams): Promise<LoginResponse> => {
  const res = await axios.post(`${BASE_URL}/auth/login`, params);
  return res.data;
};



// =================================== MainPage ===================================

// 获取 userid
export const getUserId = (): string => {
  return localStorage.getItem(USERID_KEY) || '';
}

// 权限相关，checkViewPermission为可读，checkEditPermission为可写
export const checkViewPermission = async (roomId: string | null, userId?: string): Promise<boolean> => {
  if (!roomId) return false;
  const uid = userId || getUserId();
  try {
    const res = await axios.get<boolean>(`${BASE_URL}/main/read_permission`, {
      params: { room_id: roomId, user_id: uid }
    });
    return res.data ?? false;
  } catch (err) {
    console.error('checkViewPermission error', err);
    return false;
  }
}

export const checkEditPermission = async (roomId: string | null, userId?: string): Promise<boolean> => {
  if (!roomId) return false;
  const uid = userId || getUserId();
  try {
    const res = await axios.get<boolean>(`${BASE_URL}/main/edit_permission`, {
      params: { room_id: roomId, user_id: uid }
    });
    return res.data ?? false;
  } catch (err) {
    console.error('checkEditPermission error', err);
    return false;
  }
}

// 获取房间列表
export interface RoomItem {
  room_id: string;
  room_name: string;
  owner_user_name: string;
}

// 展示房间列表
export const fetchRooms = async (userId?: string): Promise<RoomItem[]> => {
  const uid = userId || getUserId();
  try {
    const res = await axios.get(`${BASE_URL}/rooms?userid=${uid}`);
    return res.data || [];
  } catch (err) {
    console.error('fetchRooms error', err);
    return [];
  }
}

// 保存文档
export const saveDocument = async (roomId: string | null, content?: string) => {
  if (!roomId) return;
  try {
    await axios.post(`${BASE_URL}/content/update`, {
      room_id: roomId,
      content: content ?? ''
    });
  } catch (err) {
    console.error('saveDocument error', err);
  }
}


// =================================== ContentWith... ===================================

// 创建文档
export const createNewDocument = async (roomName: string, userId: string) => {
    try {
        const res = await axios.post(`${BASE_URL}/content/createdoc`, {
            room_name: roomName,
            user_id: userId
        });
        return res.data;
    } catch (err) {
        console.error("createNewDocument error:", err);
        throw err;
    }
};

// 显示文档内容
export const getContentByRoom = async (roomId: string) => {
    try {
        const res = await axios.get(`${BASE_URL}/content/getcontent`, {
            params: { room_id: roomId }
        });
        return res.data?.content || "";
    } catch (err) {
        console.error("getContentByRoom error:", err);
        throw err;
    }
};


// =================================== MyDocs ===================================

// 获取该用户的所有文档
export const getDocs = async (userId: string) => {
    try {
        const res = await axios.get(`${BASE_URL}/mydocs/getdocs`, {
            params: { user_id: userId },
        });
        return res.data?.docs || [];
    } catch (err) {
        console.error("getDocs error:", err);
        throw err;
    }
};

// 获取该用户的所有文档
export const getAllUsers = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/mydocs/getusers`);
        return res.data?.users || [];
    } catch (err) {
        console.error("getAllUsers error:", err);
        throw err;
    }
};

// 更新文档的可见性 ---> 改变总权限
export const updateVisibility = async (roomId: string, visibility: number) => {
    try {
        const res = await axios.post(`${BASE_URL}/mydocs/update_visibility`, {
            room_id: roomId,
            overall_permission: visibility,
        });
        return res.data;
    } catch (err) {
        console.error("updateVisibility error:", err);
        throw err;
    }
};

// 移除用户权限
export const removeUserFromRoom = async (roomId: string, userId: string) => {
    try {
        const res = await axios.post(`${BASE_URL}/mydocs/remove_user`, {
            room_id: roomId,
            user_id: userId,
        });
        return res.data;
    } catch (err) {
        console.error("removeUser error:", err);
        throw err;
    }
};

// 修改用户权限
export const changeUserPermission = async (
    roomId: string,
    userId: string,
    permission: 2 | 3
) => {
    try {
        const res = await axios.post(`${BASE_URL}/mydocs/change_permission`, {
            room_id: roomId,
            user_id: userId,
            permission,
        });
        return res.data;
    } catch (err) {
        console.error("changeUserPermission error:", err);
        throw err;
    }
};

// 添加新用户权限
export const addUsersToRoom = async (
    roomId: string,
    users: Array<{ user_id: string; permission: 2 | 3 }>
) => {
    try {
        const res = await axios.post(`${BASE_URL}/mydocs/add_users`, {
            room_id: roomId,
            users,
        });
        return res.data;
    } catch (err) {
        console.error("addUsersToRoom error:", err);
        throw err;
    }
};

// 重命名文档
export const renameRoom = async (roomId: string, newName: string) => {
    try {
        const res = await axios.post(`${BASE_URL}/mydocs/rename_room`, {
            room_id: roomId,
            room_name: newName,
        });
        return res.data;
    } catch (err) {
        console.error("renameRoom error:", err);
        throw err;
    }
};

// 删除文档
export const deleteRoom = async (roomId: string) => {
    try {
        const res = await axios.post(`${BASE_URL}/delete_room`, {
            room_id: roomId,
        });
        return res.data;
    } catch (err) {
        console.error("deleteRoom error:", err);
        throw err;
    }
};
