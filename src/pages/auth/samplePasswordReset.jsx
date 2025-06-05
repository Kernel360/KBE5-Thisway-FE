import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../components/Button';
import logo from "../../assets/logo.png";
import { loginApi } from "../../utils/api";

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(600); // 10분
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [error, setError] = useState('');

  // 버튼 활성화 상태 계산
  const isResetButtonEnabled = 
    verificationCode !== '' && 
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

  const handleSendVerification = async () => {
    try {
      setError('');
      await loginApi.post('/auth/verify-code', { email });
      setIsVerificationSent(true);
      setTimer(600);
    } catch (err) {
      setError('인증 코드 발송에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  const handleResetPassword = async () => {
    try {
      setError('');
      const response = await loginApi.post('/auth/password', {
        email,
        code,
        newPassword,
        confirmPassword
      });
      
      if (response.status === 200) {
        navigate('/password-reset/success');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.response?.status === 400) {
        setError('비밀번호가 일치하지 않습니다.');
      } else if (error.response?.status === 401) {
        setError('인증번호가 올바르지 않습니다.');
      } else {
        setError('비밀번호 재설정 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Container>
      <FormWrapper>
        <LogoImage src={logo} alt="Thisway Logo" />
        <Title>비밀번호 재설정</Title>
        <Description>이메일로 전송된 인증번호를 입력하고 새로운 비밀번호를 설정해주세요.</Description>

        <Form>
          <FormGroup>
            <Label>이메일</Label>
            <InputWrapper>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                disabled={isVerificationSent}
              />
              <VerificationButton
                type="button"
                onClick={handleSendVerification}
                disabled={!email || isVerificationSent}
              >
                인증번호 발송
              </VerificationButton>
            </InputWrapper>
          </FormGroup>

          {isVerificationSent && (
            <>
              <FormGroup>
                <Label>인증번호</Label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호 6자리를 입력하세요"
                />
                <Timer>{formatTime(timer)}</Timer>
              </FormGroup>

              <FormGroup>
                <Label>새 비밀번호</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                />
              </FormGroup>

              <FormGroup>
                <Label>새 비밀번호 확인</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </FormGroup>
            </>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ResetButton
            type="button"
            onClick={handleResetPassword}
            disabled={!isResetButtonEnabled}
          >
            비밀번호 변경
          </ResetButton>
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
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 500px;
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
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 8px;
  text-align: center;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-bottom: 32px;
  text-align: center;
`;

const Form = styled.form`
  text-align: left;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 8px;
`;

const InputWrapper = styled.div`
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

  &::placeholder {
    color: ${({ theme }) => theme.palette.text.disabled};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.palette.action.disabledBackground};
    color: ${({ theme }) => theme.palette.text.disabled};
  }
`;

const VerificationButton = styled(Button)`
  width: 120px;
  height: 48px;
`;

const ResetButton = styled(Button)`
  width: 100%;
  height: 48px;
  margin-top: 16px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
`;

const Timer = styled.div`
  position: absolute;
  right: 16px;
  top: 40px;
  color: ${({ theme }) => theme.palette.primary.main};
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.palette.error.main};
  color: ${({ theme }) => theme.palette.error.contrastText};
  font-size: 14px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 4px;
  text-align: center;
`;

export default PasswordResetPage; 