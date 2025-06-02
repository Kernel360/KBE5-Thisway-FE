import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Pagination,
  InputAdornment,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// 차량 등록 모달 컴포넌트
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

const CompanyCarManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // 빈 배열로 초기화 (나중에 API에서 데이터 가져올 예정)
  const [vehicles, setVehicles] = useState([]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddVehicle = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleVehicleSubmit = (newVehicle) => {
    // TODO: 실제로는 API 호출 후 데이터를 다시 가져와야 함
    const vehicleWithId = {
      ...newVehicle,
      id: vehicles.length + 1,
      managerId: `VH-2024-A${String(vehicles.length + 1).padStart(3, '0')}`,
      company: '업체명', // 실제로는 로그인한 업체 정보에서 가져와야 함
      status: '미운행', // 기본값
    };
    setVehicles([...vehicles, vehicleWithId]);
  };

  const handleEdit = (vehicleId) => {
    console.log('차량 수정:', vehicleId);
    // TODO: 차량 수정 모달 또는 페이지로 이동
  };

  const handleDeleteClick = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
      // TODO: 실제로는 API 호출로 삭제
      setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleToDelete));
      console.log('차량 삭제 완료:', vehicleToDelete);
    }
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const getStatusColor = (status) => {
    return status === '운행중' ? 'success' : 'default';
  };

  // 검색 필터링
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 2, fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* 헤더 섹션 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ fontFamily: 'inherit' }}>
          차량 관리
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* 검색 섹션 */}
          <TextField
            size="small"
            placeholder="차량 검색..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 280,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                height: 36,
              },
            }}
          />
          
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={handleAddVehicle}
            size="small"
            sx={{
              bgcolor: '#4285f4',
              height: 36,
              px: 2,
              '&:hover': {
                bgcolor: '#3367d6',
              },
              fontFamily: 'inherit',
              fontWeight: 600,
            }}
          >
            차량 등록
          </Button>
        </Box>
      </Box>

      {/* 테이블 섹션 */}
      <TableContainer component={Paper} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>번호</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>차량번호</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>제조사</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>모델</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>색상</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>담당자 ID</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>소속 업체</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>상태</TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontFamily: 'inherit' }}>
                  등록된 차량이 없습니다. 차량을 등록해보세요.
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} hover>
                  <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>
                    {vehicle.vehicleNumber}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.manufacturer}</TableCell>
                  <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.model}</TableCell>
                  <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.color}</TableCell>
                  <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.managerId}</TableCell>
                  <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.company}</TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Chip
                      label={vehicle.status}
                      color={getStatusColor(vehicle.status)}
                      size="small"
                      sx={{ 
                        height: 24, 
                        fontSize: '0.75rem',
                        fontFamily: 'inherit',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(vehicle.id)}
                        sx={{ color: '#ff9800', p: 0.5 }}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(vehicle.id)}
                        sx={{ color: '#f44336', p: 0.5 }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={1}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          size="small"
        />
      </Box>

      {/* 차량 등록 모달 */}
      <CarRegistrationModal 
        open={isModalOpen} 
        onClose={handleModalClose}
        onSubmit={handleVehicleSubmit}
      />

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'inherit', fontWeight: 700 }}>
          차량 삭제 확인
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'inherit' }}>
            정말로 이 차량을 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'inherit' }}>
            삭제된 차량 정보는 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ fontFamily: 'inherit', fontWeight: 600 }}
          >
            취소
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ fontFamily: 'inherit', fontWeight: 600 }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyCarManagementPage;
