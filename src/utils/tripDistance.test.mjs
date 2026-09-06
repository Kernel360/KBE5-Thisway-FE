import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTripDistance, liveTripDistance } from './tripDistance.mjs';

test('unknown or invalid distances are not rendered as zero kilometers', () => {
  for (const value of [null, undefined, NaN, Infinity, -1, '500']) {
    assert.equal(formatTripDistance(value), '확인 불가');
  }
  assert.equal(formatTripDistance(0), '0.0 km');
  assert.equal(formatTripDistance(1500), '1.5 km');
});

test('SSE cumulative meters must subtract a known start reading', () => {
  assert.equal(liveTripDistance(1000, 1500), 500);
  assert.equal(liveTripDistance(1000, 1000), 0);
  for (const [start, end] of [[null, 1500], [undefined, 1500], [1000, 900], [1000, null], [-1, 0]]) {
    assert.equal(liveTripDistance(start, end), null);
  }
});
