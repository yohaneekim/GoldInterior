import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir, rename, unlink } from 'node:fs/promises';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const data = resolve(process.env.DATA_DIR || join(root, 'data'));
await mkdir(join(data, 'photos'), { recursive: true });
const origin = process.env.PUBLIC_ORIGIN || 'http://localhost:3000';
const sessions = new Map();
const attempts = new Map();
setInterval(() => { for (const [k,v] of sessions) if(v.expires < Date.now()) sessions.delete(k); for(const [k,v] of attempts) if(v.until < Date.now()) attempts.delete(k); }, 60000).unref();
function send(res, code, value) { res.writeHead(code, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); res.end(JSON.stringify(value)); }
async function body(req, limit=7*1024*1024) { let size=0; const chunks=[]; for await (const chunk of req) { size+=chunk.length; if(size>limit) throw Object.assign(new Error('전송 용량을 초과했습니다.'),{status:413}); chunks.push(chunk); } try { return JSON.parse(Buffer.concat(chunks)); } catch { throw Object.assign(new Error('잘못된 요청입니다.'),{status:400}); } }
function projectFields(input) {
 const fields={};
 for(const [key,max] of Object.entries({title:100,description:500,region:100,size:50,duration:100,scope:200})) {
  if(input[key]!==undefined && typeof input[key]!=='string') throw Object.assign(new Error('텍스트 항목을 확인해 주세요.'),{status:400});
  fields[key]=(input[key]||'').trim();
  if(fields[key].length>max || (key==='title' && !fields[key])) throw Object.assign(new Error(`제목은 필수이며 각 항목의 글자 수 제한을 지켜 주세요.`),{status:400});
 }
 if(input.order!==undefined && (!Number.isSafeInteger(input.order)||Math.abs(input.order)>1000000)) throw Object.assign(new Error('표시 순서는 -1000000~1000000의 정수로 입력해 주세요.'),{status:400});
 if(input.hidden!==undefined && typeof input.hidden!=='boolean') throw Object.assign(new Error('공개 설정을 확인해 주세요.'),{status:400});
 return {...fields,order:input.order??0,hidden:input.hidden??false};
}
function decodeImage(image) {
 if(typeof image!=='string'|| !/^[A-Za-z0-9+/]*={0,2}$/.test(image)) throw Object.assign(new Error('올바른 사진을 선택해 주세요.'),{status:400});
 const bytes=Buffer.from(image,'base64');let ext;
 if(bytes.subarray(0,3).equals(Buffer.from([255,216,255])))ext='jpg';
 else if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';
 else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')ext='webp';
 if(!ext||bytes.length>5*1024*1024||bytes.length<12)throw Object.assign(new Error('사진 한 장당 5MB 이하의 JPG, PNG, WebP만 가능합니다.'),{status:400});
 return {bytes,ext};
}
// Serialize metadata edits so simultaneous saves cannot overwrite a newer edit halfway through.
let mutation=Promise.resolve();
function exclusive(action){const next=mutation.then(action);mutation=next.catch(()=>{});return next;}
async function setupAvailable(req) {
 const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
 if (!local || process.env.PUBLIC_ORIGIN || origin !== 'http://localhost:3000') return false;
 try { await readFile(join(data,'admin.json')); return false; } catch (error) { if(error.code === 'ENOENT') return true; throw error; }
}
function session(req) { const token = /(?:^|;\s*)gold_session=([a-f0-9]+)/.exec(req.headers.cookie || '')?.[1]; const s=sessions.get(token); return s?.expires>Date.now() ? { token, ...s } : null; }
function cookie(token, age) { return `gold_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${origin.startsWith('https:')?'; Secure':''}`; }
export const server = createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('Referrer-Policy','strict-origin-when-cross-origin'); res.setHeader('X-Frame-Options','DENY');
 try {
 const path = new URL(req.url, 'http://localhost').pathname;
 if(req.method==='POST' && req.headers.origin !== origin) return send(res,403,{error:'허용되지 않은 요청입니다.'});
 if(path==='/api/session' && req.method==='GET') return send(res,200,{authenticated:!!session(req),setupRequired:await setupAvailable(req)});
 if(path==='/api/setup' && req.method==='POST') {
 if(!await setupAvailable(req)) return send(res,403,{error:'최초 계정 설정은 계정이 없는 로컬 서버에서만 가능합니다.'});
 const input=await body(req); const username=typeof input.username==='string'?input.username.trim():''; const password=input.password;
 if(!username || username.length>100 || typeof password!=='string' || password.length<12 || password.length>256) return send(res,400,{error:'아이디는 1~100자, 비밀번호는 12~256자로 입력해 주세요.'});
 const salt=randomBytes(32).toString('hex');
 try { await writeFile(join(data,'admin.json'),JSON.stringify({username,salt,hash:scryptSync(password,salt,64).toString('hex')}),{flag:'wx',mode:0o600}); }
 catch(error) { if(error.code==='EEXIST') return send(res,409,{error:'이미 계정이 생성되었습니다. 로그인해 주세요.'}); throw error; }
 return send(res,201,{ok:true});
 }
 if(path==='/api/login' && req.method==='POST') {
 const ip=req.socket.remoteAddress; const rate=attempts.get(ip) || { count:0, until:Date.now()+900000 };
 if(rate.count>=5 && rate.until>Date.now()) return send(res,429,{error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'});
 const input=await body(req); let config; try { config=JSON.parse(await readFile(join(data,'admin.json'),'utf8')); } catch { return send(res,503,{error:'서버에서 관리자 계정을 먼저 설정해 주세요.'}); }
 const hash=scryptSync(String(input.password || ''),config.salt,64);
 if(input.username!==config.username || !timingSafeEqual(hash,Buffer.from(config.hash,'hex'))) { rate.count++; attempts.set(ip,rate); return send(res,401,{error:'아이디 또는 비밀번호가 올바르지 않습니다.'}); }
 attempts.delete(ip); const old=session(req); if(old) sessions.delete(old.token);
 const token=randomBytes(32).toString('hex'); sessions.set(token,{expires:Date.now()+8*3600000}); res.setHeader('Set-Cookie',cookie(token,28800)); return send(res,200,{ok:true});
 }
 if(path==='/api/logout' && req.method==='POST') { const s=session(req); if(s) sessions.delete(s.token); res.setHeader('Set-Cookie',cookie('',0)); return send(res,200,{ok:true}); }
 if(path==='/api/photos' && req.method==='GET') {
 const names=(await readdir(join(data,'photos'))).filter(n=>n.endsWith('.json'));
 const photos=await Promise.all(names.map(async n=>JSON.parse(await readFile(join(data,'photos',n),'utf8'))));
 const admin=new URL(req.url,'http://localhost').searchParams.get('manage')==='1';
 if(admin && !session(req))return send(res,401,{error:'관리자 로그인이 필요합니다.'});
 return send(res,200,photos.filter(p=>admin||!p.hidden).sort((a,b)=>(a.order||0)-(b.order||0)||b.id.localeCompare(a.id)));
 }
 if(/^\/api\/photos\/\d+-[a-f0-9]+$/.test(path) && req.method==='POST') {
 if(!session(req))return send(res,401,{error:'관리자 로그인이 필요합니다.'});
 const input=await body(req);const fields=projectFields(input);const id=path.split('/').pop();
 return await exclusive(async()=>{
  const file=join(data,'photos',id+'.json');let old;
  try{old=JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code==='ENOENT')return send(res,404,{error:'시공 사례를 찾을 수 없습니다.'});throw error;}
  const photo={...old,...fields};const temporary=file+'.'+randomBytes(6).toString('hex')+'.tmp';
  try{await writeFile(temporary,JSON.stringify(photo),{flag:'wx'});await rename(temporary,file);}finally{await unlink(temporary).catch(()=>{});}
  return send(res,200,photo);
 });
 }
 if(path==='/api/photos' && req.method==='POST') {
 if(!session(req)) return send(res,401,{error:'관리자 로그인이 필요합니다.'});
 const input=await body(req,56*1024*1024);const fields=projectFields(input);
 const originals=input.images??[input.image];
 if(!Array.isArray(originals)||!originals.length||originals.length>8)return send(res,400,{error:'사진은 1~8장 선택해 주세요.'});
 const decoded=originals.map(decodeImage);const id=Date.now()+'-'+randomBytes(8).toString('hex');
 const urls=decoded.map((image,index)=>`/uploads/${id}${index?'-'+index:''}.${image.ext}`);
 const photo={id,...fields,url:urls[0],images:urls};const written=[];
 try{
  for(const [index,image]of decoded.entries()){const file=join(data,'photos',urls[index].split('/').pop());await writeFile(file,image.bytes,{flag:'wx'});written.push(file);}
  await writeFile(join(data,'photos',id+'.json'),JSON.stringify(photo),{flag:'wx'});
 }catch(error){await Promise.all(written.map(file=>unlink(file).catch(()=>{})));throw error;}
 return send(res,201,photo);
 }
 if(req.method!=='GET' && req.method!=='HEAD') return send(res,405,{error:'지원하지 않는 요청입니다.'});
 let file;
 if(path==='/' || path==='/GoldInterior.html' || path==='/index.html') file=join(root,'index.html');
 else if(path==='/admin.html') file=join(root,'admin.html');
 else if(/^\/Photo\/[a-zA-Z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(path)) file=join(root,path.slice(1));
 else if(/^\/(css|js)\/[a-z-]+\.(css|js)$/.test(path)) file=join(root,path.slice(1));
 else if(/^\/uploads\/\d+-[a-f0-9]+(?:-[1-7])?\.(jpg|png|webp)$/.test(path)) file=join(data,'photos',path.split('/').pop());
 else return send(res,404,{error:'페이지를 찾을 수 없습니다.'});
 let bytes; try { bytes=await readFile(file); } catch(err) { if(err.code==='ENOENT') return send(res,404,{error:'파일을 찾을 수 없습니다.'}); throw err; }
 const ext=file.split('.').pop(); const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',jpg:'image/jpeg',png:'image/png',webp:'image/webp'};
 res.writeHead(200,{'Content-Type':types[ext], 'Cache-Control':'no-cache'}); res.end(req.method==='HEAD'?undefined:bytes);
 } catch(err) { if(!res.headersSent) send(res,err.status || 500,{error:err.status?err.message:'서버 처리 중 문제가 발생했습니다.'}); }
});
if(process.env.NODE_ENV!=='test') server.listen(process.env.PORT || 3000,process.env.HOST || '127.0.0.1',()=>console.log('홈페이지: http://localhost:' + (process.env.PORT || 3000) + '\n관리자: http://localhost:' + (process.env.PORT || 3000) + '/admin.html'));
