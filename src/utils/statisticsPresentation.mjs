export function hasCurrentStatistics(data) {
  return data?.quality?.formulaVersion === 2 && data.quality.coveredDays > 0;
}

export function formatDrivingMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return '-';
  return `${Math.floor(minutes / 60)}시간 ${Math.floor(minutes % 60)}분`;
}

export function statisticsCoverageMessage(data) {
  if (!data) return '통계를 조회해 주세요.';
  if (data.quality?.formulaVersion !== 2) return '이전 통계입니다. 새 기준으로 재집계가 필요합니다.';
  const q = data.quality;
  return `새 기준 집계 ${q.coveredDays}/${q.requestedDays}일 · 이전 공식 제외 ${q.excludedLegacyDays}일. `
    + (q.coveredDays < q.requestedDays ? '미집계일은 0으로 계산하지 않습니다. ' : '')
    + `미종료 운행 일별 누계 ${q.unclosedTripDays}건·일 (가동 시간에서 제외).`;
}
