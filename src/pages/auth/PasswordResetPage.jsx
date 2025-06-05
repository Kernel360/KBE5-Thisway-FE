import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../components/Button';
import logo from "../../assets/logo.png";
import { loginApi } from "../../utils/api"

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(600);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [error, setError] = useState('');

  const passwordMismatch = newPassword !== confirmPassword;
  const isResetButtonEnabled =
    code !== '' &&
    newPassword !== '' &&
    confirmPassword !== '' &&
    newPassword === confirmPassword;

  useEffect(() => {
    let interval;
    if (isVerificationSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVerificationSent, timer]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleSendVerification = async() => {
    try {
      setError('');
      const response = await loginApi.post('/auth/verify-code', {email});

      if (response.status === 200) {
        setIsVerificationSent(true);
        setTimer(600);
      } else {
        setError('인증 코드 발송에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      setError('인증 코드 발송에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await loginApi.put('/auth/password', {
        email,
        code,
        newPassword,
      });

      if (response.status === 200) {
        navigate('/password-reset/success');
      } else {
        navigate('/password-reset/error');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setError('인증번호가 올바르지 않습니다.');
      } else {
        navigate('/password-reset/error');
      }
    }
  };

  return (
    <Container>
      <FormWrapper>
        <LogoImage src={logo} alt="Thisway Logo" />
        <Title>비밀번호 초기화</Title>
        <Description>이메일로 인증 코드를 보내드립니다</Description>

        <FormGroup>
          <Label>이메일 *</Label>
          <InputGroup>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
            <VerificationButton 
              onClick={handleSendVerification}
              disabled={!email || isVerificationSent}
            >
              인증 요청
            </VerificationButton>
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <Label>인증번호 *</Label>
          <InputGroup>
            <Input
              type="text"
              value={code}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증번호 6자리 입력"
              disabled={!isVerificationSent}
            />
            {isVerificationSent && <Timer>{formatTime(timer)}</Timer>}
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <Label>새 비밀번호 *</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호를 입력하세요"
          />
          <PasswordHint>영문, 숫자, 특수문자 포함 8자리 이상</PasswordHint>
        </FormGroup>

        <FormGroup>
          <Label>새 비밀번호 확인 *</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 재입력"
          />
          {passwordMismatch && (
            <ErrorText>새 비밀번호와 일치하지 않습니다.</ErrorText>
          )}
        </FormGroup>

        {error && <ErrorText>{error}</ErrorText>}

        <ResetButton 
          onClick={handleResetPassword}
          disabled={!isResetButtonEnabled}
        >
          비밀번호 변경
        </ResetButton>

        <LoginLink onClick={() => navigate('/login')}>
          로그인으로 돌아가기
        </LoginLink>
      </FormWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 40px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LogoImage = styled.img`
  display: block;
  width: 62px;
  height: 62px;
  margin: 0 auto 20px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 8px;
`;

const Description = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: 32px;
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

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.primary};
  background-color: ${({ theme }) => theme.palette.background.paper};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.palette.grey[100]};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.palette.text.disabled};
  }
`;

const VerificationButton = styled(Button)`
  flex-shrink: 0;
  width: 100px;
  height: 48px;
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.error.contrastText};
`;

const PasswordHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-top: 4px;
`;

const ResetButton = styled(Button)`
  width: 100%;
  height: 48px;
  margin-bottom: 16px;
`;

const LoginLink = styled.button`
  display: block;
  width: 100%;
  padding: 8px;
  border: none;
  background: none;
  font-size: 14px;
  color: ${({ theme }) => theme.palette.primary.main};
  text-align: center;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.palette.error.contrastText};
  font-size: 13px;
  margin-top: 8px;
  margin-bottom: 10px;
`;

export default ResetPasswordPage; 