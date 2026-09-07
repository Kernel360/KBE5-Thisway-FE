import test from 'node:test';
import assert from 'node:assert/strict';
import { hasCurrentStatistics, formatDrivingMinutes, statisticsCoverageMessage, statisticsFleetBasisMessage } from './statisticsPresentation.mjs';

test('backend minutes are displayed as hours and minutes, never relabeled hours', () => {
  assert.equal(formatDrivingMinutes(61), '1시간 1분');
  assert.equal(formatDrivingMinutes(300), '5시간 0분');
  assert.equal(formatDrivingMinutes(0), '0시간 0분');
  assert.equal(formatDrivingMinutes(null), '-');
});

test('legacy and uncovered results do not masquerade as V2 values', () => {
  assert.equal(hasCurrentStatistics({ averageOperationRate: 99 }), false);
  assert.equal(hasCurrentStatistics({ quality: { formulaVersion: 2, coveredDays: 0 } }), false);
  assert.match(statisticsCoverageMessage({}), /재집계/);
});

test('partial coverage and open-trip day counts are explicit', () => {
  const data = { quality: { formulaVersion: 2, coveredDays: 1, requestedDays: 3, excludedLegacyDays: 1, unclosedTripDays: 2 } };
  assert.equal(hasCurrentStatistics(data), true);
  assert.match(statisticsCoverageMessage(data), /1\/3일/);
  assert.match(statisticsCoverageMessage(data), /0으로 계산하지/);
  assert.match(statisticsCoverageMessage(data), /2건·일/);
});

test('frozen, historical unknown, and old-server fleet bases remain distinguishable', () => {
  const snapshot = statisticsFleetBasisMessage({ quality: { fleetBasis: 'INITIAL_CALCULATION_FLEET_SNAPSHOT' } });
  assert.match(snapshot, /최초 집계/);
  assert.match(snapshot, /재집계 시에도 같은 기준/);
  assert.match(statisticsFleetBasisMessage({ quality: { fleetBasis: 'LEGACY_FLEET_SNAPSHOT_UNKNOWN' } }), /확인할 수 없습니다/);
  assert.match(statisticsFleetBasisMessage({ quality: { fleetBasis: 'CURRENT_ACTIVE_FLEET_AT_CALCULATION' } }), /각 계산 시점/);
  assert.match(statisticsFleetBasisMessage({}), /제공되지 않았습니다/);
});
