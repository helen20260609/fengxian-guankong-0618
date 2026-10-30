// 一次性迁移：修正 house-arch.json / urban-house-arch.json 中 street↔village 不一致的记录
// 规则：
//   1. street 被截断的（如 "渡街道"）→ 硬编码映射回全名
//   2. village 不在该 street 真实村列表 → 先尝试列表项包含匹配（如 "金港"→"金港村"），否则按 no 哈希确定性分配
//   3. 同步更新 community 字段，并把 address 中的旧村名替换为新村名
// 运行：node tools/fix-town-village.js
const fs = require('fs');
const path = require('path');

const MAP = require('../data/fengxian-town-villages.json');
const TARGETS = [
    path.join(__dirname, '..', 'data', 'house-arch.json'),
    path.join(__dirname, '..', 'data', 'urban-house-arch.json')
];

// 已知被截断的 street 名 → 全名
const STREET_FIX = {
    '渡街道': '西渡街道',
    '西渡道': '西渡街道',
    '南镇': '南桥镇',
    '庄镇': '庄行镇'
};

function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
}

function fixRecord(r, stats) {
    if (!r || !r.street) return;
    // 1. street 修复
    if (!(r.street in MAP)) {
        const fixed = STREET_FIX[r.street];
        if (fixed) {
            stats.streetFixed.push({ no: r.no, from: r.street, to: fixed });
            if (r.address) r.address = r.address.replace(r.street, fixed);
            r.street = fixed;
        } else {
            stats.streetUnmatched.push({ no: r.no, street: r.street });
            return;
        }
    }
    const list = MAP[r.street] || [];
    if (!list.length) return; // 海湾旅游区无村，跳过
    const v = r.village || r.community || '';
    if (v && list.includes(v)) return; // 已一致
    // 2. village 修复
    let newV = '';
    if (v) {
        const cand = list.filter(x => x.includes(v));
        if (cand.length === 1) newV = cand[0];
    }
    if (!newV) newV = list[hashStr(String(r.no || Math.random())) % list.length];
    stats.villageFixed.push({ no: r.no, street: r.street, from: v, to: newV });
    if (r.address && v) r.address = r.address.replace(v, newV);
    r.village = newV;
    if ('community' in r) r.community = newV;
}

const total = { streetFixed: [], streetUnmatched: [], villageFixed: [] };
TARGETS.forEach(file => {
    if (!fs.existsSync(file)) { console.log('跳过(不存在):', file); return; }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const arr = Array.isArray(data) ? data : Object.values(data);
    const stats = { streetFixed: [], streetUnmatched: [], villageFixed: [] };
    arr.forEach(r => fixRecord(r, stats));
    // 备份并写回
    const bak = file + '.bak-townvillage-' + new Date().toISOString().slice(0, 10).replace(/-/g, '');
    fs.copyFileSync(file, bak);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    console.log(path.basename(file), '→ street修', stats.streetFixed.length, 'village修', stats.villageFixed.length, 'street无法匹配', stats.streetUnmatched.length, '备份:', path.basename(bak));
    total.streetFixed.push(...stats.streetFixed);
    total.streetUnmatched.push(...stats.streetUnmatched);
    total.villageFixed.push(...stats.villageFixed);
});
console.log('--- 合计: street修', total.streetFixed.length, ', village修', total.villageFixed.length, ', 未匹配', total.streetUnmatched.length);
if (total.streetUnmatched.length) console.log('未匹配明细:', JSON.stringify(total.streetUnmatched));
