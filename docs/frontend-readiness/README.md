# 프론트 제출 준비 점검 — 2026-09-08

기준94dc5f1. 사용자 요청은 남은 PR/CI 마무리와 프론트 상태 점검이다. 추가 제품 기능은 보류한다. 기존 팀 FE 위에 적용한 AI 지원 개인 현대화이며, 전체 프론트를 최초 개인 구현으로 주장하지 않는다.

## 확인한 범위와 미완성

회사 관리자용 차량·운행 기록·통계·Emulator 계약 화면이 존재하고 기존 browser regression으로 주요 계약을 확인한다. 반면 AdminDashboardPage/AdminStatisticsPage/CompanySettingsPage는 placeholder이고 MEMBER의6개 화면은 MemberDummyPage다. 전체 역할을 지원하는 완성 제품으로 제출하면 안 된다. 회사 관리자 중심 시연 범위와 미구현 목록을 함께 설명한다.

실제 production build의 로그인1440/390px, ADMIN placeholder, MEMBER390px를 Chromium으로 확인했다. API는 차단하고 synthetic identity를 사용했다. 실제 backend 권한이나 외부 지도 SDK 검증이 아니다. [화면 결과](result.json)와 PNG를 보존했다.

## 문제와 수정

- LoginPage의 MEMBER 재방문 경로가 등록되지 않은 /user/dashboard였다. ROUTES.member.dashboard로 통일했다.
- getUserRole은 roles 누락 시 예외가 날 수 있고 만료·비정상 exp를 거르지 않았다. 유효한 만료 시각과 roles 배열을 확인하고 Sidebar와 동일한 알려진 역할 우선순위를 사용한다. 브라우저 decode는 UI 이동용이며 실제 인증·인가는 backend가 수행한다.
- 로그인 label과 input id를 연결하고 autocomplete를 지정했다. 비밀번호 찾기 버튼의 암묵적 form submit을 막았다.
- 계정 메뉴·로그아웃의 클릭 div를 native button으로 바꾸고 aria-expanded, Escape 닫기/포커스 복원을 추가했다.
- 404에 실제 복귀 링크를 추가했다. 최초 regression에서 전역 로그인 guard가 미등록 URL까지 가로채는 것이 확인됐다. 등록된 보호 경로는 그대로 검사하고 없는 URL만 공개404를 보여 준다.
- 고정250px Sidebar가390px에서 본문을 글자 단위로 압축했다.767px 이하에서는 상단 메뉴와 가로 스크롤 navigation으로 배치한다. [수정 전](member-mobile-before.png)과 [수정 후](member-mobile.png)를 비교한다. 모든 업무 표·모달의 모바일 품질을 검증한 것은 아니다.

Drawer를 새로 도입하는 대신 단순 CSS 재배치를 선택했다. 추가 상태·focus trap 없이 본문 폭을 확보하지만, 작은 화면의 메뉴는 가로 스크롤이 필요하다. 미구현 업무 기능을 새로 만들거나 숨기지 않았다.

## 검증

- npm test:14개 성공.
- npm run build 성공.
- npx playwright test:26개 성공.
- npx playwright test --config playwright.production.config.mjs:8개 성공(기존3+추가5).
- 최초 production regression은404 guard 때문에1실패/7성공이었다. 수정 후26+8 재실행 성공. CSS 보강 뒤에도 build/26+8과 실제 화면을 다시 확인했다.
- 네 화면의 pageErrors0. 캡처 범위에서 documentWidth는 viewport와 같았다. 작은 화면 전체가 완성됐다는 지표는 아니다.

공부/면접: 왜 getUserRole이 인증을 대신하지 못하나(서버 검증)? native button과 클릭 div의 차이는(키보드·focus·기본 의미)? 404 공개가 보호 경로를 열지 않는 이유는(등록 경로만 기존 guard 유지)? desktop/mobile 시연과 실제 backend E2E 차이는(API 차단 fixture 경계)?

AI가 분석·수정·실행·기록을 수행했다. 사람의 독립 이해와 운영 적용은 별도이며 현재 CI는 PR 검증용이다. Merge/배포는 포함하지 않는다.
