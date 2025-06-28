import { authApi } from "@/utils/api";

// 회사(사업자) 통계 관련 API 호출 함수 집합
export const statisticsService = {
  /**
   * 기간별 회사 통계 조회
   * @param {string|number} companyId   회사 ID (또는 사업자 번호)
   * @param {string} startDate         조회 시작일 (YYYY-MM-DD)
   * @param {string} endDate           조회 종료일 (YYYY-MM-DD)
   * @returns {Promise<Object>}        통계 데이터
   */
  getCompanyStatistics: async (companyId, startDate, endDate) => {
    try {
      const response = await authApi.get(`/statistics`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("인증이 필요합니다. 다시 로그인해주세요.");
      }
      if (error.code === "NETWORK_ERROR" || !error.response) {
        throw new Error(
          "네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인하세요."
        );
      }
      // 기타 오류
      const msg = error.response?.data?.message || error.message;
      throw new Error(`통계 데이터 조회에 실패했습니다: ${msg}`);
    }
  },
};
