const fs = require('fs');
const c = fs.readFileSync(process.argv[2] || 'E:\\风险管控0618\\tools\\__tmp_patrol-task-management.html_1.js', 'utf8');
const lines = c.split(/\r?\n/);
console.log('total lines', lines.length);
for (let i = Math.max(0, lines.length - 30); i < lines.length; i++) {
    console.log((i + 1) + ': ' + JSON.stringify(lines[i].slice(0, 120)));
}

let d = 0;
let line = 1;
let col = 0;
for (let i = 0; i < c.length; i++) {
    const ch = c[i];
    if (ch === '\n') { line++; col = 0; }
    col++;
    if (ch === '{' || ch === '[' || ch === '(') d++;
    if (ch === '}' || ch === ']' || ch === ')') d--;
    if (d < 0) {
        console.log('negative depth at line', line, 'col', col, 'char', ch);
        break;
    }
}
console.log('final depth', d);
// find last closing brace/line
for (let i = c.length - 1; i >= 0; i--) {
    if (c[i] === '}' || c[i] === ']' || c[i] === ')') {
        console.log('last closer at index', i, JSON.stringify(c.slice(Math.max(0,i-50), i+1)));
        break;
    }
}
