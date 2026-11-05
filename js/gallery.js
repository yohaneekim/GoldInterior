async function loadGallery() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid || location.protocol === 'file:') return;
  try {
    const response = await fetch('/api/photos');
    if (!response.ok) throw new Error('사진 목록을 불러오지 못했습니다.');
    const photos = await response.json();
    for (const photo of photos.reverse()) {
      const card = document.createElement('article');
      const frame = document.createElement('div'); frame.className = 'overflow-hidden mb-4 aspect-[4/3]';
      const img = document.createElement('img'); img.src = photo.url; img.alt = photo.title; img.loading = 'lazy'; img.className = 'w-full h-full object-cover';
      const title = document.createElement('h3'); title.className = 'text-lg font-medium text-stone-900 mt-1'; title.textContent = photo.title;
      const description = document.createElement('p'); description.className = 'text-sm text-stone-500 mt-1'; description.textContent = photo.description;
      frame.append(img); card.append(frame,title,description); grid.prepend(card);
    }
  } catch { const notice=document.createElement('p'); notice.textContent='추가 시공 사진을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.'; grid.after(notice); }
}
loadGallery();
