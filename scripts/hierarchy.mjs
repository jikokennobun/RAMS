import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {root,readData} from './check.mjs';

export function validateHierarchy(h, evidenceExists=p=>existsSync(resolve(root,p))) {
  const ids=new Set();
  if(typeof h.profile!=='string' || !Array.isArray(h.principles) || !Array.isArray(h.rules)) throw Error('Invalid hierarchy');
  for(const p of h.principles) {if(!/^[A-Za-z0-9_]+$/.test(p.id)||ids.has(p.id)||typeof p.definition!=='string') throw Error('Invalid principle');ids.add(p.id);}
  const rules=new Set();
  const definitions={'DEF-001':[['gUFPP'],'gFPP'],'DEF-002':[['gUFPP'],'gU'],'DEF-003':[['gFPP','gU'],'gUFPP'],
    'DEF-004':[['gUTFPP'],'gTFPP'],'DEF-005':[['gUTFPP'],'gU'],'DEF-006':[['gTFPP','gU'],'gUTFPP'],'DEF-007':[['gTFPP'],'gFPP']};
  for(const r of h.rules) {
    if(!/^[A-Za-z0-9_-]+$/.test(r.id)||rules.has(r.id)) throw Error('Invalid rule ID');rules.add(r.id);
    if(!Array.isArray(r.premises)||!r.premises.length||!Array.isArray(r.assumptions)) throw Error('Rule needs premises and assumptions');
    for(const id of [...r.premises,...r.assumptions,r.conclusion]) if(!ids.has(id)) throw Error(`Unknown principle: ${id}`);
    if(!['definition','audited','pending','open','refuted'].includes(r.status)) throw Error('Invalid rule status');
    if(r.status==='definition') {
      const def=definitions[r.id];
      if(!def||JSON.stringify(def[0])!==JSON.stringify(r.premises)||def[1]!==r.conclusion||r.assumptions.length) throw Error('Unrecognized definitional rule');
    }
    if(['definition','audited'].includes(r.status)) {
      if(!r.evidence?.length || !r.evidence.every(p=>typeof p==='string' && !p.includes('..') && !/^[\\/]|:/.test(p) && evidenceExists(p))) throw Error('Rule evidence missing');
    }
    if(r.status==='audited' && (!r.audit?.length || !r.audit.some(p=>!r.evidence.includes(p)) || !r.audit.every(p=>typeof p==='string' && !p.includes('..') && !/^[\\/]|:/.test(p) && evidenceExists(p)))) throw Error('Rule requires separate audit');
  }
}

export function closure(h, seeds=[], assumptions=[]) {
  validateHierarchy(h);
  const ids=new Set(h.principles.map(p=>p.id));
  for(const p of [...seeds,...assumptions]) if(!ids.has(p)) throw Error(`Unknown seed: ${p}`);
  const known=new Set([...seeds,...assumptions]), provenance={};
  for(const p of known) provenance[p]={kind:seeds.includes(p)?'seed':'assumption'};
  let changed=true;
  while(changed) {
    changed=false;
    for(const r of h.rules.filter(r=>['definition','audited'].includes(r.status))) {
      if(!known.has(r.conclusion) && [...r.premises,...r.assumptions].every(p=>known.has(p))) {
        known.add(r.conclusion);provenance[r.conclusion]={rule:r.id,requires:[...r.premises,...r.assumptions]};changed=true;
      }
    }
  }
  return {profile:h.profile,seeds,assumptions,derived:[...known].sort(),provenance,excluded_rules:h.rules.filter(r=>!['definition','audited'].includes(r.status)).map(r=>({id:r.id,status:r.status}))};
}

export function diagram(h,{includePending=false}={}) {
  validateHierarchy(h);
  const lines=['flowchart LR'];
  for(const p of h.principles) lines.push(`  ${p.id}["${p.id}"]`);
  // Multiple premises and assumptions use conjunction nodes, never separate implication arrows.
  for(const r of h.rules) {
    if(!['definition','audited'].includes(r.status) && !(includePending && ['pending','open'].includes(r.status))) continue;
    const node=r.id.replaceAll('-','_'), link=['definition','audited'].includes(r.status)?'-->':'-.->';
    lines.push(`  ${node}{"${r.id}: AND (${r.status})"}`);
    for(const p of [...new Set([...r.premises,...r.assumptions])]) lines.push(`  ${p} ${link} ${node}`);
    lines.push(`  ${node} ${link} ${r.conclusion}`);
  }
  return lines.join('\n')+'\n';
}

export function checkConsistency(h,experimentSummary) {
  validateHierarchy(h);
  const conflicts=[],leadCountermodels=[],unsupported=[];
  for(const r of h.rules) {
    if(r.status==='refuted')continue;
    let supported=false;
    for(const model of experimentSummary.results??[]) {
      if(model.verified.profile!==h.profile||model.verified.complete!==true)throw Error('Experiment profile/completeness mismatch');
      const p=model.verified.properties,ids=[...r.premises,...r.assumptions,r.conclusion];
      if(!ids.every(id=>typeof p[id]==='boolean'))continue;supported=true;
      if([...r.premises,...r.assumptions].every(id=>p[id])&&!p[r.conclusion]) {
        const entry={rule:r.id,model_id:model.model_id,profile:h.profile,failed:r.conclusion,witness:model.verified.failures[r.conclusion]??null};
        (['definition','audited'].includes(r.status)?conflicts:leadCountermodels).push(entry);break;
      }
    }
    if(!supported)unsupported.push(r.id);
  }
  return {profile:h.profile,conflicts,lead_countermodels:leadCountermodels,unsupported_rules:unsupported,note:'Absence of a finite countermodel is not a proof.'};
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const h=readData('hierarchy'), seeds=(process.argv.find(x=>x.startsWith('--seed='))?.slice(7)??'gUFPP').split(',').filter(Boolean);
  const assumptions=(process.argv.find(x=>x.startsWith('--assume='))?.slice(9)??'').split(',').filter(Boolean);
  const dir=resolve(root,'research/generated');mkdirSync(dir,{recursive:true});
  const result=closure(h,seeds,assumptions);
  writeFileSync(resolve(dir,'hierarchy.json'),JSON.stringify(result,null,2)+'\n');
  writeFileSync(resolve(dir,'hierarchy.mmd'),diagram(h));
  writeFileSync(resolve(dir,'research-leads.mmd'),diagram(h,{includePending:true}));
  console.log(JSON.stringify(result,null,2));
}
