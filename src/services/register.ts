import request from "../utils/request.ts";

interface RegisterParams {
    email: string
    username: string
    password: string
    verifyCode: string
}

export const register = (data: RegisterParams) => {
    return request.post<RegisterParams>('/auth/register', data)
}

