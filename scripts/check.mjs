import {readFileSync,existsSync} from 'node:fs';
import {resolve,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const readData = name => JSON.parse(readFileSync(resolve(root,`data/${name}.json`),'utf8'));
export function validateLedgers(sources,claims,tasks, evidenceExists = p => existsSync(resolve(root,p))) {
  const assert = (condition,message) => {if (!condition) throw Error(message);};
  const ids = list => {
    assert(Array.isArray(list),'Ledger must be an array');
    const set = new Set();
    for (const item of list) {assert(typeof item.id==='string' && item.id.length>0 && !set.has(item.id),'Missing or duplicate ID');set.add(item.id);}
    return set;
  };
  const ss=ids(sources), cs=ids(claims), ts=ids(tasks);
  const refs = (list,set,label) => {assert(Array.isArray(list),`Missing ${label}`);for(const id of list) assert(set.has(id),`Unknown ${label}: ${id}`);};
  const evidence = p => {
    assert(typeof p === 'string' && p.length>0,'Invalid evidence path');
    const rel=relative(root,resolve(root,p));
    assert(!isAbsolute(p) && rel !== '..' && !rel.startsWith('../') && !rel.startsWith('..\\'),'Evidence must be inside repository');
    assert(evidenceExists(p),`Missing evidence: ${p}`);
  };
  for(const s of sources) {
    assert(typeof s.title==='string','Missing source title');
    if(s.path) {
      evidence(s.path);assert(/^[a-f0-9]{64}$/.test(s.sha256),'Missing source SHA-256');
      assert(createHash('sha256').update(readFileSync(resolve(root,s.path))).digest('hex')===s.sha256,`Source hash mismatch: ${s.id}`);
    } else assert(/^https:\/\//.test(s.url),'Missing source URL or local path');
  }
  for(const c of claims) {
    assert(['pending','proved','finite_checked','sampled','refuted'].includes(c.status),`Invalid claim status: ${c.id}`);
    assert(typeof c.statement==='string' && c.statement.length>0,'Missing statement');
    assert(Array.isArray(c.assumptions) && c.assumptions.length>0,'Missing assumptions');
    assert(typeof c.scope==='string' && c.scope.length>0,'Missing scope');
    assert(['unchecked','known','candidate','checked'].includes(c.novelty),'Invalid novelty status');
    refs(c.source_ids,ss,'source');
    assert(Array.isArray(c.evidence) && Array.isArray(c.audit),'Missing evidence/audit lists');
    for(const p of [...c.evidence,...c.audit]) evidence(p);
    if(c.status!=='pending') assert(c.evidence.length>0,`Evidence required: ${c.id}`);
    if(c.status==='proved') assert(c.audit.length>0 && c.audit.some(p=>!c.evidence.includes(p)),`Separate audit required: ${c.id}`);
    if(c.status==='finite_checked') assert(c.scope==='finite_instance',`Finite checks cannot certify general theorems: ${c.id}`);
  }
  for(const t of tasks) {
    assert(['queued','ready','running','blocked','done'].includes(t.status),'Invalid task status');
    assert(Number.isInteger(t.priority) && t.priority>0,'Invalid priority');
    assert(typeof t.objective==='string' && t.objective.length>0,'Missing objective');
    assert(Array.isArray(t.deliverables) && t.deliverables.length>0,'Missing deliverables');
    refs(t.source_ids,ss,'source'); refs(t.claim_ids,cs,'claim');refs(t.depends_on,ts,'task');
    if(['ready','running','done'].includes(t.status)) for(const dep of t.depends_on) assert(tasks.find(x=>x.id===dep).status==='done',`Unmet dependency: ${t.id} -> ${dep}`);
    if(t.status==='done') for(const p of t.deliverables) evidence(p);
  }
  const active = new Set(), done = new Set();
  function visit(id) {assert(!active.has(id),`Task dependency cycle: ${id}`);if(done.has(id))return;active.add(id);for(const dep of tasks.find(t=>t.id===id).depends_on) visit(dep);active.delete(id);done.add(id);}
  for(const t of tasks) visit(t.id);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const sources=readData('sources'), claims=readData('claims'), tasks=readData('tasks');
  validateLedgers(sources,claims,tasks);
  console.log(`Validated ${sources.length} sources, ${claims.length} claims, ${tasks.length} tasks.`);
}
