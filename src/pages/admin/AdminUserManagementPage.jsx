import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
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
  ButtonGroup,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// mock 데이터
const mockUsers = [
  { id: 1, name: "김관리", email: "kim@abc-rent.com", phone: "010-1234-5678", company: "ABC 렌트카", memo: "김관리입니다.", role: "관리자", status: "활성" },
  { id: 2, name: "이부장", email: "lee@abc-rent.com", phone: "010-2345-6789", company: "ABC 렌트카", memo: "이부장입니다.", role: "관리자", status: "활성" },
  { id: 3, name: "박대리", email: "park@abc-rent.com", phone: "010-3456-7890", company: "가나다 상사", memo: "박대리입니다.", role: "일반 사용자", status: "활성" },
  { id: 4, name: "최사원", email: "choi@abc-rent.com", phone: "010-4567-8901", company: "라마바 서비스", memo: "최사원입니다.", role: "일반 사용자", status: "비활성" },
  // ...더 많은 데이터
];

// 임시 mock 업체 데이터 (필요시 사용)
const mockCompanies = [
    { id: 1, name: "ABC 렌트카", email: "info@abc-rent.com", phone: "02-1234-5678", memo: "본사" },
    // ...
];

const AdminUserManagementPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [managementType, setManagementType] = useState("user"); // 'user' 또는 'company' 선택 상태
  
  // 현재 선택된 타입에 따라 데이터 필터링
  const currentData = managementType === "user" ? mockUsers : mockCompanies;

  const usersPerPage = 4;
  const filteredData = currentData.filter(
    (item) => item.name.includes(search) || item.email.includes(search)
  );
  const pagedData = filteredData.slice((page - 1) * usersPerPage, page * usersPerPage);

  // 테이블 헤더 정의
  const tableHeaders = managementType === "user" ?
    ["번호", "이름", "이메일", "연락처", "소속 업체", "권한", "상태", "관리"] :
    ["번호", "업체명", "이메일", "연락처", "메모", "관리"]; // 업체 목록에 필요한 헤더로 수정 (예시)


  return (
    <Box sx={{ p: 4, backgroundColor: "background.default", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="primary.main">
        사용자/업체 관리
      </Typography>
      {/* 상단 타이틀 아래에 사용자 관리 내용 추가 */}
      <Box>

        {/* 사용자/업체 선택 버튼 및 검색/등록 버튼 영역 */}
        <Grid container justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
            <Grid item>
                <ButtonGroup variant="outlined" aria-label="management type button group">
                    <Button
                        variant={managementType === "user" ? "contained" : "outlined"}
                        onClick={() => setManagementType("user")}
                    >
                        사용자
                    </Button>
                    <Button
                        variant={managementType === "company" ? "contained" : "outlined"}
                        onClick={() => setManagementType("company")}
                    >
                        업체
                    </Button>
                </ButtonGroup>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder={managementType === "user" ? "사용자 검색..." : "업체 검색..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: 220 }}
                />
                <Button variant="contained" color="primary">
                  {managementType === "user" ? "+ 사용자 등록" : "+ 업체 등록"}
                </Button>
              </Box>
            </Grid>
          </Grid>

        {/* 사용자 테이블 */}
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header, index) => (
                    <TableCell key={index} sx={{ fontWeight: 700, color: "primary.main", backgroundColor: "grey.100" }}>
                        {header}
                    </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedData.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{(page - 1) * usersPerPage + idx + 1}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  {managementType === "user" && <TableCell>{item.company}</TableCell>}{/* 소속 업체 */}
                  {managementType === "user" && ( // 사용자일 경우에만 권한 셀 표시
                    <TableCell>
                      <Chip
                        label={item.role}
                        color={item.role === "관리자" ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {managementType === "user" && ( // 사용자일 경우에만 상태 셀 표시
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === "활성" ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                  )}
                  <TableCell>{item.memo}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* 페이지네이션 */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Pagination
            count={Math.ceil(filteredData.length / usersPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminUserManagementPage; // eslint-disable-line
