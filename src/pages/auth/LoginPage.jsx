import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../components/Button';
import { loginApi, saveTokenFromResponse } from "../../utils/api";
import { getToken, getUserRole } from "../../utils/auth";
import useUserStore from "../../store/userStore";
import { ROUTES } from "../../routes";
import logo from "../../assets/logo.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setToken = useUserStore((state) => state.setToken);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const role = getUserRole(token);
    if (role === "ADMIN") navigate("/admin/manage", { replace: true });
    else if (role === "COMPANY_ADMIN" || role === "COMPANY_CHEF")
      navigate("/company/dashboard", { replace: true });
    else if (role === "MEMBER") navigate(ROUTES.member.dashboard, { replace: true });
  }, [navigate]);

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
      setToken(response.data.token);
      navigate("/");
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
    <Container>
      <FormWrapper>
        <LogoImage src={logo} alt="ThisWay Logo" />
        <BrandName>THIS WAY</BrandName>
        <Title>로그인</Title>
        <Description>차량 운영 관리 시스템에 로그인하세요.</Description>

        <Form onSubmit={handleLogin}>
          <FormGroup>
            <Label htmlFor="login-email">이메일</Label>
            <Input
              id="login-email"
              autoComplete="username"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="login-password">비밀번호</Label>
            <Input
              id="login-password"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </FormGroup>

          {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

          <LoginButton type="submit" disabled={loading}>
            로그인
          </LoginButton>

          <ForgotPassword type="button" onClick={() => navigate('/password-reset')}>
            비밀번호를 잊으셨나요?
          </ForgotPassword>
        </Form>
      </FormWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 40px 20px;
  @media (max-width: 600px) { padding: 24px 16px; }
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 460px;
  padding: 36px;
  @media (max-width: 600px) { padding: 28px 22px; }
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 18px;
  border: 1px solid #E3E9EE;
  box-shadow: 0 12px 40px rgba(21, 36, 45, 0.05);
  text-align: center;
`;

const LogoImage = styled.img`
  width: 48px;
  height: auto;
  display: block;
  margin: 0 auto 16px;
`;

const BrandName = styled.p`
  color: #1e3a8a;
  font-weight: 750;
  font-size: 15px;
  letter-spacing: 1.5px;
  margin-bottom: 28px;
`;

const Title = styled.h1`
  font-size: 28px;
  letter-spacing: -0.6px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 8px;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: 32px;
`;

const Form = styled.form`
  text-align: left;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.primary};
  background-color: ${({ theme }) => theme.palette.background.paper};

  &:focus {
    outline: 2px solid #087F8C;
    outline-offset: 2px;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }

  &::placeholder {
    color: ${({ theme }) => theme.palette.text.disabled};
  }
`;

const ForgotPassword = styled.button`
  display: block;
  width: 100%;
  padding: 8px;
  border: none;
  background: none;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.primary.main};
  cursor: pointer;
  margin-bottom: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 48px;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.palette.error.main};
  color: ${({ theme }) => theme.palette.error.contrastText};
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
`;

export default LoginPage;
