export function formatTripDistance(meters) {
  return typeof meters === 'number' && Number.isFinite(meters) && meters >= 0
    ? `${(meters / 1000).toFixed(1)} km` : '확인 불가';
}

export function liveTripDistance(startOdometer, cumulativeMeters) {
  return Number.isInteger(startOdometer) && startOdometer >= 0
    && Number.isInteger(cumulativeMeters) && cumulativeMeters >= startOdometer
    ? cumulativeMeters - startOdometer : null;
}
