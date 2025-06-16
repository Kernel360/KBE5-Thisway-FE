import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import SearchInput from "../../components/SearchInput";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import { formatDate, formatTime, formatDuration } from "../../utils/dateUtils";
import { authApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";

const PAGE_SIZE = 10;

const TripHistoryPage = () => {
  const [trips, setTrips] = useState([]);
  const [carSearchInput, setCarSearchInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");
  const [carSearch, setCarSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authApi.get("/trip-log");
        setTrips(res.data);
      } catch (err) {
        setError("운행 기록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // 검색 버튼 클릭 시만 필터 적용
  const handleSearch = (e) => {
    e.preventDefault();
    setCarSearch(carSearchInput);
    setDateFrom(dateFromInput);
    setDateTo(dateToInput);
    setCurrentPage(1);
  };

  // 날짜/차량번호 필터
  const filteredTrips = trips.filter((trip) => {
    let match = true;
    if (carSearch) {
      match = match && trip.carNumber.includes(carSearch);
    }
    if (dateFrom) {
      match = match && new Date(trip.startTime) >= new Date(dateFrom);
    }
    if (dateTo) {
      // dateTo의 마지막까지 포함되도록 23:59:59로 보정
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      match = match && new Date(trip.startTime) <= to;
    }
    return match;
  });

  // 페이지네이션
  const totalPages = Math.ceil(filteredTrips.length / PAGE_SIZE) || 1;
  const pagedTrips = filteredTrips.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // 상세보기 버튼 클릭
  const handleDetail = (trip) => {
    navigate(
      `/company/trip-detail?vehicleId=${trip.vehicleId}&startTime=${encodeURIComponent(trip.startTime)}&endTime=${encodeURIComponent(trip.endTime)}`
    );
  };

  return (
    <div className="page-container">
      <div className="page-header-wrapper">
        <div className="page-header">운행 기록</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <form style={{ display: "flex", gap: 12 }} onSubmit={handleSearch}>
            <DateInput
              type="date"
              value={dateFromInput}
              onChange={(e) => setDateFromInput(e.target.value)}
              max={dateToInput || undefined}
            />
            <span style={{ alignSelf: "center", color: "#b0b0b0" }}>~</span>
            <DateInput
              type="date"
              value={dateToInput}
              onChange={(e) => setDateToInput(e.target.value)}
              min={dateFromInput || undefined}
            />
            <WideSearchInput
              placeholder="차량 번호"
              value={carSearchInput}
              onChange={(e) => setCarSearchInput(e.target.value)}
              width="220px"
            />
            <Button type="submit" size="medium" style={{ minWidth: 80 }}>
              검색
            </Button>
          </form>
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead className="table-head">
            <tr>
              <th className="table-header-cell">번호</th>
              <th className="table-header-cell">차량번호</th>
              <th className="table-header-cell">시작 시간</th>
              <th className="table-header-cell">종료 시간</th>
              <th className="table-header-cell">운행 시간</th>
              <th className="table-header-cell">이동 거리</th>
              <th className="table-header-cell">상세</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="empty-cell" colSpan={7}>로딩 중...</td>
              </tr>
            ) : error ? (
              <tr>
                <td className="empty-cell" colSpan={7}>{error}</td>
              </tr>
            ) : pagedTrips.length === 0 ? (
              <tr>
                <td className="empty-cell" colSpan={7}>운행 기록이 없습니다.</td>
              </tr>
            ) : (
              pagedTrips.map((trip, idx) => (
                <tr className="table-row" key={trip.vehicleId + trip.startTime}>
                  <td className="table-cell">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="table-cell">{trip.carNumber}</td>
                  <td className="table-cell">{formatDate(trip.startTime)} {formatTime(trip.startTime)}</td>
                  <td className="table-cell">{formatDate(trip.endTime)} {formatTime(trip.endTime)}</td>
                  <td className="table-cell">{formatDuration(trip.startTime, trip.endTime)}</td>
                  <td className="table-cell">{(trip.tripMeter / 1000).toFixed(1)} km</td>
                  <td className="table-cell">
                    <SecondaryButton size="small" color="secondary" onClick={() => handleDetail(trip)}>
                      상세보기
                    </SecondaryButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

const WideSearchInput = styled(SearchInput)`
  width: 220px !important;
  min-width: 220px;
`;

const DateInput = styled.input`
  width: 170px;
  height: 40px;
  padding: 0 16px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  font-size: 15px;
  color: ${({ theme }) => theme.palette.text.primary};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

// Button color="secondary"가 확실히 연한 하늘색 배경이 되도록 스타일 보강
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

export default TripHistoryPage;
