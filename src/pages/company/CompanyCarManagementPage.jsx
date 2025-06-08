import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import CarRegistrationModal from '../../components/CarRegistrationModal';
import { vehicleService } from '../../services/vehicleService';
import { ROUTES } from '../../routes';

const CompanyCarManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 컴포넌트 마운트 시 차량 목록 로드
  useEffect(() => {
    loadVehicles();
  }, [currentPage]);

  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await vehicleService.getVehicles(currentPage - 1, 10);
      setVehicles(response.content || response.vehicles || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('차량 목록 로드 에러:', error);
      setError('차량 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // 검색어 변경시 첫 페이지로 이동
  };

  const handleAddVehicle = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleVehicleSubmit = async () => {
    // 차량 등록 성공 시 목록 새로고침
    await loadVehicles();
    setSuccessMessage('차량이 성공적으로 등록되었습니다.');
  };

  const handleEdit = (vehicleId) => {
    console.log("차량 수정:", vehicleId);
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (vehicleToDelete) {
      try {
        await vehicleService.deleteVehicle(vehicleToDelete.id);
        setSuccessMessage('차량이 성공적으로 삭제되었습니다.');
        await loadVehicles(); // 목록 새로고침
      } catch (error) {
        console.error('차량 삭제 에러:', error);
        setError('차량 삭제에 실패했습니다.');
      }
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
    return status === "운행중" ? "success" : "default";
  };

  // 검색 필터링 (클라이언트 사이드)
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.carNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setError('');
  };

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

      {/* 로딩 상태 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 테이블 섹션 */}
      {!loading && (
        <TableContainer component={Paper} sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>번호</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>차량번호</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>제조사</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>모델</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>색상</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>연식</TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: 'inherit', fontSize: '0.875rem' }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: 'text.secondary', fontFamily: 'inherit' }}>
                    {vehicles.length === 0 ? '등록된 차량이 없습니다. 차량을 등록해보세요.' : '검색 결과가 없습니다.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.id} hover>
                    <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>
                      {(currentPage - 1) * 10 + index + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>
                      {vehicle.carNumber}
                    </TableCell>
                    <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.manufacturer}</TableCell>
                    <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.model}</TableCell>
                    <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.color}</TableCell>
                    <TableCell sx={{ py: 1, fontFamily: 'inherit', fontSize: '0.875rem' }}>{vehicle.modelYear}년</TableCell>
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
                          onClick={() => handleDeleteClick(vehicle)}
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
      )}

      {/* 페이지네이션 */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="small"
          />
        </Box>
      )}

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
        <DialogTitle sx={{ fontFamily: "inherit", fontWeight: 700 }}>
          차량 삭제 확인
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: "inherit" }}>
            정말로 이 차량을 삭제하시겠습니까?
          </Typography>
          {vehicleToDelete && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'inherit' }}>
              차량번호: {vehicleToDelete.carNumber} ({vehicleToDelete.manufacturer} {vehicleToDelete.model})
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontFamily: 'inherit' }}>
            삭제된 차량 정보는 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            sx={{ fontFamily: "inherit", fontWeight: 600 }}
          >
            취소
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ fontFamily: "inherit", fontWeight: 600 }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* 성공/에러 메시지 스낵바 */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyCarManagementPage;
