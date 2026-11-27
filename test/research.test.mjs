import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateAlgebra,guardedClosure} from '../scripts/finite-model.mjs';
import {readData,validateLedgers} from '../scripts/check.mjs';
const model = name=>JSON.parse(readFileSync(new URL(`../models/boolean-${name}.json`,import.meta.url),'utf8'));

test('identity modality has a guarded identity with two fixed points',()=>{
  const m=model('identity');
  assert.deepEqual(validateAlgebra(m).axioms,{N:true,K:true,'4':true});
  const result=guardedClosure(m);
  assert.equal(result.complete,true);assert.equal(result.gFPP,false);assert.equal(result.gU,false);
  assert.ok(result.failures.some(f=>f.fixedPoints.length===2));
  assert.ok(result.failures.some(f=>f.fixedPoints.length===0));
  assert.equal(result.guardedCount,4);
});
test('constant-top modality gives only constant guarded functions',()=>{
  const result=guardedClosure(model('constant-top'));
  assert.equal(result.guardedCount,2);assert.equal(result.gUFPP,true);
});
test('non-idempotent three-element MV algebra satisfies residuation and guarded unique existence',()=>{
  const m=JSON.parse(readFileSync(new URL('../models/mv-three-constant-top.json',import.meta.url),'utf8'));
  assert.notEqual(m.product[1][1],1);
  assert.deepEqual(validateAlgebra(m).axioms,{N:true,K:true,'4':true});
  const result=guardedClosure(m);
  assert.equal(result.guardedCount,3);assert.equal(result.gUFPP,true);
});
test('incorrect residual tables are rejected',()=>{
  const m=model('identity');m.residual[1][0]=1;
  assert.throws(()=>validateAlgebra(m),/Residuation/);
});
test('state bound cannot be reported as complete',()=>assert.throws(()=>guardedClosure(model('identity'),{maxFunctions:2}),/INCOMPLETE/));
test('modal failures are distinguished from algebra validity',()=>{
  const m=model('identity');m.box=[0,0];assert.equal(validateAlgebra(m).axioms.N,false);
});
test('general claim needs proof and separate audit',()=>{
  const sources=readData('sources'),claims=readData('claims'),tasks=readData('tasks');
  claims[0].status='proved';
  claims[0].evidence=[];
  assert.throws(()=>validateLedgers(sources,claims,tasks),/Evidence required/);
  claims[0].evidence=['research/proof.md'];
  assert.throws(()=>validateLedgers(sources,claims,tasks,()=>true),/Separate audit/);
});
test('finite checks cannot promote an unrestricted theorem',()=>{
  const claims=readData('claims');claims[0].status='finite_checked';claims[0].evidence=['proof.md'];
  assert.throws(()=>validateLedgers(readData('sources'),claims,readData('tasks'),()=>true),/Finite checks cannot/);
});
test('task dependency cycles are rejected',()=>{
  const tasks=readData('tasks');for(const t of tasks)t.status='queued';tasks[0].depends_on=['RAMS-Q002'];
  assert.throws(()=>validateLedgers(readData('sources'),readData('claims'),tasks),/cycle/);
});
