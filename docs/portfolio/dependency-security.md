# CHANGE-FE-005: 의존성 보안 정리와 인증·라우팅 회귀

## 메타데이터와 문제

- 날짜: 2026-09-06
- 기준: `develop@aeb1618`, 작업 브랜치 `codex/frontend-dependency-security`
- 상태: Verified (로컬 검증 및 커밋, 원격 병합·배포 아님)
- 출처: 기존 5인 팀 FE 위 개인 현대화. AI가 분석·수정 초안·테스트 실행을 보조했다. 기존 FE 전체를 개인 구현으로 주장하지 않는다.

GitHub 병합 시 form-data critical/esbuild moderate 경고가 확인됐다. 최신 registry를 사용한 실제 `npm audit --json`에서는 **취약 패키지 항목 16개(low 1/moderate 3/high 11/critical 1)**가 나왔다. GitHub 알림 개수와 npm 집계 범위는 동일하지 않으며 실제 공격 가능성이나 독립적인 CVE 16개를 의미하지 않는다.

## Acceptance criteria

- [x] 강제 override 없이 root dependency와 호환 transitive dependency를 업데이트한다.
- [x] npm audit의 현재 알려진 취약 패키지 항목 0개를 확인한다.
- [x] SSE 단위 테스트 및 Router/Axios/민감 로그 browser 회귀를 검증한다.
- [x] lockfile 기준 재설치·build 및 실제 Boot/nginx/Chromium SSE 재검증 결과를 기록한다.
- [x] 원문 RFP 미보유, 기업용 차량 운영 관리 서비스라는 소개 경계를 README에 반영한다.

## 선택지와 결정

- `npm audit fix --force` 일괄 적용: 메이저 변경 이유와 영향이 불명확하므로 사용하지 않았다.
- esbuild만 override: Vite가 요구하는 버전과 어긋날 수 있어 선택하지 않았다.
- Vite 8: Rolldown/Oxc 전환까지 겹치므로 이번 변경에서는 제외했다. 보안 수정 Vite 7과 호환 플러그인을 선택했다.
- 기존 Router 6 유지: 6.30.6까지 올려도 moderate 2개가 남아 Router 7.18.3으로 명시적으로 전환했다. React 18, BrowserRouter/Routes 및 기존 route definition은 유지했다.

| 의존성 | 기존 lock | 최종 lock |
| --- | --- | --- |
| axios | 1.9.0 | 1.20.0 |
| form-data | 4.0.2 | 4.0.6 |
| vite | 4.5.14 | 7.3.6 |
| esbuild | 0.18.20 | 0.28.2 |
| @vitejs/plugin-react | 4.5.1 | 5.2.0 |
| react-router-dom / react-router | 6.30.1 | 7.18.3 |

추가 Babel/라우터/HTTP/build 관련 간접 의존성 수정은 lockfile diff에 남긴다. npm lifecycle script는 설치 중 실행하지 않았다. Vite Node 최소 조건을 고려해 프로젝트 engine을 명시했다. Vite의 기본 browser build target 변경이 있으므로 구형 브라우저 호환을 보장하지 않는다.

## 구현·실행 흐름

`package.json`에서 검토한 버전과 Node 범위를 명시 → npm으로 lockfile 재해석 → 기존 semver 범위 안 audit fix → Router 잔여 경고를 확인해 명시적으로 메이저 전환 → build와 실제 브라우저 동작 검증.

회귀 범위는 공개 로그인 화면/비밀번호 초기화 이동·뒤로 가기, 미인증 보호 경로의 로그인 이동, Axios 로그인 401 안내, 차량 상세 SSE 끊김·재연결·401/403/404·network failure다. API 응답은 fixture이며 실서비스 로그인 성공·모든 화면·테넌트 인가의 대체 검증은 아니다.

검증 중 `LoginPage`의 token console 출력과 `window.checkToken/clearToken` 디버그 global을 발견해 제거했다. fixture token 비출력과 global 미노출을 회귀 테스트한다. JWT localStorage 저장 구조 자체를 이번에 변경하지는 않았다.

## 검증과 실패 기록

1. 최초 `npm audit --json`: exit 1, 16개 취약 패키지 항목.
2. `npm install --ignore-scripts` 후 8개, `npm audit fix --ignore-scripts` 후 exit 1/moderate 2개(Router). 이 실패를 숨기거나 audit를 비활성화하지 않았다.
3. Router 7.18.3 전환 후 `npm audit`: 0건, exit 0.
4. `npm test`: 8/8 성공.
5. `npm run build`: 성공. JS main bundle 약 975kB/ gzip 약 298kB로 500kB 경고는 남는다. 이전 약 930kB보다 증가했으며 성능 개선으로 표현하지 않는다.
6. `npx playwright test`: 9/9 성공(기존 SSE 5 + 추가 4), 2.9초.
7. 최종 `npm ci --ignore-scripts && npm audit && npm test && npm run build && npx playwright test`: 재설치 성공, audit 0, 단위 8/8, build 성공(3.57초), browser 9/9(2.8초). 최종 JS bundle 974.81kB / gzip 298.29kB. `git diff --check` 통과.
8. 인접 BE에서 `./gradlew sseBrowserTest --rerun-tasks --console=plain`: 실제 Boot/nginx/Chromium 2/2, failure/error/skipped 0, 48초. 일반 BE 294개 suite는 BE 코드 변경이 없어 이번에 재실행하지 않았다. 기존 결과와 이번 실행을 구분한다.

## 남은 위험과 오늘의 종료 기준

- audit 0은 registry가 알고 있는 dependency 취약점이 없다는 뜻이지 전체 앱 보안 인증이 아니다. 예를 들어 localStorage JWT, 전체 권한 모델, 입력 검증은 별도 검토가 필요하다.
- form-data의 Node 경로와 브라우저 Axios adapter의 실제 노출은 다를 수 있다. 설치된 취약 의존성 제거를 확인했으며 서비스 공격 재현은 하지 않았다.
- 현대 Chromium 회귀만 검증하며 구형 Safari/Firefox 및 모든 기능을 검증하지 않았다.
- mock login 401은 실제 인증 서버 연결 성공을 증명하지 않는다. BE 실제 SSE 별도 검증은 해당 연결·권한·재연결 범위에 한정한다.
- FE 번들 경고, BE Actions 버전 경고, Statistics/Batch restart·부분 실패는 다음 작업이다. 프로젝트 전체 완료로 표시하지 않는다.
- 이번 변경은 로컬 커밋까지가 기본 범위이며 push/PR/병합·배포 결과와 구분한다. 초기화권은 사용하지 않는다.

## 학습·면접 포인트

1. **왜 npm audit fix --force를 쓰지 않았나요?**
   - 의존성 메이저 변경은 API·빌드 환경·browser target에 영향을 준다. advisory와 호환 범위를 보고 변경한 뒤 실제 사용 흐름을 검증했다.
2. **lockfile과 package.json은 어떻게 다른가요?**
   - manifest는 허용 범위, lockfile은 정확한 해석 결과다. npm ci로 같은 graph가 설치되는지 확인해야 재현 가능한 검증이 된다.
3. **audit 0이면 안전한가요?**
   - 알려진 의존성 경고 감소의 증거다. 비즈니스 인가·민감 로그·개별 API 오용까지 보장하지 않는다.
4. **업그레이드 후 build 성공만으로 충분한가요?**
   - route 이동·HTTP 오류 안내·stream lifecycle 같은 runtime 경계가 남는다. browser 회귀와 실제 서버 SSE를 나누어 확인했다.

스스로 해 볼 실습: Vite의 간접 esbuild만 강제 override했을 때 왜 설치 성공과 도구 호환성이 다른지 설명하고, `npm ci`와 `npm install`의 목적 차이를 설명한다.

## AI 활용과 참고 자료

AI가 audit 분석·버전 후보·수정·테스트 초안을 작성하고 명령을 실행했다. 사용자가 독립 재현·설명했는지는 아직 확인하지 않았다. AI의 일괄 강제 업데이트 대신 명시적인 버전 선택과 회귀 검증을 적용했다.

- [Vite 7 migration](https://v7.vite.dev/guide/migration)
- [Vite 8 migration: bundler 변경](https://vite.dev/guide/migration)
- [React Router changelog](https://reactrouter.com/home/changelog)
- npm registry metadata 및 실행 시점 npm audit. 현재 공식 Router v6 migration URL은 조회 시 404여서 changelog/설치된 API와 실제 browser 동작을 함께 확인했다.
