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
} from '@mui/icons-material';
import CarRegistrationModal from '../../components/CarRegistrationModal';

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
    vehicle.modelName.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.modelName}</TableCell>
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
