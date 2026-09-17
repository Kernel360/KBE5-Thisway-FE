import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVehiclePayload, validVehiclePage, vehicleFailureMessage } from './vehicleForm.mjs';
test('registration uses an actual model ID and normalized server fields only', () => {
  assert.deepEqual(buildVehiclePayload({ selectedModel: { id: 37, model: 'test' }, carNumber: '12가 3456', color: ' 흰색 ' }), { vehicleModelId: 37, carNumber: '12가3456', color: '흰색' });
});
test('editing retains existing model when the response has no model ID', () => {
  assert.deepEqual(buildVehiclePayload({ mode: 'edit', carNumber: '123가4567', color: '검정' }), { carNumber: '123가4567', color: '검정' });
});
test('an explicit replacement model is included in PATCH', () => {
  assert.equal(buildVehiclePayload({ mode: 'edit', selectedModel: { id: 22 }, carNumber: '123가4567', color: '회색' }).vehicleModelId, 22);
});
test('invalid inputs cannot become registration requests', () => {
  assert.throws(() => buildVehiclePayload({ carNumber: '12가3456', color: '흰색' }), /모델/);
  assert.throws(() => buildVehiclePayload({ mode: 'edit', carNumber: '서울가3456', color: '흰색' }), /형식/);
  assert.throws(() => buildVehiclePayload({ mode: 'edit', carNumber: '12가3456', color: ' ' }), /색상/);
});
test('after deleting the last row the requested page is corrected', () => {
  assert.equal(validVehiclePage(3, 2), 2); assert.equal(validVehiclePage(1, 0), 1);
});
test('failure messages are bounded and do not expose server secrets', () => {
  assert.match(vehicleFailureMessage({ response: { data: { code: 14002 } } }), /이미 등록/);
  assert.match(vehicleFailureMessage({ response: { data: { code: '14005' } } }), /모델/);
  assert.doesNotMatch(vehicleFailureMessage({ response: { data: { message: 'SYNTHETIC_SECRET' } } }), /SYNTHETIC_SECRET/);
});
