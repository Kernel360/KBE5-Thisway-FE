import axios from "axios";

// JWT 토큰 저장 함수
export function saveTokenFromResponse(response) {
  const token = response.data?.token;
  if (token) {
    localStorage.setItem("token", token);
    return token;
  }
  return null;
}

// 로그인용: 토큰 필요 없음
export const loginApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT 인증 필요: 인터셉터로 토큰 자동 주입
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("token");
      // 필요하다면 아래 주석을 해제해서 로그인 페이지로 이동
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
