// 사진은 index.html의 .hero-slides 안에서 바꾸세요. 자동 넘김 간격: 5초.
(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.hero-slides .hero-image')].slice(0, 5);
  const controls = hero.querySelector('.hero-slider-controls');
  if (slides.length < 2 || !controls) return;
  const dots = controls.querySelector('.hero-dots');
  const pause = controls.querySelector('.hero-pause');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer;
  let paused = motion.matches;
  let hovering = false;
  let focused = false;
  let request = 0;
  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `${index + 1}번째 사진 보기`);
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => { void show(index); });
    dots.append(button);
    return button;
  });
  function schedule() {
    clearTimeout(timer);
    if (!paused && !hovering && !focused && !document.hidden) timer = setTimeout(() => { void show((current + 1) % slides.length); }, 5000);
  }
  async function show(index) {
    const id = ++request;
    try { await slides[index].decode(); }
    catch { if (id === request) { paused = true; updatePause(); schedule(); } return; }
    if (id !== request) return;
    slides.forEach((slide, position) => {
      slide.classList.toggle('is-active', position === index);
      slide.setAttribute('aria-hidden', String(position !== index));
      buttons[position].setAttribute('aria-pressed', String(position === index));
    });
    current = index;
    schedule();
  }
  function updatePause() {
    pause.textContent = paused ? '자동 넘김 시작' : '자동 넘김 정지';
  }
  controls.querySelector('.hero-prev').addEventListener('click', () => { void show((current - 1 + slides.length) % slides.length); });
  controls.querySelector('.hero-next').addEventListener('click', () => { void show((current + 1) % slides.length); });
  pause.addEventListener('click', () => { paused = !paused; updatePause(); schedule(); });
  hero.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  hero.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  hero.addEventListener('focusin', () => { focused = true; schedule(); });
  hero.addEventListener('focusout', event => { focused = hero.contains(event.relatedTarget); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => { paused = motion.matches; updatePause(); schedule(); });
  controls.hidden = false;
  updatePause();
  schedule();
})();
