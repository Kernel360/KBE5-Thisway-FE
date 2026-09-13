import React, { useRef, useState } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import CarModelSearchModal from './CarModelSearchModal';
import { buildVehiclePayload, vehicleFailureMessage } from '../../utils/vehicleForm.mjs';

export default function VehicleForm({ mode = 'register', initialData, onSubmit, onCancel, onPendingChange = () => {} }) {
  const editing = mode === 'edit';
  const [selectedModel, setSelectedModel] = useState(null);
  const [changeModel, setChangeModel] = useState(!editing);
  const [carNumber, setCarNumber] = useState(initialData?.carNumber ?? '');
  const [color, setColor] = useState(initialData?.color ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const pendingRef = useRef(false);
  const errorRef = useRef(null);
  const submit = async e => {
    e.preventDefault();
    if (pendingRef.current) return;
    setError('');
    let payload;
    try {
      if (editing && changeModel && !selectedModel) throw new Error('변경할 차량 모델을 선택해주세요.');
      payload = buildVehiclePayload({ selectedModel: changeModel ? selectedModel : null, carNumber, color, mode });
    } catch (failure) { setError(failure.message); requestAnimationFrame(() => errorRef.current?.focus()); return; }
    pendingRef.current = true; setPending(true); onPendingChange(true);
    try { await onSubmit(payload); }
    catch (failure) { setError(vehicleFailureMessage(failure, editing ? '수정' : '등록')); requestAnimationFrame(() => errorRef.current?.focus()); }
    finally { pendingRef.current = false; setPending(false); onPendingChange(false); }
  };
  return <Box component="form" onSubmit={submit} aria-busy={pending} sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

    {error && <Alert severity="error" ref={errorRef} tabIndex={-1} sx={{ mb: 2 }}>{error}</Alert>}
    <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, minWidth: 0, mb: 4 }}>
      <Typography component="legend" fontWeight={600} sx={{ mb: 1.5, fontSize: 15, width: '100%', color: '#1E293B' }}>차량 모델 *<Box component="span" sx={{ float: 'right', fontWeight: 400, fontSize: 13, color: '#6E797B' }}>단일 선택</Box></Typography>
      {editing && <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography>현재 모델: {initialData.manufacturer} {initialData.model} · {initialData.modelYear}년</Typography>
        <Button type="button" variant="outlined" disabled={pending} onClick={() => { setChangeModel(v => !v); setSelectedModel(null); }} sx={{ alignSelf: 'flex-start' }}>{changeModel ? '기존 모델 유지' : '모델 변경'}</Button>
      </Stack>}
      {changeModel && <CarModelSearchModal selectedModel={selectedModel} onSelect={setSelectedModel} disabled={pending} />}
    </Box>
    <Stack spacing={3}>
      <Box>
        <Typography component="label" htmlFor="vehicle-number" sx={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#1E293B', mb: .75 }}>차량번호 *</Typography>
        <TextField id="vehicle-number" placeholder="12가 3456" required fullWidth value={carNumber} disabled={pending} onChange={e => setCarNumber(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { height: 44, fontSize: 14, borderRadius: '6px' }, '& fieldset': { borderColor: '#E3E9EE' } }} />
        <Typography sx={{ fontSize: 13, color: '#51606B', mt: .75 }}>공백 없이 숫자와 한글을 입력해주세요. 입력한 공백은 저장할 때 제거됩니다.</Typography>
      </Box>
      <Box>
        <Typography component="label" htmlFor="vehicle-color" sx={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#1E293B', mb: .75 }}>색상 *</Typography>
        <TextField id="vehicle-color" placeholder="흰색" required fullWidth value={color} disabled={pending} onChange={e => setColor(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { height: 44, fontSize: 14, borderRadius: '6px' }, '& fieldset': { borderColor: '#E3E9EE' } }} />
        <Typography sx={{ fontSize: 13, color: '#51606B', mt: .75 }}>차량의 대표 색상을 입력해주세요. (예: 미드나잇 블랙, 화이트)</Typography>
      </Box>
    </Stack>
    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ position: 'sticky', bottom: -24, bgcolor: 'white', zIndex: 1, pb: 2, pt: 2, mt: 'auto', '& .MuiButton-root': { height: 44, px: 3, fontSize: 14, borderRadius: '6px' }, borderTop: '1px solid', borderColor: 'divider' }}>
      <Button type="button" variant="outlined" disabled={pending} onClick={onCancel}>취소</Button>
      <Button type="submit" variant="contained" disabled={pending || !carNumber.trim() || !color.trim() || (changeModel && !selectedModel)}>{pending ? '저장 중…' : editing ? '변경 저장' : '차량 등록'}</Button>
    </Stack>
  </Box>;
}
