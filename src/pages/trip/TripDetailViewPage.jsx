import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useSearchParams } from "react-router-dom";
import { formatDate, formatTime, formatDuration } from "../../utils/dateUtils";
import { getAddressFromCoords } from "../../utils/mapUtils";
import { authApi } from "../../utils/api";
import startMarkerImg from "../../assets/start-marker.png";
import endMarkerImg from "../../assets/end-marker.png";
import { loadKakaoMapScript } from "../../utils/mapUtils";

const TripDetailViewPage = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("id");

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tripId) {
      setError("잘못된 접근입니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    authApi.get(`/trip-log/detail/${tripId}`)
      .then(res => {
        setTrip(res.data);
      })
      .catch(() => {
        setError("운행 상세 정보를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  // KakaoMapRoute 컴포넌트 추가
  const KakaoMapRoute = ({ gpsLogs }) => {
    const mapRef = useRef(null);
    useEffect(() => {
      let isMounted = true;
      loadKakaoMapScript()
        .then(() => {
          if (!isMounted) return;
          if (!window.kakao || !window.kakao.maps || !gpsLogs || gpsLogs.length === 0) return;
          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(gpsLogs[0].lat, gpsLogs[0].lng),
            level: 6,
          };
          const map = new window.kakao.maps.Map(container, options);

          // 출발 마커
          new window.kakao.maps.Marker({
            map,
            position: new window.kakao.maps.LatLng(gpsLogs[0].lat, gpsLogs[0].lng),
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
            position: new window.kakao.maps.LatLng(gpsLogs[gpsLogs.length - 1].lat, gpsLogs[gpsLogs.length - 1].lng),
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

          // 지도 리사이즈 이벤트 추가
          const handleResize = () => {
            if (map) {
              map.relayout();
            }
          };
          window.addEventListener('resize', handleResize);
          // 컴포넌트 언마운트 시 이벤트 리스너 제거
          return () => {
            window.removeEventListener('resize', handleResize);
          };
        })
        .catch((error) => {
          console.error("카카오맵 스크립트 로드 실패:", error);
        });
      return () => {
        isMounted = false;
      };
    }, [gpsLogs]);
    return <KakaoMapContainer ref={mapRef} />;
  };

  const KakaoMapContainer = styled.div`
    width: 100%;
    height: 100%;
    min-height: 600px;
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
              <LocValue>{trip.onAddress || "-"}</LocValue>
              <LocLabel>도착 위치</LocLabel>
              <LocValue>{trip.offAddress || "-"}</LocValue>
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