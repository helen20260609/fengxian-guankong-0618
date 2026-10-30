const fs = require('fs');
const c = fs.readFileSync(process.argv[2] || 'E:\\风险管控0618\\tools\\__tmp_patrol-task-management.html_1.js', 'utf8');
let d = 0, sq = 0, dq = 0, rx = false, bx = false, line = 1;
for (let i = 0; i < c.length; i++) {
    const ch = c[i];
    if (ch === '\n') line++;
    if (rx) { if (ch === '\n' || ch === '\r') rx = false; continue; }
    if (bx) { if (ch === '*' && c[i + 1] === '/') { bx = false; i++; } continue; }
    if (ch === '/' && c[i + 1] === '/') { rx = true; continue; }
    if (ch === '/' && c[i + 1] === '*') { bx = true; i++; continue; }
    if (dq === 0 && sq === 0) {
        if (ch === '{') {
            d++;
            if (d === 1) console.log('open depth 1 at line', line, 'around', JSON.stringify(c.slice(Math.max(0, i - 60), i + 1)));
        }
        if (ch === '}') {
            d--;
            if (d === 0) console.log('close depth 1 at line', line, 'around', JSON.stringify(c.slice(Math.max(0, i - 60), i + 1)));
            if (d < 0) { console.log('negative depth at line', line); break; }
        }
    }
    if (ch === "'" && c[i - 1] !== '\\') sq = 1 - sq;
    if (ch === '"' && c[i - 1] !== '\\') dq = 1 - dq;
}
console.log('end d', d, 'line', line);
console.log('tail:', JSON.stringify(c.slice(c.length - 200)));
