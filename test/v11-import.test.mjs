import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {root,readData,validateLedgers} from '../scripts/check.mjs';
import {checkImport,splitTableRow,extractRegistry,extractSourceSections,originalPath} from '../scripts/import-v11.mjs';
import {loadContext,stagePrompt,validateProgram} from '../scripts/research-system.mjs';
import {queryCatalog} from '../scripts/catalog.mjs';
import {verifyCertificate} from '../scripts/certificate.mjs';

test('all original files, archive manifest hashes and exact table counts survive import',()=>{
  const index=checkImport();assert.equal(index.originals.length,19);assert.equal(index.archive_manifest_checks.length,15);
  assert.deepEqual(index.registries.map(r=>r.count),[235,446,56,13,113,19]);
  assert.equal(index.sections.length,19);
});
test('table parser preserves escaped pipes and rejects column/count loss',()=>{
  assert.deepEqual(splitTableRow('| x | a\\|b |'),['x','a\\|b']);
  const lines=['<a id="rams-part5"></a>','| id | name |','| --- | --- |','| x | a\\|b |'];
  assert.equal(extractRegistry(lines,5,1).records[0].raw.name,'a\\|b');
  assert.throws(()=>extractRegistry(lines,5,2),/Count mismatch/);
  assert.throws(()=>extractRegistry([...lines,'| z | too | many |'],5,2),/Column mismatch/);
});
test('source statuses and overloaded IDs are not promoted or merged',()=>{
  const verification=queryCatalog({registry:'verification',query:'N11-08'});
  assert.equal(verification.records[0].raw.status,'open');assert.equal(verification.records[0].repository_status,'pending');
  const index=checkImport(),section=index.sections.find(s=>s.id==='N11-08');
  assert.match(section.text,/算術的・言語的接続/);
  assert.equal(section.key,'S005:proof:N11-08');assert.notEqual(section.key,verification.records[0].key);
  const relation=queryCatalog({registry:'relations',query:'N11e1'});
  assert.equal(relation.records[0].raw.grade,'proved-in-note');assert.equal(relation.records[0].repository_status,'pending');
});
test('original-source task prompts include the correct excerpts and exclude handoff instructions',()=>{
  const {context}=loadContext(),task=context.program.tasks.find(t=>t.id==='AUTO-009');
  const prompt=stagePrompt(task,'audit',context,[],{});
  assert.match(prompt,/N11-05/);assert.match(prompt,/Baire/);assert.match(prompt,/source_sha256/);
  assert.equal(prompt.includes('Tasks in order:'),false);
  const text=readFileSync(resolve(root,originalPath),'utf8');assert.ok(text.includes('Tasks in order:'));
});
test('definition-reviewed tasks cannot silently drop their evidence',()=>{
  const {context}=loadContext(),program=structuredClone(context.program);
  program.tasks[0].definition_review='research/reports/not-found.md';
  assert.throws(()=>validateProgram(program,context.hierarchy,context.claims,context.sources,context.materials),/definition review/);
});
test('finite IA threshold witness is independently verified and only finite_checked',()=>{
  const certificate=JSON.parse(readFileSync(resolve(root,'research/evidence/v11/ia-threshold-certificate.json'),'utf8'));
  const result=verifyCertificate(certificate);assert.equal(result.properties.IA_box,true);assert.equal(result.properties.Mix,false);
  assert.equal(result.properties.SC,false);assert.deepEqual(result.failures.Mix,{a:0});
  const claim=readData('claims').find(c=>c.id==='RAMS-C006');assert.equal(claim.scope,'finite_instance');assert.equal(claim.status,'finite_checked');
});
test('local source hashes are enforced and no general source claim becomes proved',()=>{
  const sources=readData('sources'),claims=readData('claims'),tasks=readData('tasks');
  sources.find(s=>s.id==='S005').sha256='0'.repeat(64);
  assert.throws(()=>validateLedgers(sources,claims,tasks),/hash mismatch/);
  assert.ok(claims.filter(c=>c.scope!=='finite_instance').every(c=>c.status==='pending'));
});
