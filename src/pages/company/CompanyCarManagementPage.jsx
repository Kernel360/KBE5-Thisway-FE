import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authApi } from "../../utils/api";
import Button from "../../components/Button";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import CarRegistrationModal from "./CarRegistrationModal";
import { ROUTES } from "../../routes";

const CompanyCarManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("register"); // "register" | "edit"
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  const fetchVehicles = async (page = 1) => {
    try {
      const response = await authApi.get(`/vehicles?page=${page - 1}&size=${itemsPerPage}`);
      if (response.data) {
        setVehicles(response.data.vehicles);
        setTotalElements(response.data.totalElements);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setError("차량 목록을 불러오는데 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchVehicles(currentPage);
  }, [currentPage]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleAddVehicle = () => {
    setModalMode("register");
    setSelectedVehicle(null);
    setIsModalOpen(true);
    setError("");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    setError("");
  };

  const handleVehicleSubmit = async (vehicleData) => {
    try {
      const submitData = {
        manufacturer: vehicleData.manufacturer,
        modelYear: parseInt(vehicleData.year, 10),
        model: vehicleData.modelName,
        carNumber: vehicleData.vehicleNumber,
        color: vehicleData.color
      };

      if (modalMode === "edit" && selectedVehicle) {
        await authApi.patch(`/vehicles/${selectedVehicle.id}`, submitData);
      } else {
        await authApi.post("/vehicles", submitData);
      }
      
      fetchVehicles(currentPage);
      handleModalClose();
    } catch (error) {
      console.error("Error submitting vehicle:", error);
      setError(error.response?.data?.message || `차량 ${modalMode === "edit" ? "수정" : "등록"}에 실패했습니다.`);
    }
  };

  const handleRowClick = (e, vehicleId) => {
    // 관리 버튼 클릭 시 상세 페이지로 이동하지 않도록
    if (e.target.closest('.action-button')) {
      return;
    }
    navigate(ROUTES.company.carDetail.replace(':id', vehicleId));
  };

  const handleEdit = (e, vehicle) => {
    e.stopPropagation(); // 행 클릭 이벤트가 발생하지 않도록 방지
    setSelectedVehicle({
      ...vehicle,
      year: vehicle.modelYear,
      modelName: vehicle.model,
      vehicleNumber: vehicle.carNumber
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e, vehicleId) => {
    e.stopPropagation(); // 행 클릭 이벤트가 발생하지 않도록 방지
    setVehicleToDelete(vehicleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (vehicleToDelete) {
      try {
        await authApi.delete(`/vehicles/${vehicleToDelete}`);
        fetchVehicles(currentPage);
        setDeleteDialogOpen(false);
        setVehicleToDelete(null);
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        setError(error.response?.data?.message || "차량 삭제에 실패했습니다.");
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>차량 관리</PageTitle>
        </HeaderLeft>
        <HeaderRight>
          <SearchInput
            placeholder="차량 검색..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button onClick={handleAddVehicle} startIcon="+">
            차량 등록
          </Button>
        </HeaderRight>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>번호</TableHeaderCell>
              <TableHeaderCell>차량번호</TableHeaderCell>
              <TableHeaderCell>제조사</TableHeaderCell>
              <TableHeaderCell>모델</TableHeaderCell>
              <TableHeaderCell>연식</TableHeaderCell>
              <TableHeaderCell>색상</TableHeaderCell>
              <TableHeaderCell>관리</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <EmptyCell colSpan={7}>
                  등록된 차량이 없습니다. 차량을 등록해보세요.
                </EmptyCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle, index) => (
                <TableRow 
                  key={vehicle.id}
                  onClick={(e) => handleRowClick(e, vehicle.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>{vehicle.carNumber}</TableCell>
                  <TableCell>{vehicle.manufacturer}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.modelYear}년</TableCell>
                  <TableCell>{vehicle.color}</TableCell>
                  <TableCell>
                    <ButtonGroup>
                      <ActionButton 
                        edit 
                        className="action-button"
                        onClick={(e) => handleEdit(e, vehicle)}
                      >
                        ✏️
                      </ActionButton>
                      <ActionButton 
                        delete 
                        className="action-button"
                        onClick={(e) => handleDeleteClick(e, vehicle.id)}
                      >
                        🗑️
                      </ActionButton>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredVehicles.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <CarRegistrationModal
        open={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleVehicleSubmit}
        error={error}
        setError={setError}
        mode={modalMode}
        initialData={selectedVehicle}
      />

      {deleteDialogOpen && (
        <Dialog>
          <DialogOverlay onClick={handleDeleteCancel} />
          <DialogContent>
            <DialogTitle>차량 삭제 확인</DialogTitle>
            <DialogText>정말로 이 차량을 삭제하시겠습니까?</DialogText>
            <DialogSubText>삭제된 차량 정보는 복구할 수 없습니다.</DialogSubText>
            <DialogActions>
              <CancelButton onClick={handleDeleteCancel}>취소</CancelButton>
              <DeleteButton onClick={handleDeleteConfirm}>삭제</DeleteButton>
            </DialogActions>
          </DialogContent>
        </Dialog>
      )}
    </Container>
  );
};

const Container = styled.div.attrs(() => ({
  className: 'page-container'
}))``;

const Header = styled.div.attrs(() => ({
  className: 'page-header-wrapper'
}))``;

const HeaderLeft = styled.div.attrs(() => ({
  className: 'page-header'
}))``;

const HeaderRight = styled.div.attrs(() => ({
  className: 'page-header-actions'
}))`
  display: flex;
  gap: 16px;
`;

const PageTitle = styled.h1.attrs(() => ({
  className: 'page-header'
}))``;

const TableContainer = styled.div.attrs(() => ({
  className: 'table-container'
}))``;

const Table = styled.table.attrs(() => ({
  className: 'table'
}))``;

const TableHead = styled.thead.attrs(() => ({
  className: 'table-head'
}))``;

const TableBody = styled.tbody``;

const TableRow = styled.tr.attrs(() => ({
  className: 'table-row'
}))``;

const TableHeaderCell = styled.th.attrs(() => ({
  className: 'table-header-cell'
}))`
  width: ${({ width }) => width || 'auto'};
`;

const TableCell = styled.td.attrs(() => ({
  className: 'table-cell'
}))``;

const EmptyCell = styled.td.attrs(() => ({
  className: 'empty-cell'
}))``;

const StatusBadge = styled.span.attrs(() => ({
  className: 'badge'
}))`
  background-color: ${({ status, theme }) => 
    status === "운행중" ? theme.palette.success.main : theme.palette.grey[200]};
  color: ${({ status, theme }) => 
    status === "운행중" ? theme.palette.success.contrastText : theme.palette.text.disabled};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button.attrs(() => ({
  className: 'action-button'
}))`
  background-color: ${({ theme }) => theme.palette.grey[100]};
  color: ${({ edit, theme }) => 
    edit ? theme.palette.text.secondary : theme.palette.error.main};

  &:hover {
    background-color: ${({ edit, theme }) => 
      edit ? theme.palette.grey[200] : theme.palette.error.main};
  }
`;

const Dialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const DialogContent = styled.div`
  position: relative;
  background: ${({ theme }) => theme.palette.background.paper};
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  z-index: 1001;
`;

const DialogTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const DialogText = styled.p`
  margin: 0 0 8px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const DialogSubText = styled.p`
  margin: 0 0 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const DialogActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancelButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.palette.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.palette.action.hover};
  }
`;

const DeleteButton = styled(Button)`
  background: ${({ theme }) => theme.palette.error.main};
  color: ${({ theme }) => theme.palette.error.contrastText};
  
  &:hover {
    background: ${({ theme }) => theme.palette.error.dark};
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.palette.error.contrastText};
  background-color: ${({ theme }) => theme.palette.error.main};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  
  &::before {
    content: "⚠️";
    margin-right: 8px;
  }
`;

export default CompanyCarManagementPage;