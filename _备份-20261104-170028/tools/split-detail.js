// =========================================================
// house-arch-detail.html 拆分转换器（半机械化）
// 用法: node tools/split-detail.js urban   -> 生成 pages/house-arch-detail-urban.html
//       node tools/split-detail.js rural   -> 生成 pages/house-arch-detail-rural.html
// 原理: 读取备份原文件, 按目标侧应用一组 {name, find, replace} 精确替换规则,
//       把 isUrbanHouse() 双分叉折叠成单侧实现, 删除对侧专属定义块。
// 每条规则必须恰好命中一次, 否则报错终止(防止静默漏改)。
// =========================================================
const fs = require('fs');
const path = require('path');

const side = process.argv[2];
if (side !== 'urban' && side !== 'rural') {
    console.error('用法: node tools/split-detail.js [urban|rural]');
    process.exit(1);
}
const IS_URBAN = side === 'urban';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'pages', 'house-arch-detail.BACKUP-before-split.html');
const OUT = path.join(ROOT, 'pages', 'house-arch-detail-' + side + '.html');

let html = fs.readFileSync(SRC, 'utf8');
// 统一换行符为 \n(原文件为 CRLF), 保证规则字符串可逐字匹配; 输出同样用 \n(浏览器完全兼容)
html = html.replace(/\r\n/g, '\n');

let applied = 0;
function rule(name, find, replace) {
    const idx = html.indexOf(find);
    if (idx === -1) {
        console.error('  ✗ 规则未命中: ' + name);
        process.exit(1);
    }
    if (html.indexOf(find, idx + 1) !== -1) {
        console.error('  ✗ 规则命中多次(不唯一): ' + name);
        process.exit(1);
    }
    html = html.slice(0, idx) + replace + html.slice(idx + find.length);
    applied++;
    console.log('  ✓ ' + name);
}

console.log('目标侧: ' + side.toUpperCase() + ' -> ' + OUT);

// 加载对应侧的规则集
const rules = require('./split-rules-' + side + '.js');
rules.forEach(r => rule(r[0], r[1], r[2]));

fs.writeFileSync(OUT, html, 'utf8');
console.log('完成: 应用 ' + applied + ' 条规则, 输出 ' + html.length + ' 字符');
