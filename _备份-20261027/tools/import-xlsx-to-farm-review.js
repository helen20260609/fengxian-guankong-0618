// 从 测试数据.xlsx 导入到 data/farm-review-pending.json
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.resolve(__dirname, '..');
const XLSX_PATH = path.join(ROOT, '测试数据.xlsx');
const OUT_PATH = path.join(ROOT, 'data', 'farm-review-pending.json');

const wb = XLSX.readFile(XLSX_PATH);
const ws = wb.Sheets[wb.SheetNames[0]];
// header:1 返回所有行（含表头），手动跳过真正的表头（第一个单元格是"唯一标识"的行）
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
const dataRows = rows.filter(r => {
  const first = String(r[0] || '').trim();
  return first !== '' && first !== '唯一标识' && !/^03\s/.test(first);
});

// 解析"所在区域"：例如 "奉贤区 四团镇 三团港村村委会" -> town=四团镇, village=三团港村
function parseRegion(region) {
  const s = String(region || '').trim().replace(/\s+/g, ' ');
  const parts = s.split(' ').filter(Boolean);
  // parts 通常: ["奉贤区", "四团镇", "三团港村村委会"]
  let town = '', village = '';
  if (parts.length >= 2) town = parts[1];
  if (parts.length >= 3) village = parts[2].replace(/村委会$/, '');
  return { town, village };
}

// 拼装完整地址
function buildAddress(region, street) {
  const regionStr = String(region || '').trim().replace(/\s+/g, '');
  const streetStr = String(street || '').trim().replace(/\s+/g, '');
  return regionStr + streetStr;
}

// 初步判定 -> hazardLevel（"存在一定安全隐患" -> 一般；保持原值也可，这里映射为一般）
function toHazardLevel(judgment) {
  const s = String(judgment || '');
  if (/严重|重大/.test(s)) return '严重';
  if (/一定|一般/.test(s)) return '一般';
  return '';
}

const records = dataRows.map((r) => {
  const [uniqueId, region, street, purpose, specificPurpose, otherPurpose, floors, area, buildYear, judgment] = r;
  const { town, village } = parseRegion(region);
  const address = buildAddress(region, street);
  const no = String(uniqueId).trim();

  return {
    houseNo: no,
    uniqueId: no,
    houseName: no,
    houseAddress: address,
    owner: '',
    town: town,
    village: village,
    hazardLevel: toHazardLevel(judgment),
    checkRemark: String(judgment || ''),
    // 额外字段（保留 Excel 原始信息）
    houseUsage: String(purpose || ''),
    specificUsage: String(specificPurpose || ''),
    otherUsage: String(otherPurpose || ''),
    floors: Number(floors) || 0,
    area: Number(area) || 0,
    buildYear: Number(buildYear) || 0,
    initialJudgment: String(judgment || ''),
    status: 'draft',
    source: 'excel-import',
    importTime: new Date().toISOString()
  };
});

fs.writeFileSync(OUT_PATH, JSON.stringify(records, null, 2), 'utf8');
console.log('导入完成 ->', OUT_PATH);
console.log('记录数:', records.length);
records.slice(0, 3).forEach(r => console.log('  ', r.houseNo, '|', r.town, '|', r.village, '|', r.hazardLevel));
