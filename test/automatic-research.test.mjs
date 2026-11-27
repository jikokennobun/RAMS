import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,existsSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname,basename} from 'node:path';
import {readData} from '../scripts/check.mjs';
import {closure,diagram,validateHierarchy,checkConsistency} from '../scripts/hierarchy.mjs';
import {guardedClosure} from '../scripts/finite-model.mjs';
import {makeCertificate,verifyCertificate} from '../scripts/certificate.mjs';
import {chainModel,enumerate,separations,saveExperiments,loadVerifiedExperiments} from '../scripts/experiments.mjs';
import {loadContext,selectTasks,validateStage,validateProgram,runTask,listRuns,runProcess,parseArgs,updateInbox} from '../scripts/research-system.mjs';

function temporary(t) {
  const path=mkdtempSync(resolve(tmpdir(),'rams-system-test-'));
  t.after(()=>{
    if(dirname(path)!==resolve(tmpdir())||!basename(path).startsWith('rams-system-test-'))throw Error('Unsafe test cleanup path');
    rmSync(path,{recursive:true,force:true});
  });
  return path;
}
const result=role=>({role,outcome:'inconclusive',summary:'TEST FIXTURE: no mathematical conclusion',report_markdown:'# TEST FIXTURE\nNo theorem was proved.',assumptions:[],missing_inputs:[],proposals:[],next_questions:[]});
const task={id:'AUTO-001',title:'Test task'};
const context={hierarchy:{profile:'test-profile'}};

test('conjunctive fixed-point rules require both premises',()=>{
  const h=readData('hierarchy');
  assert.equal(closure(h,['gFPP']).derived.includes('gUFPP'),false);
  assert.equal(closure(h,['gFPP','gU']).derived.includes('gUFPP'),true);
  assert.equal(closure(h,['AMC']).derived.includes('uAMC'),false);
});
test('audited conditional rules require all extra assumptions',()=>{
  const h=readData('hierarchy'),r=h.rules.find(r=>r.id==='LEAD-001');
  r.status='audited';r.evidence=['research/definitions.md'];r.audit=['docs/workflow.md'];
  r.assumptions=['N','K','4','IA_box'];
  assert.equal(closure(h,['SC'],['N','K','4']).derived.includes('FLob'),false);
  const full=closure(h,['SC'],['N','K','4','IA_box']);
  assert.equal(full.derived.includes('FLob'),true);assert.equal(full.provenance.FLob.rule,'LEAD-001');
});
test('unrecognized definition cannot smuggle in a conjecture',()=>{
  const h=readData('hierarchy');h.rules[0].conclusion='gTFPP';
  assert.throws(()=>validateHierarchy(h),/Unrecognized definitional/);
});
test('diagram preserves conjunction and labels speculative rules',()=>{
  const text=diagram(readData('hierarchy'),{includePending:true});
  assert.match(text,/DEF-003: AND/);assert.match(text,/LEAD-006: AND \(open\)/);
  assert.equal(text.includes('gFPP --> gUFPP'),false);
});
test('independent certificate checker rejects false function values and incomplete closure',()=>{
  const m=chainModel(2,'mv',[0,1]),c=makeCertificate(m,guardedClosure(m));
  const verified=verifyCertificate(c);assert.equal(verified.properties.gU,false);assert.equal(verified.scope,'finite_instance');
  assert.equal(Object.hasOwn(verified.properties,'gTFPP'),false);
  const damaged=structuredClone(c);damaged.entries[0].values[0]=1;
  assert.throws(()=>verifyCertificate(damaged),/evaluation/);
  const missing=structuredClone(c);missing.entries.pop();
  assert.throws(()=>verifyCertificate(missing),/not saturated/);
  const modelChanged=structuredClone(c);modelChanged.model.box=[1,1];
  assert.throws(()=>verifyCertificate(modelChanged),/hash/);
});
test('enumeration reports its actual scope and countermodel witnesses',()=>{
  const found=enumerate({sizes:[2],kinds:['mv']});
  assert.equal(found.considered,4);assert.equal(found.complete,true);
  assert.ok(found.results.every(r=>r.verified.properties.N&&r.verified.properties.K&&r.verified.properties['4']));
  const sep=separations(found);
  assert.ok(sep.some(s=>s.failed==='gU'&&s.witness.fixed_points.length===2));
  assert.equal(sep.some(s=>s.failed==='gTFPP'),false);
});
test('exhaustion is incomplete, never absence of a countermodel',()=>{
  const found=enumerate({sizes:[2],kinds:['mv'],maxFunctions:1});
  assert.equal(found.complete,false);assert.equal(found.results.length,0);assert.ok(found.incomplete.length>0);
  assert.equal(enumerate({totalMs:-1}).complete,false);
});
test('finite witnesses flag erroneous accepted implications without silently changing rules',()=>{
  const h=readData('hierarchy'),r=h.rules.find(r=>r.id==='LEAD-001');
  r.premises=['N'];r.assumptions=[];r.conclusion='gU';r.status='audited';r.evidence=['research/definitions.md'];r.audit=['docs/workflow.md'];
  const integrity=checkConsistency(h,enumerate({sizes:[2],kinds:['mv']}));
  assert.equal(integrity.conflicts[0].rule,'LEAD-001');assert.equal(r.status,'audited');
  assert.ok(integrity.unsupported_rules.includes('LEAD-006'));
});
test('cached experiments must match independently rechecked certificates',t=>{
  const out=temporary(t);saveExperiments(enumerate({sizes:[2],kinds:['mv']}),out);
  assert.ok(loadVerifiedExperiments(out).results.length>0);
  const path=resolve(out,'summary.json'),summary=JSON.parse(readFileSync(path,'utf8'));
  summary.results[0].verified.properties.gU=!summary.results[0].verified.properties.gU;
  writeFileSync(path,JSON.stringify(summary));
  assert.throws(()=>loadVerifiedExperiments(out),/differs from certificate/);
});
test('program refuses dependency cycles and undeclared claim references',()=>{
  const p=readData('research-program');
  p.tasks[0].depends_on=['AUTO-002'];p.tasks[1].depends_on=['AUTO-001'];
  assert.throws(()=>validateProgram(p,readData('hierarchy'),readData('claims'),readData('sources')),/cycle/);
});
test('task selector skips original-dependent and previously attempted tasks',()=>{
  const p=readData('research-program');
  assert.equal(selectTasks(p,[])[0].id,'AUTO-001');
  assert.equal(selectTasks(p,[{task_id:'AUTO-001',status:'error'}])[0].id,'AUTO-002');
  assert.equal(selectTasks(p,[],{taskId:'AUTO-007'})[0].id,'AUTO-007');
  const blocked=structuredClone(p);blocked.tasks.find(t=>t.id==='AUTO-007').needs_originals=true;
  assert.throws(()=>selectTasks(blocked,[],{taskId:'AUTO-007'}),/blocked/);
  assert.throws(()=>selectTasks(p,[],{maxTasks:21}),/1..20/);
});
test('strict stage validation rejects role confusion and status promotion',()=>{
  assert.throws(()=>validateStage(result('audit'),'discovery'),/Invalid stage result/);
  assert.throws(()=>validateStage({...result('audit'),outcome:'proved'},'audit'),/Invalid stage result/);
  assert.throws(()=>validateStage({...result('audit'),extra:'unexpected'},'audit'),/fields/);
});
test('complete pipeline uses three role invocations and leaves proposals pending',async t=>{
  const runRoot=temporary(t),calls=[];
  const manifest=await runTask({task,context,input_hash:'test-hash',runRoot,execute:async({role,prompt})=>{
    calls.push(role);assert.match(prompt,/untrusted/);
    return {...result(role),proposals:[{kind:'question',statement:'TEST only',premises:[],conclusion:'test',assumptions:[],evidence_summary:'fixture'}]};
  }});
  assert.deepEqual(calls,['discovery','counterexample','audit']);assert.equal(manifest.status,'review_required');
  assert.equal(existsSync(resolve(runRoot,'.research.lock')),false);
  const proposals=JSON.parse(readFileSync(resolve(runRoot,manifest.id,'proposals.json'),'utf8'));
  assert.ok(proposals.every(p=>p.status==='pending'));
  const out=resolve(runRoot,'generated');assert.equal(updateInbox(runRoot,out).length,3);
});
test('blocked discovery stops before additional model calls',async t=>{
  const runRoot=temporary(t),calls=[];
  const manifest=await runTask({task,context,input_hash:'test-hash',runRoot,execute:async({role})=>{calls.push(role);return {...result(role),outcome:'blocked'};}});
  assert.deepEqual(calls,['discovery']);assert.equal(manifest.status,'blocked');
});
test('failed pipeline resumes completed stages and rejects changed input',async t=>{
  const runRoot=temporary(t);
  await assert.rejects(runTask({task,context,input_hash:'hash',runRoot,execute:async({role})=>{if(role==='counterexample')throw Error('worker failed');return result(role);}}),/worker failed/);
  const run=listRuns(runRoot)[0];assert.equal(run.status,'error');assert.equal(run.stages.length,1);
  await assert.rejects(runTask({task,context,input_hash:'changed',runRoot,resumeId:run.id,execute:async({role})=>result(role)}),/hash changed/);
  const calls=[];
  const resumed=await runTask({task,context,input_hash:'hash',runRoot,resumeId:run.id,execute:async({role})=>{calls.push(role);return result(role);}});
  assert.deepEqual(calls,['counterexample','audit']);assert.equal(resumed.status,'review_required');
});
test('concurrent run cannot acquire another process lock',async t=>{
  const runRoot=temporary(t);writeFileSync(resolve(runRoot,'.research.lock'),'existing');
  await assert.rejects(runTask({task,context,input_hash:'hash',runRoot}),/lock unavailable/);
  assert.equal(readFileSync(resolve(runRoot,'.research.lock'),'utf8'),'existing');
});
test('stage output and wall time are bounded',async()=>{
  const unicode=await runProcess(process.execPath,['-e',"process.stdout.write(Buffer.from([0xe6]));setTimeout(()=>process.stdout.write(Buffer.from([0x97,0xa5])),10)"],{timeoutMs:2000});
  assert.equal(unicode.stdout,'日');
  await assert.rejects(runProcess(process.execPath,['-e','setInterval(()=>{},1000)'],{timeoutMs:100}),/TIMEOUT/);
  await assert.rejects(runProcess(process.execPath,['-e',"console.log('x'.repeat(2048))"],{timeoutMs:2000,maxLogBytes:128}),/OUTPUT_LIMIT/);
});
test('CLI limits and missing/unknown arguments fail before launching research',()=>{
  assert.throws(()=>parseArgs(['run','--timeout-seconds','0']),/1..3600/);
  assert.throws(()=>parseArgs(['run','--unknown']),/Unknown/);
  assert.throws(()=>parseArgs(['run','--resume','x','--task','AUTO-001']),/without/);
});
test('real ledgers load without promoting original-dependent claims',()=>{
  const loaded=loadContext();assert.equal(loaded.input_hash.length,64);
  assert.ok(loaded.context.claims.filter(c=>c.scope!=='finite_instance').every(c=>c.status==='pending'));
});
