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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// mock 데이터 (API 연동 후 삭제 예정)
const mockUsers = [
  { id: 1, name: "김관리", email: "kim@abc-rent.com", phone: "010-1234-5678", company: "ABC 렌트카", memo: "김관리입니다.", role: "관리자", status: "활성" },
  { id: 2, name: "이부장", email: "lee@abc-rent.com", phone: "010-2345-6789", company: "ABC 렌트카", memo: "이부장입니다.", role: "관리자", status: "활성" },
  { id: 3, name: "박대리", email: "park@abc-rent.com", phone: "010-3456-7890", company: "가나다 상사", memo: "박대리입니다.", role: "일반 사용자", status: "활성" },
  { id: 4, name: "최사원", email: "choi@abc-rent.com", phone: "010-4567-8901", company: "라마바 서비스", memo: "최사원입니다.", role: "일반 사용자", status: "비활성" },
  { id: 5, name: "홍길동", email: "hong@example.com", phone: "010-5678-1234", company: "가나다 상사", memo: "테스트 계정", role: "일반 사용자", status: "활성" },
  { id: 6, name: "김영희", email: "kimyh@test.com", phone: "010-6789-0123", company: "ABC 렌트카", memo: "", role: "일반 사용자", status: "활성" },
  { id: 7, name: "박철수", email: "parkcs@example.com", phone: "010-7890-1234", company: "라마바 서비스", memo: "", role: "관리자", status: "비활성" },
];

// 임시 mock 업체 데이터 (필요시 사용)
const mockCompanies = [
    { id: 1, name: "ABC 렌트카", email: "info@abc-rent.com", phone: "02-1234-5678", memo: "본사" },
    // ...
];

const AdminUserManagementPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [managementType, setManagementType] = useState("user");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: '',
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const usersPerPage = 4;
  const currentData = managementType === "user" ? mockUsers : mockCompanies;

  const filteredData = currentData.filter(
    (item) =>
      (item.name && item.name.toLowerCase().includes(search.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(search.toLowerCase())) ||
      (item.company && item.company.toLowerCase().includes(search.toLowerCase())) ||
      (item.role && item.role.toLowerCase().includes(search.toLowerCase())) ||
      (item.status && item.status.toLowerCase().includes(search.toLowerCase()))
  );
  const pagedData = filteredData.slice((page - 1) * usersPerPage, page * usersPerPage);

  const tableHeaders = managementType === "user" ?
    ["번호", "이름", "이메일", "연락처", "소속 업체", "권한", "상태", "관리"] :
    ["번호", "업체명", "이메일", "연락처", "메모", "관리"];

  return (
    <Box sx={{ p: 4, backgroundColor: "background.default", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="primary.main">
        사용자/업체 관리
      </Typography>
      <Box>
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
                {managementType === "user" && (
                  <Button variant="contained" color="primary" onClick={handleOpenModal}>
                    + 사용자 등록
                  </Button>
                )}
                {managementType === "company" && (
                  <Button variant="contained" color="primary">
                    + 업체 등록
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

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
                  {managementType === "user" && item.company && <TableCell>{item.company}</TableCell>}
                  {managementType === "user" && item.role && (
                    <TableCell>
                      <Chip
                        label={item.role}
                        color={item.role === "관리자" ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {managementType === "user" && item.status && (
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={item.status === "활성" ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                  )}
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

        {(filteredData.length > usersPerPage || page > 1) && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(filteredData.length / usersPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        {filteredData.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography color="text.secondary">데이터가 없습니다.</Typography>
            </Box>
        )}

      </Box>

      <Dialog open={isModalOpen} onClose={handleCloseModal} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">사용자 등록</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" name="name" label="이름" type="text" fullWidth value={newUser.name} onChange={handleInputChange} />
          <TextField margin="dense" name="phone" label="연락처" type="text" fullWidth value={newUser.phone} onChange={handleInputChange} />
          <TextField margin="dense" name="email" label="이메일" type="email" fullWidth value={newUser.email} onChange={handleInputChange} />
          <TextField margin="dense" name="password" label="비밀번호" type="password" fullWidth value={newUser.password} onChange={handleInputChange} />
          <TextField margin="dense" name="confirmPassword" label="비밀번호 확인" type="password" fullWidth value={newUser.confirmPassword} onChange={handleInputChange} />
          <TextField margin="dense" name="company" label="소속 업체" type="text" fullWidth value={newUser.company} onChange={handleInputChange} />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-label">권한</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={newUser.role}
              label="권한"
              onChange={handleInputChange}
            >
              <MenuItem value="관리자">관리자</MenuItem>
              <MenuItem value="업체 최고 관리자">업체 최고 관리자</MenuItem>
              <MenuItem value="업체관리자">업체관리자</MenuItem>
              <MenuItem value="일반 유저">일반 유저</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            취소
          </Button>
          <Button onClick={handleCloseModal} color="primary">
            등록
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminUserManagementPage;
