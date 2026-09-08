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

export function statisticsFleetBasisMessage(data) {
  switch (data?.quality?.fleetBasis) {
    case 'INITIAL_CALCULATION_FLEET_SNAPSHOT':
      return '최초 집계 당시 기록한 활성 차량 수를 기준으로 합니다. 재집계 시에도 같은 기준을 유지합니다.';
    case 'LEGACY_FLEET_SNAPSHOT_UNKNOWN':
      return '과거 통계의 기준 차량 수를 확인할 수 없습니다. 이전 결과의 가동률을 비교할 때 확인이 필요합니다.';
    case 'CURRENT_ACTIVE_FLEET_AT_CALCULATION':
      return '각 계산 시점의 활성 차량 수를 기준으로 합니다.';
    default:
      return '기준 차량 수 정보가 제공되지 않았습니다.';
  }
}
