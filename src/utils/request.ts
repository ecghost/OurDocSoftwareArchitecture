import axios, { type AxiosInstance } from "axios";

interface MyAxios extends AxiosInstance {
  get<T = unknown>(url: string, config?: unknown): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>;
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 9000,
}) as MyAxios;

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error("API Error:", err);
    return Promise.reject(err);
  }
);

export default request;
