# 골드 인테리어 실행 안내

## 변경된 구성
- index.html: 홈페이지 구조와 문구. GoldInterior.html은 index.html로 이동하는 호환용 파일입니다. 기존 Unsplash 이미지와 Photo 원본 폴더는 유지했습니다.
- css/style.css: 홈페이지 사용자 정의 스타일. Tailwind CDN 방식은 유지합니다.
- js/main.js: 기존 견적 문의 전송.
- js/gallery.js: 관리자가 추가한 시공 사진을 홈페이지에 표시.
- admin.html, css/admin.css, js/admin.js: 관리자 로그인, 사진 미리보기, 등록.
- server.mjs: 인증과 사진 저장 API, 홈페이지 제공.
- setup-admin.mjs / setup-admin.ps1: 관리자 최초 계정 생성.
- data/: 실행 시 생성되는 비공개 계정 해시와 사진 데이터. 백업해야 합니다.

## 이 컴퓨터에서 실행
Node.js 22 이상이 필요합니다. 별도 패키지 설치는 없습니다. 프로젝트 폴더에서 PowerShell을 열어 다음 순서로 실행하세요.

가장 쉬운 방법: `node server.mjs`를 실행한 뒤 http://localhost:3000/admin.html 에 접속하세요. 계정이 없으면 최초 계정 생성 화면이 나옵니다. 아이디와 12자 이상의 비밀번호를 직접 정하면 바로 로그인됩니다. 이 기능은 PUBLIC_ORIGIN이 설정되지 않은 로컬 접속에서만 가능합니다.

아래 PowerShell 방식도 사용할 수 있습니다.

1. 최초 한 번 관리자 계정을 만듭니다.

```powershell
.\setup-admin.ps1
```

아이디와 12자 이상의 비밀번호를 입력합니다. 비밀번호 입력은 화면에 표시되지 않습니다. 기본 계정이나 공통 비밀번호는 없습니다. 기존 계정이 있으면 덮어쓰지 않습니다.

2. 서버를 켭니다.

```powershell
node server.mjs
```

3. 브라우저에서 http://localhost:3000 을 엽니다. 하단의 ‘관리자 로그인’ 또는 http://localhost:3000/admin.html 에서 로그인합니다.
4. 사진·제목·설명을 입력하고 ‘홈페이지에 사진 추가’를 누릅니다. 등록 즉시 공개 목록에 추가됩니다. 다른 홈페이지 창은 새로고침해야 표시됩니다.

HTML 파일을 더블클릭해서 열면 서버 기능은 작동하지 않습니다. 관리자 사진은 JPG, PNG, WebP 중 5MB 이하 한 장씩 등록합니다. 기존 사례 교체나 삭제 기능은 이번 범위에 포함하지 않았습니다.

## 실제 gold-interior.com에 적용
도메인은 인터넷 주소이고, 호스팅은 서버 프로그램과 사진을 보관하고 실행하는 공간입니다. 도메인 구매와 별개입니다.

현재 호스팅 상품이나 계정 연결 정보는 확인되지 않았으며 실제 사이트에 배포하지 않았습니다. HTML/CSS/JS만 파일 관리자에 올려서는 관리자 사진 기능이 작동하지 않습니다.

Spaceship의 Hosting Manager에서 사용 중인 Web Hosting 상품과 Node.js 앱 실행 메뉴를 확인해야 합니다. 공식 안내: https://www.spaceship.com/en-GB/knowledgebase/category/web-hosting/

서버 배포 담당자가 설정할 항목:
- Node.js 22 이상, 시작 파일 server.mjs, 프로젝트 작업 디렉터리를 앱 루트로 지정.
- PUBLIC_ORIGIN=https://gold-interior.com (www 주소를 사용한다면 그 주소와 정확히 일치하게 설정하고 다른 주소는 해당 주소로 리디렉션).
- PORT는 호스팅에서 지정한 값 사용. 필요할 때 HOST 설정. 서버는 기본으로 로컬 인터페이스에서만 수신합니다.
- DATA_DIR는 웹 공개 폴더 밖에 있는 영구 저장 경로로 설정. 계정 생성과 서버 실행에서 같은 경로 사용.
- 관리자 계정은 배포 서버에서 ADMIN_USER / ADMIN_PASSWORD를 안전한 환경 변수로 지정한 뒤 node setup-admin.mjs를 한 번 실행하고 비밀번호 환경 변수 제거. 비밀번호를 HTML이나 JS에 적지 않습니다.
- HTTPS 적용. 앱 루트 전체를 정적 공개하지 말고 Node 앱을 통해 요청을 처리해야 합니다. data/admin.json은 웹으로 공개하면 안 됩니다.
- data 폴더 전체를 백업하고 재배포 시 보존. 업로드 개수 제한은 없으므로 디스크 용량을 관리하세요.
- 단일 Node 프로세스 기준입니다. 세션과 로그인 시도 제한은 메모리에 있고 서버 재시작 시 로그아웃됩니다. 여러 프로세스 운영에는 공용 세션/제한 저장소가 추가로 필요합니다.

## 검사
```powershell
node --test server.test.mjs
```
테스트는 임시 계정과 임시 사진으로 실행되며 종료 후 정리합니다. 로그인 성공/실패, 비로그인 업로드 차단, 외부 Origin 차단, 허용하지 않은 파일 차단, 사진 파일·설명 저장과 공개 조회, 비공개 계정 파일 접근 차단, 로그아웃 후 접근 차단을 확인합니다.

실제 브라우저 화면·모바일 배치, 실제 호스팅 환경, 실제 문의 메일 수신은 별도 확인이 필요합니다.

## 사진 교체
[사진 교체 안내](PHOTO-GUIDE.md)를 참고하세요. VS Code에서 index.html과 css/style.css를 수정하면 됩니다.
