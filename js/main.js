const menuButton = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
function closeMenu() { nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
const fallback = document.getElementById('form-fallback');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity() || form.getAttribute('aria-busy') === 'true') return;
  const button = form.querySelector('[type="submit"]');
  button.disabled = true; form.setAttribute('aria-busy', 'true');
  status.textContent = '문의를 전송하고 있습니다…'; fallback.hidden = true;
  try {
    const response = await fetch(form.action, {method:'POST', body:new FormData(form), headers:{Accept:'application/json'}, signal:AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error('접수 서버에서 전송을 완료하지 못했습니다. 잠시 후 다시 시도하거나 전화해 주세요.');
    status.textContent = '문의가 접수되었습니다. 남겨주신 연락처로 담당자가 연락드리겠습니다.'; form.reset();
  } catch (error) {
    status.textContent = error.name === 'TimeoutError' ? '응답이 지연되어 접수 여부를 확인할 수 없습니다. 입력 내용은 유지했습니다.' : error instanceof TypeError ? '네트워크 연결을 확인해 주세요. 입력 내용은 유지했습니다.' : error.message;
    fallback.hidden = false;
  } finally { button.disabled = false; form.removeAttribute('aria-busy'); status.focus(); }
});
