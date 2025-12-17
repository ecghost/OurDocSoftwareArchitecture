import request from "../utils/request.ts";

interface GetVerifyCodeParams {
    email: string
}

interface ResetPasswordParams {
    verifyCode: string
    email: string
    newPassword: string
}

export const getVerifyCode = (data: GetVerifyCodeParams) => {
    return request.post<{ msg: string }>('/auth/send-code', data)
}

export const resetPassword = (data: ResetPasswordParams) => {
    return request.post<ResetPasswordParams>('/auth/reset-password', data)
}
