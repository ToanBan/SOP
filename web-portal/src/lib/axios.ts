import axios from "axios";
import { getAccessToken, setAccessToken } from "../context/tokenStore";

let isLoggingOut = false;

export const setIsLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !isLoggingOut
    ) {
      originalRequest._retry = true;

      try {
        const res = await api.post("/auth/refresh-token");

        const newAccessToken = res.data.accessToken;
        console.log("new access token", newAccessToken);

        setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;