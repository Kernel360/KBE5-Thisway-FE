# CHANGE-015: 실제 서버 SSE adapter 검증

`tests/browser/live-server.mjs`는 인접 BE 저장소의 `./gradlew sseBrowserTest --console=plain`이 호출한다. BE가 실제 Boot/H2/nginx를 준비하고 Chromium은 제품 adapter로 401, 다른 회사 404, live event 수신, close 후 재구독을 검증한다. FE에서 `npm ci`와 `npx playwright install chromium`이 필요하다. 일반 `npx playwright test`의 fixture 시나리오와 실행 경로가 다르다.

검증 결과: 전용 test 1/1 통과, Gradle 20초. 실제 React 화면·Kakao SDK 및 broker ingestion은 이 시나리오에 포함하지 않는다. 초기 fixture memo 누락 실패와 수정은 BE CHANGE-015에 기록했다. JWT는 환경변수로 전달하며 URL이나 로그에 출력하지 않는다.

CHANGE-016 확장: 전용 test 2/2 통과(14초). 기존 client close 외에 nginx idle timeout을 실제 유발하고 browser onerror/EOF 이후 재구독을 확인했다. 이 script의 재구독은 시험 절차이며 제품 자동 재연결 기능은 아니다. 서버의 `upstream timed out` 로그도 assertion으로 확인한다. 전체 문제·설계·학습·면접·AI 기록은 BE `docs/portfolio/work-logs/2026-09-05-sse-proxy-idle-timeout.md`에 있다.

학습·면접: MockMvc와 실제 socket 검증의 차이, nginx buffering의 영향, H2와 MySQL 검증 범위 차이를 설명한다. 전체 설계 선택·실패·학습 질문·AI 사용 기록은 BE `docs/portfolio/work-logs/2026-09-05-sse-boot-nginx-browser.md`에 있다. 원 팀 adapter 호출 기능에 대한 개인 테스트 보강이며 AI가 코드 작성과 검증을 수행했다. 사용자 직접 학습 확인은 미수행이다.
