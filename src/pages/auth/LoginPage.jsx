import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { loginApi, saveTokenFromResponse } from "@/utils/api";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      setLoading(false);
      return;
    }
    try {
      const response = await loginApi.post("/auth/login", { email, password });
      saveTokenFromResponse(response);
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError(
          "이메일 또는 비밀번호가 올바르지 않습니다. 다시 시도해 주세요.",
        );
      } else {
        setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: 360 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          variant="h5"
          fontWeight={700}
          color="primary.main"
          mb={2}
          align="center"
        >
          Thisway 로그인
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={3}
          align="center"
        >
          관리자/업체 전용 서비스입니다
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="이메일"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            type="email"
            required
          />
          <TextField
            label="비밀번호"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="비밀번호 보기 토글"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 2, fontWeight: 700, borderRadius: 2 }}
            disabled={loading}
          >
            로그인
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
