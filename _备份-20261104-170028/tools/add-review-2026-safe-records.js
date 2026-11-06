// 一次性脚本：向 data/review-2026-records.json 追加 2 条无隐患的回头看记录
// 用法：node tools/add-review-2026-safe-records.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'data', 'review-2026-records.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// 复用现有 SVG dataURL 模板，改填充色和文字（用文本作为可识别占位照片）
function svgPhoto(bg, text) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="28" fill="#fff">${text}</text></svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
}

const base = {
  buildingName: '主屋',
  apartmentCount: '1',
  ownerType: '房屋产权人',
  status: 'submitted',
  zoneId: 'Z-SAFE',
};

const records = [
  // 记录 1：南桥镇 张翁庙村 第二户（无隐患）
  Object.assign({}, base, {
    houseNo: 'NF-2025-SAFE-01',
    houseName: '张翁庙村12号',
    houseAddress: '上海市奉贤区南桥镇张翁庙村12号',
    address: '上海市奉贤区南桥镇张翁庙村12号',
    owner: '李四平',
    ownerName: '李四平',
    ownerId: '310226198203154567',
    ownerPhone: '13911112222',
    town: '南桥镇',
    village: '张翁庙村',
    communityName: '张翁庙村',
    buildingFloors: '2',
    buildingHeight: '7.0',
    buildingArea: '160',
    buildEra: '2000-2009',
    buildYear: '2005',
    structuralSafetyRemark: '房屋整体完好，未发现结构安全隐患',
    ownerSignature: '李四平',
    ownerDate: '2026-08-22',
    userSignature: '李四平',
    userPhone: '13911112222',
    userDate: '2026-08-22',
    inspectorSignature: '王排查',
    inspectorOrg: '南桥镇城建中心',
    inspectorPhone: '13933334444',
    inspectorDate: '2026-08-22',
    zoneName: '南桥镇-张翁庙片区',
    answers: {
      houseType: '农村住宅',
      forBusiness: '否',
      landNature: '集体土地',
      propertyRight: '个人产权',
      crowdPlaceNearby: '否',
      occupantsOver10: '否',
      approval: '有',
      professionalDesign: '是',
      constructionMethod: '自建',
      structureType: '砖混结构',
      masonryType: '烧结普通砖',
      floorRoofType: '现浇钢筋混凝土',
      renovation: '否',
      overload: '无',
      surfaceDamage: '完好',
      structuralSafety: '无安全隐患',
      conclusion: '基本完好，无风险',
      violations: ['无'],
      damageCondition: [],
      renovationContent: [],
    },
    checkin: {
      lat: 30.9532,
      lng: 121.4741,
      time: '2026-08-22T14:30:00.000Z',
      source: 'GPS定位',
      operator: '王排查',
    },
    photos: {
      doorPlate: [svgPhoto('#1a73e8', '门牌-12号')],
      facade: [
        svgPhoto('#1e8e3e', '东立面'),
        svgPhoto('#1e8e3e', '南立面'),
        svgPhoto('#1e8e3e', '西立面'),
        svgPhoto('#1e8e3e', '北立面'),
      ],
      structure: [svgPhoto('#5f6368', '内部结构完好')],
      damage: [],
      currentStatus: [svgPhoto('#188038', '现状良好')],
      damagePhoto: [],
    },
    photoCount: 7,
    submitTime: '2026-08-22T14:35:00.000Z',
  }),

  // 记录 2：奉城镇 解放社区（无隐患）
  Object.assign({}, base, {
    houseNo: 'NF-2025-SAFE-02',
    houseName: '解放社区15号',
    houseAddress: '上海市奉贤区奉城镇解放社区15号',
    address: '上海市奉贤区奉城镇解放社区15号',
    owner: '陈安',
    ownerName: '陈安',
    ownerId: '310226197711208765',
    ownerPhone: '13955556666',
    town: '奉城镇',
    village: '解放社区',
    communityName: '解放社区',
    buildingFloors: '1',
    buildingHeight: '4.5',
    buildingArea: '120',
    buildEra: '2010-2019',
    buildYear: '2015',
    structuralSafetyRemark: '新建房屋，结构状况良好',
    ownerSignature: '陈安',
    ownerDate: '2026-08-21',
    userSignature: '陈安',
    userPhone: '13955556666',
    userDate: '2026-08-21',
    inspectorSignature: '赵排查',
    inspectorOrg: '奉城镇城建中心',
    inspectorPhone: '13977778888',
    inspectorDate: '2026-08-21',
    zoneName: '奉城镇-解放片区',
    answers: {
      houseType: '农村住宅',
      forBusiness: '否',
      landNature: '集体土地',
      propertyRight: '个人产权',
      crowdPlaceNearby: '否',
      occupantsOver10: '否',
      approval: '有',
      professionalDesign: '是',
      constructionMethod: '统建',
      structureType: '框架结构',
      masonryType: '混凝土小型空心砌块',
      floorRoofType: '现浇钢筋混凝土',
      renovation: '否',
      overload: '无',
      surfaceDamage: '完好',
      structuralSafety: '无安全隐患',
      conclusion: '基本完好，无风险',
      violations: ['无'],
      damageCondition: [],
      renovationContent: [],
    },
    checkin: {
      lat: 30.9215,
      lng: 121.6328,
      time: '2026-08-21T10:20:00.000Z',
      source: 'GPS定位',
      operator: '赵排查',
    },
    photos: {
      doorPlate: [svgPhoto('#1a73e8', '门牌-15号')],
      facade: [
        svgPhoto('#1e8e3e', '东立面'),
        svgPhoto('#1e8e3e', '南立面'),
        svgPhoto('#1e8e3e', '西立面'),
        svgPhoto('#1e8e3e', '北立面'),
      ],
      structure: [svgPhoto('#5f6368', '框架结构')],
      damage: [],
      currentStatus: [svgPhoto('#188038', '现状良好')],
      damagePhoto: [],
    },
    photoCount: 7,
    submitTime: '2026-08-21T10:25:00.000Z',
  }),
];

data.push(...records);
fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('追加完成，总条数：', data.length);
records.forEach(r => console.log(' -', r.houseNo, r.town, r.village, r.answers.conclusion));
