import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { authApi } from "@/utils/api";
import DashboardKakaoMap from "@/components/DashboardKakaoMap";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import carIcon from "@/assets/white-car.png";

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
  const [mapCenter, setMapCenter] = useState({ lat: 33.450701, lng: 126.570667 });
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

    // 10초마다 폴링
    const intervalId = setInterval(() => {
      fetchDashboard();
      fetchVehicleList();
    }, 10000);

    // 언마운트 시 인터벌 정리
    return () => clearInterval(intervalId);
  }, []);

  const runningVehicles = vehicleList.filter(v => v.powerOn);
  const runningVehiclePositions = runningVehicles.filter(v => v.lat !== null && v.lng !== null);

  useEffect(() => {
    // 선택된 차량이 있으면 해당 위치로 지도 중심 변경
    if (selectedVehicle && selectedVehicle.lat !== null && selectedVehicle.lng !== null) {
      setMapCenter({ lat: selectedVehicle.lat, lng: selectedVehicle.lng });
    } else {
      // 페이지 첫 로딩 시, 그리고 지도 중심이 기본값일 때만
      // 운행중인 첫번째 차량 위치로 설정
      if (
        mapCenter.lat === 33.450701 &&
        mapCenter.lng === 126.570667 &&
        runningVehiclePositions.length > 0
      ) {
        setMapCenter({
          lat: runningVehiclePositions[0].lat,
          lng: runningVehiclePositions[0].lng,
        });
      }
    }
  }, [selectedVehicle, runningVehiclePositions]);

  const { totalVehicles, powerOnVehicles, powerOffVehicles } = dashboard;
  const rate = totalVehicles > 0 ? Math.round((powerOnVehicles / totalVehicles) * 100) : 0;

  if (error) return <div>{error}</div>;

  const mapPath = runningVehiclePositions.map(v => ({ lat: v.lat, lng: v.lng, angle: v.angle }));

  const handleCenterChanged = (newCenter) => {
    setMapCenter(newCenter);
  };

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
            <StatsValue status="운행중">{powerOnVehicles}대</StatsValue>
          </StatsCard>
          <StatsCard>
            <StatsTitle>미운행</StatsTitle>
            <StatsValue status="미운행">{powerOffVehicles}대</StatsValue>
          </StatsCard>
          <StatsCard>
            <StatsTitle>운행률</StatsTitle>
            <StatsValue>{rate}%</StatsValue>
          </StatsCard>
        </StatsGrid>
      </CardRow>
      <ContentRow>
        <MapArea onClick={() => setSelectedVehicle(null)}>
          <DashboardKakaoMap center={mapCenter} path={mapPath} onCenterChanged={handleCenterChanged} />
        </MapArea>
        <ListArea>
          <ListTitle>운행 중인 차량
            <SelectBox>
              <Select>
                <option>전체</option>
                <option>운행중</option>
              </Select>
            </SelectBox>
          </ListTitle>
          {listError ? (
            <div>{listError}</div>
          ) : runningVehicles.length === 0 ? (
            <div>운행 중인 차량이 없습니다.</div>
          ) : (
            <RunningCarList>
              {runningVehicles.map((v) => {
                const isSelected = selectedVehicle && selectedVehicle.vehicleId === v.vehicleId;
                return (
                  <RunningCarBlock
                    key={v.vehicleId}
                    onClick={() => setSelectedVehicle(v)}
                    $selected={isSelected}
                  >
                    <CarInfo>
                      <CarIconBox>
                        <img src={carIcon} alt="car" />
                      </CarIconBox>
                      <CarTextBox>
                        <CarNumber>{v.carNumber}</CarNumber>
                      </CarTextBox>
                    </CarInfo>
                    <RightBox>
                      <StatusBadge status={v.powerOn ? "운행중" : "정차중"}>
                        {v.powerOn ? "운행중" : "정차중"}
                      </StatusBadge>
                      <DetailButton
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/company/car-detail/${v.vehicleId}`);
                        }}
                      >상세보기</DetailButton>
                    </RightBox>
                  </RunningCarBlock>
                );
              })}
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
  border-radius: 8px;
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ListArea = styled.div`
  min-width: 320px;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 8px;
  padding: 20px;
  flex: 1;
`;

const StatsGrid = styled.div.attrs(() => ({
  className: "stats-grid",
}))`
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 24px;
`;

const StatsCard = styled.div.attrs(() => ({
  className: "stats-card",
}))`
    box-shadow: 0 1px 3px ${({ theme }) => theme.palette.action.hover};
`;

const StatsTitle = styled.h3.attrs(() => ({
  className: "stat-title",
}))``;

const StatsValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ status, theme }) =>
    status === '운행중' ? theme.palette.textColor.green :
    status === '미운행' ? theme.palette.textColor.red :
    theme.palette.text.primary};
`;

const ListTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SelectBox = styled.div`
  margin-left: auto;
`;

const Select = styled.select`
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 8px;
  padding: 6px 18px 6px 10px;
  font-size: 15px;
  color: ${({ theme }) => theme.palette.text.secondary};
  background: ${({ theme }) => theme.palette.background.paper};
`;

const RunningCarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const RunningCarBlock = styled.div`
  background: ${({ $selected, theme }) => $selected ? theme.palette.secondary.main : theme.palette.grey[100]};
  border-radius: 4px;
  box-shadow: none;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: background 0.2s, border 0.2s;
  border: 1px solid ${({ $selected, theme }) => $selected ? theme.palette.primary.main : 'transparent'};
  &:hover {
    background: ${({ theme }) => theme.palette.action.hover};
  }
`;

const CarInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CarIconBox = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: ${({ theme }) => theme.palette.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  img {
    width: 20px;
    height: 20px;
  }
`;

const CarTextBox = styled.div`
  display: flex;
  flex-direction: column;
`;

const CarNumber = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const StatusBadge = styled.span.attrs(() => ({
  className: 'badge'
}))`
  background-color: ${({ status, theme }) => 
    status === "운행중" ? theme.palette.success.main : theme.palette.grey[200]};
  color: ${({ status, theme }) => 
    status === "운행중" ? theme.palette.success.contrastText : theme.palette.text.disabled};
`;

const DetailButton = styled.button`
  margin-left: 5px;
  padding: 6px 14px;
  background: ${({ theme }) => theme.palette.primary.main};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.palette.primary.dark};
  }
`;

const RightBox = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export default CompanyDashboardPage;
