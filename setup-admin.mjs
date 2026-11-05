import { mkdir, writeFile } from 'node:fs/promises';
import { randomBytes, scryptSync } from 'node:crypto';
import { resolve, join } from 'node:path';
const username=process.env.ADMIN_USER;
const password=process.env.ADMIN_PASSWORD;
if(!username || !password || password.length<12) { console.error('ADMIN_USER와 12자 이상의 ADMIN_PASSWORD 환경 변수를 지정해 주세요.'); process.exit(1); }
const data=resolve(process.env.DATA_DIR || 'data'); await mkdir(data,{recursive:true});
const salt=randomBytes(32).toString('hex');
await writeFile(join(data,'admin.json'),JSON.stringify({username,salt,hash:scryptSync(password,salt,64).toString('hex')}),{flag:'wx',mode:0o600});
console.log('관리자 계정이 생성되었습니다.');
