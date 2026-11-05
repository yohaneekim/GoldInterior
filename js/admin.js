const setup = document.getElementById('setup-form');
const login = document.getElementById('login-form');
const manager = document.getElementById('manager');
const status = document.getElementById('status');
const upload = document.getElementById('upload-form');
let previewURL;
async function api(path, data) {
 const response=await fetch(path, data ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(30000)} : {signal:AbortSignal.timeout(15000)});
 let result;
 try { result=await response.json(); } catch { throw new Error('관리자 API에 연결되지 않았습니다. node server.mjs로 실행한 http://localhost:3000/admin.html 주소인지 확인해 주세요.'); }
 if(!response.ok) { if(response.status===401) show(false); throw new Error(result.error || '처리하지 못했습니다.'); }
 return result;
}
function show(authenticated, setupRequired=false) { setup.hidden=!setupRequired; login.hidden=authenticated || setupRequired; manager.hidden=!authenticated; }
async function list() {
 const photos=await api('/api/photos'); const container=document.getElementById('photos'); container.replaceChildren();
 if(!photos.length) container.textContent='아직 추가한 사진이 없습니다.';
 for(const photo of photos) { const card=document.createElement('article'); const img=document.createElement('img'); img.src=photo.url; img.alt=photo.title; img.loading='lazy'; const title=document.createElement('h3'); title.textContent=photo.title; const description=document.createElement('p'); description.textContent=photo.description; card.append(img,title,description); container.append(card); }
}
setup.addEventListener('submit',async e=>{
 e.preventDefault();const button=setup.querySelector('button');button.disabled=true;
 try {
 if(setup.elements.password.value!==setup.elements.confirm.value) throw new Error('비밀번호 확인이 일치하지 않습니다.');
 const credentials={username:setup.elements.username.value.trim(),password:setup.elements.password.value};
 await api('/api/setup',credentials); setup.reset(); show(false); status.textContent='계정이 생성되었습니다. 로그인 중입니다…';
 await api('/api/login',credentials);show(true);status.textContent='관리자 계정을 만들고 로그인했습니다.';await list();
 }catch(err){status.textContent=err.message;}finally{button.disabled=false;}
});
login.addEventListener('submit',async e=>{e.preventDefault(); const button=login.querySelector('button'); button.disabled=true; try {await api('/api/login',Object.fromEntries(new FormData(login))); login.reset(); show(true); status.textContent='로그인했습니다.'; await list();} catch(err){status.textContent=err.message;} finally{button.disabled=false;} });
document.getElementById('logout').addEventListener('click',async()=>{try{await api('/api/logout',{}); show(false); upload.reset(); clearPreview(); status.textContent='로그아웃했습니다.';}catch(err){status.textContent=err.message;}});
function clearPreview(){if(previewURL) URL.revokeObjectURL(previewURL);previewURL=undefined;const img=document.getElementById('preview');img.hidden=true;img.removeAttribute('src');}
document.getElementById('photo').addEventListener('change',e=>{clearPreview();const file=e.target.files[0];if(file){previewURL=URL.createObjectURL(file);const img=document.getElementById('preview');img.src=previewURL;img.hidden=false;}});
upload.addEventListener('submit',async e=>{
 e.preventDefault();const button=upload.querySelector('button');button.disabled=true;status.textContent='사진을 등록하고 있습니다…';
 try{
 const file=document.getElementById('photo').files[0];if(!file || !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>5*1024*1024) throw new Error('5MB 이하의 JPG, PNG, WebP 사진을 선택해 주세요.');
 const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('사진을 읽지 못했습니다.'));reader.readAsDataURL(file);});
 await api('/api/photos',{title:upload.elements.title.value,description:upload.elements.description.value,image});
 upload.reset();clearPreview();status.textContent='사진이 홈페이지에 추가되었습니다.';await list();
 }catch(err){status.textContent=err.name==='TimeoutError'?'응답이 지연되고 있습니다. 홈페이지에서 등록 여부를 먼저 확인해 주세요.':err.message;}finally{button.disabled=false;}
});
(async()=>{try{const session=await api('/api/session');show(session.authenticated,session.setupRequired);if(session.authenticated) await list();}catch{status.textContent='서버에 연결하지 못했습니다. 서버 실행 상태를 확인해 주세요.';}})();
