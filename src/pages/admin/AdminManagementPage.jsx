import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { authApi } from "../../utils/api";
import SearchInput from "../../components/SearchInput";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import AdminUserRegisterModal from "./AdminUserRegisterModal";
import AdminCompanyRegisterModal from "./AdminCompanyRegisterModal";

// 유효성 검사를 위한 정규식
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const PHONE_REGEX = /^[0-9]{10,11}$/;

const getRoleDisplayName = (role) => {
  switch (role) {
    case 'ADMIN':
      return '관리자';
    case 'COMPANY_CHEF':
    case 'COMPANY_ADMIN':
      return '업체 관리자';
    case 'MEMBER':
      return '일반 사용자';
    default:
      return role;
  }
};

const AdminUserManagementPage = () => {
  const [managementType, setManagementType] = useState("user");
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const itemsPerPage = 10;
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchUsers = async (page = 1) => {
    try {
      const response = await authApi.get(`/admin/members?page=${page - 1}&size=${itemsPerPage}`);
      if (response.data) {
        setUsers(response.data.members);
        setTotalElements(response.data.pageInfo.totalElements);
        setTotalPages(response.data.pageInfo.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchCompanies = async (page = 1) => {
    try {
      const response = await authApi.get(`/companies?page=${page - 1}&size=${itemsPerPage}`);
      if (response.data) {
        setCompanies(response.data.companies);
        setTotalElements(response.data.pageInfo.totalElements);
        setTotalPages(response.data.pageInfo.totalPages);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    if (managementType === "user") {
      fetchUsers(currentPage);
    } else {
      fetchCompanies(currentPage);
    }
  }, [managementType, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        if (managementType === "user") {
          await authApi.delete(`/admin/members/${itemToDelete}`);
          if (users.length === 1 && currentPage > 1) {
            setCurrentPage(1);
          } else {
            fetchUsers(currentPage);
          }
        } else {
          await authApi.delete(`/companies/${itemToDelete}`);
          if (companies.length === 1 && currentPage > 1) {
            setCurrentPage(1);
          } else {
            fetchCompanies(currentPage);
          }
        }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error(`Error deleting ${managementType}:`, error);
        setError(error.response?.data?.message || `${managementType === "user" ? "사용자" : "업체"} 삭제에 실패했습니다.`);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setError("");
  };

  const handleSubmit = async (formData, type) => {
    try {
      if (managementType === "user") {
        // 이메일 유효성 검사 (사용자인 경우에만)
        if (!EMAIL_REGEX.test(formData.email)) {
          setError("유효한 이메일 주소를 입력해주세요.");
          return;
        }

        // 전화번호 유효성 검사
        if (!PHONE_REGEX.test(formData.phone)) {
          setError("전화번호 형식이 올바르지 않습니다. (예: 0212345678 또는 01012345678)");
          return;
        }

        if (type === "create") {
          const createData = {
            companyId: formData.companyId,
            role: formData.role,
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            memo: formData.memo || ""
          };
          await authApi.post("/admin/members", createData);
        } else if (type === "edit" && selectedItem?.id) {
          const updateData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            memo: formData.memo || ""
          };
          await authApi.put(`/admin/members/${selectedItem.id}`, updateData);
        } else {
          throw new Error("사용자 ID가 없습니다.");
        }
        fetchUsers(currentPage);
      } else {
        // 전화번호 유효성 검사
        if (!PHONE_REGEX.test(formData.contact)) {
          setError("전화번호 형식이 올바르지 않습니다. (예: 0212345678 또는 01012345678)");
          return;
        }

        if (type === "create") {
          await authApi.post("/companies", formData);
        } else {
          await authApi.patch(`/companies/${formData.id}`, formData);
        }
        fetchCompanies(currentPage);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting data:", error);
      setError(error.response?.data?.message || `${managementType === "user" ? "사용자" : "업체"} 정보 저장 중 오류가 발생했습니다.`);
    }
  };

  // 검색어에 따른 필터링
  const filteredData = managementType === "user" 
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      )
    : companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.crn.includes(searchTerm) ||
        company.contact.includes(searchTerm)
      );

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>사용자/업체 관리</PageTitle>
        </HeaderLeft>
        <HeaderRight>
          <SearchInput
            placeholder={`${managementType === "user" ? "사용자" : "업체"} 검색...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => handleOpenModal("create")} startIcon="+">
            {managementType === "user" ? "사용자 등록" : "업체 등록"}
          </Button>
        </HeaderRight>
      </Header>

      <TabContainer>
        <TabButton 
          active={managementType === "user"}
                        onClick={() => setManagementType("user")}
                    >
                        사용자
        </TabButton>
        <TabButton 
          active={managementType === "company"}
                        onClick={() => setManagementType("company")}
                    >
                        업체
        </TabButton>
      </TabContainer>

      <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
              <TableHeaderCell width="60px">번호</TableHeaderCell>
              {managementType === "user" ? (
                <>
                  <TableHeaderCell width="120px">이름</TableHeaderCell>
                  <TableHeaderCell width="180px">이메일</TableHeaderCell>
                  <TableHeaderCell width="140px">연락처</TableHeaderCell>
                  <TableHeaderCell width="140px">소속 업체</TableHeaderCell>
                  <TableHeaderCell width="100px">권한</TableHeaderCell>
                  {/* <TableHeaderCell width="100px">상태</TableHeaderCell> */}
                </>
              ) : (
                <>
                  <TableHeaderCell width="200px">업체명</TableHeaderCell>
                  <TableHeaderCell width="120px">사업자번호</TableHeaderCell>
                  <TableHeaderCell width="140px">연락처</TableHeaderCell>
                  <TableHeaderCell width="200px">주소</TableHeaderCell>
                  <TableHeaderCell width="200px">메모</TableHeaderCell>
                  {/* <TableHeaderCell width="100px">상태</TableHeaderCell> */}
                </>
              )}
              <TableHeaderCell width="100px">관리</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <EmptyCell colSpan={managementType === "user" ? 7 : 6}>
                  {managementType === "user" 
                    ? "등록된 사용자가 없습니다." 
                    : "등록된 업체가 없습니다."}
                </EmptyCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                  <TableRow key={item.id}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  {managementType === "user" ? (
                    <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                      <TableCell>{item.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')}</TableCell>
                      <TableCell>{item.companyName}</TableCell>
                      <TableCell>
                        <RoleBadge role={item.role}>
                          {getRoleDisplayName(item.role)}
                        </RoleBadge>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.crn}</TableCell>
                      <TableCell>{item.contact.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')}</TableCell>
                      <TableCell>{item.addrRoad} {item.addrDetail}</TableCell>
                      <TableCell>{item.memo}</TableCell>
                    </>
                    )}
                    <TableCell>
                    <ButtonGroup>
                      <ActionButton edit onClick={() => handleOpenModal("edit", item)}>✏️</ActionButton>
                      <ActionButton delete onClick={() => handleDelete(item.id)}>🗑️</ActionButton>
                    </ButtonGroup>
                    </TableCell>
                  </TableRow>
              ))
            )}
              </TableBody>
            </Table>
          </TableContainer>

      {filteredData.length > 0 && (
            <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {managementType === "user" ? (
        <AdminUserRegisterModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          type={modalType}
          initialData={selectedItem}
          onSubmit={handleSubmit}
          error={error}
          setError={setError}
        />
      ) : (
        <AdminCompanyRegisterModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          type={modalType}
          initialData={selectedItem}
          onSubmit={handleSubmit}
          error={error}
          setError={setError}
        />
      )}

      {deleteDialogOpen && (
        <>
          <Dialog>
            <DialogOverlay onClick={handleDeleteCancel} />
            <DialogContent>
              <DialogTitle>{managementType === "user" ? "사용자" : "업체"} 삭제 확인</DialogTitle>
              <DialogText>정말로 이 {managementType === "user" ? "사용자" : "업체"}를 삭제하시겠습니까?</DialogText>
              <DialogSubText>삭제된 {managementType === "user" ? "사용자" : "업체"} 정보는 복구할 수 없습니다.</DialogSubText>
              <DialogActions>
                <CancelButton onClick={handleDeleteCancel}>취소</CancelButton>
                <DeleteButton onClick={handleDeleteConfirm}>삭제</DeleteButton>
              </DialogActions>
            </DialogContent>
          </Dialog>
        </>
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

const TabContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
`;

const TabButton = styled.button`
  padding: 8px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid ${({ active, theme }) => 
    active ? theme.palette.primary.main : 'transparent'};
  color: ${({ active, theme }) => 
    active ? theme.palette.primary.main : theme.palette.text.primary};
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
`;

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

const RoleBadge = styled.span.attrs(() => ({
  className: 'badge'
}))`
  background-color: ${({ role, theme }) => 
    role === "MEMBER" ? theme.palette.grey[100] : theme.palette.secondary.main};
  color: ${({ role, theme }) => 
    role === "MEMBER" ? theme.palette.text.disabled : theme.palette.secondary.contrastText};
`;

const StatusBadge = styled.span.attrs(() => ({
  className: 'badge'
}))`
  background-color: ${({ status, theme }) => 
    status === "ACTIVE" ? theme.palette.success.main : theme.palette.error.main};
  color: ${({ status, theme }) => 
    status === "ACTIVE" ? theme.palette.success.contrastText : theme.palette.error.contrastText};
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

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.palette.error.main};
  background-color: ${({ theme }) => theme.palette.error.light};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
  text-align: center;
`;

const Dialog = styled.div.attrs(() => ({
  className: 'dialog'
}))``;

const DialogOverlay = styled.div.attrs(() => ({
  className: 'dialog-overlay'
}))``;

const DialogContent = styled.div.attrs(() => ({
  className: 'dialog-content'
}))``;

const DialogTitle = styled.h2.attrs(() => ({
  className: 'dialog-title'
}))``;

const DialogText = styled.p.attrs(() => ({
  className: 'dialog-text'
}))``;

const DialogSubText = styled.p.attrs(() => ({
  className: 'dialog-sub-text'
}))``;

const DialogActions = styled.div.attrs(() => ({
  className: 'dialog-actions'
}))``;

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

export default AdminUserManagementPage;