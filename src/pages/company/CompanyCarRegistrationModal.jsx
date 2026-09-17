import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VehicleForm from './VehicleForm';

export default function CompanyCarRegistrationModal({ isOpen, onClose, onSubmit, mode = 'register', initialData = null }) {
  const [pending, setPending] = useState(false);
  return <Dialog open={isOpen} onClose={() => { if (!pending) onClose(); }} fullWidth maxWidth={false} aria-labelledby="vehicle-form-title" sx={{ '& .MuiDialog-container': { justifyContent: 'flex-end' } }} PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, maxWidth: '100%', height: '100dvh', maxHeight: '100dvh', borderRadius: 0, m: 0 } }}>
    <DialogTitle id="vehicle-form-title" sx={{ fontSize: 20, fontWeight: 600, p: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 }, pr: 7 }}>{mode === 'edit' ? '차량 수정' : '차량 등록'}<IconButton aria-label="차량 입력 닫기" disabled={pending} onClick={onClose} sx={{ position: 'absolute', top: 12, right: 12 }}><CloseIcon /></IconButton></DialogTitle>
    <DialogContent sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>{isOpen && <VehicleForm key={`${mode}-${initialData?.id ?? 'new'}`} mode={mode} initialData={initialData} onSubmit={onSubmit} onCancel={onClose} onPendingChange={setPending} />}</DialogContent>
  </Dialog>;
}
