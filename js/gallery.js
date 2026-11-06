const spaces = new Map([
  ['wood', {title:'우드와 빛의 온기', description:'나무 테이블과 세로 파티션, 샹들리에가 어우러진 공간입니다. 마음에 드는 소재나 조명 분위기를 상담 시 알려주세요.', url:'/Photo/KakaoTalk_20261101_162330046_22.jpg'}],
  ['green', {title:'깊은 색감, 편안한 분위기', description:'그린 컬러의 벽면과 곡선 소파, 간접 조명이 만드는 분위기를 살펴보세요.', url:'/Photo/KakaoTalk_20261101_162430755_19.jpg'}],
  ['white', {title:'일상을 담는 수납', description:'화이트 수납과 우드 선반으로 구성한 공간입니다. 수납할 물건과 생활 동선에 맞는 구성을 상담해 보세요.', url:'/Photo/KakaoTalk_20261101_162244936_13.jpg'}],
]);
const dialog = document.getElementById('project-dialog');
const title = document.getElementById('project-title');
const description = document.getElementById('project-description');
const facts = document.getElementById('project-facts');
const images = document.getElementById('project-images');
let activeSpace;
let opener;
let restoreFocus=true;
function showSpace(space, button) {
  activeSpace=space; opener=button; restoreFocus=true; title.textContent=space.title; description.textContent=space.description; facts.replaceChildren();
  for (const [key,label] of [['region','지역'],['size','면적'],['duration','공사 기간'],['scope','공사 범위']]) {
    if (!space[key]) continue;
    const group=document.createElement('div'); const term=document.createElement('dt'); term.textContent=label;
    const value=document.createElement('dd'); value.textContent=space[key]; group.append(term,value); facts.append(group);
  }
  images.replaceChildren();
  for (const [index,url] of (space.images?.length ? space.images : [space.url]).entries()) {
    const figure=document.createElement('figure'); const image=document.createElement('img'); image.src=url; image.alt=`${space.title} 사진 ${index+1}`; if(index) image.loading='lazy';
    const caption=document.createElement('figcaption'); caption.textContent=`${String(index+1).padStart(2,'0')} / ${space.title}`;
    figure.append(image,caption); images.append(figure);
  }
  dialog.showModal(); dialog.scrollTop=0; document.body.classList.add('modal-open');
}
document.getElementById('portfolio-grid').addEventListener('click', event => { const button=event.target.closest('[data-space]'); if(button && spaces.has(button.dataset.space)) showSpace(spaces.get(button.dataset.space),button); });
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(restoreFocus)opener?.focus({preventScroll:true});});
document.getElementById('project-contact').addEventListener('click',()=>{restoreFocus=false;dialog.close();const message=document.getElementById('message');const text=`관심 공간: ${activeSpace.title}`;if(!message.value.includes(text))message.value=`${text}\n${message.value}`.trimEnd();});
async function loadGallery() {
  if(location.protocol==='file:')return;
  try {
    const response=await fetch('/api/photos',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('사진 목록 요청 실패');
    const photos=await response.json();const fragment=document.createDocumentFragment();
    for(const photo of photos){
      spaces.set(photo.id,photo);const card=document.createElement('article');card.className='project-card';
      const button=document.createElement('button');button.type='button';button.className='project-open';button.dataset.space=photo.id;
      const frame=document.createElement('span');frame.className='project-image';const image=document.createElement('img');image.src=photo.url;image.alt=photo.title;image.loading='lazy';
      const meta=document.createElement('span');meta.className='project-meta';meta.textContent=`${photo.region||'SPACE STORY'} ↗`;
      const heading=document.createElement('h3');heading.textContent=photo.title;const copy=document.createElement('span');copy.className='project-description';copy.textContent=photo.description;
      frame.append(image);button.append(frame,meta,heading,copy);card.append(button);fragment.append(card);
    }
    document.getElementById('portfolio-grid').prepend(fragment);
  }catch{document.getElementById('gallery-status').textContent='추가 사진을 불러오지 못했습니다. 기본 공간 사진을 먼저 둘러보시거나 잠시 후 새로고침해 주세요.';}
}
loadGallery();
