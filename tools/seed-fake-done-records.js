// 造 3 条假已排查数据，追加到 data/farm-review-records.json
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'data', 'farm-review-records.json');

const fakeDone = [
  {
    houseNo: 'FXRC2026001',
    uniqueId: 'FXRC2026001',
    houseName: 'FXRC2026001',
    houseAddress: '奉贤区南桥镇沈陆村村委会沈陆5组102号',
    owner: '王建国',
    town: '南桥镇',
    village: '沈陆村',
    hazardLevel: '一般',
    checkRemark: '屋顶局部渗水，已建议修缮',
    status: 'submitted',
    inspector: '张检查',
    inspectTime: '2026-09-05 10:23',
    inspectResult: '存在一定安全隐患',
    rectification: '建议对屋顶防水层进行修补，1个月内完成',
    source: 'manual-demo',
    submitTime: '2026-09-05T10:23:00.000Z',
    checkin: {
      lat: 30.9256,
      lng: 121.4735,
      time: '2026-09-05 10:18',
      operator: '张检查',
      source: 'GPS定位',
      accuracy: 12
    },
    houseLat: 30.9258,
    houseLng: 121.4741
  },
  {
    houseNo: 'FXRC2026002',
    uniqueId: 'FXRC2026002',
    houseName: 'FXRC2026002',
    houseAddress: '奉贤区奉城镇洪庙村村委会洪庙2组45号',
    owner: '李秀英',
    town: '奉城镇',
    village: '洪庙村',
    hazardLevel: '严重',
    checkRemark: '承重墙开裂，存在倒塌风险',
    status: 'submitted',
    inspector: '陈排查',
    inspectTime: '2026-09-06 14:10',
    inspectResult: '存在严重安全隐患',
    rectification: '立即停止使用，建议整体翻建或加固，已通知户主并上报镇建管部门',
    source: 'manual-demo',
    submitTime: '2026-09-06T14:10:00.000Z',
    checkin: {
      lat: 30.9102,
      lng: 121.6489,
      time: '2026-09-06 14:05',
      operator: '陈排查',
      source: 'GPS定位',
      accuracy: 8
    },
    houseLat: 30.9105,
    houseLng: 121.6492
  },
  {
    houseNo: 'FXRC2026003',
    uniqueId: 'FXRC2026003',
    houseName: 'FXRC2026003',
    houseAddress: '奉贤区青村镇吴房村村委会吴房7组208号',
    owner: '周文斌',
    town: '青村镇',
    village: '吴房村',
    hazardLevel: '',
    checkRemark: '房屋结构完好，未发现明显隐患',
    status: 'submitted',
    inspector: '刘复查',
    inspectTime: '2026-09-07 09:45',
    inspectResult: '未发现安全隐患',
    rectification: '',
    source: 'manual-demo',
    submitTime: '2026-09-07T09:45:00.000Z',
    checkin: {
      lat: 30.8856,
      lng: 121.5742,
      time: '2026-09-07 09:42',
      operator: '刘复查',
      source: 'GPS定位',
      accuracy: 15
    },
    houseLat: 30.8858,
    houseLng: 121.5745
  }
];

fs.writeFileSync(OUT, JSON.stringify(fakeDone, null, 2), 'utf8');
console.log('写入', fakeDone.length, '条已排查数据到', OUT);
fakeDone.forEach(r => console.log(' ', r.houseNo, '|', r.town, '|', r.village, '|', r.hazardLevel || '安全'));
