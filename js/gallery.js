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

// 추가 시공 사례는 여기에 작성하세요. 서버나 관리자 계정 없이 정적 사이트에서 표시됩니다.
// 예: {id:'project-04', title:'사례 제목', description:'설명', region:'서울', size:'45평형',
//      url:'/Photo/project-04.jpg', images:['/Photo/project-04.jpg'], captions:['사진 설명']}
const additionalSpaces = [];
const galleryGrid = document.getElementById('uploaded-gallery');
const galleryStatus = document.getElementById('gallery-status');
const galleryMore = document.getElementById('gallery-more');
const cards = [];
for (const space of additionalSpaces) {
  spaces.set(space.id, space);
  const card = document.createElement('article'); card.className = 'project-card';
  const button = document.createElement('button'); button.type = 'button'; button.className = 'project-open'; button.dataset.space = space.id;
  const frame = document.createElement('span'); frame.className = 'project-image';
  const image = document.createElement('img'); image.src = space.url || space.images[0]; image.alt = space.captions?.[0] || space.title; image.loading = 'lazy';
  const meta = document.createElement('span'); meta.className = 'project-meta'; meta.textContent = [space.region, space.size].filter(Boolean).join(' · ') + ' ↗';
  const heading = document.createElement('h3'); heading.textContent = space.title;
  const copy = document.createElement('span'); copy.className = 'project-description'; copy.textContent = space.description;
  frame.append(image); button.append(frame, meta, heading, copy); card.append(button); galleryGrid.append(card); cards.push(card);
}
let visible = 6;
function renderGallery() {
  cards.forEach((card, index) => { card.hidden = index >= visible; });
  galleryMore.hidden = visible >= cards.length;
  galleryStatus.textContent = cards.length ? '시공 사례 ' + cards.length + '개 중 ' + Math.min(visible, cards.length) + '개 표시' : '추가 시공 사진을 준비하고 있습니다.';
}
galleryMore.addEventListener('click', () => { visible += 6; renderGallery(); });
renderGallery();
