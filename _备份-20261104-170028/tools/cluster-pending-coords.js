// 把 19 条 pending 的坐标改成靠近 3 条 done 记录的聚类散布
// 南桥(9条) -> FXRC2026001 附近, 奉城(5条) -> FXRC2026002 附近, 青村(5条) -> FXRC2026003 附近
const fs = require('fs');
const path = require('path');

const PENDING_FILE = path.join(__dirname, '..', 'data', 'farm-review-pending.json');

// 已排查点位
const ANCHORS = {
    '南桥镇': { lat: 30.9256, lng: 121.4735 },
    '奉城镇': { lat: 30.9102, lng: 121.6489 },
    '青村镇': { lat: 30.8856, lng: 121.5742 }
};

function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

const pending = JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
console.log('处理前 pending 数量:', pending.length);

// 按镇分组计数
const townCount = {};
pending.forEach(rec => {
    const town = rec.town || '南桥镇';
    const anchor = ANCHORS[town] || ANCHORS['南桥镇'];
    const idx = townCount[town] || 0;
    townCount[town] = idx + 1;
    
    // 在锚点周围 ±0.008 度内散布（约 800m 半径，比之前的 ±0.06 度集中 7 倍）
    const h1 = hashCode(rec.houseNo + ':lat:' + idx);
    const h2 = hashCode(rec.houseNo + ':lng:' + idx);
    rec.houseLat = anchor.lat + ((h1 % 160) - 80) / 10000;
    rec.houseLng = anchor.lng + ((h2 % 160) - 80) / 10000;
});

console.log('按镇分布:', townCount);
fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2), 'utf8');
console.log('✅ 已写入', PENDING_FILE);
console.log('前3条示例:', pending.slice(0, 3).map(r => ({ houseNo: r.houseNo, town: r.town, lat: r.houseLat.toFixed(6), lng: r.houseLng.toFixed(6) })));
