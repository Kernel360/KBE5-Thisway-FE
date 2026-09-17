import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { authApi } from "@/utils/api";
import DashboardKakaoMap from "@/components/DashboardKakaoMap";
import { useNavigate } from "react-router-dom";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 33.450701, lng: 126.570667 });
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [refreshAttempt, setRefreshAttempt] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    numberOfElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 10,
  });

  useEffect(() => {
    let active = true;
    let pollTimer;
    const controller = new AbortController();
    setLoading(true);
    setListLoading(true);

    const fetchDashboard = async () => {
      try {
        const res = await authApi.get("/vehicles/dashboard", { signal: controller.signal, timeout: 10000 });
        if (!active) return;
        setDashboard(res.data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (active) setError("데이터를 불러오지 못했습니다.");
      } finally {
        if (active) setLoading(false);
      }
    };

    const fetchVehicleList = async (page = 0, size = 10) => {
      try {
        const res = await authApi.get(`/vehicles/track?page=${page}&size=${size}`, { signal: controller.signal, timeout: 10000 });
        if (!active) return;
        setVehicleList(res.data.vehicles || []);
        setPageInfo(res.data.pageInfo);
        setListError(null);
      } catch (err) {
        if (active) setListError("차량 목록을 불러오지 못했습니다.");
      } finally {
        if (active) setListLoading(false);
      }
    };

    // Finish this poll before scheduling another so a slow response cannot
    // overwrite a newer snapshot. Page changes also cancel the previous poll.
    const poll = async () => {
      await Promise.all([fetchDashboard(), fetchVehicleList(page, size)]);
      if (active) pollTimer = setTimeout(poll, 10000);
    };
    poll();

    return () => {
      active = false;
      controller.abort();
      clearTimeout(pollTimer);
    };
  }, [page, size, refreshAttempt]);

  const runningVehiclePositions = useMemo(() => vehicleList.filter(
    v => Number.isFinite(v.lat) && Number.isFinite(v.lng),
  ), [vehicleList]);

  useEffect(() => {
    const selectedVehicle = runningVehiclePositions.find(v => v.vehicleId === selectedVehicleId);
    setMapCenter(previous => {
      const initialVehicle = previous.lat === 33.450701 && previous.lng === 126.570667
        ? runningVehiclePositions[0] : null;
      const target = selectedVehicle || initialVehicle;
      if (!target || (previous.lat === target.lat && previous.lng === target.lng)) return previous;
      return { lat: target.lat, lng: target.lng };
    });
  }, [selectedVehicleId, runningVehiclePositions]);

  const mapPath = useMemo(() => runningVehiclePositions.map(
    v => ({ lat: v.lat, lng: v.lng, angle: v.angle }),
  ), [runningVehiclePositions]);

  const { totalVehicles, powerOnVehicles, powerOffVehicles } = dashboard;



  const handleCenterChanged = (newCenter) => {
    setMapCenter(newCenter);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage - 1);
  };

  const stats = [
    { label: "등록 차량", value: totalVehicles, Icon: DirectionsCarOutlinedIcon, tone: "default" },
    { label: "시동 켜짐", value: powerOnVehicles, Icon: RadioButtonCheckedIcon, tone: "on" },
    { label: "시동 꺼짐", value: powerOffVehicles, Icon: PowerSettingsNewIcon, tone: "off" },
  ];
  const selected = vehicleList.find(vehicle => vehicle.vehicleId === selectedVehicleId);
  const missingPositionCount = vehicleList.length - runningVehiclePositions.length;

  return (
    <>
    <Breadcrumb aria-label="현재 위치">차량 관제 콘솔 <span>/</span> 운영 현황</Breadcrumb>
    <Container className="page-container">
      <Header>
        <div><PageTitle>운영 현황</PageTitle><PageDescription>차량 상태와 위치를 한눈에 확인합니다.</PageDescription></div>
        <RefreshGroup>
          <span>{lastUpdated ? `최근 조회: ${lastUpdated.toLocaleTimeString("ko-KR", { hour12: false })}` : "차량 현황 조회 중"}</span>
          <RefreshButton type="button" onClick={() => setRefreshAttempt(value => value + 1)} disabled={loading || listLoading}><RefreshIcon />새로고침</RefreshButton>
        </RefreshGroup>
      </Header>
      {error && <Notice role="alert">{error} 차량 목록은 별도로 확인할 수 있습니다.</Notice>}
      <StatsGrid aria-label="차량 시동 현황">
        {stats.map(({ label, value, Icon, tone }) => <StatsCard key={label}>
          <div><StatsTitle>{label}</StatsTitle><StatsValue $tone={tone}>{loading || error ? "—" : value?.toLocaleString()}<span>대</span></StatsValue></div>
          <IconBox $tone={tone}><Icon aria-hidden="true" /></IconBox>
        </StatsCard>)}
      </StatsGrid>
      <ContentRow>
        <Panel aria-label="차량 관제 목록">
          <PanelHeader>
            <PanelTitleGroup><PanelTitle>시동 켜진 차량</PanelTitle><CountBadge>총 {pageInfo.totalElements ?? 0}대</CountBadge></PanelTitleGroup>

          </PanelHeader>
          <VehicleList>
            {listError ? <EmptyState role="alert">{listError}<RefreshButton onClick={() => setRefreshAttempt(value => value + 1)}>다시 시도</RefreshButton></EmptyState>
              : listLoading ? <EmptyState role="status">차량 목록을 불러오는 중입니다.</EmptyState>
              : vehicleList.length === 0 ? <EmptyState>시동이 켜진 차량이 없습니다.</EmptyState>
              : vehicleList.map(vehicle => {
                const isSelected = selectedVehicleId === vehicle.vehicleId;
                const hasPosition = Number.isFinite(vehicle.lat) && Number.isFinite(vehicle.lng);
                return <VehicleRow key={vehicle.vehicleId} $selected={isSelected}>
                  <RowTop><VehicleSelect type="button" onClick={() => setSelectedVehicleId(vehicle.vehicleId)} aria-pressed={isSelected}>{vehicle.carNumber}</VehicleSelect><StatusBadge><i />시동 켜짐</StatusBadge></RowTop>
                  <RowBottom><PositionText $missing={!hasPosition}><LocationOnOutlinedIcon aria-hidden="true" /><span>{hasPosition ? "위치 수신됨 · 지도에서 확인" : "위치 정보 없음"}</span></PositionText><DetailButton type="button" aria-label={`${vehicle.carNumber} 상세보기`} onClick={() => navigate(`/company/car-detail/${vehicle.vehicleId}`)}>상세보기<ChevronRightIcon /></DetailButton></RowBottom>
                </VehicleRow>;
              })}
          </VehicleList>
          <PanelFooter>
            {pageInfo.totalPages > 1 && <PageControls aria-label="관제 차량 페이지"><button type="button" disabled={page <= 0 || listLoading} onClick={() => handlePageChange(page)}>이전</button><span>{page + 1} / {pageInfo.totalPages}</span><button type="button" disabled={page + 1 >= pageInfo.totalPages || listLoading} onClick={() => handlePageChange(page + 2)}>다음</button></PageControls>}
            차량 목록은 10초 주기로 상태가 동기화됩니다.
          </PanelFooter>
        </Panel>
        <Panel aria-label="관제 지도 패널">
          <PanelHeader><PanelTitleGroup><MapOutlinedIcon /><PanelTitle>차량 위치</PanelTitle></PanelTitleGroup><HeaderHint>{selected ? selected.carNumber : `현재 페이지 ${runningVehiclePositions.length}대 표시`}</HeaderHint></PanelHeader>
          <MapArea onClick={() => setSelectedVehicleId(null)}><DashboardKakaoMap center={mapCenter} path={mapPath} onCenterChanged={handleCenterChanged} /></MapArea>
        </Panel>
      </ContentRow>
      <PageFooter><span>시동이 켜진 차량의 수신 위치를 표시합니다.</span><span>{missingPositionCount > 0 ? `현재 페이지 위치 미수신 ${missingPositionCount}대 · 목록에서 상태 확인 가능` : "위치 정보는 수신 상황에 따라 지연될 수 있습니다."}</span></PageFooter>
    </Container></>
  );
};

const Container = styled.div`width: 100%; min-width: 0; color: #15242D; display: flex; flex-direction: column; gap: 16px;`;
const Header = styled.header`display: flex; align-items: center; justify-content: space-between; gap: 20px; @media(max-width: 700px) { align-items: flex-start; flex-direction: column; gap: 14px; }`;
const PageTitle = styled.h1`font-size: 24px; line-height: 32px; font-weight: 600; letter-spacing: -.02em; margin: 0; @media(max-width: 600px) { font-size: 22px; line-height: 30px; }`;
const PageDescription = styled.p`font-size: 14px; line-height: 20px; color: #64748B; margin: 2px 0 0;`;
const RefreshGroup = styled.div`display: flex; align-items: center; gap: 16px; color: #64748B; font-size: 12px; font-variant-numeric: tabular-nums; flex-wrap: wrap;`;
const RefreshButton = styled.button`display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 38px; padding: 0 14px; border: 1px solid #E3E9EE; border-radius: 10px; background: white; color: #334155; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.04); svg { width: 17px; height: 17px; color: #64748B; } &:hover { background: #F8FAFC; } &:disabled { opacity: .5; cursor: wait; } &:focus-visible { outline: 2px solid #2563EB; outline-offset: 3px; }`;
const Breadcrumb = styled.nav`height: 56px; display: flex; align-items: center; gap: 12px; padding: 0 24px; background: white; border-bottom: 1px solid #E1E6ED; font-size: 12px; color: #475569; span { color: #94A3B8; }`;
const StatsGrid = styled.section`display: flex; flex-wrap: wrap; align-items: center; gap: 8px 24px; padding: 12px 16px; border: 1px solid #E1E6ED; border-radius: 6px; background: white;`;
const StatsCard = styled.div`> div { display: flex; align-items: baseline; gap: 10px; }`;
const StatsTitle = styled.p`margin: 0; color: #64748B; font-size: 13px;`;
const StatsValue = styled.div`font-size: 16px; font-weight: 700; color: ${({ $tone }) => $tone === "on" ? "#047857" : "#142235"}; span { margin-left: 3px; font-size: 12px; font-weight: 400; }`;
const IconBox = styled.div`display: none !important;`;
const ContentRow = styled.section`display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 16px; @media(max-width: 1000px) { grid-template-columns: 1fr; }`;
const Panel = styled.section`height: max(560px, calc(100dvh - 268px)); min-width: 0; background: white; border: 1px solid #E3E9EE; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column;  @media(max-width: 600px) { height: 460px; }`;
const PanelHeader = styled.div`height: 56px; flex-shrink: 0; padding: 0 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #E3E9EE; @media(max-width: 600px) { padding: 0 14px; }`;
const PanelTitleGroup = styled.div`display: flex; align-items: center; gap: 8px; min-width: 0; svg { width: 18px; height: 18px; color: #2563EB; flex-shrink: 0; }`;
const PanelTitle = styled.h2`margin: 0; font-size: 15px; line-height: 22px; font-weight: 600; white-space: nowrap;`;
const HeaderHint = styled.span`font-size: 12px; color: #94A3B8; white-space: nowrap; @media(max-width: 600px) { font-size: 11px; }`;
const CountBadge = styled.span`padding: 2px 7px; border: 1px solid #E2E8F0; background: #F1F5F9; color: #475569; border-radius: 4px; font-size: 12px; white-space: nowrap;`;
const VehicleList = styled.div`flex: 1; min-height: 0; overflow-y: auto;`;
const VehicleRow = styled.div`padding: 14px 16px 14px 12px; border-left: 4px solid ${({ $selected }) => $selected ? "#2563EB" : "transparent"}; border-bottom: 1px solid #F1F5F9; background: ${({ $selected }) => $selected ? "#EFF6FF" : "white"}; &:hover { background: #F8FAFC; }`;
const RowTop = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 10px;`;
const RowBottom = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px;`;
const VehicleSelect = styled.button`border: 0; padding: 4px 0; background: transparent; color: #0F172A; font: inherit; font-size: 15px; font-weight: 700; cursor: pointer; text-align: left; font-variant-numeric: tabular-nums; &:focus-visible { outline: 2px solid #2563EB; outline-offset: 3px; }`;
const StatusBadge = styled.span`display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border: 1px solid #A7F3D0; border-radius: 999px; background: #ECFDF5; color: #047857; font-size: 12px; font-weight: 600; white-space: nowrap; i { width: 6px; height: 6px; border-radius: 50%; background: #10B981; }`;
const PositionText = styled.div`display: flex; gap: 4px; align-items: center; min-width: 0; color: ${({ $missing }) => $missing ? "#94A3B8" : "#475569"}; font-size: 12px; svg { width: 16px; height: 16px; color: #94A3B8; flex-shrink: 0; } span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`;
const DetailButton = styled.button`display: inline-flex; align-items: center; flex-shrink: 0; min-height: 32px; padding: 4px 0 4px 6px; border: 0; background: transparent; color: #2563EB; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; svg { width: 15px; height: 15px; } &:hover { text-decoration: underline; } &:focus-visible { outline: 2px solid #2563EB; outline-offset: 2px; }`;
const PanelFooter = styled.div`padding: 12px; border-top: 1px solid #E3E9EE; background: #F8FAFC; text-align: center; color: #64748B; font-size: 12px; line-height: 18px;`;
const PageControls = styled.nav`display: flex; justify-content: center; gap: 12px; align-items: center; margin-bottom: 8px; button { background: white; border: 1px solid #E3E9EE; border-radius: 6px; min-height: 32px; color: #2563EB; padding: 4px 10px; cursor: pointer; } button:disabled { color: #94A3B8; cursor: default; }`;
const MapArea = styled.div`flex: 1; min-height: 0; position: relative; overflow: hidden; background: #F4F7F9;`;
const EmptyState = styled.div`height: 100%; box-sizing: border-box; padding: 24px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; color: #64748B; font-size: 14px; text-align: center;`;
const Notice = styled.div`padding: 14px 18px; background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 10px; color: #9A3412; font-size: 14px;`;
const PageFooter = styled.footer`display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; font-size: 12px; color: #94A3B8; line-height: 18px;`;

export default CompanyDashboardPage;
