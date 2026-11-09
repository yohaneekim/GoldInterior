# 사진과 설명 직접 수정하기

## 기본 사진
사진은 Photo 폴더에 넣습니다. 원본 확장자를 유지하고 영문·숫자·하이픈 파일명을 권합니다.

| 화면 | 수정 위치 |
| --- | --- |
| 메인 슬라이드 5장 | index.html에서 hero-slides 검색. img의 src와 alt 수정 |
| 대표 소개 사진·문구·연혁 | index.html에서 about-image 또는 representative-title 검색 |
| 기본 사례 카드 3개 | index.html에서 data-space="wood", "green", "white" 검색 |
| 기본 사례 상세 사진·설명 | js/gallery.js 맨 위 spaces 목록 |
| 추가 시공 사례 | js/gallery.js에서 additionalSpaces 검색 |

기본 카드와 상세 보기 정보는 두 곳을 함께 수정해야 합니다. 메인 사진은 현재 main-02.jpg → main-01.jpg → main-03.jpg → main-04.jpg → main-05.jpg 순서입니다. 자동 넘김 간격은 js/hero-slider.js의 5000(5초)입니다.

HTML 사진 경로 예:
```html
<img src="/Photo/project-04.jpg" alt="실제 사진의 설명">
```

## 추가 시공 사진 모아보기
js/gallery.js의 `const additionalSpaces = [];` 안에 사례를 추가하세요.

```js
const additionalSpaces = [
  {
    id: 'project-04',
    title: '새로운 시공 사례',
    description: '사진과 공간에 대한 설명',
    region: '확인된 시공 지역',
    size: '확인된 평형',
    url: '/Photo/project-04-01.jpg',
    images: ['/Photo/project-04-01.jpg', '/Photo/project-04-02.jpg'],
    captions: ['첫 번째 사진 설명', '두 번째 사진 설명']
  }
];
```

예시 파일명은 직접 넣을 사진에 맞춰 변경하세요. id는 사례마다 다르게 정합니다. url은 카드 대표 사진이며 images는 상세 보기 순서, captions는 각 사진 설명입니다. 지역·면적·공사 기간은 확인한 정보만 적으세요. 사례는 6개씩 표시되고 더 보기로 이어집니다. 목록이 비어 있으면 준비 중 안내가 표시됩니다.

## 현재 확인된 사례와 원본
- wood: 마포구 중식당 진선 75평형. space-wood-clean.png는 천장 흰 페인트 자국을 자연스럽게 제거한 AI 보정본이며 원본 space-wood.jpg를 보존했습니다.
- green: 신림동 노래바 45평형. space-green-01.jpg.
- white: 관악구 서울대입구 인근 이편한세상 45평형. space-white.jpg.

## 확인하고 올리기
1. VS Code에서 수정 후 Ctrl+S로 저장합니다.
2. 프로젝트 터미널에서 node server.mjs를 실행합니다.
3. http://localhost:3000 에서 화면과 사진 클릭을 확인합니다.
4. 소스 제어에서 변경 파일을 확인하고 스테이징 → 커밋 → 동기화합니다.
5. Vercel 배포 완료 후 실제 홈페이지를 새로고침합니다.

계정과 온라인 사진 저장소는 사용하지 않습니다. 과거 로컬 data/ 데이터는 보존하되 홈페이지에서는 사용하지 않습니다. 사진 원본을 지우거나 data 폴더 전체를 GitHub에 올리지 마세요.
