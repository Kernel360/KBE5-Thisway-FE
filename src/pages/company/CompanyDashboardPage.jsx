import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { authApi } from "@/utils/api";
import DashboardKakaoMap from "@/components/DashboardKakaoMap";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";

const CompanyDashboardPage = () => {
  const [dashboard, setDashboard] = useState({
    totalVehicles: 0,
    powerOnVehicles: 0,
    powerOffVehicles: 0,
  });
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const navigate = useNavigate();

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

    const fetchVehicleList = async () => {
      try {
        setListLoading(true);
        const res = await authApi.get("/vehicles/track");
        setVehicleList(res.data.vehicles || []);
      } catch (err) {
        setListError("차량 목록을 불러오지 못했습니다.");
      } finally {
        setListLoading(false);
      }
    };

    // 최초 1회 즉시 호출
    fetchDashboard();
    fetchVehicleList();

    // 1분마다 폴링
    const intervalId = setInterval(() => {
      fetchDashboard();
      fetchVehicleList();
    }, 10000);

    // 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, []);

  const { totalVehicles, powerOnVehicles, powerOffVehicles } = dashboard;
  const rate = totalVehicles > 0 ? Math.round((powerOnVehicles / totalVehicles) * 100) : 0;

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  const runningVehicles = vehicleList.filter(v => v.powerOn);
  const runningVehiclePositions = runningVehicles.filter(v => v.lat !== null && v.lng !== null);

  // center: 선택된 차량이 있으면 해당 위치, 없으면 첫 차량, 없으면 기본값
  const mapCenter = selectedVehicle && selectedVehicle.lat !== null && selectedVehicle.lng !== null
    ? { lat: selectedVehicle.lat, lng: selectedVehicle.lng }
    : runningVehiclePositions.length > 0
      ? { lat: runningVehiclePositions[0].lat, lng: runningVehiclePositions[0].lng }
      : { lat: 33.450701, lng: 126.570667 };
  const mapPath = runningVehiclePositions.map(v => ({ lat: v.lat, lng: v.lng, angle: v.angle }));

  const SecondaryButton = styled(Button)`
    ${({ color, theme }) =>
      color === "secondary" &&
      css`
        background-color: ${theme.palette.secondary.main} !important;
        color: ${theme.palette.secondary.contrastText} !important;
        border: 1px solid ${theme.palette.primary.main} !important;
        &:hover {
          background-color: ${theme.palette.primary.main} !important;
          color: #fff !important;
        }
      `}
  `;

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
        <MapArea onClick={() => setSelectedVehicle(null)}>
          <DashboardKakaoMap center={mapCenter} path={mapPath} />
        </MapArea>
        <ListArea>
          <ListTitle>운행 중인 차량</ListTitle>
          {listLoading ? (
            <div>로딩 중...</div>
          ) : listError ? (
            <div>{listError}</div>
          ) : runningVehicles.length === 0 ? (
            <div>운행 중인 차량이 없습니다.</div>
          ) : (
            <RunningCarList>
              {runningVehicles.map((v) => (
                <RunningCarBlock
                  key={v.vehicleId}
                  onClick={() => setSelectedVehicle(v)}
                  style={{ cursor: 'pointer' }}
                >
                  <CarNumber>{v.carNumber}</CarNumber>
                  <StatusBadge>운행중</StatusBadge>
                  <SecondaryButton
                    size="small"
                    color="secondary"
                    style={{ marginLeft: '12px' }}
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/company/car-detail/${v.vehicleId}`);
                    }}
                  >상세</SecondaryButton>
                </RunningCarBlock>
              ))}
            </RunningCarList>
          )}
        </ListArea>
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

const ListTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const RunningCarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const RunningCarBlock = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CarNumber = styled.div`
  font-size: 1.08rem;
  font-weight: 700;
`;

const StatusBadge = styled.div`
  background: #22c55e;
  color: #fff;
  font-size: 0.98rem;
  font-weight: 600;
  border-radius: 8px;
  padding: 4px 14px;
`;

export default CompanyDashboardPage;
