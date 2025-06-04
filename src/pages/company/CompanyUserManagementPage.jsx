import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { authApi } from "../../utils/api";
import CompanyUserRegisterModal from "./CompanyUserRegisterModal";
import SearchInput from "../../components/SearchInput";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";

// 더미 데이터
const DUMMY_USERS = [
  {
    id: 1,
    name: "김관리",
    email: "company_chef@thisway.com",
    phone: "010-1234-5678",
    memo: "관리자 계정",
    role: "COMPANY_CHEF",
  },
  {
    id: 2,
    name: "이사원",
    email: "member1@thisway.com",
    phone: "010-2345-6789",
    memo: "일반 사용자",
    role: "MEMBER",
  },
  {
    id: 3,
    name: "박직원",
    email: "company_admin@thisway.com",
    phone: "010-3456-7890",
    memo: "",
    role: "COMPANY_ADMIN",
  },
];

const CompanyUserManagementPage = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [users, setUsers] = useState(DUMMY_USERS);
  const [totalUsers, setTotalUsers] = useState(DUMMY_USERS.length);
  const [companyChefCount, setCompanyChefCount] = useState(
    DUMMY_USERS.filter(user => user.role === 'COMPANY_CHEF' || user.role === 'COMPANY_ADMIN').length
  );
  const [memberCount, setMemberCount] = useState(
    DUMMY_USERS.filter(user => user.role === 'MEMBER').length
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

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

  // 검색어에 따른 필터링
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  // 페이지네이션 계산
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // API 연동 주석 처리
  /*
  const fetchUsers = async () => {
    try {
      const response = await authApi.get("/members");
      if (response.data && response.data.members) {
        const fetchedUsers = response.data.members.content;
        setUsers(fetchedUsers);
        setTotalUsers(response.data.members.totalElements);
        
        const chefCount = fetchedUsers.filter(user => user.role === 'COMPANY_CHEF').length;
        const memberCnt = fetchedUsers.filter(user => user.role === 'MEMBER').length;
        
        setCompanyChefCount(chefCount);
        setMemberCount(memberCnt);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  */

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
  };

  const handleOpenEditModal = (user) => {
    setEditingUser({ ...user, password: "", confirmPassword: "" });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingUser) {
      setEditingUser({ ...editingUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleSubmitAdd = () => {
    // 더미 데이터용 임시 처리
    const newUserData = {
      ...newUser,
      id: users.length + 1,
    };
    setUsers([...users, newUserData]);
    handleCloseAddModal();
  };

  const handleSubmitEdit = () => {
    // 더미 데이터용 임시 처리
    const updatedUsers = users.map(user => 
      user.id === editingUser.id ? editingUser : user
    );
    setUsers(updatedUsers);
    handleCloseEditModal();
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("이 사용자를 삭제하시겠습니까?")) {
      // 더미 데이터용 임시 처리
      const filteredUsers = users.filter(user => user.id !== userId);
      setUsers(filteredUsers);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>사용자 관리</PageTitle>
          <SubTitle>ABC 렌트카의 사용자를 관리합니다.</SubTitle>
        </HeaderLeft>
        <HeaderRight>
          <SearchInput
            placeholder="사용자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            onClick={handleOpenAddModal}
            startIcon="+"
          >
            사용자 등록
          </Button>
        </HeaderRight>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatLabel>전체 사용자</StatLabel>
          <StatValue accent>{totalUsers}명</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>관리자</StatLabel>
          <StatValue>{companyChefCount}명</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>일반 사용자</StatLabel>
          <StatValue>{memberCount}명</StatValue>
        </StatCard>
      </StatsGrid>

      <TableContainer>
        <Table>
          <TableHead>
            <TableHeaderCell width="60px">번호</TableHeaderCell>
            <TableHeaderCell width="160px">이름</TableHeaderCell>
            <TableHeaderCell width="200px">이메일</TableHeaderCell>
            <TableHeaderCell width="140px">연락처</TableHeaderCell>
            <TableHeaderCell width="140px">메모</TableHeaderCell>
            <TableHeaderCell width="120px">권한</TableHeaderCell>
            <TableHeaderCell width="100px">관리</TableHeaderCell>
          </TableHead>
          <TableBody>
            {currentUsers.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.memo}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role}>
                    {user.role === "COMPANY_CHEF" || user.role === "COMPANY_ADMIN" ? "관리자" : "일반 사용자"}
                  </RoleBadge>
                </TableCell>
                <TableCell>
                  <ButtonGroup>
                    <ActionButton edit onClick={() => handleOpenEditModal(user)}>✏️</ActionButton>
                    <ActionButton delete onClick={() => handleDeleteUser(user.id)}>🗑️</ActionButton>
                  </ButtonGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <CompanyUserRegisterModal 
        isOpen={openAddModal}
        onClose={handleCloseAddModal}
        user={newUser}
        onChange={handleInputChange}
        onSubmit={handleSubmitAdd}
        mode="register"
      />

      <CompanyUserRegisterModal 
        isOpen={openEditModal}
        onClose={handleCloseEditModal}
        user={editingUser || {}}
        onChange={handleInputChange}
        onSubmit={handleSubmitEdit}
        mode="edit"
      />
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
}))``;

const PageTitle = styled.h1.attrs(() => ({
  className: 'page-header'
}))`
`;

const SubTitle = styled.p`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 14px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px ${({ theme }) => theme.palette.action.hover};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 14px;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ accent, theme }) => accent ? theme.palette.primary.main : theme.palette.text.primary};
`;

const RoleBadge = styled.span.attrs(() => ({
  className: 'badge'
}))`
  background-color: ${({ role, theme }) => 
    role === "COMPANY_CHEF" || role === "COMPANY_ADMIN" ? theme.palette.secondary.main : theme.palette.grey[100]};
  color: ${({ role, theme }) => 
    role === "COMPANY_CHEF" || role === "COMPANY_ADMIN" ? theme.palette.secondary.contrastText : theme.palette.text.disabled};
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

export default CompanyUserManagementPage;
