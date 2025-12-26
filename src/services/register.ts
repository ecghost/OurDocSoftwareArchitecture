import request from "../utils/request.ts";

export interface RegisterParams {
  email: string;
  username: string | undefined;
  password: string;
  verifyCode: string;
}

export const register = (data: RegisterParams) => {
  return request.post<RegisterParams>("/auth/register", data);
};
