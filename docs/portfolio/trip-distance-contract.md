# 운행 거리 계약 현대화 (CHANGE-032 FE)

- 날짜: 2026-09-06
- 기준: `codex/frontend-dependency-security@4a0a2f8`
- 범위: AI 지원 개인 현대화. 기존 팀 UI 전체가 개인 기여라는 뜻은 아니다.

## 문제와 선택

BE의 혼합 totalTripMeter 대신 시작/종료 계기값의 차이를 표시하도록 맞췄다.
기존 null 나눗셈은 0.0km가 되어 미관측을 무주행으로 오해시켰다. 공통 formatTripDistance는
nullable/잘못된 거리에는 '확인 불가', 실제 0에는 '0.0 km'를 반환한다.
차량 상세/운행 이력/운행 상세에 동일한 표시를 적용했다.

SSE의 totalTripMeter는 여전히 누적값이다. 알려진 startOdometer를 빼서 표시하고 시작값이
없거나 계기값이 감소하면 null로 남긴다. GPS만으로 powerOn/startTime을 생성하던 기존 코드를
제거했다. 서버 상태를 60초 간격으로 조회해 실제 ON을 확인한다. 열린 차량 상세 화면의
polling 요청이 늘며 정상 상태 전환도 최대 약 60초 지연될 수 있다.

대안인 GPS 존재=시동 ON 추정은 지연 GPS와 구분할 근거가 부족하여 거절했다.
Power 상태 push를 새로 만드는 안은 별도 서버 이벤트 계약이 필요하여 이번 범위에서 분리했다.

## 검증

- `npm test`: 13/13 통과. unknown/0, 시작값 누락·계기값 감소·차감 포함.
- `npx playwright test`: 15/15 통과, 2.9초. 기존 회귀 + 차량 요약 거리, SSE 차감,
  GPS의 임의 ON 방지/서버 polling 확인, 운행 이력의 unknown/0 구분.
- `npm run build`: 성공 3.67초, main 976.09kB/gzip 298.90kB. 기존 chunk 경고는 유지.
- browser fixture는 HTTP를 mock한다. 실제 Emulator→BE→모든 화면의 업무 시연 증거는 아니다.
  실제 서버 SSE 별도 회귀 결과는 BE work log에 기록한다.

## 호환/제한

BE V7 응답: 완료 운행 tripMeter nullable, distanceStatus 추가,
CurrentDrivingInfo.startOdometer 추가. 구 서버의 이미 잘못된 숫자를 FE만으로 진단/정정하지 않는다.
FE 구버전은 null을 0으로 표시하므로 호환 배포 계획이 필요하다.
거리 미확정 이유는 API에 있으나 현재 UI는 공통 '확인 불가' 문구이며 원인별 설명 UI는 별도다.
SSE 이벤트의 세션/sequence 기반 거부, 전체 polling 부하, 지도의 GPS 품질 정책은 미완료다.

## 학습/면접/AI

- 공부: JavaScript null coercion, cumulative/delta, 서버 상태와 UI 추정의 차이, mock 계약 테스트 한계.
- 왜 null을 0으로 바꾸지 않았나? 모르는 것과 실제 0은 다르다.
- 왜 GPS 값에서 시작값을 빼나? payload는 해당 운행 거리가 아닌 장치 누적 계기값이다.
- 왜 즉시 ON 표시하지 않나? GPS만으로 새 시동을 입증할 수 없고 서버 확인을 우선했다.
- AI가 코드/테스트/문서 초안을 작성했다. 사용자는 null/0/1000→1500 사례와 polling 비용을
  직접 설명해야 하며 자동 테스트가 사람의 이해를 인증하지 않는다.
