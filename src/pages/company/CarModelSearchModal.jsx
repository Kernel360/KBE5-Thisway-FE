import React, { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Chip, FormControlLabel, InputAdornment, LinearProgress, Pagination, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { authApi } from '../../utils/api';

// Inline picker: registration and editing share one focus scope, without nested dialogs.
export default function CarModelSearchModal({ onSelect, selectedModel, disabled = false }) {
  const [models, setModels] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const requestVersion = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    const version = ++requestVersion.current;
    setLoading(true); setError('');
    authApi.get('/vehicle-models', { params: { page: page - 1, size: 3 }, signal: controller.signal })
      .then(({ data }) => { if (version !== requestVersion.current || controller.signal.aborted) return;
        setModels(data.vehicleModels ?? []); setTotalPages(Math.max(1, data.pageInfo?.totalPages ?? 1));
      }).catch(() => { if (!controller.signal.aborted && version === requestVersion.current) setError('차량 모델을 불러오지 못했습니다.'); })
      .finally(() => { if (!controller.signal.aborted && version === requestVersion.current) setLoading(false); });
    return () => { controller.abort(); requestVersion.current += 1; };
  }, [page, retry]);
  const filtered = models.filter(model => `${model.manufacturer} ${model.model} ${model.modelYear}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <Box>
    <TextField fullWidth size="small" inputProps={{ 'aria-label': '현재 페이지에서 모델 찾기' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#51606B' }} /></InputAdornment> }} placeholder="현재 페이지에서 모델 찾기" sx={{ '& .MuiOutlinedInput-root': { height: 42, fontSize: 14, borderRadius: '6px' }, '& fieldset': { borderColor: '#E3E9EE' } }} value={query} disabled={disabled} onChange={e => setQuery(e.target.value)} />
    {selectedModel && !models.some(model => model.id === selectedModel.id) && <Typography variant="body2" sx={{ my: 1.5, color: 'primary.main', fontWeight: 600 }}>선택: {selectedModel.manufacturer} {selectedModel.model} · {selectedModel.modelYear}년</Typography>}
    {loading ? <LinearProgress aria-label="차량 모델 불러오는 중" sx={{ my: 2 }} /> : error ? <Alert severity="error" action={<Button disabled={disabled} onClick={() => setRetry(v => v + 1)}>재시도</Button>}>{error}</Alert> : <>
      <RadioGroup sx={{ mt: 1.5, gap: 1.25 }} aria-label="차량 모델" value={selectedModel?.id ?? ''} onChange={e => onSelect(models.find(model => String(model.id) === e.target.value))}>
        {filtered.map(model => <FormControlLabel key={model.id} value={model.id} disabled={disabled} control={<Radio />} label={<Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}><Box><Typography sx={{ fontSize: 15, fontWeight: selectedModel?.id === model.id ? 600 : 500, color: '#334155' }}>{model.manufacturer} {model.model}</Typography><Typography sx={{ fontSize: 13, color: '#51606B', mt: .25 }}>{model.modelYear}년형</Typography></Box>{selectedModel?.id === model.id && <Chip size="small" label="선택됨" sx={{ height: 24, fontSize: 12, bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }} />}</Stack>} sx={{ mx: 0, my: 0, p: 1.4, height: 64, boxSizing: 'border-box', border: selectedModel?.id === model.id ? '2px solid #2563EB' : '1px solid #E3E9EE', borderRadius: '6px', bgcolor: selectedModel?.id === model.id ? '#EFF6FF' : '#FFFFFF', '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 }, '& .MuiRadio-root': { mr: .75, p: .5, color: '#BDC9CA', '&.Mui-checked': { color: '#2563EB' } } }} />)}
      </RadioGroup>
      {!filtered.length && <Typography role="status" sx={{ py: 2 }} color="text.secondary">현재 페이지에 일치하는 모델이 없습니다.</Typography>}
    </>}
    <Stack alignItems="center" sx={{ mt: 2 }}><Pagination shape="rounded" sx={{ width: '100%', '& ul': { flexWrap: 'nowrap' }, '& li:first-of-type': { mr: 'auto' }, '& li:last-of-type': { ml: 'auto' }, '& .Mui-selected': { bgcolor: '#2B3135 !important', color: 'white' }, '& .MuiPaginationItem-root': { borderRadius: '4px' } }} aria-label="차량 모델 페이지" count={totalPages} page={page} disabled={disabled || loading} onChange={(_, value) => setPage(value)} size="small" /></Stack>
  </Box>;
}
