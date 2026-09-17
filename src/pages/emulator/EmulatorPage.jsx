import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const scenarioFiles = Array.from({ length: 20 }, (_, i) => `emulator_scenario_${i + 1}.csv`);
const protocolClock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul',
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
const formatTime = (date) => {
  const parts = Object.fromEntries(protocolClock.formatToParts(date).map(({ type, value }) => [type, value]));
  return ['year', 'month', 'day', 'hour', 'minute', 'second'].map(type => parts[type]).join('');
};
const point = (row) => ({ lat: String(Math.round(Number(row[2]) * 1e6)),
  lon: String(Math.round(Number(row[1]) * 1e6)), ang: String(Math.trunc(Number(row[5]))),
  spd: String(Math.trunc(Number(row[3]))), sum: String(Math.trunc(Number(row[4]))) });

function EmulatorPage() {
  const [mdn, setMdn] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [deviceKey, setDeviceKey] = useState("");
  const [selectedFile, setSelectedFile] = useState(scenarioFiles[0]);
  const [interval, setInterval] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState("");
  const sessionRef = useRef(null);
  const stopRef = useRef(null);
  const mounted = useRef(true);

  const clearSession = (session) => {
    clearTimeout(session?.timer);
    session?.controller.abort();
    if (session) session.key = "";
    if (sessionRef.current === session) sessionRef.current = null;
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearSession(sessionRef.current);
      stopRef.current?.abort();
    };
  }, []);

  const send = async (session, kind, body, signal = session.controller.signal) => {
    const response = await fetch(`/api/logs/${kind}`, {
      method: "POST", credentials: "omit", redirect: "error", signal,
      headers: { "Content-Type": "application/json", "X-Device-Id": session.id, "X-Device-Key": session.key,
        "X-Request-Id": crypto.randomUUID(), "X-Request-Timestamp": String(Math.floor(Date.now() / 1000)) },
      body: JSON.stringify(body),
    });
    if (response.status === 401) throw new Error("장치 인증에 실패했습니다. 키와 현재 장치 연결을 확인하세요.");
    if (!response.ok) throw new Error(`전송에 실패했습니다 (HTTP ${response.status}).`);
  };

  const handleStop = async () => {
    const session = sessionRef.current;
    if (!session) return;
    clearTimeout(session.timer);
    session.controller.abort();
    sessionRef.current = null;
    setIsStopping(true);
    const controller = new AbortController();
    stopRef.current = controller;
    try {
      if (session.started) await send(session, "power", { ...session.common, ...session.last,
        onTime: session.onTime, offTime: formatTime(new Date()), gcd: "A" }, controller.signal);
    } catch (failure) {
      if (mounted.current) setError(failure.name === "AbortError" ? "전송이 취소되었습니다." : failure.message);
    } finally {
      session.key = "";
      if (mounted.current) { setIsRunning(false); setIsStopping(false); setDeviceKey(""); }
    }
  };

  const handleStart = async () => {
    if (sessionRef.current) return;
    setError("");
    if (!mdn || !/^[1-9][0-9]{0,18}$/.test(deviceId) || !/^twdev_[A-Za-z0-9_-]{43}$/.test(deviceKey)) {
      setError("등록된 MDN, 장치 ID와 발급받은 장치 키를 입력하세요.");
      return;
    }
    if (location.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) {
      setError("장치 키를 전송하려면 HTTPS로 접속하세요.");
      return;
    }
    const session = { id: deviceId, key: deviceKey, controller: new AbortController(), started: false,
      common: { mdn, tid: "A001", mid: "6", pv: "1", did: "1" }, index: 0 };
    sessionRef.current = session;
    setDeviceKey("");
    setIsRunning(true);
    const fail = (failure) => {
      if (sessionRef.current !== session) return;
      clearSession(session);
      if (mounted.current) {
        setIsRunning(false);
        setError(`${failure.message} 전송을 중단했습니다. 서버의 운행 상태를 확인하세요.`);
      }
    };
    try {
      const response = await fetch(`/data/gps_scenario/${selectedFile}`, { signal: session.controller.signal });
      if (!response.ok) throw new Error("시나리오 파일을 불러오지 못했습니다.");
      const rows = (await response.text()).trim().split("\n").slice(1).filter(line => line.trim()).map(line => line.split(","));
      if (!rows.length || rows.some(row => row.length < 6 || row.slice(0, 6).some(value => !value.trim() || !Number.isFinite(Number(value))))) {
        throw new Error("시나리오 데이터 형식을 확인하세요.");
      }
      if (sessionRef.current !== session) return;
      session.base = new Date(); session.onTime = formatTime(session.base); session.last = point(rows[0]);
      await send(session, "power", { ...session.common, ...session.last, onTime: session.onTime, offTime: "", gcd: "A" });
      session.started = true;
      if (sessionRef.current !== session) return;
      const sendBatch = async () => {
        if (sessionRef.current !== session) return;
        try {
          const batch = rows.slice(session.index, session.index + interval);
          const packets = [];
          for (const row of batch) {
            const date = new Date(session.base.getTime() + Number(row[0]) * 1000);
            const time = formatTime(date);
            // Entries only carry minute/second; each packet must share the base year/month/day/hour.
            if (!packets.length || packets.at(-1).oTime.slice(0, 10) !== time.slice(0, 10)) {
              packets.push({ ...session.common, oTime: time, cList: [] });
            }
            packets.at(-1).cList.push({ ...point(row), min: time.slice(10, 12), sec: time.slice(12, 14), gcd: "A", bat: "12" });
          }
          for (const packet of packets) {
            await send(session, "gps", { ...packet, cCnt: String(packet.cList.length) });
            if (sessionRef.current !== session) return;
            session.last = packet.cList.at(-1);
            session.index += packet.cList.length;
          }
          if (session.index >= rows.length) await handleStop();
          else session.timer = setTimeout(sendBatch, interval * 1000);
        } catch (failure) { fail(failure); }
      };
      session.timer = setTimeout(sendBatch, interval * 1000);
    } catch (failure) { fail(failure); }
  };

  return <PageWrapper><Card>
    <GuideText>등록된 장치의 MDN과 키로 시뮬레이션합니다. 키는 저장하지 않으며 전송 종료 시 지웁니다.</GuideText>
    {error && <p role="alert">{error}</p>}
    <FormRow><Label htmlFor="mdn-input">MDN 입력</Label><StyledInput id="mdn-input" value={mdn}
      disabled={isRunning} onChange={e => setMdn(e.target.value)} /></FormRow>
    <FormRow><Label htmlFor="device-id">장치 ID</Label><StyledInput id="device-id" inputMode="numeric" value={deviceId}
      disabled={isRunning} onChange={e => setDeviceId(e.target.value)} /></FormRow>
    <FormRow><Label htmlFor="device-key">장치 키</Label><StyledInput id="device-key" type="password" autoComplete="off" value={deviceKey}
      disabled={isRunning} onChange={e => setDeviceKey(e.target.value)} /></FormRow>
    <FormRow><Label htmlFor="scenario-select">시나리오 파일 선택</Label><StyledSelect id="scenario-select" value={selectedFile}
      disabled={isRunning} onChange={e => setSelectedFile(e.target.value)}>
      {scenarioFiles.map(file => <option key={file} value={file}>{file}</option>)}
    </StyledSelect></FormRow>
    <FormRow><Label htmlFor="interval-select">주기(초) 선택</Label><StyledSelect id="interval-select" value={interval}
      disabled={isRunning} onChange={e => setInterval(Number(e.target.value))}>
      {[1, 5, 10, 20, 30, 60].map(value => <option key={value} value={value}>{value}</option>)}
    </StyledSelect></FormRow>
    <ButtonRow><StyledButton onClick={isRunning ? handleStop : handleStart} disabled={isStopping} $running={isRunning}>
      {isStopping ? "중지 중" : isRunning ? "Stop" : "시작"}
    </StyledButton></ButtonRow>
  </Card></PageWrapper>;
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
