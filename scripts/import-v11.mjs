import {readFileSync,writeFileSync,readdirSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {root} from './check.mjs';

export const originalPath='references/originals/RAMS1_ALL_IN_ONE_v11_2026-11-27.md';
const zipPath='references/originals/RAMS1_RESEARCH_PACKAGE_v10_2026-10-31.zip';
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const specifications=[
  ['principles',5,235],['relations',6,446],['separations',7,56],
  ['verification',8,13],['theorem-history',9,113],['v10-corrections',10,19]
];

export function splitTableRow(line) {
  const cells=[];let cell='';
  for(let i=1;i<line.length;i++) {
    if(line[i]==='|') {
      let slashes=0;for(let j=i-1;j>=0&&line[j]==='\\';j--)slashes++;
      if(slashes%2===0){cells.push(cell.trim());cell='';continue;}
    }
    cell+=line[i];
  }
  if(cell.trim())throw Error('Table row must end with an unescaped pipe');
  return cells;
}

export function extractRegistry(lines,part,expected,{name='registry',sourceHash=''}={}) {
  const anchor=lines.findIndex(line=>line===`<a id="rams-part${part}"></a>`);
  if(anchor<0)throw Error(`Missing part ${part}`);
  const next=lines.findIndex((line,i)=>i>anchor&&/^<a id="rams-part\d+"><\/a>$/.test(line));
  const end=next<0?lines.length:next;
  const header=lines.findIndex((line,i)=>i>anchor&&i<end&&line.startsWith('| id |'));
  if(header<0)throw Error(`Missing table in part ${part}`);
  const columns=splitTableRow(lines[header]);
  if(!/^\|\s*---/.test(lines[header+1]))throw Error('Missing table separator');
  const records=[],ids=new Set();
  for(let i=header+2;i<end&&lines[i].startsWith('|');i++) {
    const values=splitTableRow(lines[i]);
    if(values.length!==columns.length)throw Error(`Column mismatch in ${name}, source line ${i+1}: ${values.length} vs ${columns.length}`);
    const raw=Object.fromEntries(columns.map((key,index)=>[key,values[index]]));
    if(!raw.id||ids.has(raw.id))throw Error(`Duplicate or empty ID in ${name}: ${raw.id}`);ids.add(raw.id);
    records.push({key:`S005:${name}:${raw.id}`,source_line:i+1,raw,repository_status:'pending'});
  }
  if(records.length!==expected)throw Error(`Count mismatch in ${name}: ${records.length} vs ${expected}`);
  return {format:'rams-source-registry-v1',source_id:'S005',source_path:originalPath,source_sha256:sourceHash,part,columns,count:records.length,records};
}

function filesUnder(path) {
  return readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?filesUnder(resolve(path,e.name)):[resolve(path,e.name)]);
}

export function extractSourceSections(lines) {
  const sections=[];
  const headings=[['definitions',/^### 1\.1\./,/^### v9 /],...Array.from({length:8},(_,i)=>[`N11-0${i+1}`,new RegExp(`^## N11-0${i+1}\\.`),/^## /]),...Array.from({length:10},(_,i)=>[`R10-${i+1}`,new RegExp(`^## R10-${i+1}\\.`),/^## /])];
  for(const [id,pattern,endPattern]of headings) {
    const start=lines.findIndex(line=>pattern.test(line));if(start<0)throw Error(`Missing source section ${id}`);
    const found=lines.findIndex((line,i)=>i>start&&endPattern.test(line));const end=found<0?lines.length:found;
    sections.push({id,key:id==='definitions'?'S005:definitions':`S005:proof:${id}`,path:originalPath,start_line:start+1,end_line:end,text:lines.slice(start,end).join('\n')});
  }
  return sections;
}

export function buildImport() {
  const raw=readFileSync(resolve(root,originalPath)),sourceHash=sha256(raw),text=raw.toString('utf8'),lines=text.split(/\r?\n/);
  const out=resolve(root,'data/imported/v11');mkdirSync(out,{recursive:true});
  const tables=specifications.map(([name,part,expected])=>{
    const table=extractRegistry(lines,part,expected,{name,sourceHash});
    writeFileSync(resolve(out,`${name}.json`),JSON.stringify(table,null,2)+'\n');return {name,part,count:table.count,path:`data/imported/v11/${name}.json`};
  });
  const sections=extractSourceSections(lines);
  const originals=[resolve(root,originalPath),resolve(root,zipPath),...filesUnder(resolve(root,'references/originals/v10-extracted'))].sort().map(path=>{const bytes=readFileSync(path);return {path:relative(root,path).replaceAll('\\','/'),bytes:bytes.length,sha256:sha256(bytes)};});
  const manifestText=readFileSync(resolve(root,'references/originals/v10-extracted/rams1_v10/MANIFEST.md'),'utf8');
  const archiveChecks=[];
  for(const match of manifestText.matchAll(/- `([^`]+)`[^\n]*?SHA256 `([a-f0-9]{64})`/g)) {
    const path=`references/originals/v10-extracted/rams1_v10/${match[1]}`;
    if(match[1].includes('..')||match[1].includes('/')||match[1].includes('\\'))throw Error('Unsafe manifest file name');
    const actual=sha256(readFileSync(resolve(root,path)));
    if(actual!==match[2])throw Error(`v10 checksum mismatch: ${path}`);
    archiveChecks.push({path,sha256:actual,matched:true});
  }
  if(archiveChecks.length!==15)throw Error(`Expected 15 v10 manifest hashes, got ${archiveChecks.length}`);
  const manifest={format:'rams-materials-v1',source_id:'S005',source_path:originalPath,source_sha256:sourceHash,originals,archive_manifest_checks:archiveChecks,registries:tables,
    sections,notes:['Original byte streams preserved; imported code and handoff instructions were not executed.','All source registry records are pending in repository review, regardless of original grade.','N11-08 in proof text and N11-08 in verification ledger identify different statements; keys remain namespaced.']};
  writeFileSync(resolve(out,'index.json'),JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}

export function checkImport() {
  const index=JSON.parse(readFileSync(resolve(root,'data/imported/v11/index.json'),'utf8'));
  if(index.source_id!=='S005'||index.source_path!==originalPath||index.source_sha256!==sha256(readFileSync(resolve(root,originalPath)))||index.originals.length!==19)throw Error('Invalid materials index');
  for(const item of index.originals) {
    if(!item.path.startsWith('references/originals/')||item.path.includes('..'))throw Error('Invalid original path');
    if(!existsSync(resolve(root,item.path))||sha256(readFileSync(resolve(root,item.path)))!==item.sha256)throw Error(`Original changed: ${item.path}`);
  }
  const lines=readFileSync(resolve(root,originalPath),'utf8').split(/\r?\n/);
  if(JSON.stringify(index.sections)!==JSON.stringify(extractSourceSections(lines)))throw Error('Invalid material sections or source spans');
  for(const [name,part,count] of specifications) {
    const expected=extractRegistry(lines,part,count,{name,sourceHash:index.source_sha256});
    const actual=JSON.parse(readFileSync(resolve(root,`data/imported/v11/${name}.json`),'utf8'));
    if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error(`Imported table changed: ${name}`);
  }
  return index;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const index=process.argv.includes('--check')?checkImport():buildImport();
  console.log(JSON.stringify({originals:index.originals.length,archive_checks:index.archive_manifest_checks.length,registries:index.registries.map(({name,count})=>({name,count})),sections:index.sections.length}));
}
