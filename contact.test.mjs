import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('./js/main.js',import.meta.url),'utf8');
function contact(fetch,valid=true){
 const listeners={};const attrs=new Map();const button={disabled:false};
 const form={action:'https://example.invalid/contact',value:'입력한 상담 내용',reportValidity:()=>valid,getAttribute:key=>attrs.get(key),setAttribute:(key,value)=>attrs.set(key,value),removeAttribute:key=>attrs.delete(key),querySelector:()=>button,addEventListener:(event,handler)=>listeners[event]=handler,reset(){this.value='';}};
 const status={textContent:'',focus(){this.focused=true;}};const fallback={hidden:true};
 const nav={classList:{remove(){},toggle(){}},addEventListener(){}};
 const menu={addEventListener(){},setAttribute(){}};
 const document={querySelector:()=>menu,getElementById:id=>({'site-nav':nav,'contact-form':form,'form-status':status,'form-fallback':fallback}[id]),addEventListener(){}};
 vm.runInNewContext(source,{document,fetch,FormData:class{},AbortSignal,TypeError});
 return {form,status,fallback,button,submit:()=>listeners.submit({preventDefault(){}})};
}
test('문의 성공 시에만 입력 초기화, 대기 중 중복 전송 방지',async()=>{
 let finish;let calls=0;const fixture=contact(()=>{calls++;return new Promise(resolve=>finish=resolve);});
 const pending=fixture.submit();assert.equal(fixture.button.disabled,true);
 await fixture.submit();assert.equal(calls,1);finish({ok:true});await pending;
 assert.equal(fixture.form.value,'');assert.equal(fixture.button.disabled,false);assert.match(fixture.status.textContent,/접수되었습니다/);assert.equal(fixture.status.focused,true);
});
test('전송 실패·시간 초과 시 입력 보존, 전화 대안 제공',async()=>{
 for(const result of [()=>Promise.resolve({ok:false}),()=>Promise.reject(Object.assign(new Error(),{name:'TimeoutError'})),()=>Promise.reject(new TypeError('offline'))]){
  const fixture=contact(result);await fixture.submit();assert.equal(fixture.form.value,'입력한 상담 내용');assert.equal(fixture.fallback.hidden,false);assert.equal(fixture.button.disabled,false);assert.ok(fixture.status.textContent);
 }
});
test('필수 항목 또는 동의 미충족 시 전송하지 않음',async()=>{
 let calls=0;const fixture=contact(()=>{calls++;},false);await fixture.submit();assert.equal(calls,0);assert.equal(fixture.form.value,'입력한 상담 내용');
});
