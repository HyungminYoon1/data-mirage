# Decisions

## D01 — Static, independent implementation

- Context: the user approved implementing all six proposed services and adding them to WEB LAB.
- Options: merge into existing services; backend/Sites hosting; independent static Pages repositories.
- Decision: independent data-mirage repository and public GitHub Pages, pure model separated from rendering, no dependencies or new paid services.
- Rationale: fits the current collection, keeps other releases untouched, supports local model verification.
- Affected: architecture.md, dist, test, tools and .github/workflows/pages.yml.
- Review: additions requiring server state or different hosting need a separate decision.

## D02 — Transient, bounded browser state

- Context: these experiments need configuration, not user accounts or retained visitor records.
- Options: server upload/analytics/history; transient browser memory and deliberate local output.
- Decision: no stored visitor state or uploaded data. Bound all controls and model work. Pixel imports, when applicable, never leave the browser; reject unsupported/oversized files and cap decoded work.
- Rationale: privacy and predictable resource use; no API credential or personal profile required.
- Affected: dist/src/model.js, dist/src/app.js, dist/index.html and optional WebMCP summaries.
- Review: do not add hidden persistence or make medical/real-traffic/benchmark claims from these models. Use GitHub noreply identity for commits.

## D03 — 계산과 조작의 경계

- Context: 설명만 표시하는 데 그치지 않고 조작한 조건에서 실제 결과를 계산해야 합니다.
- Options: 고정 애니메이션/결과 문구; 범위를 제한한 순수 모델과 동일 상태를 읽는 UI.
- Decision: 외부 통계나 개인 자료 대신 명시된 예제 값과 시드 기반 가상 점수를 사용합니다. 합산은 성공 횟수÷총 시도로 계산하며 조건별 분모를 표시합니다. 피드백은 현재 계산 결과에서 생성하고 표본은 중복 없이 추출합니다.
- Rationale: 재현 가능한 검사와 읽을 수 있는 결과를 제공하고 브라우저 자원 사용을 제한합니다.
- Affected: dist/src/model.js, dist/src/app.js, dist/index.html, dist/styles.css and test/model.test.js.
- Review: 가상 집단의 점수는 실제 사회 집단을 설명하지 않습니다. 새로운 사례에는 데이터 출처와 생성 규칙을 함께 제공해야 합니다.

## D04 — 정확 검정과 제한된 반복 탐색 / 2026-10-09

- Context: 세 가지 기초 사례를 넘어, 실제 관측과 분석 규칙으로 선택적 중단·다중 비교를 조사하는 LOCAL ONLY 업그레이드가 승인되었습니다.
- Options: 결과 라벨만 보여주기; 정규근사 p와 무제한 탐색; 유한한 0/1 관측·정확 이항 꼬리확률·미리 정한 검정 가족.
- Decision: 최대 12지표 × 80관측, 20·40·60·80회 관찰 또는 최종 시점만 검사합니다. 같은 원자료에서 각 5% 문턱/Bonferroni를 교차 비교하고, 별도 160회 반복을 계산합니다. 첫 발견 시 같은 시점의 모든 지표를 확인한 후 중단합니다. H0 세계는 모든 지표 p=.5, 신호 세계는 지표 1만 p=.65입니다. 보정 분모는 실제 수행 개수가 아닌 사전 계획 지표 수 × 시점 수입니다.
- Rationale: 연속 시점의 의존성을 숨기지 않으며 합집합 상계로 가족 거짓 양성 확률을 제한할 수 있습니다. 정확 이항 검정은 작은 표본/이산성에서 근사 오차를 피합니다. 신호 세계의 전체 기각률을 ‘진짜 효과를 발견한 확률’로 오인하지 않게 표시합니다.
- Affected: dist/src/statistics.js, dist/src/investigations.js, dist/index.html, test/statistics.test.js, README.md.
- Review: 4개 고정 시점 이외의 연속 탐색/사후 지표 선택을 추가하면 검정 가족과 보장 설명을 재검토해야 합니다. 시드 기반 반복 빈도는 확률 보장의 증명이 아닙니다. 브라우저 성능/표시 QA는 NOT_RUN입니다.

## D05 — 상관의 반례와 보수적 구간 / 2026-10-09

- Context: 정답 개념 라벨이 아니라 조건을 바꿔 통계적 결론의 취약성을 조사해야 합니다. 실제 사회·의료 데이터를 꾸며 넣지 않습니다.
- Options: 외부 관측 데이터; 직관적인 폭 애니메이션; 정규근사/Wilson 구간; 명시적 유한 생성 자료와 Hoeffding 경계.
- Decision: 상관은 24점의 두 생성 세계(12+12 집단 위치 차이, 23+1 영향력 관측)를 제공합니다. 전체/집단 중심화/24번 제외 및 모든 한 점 제외 상관을 계산합니다. 단일 점 집단의 r는 미정의입니다. 구간은 200개 토큰의 120개 성공, 전체 200개 또는 앞 140개에서 20/80/200회 균등 복원 추출합니다. α=.10/.05/.01의 Hoeffding 구간을 [0,1]로 절단하고 160회 전체 목표 포함률을 계산합니다. 시각화는 첫 40구간, 전체 표는 160회임을 명시합니다.
- Rationale: 두 종류의 상관 반례를 구별하고, 삭제 민감도를 임의 데이터 제거의 허가로 바꾸지 않습니다. Hoeffding은 표본 독립성과 범위 [0,1]에서 엄밀한 보수적 경계를 제공합니다. 편향 풀의 120/140 평균과 목표 120/200을 분리하면 표본 수·정밀도·타당도의 차이를 실험할 수 있습니다.
- Affected: dist/src/statistics.js, dist/src/investigations.js, dist/index.html, dist/styles.css, test/statistics.test.js, README.md.
- Review: 이 중심화는 인과 효과 추정이 아닙니다. 구간 보장은 선택 풀 평균에 대한 반복 표집 속성이며 단일 구간의 사후확률이 아닙니다. 비복원 구간이나 실제 데이터 도입에는 별도 계산/자료 검토가 필요합니다.

## D06 — 시드 재현·순수 모듈·일시 상태 / 2026-10-09

- Context: 매 실험의 무작위성, 재현 가능한 테스트, 기존 계산/UI 경계 및 저장·네트워크 부재를 함께 유지해야 합니다.
- Options: Math.random만 사용; 저장소에 실험 이력 보존; 순수 모델의 UI helper 의존 유지; 브라우저 시드 선택 + 순수 재현 계산 + 페이지 메모리 캐시.
- Decision: 새 실험마다 crypto.getRandomValues의 uint32 시드를 선택하고 1…4294967295를 표시/검증합니다. 계산은 기존 LCG 규칙을 순수 math.js로 옮겨 재현합니다. model.js/statistics.js는 UI를 import하지 않습니다. 새 미션 UI는 investigations.js, 전체 생명주기는 app.js가 담당합니다. 같은 시드에서 조건 변경은 원자료를 재사용하고 지표/표본 확대는 관측 접두부를 유지합니다. 기존 ‘다시 뽑기’도 공통 시드를 새로 정하며 축·집계는 그대로 유지합니다. 시드 재현은 제어값을 초기화하지 않습니다. 미션 결과는 방문 시 계산하고 캐시하며 새 시드/조건에서 무효화합니다. 답은 현재 조건에서 다시 판정합니다. 기존 페이지 범위 WebMCP는 동일 검증 함수만 호출하도록 확장합니다.
- Rationale: 계산/UI 분리를 더 분명히 하고 브라우저·Node 양쪽에서 같은 순수 결과를 사용합니다. 이력·시드·응답은 페이지 메모리만 사용하며 상태 보존을 위한 저장소·백엔드·외부 호출을 추가하지 않습니다. 자원 사용은 유한한 생성/반복 크기로 제한됩니다.
- Affected: architecture.md, dist/src/math.js, dist/src/model.js, dist/src/ui.js, dist/src/statistics.js, dist/src/investigations.js, dist/src/app.js, tools/check.mjs, test/statistics.test.js, docs/verification.md.
- Review: LCG는 보안용 난수가 아니며 이상적인 독립 표집의 수학적 보장을 시뮬레이션 자체가 증명하지 않습니다. 캐시는 새 시드/설정마다 교체되고 페이지가 닫히면 사라집니다. 저장/서버/외부 API 도입은 별도 승인 범위입니다. 이번 작업은 단일 에이전트·지정 저장소만 변경하며 커밋/푸시/배포/다른 에이전트 호출을 하지 않습니다. WebMCP·브라우저 런타임 검증은 별도 담당 QA에 남깁니다.
