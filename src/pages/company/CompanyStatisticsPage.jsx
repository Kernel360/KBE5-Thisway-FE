import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "@/components/Button";
import { BarChart, Bar, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { statisticsService } from "@/services/statisticsService";
import { getCompanyId } from "@/utils/auth";
import KakaoMap from "@/components/KakaoMap";
import { getCoordsFromAddress } from "@/utils/mapUtils";

// Import images from assets
import carIcon from "@/assets/car.png";
import calendarIcon from "@/assets/Calendar.png";
import clockIcon from "@/assets/Clock.png";
import activityIcon from "@/assets/Activity.png";
import rank1Icon from "@/assets/rank_badge_1.png";
import rank2Icon from "@/assets/rank_badge_2.png";
import rank3Icon from "@/assets/rank_badge_3.png";

const CompanyStatisticsPage = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statisticsData, setStatisticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationMarkers, setLocationMarkers] = useState([]);
  const [locationMapLoading, setLocationMapLoading] = useState(false);
  const [locationMapError, setLocationMapError] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  
  // 오늘 날짜와 30일 전 날짜 계산
  const today = new Date();
  const yesterday = new Date(today);
  const thirtyDaysAgo = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // YYYY-MM-DD 형식으로 변환
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultStartDate = formatDate(thirtyDaysAgo);
  const defaultEndDate = formatDate(yesterday);

  // 통계 데이터 조회
  const fetchStatistics = async (start, end) => {
    const companyId = getCompanyId();
    if (!companyId) {
      setError("회사 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await statisticsService.getCompanyStatistics(
        companyId,
        start,
        end
      );
      
      setStatisticsData(data);
    } catch (err) {
      setError(err.message);
      console.error("통계 데이터 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 범위 적용
  const handleApplyDateRange = () => {
    if (!startDate || !endDate) {
      setError("시작일과 종료일을 모두 입력해주세요.");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError("시작일은 종료일보다 이전이어야 합니다.");
      return;
    }
    
    fetchStatistics(startDate, endDate);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const companyId = getCompanyId();
    if (companyId) {
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
      fetchStatistics(defaultStartDate, defaultEndDate);
    } else {
      setError("로그인이 필요합니다.");
    }
  }, []);

  // 24시간 가동률 데이터 생성
  const generateHourlyData = () => {
    if (!statisticsData || !statisticsData.hours) return [];
    
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: statisticsData.hours[i] || 0,
    }));
  };

  const hourlyData = generateHourlyData();

  const TICK_LABELS = [
    { label: '0', index: 0 },
    { label: '6', index: 6 },
    { label: '12', index: 12 },
    { label: '18', index: 18 },
    { label: '24', index: 24 },
  ];
  const BAR_COUNT = 24;

  // 시간대 포맷팅
  const formatHour = (hour) => {
    if (hour === 0) {
      return '오전 12시';
    } else if (hour > 0 && hour < 12) {
      return `오전 ${hour}시`;
    } else if (hour === 12) {
      return `오후 12시`;
    } else {
      return `오후 ${hour-12}시`;
    }
  };

  // 시간대별 분석 백분율 포맷 함수
  const formatRate = (rate) => {
    if (typeof rate !== 'number') return '-';
    if (rate >= 1) return rate.toFixed(1);
    return rate.toFixed(3);
  };

  const bothRatesZero =
    statisticsData &&
    (Number(statisticsData.peakHourRate) === 0 && Number(statisticsData.lowHourRate) === 0);

  useEffect(() => {
    const fetchCoords = async () => {
      if (!statisticsData?.locationStats || statisticsData.locationStats.length === 0) {
        setLocationMarkers([]);
        return;
      }
      setLocationMapLoading(true);
      setLocationMapError(null);
      try {
        const stats = statisticsData.locationStats.slice(0, 3);
        const rankIcons = [rank1Icon, rank2Icon, rank3Icon];
        const results = await Promise.all(
          stats.map(async (item, idx) => {
            try {
              const coords = await getCoordsFromAddress(item.addr);
              return { ...coords, addr: item.addr, image: rankIcons[idx], imageSize: { width: 30, height: 30 } };
            } catch {
              return null;
            }
          })
        );
        setLocationMarkers(results.filter(Boolean));
      } catch (e) {
        setLocationMapError("지도 좌표 변환에 실패했습니다.");
        setLocationMarkers([]);
      } finally {
        setLocationMapLoading(false);
      }
    };
    fetchCoords();
  }, [statisticsData?.locationStats]);

  useEffect(() => {
    // 마커가 바뀌면 첫 번째 마커로 center 자동 이동
    if (locationMarkers.length > 0) {
      setMapCenter(locationMarkers[0]);
    }
  }, [locationMarkers]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          통계 데이터를 불러오는 중...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>차량 운행 통계</PageTitle>
        </HeaderLeft>
        <HeaderRight>
          {/* <Button variant="text" size="small" style={{ padding: '4px' }}>
            <img src={settingsIcon} alt="설정" style={{ width: '20px', height: '20px' }} />
          </Button> */}
        </HeaderRight>
      </Header>

      <Section>
        <SectionTitle>날짜 범위</SectionTitle>
        <FilterContent>
          <DateInputGroup>
            <DateInput 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={defaultEndDate}
            />
            <span>~</span>
            <DateInput 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={defaultEndDate}
            />
            <StyledButton 
              variant="primary" 
              size="small"
              onClick={handleApplyDateRange}
            >
              적용
            </StyledButton>
          </DateInputGroup>
        </FilterContent>
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
      </Section>

      <ContentWrapper>
        <LeftPanel>
          <StatsGrid>
            <StatCard>
              <StatIcon src={carIcon} alt="총 시동 횟수" />
              <StatTitle>총 시동 횟수</StatTitle>
              <StatValue>
                {statisticsData ? statisticsData.powerOnCount?.toLocaleString() : '-'}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatIcon src={calendarIcon} alt="평균 일일 시동" />
              <StatTitle>평균 일일 시동</StatTitle>
              <StatValue>
                {statisticsData ? statisticsData.averageDailyPowerCount?.toFixed(1) : '-'}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatIcon src={clockIcon} alt="총 가동 시간" />
              <StatTitle>총 운행 시간</StatTitle>
              <StatValue>
                {statisticsData ? `${statisticsData.totalDrivingTime}h` : '-'}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatIcon src={activityIcon} alt="평균 가동률" />
              <StatTitle>평균 가동률</StatTitle>
              <StatValue>
                {statisticsData ? `${statisticsData.averageOperationRate.toFixed(1)}%` : '-'}
              </StatValue>
            </StatCard>
          </StatsGrid>

          <Section>
            <SectionTitle>시동 위치 통계</SectionTitle>
            <MapPlaceholder>
              <div className="map-wrapper" style={{ width: '100%', height: '100%' }}>
                {locationMapLoading ? (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>지도 로딩 중...</div>
                ) : locationMarkers.length > 0 && mapCenter ? (
                  <KakaoMap
                    center={mapCenter}
                    extraMarkers={locationMarkers}
                    markerImage={undefined}
                  />
                ) : locationMapError ? (
                  <div style={{ color: '#e53e3e', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>{locationMapError}</div>
                ) : (
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>지도 영역</div>
                )}
              </div>
            </MapPlaceholder>
            <LocationListTitle>주요 시동 위치 (상위 3개)</LocationListTitle>
            <List gap="13px">
              {(() => {
                const stats = statisticsData?.locationStats || [];
                const total = stats.reduce((sum, s) => sum + s.count, 0);
                // 3개 미만이면 빈 칸 채우기
                const displayStats = [0, 1, 2].map(i => stats[i] || null);
                const rankIcons = [rank1Icon, rank2Icon, rank3Icon];
                return displayStats.map((item, idx) => (
                  <ListItem
                    key={idx}
                    style={{ cursor: item ? 'pointer' : 'default' }}
                    onClick={() => {
                      if (item && locationMarkers[idx]) setMapCenter(locationMarkers[idx]);
                    }}
                  >
                    <RankIcon src={rankIcons[idx]} alt={`${idx + 1}위`} />
                    <LocationInfo>
                      <SecondaryText>{item ? item.addr : '-'}</SecondaryText>
                      <LocationCount>
                        {item ? `총 ${item.count}회 시동` : '-'}
                      </LocationCount>
                    </LocationInfo>
                    <DynamicValue rank={idx + 1}>
                      {item && typeof item.rate === 'number' ? `${item.rate}%` : '-'}
                    </DynamicValue>
                  </ListItem>
                ));
              })()}
            </List>
          </Section>
        </LeftPanel>

        <RightPanel>
          <Section>
            <SectionTitle>시간대별 분석</SectionTitle>
            <List gap="10px">
              <ListItem>
                <TimeAnalysisInfo>
                  <TimeAnalysisLabel>최대 가동 시간대</TimeAnalysisLabel>
                  <TimeAnalysisTime>
                    {bothRatesZero
                      ? '-'
                      : (statisticsData && statisticsData.peakHour !== undefined 
                          ? formatHour(statisticsData.peakHour) 
                          : '-')}
                  </TimeAnalysisTime>
                </TimeAnalysisInfo>
                <DynamicValue size="large" increase>
                  {bothRatesZero
                    ? '-'
                    : (statisticsData && typeof statisticsData.peakHourRate === 'number' ? `${formatRate(statisticsData.peakHourRate)}%` : '-')}
                </DynamicValue>
              </ListItem>
              <ListItem>
                <TimeAnalysisInfo>
                  <TimeAnalysisLabel>최소 가동 시간대</TimeAnalysisLabel>
                  <TimeAnalysisTime>
                    {bothRatesZero
                      ? '-'
                      : (statisticsData && statisticsData.lowHour !== undefined 
                          ? formatHour(statisticsData.lowHour) 
                          : '-')}
                  </TimeAnalysisTime>
                </TimeAnalysisInfo>
                <DynamicValue size="large" decrease>
                  {bothRatesZero
                    ? '-'
                    : (statisticsData && typeof statisticsData.lowHourRate === 'number' ? `${formatRate(statisticsData.lowHourRate)}%` : '-')}
                </DynamicValue>
              </ListItem>
            </List>
          </Section>

          <Section>
            <SectionTitle>24시간 가동률 통계</SectionTitle>
            <ChartContainer>
              <ChartHeader>
                <ChartTitle>시간별 가동률 (%)</ChartTitle>
                <ChartLegend>
                  <LegendLabel>
                    <LegendColor business />
                    <span>업무시간</span>
                  </LegendLabel>
                  <LegendLabel>
                    <LegendColor />
                    <span>심야시간</span>
                  </LegendLabel>
                </ChartLegend>
              </ChartHeader>
              <ChartBorderBox>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={hourlyData} 
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                    barCategoryGap={1}
                  >
                    <YAxis hide domain={[0, 100]} ticketCount={5}/> 
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Bar
                      dataKey="value"
                      radius={[2, 2, 0, 0]}
                    >
                      {hourlyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={(entry.hour >= 7 && entry.hour < 19) ? '#3B82F6' : '#94A3B8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartBorderBox>
              <CustomXAxis>
                {TICK_LABELS.map(({ label, index }) => (
                  <XAxisLabel
                    key={label}
                    style={{
                      left: `${(index / BAR_COUNT) * 100}%`
                    }}
                  >
                    {label}
                  </XAxisLabel>
                ))}
              </CustomXAxis>
            </ChartContainer>
          </Section>
        </RightPanel>
      </ContentWrapper>
    </Container>
  );
};

export default CompanyStatisticsPage;

const Container = styled.div.attrs(() => ({
  className: "page-container",
}))``;

const Header = styled.div.attrs(() => ({
  className: "page-header-wrapper",
}))``;

const HeaderLeft = styled.div.attrs(() => ({
  className: "page-header",
}))``;

const HeaderRight = styled.div.attrs(() => ({
  className: "page-header-actions",
}))``;

const PageTitle = styled.h1.attrs(() => ({
  className: "page-header",
}))``;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 16px;
`;

const Section = styled.section`
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  margin-top: 3px;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const FilterContent = styled.div`
  display: flex;
  align-items: center;
`;

const DateInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  span {
    color: ${({ theme }) => theme.palette.text.secondary};
    margin: 0 4px;
  }
`;

const DateInput = styled.input`
  width: 160px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary};
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const StatsGrid = styled.div.attrs(() => ({
  className: "stats-grid",
}))`
  grid-template-columns: 1fr 1fr;
`;

const StatCard = styled.div.attrs(() => ({
  className: "stats-card",
}))`
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  position: relative;
`;

const StatIcon = styled.img`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 24px;
  height: 24px;
  opacity: 0.6;
`;

const StatTitle = styled.h3.attrs(() => ({
  className: "stat-title",
}))``;

const StatValue = styled.div`
  font-size: 30px;
  font-weight: 700;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const StatChange = styled.div`
  font-size: 0.875rem;
  color: ${({ increase, theme }) =>
    increase 
      ? theme.palette.increase.contrastText 
      : theme.palette.decrease.contrastText
    };
  display: inline-block;
`;

const MapPlaceholder = styled.div`
  height: 400px;
  background-color: ${({ theme }) => theme.palette.background};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.palette.textSecondary};
  margin-bottom: 1.5rem;
`;

const LocationListTitle = styled.h3`
  font-size: 1rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.palette.textPrimary};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap || '10px'};
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.palette.grey[100]};
  border-radius: 8px;
`;

const RankIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const LocationInfo = styled.div`
  flex: 1;
  margin-left: 18px;
`;

const SecondaryText = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const LocationCount = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-top: 4px;
`;

const DynamicValue = styled.div`
  font-weight: bold;
  color: ${({ increase, decrease, rank, theme }) => {
    if (rank) {
      switch (rank) {
        case 1:
          return theme.palette.textColor.red;
        case 2:
          return theme.palette.textColor.yellow;
        case 3:
          return theme.palette.textColor.green;
        default:
          return theme.palette.text.primary;
      }
    }
    if (increase) return theme.palette.increase.contrastText;
    if (decrease) return theme.palette.decrease.contrastText;
    return theme.palette.text.primary;
  }};
  ${({ size }) => size === 'large' && `
    font-size: 21px;
  `}
`;

const TimeAnalysisInfo = styled.div``;

const TimeAnalysisLabel = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.textSecondary};
  margin-bottom: 0.25rem;
`;

const TimeAnalysisTime = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.palette.textPrimary};
`;

const ChartContainer = styled.div`
  height: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${({ theme }) => theme.palette.grey[100]};
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px;
  margin-bottom: 18px;
`;

const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const ChartLegend = styled.div`
  display: flex;
  gap: 20px;
  margin-left: 350px;
`;

const LegendColor = styled.span`
  display: inline-block;
  width: 13px;
  height: 13px;
  border-radius: 4px;
  background: ${({ business, theme }) =>
    business ? theme.palette.primary.main : theme.palette.grey[300]};
  margin-right: 4px;
`;

const LegendLabel = styled.span`  font-size: 13px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const ChartBorderBox = styled.div`
  width: 100%;
  height: 80%;
  border: 1px solid ${({ theme }) => theme.palette.grey[200]};
  border-radius: 8px;
  padding: 13px 0 0 0;
  background: ${({ theme }) => theme.palette.background.paper};
  box-sizing: border-box;
`;

const CustomXAxis = styled.div`
  position: relative;
  height: 20px;
  width: 93%;
  font-size: 12px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const XAxisLabel = styled.span`
  position: absolute;
  top: 10px;
  transform: translateX(-50%);
  left: ${({ position }) => position};
`;

const StyledButton = styled(Button)`
  margin-left: 16px;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.palette.error.contrastText};
  font-size: 0.875rem;
  margin-top: 8px;
`;

