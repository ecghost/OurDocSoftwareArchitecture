import request from "../utils/request.ts";
import airequest from "../utils/request_gpt.ts";

export interface Room {
  room_id: string;
  room_name: string;
  owner_user_name: string;
  permission: number;
}

interface SaveContentData {
  room_id: string;
  content: string;
}

interface GetContentData {
  room_id: string;
  room_name: string;
  content: string;
}

interface ChatAIParams {
  room_content: string;
  message: string;
  include_doc: boolean;
}


interface ChatAIResult {
  reply: string;
}

export const chatWithAI = (data: ChatAIParams): Promise<ChatAIResult> => {
  return airequest.post<ChatAIResult>("/ai/chat", data);
};


export const fetchRooms = (userid: string | undefined): Promise<Room[]> => {
  return request.get<Room[]>("/rooms", {
    params: { userid },
  });
};

export const getEditPermission = (
  roomId: string,
  userId: string | undefined
): Promise<boolean> => {
  return request.get<boolean>("/main/edit_permission", {
    params: {
      room_id: roomId,
      user_id: userId,
    },
  });
};

export const getReadPermission = (
  roomId: string,
  userId: string | undefined
): Promise<boolean> => {
  return request.get<boolean>("/main/read_permission", {
    params: {
      room_id: roomId,
      user_id: userId,
    },
  });
};

export const saveContent = (
  data: SaveContentData
): Promise<{ msg: "保存成功"; room_id: string }> => {
  return request.post("/content/update", data);
};

export const getContent = (roomId: string): Promise<GetContentData> => {
  return request.get<GetContentData>("/content/getcontent", {
    params: { room_id: roomId }, // 传 query 参数
  });
};
