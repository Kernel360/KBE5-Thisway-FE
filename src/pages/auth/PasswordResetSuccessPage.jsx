import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../../components/Button';
import successIcon from "../../assets/success-icon.png";

const PasswordResetSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <IconWrapper src = {successIcon} />
        <Title>비밀번호 변경 완료</Title>
        <Description>비밀번호가 성공적으로 변경되었습니다.</Description>
        <MessageBox>
          새로운 비밀번호로 로그인하여 서비스를 이용하세요.
        </MessageBox>
        <LoginButton onClick={() => navigate('/login')}>
          로그인 화면으로 이동
        </LoginButton>
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
  background-color: ${({ theme }) => theme.palette.success.main};
  border-radius: 8px;
  color: ${({ theme }) => theme.palette.success.contrastText};
  font-size: 14px;
  margin-bottom: 24px;
`;

const LoginButton = styled(Button)`
  width: 100%;
  height: 48px;
  margin-bottom: 16px;
`;

export default PasswordResetSuccessPage;
