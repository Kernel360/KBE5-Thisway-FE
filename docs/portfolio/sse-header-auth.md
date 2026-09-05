# SSE Bearer 헤더 전환 기록

2026-09-05, 개인 현대화 / AI-assisted implementation. 원 팀의 두 SSE 화면을 변경했다.

TripDetailViewPage와 CompanyCarDetailPage가 URL query JWT를 보내던 EventSource 대신 fetch 기반 `openAuthenticatedEventStream`을 사용한다. Authorization 헤더에 token을 전달하고 기존 named event listeners와 close 동작을 유지한다. 오류 시 자동 재시도하지 않으며 화면 이탈 시 AbortController로 취소한다. 상대 `/api/` 경로만 허용하고 query/redirect는 거부한다. parser는 fragmented UTF-8, LF/CRLF, 여러 data line과 event name을 처리하며 event 크기를 1 MiB 문자로 제한한다. 완전한 EventSource polyfill이나 Last-Event-ID/replay 구현은 아니다.

BE의 CHANGE-011과 함께 배포해야 한다. 새 BE는 query token만 사용한 SSE 요청을 401로 차단한다. 기본/개발 브랜치에는 직접 반영하지 않았다.

검증: `node --test src/utils/authenticatedEventStream.test.mjs` 6/6. 첫 build는 vite 미설치로 실패했고 `npm ci --ignore-scripts --no-audit --no-fund` 후 `npm run build` 성공(5.04초). 500 kB 초과 chunk 경고는 남아 있다. 실제 브라우저/지도/API/proxy 연결은 미검증이다.

대안: 일회용 ticket은 서버 저장소와 소비/재발급이 필요하고 cookie는 인증·CSRF 정책이 달라진다. 기존 Bearer 헤더를 재사용하는 fetch를 선택했다. 이로 인해 parser와 취소/에러 처리를 직접 검증해야 한다.

학습/면접: (1) EventSource와 fetch의 header/reconnect 차이 (2) UTF-8 byte boundary와 SSE event boundary 차이 (3) UI unmount에서 abort가 필요한 이유. 테스트를 읽고 token이 URL에 없으며 UTF-8 한글이 한 byte씩 도착해도 복원되는 흐름을 설명한다.

남은 사항: 기존 GPS 콘솔 출력, localStorage token의 XSS 위험, 사용자 재연결 UX, token refresh, 서버 버퍼/다중 instance 검증. AI가 코드와 테스트 초안 및 실행을 수행했으며 사용자 본인의 학습과 실브라우저 검증은 별도다.
