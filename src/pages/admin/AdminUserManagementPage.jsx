import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
  Modal,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { authApi } from "../../utils/api";

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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // State for companies list
  const [companies, setCompanies] = useState([]);

  // Fetch companies list
  const fetchCompanies = async () => {
    try {
      // Assuming authApi is configured with a baseURL like /api
      const response = await authApi.get("/companies");
      console.log("Companies API response:", response);
      // Adjusted based on the provided response structure: { companies: { content: [...] } }
      if (response.data && response.data.companies && response.data.companies.content) {
        const fetchedCompanies = response.data.companies.content;
        setCompanies(fetchedCompanies);
        console.log("Fetched Companies content:", fetchedCompanies);
      } else {
        console.warn("Companies data structure not as expected:", response.data);
        setCompanies([]); // Set to empty if data structure is unexpected
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      // Handle error (e.g., show an error message)
      setCompanies([]); // Clear companies on error
    }
  };

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []); // Empty dependency array means this runs once on mount

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authApi.get("/members");
        setUsers(response.data.members.content);
      } catch (err) {
        setError("사용자 정보를 불러오는데 실패했습니다.");
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    if (managementType === "user") {
      fetchUsers();
    } else {
        setUsers([]);
        setLoading(false);
    }
  }, [managementType]);

  const usersPerPage = 4;
  const currentData = managementType === "user" ? users : mockCompanies;

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

  const handleSubmitAdd = async () => {
    console.log("New User Data:", newUser);

    // 필수 필드 유효성 검사
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.phone || !newUser.role || !newUser.company) { // company 필드 추가
      alert("필수 입력 항목(*)을 모두 채워주세요.");
      return;
    }

    // 비밀번호 확인 일치 여부 확인
    if (newUser.password !== newUser.confirmPassword) {
        alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
    }

    try {
      const registrationPayload = {
        companyId: newUser.company, // 선택된 회사 ID 사용
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone,
        memo: newUser.memo,
      };

      // ... existing code ...

    } catch (err) {
      console.error("Failed to register user:", err);
      // Handle error (e.g., show an error message)
    }
  };

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

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}
        {error && <Box sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Box>}

        {!loading && !error && (
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
        )}

        {!loading && !error && (filteredData.length > usersPerPage || page > 1) && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              count={Math.ceil(filteredData.length / usersPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        {!loading && !error && filteredData.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography color="text.secondary">데이터가 없습니다.</Typography>
            </Box>
        )}

      </Box>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="user-registration-modal-title"
        aria-describedby="user-registration-modal-description"
      >
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          borderRadius: "12px",
          boxShadow: 24,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Typography id="user-registration-modal-title" variant="h6" component="h2" fontWeight={700}>
              사용자 등록
            </Typography>
            <IconButton onClick={handleCloseModal} size="small" sx={{ bgcolor: "#F1F5F9", borderRadius: "16px", width: 32, height: 32 }}>
              <CloseIcon fontSize="small" sx={{ color: "#64748B" }} />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight={500} mb={0.5}>이름 *</Typography>
                <TextField
                  name="name"
                  placeholder="이름 입력"
                  sx={{ bgcolor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "6px", "& fieldset": { border: "none" } }}
                  value={newUser.name}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight={500} mb={0.5}>연락처 *</Typography>
                <TextField
                  name="phone"
                  placeholder="010-0000-0000"
                  sx={{ bgcolor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "6px", "& fieldset": { border: "none" } }}
                  value={newUser.phone}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>이메일 *</Typography>
              <TextField
                name="email"
                placeholder="이메일 입력"
                sx={{ bgcolor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "6px", "& fieldset": { border: "none" } }}
                value={newUser.email}
                onChange={handleInputChange}
                fullWidth
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight={500} mb={0.5}>비밀번호 *</Typography>
                <TextField
                  name="password"
                  placeholder="비밀번호 입력"
                  sx={{ bgcolor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "6px", "& fieldset": { border: "none" } }}
                  value={newUser.password}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight={500} mb={0.5}>비밀번호 확인 *</Typography>
                <TextField
                  name="confirmPassword"
                  placeholder="비밀번호 확인"
                  sx={{ bgcolor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "6px", "& fieldset": { border: "none" } }}
                  value={newUser.confirmPassword}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>소속 업체 *</Typography>
              <FormControl fullWidth size="small" sx={{ bgcolor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "6px", ".MuiOutlinedInput-notchedOutline": { border: "none" } }}>
                <InputLabel id="company-select-label">업체 선택</InputLabel>
                <Select
                  labelId="company-select-label"
                  id="company-select"
                  name="company"
                  value={newUser.company}
                  label="업체 선택"
                  onChange={handleInputChange}
                >
                  {companies.map((company, index) => (
                    // Assuming company object has 'name' for display
                    // Using index as key and company.name as value for now, as ID is not available
                    <MenuItem key={index} value={company.name}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>권한 *</Typography>
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  row
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                >
                  <FormControlLabel value="관리자" control={<Radio size="small" />} label="관리자" />
                  <FormControlLabel value="업체 최고 관리자" control={<Radio size="small" />} label="업체 최고 관리자" />
                  <FormControlLabel value="업체관리자" control={<Radio size="small" />} label="업체관리자" />
                  <FormControlLabel value="일반 유저" control={<Radio size="small" />} label="일반 유저" />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="body2" fontWeight={500} mb={0.5}>메모</Typography>
              <TextField
                name="memo"
                placeholder="추가 정보 입력"
                sx={{ bgcolor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "6px", "& fieldset": { border: "none" } }}
                value={newUser.memo}
                onChange={handleInputChange}
                multiline
                rows={3}
                fullWidth
              />
            </Box>

          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
            <Button variant="outlined" onClick={handleCloseModal} sx={{ width: 100, height: 44, borderColor: "#CBD5E1", color: "#64748B", borderRadius: "6px" }}>취소</Button>
            <Button variant="contained" onClick={handleSubmitAdd} sx={{ width: 100, height: 44, bgcolor: "#3B82F6", "&:hover": { bgcolor: "#2563EB" }, borderRadius: "6px", color: "#FFFFFF" }}>등록</Button>
          </Box>
        </Box>
      </Modal>

    </Box>
  );
};

export default AdminUserManagementPage;
