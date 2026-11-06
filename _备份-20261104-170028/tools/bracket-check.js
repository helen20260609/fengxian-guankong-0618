const fs = require('fs');
const c = fs.readFileSync(process.argv[2] || 'E:\\风险管控0618\\tools\\__tmp_patrol-task-management.html_1.js', 'utf8');
let d = 0;
let sq = 0;
let dq = 0;
let rx = false;
let bx = false;
for (let i = 0; i < c.length; i++) {
    const ch = c[i];
    if (rx) {
        if (ch === '\n' || ch === '\r') rx = false;
        continue;
    }
    if (bx) {
        if (ch === '*' && c[i + 1] === '/') { bx = false; i++; }
        continue;
    }
    if (ch === '/' && c[i + 1] === '/') { rx = true; continue; }
    if (ch === '/' && c[i + 1] === '*') { bx = true; i++; continue; }
    if (dq === 0 && sq === 0) {
        if (ch === '{' || ch === '[' || ch === '(') d++;
        else if (ch === '}' || ch === ']' || ch === ')') d--;
    }
    if (ch === "'" && c[i - 1] !== '\\') sq = 1 - sq;
    if (ch === '"' && c[i - 1] !== '\\') dq = 1 - dq;
}
console.log('net bracket delta', d);
console.log('single quote open', sq);
console.log('double quote open', dq);
console.log('comment open', bx, 'line comment', rx);
console.log('length', c.length);
