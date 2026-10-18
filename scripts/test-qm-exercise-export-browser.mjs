// Disposable, anonymous browser fixture: no login, provider call, learner write or email.
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = process.env.QM_EXPORT_TEST_URL || 'http://127.0.0.1:4185';
const out = process.env.QM_EXPORT_EVIDENCE_DIR || '/private/tmp/qm-c15-export';
await mkdir(out, { recursive: true });
const profile = await mkdtemp(path.join(os.tmpdir(), 'qm-export-browser-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0',
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'
], { stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
class CDP {
  constructor(url) {
    this.ws = new WebSocket(url); this.id = 0; this.pending = new Map();
    this.ready = new Promise(resolve => this.ws.addEventListener('open', resolve, { once: true }));
    this.ws.addEventListener('message', e => { const m = JSON.parse(e.data); const p = this.pending.get(m.id); if (p) { this.pending.delete(m.id); m.error ? p.reject(Error(m.error.message)) : p.resolve(m.result); } });
  }
  async send(method, params = {}) { await this.ready; return new Promise((resolve,reject) => { const id = ++this.id; this.pending.set(id,{resolve,reject}); this.ws.send(JSON.stringify({id,method,params})); }); }
  async eval(expression) { const r = await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true}); if(r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; }
}
const fixture = {
  exercise_code: 'QA-EXPORT-NOT-A-LEARNER-RECORD', item_id: '1.6',
  exercise_title: 'Stopping Potential and Threshold Frequency Analysis', page_title: 'Photoelectric effect',
  statement: String.raw`In a photoelectric effect experiment, frequency \(f_1\) gives \(V_{c1}=1.0\text{ V}\). At \(2f_1\), \(V_{c2}=3.5\text{ V}\). Find \(W\) and \(f_0\), and explain doubling the intensity.`,
  solution: String.raw`Einstein's energy conservation equation gives:

\[eV_c=hf-W\]

Subtracting the two equations gives:

\[hf_1=3.5\text{ eV}-1.0\text{ eV}=2.5\text{ eV}\]

Substituting back yields:

\[W=hf_1-1.0\text{ eV}=1.5\text{ eV}\]

At threshold the kinetic energy is zero:

\[hf_0=W\]

\[f_0=\frac{W}{h}=\frac{1.5\text{ eV}}{2.5\text{ eV}}f_1=\frac{3}{5}f_1=0.6f_1\]

Doubling intensity at fixed frequency increases photocurrent but not the stopping potential or maximum kinetic energy.`
};
let browser;
try {
  let port;
  for(let i=0;i<100&&!port;i++){try{port=(await readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];}catch{await sleep(100);}}
  assert.ok(port,'Chrome ready');
  const origin = `http://127.0.0.1:${port}`;
  const version = await (await fetch(origin+'/json/version')).json();
  browser = new CDP(version.webSocketDebuggerUrl);
  const tabs = () => fetch(origin+'/json/list').then(r=>r.json());
  const first = (await tabs()).find(t=>t.type==='page');
  const app = new CDP(first.webSocketDebuggerUrl);
  await app.send('Page.navigate',{url:base+'/?view=chapters'});
  for(let i=0;i<150;i++){if(await app.eval('!!(window.QMExerciseExport && window.TermoAIExercise && window.MathJax?.typesetPromise)'))break;await sleep(200);}
  const render = async (data, name) => {
    const before = new Set((await tabs()).map(t=>t.id));
    const result = await app.eval(`QMExerciseExport.open(${JSON.stringify(data)}, {formatText:TermoAIExercise.formatGeneratedText, metadata:'QA export fixture · Medium · 1.6', sourceUrl:'https://quantummechanicsbook.app/slides/chapter-01/photoelectric-effect.html'})`);
    assert.equal(result,'print');
    const target = (await tabs()).find(t=>t.type==='page'&&!before.has(t.id));
    assert.ok(target,'Print view opened');
    const print = new CDP(target.webSocketDebuggerUrl);
    const evidence = await print.eval(`({ready:document.body.dataset.exportReady, math:document.querySelectorAll('mjx-container svg').length, errors:document.querySelectorAll('[data-mml-node="merror"]').length, raw:/\\\\[()[\\]]/.test(document.querySelector('main').textContent), missingGlyphs:[...document.querySelectorAll('use')].filter(e=>!document.getElementById((e.getAttribute('href')||e.getAttribute('xlink:href')||'').slice(1))).length, opener:!!window.opener, scripts:document.scripts.length})`);
    assert.equal(evidence.ready,'true');assert.ok(evidence.math>10);assert.equal(evidence.errors,0);assert.equal(evidence.raw,false);assert.equal(evidence.missingGlyphs,0);assert.equal(evidence.opener,false);assert.equal(evidence.scripts,0);
    const pdf = await print.send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
    await writeFile(path.join(out,name+'.pdf'),Buffer.from(pdf.data,'base64'),{mode:0o600});
    // Printing remains usable after the original app's typeset nodes are cleared.
    await print.eval('window.print=()=>{window.__printed=true};document.getElementById("printExercise").click()');
    assert.equal(await print.eval('window.__printed'),true);
    await browser.send('Target.closeTarget',{targetId:target.id}); print.ws.close();
    return evidence;
  };
  const standard = await render(fixture,'exercise');
  const long = await render({...fixture,solution:Array(5).fill(fixture.solution).join('\n\n')},'exercise-long');
  const invalid = await app.eval(`(async()=>{try{await QMExerciseExport.open({...${JSON.stringify(fixture)},statement:String.raw\`\\[\\frac{1}\\]\`},{formatText:TermoAIExercise.formatGeneratedText,metadata:'QA',sourceUrl:''});return false;}catch(e){return e.message.includes('could not be rendered');}})()`);
  assert.equal(invalid,true,'Bad math stops export');
  const blocked = await app.eval(`(async()=>{const original=window.open;window.open=()=>null;try{await QMExerciseExport.open({},{});return false;}catch(e){return e.message.includes('Allow pop-ups');}finally{window.open=original;}})()`);
  assert.equal(blocked,true);
  const report = {base,standard,long,invalidMathBlocked:invalid,popupBlockedHandled:blocked,fixtureOnly:true};
  await writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));app.ws.close();
} finally {
  if(browser){await browser.send('Browser.close').catch(()=>{});browser.ws.close();}
  chrome.kill(); await sleep(500); await rm(profile,{recursive:true,force:true});
}
