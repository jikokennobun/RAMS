import {createHash} from 'node:crypto';

const operations=['meet','join','product','residual'];
export const modelHash=m=>createHash('sha256').update(JSON.stringify(m)).digest('hex');

// Independent evaluator: order is reconstructed as a relation, then lattice
// universal properties and residual greatest-solution sets are checked.
export function independentAlgebraCheck(m) {
  const n=m.elements?.length;
  const ok=(b,msg)=>{if(!b) throw Error(`Certificate: ${msg}`);};
  ok(Number.isInteger(n)&&n>0&&n<=16,'carrier size');
  const A=Array.from({length:n},(_,i)=>i), valid=x=>Number.isInteger(x)&&A.includes(x);
  ok(new Set(m.elements).size===n,'duplicate element');
  ok(valid(m.bottom)&&valid(m.top),'bounds');
  for(const op of operations) ok(Array.isArray(m[op])&&m[op].length===n&&m[op].every(row=>Array.isArray(row)&&row.length===n&&row.every(valid)),`table ${op}`);
  ok(Array.isArray(m.box)&&m.box.length===n&&m.box.every(valid),'box');
  const order=A.map(a=>A.map(b=>m.meet[a][b]===a));
  const le=(a,b)=>order[a][b];
  for(const a of A) {
    ok(le(a,a)&&le(m.bottom,a)&&le(a,m.top),'reflexivity/bounds');
    ok(m.product[a][m.top]===a&&m.product[m.top][a]===a,'monoid identity');
    for(const b of A) {
      ok(!(le(a,b)&&le(b,a))||a===b,'antisymmetry');
      ok(m.product[a][b]===m.product[b][a],'commutativity');
      const lower=A.filter(x=>le(x,a)&&le(x,b));
      const upper=A.filter(x=>le(a,x)&&le(b,x));
      ok(lower.includes(m.meet[a][b])&&lower.every(x=>le(x,m.meet[a][b])),'greatest lower bound');
      ok(upper.includes(m.join[a][b])&&upper.every(x=>le(m.join[a][b],x)),'least upper bound');
      const solutions=A.filter(x=>le(m.product[a][x],b));
      ok(solutions.includes(m.residual[a][b])&&solutions.every(x=>le(x,m.residual[a][b])),'residual greatest solution');
      for(const c of A) {
        ok(!(le(a,b)&&le(b,c))||le(a,c),'transitivity');
        ok(m.product[m.product[a][b]][c]===m.product[a][m.product[b][c]],'associativity');
        ok(!le(a,b)||le(m.product[a][c],m.product[b][c]),'product monotonicity');
      }
    }
  }
  const properties={N:m.box[m.top]===m.top,K:true,'4':true,Lob:true,FLob:true,SC:true,IA_box:true};
  const failures={};
  function record(key,witness) {properties[key]=false;failures[key]??=witness;}
  for(const a of A) {
    if(!le(m.box[a],m.box[m.box[a]]))record('4',{a});
    if(le(m.box[a],a)&&a!==m.top)record('Lob',{a});
    if(!le(m.box[m.residual[m.box[a]][a]],m.box[a]))record('FLob',{a});
    if(!A.some(p=>p===m.residual[m.box[p]][a]))record('SC',{a,solutions:[]});
    if(m.box[m.product[a][m.box[a]]]!==m.box[a])record('IA_box',{a});
    for(const b of A) if(!le(m.box[m.residual[a][b]],m.residual[m.box[a]][m.box[b]]))record('K',{a,b});
  }
  return {properties,failures};
}

export function makeCertificate(model,closure) {
  return {format:'rams-finite-v1',profile:'working-bicrl-v1',scope:'finite_instance',model,model_hash:modelHash(model),complete:closure.complete,entries:closure.entries};
}

export function verifyCertificate(c,{maxStates=10000,maxMs=5000}={}) {
  const started=performance.now(),checkTime=()=>{if(performance.now()-started>maxMs)throw Error('INCOMPLETE: certificate verification time bound');};
  if(c.format!=='rams-finite-v1'||c.profile!=='working-bicrl-v1'||c.scope!=='finite_instance'||c.complete!==true) throw Error('Invalid certificate format/scope/completeness');
  if(c.model_hash!==modelHash(c.model)) throw Error('Model hash mismatch');
  const base=independentAlgebraCheck(c.model),n=c.model.elements.length;
  if(!Array.isArray(c.entries)||c.entries.length>maxStates)throw Error('Certificate state limit');
  const entries=c.entries,keys=new Set();
  const key=(v,g)=>`${g}:${v.join(',')}`;
  function must(v,g) {if(!keys.has(key(v,g))) throw Error('Certificate is not saturated');}
  for(let i=0;i<entries.length;i++) {
    checkTime();
    const e=entries[i],t=e.term;
    if(!t||!Array.isArray(e.values)||e.values.length!==n||typeof e.guarded!=='boolean')throw Error('Invalid state');
    let actual,guarded;
    if(Object.hasOwn(t,'constant')) {
      if(!Number.isInteger(t.constant)||t.constant<0||t.constant>=n)throw Error('Invalid constant');
      actual=Array(n).fill(t.constant);guarded=true;
    } else if(t.variable==='x') {actual=Array.from({length:n},(_,x)=>x);guarded=false;}
    else {
      if(!Array.isArray(t.args)||!t.args.every(j=>Number.isInteger(j)&&j>=0&&j<i))throw Error('Forward/cyclic term reference');
      if(t.op==='box'&&t.args.length===1) {actual=entries[t.args[0]].values.map(x=>c.model.box[x]);guarded=true;}
      else if(operations.includes(t.op)&&t.args.length===2) {
        const [a,b]=t.args.map(j=>entries[j]);actual=a.values.map((x,k)=>c.model[t.op][x][b.values[k]]);guarded=a.guarded&&b.guarded;
      } else throw Error('Unknown term operation');
    }
    if(JSON.stringify(actual)!==JSON.stringify(e.values)||guarded!==e.guarded)throw Error('Term evaluation/guard mismatch');
    if(keys.has(key(e.values,e.guarded)))throw Error('Duplicate state');keys.add(key(e.values,e.guarded));
  }
  for(let a=0;a<n;a++)must(Array(n).fill(a),true);
  must(Array.from({length:n},(_,x)=>x),false);
  for(const a of entries) {
    checkTime();must(a.values.map(x=>c.model.box[x]),true);
    for(const b of entries) {
      checkTime();
      for(const op of operations)must(a.values.map((x,k)=>c.model[op][x][b.values[k]]),a.guarded&&b.guarded);
    }
  }
  const failures={},properties={...base.properties,gFPP:true,gU:true,gUFPP:true};
  for(let i=0;i<entries.length;i++)if(entries[i].guarded) {
    const fixed=entries[i].values.flatMap((v,x)=>v===x?[x]:[]);
    if(!fixed.length) {properties.gFPP=false;failures.gFPP??={entry:i,values:entries[i].values,fixed_points:fixed};}
    if(fixed.length>1) {properties.gU=false;failures.gU??={entry:i,values:entries[i].values,fixed_points:fixed};}
  }
  properties.gUFPP=properties.gFPP&&properties.gU;
  if(!properties.gUFPP) failures.gUFPP=failures.gFPP??failures.gU;
  return {profile:c.profile,scope:c.scope,complete:true,model_hash:c.model_hash,properties,failures:{...base.failures,...failures},state_count:entries.length};
}
