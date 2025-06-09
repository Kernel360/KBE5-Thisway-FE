import React, { useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";

const CompanyCarDetailPage = () => {
  const { id } = useParams();
  const [searchDate, setSearchDate] = useState("");

  // 실제로는 URL 파라미터나 props로 받아올 carId를 사용하여 데이터를 가져올 예정
  const carInfo = {
    id: id,
    carNumber: "서울 가 1234",
    manufacturer: "현대 / 아반떼",
    color: "흰색",
    year: "2023년",
    vehicleId: "VH-2023-A001",
    company: "ABC 렌트카",
    status: "운행중",
    currentInfo: {
      startTime: "2025-05-01 08:30:15",
      operationTime: "01:45:22",
      distance: "32.5 km",
      currentSpeed: "65 km/h",
      location: "서울시 강남구 테헤란로",
    },
  };

  const recentOperations = [
    {
      date: "2025-05-01",
      time: "08:30 ~ 현재",
      location: "서울시 강남구",
      distance: "32.5 km",
    },
    {
      date: "2025-04-30",
      time: "13:15 ~ 15:40",
      location: "서울시 송파구",
      distance: "45.2 km",
    },
    {
      date: "2025-04-29",
      time: "09:20 ~ 11:05",
      location: "서울시 마포구",
      distance: "28.7 km",
    },
  ];

  const filteredOperations = searchDate
    ? recentOperations.filter((op) => op.date.includes(searchDate))
    : recentOperations;

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <PageTitle>
            차량 상세 정보 <CarNumber>{carInfo.carNumber}</CarNumber>
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
                <Value>{carInfo.carNumber}</Value>
              </InfoItem>
              <InfoItem>
                <Label>제조사/모델</Label>
                <Value>{carInfo.manufacturer}</Value>
              </InfoItem>
              <InfoItem>
                <Label>색상</Label>
                <Value>{carInfo.color}</Value>
              </InfoItem>
              <InfoItem>
                <Label>연식</Label>
                <Value>{carInfo.year}</Value>
              </InfoItem>
              <InfoItem>
                <Label>단말기 ID</Label>
                <Value>{carInfo.vehicleId}</Value>
              </InfoItem>
              <InfoItem>
                <Label>소속 업체</Label>
                <Value>{carInfo.company}</Value>
              </InfoItem>
              <InfoItem>
                <Label>상태</Label>
                <Value>
                  <StatusBadge>{carInfo.status}</StatusBadge>
                </Value>
              </InfoItem>
            </InfoList>
          </Section>

          <Section>
            <SectionTitle>현재 운행 정보</SectionTitle>
            <InfoList>
              <InfoItem>
                <Label>시작 시간</Label>
                <Value>{carInfo.currentInfo.startTime}</Value>
              </InfoItem>
              <InfoItem>
                <Label>운행 시간</Label>
                <Value>{carInfo.currentInfo.operationTime}</Value>
              </InfoItem>
              <InfoItem>
                <Label>이동 거리</Label>
                <Value>{carInfo.currentInfo.distance}</Value>
              </InfoItem>
              <InfoItem>
                <Label>현재 속도</Label>
                <Value>{carInfo.currentInfo.currentSpeed}</Value>
              </InfoItem>
              <InfoItem>
                <Label>현재 위치</Label>
                <Value>{carInfo.currentInfo.location}</Value>
              </InfoItem>
            </InfoList>
          </Section>

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
              {filteredOperations.map((operation, index) => (
                <HistoryItem key={index}>
                  <HistoryDate>{operation.date}</HistoryDate>
                  <HistoryDetails>
                    <div>{operation.time}</div>
                    <div>{operation.location}</div>
                  </HistoryDetails>
                  <HistoryDistance>{operation.distance}</HistoryDistance>
                </HistoryItem>
              ))}
            </HistoryList>
          </Section>
        </LeftColumn>

        <RightColumn>
          <Section style={{ height: "100%" }}>
            <SectionTitle>실시간 위치 및 이동 경로</SectionTitle>
            <MapContainer>
              {/* 지도 컴포넌트가 들어갈 자리 */}
              <div
                style={{
                  height: "100%",
                  minHeight: "700px",
                  background: "#f5f6f8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                지도가 표시될 영역
              </div>
            </MapContainer>
          </Section>
        </RightColumn>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div.attrs(() => ({
  className: 'page-container'
}))``;

const Header = styled.div.attrs(() => ({
  className: 'page-header-wrapper'
}))``;

const HeaderLeft = styled.div.attrs(() => ({
  className: 'page-header'
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
  background-color: ${({ theme }) => theme.palette.success.main};
  color: ${({ theme }) => theme.palette.success.contrastText};
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

export default CompanyCarDetailPage;
