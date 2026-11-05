# VS Code에서 사진 바꾸기

홈페이지 본문은 `index.html`입니다. `GoldInterior.html`은 예전 파일명으로 접속하는 경우를 위한 이동용 파일입니다.

## 사진 파일 준비
`Photo` 폴더의 기존 사진은 그대로 보존했습니다. 추가할 사진도 이 폴더에 넣으세요. 파일명은 `living-room.jpg`처럼 영문·숫자·하이픈을 사용하면 편합니다. 로컬 Node 서버는 JPG, JPEG, PNG, WebP 사진을 제공합니다.

## 화면별 교체 위치
| 사진 위치 | 수정할 파일 | 찾을 내용 |
| --- | --- | --- |
| 맨 위 대형 배경 | css/style.css | .hero-background 의 background-image |
| 회사 소개 사진 | index.html | alt="인테리어 디자인 작업" 위쪽 src |
| 시공 사례 첫 번째 | index.html | alt="Project 1" 위쪽 src |
| 시공 사례 두 번째 | index.html | alt="Project 2" 위쪽 src |
| 시공 사례 세 번째 | index.html | alt="Project 3" 위쪽 src |

HTML 사진은 기존 `src="https://images.unsplash.com/..."` 부분을 다음처럼 바꿉니다.

```html
src="./Photo/living-room.jpg"
```

CSS 배경은 CSS 파일이 css 폴더 안에 있으므로 한 단계 위의 Photo 폴더를 가리킵니다.

```css
.hero-background {
  background-image: url("../Photo/living-room.jpg");
}
```

사진 아래 제목과 설명도 index.html에서 함께 바꾸면 됩니다. 사진의 `alt` 문구도 실제 사진 설명으로 수정해 주세요.

## 확인과 GitHub 반영
1. VS Code에서 저장합니다(Ctrl+S).
2. 서버 실행: 프로젝트 폴더 터미널에서 `node server.mjs`.
3. http://localhost:3000 에서 새로고침합니다.
4. VS Code 왼쪽 소스 제어에서 변경 사항 확인 → 커밋 → 동기화합니다. GitHub 로그인 요청이 나오면 본인 계정으로 로그인하세요.

코드에서 교체한 Photo 폴더 사진은 GitHub에 포함됩니다. 관리자 화면에서 등록한 사진은 비공개 data 폴더에 저장되어 GitHub에 포함되지 않습니다. 관리자 계정과 등록 사진을 실제 도메인에서 사용하려면 Node 서버 배포가 별도로 필요합니다. GitHub Pages 같은 정적 호스팅만으로는 관리자 API를 실행할 수 없습니다.
