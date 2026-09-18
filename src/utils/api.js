import axios from "axios";

// JWT 토큰 저장 함수
export function saveTokenFromResponse(response) {
  // 다양한 토큰 필드명 시도
  const token = response.data?.token || 
                response.data?.accessToken || 
                response.data?.access_token ||
                response.data?.jwt ||
                response.data?.authToken;
                
  if (token) {
    localStorage.setItem("token", token);
    
    // 저장 확인
    const savedToken = localStorage.getItem("token");
    if (savedToken === token) {
      return token;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// 디버깅용 헬퍼 함수들 - 브라우저 콘솔에서 사용 가능
window.checkToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    console.log('현재 토큰:', token);
    try {
      // JWT 토큰 디코딩 (간단한 검증)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('토큰 내용:', payload);
      console.log('만료 시간:', new Date(payload.exp * 1000));
    } catch (e) {
      console.log('토큰 디코딩 실패 - 유효하지 않은 JWT 형식일 수 있음');
    }
  } else {
    console.log('토큰이 없습니다.');
  }
};

window.clearToken = () => {
  localStorage.removeItem("token");
  console.log('토큰이 삭제되었습니다.');
};

// 로그인용: 토큰 필요 없음 - 프록시를 통해 상대 경로로 호출
export const loginApi = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT 인증 필요: 인터셉터로 토큰 자동 주입 - 프록시를 통해 상대 경로로 호출
export const authApi = axios.create({
  baseURL: "/api",
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
