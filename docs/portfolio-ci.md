# PR CI와 검증 범위

2026-09-08, 기준2a29252. 원 팀 FE 위의 AI 지원 개인 현대화다. 기존 SSE·통계·장치 인증 회귀와 production chunk 검증이 로컬에서만 실행되던 문제를 PR workflow로 연결했다.

선택: secrets 없는 pull_request와 workflow_dispatch, contents:read,15분 timeout, 이전 동일 PR 실행 취소. Node24, npm ci로 lockfile 설치, 단위→build→Chromium fixture→실제 emitted chunk 순서다. 기존 팀 배포나 사용자 독립 구현을 대신 주장하지 않는다.

로컬 Node24.19.0에서 npm test14개, Vite build 성공, npx playwright test26개, npx playwright test --config playwright.production.config.mjs3개 통과. GitHub runner 실행 결과는 공개 push 이후 별도로 확인한다. 브라우저 fixture가 실제 API 운영 검증을 대신하지 않는다.

재현: workflow의 run 명령을 순서대로 실행한다. 추가 인프라·외부 API secret은 필요 없다. npm ci는 기존 node_modules를 lockfile 기준으로 다시 설치한다.

면접 질문: 왜 npm ci인가(의존성 재현성)? 왜 browser와 production 검증을 나누나(소스 fixture vs emitted chunk)? CI green이 배포 성공인가(검증 경계 분리)? AI가 workflow 작성과 로컬 검증을 지원했다.
