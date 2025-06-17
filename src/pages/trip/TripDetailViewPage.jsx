import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { formatDate, formatTime, formatDuration } from "../../utils/dateUtils";
import { getAddressFromCoords } from "../../utils/mapUtils";
import { authApi } from "../../utils/api";
import startMarkerImg from "../../assets/start-marker.png";
import endMarkerImg from "../../assets/end-marker.png";

const TripDetailViewPage = () => {
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    if (!vehicleId || !startTime || !endTime) {
      setError("잘못된 접근입니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    authApi.get(`/trip-log/detail/${vehicleId}?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`)
      .then(res => {
        setTrip(res.data);
      })
      .catch(() => {
        setError("운행 상세 정보를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [vehicleId, startTime, endTime]);

  useEffect(() => {
    if (!trip) return;
    setAddressLoading(true);
    setAddressError("");
    Promise.all([
      getAddressFromCoords(trip.startLat, trip.startLng),
      getAddressFromCoords(trip.endLat, trip.endLng),
    ])
      .then(([start, end]) => {
        setStartAddress(start);
        setEndAddress(end);
      })
      .catch(() => {
        setAddressError("주소를 불러오지 못했습니다.");
      })
      .finally(() => setAddressLoading(false));
  }, [trip]);

  // KakaoMapRoute 컴포넌트 추가
  const KakaoMapRoute = ({ gpsLogs, startLat, startLng, endLat, endLng }) => {
    const mapRef = useRef(null);
    useEffect(() => {
      if (!window.kakao || !window.kakao.maps || !gpsLogs || gpsLogs.length === 0) return;
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(startLat, startLng),
        level: 6,
      };
      const map = new window.kakao.maps.Map(container, options);

      // 출발 마커
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(startLat, startLng),
        title: "출발지",
        image: new window.kakao.maps.MarkerImage(
          startMarkerImg,
          new window.kakao.maps.Size(40, 42),
          { offset: new window.kakao.maps.Point(20, 42) }
        ),
      });
      // 도착 마커
      new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(endLat, endLng),
        title: "도착지",
        image: new window.kakao.maps.MarkerImage(
          endMarkerImg,
          new window.kakao.maps.Size(40, 42),
          { offset: new window.kakao.maps.Point(20, 42) }
        ),
      });
      // 경로 Polyline
      const path = gpsLogs.map(log => new window.kakao.maps.LatLng(log.lat, log.lng));
      new window.kakao.maps.Polyline({
        map,
        path,
        strokeWeight: 5,
        strokeColor: "#3B82F6",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
      });
      // 지도 영역 fitBounds
      if (path.length > 1) {
        const bounds = new window.kakao.maps.LatLngBounds();
        path.forEach(p => bounds.extend(p));
        map.setBounds(bounds);
      }
    }, [gpsLogs, startLat, startLng, endLat, endLng]);
    return <KakaoMapContainer ref={mapRef} />;
  };

  const KakaoMapContainer = styled.div`
    width: 100%;
    height: 100%;
    min-height: 1000px;
    border-radius: 8px;
  `;

  if (loading) return <ErrorMessage>로딩 중...</ErrorMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!trip) return <ErrorMessage>운행 정보가 없습니다.</ErrorMessage>;

  return (
    <Container>
      <Header>
        <PageTitle>
          운행 기록 상세 <CarNumber>{trip.carNumber}</CarNumber>
        </PageTitle>
      </Header>
      <ContentWrapper>
        <LeftColumn>
          <InfoCard>
            <InfoTitle>운행 정보</InfoTitle>
            <InfoList>
              <InfoItem>
                <InfoLabel>시작 시간</InfoLabel>
                <InfoValue>{formatDate(trip.startTime)} {formatTime(trip.startTime)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>종료 시간</InfoLabel>
                <InfoValue>{formatDate(trip.endTime)} {formatTime(trip.endTime)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>운행 시간</InfoLabel>
                <InfoValue>{formatDuration(trip.startTime, trip.endTime)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>이동 거리</InfoLabel>
                <InfoValue>{(trip.tripMeter / 1000).toFixed(1)} km</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>평균 속도</InfoLabel>
                <InfoValue>
                  {trip.avgSpeed !== undefined && trip.avgSpeed !== null
                    ? `${trip.avgSpeed.toFixed(1)} km/h`
                    : '-'}
                </InfoValue>
              </InfoItem>
            </InfoList>
          </InfoCard>
          <LocationSection>
            <SectionTitle>위치 정보</SectionTitle>
            <LocationInfoBox>
              <LocLabel>출발 위치</LocLabel>
              <LocValue>{addressLoading ? "로딩 중..." : (startAddress || addressError || "-")}</LocValue>
              <LocLabel>도착 위치</LocLabel>
              <LocValue>{addressLoading ? "로딩 중..." : (endAddress || addressError || "-")}</LocValue>
            </LocationInfoBox>
          </LocationSection>
        </LeftColumn>
        <RightColumn>
          <RouteSection>
            <SectionTitle>이동 경로</SectionTitle>
            <MapPlaceholder>
              {trip.gpsLogs && trip.gpsLogs.length > 1 ? (
                <KakaoMapRoute
                  gpsLogs={trip.gpsLogs}
                  startLat={trip.startLat}
                  startLng={trip.startLng}
                  endLat={trip.endLat}
                  endLng={trip.endLng}
                />
              ) : (
                <MapEmpty>경로 데이터가 없습니다.</MapEmpty>
              )}
              <MapToolbar>
                <ToolbarButton disabled>+</ToolbarButton>
                <ToolbarButton disabled>-</ToolbarButton>
                <ToolbarButton disabled>⟳</ToolbarButton>
              </MapToolbar>
            </MapPlaceholder>
          </RouteSection>
        </RightColumn>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div.attrs(() => ({ className: 'page-container' }))``;
const Header = styled.div.attrs(() => ({ className: 'page-header-wrapper' }))``;
const PageTitle = styled.h1.attrs(() => ({ className: 'page-header' }))``;
const CarNumber = styled.span`
  color: ${({ theme }) => theme.palette.primary.main};
  margin-left: 10px;
`;
const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 24px;
  align-items: flex-start;
`;
const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 320px;
`;
const RightColumn = styled.div`
  min-width: 0;
`;
const InfoCard = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  padding: 24px 28px 24px 28px;
  min-width: 160px;
  text-align: left;
`;
const InfoTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 18px;
`;
const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const InfoLabel = styled.div`
  color: ${({ theme }) => theme.palette.text.disabled};
  font-size: 15px;
`;
const InfoValue = styled.div`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 16px;
  font-weight: 700;
`;
const RouteSection = styled.section`
  background: #fff;
  border-radius: 10px;
  padding: 18px 18px 18px 18px;
  min-width: 600px;
  min-height: 850px;
  height: 800px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
`;
const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
`;
const MapPlaceholder = styled.div`
  flex: 1;
  background: #f5f6f8;
  border-radius: 8px;
  min-height: 750px;
  height: 750px;
  position: relative;
  overflow: hidden;
`;
const MapEmpty = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  font-size: 18px;
`;
const MapToolbar = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
`;
const ToolbarButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748B;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const LocationSection = styled.section`
  background: #fff;
  border-radius: 10px;
  padding: 18px 24px;
  min-width: 240px;
  min-height: 180px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
`;
const LocationInfoBox = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;
const LocLabel = styled.div`
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
`;
const LocValue = styled.div`
  background: #f5f6f8;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 15px;
  color: #334155;
`;
const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh;
  font-size: 18px;
  color: ${({ theme }) => theme.palette.error.main};
`;

export default TripDetailViewPage;
