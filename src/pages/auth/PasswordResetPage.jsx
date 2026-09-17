import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../components/Button';
import logo from "../../assets/logo.png";
import { loginApi } from "../../utils/api";

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [codeExpiresAt, setCodeExpiresAt] = useState(0);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [needsNewCode, setNeedsNewCode] = useState(false);
  const [operation, setOperation] = useState(null);
  const operationRef = useRef(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const normalizedEmail = email.trim();
  const timer = Math.max(0, Math.ceil((codeExpiresAt - now) / 1000));
  const resendTimer = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const hasCurrentCode = sentEmail === normalizedEmail && timer > 0 && !needsNewCode;
  const passwordMismatch = confirmPassword !== '' && newPassword !== confirmPassword;
  const invalidPassword = newPassword !== '' && !PASSWORD_PATTERN.test(newPassword);
  const isResetButtonEnabled =
    !operation && hasCurrentCode && /^\d{6}$/.test(code) &&
    PASSWORD_PATTERN.test(newPassword) && newPassword === confirmPassword;

  useEffect(() => {
    const deadline = Math.max(codeExpiresAt, resendAt);
    if (deadline <= Date.now()) return;
    // Use wall time so a background tab cannot extend the displayed validity.
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [codeExpiresAt, resendAt]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleEmailChange = (event) => {
    if (operationRef.current) return;
    setEmail(event.target.value);
    setSentEmail('');
    setVerificationCode('');
    setCodeExpiresAt(0);
    setResendAt(0);
    setNeedsNewCode(false);
    setNotice('');
    setError('');
  };

  const handleSendVerification = async () => {
    if (operationRef.current || Date.now() < resendAt) return;
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    operationRef.current = 'sending';
    setOperation('sending');
    setError('');
    setNotice('');
    const requestedAt = Date.now();
    try {
      await loginApi.post('/auth/verify-code', { email: normalizedEmail }, { timeout: 15000 });
      const receivedAt = Date.now();
      setNow(receivedAt);
      setSentEmail(normalizedEmail);
      // Start conservatively before server issuance so SMTP/response latency
      // cannot extend the displayed validity beyond the server's ten minutes.
      setCodeExpiresAt(requestedAt + 600000);
      setResendAt(receivedAt + 60000);
      setVerificationCode('');
      setNeedsNewCode(false);
      setNotice(`${normalizedEmail}로 인증 코드를 보냈습니다.`);
    } catch (error) {
      const errorCode = error.response?.data?.code;
      if (error.response?.status === 429 || errorCode === '13006') {
        setError('인증 코드 발송 요청이 제한되었습니다. 잠시 후 다시 시도해 주세요. 최근 1시간에 5회 요청했다면 한도가 풀릴 때까지 기다려 주세요.');
      } else if (errorCode === '12004') {
        setError('올바른 이메일 주소를 입력해 주세요.');
      } else if (errorCode === '12000' || error.response?.status === 404) {
        setError('가입된 이메일 주소인지 확인해 주세요.');
      } else {
        // A failed response can follow a new issuance that invalidated the old code.
        setNeedsNewCode(true);
        setError('인증 코드 발송 결과를 확인하지 못했습니다. 잠시 후 새 인증 코드를 요청해 주세요.');
      }
    } finally {
      operationRef.current = null;
      setOperation(null);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (operationRef.current || !isResetButtonEnabled || Date.now() >= codeExpiresAt) return;
    operationRef.current = 'resetting';
    setOperation('resetting');
    setError('');
    try {
      await loginApi.put('/auth/password', {
        email: sentEmail,
        code,
        newPassword,
      }, { timeout: 15000 });
      navigate('/password-reset/success');
    } catch (error) {
      const errorCode = error.response?.data?.code;
      if (errorCode === '13000') {
        setError('인증 코드가 올바르지 않거나 만료되었습니다. 코드를 확인하거나 새 코드를 요청해 주세요.');
      } else if (errorCode === '12005') {
        setError('비밀번호는 영문, 숫자, 특수문자(!@#$%^&*)를 각각 포함한 8~20자여야 합니다.');
      } else if (error.response?.status === 429 || errorCode === '13006') {
        setNeedsNewCode(true);
        setError('인증 시도 한도에 도달했습니다. 새 인증 코드를 요청해 주세요.');
      } else if (errorCode === '12004') {
        setError('이메일 주소를 확인한 뒤 인증 코드를 다시 요청해 주세요.');
      } else if (error.response?.status === 400) {
        setError('입력한 이메일, 인증 코드, 비밀번호를 확인해 주세요.');
      } else {
        // The server consumes a valid code before the DB transaction commits.
        // Network/DB failures must not encourage reuse or discard entered passwords.
        setNeedsNewCode(true);
        setError('비밀번호 변경 결과를 확인하지 못했습니다. 새 인증 코드를 요청해 다시 시도해 주세요.');
      }
    } finally {
      operationRef.current = null;
      setOperation(null);
    }
  };

  return (
    <Container>
      <FormWrapper>
        <LogoImage src={logo} alt="Thisway Logo" />
        <Title>비밀번호 초기화</Title>
        <Description>이메일로 인증 코드를 보내드립니다</Description>

        <form onSubmit={handleResetPassword}>
        <FormGroup>
          <Label htmlFor="reset-email">이메일 *</Label>
          <InputGroup>
            <Input
              type="email"
              id="reset-email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="user@example.com"
              disabled={Boolean(operation)}
              required
            />
            <VerificationButton 
              type="button"
              onClick={handleSendVerification}
              disabled={!EMAIL_PATTERN.test(normalizedEmail) || Boolean(operation) || resendTimer > 0}
            >
              {operation === 'sending' ? '발송 중…' : sentEmail ? '다시 발송' : '인증 요청'}
            </VerificationButton>
          </InputGroup>
          <PasswordHint>발송은 60초 간격으로, 1시간에 최대 5회 가능합니다.</PasswordHint>
          {resendTimer > 0 && <PasswordHint>{resendTimer}초 뒤 다시 발송을 요청할 수 있습니다.</PasswordHint>}
          {notice && <Notice role="status">{notice}</Notice>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="reset-code">인증번호 *</Label>
          <InputGroup>
            <Input
              type="text"
              id="reset-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="인증번호 6자리 입력"
              disabled={!hasCurrentCode || Boolean(operation)}
              required
            />
            {hasCurrentCode && <Timer role="timer" aria-label="인증 코드 남은 시간">{formatTime(timer)}</Timer>}
          </InputGroup>
          <PasswordHint>인증 코드는 10분 동안 유효합니다. 다시 발송하면 이전 코드는 사용할 수 없습니다.</PasswordHint>
          {sentEmail && codeExpiresAt > 0 && timer === 0 && !needsNewCode &&
            <ErrorText role="status">인증 코드가 만료되었습니다. 새 코드를 요청해 주세요.</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="reset-password">새 비밀번호 *</Label>
          <Input
            type="password"
            id="reset-password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호를 입력하세요"
            disabled={Boolean(operation)}
            aria-describedby="reset-password-hint"
            aria-invalid={invalidPassword}
            required
          />
          <PasswordHint id="reset-password-hint">영문, 숫자, 특수문자(!@#$%^&*)를 각각 포함한 8~20자로 입력해 주세요.</PasswordHint>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="reset-password-confirm">새 비밀번호 확인 *</Label>
          <Input
            type="password"
            id="reset-password-confirm"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 재입력"
            disabled={Boolean(operation)}
            aria-invalid={passwordMismatch}
            required
          />
          {passwordMismatch && (
            <ErrorText>새 비밀번호와 일치하지 않습니다.</ErrorText>
          )}
        </FormGroup>

        {error && <ErrorText role="alert">{error}</ErrorText>}

        <ResetButton 
          type="submit"
          disabled={!isResetButtonEnabled}
        >
          {operation === 'resetting' ? '변경 중…' : '비밀번호 변경'}
        </ResetButton>
        </form>

        <LoginLink type="button" onClick={() => navigate('/login')}>
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
  width: 100%;
  padding: 40px 20px;
  @media (max-width: 600px) { padding: 24px 16px; }
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 36px;
  @media (max-width: 600px) { padding: 28px 22px; }
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 18px;
  border: 1px solid #E3E9EE;
  box-shadow: 0 12px 40px rgba(21, 36, 45, 0.05);
`;

const LogoImage = styled.img`
  display: block;
  width: 62px;
  height: auto;
  margin: 0 auto 20px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 28px;
  letter-spacing: -0.6px;
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
  min-width: 0;
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
  color: ${({ theme }) => theme.palette.text.primary};
`;

const PasswordHint = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.palette.text.secondary};
  margin-top: 4px;
`;

const Notice = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-top: 8px;
  overflow-wrap: anywhere;
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
