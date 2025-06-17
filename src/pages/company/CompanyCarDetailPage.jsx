import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authApi } from "@/utils/api";
import { formatDate, formatTime } from "@/utils/dateUtils";
import { getAddressFromCoords } from "@/utils/mapUtils";
import { ROUTES } from "@/routes";

import KakaoMap from "@/components/KakaoMap";

const CompanyCarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [tripAddresses, setTripAddresses] = useState({});
  const [currentGpsLog, setCurrentGpsLog] = useState([]);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      const response = await authApi.get(`/trip-log/${id}`);
      setVehicleData(response.data);

      // 현재 운행 중인 경우 주소 가져오기
      if (response.data.currentDrivingInfo) {
        const { latitude, longitude } = response.data.currentDrivingInfo;
        try {
          const address = await getAddressFromCoords(latitude, longitude);
          setCurrentAddress(address);
        } catch (error) {
          console.error("Error fetching current address:", error);
        }
      }

      // 운행 이력의 주소 가져오기
      const addresses = {};
      for (const trip of response.data.tripLogBriefInfos) {
        try {
          const address = await getAddressFromCoords(
            trip.latitude,
            trip.longitude,
          );
          addresses[`${trip.startTime}`] = address;
        } catch (error) {
          console.error("Error fetching trip address:", error);
        }
      }
      setTripAddresses(addresses);
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
      setError("차량 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, [id]);

  // 실시간 운행 정보 (현재 운행 정보, 현재 위치, GPS 로그)를 가져와 업데이트하는 함수
  const fetchRealtimeDrivingData = async () => {
    try {
      // 1. 최신 차량 데이터 (주로 currentDrivingInfo 업데이트 위함) 가져오기
      const vehicleResp = await authApi.get(`/trip-log/${id}`);
      // vehicleData의 currentDrivingInfo 부분만 업데이트
      setVehicleData((prevData) => ({
        ...prevData,
        currentDrivingInfo: vehicleResp.data.currentDrivingInfo,
      }));

      // 2. 최신 currentDrivingInfo 기반으로 현재 주소 업데이트
      if (vehicleResp.data.currentDrivingInfo) {
        const { latitude, longitude } = vehicleResp.data.currentDrivingInfo;
        try {
          const address = await getAddressFromCoords(latitude, longitude);
          setCurrentAddress(address);
        } catch (error) {
          console.error("폴링 중 현재 주소 조회 실패:", error);
        }
      }

      // 3. 최신 currentDrivingInfo의 startTime을 사용하여 GPS 로그 가져오기
      if (vehicleResp.data.currentDrivingInfo?.startTime) {
        const { startTime } = vehicleResp.data.currentDrivingInfo;
        const formattedStartTime = new Date(startTime).toISOString();
        const gpsLogResp = await authApi.get(`/trip-log/current/${id}`, {
          params: { time: formattedStartTime },
        });
        setCurrentGpsLog(gpsLogResp.data.currentGpsLog);
      }
    } catch (e) {
      console.error("실시간 운행 정보 업데이트 실패", e);
    }
  };

  // 폴링 useEffect: 1분마다 실시간 데이터 업데이트
  useEffect(() => {
    // 컴포넌트 마운트 시 또는 id 변경 시 즉시 한 번 호출
    fetchRealtimeDrivingData();
    // 1분(60,000ms)마다 폴링
    const intervalId = setInterval(fetchRealtimeDrivingData, 60000);
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, [id]); // id가 변경될 때마다 useEffect 재실행

  if (loading) return <LoadingMessage>로딩 중...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!vehicleData)
    return <ErrorMessage>차량 정보를 찾을 수 없습니다.</ErrorMessage>;

  const {
    vehicleResponse: vehicle,
    currentDrivingInfo,
    tripLogBriefInfos,
  } = vehicleData;

  const filteredTrips = searchDate
    ? tripLogBriefInfos.filter((trip) => trip.startTime.includes(searchDate))
    : tripLogBriefInfos;

  const displayTrips = [...filteredTrips].reverse();

  const handleTripClick = (trip) => {
    navigate(ROUTES.trip.detail, {
      state: { tripData: trip },
    });
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>
            차량 상세 정보 <CarNumber>{vehicle.carNumber}</CarNumber>
          </PageTitle>
        </HeaderLeft>
      </Header>
      <ContentWrapper>
        <LeftColumn>
          <Section>
            <SectionTitle>기본 정보</SectionTitle>
            <InfoList>
              <InfoItem>
                <Label>차량번호</Label>
                <Value>{vehicle.carNumber}</Value>
              </InfoItem>
              <InfoItem>
                <Label>제조사/모델</Label>
                <Value>
                  {vehicle.manufacturer} / {vehicle.model}
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>색상</Label>
                <Value>{vehicle.color}</Value>
              </InfoItem>
              <InfoItem>
                <Label>연식</Label>
                <Value>{vehicle.modelYear}년</Value>
              </InfoItem>
              <InfoItem>
                <Label>누적 주행거리</Label>
                <Value>
                  {(vehicle.mileage / 1000).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                  km
                </Value>
              </InfoItem>
              <InfoItem>
                <Label>상태</Label>
                <Value>
                  <StatusBadge status={vehicle.powerOn ? "운행중" : "정차중"}>
                    {vehicle.powerOn ? "운행중" : "정차중"}
                  </StatusBadge>
                </Value>
              </InfoItem>
            </InfoList>
          </Section>

          {currentDrivingInfo ? (
            <Section>
              <SectionTitle>현재 운행 정보</SectionTitle>
              <InfoList>
                <InfoItem>
                  <Label>시작 시간</Label>
                  <Value>
                    {formatDate(currentDrivingInfo.startTime)}{" "}
                    {formatTime(currentDrivingInfo.startTime)}
                  </Value>
                </InfoItem>
                <InfoItem>
                  <Label>이동 거리</Label>
                  <Value>
                    {(currentDrivingInfo.tripMeter / 1000).toFixed(1)}km
                  </Value>
                </InfoItem>
                <InfoItem>
                  <Label>현재 속도</Label>
                  <Value>{currentDrivingInfo.speed}km/h</Value>
                </InfoItem>
                <InfoItem>
                  <Label>현재 위치</Label>
                  <Value>{currentAddress || "주소를 찾을 수 없습니다"}</Value>
                </InfoItem>
              </InfoList>
            </Section>
          ) : (
            <Section>
              <SectionTitle>현재 운행 정보</SectionTitle>
              <EmptyText>현재 운행중이지 않습니다.</EmptyText>
            </Section>
          )}

          <Section>
            <SectionTitle>최근 운행 이력</SectionTitle>
            <SearchContainer>
              <SearchInput
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                placeholder="날짜 검색"
              />
            </SearchContainer>
            <HistoryList>
              {displayTrips.length === 0 ? (
                <EmptyText>운행 기록이 없습니다.</EmptyText>
              ) : (
                displayTrips.map((trip, index) => (
                  <HistoryItem
                    key={index}
                    onClick={() => handleTripClick(trip)}
                    style={{ cursor: "pointer" }}
                  >
                    <HistoryDate>{formatDate(trip.startTime)}</HistoryDate>
                    <HistoryDetails>
                      <div>
                        {formatTime(trip.startTime)} ~{" "}
                        {formatTime(trip.endTime)}
                      </div>
                      <div>
                        {tripAddresses[trip.startTime] ||
                          "주소를 찾을 수 없습니다"}
                      </div>
                    </HistoryDetails>
                    <HistoryDistance>
                      {(trip.tripMeter / 1000).toFixed(1)}km
                    </HistoryDistance>
                  </HistoryItem>
                ))
              )}
            </HistoryList>
          </Section>
        </LeftColumn>

        <RightColumn>
          <Section style={{ height: "100%" }}>
            <SectionTitle>실시간 위치 및 이동 경로</SectionTitle>
            <MapContainer
              style={{
                height: "100%",
                minHeight: "700px",
                background: "#f5f6f8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KakaoMap
                center={
                  currentGpsLog.length > 0
                    ? {
                        lat: currentGpsLog[currentGpsLog.length - 1].lat,
                        lng: currentGpsLog[currentGpsLog.length - 1].lng,
                      }
                    : { lat: 33.450701, lng: 126.570667 } // 기본값: 제주도청
                }
                path={
                  currentGpsLog.length > 0
                    ? currentGpsLog.map((log) => ({
                        lat: log.lat,
                        lng: log.lng,
                      }))
                    : []
                }
              />
              {/* </div> */}
            </MapContainer>
          </Section>
        </RightColumn>
      </ContentWrapper>
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

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 16px;
  height: calc(100vh - 100px);
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const RightColumn = styled.div`
  height: 100%;
`;

const PageTitle = styled.h1.attrs(() => ({
  className: "page-header",
}))``;

const CarNumber = styled.span`
  color: ${({ theme }) => theme.palette.primary.main};
  margin-left: 15px;
`;

const Section = styled.section`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  margin-top: 3px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Label = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.palette.text.disabled};
  width: 100px;
  flex-shrink: 0;
`;

const Value = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.palette.text.primary};
  flex: 1;
`;

const StatusBadge = styled.span`
  background-color: ${({ status, theme }) =>
    status === "운행중" ? theme.palette.success.main : theme.palette.grey[200]};
  color: ${({ status, theme }) =>
    status === "운행중"
      ? theme.palette.success.contrastText
      : theme.palette.text.disabled};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 13px;
  display: inline-block;
`;

const MapContainer = styled.div`
  width: 100%;
  height: calc(100% - 40px);
  border-radius: 8px;
  overflow: hidden;
`;

const SearchContainer = styled.div`
  margin-bottom: 12px;
`;

const SearchInput = styled.input`
  width: 200px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.palette.grey[200]};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

const HistoryDate = styled.div`
  width: 100px;
  font-size: 14px;
  font-weight: bold;
`;

const HistoryDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: ${({ theme }) => theme.palette.text.disabled};
  font-size: 13px;
`;

const HistoryDistance = styled.div`
  width: 80px;
  text-align: right;
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 14px;
`;

const LoadingMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 16px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: 16px;
  color: ${({ theme }) => theme.palette.error.main};
`;

const EmptyText = styled.div`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 14px;
`;

const LocationDetail = styled.span`
  display: block;
  font-size: 12px;
  color: ${({ theme }) => theme.palette.text.disabled};
  margin-top: 2px;
`;

export default CompanyCarDetailPage;
