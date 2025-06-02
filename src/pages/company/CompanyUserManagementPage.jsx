import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Pagination,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { authApi } from "../../utils/api"; // Import authApi - Corrected path

// Sidebar component (simplified for now, actual implementation might be in a separate file)
const Sidebar = () => {
  return (
    <Box sx={{ width: 240, flexShrink: 0, bgcolor: "white", p: 2, borderRight: "1px solid #E2E8F0" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} color="primary.dark">차량 관제 시스템</Typography>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" mb={1}>메뉴</Typography>
        {/* Menu items */}
        <Box>대시보드</Box>
        <Box>차량 관리</Box>
        <Box sx={{ bgcolor: "#EFF6FF", p: 1, borderRadius: "6px", color: "primary.main", fontWeight: 900 }}>사용자 관리</Box>
        <Box>운행 기록</Box>
        <Box>통계</Box>
        <Box>설정</Box>
      </Box>
      <Box sx={{ mt: "auto", bgcolor: "#F8FAFC", p: 1.5, borderRadius: "6px" }}>
        <Typography variant="body2" fontWeight={700} color="text.primary">김관리</Typography>
        <Typography variant="caption" color="text.secondary">업체 관리자</Typography>
      </Box>
    </Box>
  );
};

const CompanyUserManagementPage = () => {
  const [openAddModal, setOpenAddModal] = useState(false); // State for add modal
  const [openEditModal, setOpenEditModal] = useState(false); // State for edit modal
  const [users, setUsers] = useState([]); // State to store fetched user data
  const [totalUsers, setTotalUsers] = useState(0); // State to store total user count
  const [companyChefCount, setCompanyChefCount] = useState(0); // State for COMPANY_CHEF count
  const [memberCount, setMemberCount] = useState(0); // State for MEMBER count

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    memo: "",
    role: "MEMBER", // Default role for new user
    password: "",
    confirmPassword: "",
  });

  const [editingUser, setEditingUser] = useState(null); // State to store user being edited

  // Fetch user data
  const fetchUsers = async () => {
    try {
      const response = await authApi.get("/members");
      // Assuming the response data structure matches the provided sample
      if (response.data && response.data.members) {
        const fetchedUsers = response.data.members.content;
        setUsers(fetchedUsers);
        setTotalUsers(response.data.members.totalElements);

        // Calculate role counts
        const chefCount = fetchedUsers.filter(user => user.role === 'COMPANY_CHEF').length;
        const memberCnt = fetchedUsers.filter(user => user.role === 'MEMBER').length;
        
        setCompanyChefCount(chefCount);
        setMemberCount(memberCnt);

      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // Handle error (e.g., show an error message)
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      memo: "",
      role: "MEMBER", // Reset to default role
      password: "",
      confirmPassword: "",
    }); // Reset form on close
  };

  const handleOpenEditModal = (user) => {
    setEditingUser({ ...user, password: "", confirmPassword: "" }); // Set user data and clear password fields
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditingUser(null); // Clear editing user state
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
    // TODO: Implement user registration logic using authApi.post('/members', newUser)
    console.log("New User Data:", newUser);
    handleCloseAddModal();
  };

  const handleSubmitEdit = () => {
    // TODO: Implement user update logic using authApi.put('/members/' + editingUser.id, editingUser)
    console.log("Editing User Data:", editingUser);
    handleCloseEditModal();
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm("이 사용자를 삭제하시겠습니까?")) { // Confirmation prompt
      try {
        // Adjust the URL based on your API endpoint structure if needed
        await authApi.delete(`/members/${userId}`);
        console.log(`User with ID ${userId} deleted successfully.`);
        fetchUsers(); // Re-fetch users after deletion
      } catch (error) {
        console.error(`Error deleting user with ID ${userId}:`, error);
        // Handle error (e.g., show an error message to the user)
        alert("사용자 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F5F7FA" }}>
      {/* <Sidebar /> */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">사용자 관리</Typography>
            <Typography variant="subtitle1" color="text.secondary">ABC 렌트카의 사용자를 관리합니다.</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="사용자 검색..."
              sx={{ width: 240, bgcolor: "white" }}
            />
            <Button
              variant="contained"
              startIcon={"+"}
              sx={{ height: 40, bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
              onClick={handleOpenAddModal} // Open add modal on click
            >
              사용자 등록
            </Button>
          </Box>
        </Box>

        {/* User Stats */}
        <Grid container spacing={2} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ boxShadow: 1, borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">전체 사용자</Typography>
                {/* Display total user count from API response */}
                <Typography variant="h5" fontWeight={700} color="text.primary">{totalUsers}명</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ boxShadow: 1, borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">관리자</Typography>
                 {/* Display COMPANY_CHEF count */}
                <Typography variant="h5" fontWeight={700} color="primary.main">{companyChefCount}명</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ boxShadow: 1, borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">일반 사용자</Typography>
                 {/* Display MEMBER count */}
                <Typography variant="h5" fontWeight={700} color="text.secondary">{memberCount}명</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* User Table */}
        <Box sx={{ boxShadow: 1, borderRadius: "8px", overflow: "hidden" }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#334155", width: "60px" }}>번호</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#334155", width: "160px" }}>이름</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#334155", width: "200px" }}>이메일</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#334155", width: "140px" }}>연락처</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#334155", width: "140px" }}>메모</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#334155", width: "120px" }}>권한</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#334155", width: "100px" }}>관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  // Use user.id from API response as key
                  <TableRow key={user.id || index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    {/* Use index + 1 for sequential numbering as API might not provide a sequential number field */}
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.memo}</TableCell>
                    <TableCell>
                      {/* Use role from API response and map to Korean label */}
                      <Box sx={{ bgcolor: user.role === "COMPANY_CHEF" ? "#EFF6FF" : user.role === "MEMBER" ? "#F1F5F9" : "#FFFFFF", color: user.role === "COMPANY_CHEF" ? "primary.main" : "text.secondary", borderRadius: "12px", px: 1, py: 0.5, display: "inline-block", fontWeight: 500, fontSize: "12px" }}>
                        {user.role === "COMPANY_CHEF" ? "관리자" : user.role === "MEMBER" ? "일반 사용자" : user.role}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant="contained" size="small" sx={{ minWidth: "unset", width: "32px", height: "32px", bgcolor: "#F1F5F9", color: "text.secondary", boxShadow: "none", "&:hover": { bgcolor: "#E2E8F0" } }} onClick={() => handleOpenEditModal(user)}>✏️</Button>
                        <Button variant="contained" size="small" sx={{ minWidth: "unset", width: "32px", height: "32px", bgcolor: "#FEE2E2", color: "#EF4444", boxShadow: "none", "&:hover": { bgcolor: "#FECACA" } }} onClick={() => handleDeleteUser(user.id)}>🗑️</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Pagination */}
        {/* TODO: Implement pagination logic based on fetched data */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          {/* Assuming pagination count should be based on totalPages from API */}
          <Pagination count={Math.ceil(totalUsers / 10)} shape="rounded" />
        </Box>

        {/* User Registration Modal */}
        <Modal
          open={openAddModal}
          onClose={handleCloseAddModal}
          aria-labelledby="user-registration-modal-title"
          aria-describedby="user-registration-modal-description"
        >
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600, // Adjusted width based on Figma
            bgcolor: "background.paper",
            borderRadius: "12px", // Adjusted border radius
            boxShadow: 24,
            p: 3, // Adjusted padding
            display: "flex",
            flexDirection: "column",
            gap: 2.5, // Adjusted gap
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}> {/* Header box */}
              <Typography id="user-registration-modal-title" variant="h6" component="h2" fontWeight={700}>
                사용자 등록
              </Typography>
              <IconButton onClick={handleCloseAddModal} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}> {/* Form box */}
              <Grid container spacing={2}> {/* First row: Name, Phone */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>이름 *</Typography>
                  <TextField
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    placeholder="이름 입력"
                    sx={{ bgcolor: "#F8FAFC" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>연락처 *</Typography>
                  <TextField
                    name="phone"
                    value={newUser.phone}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    placeholder="010-0000-0000"
                    sx={{ bgcolor: "#F8FAFC" }}
                  />
                </Grid>
              </Grid>

              <Box> {/* Second row: Email */}
                <Typography variant="body2" fontWeight={500} mb={0.5}>이메일 *</Typography>
                <TextField
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  placeholder="이메일 입력"
                  sx={{ bgcolor: "#F8FAFC" }}
                />
              </Box>

              <Grid container spacing={2}> {/* Third row: Password, Confirm Password */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>비밀번호 *</Typography>
                  <TextField
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    type="password"
                    placeholder="비밀번호 입력"
                    sx={{ bgcolor: "#F8FAFC" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>비밀번호 확인 *
                  </Typography>
                  <TextField
                    name="confirmPassword"
                    value={newUser.confirmPassword}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    type="password"
                    placeholder="비밀번호 확인"
                    sx={{ bgcolor: "#F8FAFC" }}
                  />
                </Grid>
              </Grid>

              <Box> {/* Fourth row: Role */}
                <Typography variant="body2" fontWeight={500} mb={0.5}>권한 *</Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    {/* Use API role values */}
                    <FormControlLabel value="COMPANY_CHEF" control={<Radio size="small" />} label="관리자" />
                    <FormControlLabel value="MEMBER" control={<Radio size="small" />} label="일반 사용자" />
                     {/* Other roles can be added if needed */}
                  </RadioGroup>
                </FormControl>
              </Box>

              <Box> {/* Fifth row: Memo */}
                <Typography variant="body2" fontWeight={500} mb={0.5}>메모</Typography>
                <TextField
                  name="memo"
                  value={newUser.memo}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={3} // Adjusted rows
                  placeholder="추가 정보 입력"
                  sx={{ bgcolor: "#F8FAFC" }}
                />
              </Box>

            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}> {/* Action buttons */}
              <Button variant="outlined" onClick={handleCloseAddModal} sx={{ width: 100, height: 44, borderColor: "#CBD5E1", color: "#64748B" }}>취소</Button>
              <Button variant="contained" onClick={handleSubmitAdd} sx={{ width: 100, height: 44, bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}>등록</Button>
            </Box>
          </Box>
        </Modal>

        {/* User Edit Modal */}
        <Modal
          open={openEditModal}
          onClose={handleCloseEditModal}
          aria-labelledby="user-edit-modal-title"
          aria-describedby="user-edit-modal-description"
        >
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600, // Consistent width with add modal
            bgcolor: "background.paper",
            borderRadius: "12px", // Consistent border radius
            boxShadow: 24,
            p: 3, // Consistent padding
            display: "flex",
            flexDirection: "column",
            gap: 2.5, // Consistent gap
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}> {/* Header box */}
              <Typography id="user-edit-modal-title" variant="h6" component="h2" fontWeight={700}>
                사용자 수정
              </Typography>
              <IconButton onClick={handleCloseEditModal} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}> {/* Form box */}
              <Grid container spacing={2}> {/* First row: Name, Phone */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>이름 *</Typography>
                  <TextField
                    name="name"
                    value={editingUser?.name || ""}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    placeholder="이름 입력"
                    sx={{ bgcolor: "#F8FAFC" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>연락처 *</Typography>
                  <TextField
                    name="phone"
                    value={editingUser?.phone || ""}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    placeholder="010-0000-0000"
                    sx={{ bgcolor: "#F8FAFC" }}
                  />
                </Grid>
              </Grid>

              <Box> {/* Second row: Email */}
                <Typography variant="body2" fontWeight={500} mb={0.5}>이메일 *</Typography>
                <TextField
                  name="email"
                  value={editingUser?.email || ""}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  placeholder="이메일 입력"
                  sx={{ bgcolor: "#F8FAFC" }}
                />
              </Box>

               {/* Password fields are intentionally omitted as per Figma, assuming password change is separate or not in this modal */}

              <Box> {/* Fourth row: Role */}
                <Typography variant="body2" fontWeight={500} mb={0.5}>권한 *</Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    name="role"
                    value={editingUser?.role || "MEMBER"}
                    onChange={handleInputChange}
                  >
                    {/* Use API role values */}
                    <FormControlLabel value="COMPANY_CHEF" control={<Radio size="small" />} label="관리자" />
                    <FormControlLabel value="MEMBER" control={<Radio size="small" />} label="일반 사용자" />
                     {/* Other roles can be added if needed */}
                  </RadioGroup>
                </FormControl>
              </Box>

              <Box> {/* Fifth row: Memo */}
                <Typography variant="body2" fontWeight={500} mb={0.5}>메모</Typography>
                <TextField
                  name="memo"
                  value={editingUser?.memo || ""}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={3} // Consistent rows
                  placeholder="추가 정보 입력"
                  sx={{ bgcolor: "#F8FAFC" }}
                />
              </Box>

              {/* Last Login field */}
              <Box>
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  마지막 로그인: {editingUser?.lastLogin || "정보 없음"}
                </Typography>
              </Box>

            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}> {/* Action buttons */}
              <Button variant="outlined" onClick={handleCloseEditModal} sx={{ width: 100, height: 44, borderColor: "#CBD5E1", color: "#64748B" }}>취소</Button>
              <Button variant="contained" onClick={handleSubmitEdit} sx={{ width: 100, height: 44, bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}>저장</Button>
            </Box>
          </Box>
        </Modal>

      </Box>
    </Box>
  );
};

export default CompanyUserManagementPage;
