import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {root,readData,validateLedgers} from './check.mjs';

const sources=readData('sources'),claims=readData('claims'),tasks=readData('tasks');
validateLedgers(sources,claims,tasks);
const taskId=process.argv[2] ?? tasks.filter(t=>t.status==='ready').sort((a,b)=>a.priority-b.priority)[0]?.id;
const task=tasks.find(t=>t.id===taskId);
if(!task || !/^RAMS-Q\d{3}$/.test(task.id)) throw Error('Unknown or invalid task ID');
if(task.status!=='ready') throw Error(`Task is not ready: ${task.id}`);
const prompt=`# ${task.id}: ${task.title}\n\nRead AGENTS.md and docs/workflow.md first. Work on this task only.\nDo not spawn agents. Do not change definitions without evidence from originals.\n\n## Objective\n${task.objective}\n\n## Sources\n${JSON.stringify(sources.filter(s=>task.source_ids.includes(s.id)),null,2)}\n\n## Relevant claims (not verified)\n${JSON.stringify(claims.filter(c=>task.claim_ids.includes(c.id)),null,2)}\n\n## Deliverables\n${task.deliverables.map(d=>'- '+d).join('\n')}\n\nWrite a discovery report using templates/research-report.md. State missing inputs and unresolved steps explicitly. Do not mark claims proved or task done merely because this run finishes. Do not push, publish or schedule follow-up runs. End with the exact files changed and verification performed.\n`;
const dir=resolve(root,'research/runs',task.id);
mkdirSync(dir,{recursive:true});
writeFileSync(resolve(dir,'prompt.md'),prompt,'utf8');
console.log(resolve(dir,'prompt.md'));
