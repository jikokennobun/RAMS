import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {root} from './check.mjs';
import {validateAlgebra,guardedClosure} from './finite-model.mjs';
import {makeCertificate,verifyCertificate} from './certificate.mjs';

// Reconstruct and exhaustively verify the tables. Do not execute attached code.
const model=JSON.parse(readFileSync(resolve(root,'models/mv-three-threshold.json'),'utf8'));
const base=validateAlgebra(model),certificate=makeCertificate(model,guardedClosure(model)),result=verifyCertificate(certificate);
if(!Object.values(base.axioms).every(Boolean)||!result.properties.IA_box||result.properties.Mix||result.properties.SC)throw Error('v10 threshold witness does not satisfy the recorded separation');
const output=resolve(root,'research/evidence/v11');mkdirSync(output,{recursive:true});
const entries={'ia-threshold-certificate.json':certificate,'ia-threshold-result.json':{...result,claim_id:'RAMS-C006',source_ids:['S004','S005'],method:'operation tables + independent exhaustive evaluator; attached Python not executed'}};
for(const [name,value]of Object.entries(entries)) {
  const path=resolve(output,name),text=JSON.stringify(value,null,2)+'\n';
  if(process.argv.includes('--check')) {if(readFileSync(path,'utf8')!==text)throw Error(`Witness evidence changed: ${name}`);}
  else writeFileSync(path,text);
}
console.log(JSON.stringify({model:model.id,properties:result.properties,scope:result.scope,mix_failure:result.failures.Mix}));
