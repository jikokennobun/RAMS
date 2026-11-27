const binary = ['meet', 'join', 'product', 'residual'];

export function validateAlgebra(m) {
  const n = m.elements?.length;
  if (!Number.isInteger(n) || n < 1 || new Set(m.elements).size !== n) throw Error('Distinct nonempty elements required');
  const elem = x => Number.isInteger(x) && x >= 0 && x < n;
  for (const key of ['bottom', 'top']) if (!elem(m[key])) throw Error(`Invalid ${key}`);
  for (const key of binary) {
    if (!Array.isArray(m[key]) || m[key].length !== n || m[key].some(row => !Array.isArray(row) || row.length !== n || row.some(x => !elem(x)))) throw Error(`Invalid operation table: ${key}`);
  }
  if (!Array.isArray(m.box) || m.box.length !== n || m.box.some(x => !elem(x))) throw Error('Invalid box');
  const le = (a, b) => m.meet[a][b] === a;
  const fail = (name, ...witness) => { throw Error(`${name} fails at ${witness.join(',')}`); };
  for (let a = 0; a < n; a++) {
    if (m.meet[a][a] !== a || m.join[a][a] !== a) fail('Idempotence', a);
    if (!le(m.bottom,a) || !le(a,m.top)) fail('Bounds',a);
    if (m.product[a][m.top] !== a) fail('Unit',a);
    for (let b = 0; b < n; b++) {
      for (const op of ['meet','join','product']) if (m[op][a][b] !== m[op][b][a]) fail(`Commutativity ${op}`,a,b);
      if (m.meet[a][m.join[a][b]] !== a || m.join[a][m.meet[a][b]] !== a) fail('Absorption',a,b);
      for (let c = 0; c < n; c++) {
        for (const op of ['meet','join','product']) if (m[op][m[op][a][b]][c] !== m[op][a][m[op][b][c]]) fail(`Associativity ${op}`,a,b,c);
        if (le(m.product[a][b],c) !== le(b,m.residual[a][c])) fail('Residuation',a,b,c);
      }
    }
  }
  const axioms = {N:m.box[m.top] === m.top, K:true, '4':true};
  const witnesses = {};
  for (let a = 0; a < n; a++) {
    if (!le(m.box[a],m.box[m.box[a]])) { axioms['4'] = false; witnesses['4'] = [a]; }
    for (let b = 0; b < n; b++) if (!le(m.box[m.residual[a][b]],m.residual[m.box[a]][m.box[b]])) { axioms.K = false; witnesses.K = [a,b]; }
  }
  return {axioms,witnesses};
}

export function guardedClosure(m, {maxFunctions = 10000, maxMs = 5000} = {}) {
  validateAlgebra(m);
  if (!Number.isInteger(maxFunctions) || maxFunctions < 1) throw Error('Invalid function bound');
  if (!Number.isFinite(maxMs) || maxMs <= 0) throw Error('Invalid time bound');
  const started=performance.now();
  const n = m.elements.length;
  const entries = [], seen = new Set();
  // A state tracks both its extensional function and syntactic guardedness.
  // Representative terms are a DAG, avoiding exponentially large strings.
  function add(values, guarded, term) {
    const key = `${guarded}:${values.join(',')}`;
    if (seen.has(key)) return;
    if (entries.length >= maxFunctions) throw Error(`INCOMPLETE: function bound ${maxFunctions} reached`);
    seen.add(key); entries.push({values,guarded,term});
  }
  for (let a = 0; a < n; a++) add(Array(n).fill(a),true,{constant:a});
  add(Array.from({length:n},(_,i)=>i),false,{variable:'x'});
  // Every new state is combined with every earlier state in both orders.
  // Iterating the growing array is a worklist saturation, not a depth cutoff.
  for (let i = 0; i < entries.length; i++) {
    if (performance.now()-started > maxMs) throw Error(`INCOMPLETE: time bound ${maxMs}ms reached`);
    const a = entries[i];
    add(a.values.map(x=>m.box[x]),true,{op:'box',args:[i]});
    for (let j = 0; j <= i; j++) {
      if ((j & 15)===0 && performance.now()-started > maxMs) throw Error(`INCOMPLETE: time bound ${maxMs}ms reached`);
      const b = entries[j];
      for (const op of binary) {
        add(a.values.map((x,k)=>m[op][x][b.values[k]]),a.guarded && b.guarded,{op,args:[i,j]});
        add(b.values.map((x,k)=>m[op][x][a.values[k]]),a.guarded && b.guarded,{op,args:[j,i]});
      }
    }
  }
  let existence = true, uniqueness = true;
  const failures = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e.guarded) continue;
    const fixedPoints = e.values.flatMap((v,x)=>v===x?[x]:[]);
    if (!fixedPoints.length) existence = false;
    if (fixedPoints.length > 1) uniqueness = false;
    if (fixedPoints.length !== 1) failures.push({entry:i,values:e.values,fixedPoints});
  }
  return {complete:true,scope:'one finite algebra; all elements as parameters; unary guarded terms',stateCount:entries.length,guardedCount:entries.filter(e=>e.guarded).length,gFPP:existence,gU:uniqueness,gUFPP:existence && uniqueness,failures,entries};
}
