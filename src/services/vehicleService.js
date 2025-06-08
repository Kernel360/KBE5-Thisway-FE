import { authApi } from '../utils/api';

export const vehicleService = {
  // 차량 등록
  registerVehicle: async (vehicleData) => {
    try {
      const response = await authApi.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      
      if (error.response?.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || '잘못된 요청입니다.';
        throw new Error(`요청 오류: ${errorMessage}`);
      } else if (error.response?.status === 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('네트워크 연결을 확인해주세요. 백엔드 서버가 실행 중인지 확인하세요.');
      }
      
      throw new Error(`차량 등록에 실패했습니다: ${error.message}`);
    }
  },

  // 차량 목록 조회 (페이징)
  getVehicles: async (page = 0, size = 10) => {
    try {
      const response = await authApi.get('/vehicles', {
        params: {
          page,
          size,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error('차량 목록 조회에 실패했습니다.');
    }
  },

  // 차량 상세 조회
  getVehicleDetail: async (id) => {
    try {
      const response = await authApi.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error('차량 상세 정보 조회에 실패했습니다.');
    }
  },

  // 차량 삭제
  deleteVehicle: async (id) => {
    try {
      const response = await authApi.delete(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error('차량 삭제에 실패했습니다.');
    }
  },

  // 차량 수정
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await authApi.patch(`/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      }
      throw new Error('차량 정보 수정에 실패했습니다.');
    }
  },
};