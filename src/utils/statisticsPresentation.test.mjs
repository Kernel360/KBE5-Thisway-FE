import test from 'node:test';
import assert from 'node:assert/strict';
import { hasCurrentStatistics, formatDrivingMinutes, statisticsCoverageMessage } from './statisticsPresentation.mjs';

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
