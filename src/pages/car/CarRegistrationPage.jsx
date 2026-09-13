import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { authApi } from '../../utils/api';
import { ROUTES } from '../../routes';
import VehicleForm from '../company/VehicleForm';

export default function CarRegistrationPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(null);
  const [pending, setPending] = useState(false);
  const back = () => navigate(ROUTES.company.carManagement);
  return <Box className="page-container" sx={{ maxWidth: 820, mx: 'auto', minWidth: 0 }}>
    <Button startIcon={<ArrowBackIcon />} disabled={pending} onClick={back} sx={{ mb: 2 }}>차량 관리</Button>
    <Typography variant="h1" sx={{ mb: 3 }}>차량 등록</Typography>
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: '14px', borderColor: '#E3E9EE', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
      {saved ? <Stack spacing={3}><Alert severity="success">{saved.carNumber} 차량이 등록되었습니다.</Alert><Typography>등록한 차량은 차량 관리에서 확인할 수 있습니다.</Typography><Stack direction="row" spacing={1}><Button variant="contained" onClick={back}>목록에서 확인</Button><Button variant="outlined" onClick={() => setSaved(null)}>다른 차량 등록</Button></Stack></Stack> : <VehicleForm onPendingChange={setPending} onCancel={back} onSubmit={async payload => { await authApi.post('/vehicles', payload); setSaved(payload); }} />}
    </Paper>
  </Box>;
}
