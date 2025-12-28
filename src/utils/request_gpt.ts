import axios, { type AxiosInstance } from "axios";

interface MyAxios extends AxiosInstance {
  get<T = unknown>(url: string, config?: unknown): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: unknown): Promise<T>;
}

const airequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_GPT,
  timeout: 9000,
}) as MyAxios;

airequest.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

airequest.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error("API Error:", err);
    return Promise.reject(err);
  }
);

export default airequest;
