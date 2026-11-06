// 一次性脚本：复制 2026回头看 7 个页面为 农房回头看 farm-review 系列
// 规则：
//  1. 文件名 review-2026 -> farm-review
//  2. 页面间互相跳转链接 review-2026(-list|-view|-inspect|-detail|-edit|-rectify).html -> farm-review*.html
//  3. 可见文案 2026回头看/2026年回头看 -> 农房回头看
//  4. 数据接口与 localStorage 键独立：
//       /api/review-2026-records        -> /api/farm-review-records
//       localStorage 'review-2026-records'  -> 'farm-review-records'
//       localStorage 'review-2026-draft-'   -> 'farm-review-draft-'
//       localStorage 'review-2026-checkin-' -> 'farm-review-checkin-'
//     （review-2026-zone-checkins 片区打卡为城镇功能，本系列页面未使用，不处理）
//  5. 档案同步来源标识 '2026回头看' -> '农房回头看'（在文案替换中一并完成）
// 用法：node tools/clone-review2026-to-farm-review.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const files = [
    { src: 'h5/pages/review-2026.html',         dst: 'h5/pages/farm-review.html' },
    { src: 'h5/pages/review-2026-list.html',    dst: 'h5/pages/farm-review-list.html' },
    { src: 'h5/pages/review-2026-view.html',    dst: 'h5/pages/farm-review-view.html' },
    { src: 'h5/pages/review-2026-inspect.html', dst: 'h5/pages/farm-review-inspect.html' },
    { src: 'pages/review-2026-detail.html',     dst: 'pages/farm-review-detail.html' },
    { src: 'pages/review-2026-edit.html',       dst: 'pages/farm-review-edit.html' },
    { src: 'pages/review-2026-rectify.html',    dst: 'pages/farm-review-rectify.html' }
];

// 页面间链接替换（必须在文案替换之前做，避免 .html 后缀被误改）
const pageLinks = [
    ['review-2026-list.html',    'farm-review-list.html'],
    ['review-2026-view.html',    'farm-review-view.html'],
    ['review-2026-inspect.html', 'farm-review-inspect.html'],
    ['review-2026-detail.html',  'farm-review-detail.html'],
    ['review-2026-edit.html',    'farm-review-edit.html'],
    ['review-2026-rectify.html', 'farm-review-rectify.html'],
    ["'pages/review-2026.html'", "'pages/farm-review.html'"]
];

// 数据接口替换（在 localStorage 键之前做，因为键名是接口路径的子串场景需先长后短；
// 这里 /api/review-2026-records 与 'review-2026-records' 有包含关系，先替换带斜杠的完整接口）
const apiRepls = [
    ['/api/review-2026-records', '/api/farm-review-records']
];

// localStorage 键替换（长串优先：draft-/checkin- 前缀比 records 更具体，但互不包含，顺序无影响；
// 注意必须在接口替换之后，避免 'review-2026-records' 把接口里的部分先改掉）
const storageRepls = [
    ["'review-2026-draft-'",   "'farm-review-draft-'"],
    ["'review-2026-checkin-'", "'farm-review-checkin-'"],
    ["'review-2026-records'",  "'farm-review-records'"]
];

// 文案替换（长串优先，避免 "2026年回头看" 被 "2026回头看" 抢先部分替换；
// 同时覆盖同步来源标识 '2026回头看' -> '农房回头看'）
const textRepls = [
    ['2026年回头看', '农房回头看'],
    ['2026回头看',   '农房回头看'],
    ['2026 回头看',  '农房回头看']
];

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

let totalChanged = 0;
for (const f of files) {
    const srcAbs = path.join(root, f.src);
    const dstAbs = path.join(root, f.dst);
    if (!fs.existsSync(srcAbs)) { console.error('源文件不存在:', f.src); process.exitCode = 1; continue; }
    let content = fs.readFileSync(srcAbs, 'utf8');
    let changed = 0;

    const groups = [pageLinks, apiRepls, storageRepls, textRepls];
    for (const group of groups) {
        for (const [from, to] of group) {
            const re = new RegExp(escapeRe(from), 'g');
            const m = content.match(re);
            if (m) { changed += m.length; content = content.replace(re, to); }
        }
    }

    fs.mkdirSync(path.dirname(dstAbs), { recursive: true });
    fs.writeFileSync(dstAbs, content, 'utf8');
    totalChanged += changed;
    console.log('生成', f.dst, '替换', changed, '处');
}
console.log('完成，共替换', totalChanged, '处。数据已切换为独立接口 /api/farm-review-records 与 farm-review-* localStorage 键。');
