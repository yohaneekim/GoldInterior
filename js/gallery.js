const spaces = new Map([["wood",{"id":"wood","title":"마포구 중식당 진선","description":"75평형 중식당. 우드 테이블과 파티션, 샹들리에가 어우러진 매장 공간입니다.","region":"서울 마포구","size":"75평형","url":"/Photo/space-wood-clean.png"}],["green",{"id":"green","title":"신림동 노래바","description":"45평형 노래바. 그린 컬러의 벽과 곡선 소파, 간접 조명이 만드는 분위기를 담았습니다.","region":"서울 관악구 신림동","size":"45평형","url":"/Photo/space-green-01.jpg"}],["white",{"id":"white","title":"서울대입구 이편한세상","description":"서울대입구 인근 이편한세상 45평형 주거 공간. 화이트 수납장과 우드 선반으로 정돈한 실내입니다.","region":"서울 관악구 · 서울대입구 인근","size":"45평형","url":"/Photo/space-white.jpg"}]]);
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
    const figure=document.createElement('figure'); const image=document.createElement('img'); image.src=url; image.alt=space.captions?.[index] || `${space.title} 사진 ${index+1}`; if(index) image.loading='lazy';
    const caption=document.createElement('figcaption'); caption.textContent=space.captions?.[index] || `${String(index+1).padStart(2,'0')} / ${space.title}`;
    figure.append(image,caption); images.append(figure);
  }
  dialog.showModal(); dialog.scrollTop=0; document.body.classList.add('modal-open');
}
document.querySelector('main').addEventListener('click', event => { const button=event.target.closest('[data-space]'); if(button && spaces.has(button.dataset.space)) showSpace(spaces.get(button.dataset.space),button); });
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');if(restoreFocus)opener?.focus({preventScroll:true});});
document.getElementById('project-contact').addEventListener('click',()=>{restoreFocus=false;dialog.close();const message=document.getElementById('message');const text=`관심 공간: ${activeSpace.title}`;if(!message.value.includes(text))message.value=`${text}\n${message.value}`.trimEnd();});
async function loadGallery() {
  const status=document.getElementById('gallery-status');
  const grid=document.getElementById('uploaded-gallery');
  if(location.protocol==='file:'){status.textContent='사진 모아보기는 서버로 홈페이지를 열면 표시됩니다.';return;}
  try {
    const response=await fetch('/api/photos',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('사진 목록 요청 실패');
    const photos=await response.json();const fragment=document.createDocumentFragment();
    const cards=[];
    for(const photo of photos){
      spaces.set(photo.id,photo);const card=document.createElement('article');card.className='project-card';cards.push(card);card.hidden=cards.length>6;
      const button=document.createElement('button');button.type='button';button.className='project-open';button.dataset.space=photo.id;
      const frame=document.createElement('span');frame.className='project-image';const image=document.createElement('img');image.src=photo.url;image.alt=photo.title;image.loading='lazy';
      const meta=document.createElement('span');meta.className='project-meta';meta.textContent=`${photo.region||'SPACE STORY'} · ${(photo.images?.length||1)}장 ↗`;
      const heading=document.createElement('h3');heading.textContent=photo.title;const copy=document.createElement('span');copy.className='project-description';copy.textContent=photo.description;
      frame.append(image);button.append(frame,meta,heading,copy);card.append(button);fragment.append(card);
    }
    grid.replaceChildren(fragment);
    status.textContent=photos.length?`등록된 시공 사례 ${photos.length}개`:'새로운 시공 사진을 준비하고 있습니다.';
    const more=document.getElementById('gallery-more');let visible=6;more.hidden=cards.length<=visible;
    more.onclick=()=>{visible+=6;cards.forEach((card,index)=>{card.hidden=index>=visible;});more.hidden=visible>=cards.length;status.textContent=`등록된 시공 사례 ${cards.length}개 중 ${Math.min(visible,cards.length)}개 표시`;};
  }catch{document.getElementById('gallery-status').textContent='등록 사진을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.';}
}
loadGallery();

async function loadHomepageContent(){
 let records;try{const response=await fetch('/api/content',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error();records=await response.json();}catch{return;}
 for(const item of records){
 if(item.id.startsWith('hero-')){const image=document.querySelectorAll('.hero-slides .hero-image')[Number(item.id.slice(5))-1];if(image){image.src=item.url;image.alt=item.captions?.[0]||item.title;}continue;}
 if(item.id==='about'){document.querySelector('.about-image img').src=item.url;document.querySelector('.about-image img').alt=item.captions?.[0]||item.title;document.getElementById('representative-title').textContent=item.title;document.getElementById('representative-description').textContent=item.description;continue;}
 spaces.set(item.id,item);const button=document.querySelector('[data-space="'+item.id+'"]');if(!button)continue;button.closest('article').hidden=!!item.hidden;button.querySelector('img').src=item.url;button.querySelector('img').alt=item.captions?.[0]||item.title;button.querySelector('h3').textContent=item.title;button.querySelector('.project-meta').textContent=[item.region,item.size].filter(Boolean).join(' · ')+' ↗';button.querySelector('.project-description').textContent=item.description;
 }
}
loadHomepageContent();
