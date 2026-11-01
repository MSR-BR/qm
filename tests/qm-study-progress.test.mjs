import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
const source=fs.readFileSync(new URL('../assets/qm-study-progress.js', import.meta.url),'utf8');
async function check(signedIn, failSave, failOnClick = false) {
 let requests=0;
 let opened=0, handler, node; const events=[];
 const copy={textContent:''};
 const button={disabled:false,addEventListener(_type,fn){handler=fn}};
 const header={appendChild(el){node=el}};
 const document={readyState:'complete',title:'Page',querySelector:s=>s==='.hdr-inner'?header:null,createElement:()=>({setAttribute(){},set innerHTML(v){this.html=v},get innerHTML(){return this.html},querySelector(s){return s==='button'?button:copy}})};
 const client={from(){return {upsert(){return {select(){return {single:async()=>{ requests++; return (failSave || (failOnClick && requests > 1)) ? {error:{message:'failed'}} : {data:{status:'in_progress'}} }}}}}}}};
 const window={location:{origin:'http://example.test',pathname:'/slides/chapter-01/test.html'},QMContentRegistry:{chapters:{'01':{availability:'published'}}},QMAnalytics:{track(...args){events.push(args)}},TermoAuth:{getSession:async()=>signedIn?{user:{id:'test'}}:null,ensureSupabase:async()=>client,openModal(){opened++}},setTimeout,dispatchEvent(){}};
 const context={window,document,URL,fetch:async()=>({ok:true,json:async()=>({topics:[{id:'1.1',title:'Test',url:'slides/chapter-01/test.html'}]})}),CustomEvent:class{}};
 vm.runInNewContext(source,context);
 await new Promise(resolve=>setTimeout(resolve,10));
 assert.ok(node,'control mounted');
 if(!signedIn){assert.match(node.html,/Sign in to save progress/);await handler();assert.equal(opened,1);assert.equal(events.length,1);assert.equal(events[0][0],"auth_open");assert.equal(events[0][1].surface,"header")}
 else if(failSave){assert.match(node.html,/Study progress unavailable/)}
 else {assert.match(node.html,/Mark as completed/); if(failOnClick){await handler();assert.match(copy.textContent,/Could not save your progress/);assert.equal(button.disabled,false)}}
}
test('visitor can open sign-in and emits the existing auth_open diagnostic', async () => check(false,false));
test('signed-in user sees completion control', async () => check(true,false));
test('load and save failures show feedback', async () => { await check(true,true); await check(true,false,true); });
