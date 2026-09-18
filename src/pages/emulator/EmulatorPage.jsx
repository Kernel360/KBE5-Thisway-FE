import React, { useState, useRef } from "react";
import styled from "styled-components";

function EmulatorPage() {
  const [mdn, setMdn] = useState("");
  // gps_scenario 폴더의 파일명 규칙에 따라 배열을 동적으로 생성
  const gpsScenarioFiles = Array.from(
    { length: 20 },
    (_, i) => `emulator_scenario_${i + 1}.csv`,
  );
  const [selectedFile, setSelectedFile] = useState(gpsScenarioFiles[0]);
  // 주기 선택을 위한 값들
  const intervalOptions = [1, 5, 10, 20, 30, 60];
  const [interval, setInterval] = useState(intervalOptions[0]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null); // power 로그 onTime 저장용
  const timeoutRef = useRef(null); // 첫 gps 로그 setTimeout용
  const idxRef = useRef(0); // gps 데이터 인덱스
  const rowsRef = useRef([]); // 시나리오 데이터
  const intervalValueRef = useRef(interval); // 주기값
  const [isRunning, setIsRunning] = useState(false); // 전송 중 여부
  const lastGpsDataRef = useRef(null); // 마지막 gps 데이터

  // CSV 파싱 함수 (헤더 무시, 데이터만 추출)
  function parseCSV(text) {
    const lines = text.trim().split("\n");
    const data = lines.slice(1).map((line) => line.split(","));
    return data;
  }

  // 주기적으로 요청 보내는 함수
  const handleStart = async () => {
    setIsRunning(true);
    // 시나리오 파일 fetch
    const filePath = `/data/gps_scenario/${selectedFile}`;
    let csvText;
    try {
      const res = await fetch(filePath);
      if (!res.ok) throw new Error("파일을 불러올 수 없습니다.");
      csvText = await res.text();
    } catch (e) {
      alert("시나리오 파일을 불러오지 못했습니다.");
      return;
    }
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      alert("시나리오 파일에 데이터가 없습니다.");
      return;
    }
    rowsRef.current = rows;
    intervalValueRef.current = interval;

    // 시작 시각 저장 및 power 로그 전송
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    // power 로그 onTime: 초까지 포함
    const startTimeWithSec =
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds());
    // gps 로그 oTime: 분까지만
    const startTime =
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes());
    startTimeRef.current = startTime;
    // power 로그 onTime(초까지)도 저장
    startTimeRef.currentWithSec = startTimeWithSec;

    // power 로그 전송
    const powerPayload = {
      mdn: mdn,
      tid: "A001",
      mid: "6",
      pv: "1",
      did: "LTE 1.2",
      onTime: startTimeWithSec,
      offTime: null,
      gcd: "A",
      lat: Math.round(Number(rows[0][2]) * 1000000), // 첫 데이터의 위도
      lon: Math.round(Number(rows[0][1]) * 1000000), // 첫 데이터의 경도
      ang: parseInt(rows[0][5], 10), // 첫 데이터의 방향 int형
      spd: parseInt(rows[0][3], 10), // 첫 데이터의 속도 int형
      sum: parseInt(rows[0][4], 10), // 첫 데이터의 누적주행거리 int형
    };
    try {
      const res = await fetch("/api/logs/power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(powerPayload),
      });
      if (!res.ok) throw new Error("power 로그 전송에 실패했습니다.");
    } catch (e) {
      alert("power 로그 전송에 실패했습`니다.");
      return;
    }

    // 주기마다 실행되는 함수 (setTimeout 재귀)
    const sendBatch = async () => {
      const rows = rowsRef.current;
      const intervalVal = intervalValueRef.current;
      if (idxRef.current >= rows.length) {
        // 모든 데이터 전송 후 자동으로 stop 처리
        await handleStop();
        alert("모든 데이터를 전송했습니다!");
        return;
      }
      const batch = rows.slice(idxRef.current, idxRef.current + intervalVal);
      if (batch.length > 0) {
        // oTime 계산: power 로그 보낸 시각(초) + batch 첫 row의 sec
        const base = startTimeRef.currentWithSec;
        const baseDate = new Date(
          Number(base.slice(0, 4)),
          Number(base.slice(4, 6)) - 1,
          Number(base.slice(6, 8)),
          Number(base.slice(8, 10)),
          Number(base.slice(10, 12)),
          Number(base.slice(12, 14)),
        );
        const baseSec = parseInt(batch[0][0], 10) || 0;
        const oDate = new Date(baseDate.getTime() + baseSec * 1000);
        const oTime =
          oDate.getFullYear().toString() +
          pad(oDate.getMonth() + 1) +
          pad(oDate.getDate()) +
          pad(oDate.getHours()) +
          pad(oDate.getMinutes()) +
          pad(oDate.getSeconds());
        const cList = batch.map((cols) => {
          // 각 데이터 포인트의 정확한 수집 시각을 계산
          const relativeSecs = parseInt(cols[0], 10) - baseSec;
          const pointInTime = new Date(oDate.getTime() + relativeSecs * 1000);

          return {
            sec: pad(pointInTime.getSeconds()), // 수집 시각의 '초'로 변경
            min: pad(pointInTime.getMinutes()), // 수집 시각의 '분'을 min 필드에 추가
            gcd: "A",
            lat: Math.round(Number(cols[2]) * 1000000),
            lon: Math.round(Number(cols[1]) * 1000000),
            ang: parseInt(cols[5], 10),
            spd: parseInt(cols[3], 10),
            sum: parseInt(cols[4], 10),
            bat: Math.floor(Math.random() * 10000).toString(),
          };
        });
        // 마지막 gps 데이터 저장
        lastGpsDataRef.current = cList[cList.length - 1];
        const payload = {
          mdn: mdn,
          tid: "A001",
          mid: "6",
          pv: "1",
          did: "LTE 1.2",
          oTime: oTime,
          cCnt: cList.length.toString(),
          cList: cList,
        };
        try {
          await fetch("/api/logs/gps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (e) {
          // 실패해도 건너뜀
        }
      }
      idxRef.current += intervalVal;
      // 다음 주기 예약 (재귀)
      if (idxRef.current < rows.length) {
        timeoutRef.current = setTimeout(sendBatch, intervalVal * 1000);
      }
    };

    // power 로그 전송 후 interval만큼 기다렸다가 첫 gps 로그 전송, 이후 재귀적으로 반복
    idxRef.current = 0;
    rowsRef.current = rows;
    intervalValueRef.current = interval;
    timeoutRef.current = setTimeout(sendBatch, interval * 1000);
  };

  // Stop 버튼 클릭 시 전송 중단 및 power 로그(stop) 전송
  const handleStop = async () => {
    setIsRunning(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // stop power 로그 전송
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const offTime =
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds());
    const last = lastGpsDataRef.current;
    if (!last) return;
    const stopPayload = {
      mdn: mdn,
      tid: "A001",
      mid: "6",
      pv: "1",
      did: "LTE 1.2",
      onTime: startTimeRef.currentWithSec,
      offTime: offTime,
      gcd: "A",
      lat: Math.round(Number(last.lat)),
      lon: Math.round(Number(last.lon)),
      ang: last.ang,
      spd: last.spd,
      sum: last.sum,
    };
    try {
      await fetch("/api/logs/power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stopPayload),
      });
    } catch (e) {
      // 실패해도 무시
    }
  };

  return (
    <PageWrapper>
      <Card>
        <GuideText>
          ※ MDN 입력 범위는 <b>0000000001 ~ 0000001000</b> 입니다.
        </GuideText>
        <FormRow>
          <Label htmlFor="mdn-input">MDN 입력</Label>
          <StyledInput
            id="mdn-input"
            type="text"
            value={mdn}
            onChange={(e) => setMdn(e.target.value)}
            placeholder="MDN을 입력하세요"
          />
        </FormRow>
        <FormRow>
          <Label htmlFor="scenario-select">시나리오 파일 선택</Label>
          <StyledSelect
            id="scenario-select"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
          >
            {gpsScenarioFiles.map((file) => (
              <option key={file} value={file}>
                {file}
              </option>
            ))}
          </StyledSelect>
        </FormRow>
        <FormRow>
          <Label htmlFor="interval-select">주기(초) 선택</Label>
          <StyledSelect
            id="interval-select"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
          >
            {intervalOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </StyledSelect>
        </FormRow>
        <ButtonRow>
          <StyledButton
            onClick={isRunning ? handleStop : handleStart}
            $running={isRunning}
          >
            {isRunning ? "Stop" : "시작"}
          </StyledButton>
        </ButtonRow>
      </Card>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.palette.background.default};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 40px 32px 32px 32px;
  min-width: 350px;
  max-width: 400px;
  width: 100%;
`;

const GuideText = styled.div`
  color: ${({ theme }) => theme.palette.text.disabled};
  font-size: 15px;
  margin-bottom: 18px;
  text-align: center;
  b {
    color: ${({ theme }) => theme.palette.primary.main};
    font-weight: 700;
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 15px;
  color: ${({ theme }) => theme.palette.text.primary};
  font-weight: 500;
`;

const StyledInput = styled.input`
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 16px;
  color: ${({ theme }) => theme.palette.text.primary};
  background: ${({ theme }) => theme.palette.background.paper};
  outline: none;
  transition: border 0.2s;
  &:focus {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const StyledSelect = styled.select`
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 16px;
  color: ${({ theme }) => theme.palette.text.primary};
  background: ${({ theme }) => theme.palette.background.paper};
  outline: none;
  transition: border 0.2s;
  &:focus {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const StyledButton = styled.button`
  background: ${({ $running, theme }) =>
    $running ? theme.palette.error.main : theme.palette.primary.main};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
  transition: background 0.2s;
  &:hover {
    background: ${({ $running, theme }) =>
      $running ? theme.palette.error.contrastText : theme.palette.primary.dark};
    color: #fff;
  }
`;

export default EmulatorPage;
