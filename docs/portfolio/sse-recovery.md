# CHANGE-014: 차량 SSE 단절 안내와 명시적 재연결

- 날짜: 2026-09-05, Shin Dong Jun + AI assistant
- 기존 팀 차량 화면을 개인 현대화. 기존 지도·관제 기능 전체를 개인 기여로 주장하지 않는다.
- 문제: HTTP 응답이 EOF로 끝나면 오류 없이 종료되어 화면이 최신 데이터인 것처럼 남았다. 오류도 console에만 표시했다.

## 결정과 흐름

자동 재시도는 반복 인증 실패와 snapshot 중복 처리 정책이 필요하므로 이번에는 명시적 재연결 버튼을 채택했다. EOF와 네트워크 오류는 stale 안내와 버튼, 401은 재로그인 안내, 403/404는 접근 불가 안내를 표시한다. 실패한 연결을 닫고 버튼 클릭 시 localStorage에서 현재 토큰을 다시 읽는다. 연결 성공 후 초기 GPS를 받기 전에 경로 배열을 비워 snapshot 중복을 방지한다. 이전 연결의 비동기 주소 결과는 effect cleanup 후 반영하지 않는다.

adapter의 `onend`는 EOF를 알리며 명시적 `close()`에는 호출하지 않는다. HTTP 오류에는 status를 전달한다. 기존 운행 상세 화면은 onend를 지정하지 않아 동작이 유지된다. 차량 화면의 onopen은 transport 연결 성공을 의미하며 데이터 최신성·snapshot 완료를 보증하지 않는다.

## Acceptance criteria와 검증

- [x] EOF/네트워크 실패가 화면에 보이고 수동 재연결 가능.
- [x] 재연결 후 과거 좌표가 두 번 누적되지 않음.
- [x] 새 토큰은 Authorization header에만 사용.
- [x] 401/403/404는 자동 또는 수동 반복 재시도 버튼을 표시하지 않음.
- [x] 명시적 close는 EOF 알림을 억제.

`node --test src/utils/authenticatedEventStream.test.mjs`: 8/8 통과.
`npx playwright test`: Chromium 5/5 통과, 3.5초.
`npm run build`: 성공, 5.23초. 기존 500 kB chunk 경고 유지.

재현: `npm ci`, `npx playwright install chromium`, 위 명령 실행. Playwright는 개발 의존성이고 lockfile에 고정했다. 테스트 서버는 localhost:4179에서만 동작하며 기존 서버를 재사용하지 않는다.

브라우저 테스트는 실제 CompanyCarDetailPage와 fetch adapter를 사용한다. API 응답은 Playwright route fixture, KakaoMap은 좌표 개수 표시 컴포넌트로 대체한다. 인증 서버·Kakao SDK·nginx/ALB·물리 네트워크 장애를 검증한 것은 아니다. 테스트 harness는 tests/browser에만 있으며 제품 진입점에서 import하지 않는다.

설치 시 npm audit가 16건(critical 1/high 11/moderate 3/low 1)을 보고했다. 기존 의존성의 상세 원인과 수정은 별도 점검 대상이며 자동 major upgrade는 실행하지 않았다. Playwright 설치 도구가 사용하지 않는 이전 브라우저 캐시를 제거하고 새 Chromium을 다운로드했다. 프로젝트 데이터는 삭제하지 않았다.

## 남은 한계

재연결은 전체 snapshot 재조회이며 Last-Event-ID/replay가 아니다. snapshot/live gap, silent half-open 감지·heartbeat, proxy buffering, 사용자 연결 수 제한은 미해결이다. 상세 운행 화면의 완료/실패 UX는 별도다. 기존 raw 위치 console logging과 localStorage 사용도 남아 있다. 이전 async GPS callback을 차단해도 별도 HTTP polling 응답의 최신성까지 보장하지 않는다.

## 학습과 면접

1. EOF와 오류가 왜 다른가? HTTP body의 정상 종료는 fetch 예외를 발생시키지 않는다. live stream에서는 별도 연결 상태 변화로 처리해야 한다.
2. 재연결 때 경로를 왜 비우는가? 서버가 과거 chunk를 다시 보내므로 누적하면 중복 경로가 된다. 이는 재조회 정책이며 무손실 replay는 아니다.
3. 401과 네트워크 실패의 복구가 왜 다른가? 인증 실패는 사용자 로그인 조치가 필요하고 일시적 연결 실패는 재시도할 수 있다.
4. 브라우저 테스트 통과가 무엇을 보장하는가? 실제 React/브라우저의 상태와 이벤트 처리를 fixture 조건에서 검증한다. 실제 BE·지도·proxy 동작은 별도 증거가 필요하다.

실습: 응답을 EOF, 401, connectionreset으로 바꿔 안내 차이를 설명한다. 사용자 직접 실습 완료는 미확인이다. AI가 구현·테스트·문서 작성과 실행을 수행했고, 사람의 이해·운영 검증은 자동 테스트와 구분한다.
