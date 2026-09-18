import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, DirectionsCar as CarIcon } from '@mui/icons-material';
import { vehicleService } from '../../services/vehicleService';
import { ROUTES } from '../../routes';

const CarRegistrationPage = () => {
  const navigate = useNavigate();
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

    try {
      const carData = {
        manufacturer: formData.manufacturer,
        year: parseInt(formData.year, 10),
        model: formData.modelName,
        carNumber: formData.vehicleNumber,
        color: formData.color,
      };

      await vehicleService.registerVehicle(carData);
      
      // 성공 시 차량 관리 페이지로 이동
      alert('차량 등록이 완료되었습니다!');
      navigate(ROUTES.company.carManagement);
      
    } catch (error) {
      console.error('차량 등록 오류:', error);
      setError('차량 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(ROUTES.company.carManagement);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          차량 관리로 돌아가기
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2 }}>
        {/* 제목 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CarIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            새 차량 등록
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          새로운 차량 정보를 입력하여 등록해주세요.
        </Typography>

        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <TextField
              label="제조사"
              value={formData.manufacturer}
              onChange={handleChange('manufacturer')}
              placeholder="현대, 기아, BMW 등"
              required
              fullWidth
            />
            <TextField
              label="연식"
              type="number"
              value={formData.year}
              onChange={handleChange('year')}
              placeholder="2024"
              required
              fullWidth
              inputProps={{ min: 1990, max: new Date().getFullYear() + 1 }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
            <TextField
              label="모델명"
              value={formData.modelName}
              onChange={handleChange('modelName')}
              placeholder="아반떼, 소나타, X3 등"
              required
              fullWidth
            />
            <TextField
              label="색상"
              value={formData.color}
              onChange={handleChange('color')}
              placeholder="흰색, 검정색, 회색 등"
              required
              fullWidth
            />
          </Box>

          <TextField
            label="차량번호"
            value={formData.vehicleNumber}
            onChange={handleChange('vehicleNumber')}
            placeholder="12가 3456"
            required
            fullWidth
            sx={{ mb: 4 }}
          />

          {/* 버튼 */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  등록 중...
                </>
              ) : (
                '차량 등록'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CarRegistrationPage;
