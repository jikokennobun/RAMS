import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {root} from './check.mjs';
import {checkImport} from './import-v11.mjs';

export function queryCatalog({registry='principles',query='',limit=20}={}) {
  const index=checkImport(),catalog=index.registries.find(r=>r.name===registry);
  if(!catalog)throw Error('Unknown registry');
  if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('limit must be 1..100');
  const table=JSON.parse(readFileSync(resolve(root,catalog.path),'utf8'));
  const matched=table.records.filter(r=>JSON.stringify(r.raw).toLowerCase().includes(query.toLowerCase()));
  const corrections=JSON.parse(readFileSync(resolve(root,'data/v11-reconciliation.json'),'utf8'));
  return {source_id:'S005',registry,total_matches:matched.length,returned:Math.min(limit,matched.length),records:matched.slice(0,limit),reconciliation:corrections.changes,note:'Raw source records are not accepted inference rules; inspect original scope, kind, grade and v11 corrections.'};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const options={};
  for(let i=2;i<process.argv.length;i++) {
    const key=process.argv[i],value=process.argv[++i];
    if(!['--registry','--query','--limit'].includes(key)||value===undefined)throw Error('Options: --registry NAME --query TEXT --limit N');
    options[key.slice(2)]=key==='--limit'?Number(value):value;
  }
  console.log(JSON.stringify(queryCatalog(options),null,2));
}
