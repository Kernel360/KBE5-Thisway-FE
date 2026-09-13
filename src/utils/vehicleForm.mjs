export const normalizeCarNumber = (value) => value.replace(/\s/g, '');
export function buildVehiclePayload({ selectedModel, carNumber, color, mode = 'register' }) {
  const normalized = normalizeCarNumber(carNumber);
  if (mode !== 'edit' && !selectedModel?.id) throw new Error('차량 모델을 선택해주세요.');
  if (/[가-힣]{3,}/.test(normalized) || !/^(\d{2,3}[가-힣]\d{4}|[가-힣]{3}\d{4}|[가-힣]\d{4}|[가-힣]\d{2}[가-힣]\d{4})$/.test(normalized)) {
    throw new Error('차량번호 형식을 확인해주세요. 예: 12가3456, 123가4567');
  }
  if (!color.trim()) throw new Error('차량 색상을 입력해주세요.');
  return { ...(selectedModel?.id ? { vehicleModelId: selectedModel.id } : {}), carNumber: normalized, color: color.trim() };
}
export function vehicleFailureMessage(error, action = '저장') {
  const code = String(error.response?.data?.code ?? '');
  if (code === '14002') return '이미 등록된 차량번호입니다. 차량번호를 확인해주세요.';
  if (code === '14005') return '선택한 모델을 사용할 수 없습니다. 다른 모델을 선택해주세요.';
  if (error.response?.status === 403) return '이 작업을 수행할 권한이 없습니다.';
  return `차량 ${action}에 실패했습니다. 입력 내용을 확인하고 다시 시도해주세요.`;
}
export const validVehiclePage = (page, totalPages) => Math.min(page, Math.max(1, totalPages));
