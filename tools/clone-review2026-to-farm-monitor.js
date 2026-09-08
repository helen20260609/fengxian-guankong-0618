// 一次性脚本：复制 2026回头看 7 个页面为 农房常态化监测 farm-monitor 系列
// 规则：
//  1. 文件名 review-2026 -> farm-monitor
//  2. 页面间互相跳转链接 review-2026(-list|-view|-inspect|-detail|-edit|-rectify).html -> farm-monitor*.html
//  3. 可见文案 2026回头看/2026年回头看 -> 农房常态化监测
//  4. 数据接口 /api/review-2026-records 与 localStorage 键保持不变（数据共享）
// 用法：node tools/clone-review2026-to-farm-monitor.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const files = [
    { src: 'h5/pages/review-2026.html',         dst: 'h5/pages/farm-monitor.html' },
    { src: 'h5/pages/review-2026-list.html',    dst: 'h5/pages/farm-monitor-list.html' },
    { src: 'h5/pages/review-2026-view.html',    dst: 'h5/pages/farm-monitor-view.html' },
    { src: 'h5/pages/review-2026-inspect.html', dst: 'h5/pages/farm-monitor-inspect.html' },
    { src: 'pages/review-2026-detail.html',     dst: 'pages/farm-monitor-detail.html' },
    { src: 'pages/review-2026-edit.html',       dst: 'pages/farm-monitor-edit.html' },
    { src: 'pages/review-2026-rectify.html',    dst: 'pages/farm-monitor-rectify.html' }
];

// 页面间链接替换（必须在文案替换之前做，避免 .html 后缀被误改）
const pageLinks = [
    ['review-2026-list.html',    'farm-monitor-list.html'],
    ['review-2026-view.html',    'farm-monitor-view.html'],
    ['review-2026-inspect.html', 'farm-monitor-inspect.html'],
    ['review-2026-detail.html',  'farm-monitor-detail.html'],
    ['review-2026-edit.html',    'farm-monitor-edit.html'],
    ['review-2026-rectify.html', 'farm-monitor-rectify.html'],
    ["'pages/review-2026.html'", "'pages/farm-monitor.html'"]
];

// 文案替换（长串优先，避免 "2026年回头看" 被 "2026回头看" 抢先部分替换）
const textRepls = [
    ['2026年回头看', '农房常态化监测'],
    ['2026回头看',   '农房常态化监测'],
    ['2026 回头看',  '农房常态化监测']
];

let totalChanged = 0;
for (const f of files) {
    const srcAbs = path.join(root, f.src);
    const dstAbs = path.join(root, f.dst);
    if (!fs.existsSync(srcAbs)) { console.error('源文件不存在:', f.src); process.exitCode = 1; continue; }
    let content = fs.readFileSync(srcAbs, 'utf8');
    let changed = 0;

    for (const [from, to] of pageLinks) {
        const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const m = content.match(re);
        if (m) { changed += m.length; content = content.replace(re, to); }
    }
    for (const [from, to] of textRepls) {
        const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const m = content.match(re);
        if (m) { changed += m.length; content = content.replace(re, to); }
    }

    fs.mkdirSync(path.dirname(dstAbs), { recursive: true });
    fs.writeFileSync(dstAbs, content, 'utf8');
    totalChanged += changed;
    console.log('生成', f.dst, '替换', changed, '处');
}
console.log('完成，共替换', totalChanged, '处。数据接口 /api/review-2026-records 保持共享未改动。');
