import test from 'node:test';
import assert from 'node:assert/strict';

test('정적 미리보기만 제공하며 계정·업로드·비공개 파일 접근은 차단', async () => {
  process.env.NODE_ENV = 'test';
  const {server} = await import('./server.mjs');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const path of ['/','/index.html','/GoldInterior.html','/css/style.css','/js/main.js','/js/gallery.js','/js/hero-slider.js','/Photo/space-wood-clean.png']) {
      assert.equal((await fetch(base + path)).status, 200, path);
    }
    for (const path of ['/admin.html','/js/admin.js','/api/session','/api/photos','/api/content','/data/admin.json','/content-defaults.json','/.git/config']) {
      assert.equal((await fetch(base + path)).status, 404, path);
    }
    assert.equal((await fetch(base + '/api/photos', {method:'POST',body:'{}'})).status, 405);
    assert.equal((await fetch(base, {method:'HEAD'})).status, 200);
    const html = await (await fetch(base)).text();
    assert.ok(!html.includes('관리자 로그인'));
    const gallery = await (await fetch(base + '/js/gallery.js')).text();
    assert.ok(!gallery.includes('/api/'));
    assert.ok(!gallery.includes('fetch('));
  } finally { await new Promise(resolve => server.close(resolve)); }
});
