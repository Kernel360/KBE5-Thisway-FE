import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../components/Button';
import errorIcon from "../../assets/error-icon.png";

const PasswordResetErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <IconWrapper src={errorIcon} />
        <Title>비밀번호 변경 실패</Title>
        <Description>비밀번호 변경 중 오류가 발생했습니다.</Description>
        <MessageBox>
          다시 시도하시거나 관리자에게 문의해 주세요.
        </MessageBox>
        <ButtonGroup>
          <RetryButton onClick={() => navigate('/auth/reset-password')}>
            다시 시도하기
          </RetryButton>
          <LoginButton onClick={() => navigate('/login')} variant="outlined">
            로그인으로 돌아가기
          </LoginButton>
        </ButtonGroup>
      </ContentWrapper>
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

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const IconWrapper = styled.img`
  width: 64px;
  height: 64px;
  margin: 0 auto 15px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 15px;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.palette.grey[500]};
  margin-bottom: 40px;
`;

const MessageBox = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.palette.error.main};
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.error.contrastText};
  font-size: 14px;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RetryButton = styled(Button)`
  width: 100%;
  height: 48px;
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 48px;
`;

export default PasswordResetErrorPage; 