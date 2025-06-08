import React, { useState } from 'react';
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

const CarRegistrationModal = ({ open, onClose, onSubmit }) => {
  const [manufacturer, setManufacturer] = useState('');
  const [year, setYear] = useState('');
  const [modelName, setModelName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [color, setColor] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const carData = {
      manufacturer,
      year: parseInt(year, 10),
      modelName,
      vehicleNumber,
      color,
    };

    try {
      // TODO: API 호출로 대체 예정
      console.log('차량 등록 성공:', carData);
      
      // 폼 초기화
      setManufacturer('');
      setYear('');
      setModelName('');
      setVehicleNumber('');
      setColor('');
      
      // 성공 시 모달 닫기
      onClose();
      
      // 부모 컴포넌트에 새 차량 데이터 전달
      if (onSubmit) {
        onSubmit(carData);
      }
      
      alert('차량 등록이 완료되었습니다.');
    } catch (error) {
      console.error('네트워크 오류:', error);
      alert('네트워크 오류로 인해 차량 등록에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    // 폼 초기화
    setManufacturer('');
    setYear('');
    setModelName('');
    setVehicleNumber('');
    setColor('');
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
            🚗 차량 등록
          </Typography>
          <IconButton onClick={handleCancel} size="small">
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'inherit', fontSize: '0.85rem' }}>
          새로운 차량 정보를 등록해주세요
        </Typography>

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
              onChange={(e) => setManufacturer(e.target.value)}
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
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024"
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
              모델명 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
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
              onChange={(e) => setVehicleNumber(e.target.value)}
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block', fontFamily: 'inherit', fontSize: '0.7rem' }}>
              올바른 차량번호 형식으로 입력해주세요
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontFamily: 'inherit', fontSize: '0.8rem' }}>
              색상 *
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="흰색, 검정색, 은색 등"
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

          {/* 버튼 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              fullWidth
              size="small"
              sx={{ 
                fontFamily: 'inherit', 
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 0.75,
              }}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="small"
              sx={{
                bgcolor: '#4285f4',
                '&:hover': { bgcolor: '#3367d6' },
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 0.75,
              }}
            >
              등록하기
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'center', fontFamily: 'inherit', fontSize: '0.7rem' }}>
            ⓘ * 표시된 항목은 필수 입력 사항입니다
          </Typography>
        </form>
      </Box>
    </Modal>
  );
};

export default CarRegistrationModal; 