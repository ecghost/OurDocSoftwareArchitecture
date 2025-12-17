import request from "../utils/request.ts";

export interface PermissionItem {
    id: string
    user_name: string
    email: string
    permission: number
}

export interface DocumentItem {
    room_id: string
    room_name: string
    create_time: string
    overall_permission: number
    permissions: Record<string, PermissionItem>
}

interface DocsResponse {
    docs: DocumentItem[]
}

export interface User {
    id: string
    user_name: string
    email: string
    avatarColor: string
}

interface UsersResponse {
    users: User[]
}

export interface PermissionItem {
    id: string
    user_name: string
    email: string
    permission: number
}

interface UpdateVisibilityRequest {
    room_id: string
    overall_permission: number
}

export interface AddUserPermission {
    user_id: string
    permission: number
}

export interface AddUsersSubmitRequest {
    room_id: string
    users: AddUserPermission
}

interface RemoveUserPermission {
    room_id: string
    user_id: string
}

interface ChangeUserPermission {
    room_id: string
    user_id: string
    permission: number
}

interface RenameDoc {
    room_id: string
    room_name: string
}

interface RemoveDoc {
    room_id: string
}

export interface CreateDocRequest {
    user_id: string | null
    room_name: string
}

interface CreateDocResponse {
    room_id: string
    room_name: string
    create_time: string
    overall_permission: number
    msg: string
    success: boolean
}

export const fetchDocs = (userId: string | null): Promise<DocsResponse> => {
    return request.get<Promise<DocsResponse>>('/mydocs/getdocs', {
        params: {user_id: userId} // 传 query 参数
    });
}

export const fetchUsers = (): Promise<UsersResponse> => {
    return request.get<UsersResponse>('/mydocs/getusers')
}

export const updateVisibility = (data: UpdateVisibilityRequest): Promise<{ msg: string }> => {
    return request.post('/mydocs/update_visibility', data)
}

export const addUsers = (data: AddUsersSubmitRequest): Promise<{ success: boolean }> => {
    return request.post('/mydocs/add_users', data)
}

export const removeUserPermission = (data: RemoveUserPermission): Promise<{ success: boolean }> => {
    return request.post('/mydocs/remove_user', data)
}

export const changePermission = (data: ChangeUserPermission): Promise<{ success: boolean }> => {
    return request.post('/mydocs/change_permission', data)
}

export const renameRoom = (data: RenameDoc): Promise<{ success: boolean }> => {
    return request.post('/mydocs/rename_room', data)
}

export const deleteRoom = (data: RemoveDoc): Promise<{ success: boolean }> => {
    return request.post('/mydocs/delete_room', data)
}

export const createDoc = (data: CreateDocRequest): Promise<CreateDocResponse> => {
    return request.post('/content/createdoc', data)
}
