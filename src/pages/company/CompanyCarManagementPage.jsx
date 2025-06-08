import React, { useState } from "react";
import styled from "styled-components";
import Button from "../../components/Button";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import CarRegistrationModal from "./CarRegistrationModal";

// 더미 데이터
const DUMMY_VEHICLES = [
  {
    id: 1,
    vehicleNumber: "12가 3456",
    manufacturer: "현대",
    modelName: "아반떼",
    color: "검정",
    managerId: "VH-2024-A001",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 2,
    vehicleNumber: "34나 5678",
    manufacturer: "기아",
    modelName: "K5",
    color: "흰색",
    managerId: "VH-2024-A002",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 3,
    vehicleNumber: "56다 7890",
    manufacturer: "현대",
    modelName: "그랜저",
    color: "회색",
    managerId: "VH-2024-A003",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 4,
    vehicleNumber: "78라 1234",
    manufacturer: "기아",
    modelName: "K8",
    color: "검정",
    managerId: "VH-2024-A004",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 5,
    vehicleNumber: "90마 5678",
    manufacturer: "현대",
    modelName: "소나타",
    color: "흰색",
    managerId: "VH-2024-A005",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 6,
    vehicleNumber: "12바 9012",
    manufacturer: "기아",
    modelName: "K3",
    color: "파랑",
    managerId: "VH-2024-A006",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 7,
    vehicleNumber: "34사 3456",
    manufacturer: "현대",
    modelName: "투싼",
    color: "검정",
    managerId: "VH-2024-A007",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 8,
    vehicleNumber: "56아 7890",
    manufacturer: "기아",
    modelName: "스포티지",
    color: "은색",
    managerId: "VH-2024-A008",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 9,
    vehicleNumber: "78자 1234",
    manufacturer: "현대",
    modelName: "싼타페",
    color: "흰색",
    managerId: "VH-2024-A009",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 10,
    vehicleNumber: "90차 5678",
    manufacturer: "기아",
    modelName: "셀토스",
    color: "검정",
    managerId: "VH-2024-A010",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 11,
    vehicleNumber: "12카 9012",
    manufacturer: "현대",
    modelName: "팰리세이드",
    color: "청색",
    managerId: "VH-2024-A011",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 12,
    vehicleNumber: "34타 3456",
    manufacturer: "기아",
    modelName: "모하비",
    color: "흰색",
    managerId: "VH-2024-A012",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 13,
    vehicleNumber: "56파 7890",
    manufacturer: "현대",
    modelName: "베뉴",
    color: "검정",
    managerId: "VH-2024-A013",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 14,
    vehicleNumber: "78하 1234",
    manufacturer: "기아",
    modelName: "니로",
    color: "회색",
    managerId: "VH-2024-A014",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 15,
    vehicleNumber: "90거 5678",
    manufacturer: "현대",
    modelName: "코나",
    color: "적색",
    managerId: "VH-2024-A015",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 16,
    vehicleNumber: "12너 9012",
    manufacturer: "기아",
    modelName: "EV6",
    color: "흰색",
    managerId: "VH-2024-A016",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 17,
    vehicleNumber: "34더 3456",
    manufacturer: "현대",
    modelName: "아이오닉5",
    color: "검정",
    managerId: "VH-2024-A017",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 18,
    vehicleNumber: "56러 7890",
    manufacturer: "기아",
    modelName: "K9",
    color: "은색",
    managerId: "VH-2024-A018",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 19,
    vehicleNumber: "78머 1234",
    manufacturer: "현대",
    modelName: "캐스퍼",
    color: "오렌지",
    managerId: "VH-2024-A019",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 20,
    vehicleNumber: "90버 5678",
    manufacturer: "기아",
    modelName: "레이",
    color: "흰색",
    managerId: "VH-2024-A020",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 21,
    vehicleNumber: "12서 9012",
    manufacturer: "현대",
    modelName: "스타리아",
    color: "검정",
    managerId: "VH-2024-A021",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 22,
    vehicleNumber: "34어 3456",
    manufacturer: "기아",
    modelName: "카니발",
    color: "회색",
    managerId: "VH-2024-A022",
    company: "ABC 렌트카",
    status: "미운행"
  },
  {
    id: 23,
    vehicleNumber: "56저 7890",
    manufacturer: "현대",
    modelName: "포터",
    color: "흰색",
    managerId: "VH-2024-A023",
    company: "ABC 렌트카",
    status: "운행중"
  },
  {
    id: 24,
    vehicleNumber: "78처 1234",
    manufacturer: "기아",
    modelName: "봉고",
    color: "청색",
    managerId: "VH-2024-A024",
    company: "ABC 렌트카",
    status: "미운행"
  }
];

const CompanyCarManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [vehicles, setVehicles] = useState(DUMMY_VEHICLES);

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

  const handleVehicleSubmit = (newVehicle) => {
    const vehicleWithId = {
      ...newVehicle,
      id: vehicles.length + 1,
      managerId: `VH-2024-A${String(vehicles.length + 1).padStart(3, "0")}`,
      company: "업체명",
      status: "미운행",
    };
    setVehicles([...vehicles, vehicleWithId]);
  };

  const handleEdit = (vehicleId) => {
    console.log("차량 수정:", vehicleId);
  };

  const handleDeleteClick = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
      setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleToDelete));
    }
    setDeleteDialogOpen(false);
    setVehicleToDelete(null);
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
      vehicle.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modelName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 페이지네이션 계산
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

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

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>번호</TableHeaderCell>
              <TableHeaderCell>차량번호</TableHeaderCell>
              <TableHeaderCell>제조사</TableHeaderCell>
              <TableHeaderCell>모델</TableHeaderCell>
              <TableHeaderCell>색상</TableHeaderCell>
              <TableHeaderCell>담당자 ID</TableHeaderCell>
              <TableHeaderCell>소속 업체</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>관리</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentVehicles.length === 0 ? (
              <TableRow>
                <EmptyCell colSpan={9}>
                  등록된 차량이 없습니다. 차량을 등록해보세요.
                </EmptyCell>
              </TableRow>
            ) : (
              currentVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>{vehicle.id}</TableCell>
                  <TableCell bold>{vehicle.vehicleNumber}</TableCell>
                  <TableCell>{vehicle.manufacturer}</TableCell>
                  <TableCell>{vehicle.modelName}</TableCell>
                  <TableCell>{vehicle.color}</TableCell>
                  <TableCell>{vehicle.managerId}</TableCell>
                  <TableCell>{vehicle.company}</TableCell>
                  <TableCell>
                    <StatusBadge status={vehicle.status}>
                      {vehicle.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ButtonGroup>
                      <ActionButton edit onClick={() => handleEdit(vehicle.id)}>
                        ✏️
                      </ActionButton>
                      <ActionButton delete onClick={() => handleDeleteClick(vehicle.id)}>
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

      {currentVehicles.length > 0 && (
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

export default CompanyCarManagementPage;
