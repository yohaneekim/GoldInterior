import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scryptSync } from 'node:crypto';
test('관리자 인증, 업로드 제한, 영구 저장과 공개 조회',async()=>{
 const data=await mkdtemp(join(tmpdir(),'gold-test-')); process.env.DATA_DIR=data;process.env.NODE_ENV='test';
 await mkdir(join(data,'photos'));
 const {server}=await import('./server.mjs'); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); const base=`http://127.0.0.1:${server.address().port}`;
 const post=(path,body,cookie,origin='http://localhost:3000')=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
 try{
 assert.equal((await fetch(base+'/')).status,200);
 assert.equal((await (await fetch(base+'/api/session')).json()).setupRequired,true);
 assert.equal((await post('/api/setup',{username:'test-admin',password:'short'})).status,400);
 process.env.PUBLIC_ORIGIN='https://gold-interior.com';
 assert.equal((await post('/api/setup',{username:'test-admin',password:'test-password-123'})).status,403);
 delete process.env.PUBLIC_ORIGIN;
 assert.equal((await post('/api/setup',{username:'test-admin',password:'test-password-123'})).status,201);
 assert.equal((await (await fetch(base+'/api/session')).json()).setupRequired,false);
 assert.equal((await post('/api/setup',{username:'other',password:'other-password-123'})).status,403);
 assert.equal((await fetch(base+'/data/admin.json')).status,404);
 assert.equal((await post('/api/photos',{})).status,401);
 assert.equal((await post('/api/login',{},null,'https://evil.example')).status,403);
 assert.equal((await post('/api/login',{username:'test-admin',password:'wrong'})).status,401);
 const login=await post('/api/login',{username:'test-admin',password:'test-password-123'});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);
 assert.equal((await post('/api/photos',{title:'잘못된 파일',image:Buffer.from('<svg>test</svg>').toString('base64')},cookie)).status,400);
 const image='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
 const result=await post('/api/photos',{title:'테스트 시공',description:'등록 확인',image},cookie);assert.equal(result.status,201);const photo=await result.json();
 const photos=await (await fetch(base+'/api/photos')).json();assert.equal(photos.length,1);assert.equal(photos[0].title,'테스트 시공');
 const saved=await fetch(base+photo.url);assert.equal(saved.headers.get('content-type'),'image/png');assert.equal(Buffer.from(await saved.arrayBuffer()).toString('base64'),image);
 const fs=await import('node:fs/promises');assert.equal(JSON.parse(await fs.readFile(join(data,'photos',photo.id+'.json'),'utf8')).title,'테스트 시공');
 assert.equal((await post('/api/logout',{},cookie)).status,200);assert.equal((await post('/api/photos',{},cookie)).status,401);
 }finally{await new Promise(resolve=>server.close(resolve));await rm(data,{recursive:true,force:true});}
});
