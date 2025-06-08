import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { vehicleService } from '../services/vehicleService';

const CarRegistrationModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    manufacturer: '',
    year: '',
    modelName: '',
    vehicleNumber: '',
    color: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('로그인 토큰이 없습니다. 다시 로그인해주세요.');
      setLoading(false);
      return;
    }

    try {
      const carData = {
        manufacturer: formData.manufacturer,
        modelYear: parseInt(formData.year, 10),
        model: formData.modelName,
        carNumber: formData.vehicleNumber,
        color: formData.color,
      };

      await vehicleService.registerVehicle(carData);
      
      // 폼 초기화
      setFormData({
        manufacturer: '',
        year: '',
        modelName: '',
        vehicleNumber: '',
        color: '',
      });
      
      // 성공 시 모달 닫기 및 부모 컴포넌트에 알림
      onClose();
      if (onSubmit) {
        onSubmit();
      }
      
    } catch (error) {
      console.error('차량 등록 오류:', error);
      setError(error.message || '차량 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // 폼 초기화
    setFormData({
      manufacturer: '',
      year: '',
      modelName: '',
      vehicleNumber: '',
      color: '',
    });
    setError('');
    onClose();
  };

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
          maxWidth: 400,
          width: '90%',
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: 24,
          p: 3,
          maxHeight: '90vh',
          overflow: 'auto',
          fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* 헤더 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'inherit', fontSize: '1.2rem' }}>
            🚗 차량 등록
          </Typography>
          <IconButton onClick={handleCancel} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: 'inherit' }}>
          새로운 차량 정보를 등록해주세요
        </Typography>

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit' }}>
              제조사 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.manufacturer}
              onChange={handleChange('manufacturer')}
              placeholder="현대, 기아, BMW 등"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.9rem',
                  py: 1,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit' }}>
              연식 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="number"
              value={formData.year}
              onChange={handleChange('year')}
              placeholder="2024"
              required
              inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.9rem',
                  py: 1,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit' }}>
              모델명 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.modelName}
              onChange={handleChange('modelName')}
              placeholder="아반떼, 소나타, X3 등"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.9rem',
                  py: 1,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit' }}>
              차량번호 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.vehicleNumber}
              onChange={handleChange('vehicleNumber')}
              placeholder="12가 3456"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.9rem',
                  py: 1,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit' }}>
              색상 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={formData.color}
              onChange={handleChange('color')}
              placeholder="흰색, 검정색, 회색 등"
              required
              sx={{ 
                fontFamily: 'inherit',
                '& .MuiInputBase-input': {
                  fontSize: '0.9rem',
                  py: 1,
                }
              }}
            />
          </Box>

          {/* 버튼 */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button
              onClick={handleCancel}
              variant="outlined"
              disabled={loading}
              sx={{
                fontFamily: 'inherit',
                fontWeight: 600,
                minWidth: 80,
                py: 1,
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#4285f4',
                fontFamily: 'inherit',
                fontWeight: 600,
                minWidth: 80,
                py: 1,
                '&:hover': {
                  bgcolor: '#3367d6',
                },
              }}
            >
              {loading ? '등록 중...' : '등록'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default CarRegistrationModal; 