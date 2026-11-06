# VS Code에서 사진 바꾸기

홈페이지 본문은 `index.html`입니다. `GoldInterior.html`은 예전 파일명으로 접속하는 경우를 위한 이동용 파일입니다.

## 사진 파일 준비
`Photo` 폴더의 기존 사진은 그대로 보존했습니다. 추가할 사진도 이 폴더에 넣으세요. 파일명은 `living-room.jpg`처럼 영문·숫자·하이픈을 사용하면 편합니다. 로컬 Node 서버는 JPG, JPEG, PNG, WebP 사진을 제공합니다.

## 화면별 교체 위치
| 사진 위치 | 수정할 파일 | 찾을 내용 |
| --- | --- | --- |
| 맨 위 대형 사진 | index.html | class="hero-image"의 src와 alt |
| 회사 소개 사진 | index.html | class="about-image" 안의 img |
| 기본 공간 사진 3장 | index.html + js/gallery.js | data-space="wood / green / white" 카드와 같은 키의 상세 데이터 |
| 관리자가 등록한 시공 사례 | /admin.html | 사진 1~8장 등록 및 정보 수정 |

HTML 사진은 해당 img의 src를 다음처럼 바꿉니다.

```html
src="./Photo/living-room.jpg"
```

첫 화면 사진은 CSS 배경이 아니라 img입니다. 크기가 다르면 width/height도 실제 비율에 맞추세요. 공유 미리보기 사진은 index.html의 og:image에서 별도로 수정합니다.

기본 카드의 사진·제목·설명을 바꾸면 js/gallery.js의 해당 키 데이터도 함께 수정해야 상세 보기와 일치합니다. 사진의 alt 문구도 실제 사진 설명으로 수정해 주세요. 서로 다른 현장 사진을 하나의 시공 사례로 묶거나 확인되지 않은 지역·평수를 기재하지 마세요.

## 확인과 GitHub 반영
1. VS Code에서 저장합니다(Ctrl+S).
2. 서버 실행: 프로젝트 폴더 터미널에서 `node server.mjs`.
3. http://localhost:3000 에서 새로고침합니다.
4. 변경 내용을 확인합니다. 체크인·커밋·동기화는 실제 연결 방식을 확인한 뒤 사용자가 원할 때 별도로 진행합니다.

코드에서 교체한 Photo 폴더 사진은 GitHub에 포함됩니다. 관리자 화면에서 등록한 사진은 비공개 data 폴더에 저장되어 GitHub에 포함되지 않습니다. 관리자 계정과 등록 사진을 실제 도메인에서 사용하려면 Node 서버 배포가 별도로 필요합니다. GitHub Pages 같은 정적 호스팅만으로는 관리자 API를 실행할 수 없습니다.

## 메인 사진 슬라이드 (3~5장)
index.html에서 `hero-slides`를 검색하세요. 그 안의 img 5개가 첫 번째부터 다섯 번째 사진입니다. 각 src와 alt를 원하는 사진으로 변경하세요. 현재 main-01.jpg부터 main-05.jpg까지 연결되어 있습니다.

4장 또는 5장을 쓰려면 두 번째 img 줄을 복사해 hero-slides 내부에 추가하고 경로를 바꾸세요. 추가 사진에는 is-active 클래스나 fetchpriority="high"를 넣지 않습니다. width/height는 실제 사진 비율에 맞추세요.

5초 간격은 js/hero-slider.js의 `5000`에서 변경할 수 있습니다(밀리초). 사진 위에 마우스를 올리거나 키보드 초점이 들어오면 잠시 멈춥니다. 다른 탭을 보는 동안에도 멈추며, 기기의 동작 줄이기가 설정되어 있으면 자동 전환 없이 시작합니다.

## 현재 사진 연결 및 관리자 갤러리
메인 사진은 Photo/main-01.jpg ~ main-05.jpg 다섯 장입니다. main005.jpg는 main-05.jpg로 이름을 맞췄습니다. 회사 소개는 about.jpg, 기본 공간 사진은 space-wood.jpg / space-green-01.jpg / space-white.jpg입니다.

로컬 서버를 `node server.mjs`로 실행하고 /admin.html에서 로그인한 다음 사진 1~8장과 제목을 등록하세요. 홈페이지 상단 메뉴의 시공 사진을 누르면 시공 사진 모아보기(#photo-gallery)로 이동합니다. 카드를 누르면 해당 사례의 전체 사진이 열리고, 사례가 6개보다 많으면 사진 더 보기가 표시됩니다. 기존 홈페이지를 열어둔 경우 새로고침하세요.

이 관리자 등록 기능은 현재 Node 서버의 data 폴더에 저장합니다. Vercel 정적 배포에는 관리자 API와 온라인 저장소를 별도로 연결해야 합니다. GitHub 업로드만으로 이 컴퓨터의 등록 사진이 Vercel로 전송되지는 않습니다.
