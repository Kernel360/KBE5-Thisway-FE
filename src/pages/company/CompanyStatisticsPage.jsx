import React, { useState } from "react";
import styled from "styled-components";
import Button from "@/components/Button";
import { BarChart, Bar, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

// Import images from assets
import settingsIcon from "@/assets/settings.png";
import carIcon from "@/assets/car.png";
import calendarIcon from "@/assets/Calendar.png";
import clockIcon from "@/assets/Clock.png";
import activityIcon from "@/assets/Activity.png";
import rank1Icon from "@/assets/rank_badge_1.png";
import rank2Icon from "@/assets/rank_badge_2.png";
import rank3Icon from "@/assets/rank_badge_3.png";

const CompanyStatisticsPage = () => {
  const [activeTab, setActiveTab] = useState("daily");
  
  // 오늘 날짜와 30일 전 날짜 계산
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // YYYY-MM-DD 형식으로 변환
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultStartDate = formatDate(thirtyDaysAgo);
  const defaultEndDate = formatDate(today);

  // 24시간 가동률 데이터
  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    value: Math.random() * 30 + (i >= 7 && i < 19 ? 50 : 20), // 임시 데이터: 업무시간대는 더 높은 값
  }));

  const TICK_LABELS = [
    { label: '0', index: 0 },
    { label: '6', index: 6 },
    { label: '12', index: 12 },
    { label: '18', index: 18 },
    { label: '24', index: 24 },
  ];
  const BAR_COUNT = 24;

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
            <DateInput type="date" defaultValue={defaultStartDate} />
            <span>~</span>
            <DateInput type="date" defaultValue={defaultEndDate} />
            <StyledButton variant="primary" size="small">적용</StyledButton>
          </DateInputGroup>
        </FilterContent>
      </Section>

      <ContentWrapper>
        <LeftPanel>
          <StatsGrid>
            <StatCard>
              <StatIcon src={carIcon} alt="총 시동 횟수" />
              <StatTitle>총 시동 횟수</StatTitle>
              <StatValue>1,247</StatValue>
              <StatChange increase>+12.5%</StatChange>
            </StatCard>
            <StatCard>
              <StatIcon src={calendarIcon} alt="평균 일일 시동" />
              <StatTitle>평균 일일 시동</StatTitle>
              <StatValue>40.2</StatValue>
              <StatChange decrease>-3.2%</StatChange>
            </StatCard>
            <StatCard>
              <StatIcon src={clockIcon} alt="총 가동 시간" />
              <StatTitle>총 운행 시간</StatTitle>
              <StatValue>18.5h</StatValue>
              <StatChange increase>+5.8%</StatChange>
            </StatCard>
            <StatCard>
              <StatIcon src={activityIcon} alt="평균 가동률" />
              <StatTitle>평균 가동률</StatTitle>
              <StatValue>77.1%</StatValue>
              <StatChange increase>+2.1%</StatChange>
            </StatCard>
          </StatsGrid>

          <Section>
            <SectionTitle>시동 위치 통계</SectionTitle>
            <MapPlaceholder>
              <div>지도 영역</div>
              <small>시동 위치가 히트맵으로 표시됩니다</small>
            </MapPlaceholder>
            <LocationListTitle>주요 시동 위치 (상위 3개)</LocationListTitle>
            <List gap="13px">
              <ListItem>
                <RankIcon src={rank1Icon} alt="1위" />
                <LocationInfo>
                  <SecondaryText>서울시 강남구 테헤란로 123</SecondaryText>
                  <LocationCount>총 47회 시동</LocationCount>
                </LocationInfo>
                <DynamicValue rank={1}>32.1%</DynamicValue>
              </ListItem>
              <ListItem>
                <RankIcon src={rank2Icon} alt="2위" />
                <LocationInfo>
                  <SecondaryText>서울시 서초구 서초대로 456</SecondaryText>
                  <LocationCount>총 31회 시동</LocationCount>
                </LocationInfo>
                <DynamicValue rank={2}>21.2%</DynamicValue>
              </ListItem>
              <ListItem>
                <RankIcon src={rank3Icon} alt="3위" />
                <LocationInfo>
                  <SecondaryText>서울시 종로구 종로 789</SecondaryText>
                  <LocationCount>총 23회 시동</LocationCount>
                </LocationInfo>
                <DynamicValue rank={3}>15.8%</DynamicValue>
              </ListItem>
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
                  <TimeAnalysisTime>오전 9시 - 10시</TimeAnalysisTime>
                </TimeAnalysisInfo>
                <DynamicValue size="large" increase>95.2%</DynamicValue>
              </ListItem>
              <ListItem>
                <TimeAnalysisInfo>
                  <TimeAnalysisLabel>최소 가동 시간대</TimeAnalysisLabel>
                  <TimeAnalysisTime>새벽 3시 - 4시</TimeAnalysisTime>
                </TimeAnalysisInfo>
                <DynamicValue size="large" decrease>22.8%</DynamicValue>
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

// const ComparisonTabs = styled.div`
//   display: flex;
//   background: ${({ theme }) => theme.palette.grey[100]};
//   border-radius: 8px;
//   padding: 8px;
//   margin-bottom: 20px;
//   gap: 8px;
//   justify-content: center;
// `;

// const ComparisonTab = styled.button`
//   min-width: 207px;
//   padding: 8px 16px;
//   border: none;
//   background: ${({ active, theme }) =>
//     active ? theme.palette.primary.main : theme.palette.background.paper};
//   color: ${({ active, theme }) =>
//     active ? "white" : theme.palette.text.secondary};
//   font-size: 14px;
//   font-weight: ${({ active }) => (active ? "700" : "500")};
//   border-radius: 6px;
//   cursor: pointer;
//   transition: all 0.2s;

//   &:hover {
//     background: ${({ active, theme }) =>
//       active ? theme.palette.primary.main : theme.palette.grey[100]};
//   }
// `;

// const ComparisonLabel = styled.h3`
//   font-size: 14px;
//   color: ${({ theme }) => theme.palette.grey[400]};
// `;

// const ComparisonValue = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   font-weight: bold;
// `;

// const ComparisonChange = styled.span`
//   color: ${({ increase, theme }) =>
//     increase ? theme.palette.increase.contrastText : theme.palette.decrease.contrastText};
//   font-size: 13px;
// `;

const TimeAnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
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

// 한 줄 전체(타이틀+가이드) 감싸는 래퍼
const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px;
  margin-bottom: 18px;
`;

// 타이틀
const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
`;

// 범례(가이드) 영역
const ChartLegend = styled.div`
  display: flex;
  gap: 20px;
  margin-left: 350px;
`;

// 색상 네모
const LegendColor = styled.span`
  display: inline-block;
  width: 13px;
  height: 13px;
  border-radius: 4px;
  background: ${({ business, theme }) =>
    business ? theme.palette.primary.main : theme.palette.grey[300]};
  margin-right: 4px;
`;

// 범례 텍스트
const LegendLabel = styled.span`
  font-size: 13px;
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