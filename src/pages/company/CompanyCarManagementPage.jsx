import React, { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, Divider, InputAdornment, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Link, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { authApi } from '../../utils/api';
import { ROUTES } from '../../routes';
import CompanyCarRegistrationModal from './CompanyCarRegistrationModal';
import { normalizeCarNumber, validVehiclePage, vehicleFailureMessage } from '../../utils/vehicleForm.mjs';

export default function CompanyCarManagementPage() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState({ page: 1, carNumber: '', revision: 0 });
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const requestVersion = useRef(0);
  const pendingRef = useRef(false);
  const refresh = () => setQuery(v => ({ ...v, revision: v.revision + 1 }));
  useEffect(() => {
    const controller = new AbortController();
    const version = ++requestVersion.current;
    setLoading(true); setError('');
    authApi.get('/vehicles', { params: { page: query.page - 1, size: 10, ...(query.carNumber ? { carNumber: query.carNumber } : {}) }, signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted || version !== requestVersion.current) return;
        const validPage = validVehiclePage(query.page, data.totalPages ?? 0);
        if (validPage !== query.page) { setQuery(v => ({ ...v, page: validPage })); return; }
        setVehicles(data.vehicles ?? []); setTotal(data.totalElements ?? 0); setPages(Math.max(1, data.totalPages ?? 1));
      }).catch(() => { if (!controller.signal.aborted && version === requestVersion.current) setError('차량 목록을 불러오지 못했습니다. 다시 시도해주세요.'); })
      .finally(() => { if (!controller.signal.aborted && version === requestVersion.current) setLoading(false); });
    return () => { controller.abort(); requestVersion.current += 1; };
  }, [query]);
  const search = e => { e.preventDefault(); setQuery(v => ({ page: 1, carNumber: normalizeCarNumber(input), revision: v.revision + 1 })); };
  const reset = () => { setInput(''); setQuery(v => ({ page: 1, carNumber: '', revision: v.revision + 1 })); };
  const save = async payload => {
    if (form.mode === 'edit') await authApi.patch(`/vehicles/${form.vehicle.id}`, payload);
    else await authApi.post('/vehicles', payload);
    setNotice(`${payload.carNumber} 차량이 ${form.mode === 'edit' ? '수정' : '등록'}되었습니다.`);
    setForm(null);
    setInput(payload.carNumber);
    setQuery(v => ({ page: 1, carNumber: payload.carNumber, revision: v.revision + 1 }));
  };
  const closeDelete = () => { if (!pendingRef.current) { setDeleting(null); setDeleteError(''); } };
  const remove = async () => {
    if (pendingRef.current || !deleting) return;
    pendingRef.current = true; setDeletePending(true); setDeleteError('');
    try { await authApi.delete(`/vehicles/${deleting.id}`); setNotice(`${deleting.carNumber} 차량이 삭제되었습니다.`); setDeleting(null); refresh(); }
    catch (failure) { setDeleteError(vehicleFailureMessage(failure, '삭제')); }
    finally { pendingRef.current = false; setDeletePending(false); }
  };
  return <>
    <Box component="nav" aria-label="현재 위치" sx={{ height: 56, px: { xs: 2, sm: 4 }, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#fff', borderBottom: '1px solid #E3E9EE', fontSize: 12 }}>
      <Link component={RouterLink} to={ROUTES.company.dashboard} color="inherit" underline="hover">홈</Link><span aria-hidden="true">/</span><span aria-current="page">차량 관리</span>
    </Box>
    <Box className="page-container" sx={{ minWidth: 0 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
      <Box><Typography variant="h1" sx={{ fontWeight: 600, fontSize: { xs: 22, sm: 24 }, lineHeight: '36px', mb: .5 }}>차량 관리</Typography><Typography sx={{ fontSize: 14, color: '#64748B' }}>등록 차량의 정보와 시동 상태를 확인합니다.</Typography></Box>
      <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 18 }} />} sx={{ height: 40, px: 2.5, borderRadius: '6px', bgcolor: '#2563EB', fontWeight: 500 }} onClick={() => setForm({ mode: 'register' })}>차량 등록</Button>
    </Stack>
    {notice && <Alert severity="success" onClose={() => setNotice('')} sx={{ mb: 2 }}>{notice}</Alert>}
    <Paper variant="outlined" sx={{ borderRadius: '8px', borderColor: '#E3E9EE', boxShadow: 'none', overflow: 'hidden' }}>
      <Box component="form" onSubmit={search} sx={{ p: 2.5, borderBottom: '1px solid #E3E9EE', display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField inputProps={{ 'aria-label': '차량번호 검색' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#51606B' }} /></InputAdornment> }} placeholder="차량번호 검색" size="small" value={input} onChange={e => setInput(e.target.value)} sx={{ width: { xs: '100%', sm: 340 }, '& .MuiOutlinedInput-root': { height: 40, borderRadius: '6px', fontSize: 14 }, '& fieldset': { borderColor: '#E3E9EE' } }} />
        <Button type="submit" variant="contained" sx={{ height: 40, px: 2.5, bgcolor: '#15242D', borderRadius: '6px', '&:hover': { bgcolor: '#2B3135' } }}>검색</Button><Button type="button" variant="outlined" sx={{ height: 40, borderColor: '#E3E9EE', color: '#475569', borderRadius: '6px' }} onClick={reset}>초기화</Button>
        <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 0, sm: 'auto' } }}>{loading ? '불러오는 중' : error ? '조회 실패' : `${query.carNumber ? '검색 결과' : '전체'} ${total.toLocaleString()}대`}</Typography>
      </Box>
      {loading ? <Box sx={{ p: 3 }} role="status"><LinearProgress /><Typography sx={{ mt: 2 }}>차량 목록을 불러오는 중입니다.</Typography></Box> : error ? <Alert severity="error" sx={{ m: 2 }} action={<Button onClick={refresh}>다시 불러오기</Button>}>{notice ? '저장은 완료됐지만 목록을 갱신하지 못했습니다. 다시 불러와 확인해주세요.' : error}</Alert> : vehicles.length === 0 ? <Stack alignItems="center" spacing={2} sx={{ py: 7, px: 2 }}><Typography fontWeight={600}>{query.carNumber ? '차량번호와 일치하는 차량이 없습니다.' : '등록된 차량이 없습니다.'}</Typography><Button variant="outlined" onClick={query.carNumber ? reset : () => setForm({ mode: 'register' })}>{query.carNumber ? '검색 조건 초기화' : '첫 차량 등록'}</Button></Stack> : <TableContainer tabIndex={0} aria-label="차량 목록 표. 좁은 화면에서는 좌우로 스크롤하세요.">
        <Table sx={{ minWidth: 880, '& th, & td': { borderColor: '#E3E9EE', px: 2 }, '& th:first-of-type, & td:first-of-type': { pl: 3 }, '& th:last-of-type, & td:last-of-type': { pr: 3 } }}><TableHead><TableRow>{['차량번호', '모델 · 연식', '색상', '누적주행거리', '시동 상태', '관리'].map(label => <TableCell key={label} sx={{ bgcolor: '#F8FAFC', color: '#475569', whiteSpace: 'nowrap', height: 48, py: 0, fontSize: 13, fontWeight: 600, textAlign: label === '관리' ? 'right' : 'left' }}>{label}</TableCell>)}</TableRow></TableHead><TableBody>{vehicles.map(vehicle => <TableRow hover key={vehicle.id} sx={{ height: 48, '& td': { py: 0, whiteSpace: 'nowrap', fontSize: 14, color: '#334155' } }}>
          <TableCell><Link component={RouterLink} to={ROUTES.company.carDetail.replace(':id', vehicle.id)} underline="hover" sx={{ fontWeight: 700, color: 'text.primary' }}>{vehicle.carNumber}</Link></TableCell>
          <TableCell>{vehicle.manufacturer} {vehicle.model} ({vehicle.modelYear}년형)</TableCell>
          <TableCell>{vehicle.color}</TableCell><TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>{Number.isFinite(vehicle.mileage) ? `${(vehicle.mileage / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km` : '미확인'}</TableCell>
          <TableCell><Chip size="small" label={vehicle.powerOn ? '켜짐' : '꺼짐'} sx={{ height: 22, fontSize: 12, border: '1px solid', borderColor: vehicle.powerOn ? '#CDEBDC' : '#E2E8F0', bgcolor: vehicle.powerOn ? '#ECFDF5' : '#F1F5F9', color: vehicle.powerOn ? '#047857' : '#475569', fontWeight: 500, '& .MuiChip-label': { px: 1.25, display: 'flex', alignItems: 'center', gap: .7, '&:before': { content: '""', width: 6, height: 6, borderRadius: '50%', bgcolor: vehicle.powerOn ? '#10B981' : '#94A3B8' } } }} /></TableCell>
          <TableCell><Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1.25} divider={<Divider orientation="vertical" flexItem sx={{ height: 12, alignSelf: 'center' }} />} sx={{ '& .MuiButton-root': { p: 0, minWidth: 0, fontSize: 13, height: 32, fontWeight: 500 } }}><Button component={RouterLink} to={ROUTES.company.carDetail.replace(':id', vehicle.id)} aria-label={`${vehicle.carNumber} 상세보기`} sx={{ color: '#2563EB' }}>상세보기</Button><Button sx={{ color: '#475569' }} size="small" aria-label={`${vehicle.carNumber} 수정`} onClick={() => setForm({ mode: 'edit', vehicle })}>수정</Button><Button size="small" sx={{ color: '#64748B', '&:hover': { color: 'error.main' } }} aria-label={`${vehicle.carNumber} 삭제`} onClick={() => { setDeleting(vehicle); setDeleteError(''); }}>삭제</Button></Stack></TableCell>
        </TableRow>)}</TableBody></Table>
      </TableContainer>}
      {!loading && !error && <Stack alignItems="center" sx={{ py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}><Pagination aria-label="차량 목록 페이지" count={pages} page={query.page} onChange={(_, page) => setQuery(v => ({ ...v, page }))} size="small" shape="rounded" sx={{ '& .Mui-selected': { bgcolor: '#2563EB !important', color: 'white' }, '& .MuiPaginationItem-root': { borderRadius: '8px', width: 32, height: 32 } }} /></Stack>}
    </Paper>
    <CompanyCarRegistrationModal isOpen={!!form} mode={form?.mode} initialData={form?.vehicle} onClose={() => setForm(null)} onSubmit={save} />
    <Dialog open={!!deleting} onClose={closeDelete} aria-labelledby="delete-vehicle-title" aria-describedby="delete-vehicle-description" fullWidth maxWidth="xs">
      <DialogTitle id="delete-vehicle-title">차량 삭제</DialogTitle><DialogContent><DialogContentText id="delete-vehicle-description">{deleting?.carNumber} 차량을 관리 목록에서 삭제하시겠습니까? 이 화면에서는 삭제한 차량을 복구할 수 없습니다.</DialogContentText>{deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}</DialogContent><DialogActions><Button autoFocus onClick={closeDelete} disabled={deletePending}>취소</Button><Button color="error" variant="contained" onClick={remove} disabled={deletePending}>{deletePending ? '삭제 중…' : '삭제'}</Button></DialogActions>
    </Dialog>
  </Box></>;
}
