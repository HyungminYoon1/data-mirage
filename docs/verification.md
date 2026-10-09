# Verification

## Scope

data-mirage: model source and focused tests, static asset/syntax checks, browser interaction, remote workflow and public site are separate evidence levels. Existing unrelated services remain outside this change.

## Evidence

### 통계 수사 업그레이드 / 2026-10-09 / LOCAL ONLY

- VERIFIED sources: architecture.md, README.md, docs/decisions.md, docs/verification.md, .gitattributes, 모든 dist 코드/HTML/CSS, 모든 test, tools, package.json, .github/workflows/pages.yml를 전체 읽었습니다. `.git` 내부는 작업 상태 확인 외에 검사 대상으로 삼지 않았습니다. 지정 data-mirage 밖 저장소는 변경하지 않았습니다. 인벤토리를 코드 전체 검토로 대체하지 않았습니다.
- LOCAL: npm test **15/15 PASS**. 기존 4개 테스트 유지. 정확 꼬리확률을 별도 확률 분포 합성으로 대조하고, 순차 경로 확률에서 중간 중단 위험 증가·다중 검정 합집합 상계를 검사합니다. 알려진 상관값/변환 불변성, 전체·집단별·한 점 제외 결과를 다른 공분산 식으로 대조합니다. Hoeffding 폭을 지수식 이분법으로 검증하고, 노출된 모든 n/확률 하한의 포함률을 독립 Bernoulli 확률 합성으로 계산합니다. 시드 재현/접두부/분모/복원 중복/잘못된 입력/조건별 정답 변경도 검사합니다.
- LOCAL: npm run check **PASS**. 공개 파일 8개, 검사 텍스트 18개. 구문·로컬 모듈/자산·탭/고정 DOM 참조·CSP·순수 계산의 UI/브라우저 참조 부재·런타임 네트워크/저장소 호출 및 원격 자산 부재·엄격 UTF-8/no BOM/CRLF 정적 검사. 정적 문자열 검사는 브라우저 실행이나 완전한 보안 감사 증거가 아닙니다.
- LOCAL: git diff --check **PASS**. 변경된 파일의 UTF-8/no BOM/CRLF 확인. 외부 패키지 설치, 커밋, 푸시, 배포, 외부 쓰기, 추가 에이전트 생성 없음.
- LOCAL model snapshot (seed 42): 6지표·차이 없음·4시점·각 5%에서 지표 5의 15/20, p=0.04138946533203125로 20회에 첫 발견. 반복 기각 79/160. 동일 데이터/가족 보정 문턱 0.05/24에서는 이번 기각 없음, 반복 3/160. 동일 데이터/최종 80회만 검사하면 이번 기각 없음. 이는 합성 시뮬레이션의 결과이며 실제 통계·의료 데이터가 아닙니다.
- LOCAL model snapshot (seed 42): 집단 혼입 전체 r=0.8537728044, 집단 평균 제거 r=−0.9046229355, 각 집단 12점. 한 점 세계 전체 r=0.7559762094, 24번 제외 r=−0.9719647277. 모든 한 점 제외 결과는 별도 식으로 검증했습니다.
- LOCAL model snapshot (seed 42, n=200, 95%): 전체 풀 이번 123/200, 구간 [0.5189677209,0.7110322791], 목표 포함 158/160. 편향 풀 이번 169/200, [0.7489677209,0.9410322791], 목표 포함 0/160. 같은 복원 추출에서 n 증가에 따른 접두부는 유지됩니다. 포함 확률 하한은 선택 풀 평균에 대한 수학적 절차의 보장이며 이 160회 관측 빈도와 다릅니다.
- BROWSER_LOCAL / RESPONSIVE_LOCAL / WebMCP_LOCAL: **NOT_RUN for this upgrade**. 화면·키보드·모바일·콘솔·실제 WebMCP 동작은 메인 브라우저 QA 담당자가 별도로 확인합니다. 아래 최초 배포 전 기록을 이번 코드에 대한 실행 증거로 읽지 않습니다.
- REMOTE_CI / LIVE / DEPLOY: **NOT_RUN**. 기존 워크플로를 수정하거나 실행하지 않았고 공개 링크가 이 변경을 반영한다는 주장도 하지 않습니다.

#### 브라우저 QA 전달

README의 5단계 QA 흐름을 따릅니다. 시드 42와 각 제어값을 명시적으로 설정해야 위 모델 스냅샷과 일치합니다. 새 무작위 실험 → 시드 재현, 틀린 답 → 조건 변경 → 재판정, 원자료/분모 확인, 여섯 탭의 방향키/Home/End 이동, 320/390px 표 스크롤/넘침, 콘솔 오류, WebMCP 지원/미지원 환경을 확인하세요. 실행 후 결과는 이번 변경에 대한 별도 BROWSER_LOCAL 기록으로 추가해야 합니다.

#### 변경 파일 14개

| 영역 | 파일 | 변경 |
| --- | --- | --- |
| 순수 계산 | dist/src/math.js (NEW), dist/src/statistics.js (NEW), dist/src/model.js, dist/src/ui.js | 공통 난수/검증 분리, 새 계산·판정, 기존 API 재수출 |
| UI | dist/index.html, dist/styles.css, dist/src/app.js, dist/src/investigations.js (NEW) | 6탭, 시드·재현, 세 수사 미션의 조작·원자료·결과·정답 재판정 |
| 검증 | test/statistics.test.js (NEW), tools/check.mjs | 독립 통계 오라클, 정적 참조·경계·인코딩 검사 |
| 문서 | architecture.md, README.md, docs/decisions.md, docs/verification.md | 기존 경계 안의 역할 확장, 생성/추정 가정, D04…D06, LOCAL/NOT_RUN와 QA 전달 |

기존 test/model.test.js, package.json, .gitattributes, 워크플로는 변경하지 않았습니다.

### 최초 배포 전 로컬 검증 / 2026-10-09 / 기존 코드의 역사적 기록

- LOCAL: npm test 4/4 통과. npm run check로 모델/UI 구문, 로컬 자산 참조, 메타데이터, CSP, BOM 여부 통과.
- BROWSER_LOCAL: 축 51에서 높이 비율5배/증가율7.7%, 편향 표본80명, A/B 집계 역전과 동일 조건 변화, 잘못된 횟수 거절.
- RESPONSIVE_LOCAL: 390×844, 320×780에서 페이지 가로 넘침 없음. 현재 검사한 브라우저에서 경고/오류 로그 없음.
- WebMCP_LOCAL: 기능 감지가 되는 브라우저에서 등록된 읽기/조작 도구의 정상 호출과 의도한 잘못된 입력 거절을 확인. 이 기능이 없는 브라우저에서는 일반 UI로 사용합니다.

### 배포 결과의 별도 기록

이 문서는 최초 배포 직전의 로컬 증거입니다. 원격 CI·공개 사이트 증거와 혼동하지 않습니다.
배포 후 커밋별 CI와 공개 URL 확인 결과는 [WEB LAB 종합 검증 기록](https://github.com/HyungminYoon1/web-lab/blob/main/docs/verification.md)에 기록합니다.
이 저장소의 이후 변경은 [Actions](https://github.com/HyungminYoon1/data-mirage/actions)에서 해당 커밋의 결과를 별도로 확인해야 합니다.
