// 把 farm-review-records.json 里不规范的 houseNo/uniqueId 统一改为 NF-2025-XXXXX
const fs = require('fs');
const path = 'e:/风险管控0908/data/farm-review-records.json';

const list = JSON.parse(fs.readFileSync(path, 'utf8'));

// 编号映射：把不规范编号统一改为规范格式
const RENAME = {
  'NF-2025-IMPORT-01': 'NF-2025-00006',
  'NF-2025-TEST-01':   'NF-2025-00007',
  'NF-2025-SAFE-01':   'NF-2025-00008',
  'NF-2025-SAFE-02':   'NF-2025-00009'
};

list.forEach(r => {
  const newNo = RENAME[r.houseNo];
  if (!newNo) return;
  const oldNo = r.houseNo;
  r.houseNo = newNo;
  if (r.uniqueId === oldNo) r.uniqueId = newNo;
  if (r.houseName === oldNo) r.houseName = newNo;
  // 更新 photos 里的 id
  if (r.photos && r.photos.currentStatus) {
    r.photos.currentStatus.forEach(p => {
      if (p.id === 'imported-' + oldNo) p.id = 'imported-' + newNo;
    });
  }
  console.log(`renamed: ${oldNo} -> ${newNo}`);
});

fs.writeFileSync(path, JSON.stringify(list, null, 2), 'utf8');
console.log('OK 共处理 ' + list.length + ' 条');
