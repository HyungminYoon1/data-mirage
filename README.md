# DATA MIRAGE — 숫자의 착시

[실행](https://hyungminyoon1.github.io/data-mirage/) · [WEB LAB](https://hyungminyoon1.github.io/web-lab/)

축 시작점·표본 추출·집단 합산을 조절해 같은 숫자의 해석이 달라지는 이유를 탐구하는 세 가지 통계 실험입니다.

## 직접 해보기

- 동일한 값의 원본/축 편집본 비교, 실제 증가율 퀴즈
- 가상 200명에서 무작위·고점수·저점수 표본을 중복 없이 추출
- 표본 수와 다시 뽑기, 실제 평균·차이·분포 표시
- 쉬운/어려운 과제 구성 변경으로 심슨의 역설 비교

개인 소개나 계정 없이 사용할 수 있습니다. 새로고침하면 실험 상태가 초기화됩니다.

참고 개념: [원문과 추가 학습](https://seeing-theory.brown.edu/). 구현은 이 저장소의 계산 모델과 UI로 작성했습니다.

## 실행 및 검증

Node.js 22 이상. 외부 패키지는 없습니다.

```sh
npm run dev -- 0
npm test
npm run check
```

main에 푸시하면 검증 후 dist만 GitHub Pages에 배포합니다. 계산 모델과 UI는 분리되어 있습니다. 현재 페이지를 닫으면 실험 상태가 사라지며 서버 업로드·계정·방문자 추적 기능은 없습니다. 호스팅 로그와 앱의 데이터 처리는 별개입니다.

[구조](architecture.md) · [결정 기록](docs/decisions.md) · [검증 기록](docs/verification.md)

AI 에이전트와 함께 제작했습니다. 참고 개념과 원작 링크는 앱 및 설명에 표시하며, 다른 사이트의 코드나 디자인을 복제하지 않습니다. 별도 라이선스는 아직 부여하지 않았습니다.
