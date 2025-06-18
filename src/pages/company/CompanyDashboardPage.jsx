import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { authApi } from "@/utils/api";

const CompanyDashboardPage = () => {
  const [dashboard, setDashboard] = useState({
    totalVehicles: 0,
    powerOnVehicles: 0,
    powerOffVehicles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await authApi.get("/vehicles/dashboard");
        setDashboard(res.data);
      } catch (err) {
        setError("데이터를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const { totalVehicles, powerOnVehicles, powerOffVehicles } = dashboard;
  const rate = totalVehicles > 0 ? Math.round((powerOnVehicles / totalVehicles) * 100) : 0;

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>대시보드</PageTitle>
        </HeaderLeft>
      </Header>
      <CardRow>
        <StatsGrid>
          <StatsCard>
            <StatsTitle>총 차량</StatsTitle>
            <StatsValue>{totalVehicles}대</StatsValue>
          </StatsCard>
          <StatsCard>
            <StatsTitle>운행 중</StatsTitle>
            <StatsValue style={{ color: '#22c55e' }}>{powerOnVehicles}대</StatsValue>
          </StatsCard>
          <StatsCard>
            <StatsTitle>미운행</StatsTitle>
            <StatsValue style={{ color: '#ef4444' }}>{powerOffVehicles}대</StatsValue>
          </StatsCard>
          <StatsCard>
            <StatsTitle>운행률</StatsTitle>
            <StatsValue>{rate}%</StatsValue>
          </StatsCard>
        </StatsGrid>
      </CardRow>
      <ContentRow>
        <MapArea>지도 영역</MapArea>
        <ListArea>운행 중 차량 리스트</ListArea>
      </ContentRow>
    </Container>
  );
};

const Container = styled.div.attrs(() => ({
  className: "page-container",
}))``;

const Header = styled.div.attrs(() => ({
  className: "page-header-wrapper",
}))``;

const HeaderLeft = styled.div.attrs(() => ({
  className: "page-header",
}))``;

const PageTitle = styled.h1.attrs(() => ({
  className: "page-header",
}))``;

const CardRow = styled.div`
  width: 100%;
  margin-top: 32px;
  margin-bottom: 32px;
`;

const ContentRow = styled.div`
  display: flex;
  gap: 32px;
`;

const MapArea = styled.div`
  min-width: 500px;
  min-height: 400px;
  background: #e5e7eb;
  border-radius: 12px;
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ListArea = styled.div`
  min-width: 320px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  flex: 1;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
`;

const StatsCard = styled.div`
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px ${({ theme }) => theme.palette.action.hover};
`;

const StatsTitle = styled.div`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 14px;
  margin-bottom: 8px;
`;

const StatsValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
`;

export default CompanyDashboardPage;
