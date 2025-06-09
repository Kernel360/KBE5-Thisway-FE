import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Modal,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';

const CarRegistrationModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  error, 
  setError,
  mode = 'register', // 'register' | 'edit'
  initialData = null
}) => {
  const [manufacturer, setManufacturer] = useState('');
  const [year, setYear] = useState('');
  const [modelName, setModelName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (!open) {
      setManufacturer('');
      setYear('');
      setModelName('');
      setVehicleNumber('');
      setColor('');
      setError && setError('');
    } else if (initialData && mode === 'edit') {
      setManufacturer(initialData.manufacturer || '');
      setYear(initialData.year?.toString() || '');
      setModelName(initialData.modelName || '');
      setVehicleNumber(initialData.vehicleNumber || '');
      setColor(initialData.color || '');
    }
  }, [open, initialData, mode, setError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const carData = {
      manufacturer,
      year,
      modelName,
      vehicleNumber,
      color,
    };

    try {
      await onSubmit(carData);
    } catch (error) {
      console.error('차량 등록 오류:', error);
    }
  };

  const isEditMode = mode === 'edit';
  const title = isEditMode ? '차량 수정' : '차량 등록';
  const submitText = isEditMode ? '수정' : '등록';
  const description = isEditMode ? '차량 정보를 수정해주세요' : '새로운 차량 정보를 등록해주세요';

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          maxWidth: 380,
          width: '90%',
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: 24,
          p: 2.5,
          maxHeight: '90vh',
          overflow: 'auto',
          fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'inherit', fontSize: '1.1rem' }}>
            🚗 {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'inherit', fontSize: '0.85rem' }}>
          {description}
        </Typography>

        {error && (
          <Box sx={{ 
            mb: 2, 
            p: 1.5, 
            bgcolor: 'error.main',
            color: 'error.contrastText',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.85rem'
          }}>
            ⚠️ {error}
          </Box>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit', fontSize: '0.8rem' }}>
              제조사 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={manufacturer}
              onChange={(e) => {
                setManufacturer(e.target.value);
                setError && setError('');
              }}
              placeholder="현대, 기아, BMW 등"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.85rem',
                  py: 0.75,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit', fontSize: '0.8rem' }}>
              연식 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setError && setError('');
              }}
              placeholder="2024"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.85rem',
                  py: 0.75,
                }
              }}
              inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit', fontSize: '0.8rem' }}>
              모델명 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={modelName}
              onChange={(e) => {
                setModelName(e.target.value);
                setError && setError('');
              }}
              placeholder="아반떼, 소나타, X3 등"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.85rem',
                  py: 0.75,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit', fontSize: '0.8rem' }}>
              차량번호 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={vehicleNumber}
              onChange={(e) => {
                setVehicleNumber(e.target.value);
                setError && setError('');
              }}
              placeholder="12가 3456"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.85rem',
                  py: 0.75,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit', fontSize: '0.8rem' }}>
              색상 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                setError && setError('');
              }}
              placeholder="흰색, 검정색, 회색 등"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.85rem',
                  py: 0.75,
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              onClick={onClose}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              {submitText}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default CarRegistrationModal; 