import {readFile, readdir} from 'node:fs/promises';
import {validateAlgebra, guardedClosure} from './finite-model.mjs';

for (const file of (await readdir(new URL('../models/',import.meta.url))).filter(x=>x.endsWith('.json')).sort()) {
  const model = JSON.parse(await readFile(new URL(`../models/${file}`,import.meta.url),'utf8'));
  const {axioms,witnesses} = validateAlgebra(model);
  if (!Object.values(axioms).every(Boolean)) throw Error(`${model.id}: NK4 failed ${JSON.stringify(witnesses)}`);
  const {entries,...result} = guardedClosure(model);
  console.log(JSON.stringify({model:model.id,axioms,...result}));
}
