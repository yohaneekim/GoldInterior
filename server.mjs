// 로컬 미리보기 전용 정적 서버입니다. 데이터 저장·로그인·업로드 API는 없습니다.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const types = {html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'};
export const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-cache');
  const fail = code => { res.writeHead(code, {'Content-Type':'text/plain; charset=utf-8'}); res.end(code === 405 ? '허용되지 않는 요청입니다.' : '페이지를 찾을 수 없습니다.'); };
  if (!['GET','HEAD'].includes(req.method)) { res.setHeader('Allow','GET, HEAD'); return fail(405); }
  let path;
  try { path = new URL(req.url, 'http://localhost').pathname; } catch { return fail(404); }
  let file;
  if (['/','/index.html','/GoldInterior.html'].includes(path)) file = join(root,'index.html');
  else if (/^\/(css|js)\/[a-z-]+\.(css|js)$/.test(path) || /^\/Photo\/[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(path)) file = join(root,path.slice(1));
  else return fail(404);
  try {
    const bytes = await readFile(file);
    res.writeHead(200, {'Content-Type':types[file.split('.').pop().toLowerCase()]});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch (error) { fail(error.code === 'ENOENT' ? 404 : 500); }
});
if (process.env.NODE_ENV !== 'test') server.listen(process.env.PORT || 3000, '127.0.0.1', () => console.log('홈페이지 미리보기: http://localhost:' + (process.env.PORT || 3000)));
