# 설명 과제 근거 · 2026-10-13

curriculum.js의 CASES 9개는 자체 제작한 작은 계산/해석 과제입니다. 문제나 해설 원문을 복제하지 않았습니다. 자료는 가상이며 실제 사회·의료 자료가 아닙니다.

- 평균/분산 합치기, 사전 비율, 표본평균, 사후 예측, 경험분포: [MIT 18.05 Readings](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/resources/readings/), 관련 Reading 3/5a/6b/15/24. 목록과 관련 원문 자료를 확인했습니다. A/B 네 숫자, 두 센서 풀, Beta(2,2), [0,2] 전수 표본은 직접 구성하고 유한 합/적분으로 검산했습니다.
- 공분산 0과 독립: [Reading 7b PDF](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/mit18_05_s22_class07-prep-b.pdf), p1의 항등식과 p3의 비선형 의존 원리. 자체 사례는 세 점 −1/0/1에서 공동/조건부 확률을 전수 계산했습니다.
- 평균의 신뢰구간과 새 관측의 예측구간: [Reading 22 PDF](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/mit18_05_s22_class22-prep.pdf). 알려진 σ의 정규 iid 모형에서 새 관측과 표본평균의 차이 분산을 합산합니다. 1.96은 문제에서 지정한 근삿값입니다.
- 경계 추정: [MIT 18.655 강의](https://ocw.mit.edu/courses/18-655-mathematical-statistics-spring-2016/pages/lecture-notes/), 최대우도/정칙성 단원. Uniform 최댓값의 CDF=(m/θ)^n에서 적률을 적분해 자체 사례를 검산했습니다.
- 위험 비교: [Decision Theoretic Framework PDF](https://ocw.mit.edu/courses/18-655-mathematical-statistics-spring-2016/413f5097d687e26407e4634a374ed375_MIT18_655S16_LecNote4.pdf), p18의 조건부 기대손실 정의. 고정 수축 w=1/2의 위험 함수와 두 참값은 직접 계산했습니다.

단원 링크는 개념 원문이며 작성된 한국어 사례의 원저자를 MIT로 표시하지 않습니다. 교재 전체·전문가 교육 검토나 공인 시험 난이도 인증은 수행하지 않았습니다. 수치 정답의 기존 독립 검산은 test/problem-bank.test.js, 실험 검산은 test/statistics.test.js에서 유지합니다.
