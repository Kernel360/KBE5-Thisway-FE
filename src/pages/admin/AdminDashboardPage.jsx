import React from "react";
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
} from "@mui/material";

const stats = [
  { label: "총 가입 기업 수", value: 24 },
  { label: "총 가입 사용자 수", value: 120 },
  { label: "승인 대기 차량", value: 7 },
  { label: "오늘 등록된 운행", value: 15 },
];

const recentRequests = [
  {
    id: 1,
    company: "A기업",
    type: "차량 승인",
    status: "대기",
    date: "2024-06-01",
  },
  {
    id: 2,
    company: "B기업",
    type: "회원 가입",
    status: "완료",
    date: "2024-06-01",
  },
  {
    id: 3,
    company: "C기업",
    type: "차량 승인",
    status: "완료",
    date: "2024-05-31",
  },
  {
    id: 4,
    company: "D기업",
    type: "회원 가입",
    status: "대기",
    date: "2024-05-31",
  },
];

const AdminDashboardPage = () => {
  return (
    <Box
      sx={{ p: 4, backgroundColor: "background.default", minHeight: "100vh" }}
    >
      <Typography variant="h4" fontWeight={700} mb={4} color="primary.main">
        관리자 대시보드
      </Typography>
      {/* 통계 카드 영역 */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, background: "#fff" }}>
              <CardContent>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* 최근 요청/승인 내역 표 */}
      <Box>
        <Typography variant="h6" fontWeight={600} mb={2} color="secondary.main">
          최근 요청/승인 내역
        </Typography>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 2 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    backgroundColor: "grey.100",
                  }}
                >
                  기업명
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    backgroundColor: "grey.100",
                  }}
                >
                  요청 유형
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    backgroundColor: "grey.100",
                  }}
                >
                  상태
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    backgroundColor: "grey.100",
                  }}
                >
                  요청일
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentRequests.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.company}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AdminDashboardPage;
