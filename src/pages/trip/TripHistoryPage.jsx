import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import { formatDate, formatTime, formatDuration } from "../../utils/dateUtils";
import { authApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { formatTripDistance } from "../../utils/tripDistance.mjs";

const PAGE_SIZE = 10;

const TripHistoryPage = () => {
  const [trips, setTrips] = useState([]);
  const [carSearchInput, setCarSearchInput] = useState("");
  const [carSearch, setCarSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const requestVersion = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    authApi.get("/trip-log", {
      params: { page: currentPage - 1, size: PAGE_SIZE }, signal: controller.signal,
    }).then(({ data }) => {
      if (version !== requestVersion.current || controller.signal.aborted) return;
      setTrips(data.tripLogs || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    }).catch(() => {
      if (!controller.signal.aborted && version === requestVersion.current) setError("운행 기록을 불러오지 못했습니다.");
    }).finally(() => {
      if (!controller.signal.aborted && version === requestVersion.current) setLoading(false);
    });
    return () => controller.abort();
  }, [currentPage, attempt]);

  // The endpoint supports pagination only. Filtering is explicitly limited to the fetched page.
  const visibleTrips = trips.filter(trip => String(trip.carNumber || "").includes(carSearch));

  return (
    <Container className="page-container">
      <div className="page-header-wrapper">
        <div><h1 className="page-header">운행 기록</h1><Description>완료된 운행의 시간과 이동 거리를 확인합니다.</Description></div>
      </div>
      <Surface>
        <Filters onSubmit={event => { event.preventDefault(); setCarSearch(carSearchInput.trim()); }}>
          <label>현재 페이지에서 차량번호 찾기<Input value={carSearchInput} onChange={event => setCarSearchInput(event.target.value)} placeholder="예: 12가3456" /></label>
          <Button type="submit" disabled={loading}>찾기</Button>
          <Button type="button" variant="outlined" onClick={() => { setCarSearchInput(""); setCarSearch(""); }}>초기화</Button>
          <Count>전체 {totalElements.toLocaleString()}건 · 현재 페이지 {visibleTrips.length}건 표시</Count>
        </Filters>
        <Description style={{ padding: "0 24px" }}>차량번호 조건은 현재 페이지에만 적용됩니다. 다른 기록은 페이지를 이동해 확인하세요.</Description>
        <TableScroll>
          <table className="table">
            <thead className="table-head"><tr>{["차량번호", "시작 시간", "종료 시간", "운행 시간", "이동 거리", "상세"].map(label => <th key={label} className="table-header-cell">{label}</th>)}</tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="empty-cell" role="status">운행 기록을 불러오는 중입니다.</td></tr>
                : error ? <tr><td colSpan={6} className="empty-cell"><span role="alert">{error}</span> <Button onClick={() => setAttempt(value => value + 1)}>다시 시도</Button></td></tr>
                : visibleTrips.length === 0 ? <tr><td colSpan={6} className="empty-cell">{carSearch ? "현재 페이지에 일치하는 차량번호가 없습니다." : "운행 기록이 없습니다."}</td></tr>
                : visibleTrips.map(trip => <tr className="table-row" key={trip.Id}>
                  <td className="table-cell"><strong>{trip.carNumber}</strong></td>
                  <td className="table-cell">{formatDate(trip.startTime)} {formatTime(trip.startTime)}</td>
                  <td className="table-cell">{formatDate(trip.endTime)} {formatTime(trip.endTime)}</td>
                  <td className="table-cell">{formatDuration(trip.startTime, trip.endTime)}</td>
                  <td className="table-cell">{formatTripDistance(trip.tripMeter)}</td>
                  <td className="table-cell"><DetailButton onClick={() => navigate(`/company/trip-detail?id=${trip.Id}`)} aria-label={`${trip.carNumber} ${formatTime(trip.startTime)} 운행 상세보기`}>상세보기 →</DetailButton></td>
                </tr>)}
            </tbody>
          </table>
        </TableScroll>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Surface>
    </Container>
  );
};

const Container = styled.div`min-width: 0;`;
const Description = styled.p`font-size: 14px; color: #64748B; line-height: 1.6; margin: 8px 0 20px;`;
const Surface = styled.section`background: #fff; border: 1px solid #E3E9EE; border-radius: 14px; overflow: hidden;`;
const Filters = styled.form`display: flex; align-items: end; gap: 12px; flex-wrap: wrap; padding: 24px 24px 8px; label { font-size: 13px; color: #475569; } @media(max-width: 600px) { padding: 18px; label { width: 100%; } }`;
const Input = styled.input`display: block; width: 260px; max-width: 100%; box-sizing: border-box; margin-top: 8px; height: 44px; padding: 0 14px; border: 1px solid #CBD5E1; border-radius: 10px; font: inherit; color: #15242D; &:focus-visible { outline: 3px solid #087F8C; outline-offset: 2px; } @media(max-width: 600px) { width: 100%; }`;
const Count = styled.span`margin: auto 0 12px auto; font-size: 13px; color: #64748B; font-variant-numeric: tabular-nums;`;
const TableScroll = styled.div`overflow-x: auto; table { min-width: 800px; width: 100%; } td { height: 56px; font-size: 14px; }`;
const DetailButton = styled.button`padding: 10px 12px; border: 1px solid #D8E9EB; border-radius: 10px; background: #F0FAFA; color: #066773; cursor: pointer; font-weight: 600; white-space: nowrap; &:focus-visible { outline: 3px solid #087F8C; outline-offset: 2px; }`;
export default TripHistoryPage;
