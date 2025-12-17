// src/utils/request.ts
import axios from "axios";

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 9000,
})

request.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

request.interceptors.response.use(
    res => res.data,
    err => {
        console.error('API Error:', err)
        return Promise.reject(err)
    }
)

export default request
