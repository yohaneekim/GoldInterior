const setup=document.getElementById('setup-form');
const login=document.getElementById('login-form');
const manager=document.getElementById('manager');
const status=document.getElementById('status');
const upload=document.getElementById('upload-form');
let previewURLs=[];
async function api(path,data,timeout=30000){
 const response=await fetch(path,data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(timeout)}:{signal:AbortSignal.timeout(15000)});
 let result;try{result=await response.json();}catch{throw new Error('관리자 API에 연결되지 않았습니다. node server.mjs로 실행한 주소인지 확인해 주세요.');}
 if(!response.ok){if(response.status===401)show(false);throw new Error(result.error||'처리하지 못했습니다.');}return result;
}
function show(authenticated,setupRequired=false){setup.hidden=!setupRequired;login.hidden=authenticated||setupRequired;manager.hidden=!authenticated;}
const fieldDefinitions=[['title','제목',100],['description','설명',500],['region','지역',100],['size','면적',50],['duration','공사 기간',100],['scope','공사 범위',200]];
async function list(){
 const photos=await api('/api/photos?manage=1');const container=document.getElementById('photos');container.replaceChildren();
 if(!photos.length)container.textContent='아직 등록한 시공 사례가 없습니다.';
 for(const photo of photos){
  const card=document.createElement('article');const img=document.createElement('img');img.src=photo.url;img.alt=photo.title;img.loading='lazy';
  const heading=document.createElement('h3');heading.textContent=photo.title;
  const note=document.createElement('p');note.textContent=`${photo.hidden?'목록 숨김':'공개 중'} · 사진 ${(photo.images||[photo.url]).length}장`;
  const edit=document.createElement('form');edit.className='edit-form';
  for(const [name,labelText,max]of fieldDefinitions){
   const label=document.createElement('label');const field=document.createElement(name==='description'?'textarea':'input');field.name=name;field.value=photo[name]||'';field.maxLength=max;field.required=name==='title';label.append(labelText,field);edit.append(label);
  }
  const orderLabel=document.createElement('label');orderLabel.textContent='표시 순서 (작을수록 먼저)';const order=document.createElement('input');order.type='number';order.name='order';order.value=photo.order||0;order.step='1';order.min='-1000000';order.max='1000000';order.required=true;orderLabel.append(order);edit.append(orderLabel);
  const hiddenLabel=document.createElement('label');hiddenLabel.className='checkbox-label';const hidden=document.createElement('input');hidden.type='checkbox';hidden.name='hidden';hidden.checked=!!photo.hidden;hiddenLabel.append(hidden,'홈페이지 목록에서 숨기기 (원본 보존)');edit.append(hiddenLabel);
  const save=document.createElement('button');save.type='submit';save.textContent='변경 내용 저장';edit.append(save);
  edit.addEventListener('submit',async event=>{
   event.preventDefault();save.disabled=true;
   try{const fields=Object.fromEntries(new FormData(edit));fields.order=Number(order.value);fields.hidden=hidden.checked;await api('/api/photos/'+photo.id,fields);status.textContent='변경 내용을 저장했습니다.';heading.textContent=fields.title;note.textContent=`${fields.hidden?'목록 숨김':'공개 중'} · 사진 ${(photo.images||[photo.url]).length}장`;save.textContent='저장했습니다';}
   catch(error){status.textContent=error.message;}finally{save.disabled=false;}
  });
  edit.addEventListener('input',()=>{save.textContent='변경 내용 저장';});
  const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='정보 수정 · 순서 변경 · 목록 숨김';details.append(summary,edit);card.append(img,heading,note,details);container.append(card);
 }
}
setup.addEventListener('submit',async event=>{
 event.preventDefault();const button=setup.querySelector('button');button.disabled=true;
 try{if(setup.elements.password.value!==setup.elements.confirm.value)throw new Error('비밀번호 확인이 일치하지 않습니다.');const credentials={username:setup.elements.username.value.trim(),password:setup.elements.password.value};await api('/api/setup',credentials);setup.reset();await api('/api/login',credentials);show(true);status.textContent='관리자 계정을 만들고 로그인했습니다.';await list();}
 catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});
login.addEventListener('submit',async event=>{event.preventDefault();const button=login.querySelector('button');button.disabled=true;try{await api('/api/login',Object.fromEntries(new FormData(login)));login.reset();show(true);status.textContent='로그인했습니다.';await list();}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
document.getElementById('logout').addEventListener('click',async()=>{try{await api('/api/logout',{});show(false);upload.reset();clearPreview();document.getElementById('photos').replaceChildren();status.textContent='로그아웃했습니다.';}catch(error){status.textContent=error.message;}});
function clearPreview(){for(const url of previewURLs)URL.revokeObjectURL(url);previewURLs=[];const preview=document.getElementById('preview');preview.hidden=true;preview.replaceChildren();}
function selectedFiles(){const files=Array.from(upload.elements.photo.files);if(!files.length||files.length>8)throw new Error('사진은 1~8장 선택해 주세요.');if(files.some(file=>!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024))throw new Error('한 장당 5MB 이하의 JPG, PNG, WebP를 선택해 주세요.');return files;}
document.getElementById('photo').addEventListener('change',()=>{clearPreview();try{const files=selectedFiles();const preview=document.getElementById('preview');for(const [index,file]of files.entries()){const image=document.createElement('img');const url=URL.createObjectURL(file);previewURLs.push(url);image.src=url;image.alt=`${index===0?'대표 사진':'추가 사진'}: ${file.name}`;preview.append(image);}preview.hidden=false;status.textContent='사진을 선택했습니다. 첫 사진이 대표 이미지입니다.';}catch(error){status.textContent=error.message;}});
function readImage(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(new Error('사진을 읽지 못했습니다.'));reader.readAsDataURL(file);});}
upload.addEventListener('submit',async event=>{
 event.preventDefault();const button=upload.querySelector('button');button.disabled=true;status.textContent='시공 사례를 등록하고 있습니다…';
 try{const files=selectedFiles();const fields=Object.fromEntries(new FormData(upload));delete fields.photo;fields.order=Number(fields.order);fields.images=await Promise.all(files.map(readImage));await api('/api/photos',fields,90000);upload.reset();clearPreview();status.textContent='시공 사례를 등록했습니다.';await list();}
 catch(error){status.textContent=error.name==='TimeoutError'?'응답이 지연되고 있습니다. 재등록 전 홈페이지에서 등록 여부를 확인해 주세요.':error.message;}finally{button.disabled=false;}
});
(async()=>{try{const session=await api('/api/session');show(session.authenticated,session.setupRequired);if(session.authenticated)await list();}catch(error){status.textContent=error.message;}})();
