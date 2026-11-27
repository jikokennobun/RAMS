import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {root} from './check.mjs';
import {validateAlgebra,guardedClosure} from './finite-model.mjs';
import {makeCertificate,verifyCertificate} from './certificate.mjs';

export function chainModel(size,kind,box) {
  if(!Number.isInteger(size)||size<2||size>4||!['mv','godel'].includes(kind)) throw Error('Supported chain sizes: 2..4, kinds: mv/godel');
  const A=Array.from({length:size},(_,i)=>i), table=f=>A.map(a=>A.map(b=>f(a,b)));
  return {id:`${kind}-${size}-box-${box.join('')}`,elements:A.map(String),bottom:0,top:size-1,
    meet:table(Math.min),join:table(Math.max),product:table(kind==='mv'?(a,b)=>Math.max(0,a+b-size+1):Math.min),
    residual:table(kind==='mv'?(a,b)=>Math.min(size-1,size-1-a+b):(a,b)=>a<=b?size-1:b),box};
}

export function enumerate({sizes=[2,3],kinds=['mv','godel'],maxFunctions=1000,maxMs=1000,totalMs=30000}={}) {
  const start=performance.now(),results=[],incomplete=[];
  let considered=0,eligible=0;
  for(const size of sizes)for(const kind of kinds) {
    if(!Number.isInteger(size)||size<2||size>4)throw Error('Supported chain sizes: 2..4');
    for(let index=0;index<size**size;index++) {
      if(performance.now()-start>totalMs) return {scope:'enumerated finite chains and box tables only',complete:false,reason:'total time bound',considered,eligible,results,incomplete};
      let digits=index;const box=Array.from({length:size},()=>{const x=digits%size;digits=Math.floor(digits/size);return x;});
      const model=chainModel(size,kind,box);considered++;
      const base=validateAlgebra(model);if(!Object.values(base.axioms).every(Boolean))continue;eligible++;
      try {
        const saturated=guardedClosure(model,{maxFunctions,maxMs});
        const certificate=makeCertificate(model,saturated),verified=verifyCertificate(certificate,{maxStates:maxFunctions,maxMs});
        results.push({model_id:model.id,certificate,verified});
      }catch(error) {
        if(!error.message.startsWith('INCOMPLETE:'))throw error;
        incomplete.push({model_id:model.id,reason:error.message});
      }
    }
  }
  return {scope:'enumerated finite chains and box tables only; not all finite RAMS',complete:incomplete.length===0,considered,eligible,results,incomplete};
}

export function separations(result) {
  const found=new Map();
  for(const r of result.results) {
    const p=r.verified.properties;
    for(const a of Object.keys(p).filter(k=>p[k]))for(const b of Object.keys(p).filter(k=>!p[k])) {
      const key=`${a}->${b}`;
      if(!found.has(key)) found.set(key,{premises:['N','K','4',a],failed:b,witness_model:r.model_id,scope:'finite countermodel under working-bicrl-v1',witness:r.verified.failures[b]??null});
    }
  }
  return [...found.values()];
}

export function saveExperiments(result,out) {
  mkdirSync(resolve(out,'certificates'),{recursive:true});
  for(const r of result.results)writeFileSync(resolve(out,'certificates',`${r.model_id}.json`),JSON.stringify(r.certificate,null,2)+'\n');
  const summary={...result,results:result.results.map(({certificate,...r})=>({...r,certificate_path:`certificates/${r.model_id}.json` })),separations:separations(result),unsupported:['gTFPP','gUTFPP','MC','uMC','AMC','uAMC','Mix','sLob']};
  writeFileSync(resolve(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');
  return summary;
}

export function loadVerifiedExperiments(out) {
  const summary=JSON.parse(readFileSync(resolve(out,'summary.json'),'utf8'));
  for(const record of summary.results) {
    const path=record.certificate_path,rel=typeof path==='string'?relative(out,resolve(out,path)):null;
    if(typeof path!=='string'||isAbsolute(path)||rel==='..'||rel.startsWith('../')||rel.startsWith('..\\'))throw Error('Invalid certificate path');
    const verified=verifyCertificate(JSON.parse(readFileSync(resolve(out,path),'utf8')));
    if(JSON.stringify(verified)!==JSON.stringify(record.verified))throw Error('Cached experiment result differs from certificate');
    record.verified=verified;
  }
  summary.separations=separations(summary);return summary;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv[2]==='verify') {
    if(!process.argv[3])throw Error('Certificate path required');
    console.log(JSON.stringify(verifyCertificate(JSON.parse(readFileSync(process.argv[3],'utf8'))),null,2));
  } else {
    const out=resolve(root,'research/generated/experiments');
    const result=saveExperiments(enumerate(),out);
    console.log(JSON.stringify({output:out,considered:result.considered,eligible:result.eligible,complete:result.complete,separations:result.separations.length,incomplete:result.incomplete}));
    if(!result.complete)process.exitCode=2;
  }
}
