import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { authApi } from "@/utils/api";
import { formatDate, formatTime } from "@/utils/dateUtils";
import { ROUTES } from "@/routes";
import { getAddressFromCoords } from "@/utils/mapUtils";

import KakaoMap from "@/components/KakaoMap";
import currentMinimalImg from "@/assets/Current Minimal.png";

// 지도 컨테이너 리사이즈 시 relayout 적용
function MapContainerWithRelayout({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    const handleResize = () => {
      if (window.kakao && window.kakao.maps && ref.current) {
        const mapDiv = ref.current.querySelector('div');
        if (mapDiv && mapDiv.__kakaoMap__) {
          mapDiv.__kakaoMap__.relayout();
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return <MapContainer ref={ref}>{children}</MapContainer>;
}

const CompanyCarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [searchDate, setSearchDate] = useState("");
  const [currentGpsLog, setCurrentGpsLog] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("");
  const lastOccurredTimeRef = useRef(null);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      const response = await authApi.get(`/trip-log/${id}`);
      //setVehicleData(response.data);
      setVehicleData(prev => {
        if (JSON.stringify(prev) === JSON.stringify(response.data)) return prev;
        return response.data;
      });
  
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

      // 2. 실시간 위치/경로 갱신
      let timeParam = null;
      if (lastOccurredTimeRef.current) {
        // 이전 응답에서 받은 lastOccurredTime 사용
        timeParam = lastOccurredTimeRef.current;
        console.log("이후 요청 - lastOccurredTime 사용:", timeParam);
      } else if (vehicleResp.data.currentDrivingInfo?.startTime) {
        // 첫 요청 시에는 startTime 사용 (한국 시간으로 변환)
        const startTimeDate = new Date(vehicleResp.data.currentDrivingInfo.startTime);
        // 한국 시간대(KST)로 변환
        const kstTime = new Date(startTimeDate.getTime() + (9 * 60 * 60 * 1000));
        timeParam = kstTime.toISOString();
        console.log("첫 요청 - startTime 사용 (KST):", timeParam);
        console.log("원본 startTime:", vehicleResp.data.currentDrivingInfo.startTime);
        console.log("currentDrivingInfo:", vehicleResp.data.currentDrivingInfo);
      }
      
      if (timeParam) {
        console.log("API 호출:", `/trip-log/current/${id}?time=${timeParam}`);
        const gpsLogResp = await authApi.get(`/trip-log/current/${id}`, {
          params: { time: timeParam },
        });
        console.log("GPS 로그 응답:", gpsLogResp.data);
        setCurrentGpsLog(gpsLogResp.data.currentGpsLog);
        // 응답에 lastOccurredTime이 있으면 저장
        if (gpsLogResp.data.lastOccurredTime) {
          lastOccurredTimeRef.current = gpsLogResp.data.lastOccurredTime;
          console.log("lastOccurredTime 저장:", gpsLogResp.data.lastOccurredTime);
        }
      }

      // 3. 최신 currentDrivingInfo 기반으로 현재 주소 업데이트
      if (vehicleResp.data.currentDrivingInfo) {
        const { latitude, longitude } = vehicleResp.data.currentDrivingInfo;
        try {
          const address = await getAddressFromCoords(latitude, longitude);
          setCurrentAddress(address);
        } catch (error) {
          console.error("폴링 중 현재 주소 조회 실패:", error);
        }
      }
    } catch (e) {
      console.error("실시간 운행 정보 업데이트 실패", e);
    }
  };

  const isDriving = !!vehicleData?.currentDrivingInfo;
  // 폴링 useEffect: 1분마다 실시간 데이터 업데이트
  useEffect(() => {
    if (!isDriving) {
      return;
    }
    lastOccurredTimeRef.current = null; // id가 바뀌면 초기화
    fetchRealtimeDrivingData();
    // 1분(60,000ms)마다 폴링
    const intervalId = setInterval(fetchRealtimeDrivingData, 60000);
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, [id, isDriving]); // id가 변경될 때마다 useEffect 재실행

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

  const displayTrips = [...filteredTrips];

  const handleTripClick = (trip) => {
    navigate(`/company/trip-detail?id=${trip.Id}`);
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
                  <StatusBadge status={vehicle.powerOn ? "운행중" : "미운행"}>
                    {vehicle.powerOn ? "운행중" : "미운행"}
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
                      <div>{trip.address || "주소를 찾을 수 없습니다"}</div>
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
            <MapContainer>
              {vehicle.powerOn ? (
                <KakaoMap
                  center={
                    currentGpsLog.length > 0
                      ? {
                          lat: currentGpsLog[currentGpsLog.length - 1].lat,
                          lng: currentGpsLog[currentGpsLog.length - 1].lng,
                        }
                      : currentDrivingInfo
                        ? {
                            lat: currentDrivingInfo.latitude,
                            lng: currentDrivingInfo.longitude,
                          }
                        : { lat: 33.450701, lng: 126.570667 }
                  }
                  path={
                    currentGpsLog.length > 0
                      ? currentGpsLog.map((log) => ({
                          lat: log.lat,
                          lng: log.lng,
                        }))
                      : []
                  }
                  markerImage={{
                    url: currentMinimalImg,
                    size: { width: 48, height: 48 },
                  }}
                />
              ) : (
                vehicle.lat && vehicle.lng ? (
                  <KakaoMap
                    center={{ lat: vehicle.lat, lng: vehicle.lng }}
                    markerImage={{
                      url: currentMinimalImg,
                      size: { width: 48, height: 48 },
                    }}
                  />
                ) : (
                  <div style={{textAlign: 'center', color: '#888', fontSize: 16, padding: 40}}>
                    위치 정보 없음
                  </div>
                )
              )}
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
