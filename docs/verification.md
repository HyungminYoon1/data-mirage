# Verification

## 2026-10-10 개념·문제 중심 통계 학습 — LOCAL

- SOURCE VERIFIED: architecture/README/decisions, 기존 여섯 실험·풀이·두 키 progress 경계, 새 curriculum/problem-bank/study-ui와 테스트·정적 검사를 검토했습니다. MIT OCW 18.05/18.443/18.655 읽기/강의 자료를 연결하고 한국어 규칙·예제·문제를 자체 작성했습니다. 시험 원문을 복사하거나 수능 난이도 검증을 받았다고 주장하지 않습니다.
- LOCAL: 43/43 tests PASS, 16 public/29 UTF8-noBOM-CRLF text files 정적 검사 PASS, git diff --check PASS. 24유형×64 seeds의 결정성/문제 변형/모든 두 답, 안전 수치·분수 파서/첫 답 종료/반올림, hypergeometric·binomial 독립 합계, 결합 2차 모멘트, censored MLE, Beta predictive variance, Rao–Blackwell, Fisher/변환 CRLB, bootstrap 유한 전수, 우도비·위험·최적 배분의 별도 계산을 검사했습니다. 회귀 답은 실제 표시된 반올림 Syy에서 계산합니다.
- ACTUAL BROWSER: 18개 개념 확인과 24유형의 실제 무작위 두 답 입력/채점, 1/0 거절 후 입력 유지, 첫 유효 답의 시도 종료, 새 조건, 여섯 기존 보조 실험/학습 복귀를 확인했습니다. 새 학습/문제/노트는 페이지 메모리만 쓰며 기존 자체 완료 두 ID와 다른 앱 요약이 그대로 유지되었습니다. QA는 원래 crypto RNG의 실제 seed를 관측했으며 고정·대체 시드나 승리/채점 상태를 주입하지 않았습니다. desktop1440/mobile390/320 root overflow와 관측된 page errors 0. 새 미리보기는 새로고침한 0/18 실제 화면입니다.
- PARTIAL / NOT_RUN: 기초·대학·수리통계·대학원 입문은 학습 경로이지 전 과정/정규 과목 인증이 아닙니다. 정확식/근사식/점근 가정·표본/모집단 분산 구분을 문제에 표시합니다. 독립 교육/수학 전문가 검토와 실제 수험생 난이도 측정, 모든 기기·브라우저 검증은 NOT_RUN. 기존 완료 총수6을 늘리거나 기존 기록을 새 18개 확인/24유형으로 오해하지 않습니다. REMOTE_CI/LIVE는 별도 확인합니다. QA는 ignored output/playwright/2026-10-10-improvements에 있습니다.

## Scope

data-mirage: model source and focused tests, static asset/syntax checks, browser interaction, remote workflow and public site are separate evidence levels. Existing unrelated services remain outside this change.

## Evidence

### 용어·현재 자료 해석·완료 요약 / 2026-10-09 / LOCAL

- Sources VERIFIED: 지정 data-mirage의 architecture.md > README.md 및 docs/decisions.md를 수정 전에 전체 읽었습니다. api-spec.md/requirements.md는 인벤토리에 없습니다. 기존 dist의 여덟 파일, 기존 두 테스트, tools의 두 파일, package.json, .gitattributes, .gitignore, 워크플로, 이 검증 기록을 전체 검토했습니다. 시작 git status는 깨끗하며 기준 HEAD는 fa09407입니다. 사용자 제공 AGENTS 지침을 적용했습니다.
- Sources PARTIAL: 상위 실험 디렉터리는 15개 서비스 ID의 이름 확인만 했습니다. 서비스 내부 검토로 취급하지 않습니다. web-lab와 기타 서비스의 파일은 NOT_INSPECTED이며 수정하지 않았습니다. .git 내부는 상태/기준 커밋 확인 외에는 검사하지 않았습니다.
- LOCAL: npm test **33/33 PASS**. 기존 15개 통계/기초 모델 테스트와 파일을 그대로 유지했습니다. 새 18개는 현재 수치에 따른 해석·조건 전환·단일 신호 지표 경계, 모든 반복 원자료/계산의 재현, 최대 내보내기, 여섯 문제의 표시 근거에서 독립 계산한 해답/오답·첫 시도 종료·중복 완료·숫자/시드/범위 거절, 15-ID 저장 경계·다른 앱 보존·자체 삭제·손상값/초과값/저장 차단/할당량/부분 성공을 검사합니다.
- LOCAL: npm run check **PASS**. 공개 파일 12개, UTF-8/no BOM/CRLF 텍스트 25개. 기존 네트워크/CSP/참조/모델 경계를 유지합니다. D08의 승인된 예외는 progress.js의 두 키뿐이며 다른 파일의 저장소 호출, 세션 저장소/IndexedDB/쿠키/런타임 네트워크는 계속 금지합니다. 새 순수 모듈의 UI/저장소 의존도 검사합니다.
- LOCAL: git diff --check **PASS**. 기존 model.js/math.js, 기존 두 테스트, package.json, .gitattributes, 워크플로는 변경하지 않았습니다. statistics.js의 변경은 현재 포함 확률 %와 선택 풀 피드백 문구 두 곳뿐입니다.
- LOCAL model evidence (seed 42): 6지표/차이 없음/4시점/각 5%의 현재 피드백은 지표 5의 15/20, p=0.04139, 동일 자료 최종/보정의 기각 없음, 79/160, 실제 수행 6회와 사전 가족 24회 차이를 표시합니다. 가족 보정 설정에서는 3/160으로 바뀝니다. 상관 한 점 사례의 가장 큰 변화는 24번 제외 r≈−0.972이며 단독 집단의 r는 미정의입니다. 편향 풀/200회/95%는 선택 풀 포함 160/160, 전체 목표 포함 0/160, 대상 차이 0.257, 절단 전 반폭 0.096입니다.
- LOCAL export evidence: seed 4294967295의 최대 12지표 검정 JSON은 **1,073,585 bytes**, 200회 구간 JSON은 **698,042 bytes**입니다. 두 경우 모두 전체 근거를 유지하면서 4 MiB 제한을 만족합니다. 최초 테스트는 들여쓰기 JSON 4,650,190 bytes의 초과를 잡았으며, 데이터 삭제 없이 compact JSON으로 수정했습니다. 160개 모든 반복의 원자료/계산 재현과 직렬화 전후 일치 테스트가 통과합니다.
- BROWSER_LOCAL / RESPONSIVE_LOCAL / ACCESSIBILITY_LOCAL / DOWNLOAD_LOCAL / GALLERY_LOCAL / WebMCP_LOCAL: **NOT_RUN for this change**. 아래 흐름은 메인 담당자의 실제 브라우저 검증/캡처용입니다. Node 모델 및 대체 저장소 테스트는 브라우저 저장이나 갤러리 통합 실행 증거가 아닙니다.
- REMOTE_CI / LIVE / DEPLOY: **NOT_RUN**. 커밋·푸시·프로비저닝·계정 접근·네트워크/AI 채점·랭킹·다른 에이전트 호출을 하지 않았습니다.

#### 실제 화면 캡처와 상호작용 전달

1. 저장소에서 `npm run dev -- 0`을 실행하고 출력한 루프백 URL을 엽니다. 첫 방문의 별도 문제 기록은 0/6이어야 하며 실험 탭 방문, 정의 펼치기, 기존 판단 답 선택만으로 완료가 늘지 않아야 합니다. 갤러리 요약은 `web-lab-progress-v1`; 자체 ID는 `data-mirage-achievements-v1`입니다. 두 앱을 다른 포트에서 열면 origin이 달라 요약이 공유되지 않습니다. 통합 QA는 동일 origin에서 수행하세요.
2. 시드 입력에 **42**, `이 시드로 재현`. **04 / 검정**: 지표 **6**, 성공확률 **0.5**, **20·40·60·80회**, **각 검정 p≤0.05**. `p값과 검정 가족`을 펼칩니다. 패널 제목이 화면 위에 오도록 스크롤하고 제어값, 24검정, 79/160, 동일 자료 비교 피드백/규칙 표가 함께 보이는 1440×1000 또는 전체 페이지 화면을 캡처합니다. 가족 보정으로 변경하면 3/160, 기각 없음이 됩니다. 판단의 `단일 검정` 답을 고른 뒤 지표 1·최종 시점으로 바꾸면 현재 조건의 판정도 바뀌어야 합니다.
3. **05 / 상관**: `23개 관측 + 영향력 큰 한 점`, `24번 관측만 제외`. 상관 정의를 펼치고 23점 산점도, 전체 r≈0.756/현재 r≈−0.972, 가장 큰 제외가 24번이라는 피드백을 캡처합니다. 두 집단 조건/중심화로 변경하면 각 12점과 중심화 r≈−0.905로 바뀝니다. 인과 결론으로 표시되지 않아야 합니다.
4. **06 / 구간**: **200회**, **앞 140개**, **95%**. 정의를 펼치고 구간 그림·목표 포함 0/160·선택 풀 포함 160/160 피드백을 캡처합니다. 전체 풀로 변경하면 목표 포함 158/160으로 바뀝니다. 20회/99%로 변경하면 반폭이 풀과 목표의 차이를 덮을 수 있다는 다른 설명이 나와야 합니다.
5. 검정/상관/구간의 `실험 JSON 내려받기`를 각각 클릭합니다. 파일 이름은 `data-mirage-{mission}-42.json`, 본문 seed는 42이며 현재 설정과 일치해야 합니다. 검정의 replications 160개 모두에 dataset/assessment, 구간의 result.replications 160개 모두에 전체 draws, 상관의 24점/24개 제외 결과를 확인합니다. 실제 다운로드 성공 여부와 콘솔/CSP 오류는 브라우저에서 확인해야 합니다.
6. 별도 문제는 실험 시드와 별개의 새 자료입니다. **05 / 상관**에서 아래 `현재 항목의 새 문제`를 클릭하고 표시된 비교 r의 부호에 따라 **−1**을 직접 입력, `답 확인`. 최초 정답이면 1/6이 됩니다. 같은 항목의 새 문제 정답은 추가 개수를 만들지 않습니다. 새로고침 뒤 1/6과 실제 개수 요약을 확인하고 이 문제/답/시드가 저장에 포함되지 않았는지 확인합니다. 점수나 완료 값을 개발자 도구로 주입하지 않습니다.
7. 다른 미완료 항목의 새 문제에서 **999**를 입력하면 오답과 계산식이 표시되고 입력/답 확인이 닫히며 완료가 늘지 않습니다. 새 문제를 시작해 아래 식으로 푼 뒤 첫 답을 제출합니다. 빈 입력·NaN·1001은 오류이며 다시 숫자를 제출할 수 있어야 합니다. `이 앱의 기록 지우기`는 자체 0/6과 자체 요약 제거만 수행하고 다른 앱 요약은 남겨야 합니다. 저장 차단 환경에서도 실험은 동작하고 정답 후 저장 실패를 안내해야 합니다.
8. Tab으로 정의의 summary에 이동해 Enter/Space로 열고 닫습니다. 여섯 탭은 방향키/Home/End로 이동합니다. 320/390px에서 음수 입력, 표/범례/피드백, 가로 넘침을 확인합니다. 지원/미지원 WebMCP는 기존 조작 경로를 별도로 검증합니다.

| 별도 문제 | 화면의 실제 근거로 계산하는 해답 |
| --- | --- |
| 축 | `(마지막−처음)/처음×100`, 소수 첫째 자리 |
| 표본 | 표시된 `표본 평균−모집단 평균`, 부호 포함 소수 첫째 자리 |
| 합산 | `(A 전체 성공/90−B 전체 성공/90)×100` %p, 소수 첫째 자리 |
| 검정 | `0.05/(지표 수×계획 시점 수)`, 소수 넷째 자리 |
| 상관 | 표시된 비교 r가 음수이면 −1, 0이면 0, 양수이면 1 |
| 구간 | `120/선택 풀 크기×100` %, 소수 첫째 자리; 포함 확률 %와 구분 |

#### 변경 경로 17개

- 순수 모델 추가: dist/src/interpretation.js, dist/src/exercises.js.
- 저장 경계 추가: dist/src/progress.js. UI 추가: dist/src/exercise-ui.js.
- UI/피드백 수정: dist/index.html, dist/styles.css, dist/src/app.js, dist/src/investigations.js, dist/src/statistics.js.
- 검증 추가/수정: test/interpretation.test.js, test/exercises.test.js, test/progress.test.js, tools/check.mjs.
- 문서: architecture.md, README.md, docs/decisions.md (D07/D08), docs/verification.md.

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
