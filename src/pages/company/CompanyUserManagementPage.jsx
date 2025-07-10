import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { authApi } from "../../utils/api";
import { getCompanyId } from "../../utils/auth";
import CompanyUserRegisterModal from "./CompanyUserRegisterModal";
import SearchInput from "../../components/SearchInput";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

const getRoleDisplayName = (role) => {
  switch (role) {
    case "COMPANY_CHEF":
    // return '총 관리자';
    case "COMPANY_ADMIN":
      return "관리자";
    case "MEMBER":
      return "일반 사용자";
    default:
      return role;
  }
};

const CompanyUserManagementPage = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [summary, setSummary] = useState({
    companyChefCount: 0,
    companyAdminCount: 0,
    memberCount: 0,
  });
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    memo: "",
    role: "MEMBER",
    password: "",
    confirmPassword: "",
  });

  const [editingUser, setEditingUser] = useState(null);

  const fetchSummary = async () => {
    try {
      const response = await authApi.get("/company-chef/members/summary");
      if (response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  // fetchUsers에 memberName 파라미터 추가
  const fetchUsers = async (page = 1, memberName = "") => {
    try {
      const response = await authApi.get(
        `/company-chef/members?page=${page - 1}&size=${itemsPerPage}${
          memberName ? `&memberName=${encodeURIComponent(memberName)}` : ""
        }`,
      );
      if (response.data) {
        setUsers(response.data.members);
        setTotalElements(response.data.pageInfo.totalElements);
        setTotalPages(response.data.pageInfo.totalPages);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // 검색 버튼 클릭 또는 엔터 시
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
    fetchUsers(1, searchInput);
  };

  // 엔터키로 검색
  const handleSearchInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 페이지 변경 시 API 호출 (검색어 반영)
  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
    fetchSummary();
  }, [currentPage, searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      memo: "",
      role: "MEMBER",
      password: "",
      confirmPassword: "",
    });
    setError("");
  };

  const handleOpenEditModal = (user) => {
    setEditingUser({ ...user, password: "", confirmPassword: "" });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingUser(null);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleSubmitAdd = async () => {
    try {
      if (newUser.password !== newUser.confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }

      const submitData = {
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone,
        memo: newUser.memo || "",
      };

      const response = await authApi.post("/company-chef/members", submitData);

      // API 호출로 사용자 목록 업데이트
      fetchUsers(currentPage);

      // StatsGrid 로컬 업데이트
      setSummary((prev) => {
        const newSummary = { ...prev };
        if (newUser.role === "MEMBER") {
          newSummary.memberCount++;
        } else if (newUser.role === "COMPANY_CHEF") {
          newSummary.companyChefCount++;
        } else if (newUser.role === "COMPANY_ADMIN") {
          newSummary.companyAdminCount++;
        }
        return newSummary;
      });

      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding user:", error);
      setError(
        error.response?.data?.message || "사용자 등록 중 오류가 발생했습니다.",
      );
    }
  };

  const handleSubmitEdit = async () => {
    try {
      const submitData = {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        memo: editingUser.memo || "",
      };

      await authApi.put(`/company-chef/members/${editingUser.id}`, submitData);

      // 로컬 사용자 목록 업데이트
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...submitData } : user,
        ),
      );

      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating user:", error);
      setError(
        error.response?.data?.message || "사용자 수정 중 오류가 발생했습니다.",
      );
    }
  };

  const handleDeleteUser = (userId) => {
    setItemToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await authApi.delete(`/company-chef/members/${itemToDelete}`);

        // 삭제된 사용자 찾기
        const deletedUser = users.find((user) => user.id === itemToDelete);

        // StatsGrid 업데이트
        if (deletedUser) {
          setSummary((prev) => {
            const newSummary = { ...prev };
            if (deletedUser.role === "MEMBER") {
              newSummary.memberCount--;
            } else if (deletedUser.role === "COMPANY_CHEF") {
              newSummary.companyChefCount--;
            } else if (deletedUser.role === "COMPANY_ADMIN") {
              newSummary.companyAdminCount--;
            }
            return newSummary;
          });

          // 로컬 사용자 목록 업데이트
          setUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== itemToDelete),
          );
        }

        // 마지막 항목 삭제 시 이전 페이지로 이동
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }

        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
        setError(
          error.response?.data?.message || "사용자 삭제에 실패했습니다.",
        );
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>구성원 관리</PageTitle>
        </HeaderLeft>
        <HeaderRight>
          <SearchInput
            placeholder="사용자 검색..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchInputKeyDown}
          />
          <Button onClick={handleSearch} style={{ marginLeft: 8 }}>
            검색
          </Button>
          <Button onClick={handleOpenAddModal} startIcon="+">
            사용자 등록
          </Button>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatsCard>
          <StatsTitle>전체 사용자</StatsTitle>
          <StatsValue>
            {summary.companyChefCount +
              summary.companyAdminCount +
              summary.memberCount}
          </StatsValue>
        </StatsCard>
        <StatsCard>
          <StatsTitle>관리자</StatsTitle>
          <StatsValue>
            {summary.companyChefCount + summary.companyAdminCount}
          </StatsValue>
        </StatsCard>
        <StatsCard>
          <StatsTitle>일반 사용자</StatsTitle>
          <StatsValue>{summary.memberCount}</StatsValue>
        </StatsCard>
      </StatsGrid>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell width="60px">번호</TableHeaderCell>
              <TableHeaderCell width="120px">이름</TableHeaderCell>
              <TableHeaderCell width="180px">이메일</TableHeaderCell>
              <TableHeaderCell width="140px">연락처</TableHeaderCell>
              <TableHeaderCell width="100px">권한</TableHeaderCell>
              <TableHeaderCell width="100px">관리</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <EmptyCell colSpan={6}>등록된 사용자가 없습니다.</EmptyCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3")}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role}>
                      {getRoleDisplayName(user.role)}
                    </RoleBadge>
                  </TableCell>
                  <TableCell>
                    <ButtonGroup>
                      <ActionButton
                        edit
                        onClick={() => handleOpenEditModal(user)}
                      >
                        ✏️
                      </ActionButton>
                      <ActionButton
                        delete
                        onClick={() => handleDeleteUser(user.id)}
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

      {users.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <CompanyUserRegisterModal
        isOpen={openAddModal}
        onClose={handleCloseAddModal}
        user={newUser}
        onChange={handleInputChange}
        onSubmit={handleSubmitAdd}
        mode="register"
        error={error}
        setError={setError}
      />

      <CompanyUserRegisterModal
        isOpen={openEditModal}
        onClose={handleCloseEditModal}
        user={editingUser || {}}
        onChange={handleInputChange}
        onSubmit={handleSubmitEdit}
        mode="edit"
        error={error}
        setError={setError}
      />

      {deleteDialogOpen && (
        <>
          <Dialog>
            <DialogOverlay onClick={handleDeleteCancel} />
            <DialogContent>
              <DialogTitle>사용자 삭제 확인</DialogTitle>
              <DialogText>정말로 이 사용자를 삭제하시겠습니까?</DialogText>
              <DialogSubText>
                삭제된 사용자 정보는 복구할 수 없습니다.
              </DialogSubText>
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
  className: "page-container",
}))``;

const Header = styled.div.attrs(() => ({
  className: "page-header-wrapper",
}))``;

const HeaderLeft = styled.div.attrs(() => ({
  className: "page-header",
}))``;

const HeaderRight = styled.div.attrs(() => ({
  className: "page-header-actions",
}))``;

const PageTitle = styled.h1.attrs(() => ({
  className: "page-header",
}))``;

const StatsGrid = styled.div.attrs(() => ({
  className: "stats-grid",
}))`
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 24px;
`;

const StatsCard = styled.div.attrs(() => ({
  className: "stats-card",
}))`
  box-shadow: 0 1px 3px ${({ theme }) => theme.palette.action.hover};
`;

const StatsTitle = styled.h3.attrs(() => ({
  className: "stat-title",
}))``;

const StatsValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${({ role, theme }) => {
    switch (role) {
      case "COMPANY_CHEF":
      // return theme.palette.success.main;
      case "COMPANY_ADMIN":
        return theme.palette.secondary.main;
      case "MEMBER":
        return theme.palette.grey[100];
      default:
        return theme.palette.grey[100];
    }
  }};
  color: ${({ role, theme }) => {
    switch (role) {
      case "COMPANY_CHEF":
      // return theme.palette.success.contrastText;
      case "COMPANY_ADMIN":
        return theme.palette.secondary.contrastText;
      case "MEMBER":
        return theme.palette.text.disabled;
      default:
        return theme.palette.text.disabled;
    }
  }};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button.attrs(() => ({
  className: "action-button",
}))`
  background-color: ${({ theme }) => theme.palette.grey[100]};
  color: ${({ edit, theme }) =>
    edit ? theme.palette.text.secondary : theme.palette.error.main};

  &:hover {
    background-color: ${({ edit, theme }) =>
      edit ? theme.palette.grey[200] : theme.palette.error.main};
  }
`;

const TableContainer = styled.div.attrs(() => ({
  className: "table-container",
}))``;

const Table = styled.table.attrs(() => ({
  className: "table",
}))``;

const TableHead = styled.thead.attrs(() => ({
  className: "table-head",
}))``;

const TableBody = styled.tbody``;

const TableRow = styled.tr.attrs(() => ({
  className: "table-row",
}))``;

const TableHeaderCell = styled.th.attrs(() => ({
  className: "table-header-cell",
}))`
  width: ${({ width }) => width || "auto"};
`;

const TableCell = styled.td.attrs(() => ({
  className: "table-cell",
}))``;

const EmptyCell = styled.td.attrs(() => ({
  className: "empty-cell",
}))``;

const Dialog = styled.div.attrs(() => ({
  className: "dialog",
}))``;

const DialogOverlay = styled.div.attrs(() => ({
  className: "dialog-overlay",
}))``;

const DialogContent = styled.div.attrs(() => ({
  className: "dialog-content",
}))``;

const DialogTitle = styled.h2.attrs(() => ({
  className: "dialog-title",
}))``;

const DialogText = styled.p.attrs(() => ({
  className: "dialog-text",
}))``;

const DialogSubText = styled.p.attrs(() => ({
  className: "dialog-sub-text",
}))``;

const DialogActions = styled.div.attrs(() => ({
  className: "dialog-actions",
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

export default CompanyUserManagementPage;
