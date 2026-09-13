import React, { useEffect, useState, useRef } from "react";
import { openAuthenticatedEventStream } from "../../utils/authenticatedEventStream.mjs";
import styled from "styled-components";
import { useSearchParams, Link } from "react-router-dom";
import { formatDate, formatTime, formatDuration } from "../../utils/dateUtils";
import { getAddressFromCoords } from "../../utils/mapUtils";
import { authApi } from "../../utils/api";
import startMarkerImg from "../../assets/start-marker.png";
import endMarkerImg from "../../assets/end-marker.png";
import { loadKakaoMapScript } from "../../utils/mapUtils";
import { formatTripDistance } from "../../utils/tripDistance.mjs";

  // KakaoMapRoute 컴포넌트: gpsLogs를 실시간으로 그림
  const KakaoMapRoute = ({ gpsLogs }) => {
    const mapRef = useRef(null);
    const [mapError, setMapError] = useState(false);
    const [mapAttempt, setMapAttempt] = useState(0);
    useEffect(() => {
      let isMounted = true;
      let removeResizeListener;
      setMapError(false);
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
          if (gpsLogs.length > 1) {
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
          }
          // 경로 Polyline
          const path = gpsLogs.map(log => new window.kakao.maps.LatLng(log.lat, log.lng));
          new window.kakao.maps.Polyline({
            map,
            path,
            strokeWeight: 5,
            strokeColor: "#087F8C",
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
          removeResizeListener = () => window.removeEventListener('resize', handleResize);
        })
        .catch((error) => {
          if (isMounted) setMapError(true);
        });
      return () => {
        isMounted = false;
        removeResizeListener?.();
      };
    }, [gpsLogs, mapAttempt]);
    return <><KakaoMapContainer ref={mapRef} />{mapError && <MapFailure role="alert">지도를 불러오지 못했습니다. 운행 정보는 왼쪽에서 확인할 수 있습니다.<button type="button" onClick={() => setMapAttempt(value => value + 1)}>지도 다시 시도</button></MapFailure>}</>;
  };

  const KakaoMapContainer = styled.div`
    width: 100%;
    height: 100%;
    min-height: 400px;
    border-radius: 8px;
  `;


const TripDetailViewPage = () => {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("id");

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gpsLogs, setGpsLogs] = useState([]);

  // 1. 운행 정보만 로딩
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
        // SSE 실패 시 fallback으로 기존 gpsLogs 사용
        if (res.data.gpsLogs && res.data.gpsLogs.length > 0) {
          setGpsLogs(res.data.gpsLogs);
        }
      })
      .catch(() => {
        setError("운행 상세 정보를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  }, [tripId]);

  // 2. SSE로 gpsLogs 수신
  useEffect(() => {
    if (!tripId) return;
    setGpsLogs([]); // 새 tripId 접근 시 초기화
    const token = localStorage.getItem("token");
    console.log("SSE 연결 시도:", `/api/trip-log/detail/stream/${tripId}`);
    const eventSource = openAuthenticatedEventStream(`/api/trip-log/detail/stream/${tripId}`, token);

    // SSE 연결 성공 시
    eventSource.onopen = () => {
      console.log("SSE 연결 성공");
    };

    // event: trip_record_chunk_stream
    eventSource.addEventListener('trip_record_chunk_stream', (event) => {
      try {
        const data = JSON.parse(event.data); // [{ lat, lng, vehicleId? }, ...]
        console.log("SSE 데이터 수신:", data.length, "개 포인트");
        setGpsLogs(prev => [...prev, ...data.map(({ lat, lng }) => ({ lat, lng }))]);
      } catch (e) {
        console.error("SSE 파싱 오류", e);
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE 연결 오류", err);
      eventSource.close();
      // SSE 실패 시 기존 trip.gpsLogs 사용
      if (trip && trip.gpsLogs && trip.gpsLogs.length > 0) {
        console.log("SSE 실패, 기존 gpsLogs 사용:", trip.gpsLogs.length, "개 포인트");
        setGpsLogs(trip.gpsLogs);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [tripId, trip]);

  if (loading) return <ErrorMessage>로딩 중...</ErrorMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!trip) return <ErrorMessage>운행 정보가 없습니다.</ErrorMessage>;

  return (
    <Container>
      <Header>
        <PageTitle>
          운행 기록 상세 <CarNumber>{trip.carNumber}</CarNumber>
        </PageTitle>
        <BackLink to="/company/trip-history">운행 기록으로 돌아가기</BackLink>
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
                <InfoValue>{formatTripDistance(trip.tripMeter)}</InfoValue>
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
              {gpsLogs && gpsLogs.length > 1 ? (
                <KakaoMapRoute
                  gpsLogs={gpsLogs}
                />
              ) : (
                <MapEmpty>경로 데이터가 없습니다.</MapEmpty>
              )}

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
  grid-template-columns: minmax(280px, 2fr) minmax(0, 3fr);
  @media (max-width: 1050px) { grid-template-columns: 1fr; }
  gap: 24px;
  align-items: flex-start;
`;
const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
`;
const RightColumn = styled.div`
  min-width: 0;
`;
const InfoCard = styled.div`
  background: #fff;
  border-radius: 14px;
  border: 1px solid #E3E9EE;
  box-shadow: 0 2px 6px rgba(21,36,45,0.025);
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
  gap: 16px;
  align-items: start;
`;
const InfoLabel = styled.div`
  color: #64748B;
  font-size: 15px;
`;
const InfoValue = styled.div`
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 14px;
  font-weight: 600;
  text-align: right;
`;
const RouteSection = styled.section`
  background: #fff;
  border-radius: 14px;
  padding: 18px 18px 18px 18px;
  min-width: 0;
  min-height: 520px;
  border: 1px solid #E3E9EE;
  box-shadow: 0 2px 6px rgba(21,36,45,0.025);
  display: flex;
  flex-direction: column;
`;
const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  margin-bottom: 16px;
`;
const MapPlaceholder = styled.div`
  flex: 1;
  background: #f5f6f8;
  border-radius: 8px;
  min-height: 480px;
  height: 560px;
  @media (max-width: 600px) { height: 400px; min-height: 400px; }
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
  border-radius: 14px;
  padding: 18px 24px;
  min-width: 240px;
  min-height: 180px;
  border: 1px solid #E3E9EE;
  box-shadow: 0 2px 6px rgba(21,36,45,0.025);
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
  color: #b91c1c;
`;

export default TripDetailViewPage;

const BackLink = styled(Link)`color: #066773; font-size: 14px; padding: 12px 16px; border: 1px solid #D8E9EB; border-radius: 10px; text-decoration: none; background: white;`;
const MapFailure = styled.div`position: absolute; inset: 0; background: #F3F6F8; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px; gap: 16px; text-align: center; color: #475569; button { padding: 12px 16px; border-radius: 10px; border: 1px solid #087F8C; color: #066773; background: white; cursor: pointer; }`;
