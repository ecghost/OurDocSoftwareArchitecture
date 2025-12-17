import request from "../utils/request.ts";

interface LoginParams {
    email: string
    password: string
}

interface LoginResponse {
    msg: string
    userId: string
}

export const login = (data: LoginParams): Promise<LoginResponse> => {
    // console.log(data)
    return request.post<LoginResponse>('/auth/login', data)
}

