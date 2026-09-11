// 把 review-2026-records.json 转换为 farm-review-records.json
// 农房回头看模块的字段结构（17 项排查清单 + 基本信息）
const fs = require('fs');
const path = 'e:/风险管控0908/data/';

const src = JSON.parse(fs.readFileSync(path + 'review-2026-records.json', 'utf8'));

function toMonth(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function addMonths(iso, n) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  d.setMonth(d.getMonth() + n);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
// 从地址提取门牌号
function extractHouseNo(addr) {
  if (!addr) return '';
  const m = addr.match(/(\d+号|\d+室)(?!.*\d)/);
  return m ? m[1] : '';
}
// 宅基地位置 = 地址中"村/社区"及其之前部分
function extractHomestead(addr, village) {
  if (!addr) return '';
  if (village && addr.includes(village)) {
    const idx = addr.indexOf(village);
    return addr.substring(0, idx + village.length);
  }
  const m = addr.match(/[一-龥]+(?:村|社区)/);
  return m ? m[0] : addr;
}
// 隐患等级推断
function inferHazardLevel(r) {
  const ss = (r.answers && r.answers.structuralSafety) || '';
  const ccl = (r.answers && r.answers.conclusion) || '';
  if (ss.includes('严重') || ccl.includes('严重')) return '严重';
  if (ss.includes('存在安全隐患') || ccl.includes('隐患')) return '一般';
  return '';
}
// 管控措施映射：measures.controlTypes -> tempControlMeasures
function mapControlTypes(r) {
  const arr = (r.measures && r.measures.controlTypes) || [];
  const out = [];
  if (arr.includes('停止使用')) out.push('人员疏散');
  if (arr.includes('封控警示')) out.push('安全警示');
  if (arr.includes('围挡封控')) out.push('围挡封控');
  if (arr.includes('隔离防护')) out.push('隔离防护');
  return out;
}
// 整改措施映射：measures.engineeringTypes -> ownerRectifyMeasures
function mapEngineeringTypes(r) {
  const arr = (r.measures && r.measures.engineeringTypes) || [];
  const out = [];
  if (arr.includes('维修加固')) out.push('修缮加固');
  if (arr.includes('安全鉴定')) out.push('安全鉴定');
  if (arr.includes('拆除违建')) out.push('拆除违建');
  if (arr.includes('停止经营性使用')) out.push('停止经营性使用');
  return out;
}

const out = src.map(r => {
  // 提取一张照片作为 currentStatus
  let photos = { currentStatus: [], damagePhoto: [] };
  let photoCount = 0;
  if (r.photos) {
    const firstCat = Object.keys(r.photos)[0];
    if (firstCat && Array.isArray(r.photos[firstCat]) && r.photos[firstCat][0]) {
      photos.currentStatus = [{
        id: 'imported-' + (r.houseNo || Math.random().toString(36).slice(2)),
        cat: 'currentStatus',
        dataUrl: r.photos[firstCat][0],
        w: 400,
        h: 300,
        size: 0,
        time: r.submitTime || new Date().toISOString()
      }];
      photoCount = 1;
    }
  }

  return {
    houseNo: r.houseNo,
    houseName: r.houseName || ((r.village || '') + (r.houseNo || '').slice(-3)),
    houseAddress: r.houseAddress || r.address || '',
    owner: r.owner || r.ownerName || '',
    town: r.town || '',
    village: r.village || '',
    answers: {
      tempControlMeasures: mapControlTypes(r),
      ownerRectifyMeasures: mapEngineeringTypes(r)
    },
    zoneId: r.zoneId || null,
    zoneName: r.zoneName || '',
    checkin: (r.checkin && r.checkin.lat) ? r.checkin : null,
    photos: photos,
    photoCount: photoCount,
    submitTime: r.submitTime || new Date().toISOString(),

    // 排查问题清单（farm-review 17 项）
    checkFindTime: toMonth(r.submitTime),
    homesteadLocation: extractHomestead(r.houseAddress || r.address, r.village),
    houseNumber: extractHouseNo(r.houseAddress || r.address),
    uniqueId: r.houseNo,
    houseOwner: r.owner || r.ownerName || '',
    contactPhone: r.ownerPhone || r.userPhone || '',
    buildYear: r.buildYear || '',
    houseFloors: r.buildingFloors || '',
    houseType: (r.answers && r.answers.houseType) || '',
    structuralProblems: r.structuralSafetyRemark || '',
    hazardLevel: inferHazardLevel(r),
    tempControlMeasures: mapControlTypes(r),
    tempControlMeasuresOther: '',
    ownerRectifyMeasures: mapEngineeringTypes(r),
    ownerRectifyMeasuresOther: '',
    rectifyDeadline: addMonths(r.submitTime, 3),
    inspectorName: r.inspectorSignature || '',
    checkRemark: (r.answers && r.answers.conclusion) || '',

    // 兼容字段（旧版问卷结构保留）
    renovationCount: r.renovationCount || '',
    address: r.address || r.houseAddress || '',
    communityName: r.communityName || r.village || '',
    buildingName: r.buildingName || '',
    apartmentCount: r.apartmentCount || '',
    ownerName: r.ownerName || r.owner || '',
    ownerId: r.ownerId || '',
    buildingFloors: r.buildingFloors || '',
    buildingHeight: r.buildingHeight || '',
    buildingArea: r.buildingArea || '',
    structuralSafetyRemark: r.structuralSafetyRemark || '',
    ownerSignature: r.ownerSignature || '',
    ownerPhone: r.ownerPhone || '',
    ownerDate: r.ownerDate || '',
    userSignature: r.userSignature || '',
    userPhone: r.userPhone || '',
    userDate: r.userDate || '',
    inspectorSignature: r.inspectorSignature || '',
    inspectorOrg: r.inspectorOrg || '',
    inspectorPhone: r.inspectorPhone || '',
    inspectorDate: r.inspectorDate || '',
    ownerSignatureImage: r.ownerSignatureImage || '',
    userSignatureImage: r.userSignatureImage || '',
    inspectorSignatureImage: r.inspectorSignatureImage || '',
    status: r.status || 'submitted'
  };
});

fs.writeFileSync(path + 'farm-review-records.json', JSON.stringify(out, null, 2), 'utf8');
console.log('OK 已生成 ' + out.length + ' 条农房回头看记录');
out.forEach(r => {
  console.log('  - ' + r.houseNo + ' | ' + r.town + ' | ' + r.village + ' | ' + r.houseOwner + ' | ' + r.checkFindTime + ' | ' + (r.hazardLevel || '(无隐患)'));
});
