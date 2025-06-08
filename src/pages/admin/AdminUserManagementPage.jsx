import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { authApi } from "../../utils/api";
import SearchInput from "../../components/SearchInput";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import AdminUserRegisterModal from "./AdminUserRegisterModal";

// mock 데이터
// const DUMMY_USERS = [
//   { id: 1, name: "김관리", email: "kim@abc-rent.com", phone: "010-1234-5678", company: "ABC 렌트카", memo: "김관리입니다.", role: "COMPANY_ADMIN", status: "활성" },
//   { id: 2, name: "이부장", email: "lee@abc-rent.com", phone: "010-2345-6789", company: "ABC 렌트카", memo: "이부장입니다.", role: "COMPANY_CHEF", status: "활성" },
//   { id: 3, name: "박대리", email: "park@abc-rent.com", phone: "010-3456-7890", company: "가나다 상사", memo: "박대리입니다.", role: "MEMBER", status: "활성" },
//   { id: 4, name: "최사원", email: "choi@abc-rent.com", phone: "010-4567-8901", company: "라마바 서비스", memo: "최사원입니다.", role: "ADMIN", status: "비활성" },
//   { id: 5, name: "홍길동", email: "hong@example.com", phone: "010-5678-1234", company: "가나다 상사", memo: "테스트 계정", role: "MEMBER", status: "활성" },
//   { id: 6, name: "김영희", email: "kimyh@test.com", phone: "010-6789-0123", company: "ABC 렌트카", memo: "", role: "COMPANY_ADMIN", status: "활성" },
//   { id: 7, name: "박철수", email: "parkcs@example.com", phone: "010-7890-1234", company: "라마바 서비스", memo: "", role: "ADMIN", status: "비활성" },
//   { id: 8, name: "이미나", email: "lee.mina@abc-rent.com", phone: "010-8901-2345", company: "ABC 렌트카", memo: "", role: "COMPANY_ADMIN", status: "활성" },
//   { id: 9, name: "정수민", email: "jsm@abc-rent.com", phone: "010-9012-3456", company: "ABC 렌트카", memo: "", role: "COMPANY_ADMIN", status: "활성" },
//   { id: 10, name: "강동원", email: "kdw@ganada.com", phone: "010-0123-4567", company: "가나다 상사", memo: "", role: "MEMBER", status: "활성" },
//   { id: 11, name: "윤서연", email: "ysy@ramaba.com", phone: "010-1234-5679", company: "라마바 서비스", memo: "", role: "ADMIN", status: "활성" },
//   { id: 12, name: "임재현", email: "ljh@abc-rent.com", phone: "010-2345-6780", company: "ABC 렌트카", memo: "", role: "COMPANY_CHEF", status: "활성" },
//   { id: 13, name: "한지민", email: "hjm@ganada.com", phone: "010-3456-7891", company: "가나다 상사", memo: "", role: "COMPANY_ADMIN", status: "비활성" },
//   { id: 14, name: "오민수", email: "oms@ramaba.com", phone: "010-4567-8902", company: "라마바 서비스", memo: "", role: "ADMIN", status: "활성" },
//   { id: 15, name: "서영준", email: "syj@abc-rent.com", phone: "010-5678-9013", company: "ABC 렌트카", memo: "", role: "COMPANY_ADMIN", status: "활성" },
//   { id: 16, name: "장미란", email: "jmr@ganada.com", phone: "010-6789-0124", company: "가나다 상사", memo: "", role: "COMPANY_CHEF", status: "활성" },
//   { id: 17, name: "김태희", email: "kth@ramaba.com", phone: "010-7890-1235", company: "라마바 서비스", memo: "", role: "ADMIN", status: "활성" },
//   { id: 18, name: "이승기", email: "lsg@abc-rent.com", phone: "010-8901-2346", company: "ABC 렌트카", memo: "", role: "COMPANY_ADMIN", status: "비활성" },
//   { id: 19, name: "박보영", email: "pby@ganada.com", phone: "010-9012-3457", company: "가나다 상사", memo: "", role: "MEMBER", status: "활성" },
//   { id: 20, name: "최우식", email: "cws@ramaba.com", phone: "010-0123-4568", company: "라마바 서비스", memo: "", role: "ADMIN", status: "활성" },
//   { id: 21, name: "정유미", email: "jym@abc-rent.com", phone: "010-1234-5670", company: "ABC 렌트카", memo: "", role: "COMPANY_ADMIN", status: "활성" },
//   { id: 22, name: "강하늘", email: "khn@ganada.com", phone: "010-2345-6781", company: "가나다 상사", memo: "", role: "MEMBER", status: "활성" },
//   { id: 23, name: "손예진", email: "syj@ramaba.com", phone: "010-3456-7892", company: "라마바 서비스", memo: "", role: "ADMIN", status: "비활성" },
//   { id: 24, name: "현빈", email: "hyunbin@abc-rent.com", phone: "010-4567-8903", company: "ABC 렌트카", memo: "", role: "COMPANY_ADMIN", status: "활성" }
// ];

const DUMMY_COMPANIES = [
  { id: 1, name: "ABC 렌트카", email: "info@abc-rent.com", phone: "02-1234-5678", memo: "본사", status: "활성" },
  { id: 2, name: "가나다 상사", email: "contact@ganada.com", phone: "02-2345-6789", memo: "지점", status: "활성" },
  { id: 3, name: "라마바 서비스", email: "help@ramaba.com", phone: "02-3456-7890", memo: "협력사", status: "비활성" },
];

// 유효성 검사를 위한 정규식
const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const PHONE_REGEX = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;

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
  const [companies, setCompanies] = useState(DUMMY_COMPANIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);

  // 검색어에 따른 필터링
  const filteredData = managementType === "user" 
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : companies.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.phone.includes(searchTerm)
      );

  // 페이지네이션 계산
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = (id) => {
    if (window.confirm(`이 ${managementType === "user" ? "사용자" : "업체"}를 삭제하시겠습니까?`)) {
      if (managementType === "user") {
        setUsers(users.filter(user => user.id !== id));
      } else {
        setCompanies(companies.filter(company => company.id !== id));
      }
    }
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleSubmit = (formData, type) => {
    // 이메일 유효성 검사
    if (!EMAIL_REGEX.test(formData.email)) {
      alert("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    // 전화번호 유효성 검사
    if (!PHONE_REGEX.test(formData.phone)) {
      alert("전화번호 형식이 올바르지 않습니다. (예: 02-1234-5678 또는 010-1234-5678)");
      return;
    }

    if (type === "create") {
      const newData = {
        ...formData,
        id: Math.max(...(managementType === "user" ? users : companies).map(item => item.id)) + 1
      };

      if (managementType === "user") {
        setUsers([...users, newData]);
      } else {
        setCompanies([...companies, newData]);
      }
    } else {
      if (managementType === "user") {
        setUsers(users.map(user => user.id === formData.id ? formData : user));
      } else {
        setCompanies(companies.map(company => company.id === formData.id ? formData : company));
      }
    }
    handleCloseModal();
  };

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
          <Button
            onClick={() => handleOpenModal("create")}
            startIcon="+"
          >
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
                  <TableHeaderCell width="100px">상태</TableHeaderCell>
                </>
              ) : (
                <>
                  <TableHeaderCell width="200px">업체명</TableHeaderCell>
                  <TableHeaderCell width="180px">이메일</TableHeaderCell>
                  <TableHeaderCell width="140px">연락처</TableHeaderCell>
                  <TableHeaderCell width="200px">메모</TableHeaderCell>
                  <TableHeaderCell width="100px">상태</TableHeaderCell>
                </>
              )}
              <TableHeaderCell width="100px">관리</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <EmptyCell colSpan={managementType === "user" ? 8 : 7}>
                  {managementType === "user" 
                    ? "등록된 사용자가 없습니다." 
                    : "등록된 업체가 없습니다."}
                </EmptyCell>
              </TableRow>
            ) : (currentItems.map((item, index) => (
                  <TableRow key={item.id}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  {managementType === "user" ? (
                    <>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.phone}</TableCell>
                      <TableCell>{item.company}</TableCell>
                      <TableCell>
                        <RoleBadge role={item.role}>
                          {getRoleDisplayName(item.role)}
                        </RoleBadge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status}>
                          {item.status === "활성" ? "활성" : "비활성"}
                        </StatusBadge>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>{item.phone}</TableCell>
                      <TableCell>{item.memo}</TableCell>
                      <TableCell>
                        <StatusBadge status={item.status}>
                          {item.status === "활성" ? "활성" : "비활성"}
                        </StatusBadge>
                      </TableCell>
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

      {currentItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <AdminUserRegisterModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        mode={managementType}
        type={modalType}
        initialData={selectedItem}
        onSubmit={handleSubmit}
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
    status === "활성" ? theme.palette.success.main : theme.palette.error.main};
  color: ${({ status, theme }) => 
    status === "활성" ? theme.palette.success.contrastText : theme.palette.error.contrastText};
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

export default AdminUserManagementPage;