// 房屋安全模块统一数据层
// 作用：为 hs-register.html / hs-register-detail.html(GIS) / hs-statistics.html / house-arch-detail.html / hidden-close-apply.html
// 提供单一数据源 houseArchData，保持编号、坐标、治理/销号状态全模块一致。

const HOUSE_ARCH_KEY = 'houseArchData';
const CLOSE_APPLY_KEY = 'closeApplyData';

const MODULE_STREETS = ['南桥镇', '奉城镇', '庄行镇', '金汇镇', '青村镇', '柘林镇', '四团镇', '海湾镇', '西渡街道', '奉浦街道', '海湾旅游区', '头桥街道', '金海街道'];
const MODULE_COMMUNITIES = ['张翁庙村', '洪庙村', '五四村', '新寺村', '潘垫村', '明星村', '李窑村', '星火村', '杨王村', '久茂村', '三坎村', '营房村', '解放社区', '人民社区', '新建社区', '环城社区'];
const MODULE_RISKS = ['danger', 'major', 'warning', 'safe'];
const MODULE_GOVERNANCE = ['pending', 'doing', 'done', 'overdue'];

// 把房屋风险状态映射到统一风险等级（供house-arch-detail等页面使用）
const RISK_LABEL_MAP = {
    'danger': '重大隐患',
    'major': '较大隐患',
    'warning': '一般隐患',
    'safe': '安全'
};
const STATUS_LABEL_MAP = {
    'pending': '待整治',
    'doing': '整治中',
    'done': '已整治',
    'overdue': '逾期未整治'
};

let __seedGenerated = false;

// ---------------- localStorage 读写 ----------------
function getHouseArchStorage() {
    try {
        const raw = localStorage.getItem(HOUSE_ARCH_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
}
function setHouseArchStorage(all) {
    localStorage.setItem(HOUSE_ARCH_KEY, JSON.stringify(all));
}
function getCloseApplyStorage() {
    try { const raw = localStorage.getItem(CLOSE_APPLY_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function setCloseApplyStorage(list) {
    localStorage.setItem(CLOSE_APPLY_KEY, JSON.stringify(list));
}

// ---------------- 工具函数 ----------------
function pad5(n) { return String(n).padStart(5, '0'); }
function pad2(n) { return n < 10 ? '0' + n : n; }
function generateNo(seq) { return 'NF-2025-' + pad5(seq); }
function generateCloseApplyId(prefix) {
    const d = new Date();
    return prefix + '-' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' + Math.floor(Math.random() * 900 + 100);
}
function generateArchId(prefix) {
    const d = new Date();
    const ts = d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + '-' + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
    return prefix + '-' + ts + '-' + Math.floor(Math.random() * 900 + 100);
}

// 默认单条房屋结构（兼容 house-arch-detail 的 DEFAULT_HOUSE_STATUS）
const DEFAULT_HOUSE_STATUS = {
    no: '', name: '', owner: '', street: '', address: '', community: '',
    riskLevel: '一般隐患', governStatus: '待整治', currentMeasure: '',
    managerName: '', managerPhone: '',
    manageRecords: [], projectRecords: [], qualityTrace: [], archiveRecords: [],
    closeStatus: '未申请', closeApplyTime: '', closeAuditTime: '', closeAuditor: '',
    closeAuditOpinion: '', closeRejectReason: '', isRemovedFromFocus: false,
    lat: 30.92, lng: 121.47, year: 1990, category: '砖混', houseType: '农村自建房',
    totalTask: 0, doneTask: 0, fundUsed: 0, fundTotal: 0, overdue: false,
    projectMeasure: 0, manageMeasure: 0, rectDeadline: '', completeDate: '',
    hazards: [], measures: [], eliminationInfo: {}, progress: 0, responsibleDept: '', responsiblePerson: ''
};

// 从统一数据记录获取完整记录（如不存在则返回 null）
function getHouseRecord(no) {
    const all = getHouseArchStorage();
    return all[no] || null;
}
function getAllHouseRecords() {
    return Object.values(getHouseArchStorage());
}

// 设置单条记录并返回所有记录
function setHouseRecord(no, record) {
    const all = getHouseArchStorage();
    all[no] = record;
    setHouseArchStorage(all);
    return all;
}

// 确保某编号存在默认记录
function ensureHouseRecord(no) {
    const all = getHouseArchStorage();
    if (!all[no]) {
        all[no] = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS));
        all[no].no = no;
        setHouseArchStorage(all);
    }
    return all[no];
}

// ---------------- 种子数据生成 ----------------
// 生成 85 条 NF-2025-XXXXX 数据，携带坐标、状态、任务、资金等统计字段
function generateHouseSeed() {
    const streets = MODULE_STREETS;
    const communities = MODULE_COMMUNITIES;
    const data = {};

    // 中心点：奉贤区约 30.92, 121.47，随机撒点
    const baseLat = 30.92, baseLng = 121.47;
    const rand = (seed) => {
        const x = Math.sin(seed + 1) * 10000;
        return x - Math.floor(x);
    };

    const names = [
        '李家宅基','贤城小区','张家宅基','新城小区','陈家宅基','华城小区','赵家宅基','海城小区','周家宅基','联城小区',
        '徐家宅基','悦城小区','朱家宅基','湖城小区','胡家宅基','桂城小区','何家宅基','阳城小区','罗家宅基','绿城小区'
    ];
    const owners = [
        '李骏勇','王超','张涛建','刘东','陈玲','杨城磊','黄刚安','赵超岩','周堂','吴基轩',
        '徐骁泰','孙福腾','胡熠磊','朱琴','高峰','林娜洋','何泰博','郭逸培','马骞','罗燕云',
        '梁超然','宋骏','郑强刚','谢彦桂','韩琳春','唐敏香','冯云莲','于泽硕','董东','萧煊硕',
        '程彦磊','曹雪','袁香','邓清泽','许磊青','傅东煜','沈丽博','曾建洋','彭骁玲','吕峻',
        '苏军刚','卢清英','蒋强泽','蔡磊','贾倩兰','丁安','魏峰勇','薛骐瑞','叶东逸','阎恒',
        '余轩培','潘慧','杜娟泰','戴春瑞','夏强骏','钟珍','汪娜寿','田静','任莲云','姜祥',
        '范国昊','方春懿','石凤超','姚霖宇','谭凯静','廖硕秋','邹骥','熊毅','金雪刚','陆文英',
        '郝霖祥','孔娜昊','白琴','崔禧','康倩嘉','毛骥瑞','邱崇云','秦铭珍','江文宸','史熠',
        '顾骏','侯瑞烁','邵顺','孟祥华','龙洋顺'
    ];
    const categories = ['农村自建房', '城镇自建房'];
    const structTypes = ['砖混', '砖木', '框架'];

    for (let i = 1; i <= 85; i++) {
        const no = generateNo(i);
        const nameIdx = (i - 1) % names.length;
        const name = names[nameIdx] + (Math.floor((i - 1) / 20) > 0 ? '·' + i + '号' : (i > 20 ? '·' + i + '号' : (i <= 20 ? i + '号' : '')));
        const street = streets[(i - 1) % streets.length];
        const community = communities[(i - 1) % communities.length];
        const address = '上海市奉贤区' + street + community + (i * 3) + '号';
        const category = categories[i % 2];
        const struct = structTypes[i % 3];
        const year = 1970 + (i % 45);
        const owner = owners[i - 1] || '未知';

        // 风险/治理状态分布：重大/较大/一般/安全 大致 2:2:3:1
        let risk, governance;
        const r = i % 8;
        if (r === 0 || r === 1) { risk = 'danger'; governance = i % 3 === 0 ? 'done' : (i % 3 === 1 ? 'doing' : 'overdue'); }
        else if (r === 2 || r === 3) { risk = 'major'; governance = i % 4 === 0 ? 'done' : 'doing'; }
        else if (r === 4 || r === 5 || r === 6) { risk = 'warning'; governance = i % 5 === 0 ? 'done' : 'pending'; }
        else { risk = 'safe'; governance = 'done'; }

        const totalTask = risk === 'safe' ? 0 : (1 + (i % 4));
        const doneTask = governance === 'done' ? totalTask : (governance === 'doing' ? Math.floor(totalTask * 0.5) : 0);
        const manageMeasure = totalTask > 0 ? (1 + (i % 2)) : 0;
        const projectMeasure = totalTask > 0 ? (i % 3) : 0;
        const fundTotal = totalTask > 0 ? (30000 + (i * 2500)) : 0;
        const fundUsed = Math.round(fundTotal * (doneTask / (totalTask || 1)));
        const overdue = governance === 'overdue';

        // 坐标：按编号种子随机，保证在奉贤区范围内
        const seed = i * 137;
        const lat = baseLat + (rand(seed) - 0.5) * 0.18;
        const lng = baseLng + (rand(seed + 999) - 0.5) * 0.22;

        const rectDeadline = '2025-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28));
        const completeDate = governance === 'done' ? ('2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28))) : '';

        // 隐患/措施
        const hazards = risk === 'safe' ? [] : [{
            part: ['承重墙', '屋面', '地基', '木构架', '楼梯'][i % 5],
            type: ['裂缝', '渗漏', '沉降', '腐朽', '破损'][i % 5],
            desc: '需整治处理',
            level: RISK_LABEL_MAP[risk]
        }];
        const measures = [];
        if (risk !== 'safe') {
            measures.push({ type: 'management', name: ['停止使用', '封控警示', '人员撤离', '持续监控'][i % 4], status: doneTask > 0 ? 'done' : 'doing' });
            if (projectMeasure > 0) measures.push({ type: 'engineering', name: ['结构加固', '屋面修缮', '基础加固', '墙体修复', '排水改造'][i % 5], status: doneTask === totalTask ? 'done' : 'doing' });
        }

        // 销号状态：已整治中一部分给通过/待审核，未整治中给驳回/待申请
        let closeStatus = '未申请';
        let applyTime = '';
        let auditTime = '';
        let auditor = '';
        let auditOpinion = '';
        let rejectReason = '';
        if (governance === 'done') {
            closeStatus = i % 2 === 0 ? '已通过' : '待审核';
            applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
            if (closeStatus === '已通过') {
                auditTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(2 + (i % 27));
                auditor = '区住建局 ' + ['王建国', '李志强', '周敏'][i % 3];
                auditOpinion = '验收合格，同意销号';
            }
        } else if (governance === 'doing' && i % 3 === 0) {
            closeStatus = '审核中';
            applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
        } else if (overdue && i % 2 === 0) {
            closeStatus = '已驳回';
            applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
            auditTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(2 + (i % 27));
            auditor = '区住建局 李华';
            rejectReason = '整治不到位，需补充材料';
        }

        const eliminationInfo = {
            applyTime: applyTime || null,
            reviewTime: auditTime || null,
            reviewer: auditor || null,
            certFiles: closeStatus === '已通过' ? ['销号申请表.pdf', '整治完成照片.zip'] : (applyTime ? ['销号申请表.pdf'] : []),
            note: closeStatus === '已通过' ? '已销号' : (closeStatus === '已驳回' ? rejectReason : '尚未提交销号申请')
        };

        const governStatus = STATUS_LABEL_MAP[governance];
        const riskLevel = RISK_LABEL_MAP[risk];

        const record = {
            no, name, owner, street, community, address,
            category: struct,
            houseType: category,
            riskLevel, risk,
            governStatus, governance,
            closeStatus,
            closeApplyTime: applyTime, closeAuditTime: auditTime, closeAuditor: auditor,
            closeAuditOpinion: auditOpinion, closeRejectReason: rejectReason,
            isRemovedFromFocus: closeStatus === '已通过',
            currentMeasure: '', managerName: owner, managerPhone: '',
            manageRecords: [], projectRecords: [], qualityTrace: [], archiveRecords: [],
            lat, lng, year, totalTask, doneTask, overdue,
            manageMeasure, projectMeasure, fundUsed, fundTotal,
            rectDeadline, completeDate,
            hazards, measures, eliminationInfo,
            progress: totalTask ? Math.round(doneTask / totalTask * 100) : 100,
            responsibleDept: street + '城建中心',
            responsiblePerson: ['李志强', '王建国', '陈明华', '周敏'][i % 4]
        };
        data[no] = record;
    }
    return data;
}

// 初始化种子：若 localStorage 为空则写入 85 条数据
function initHouseArchSeed() {
    const all = getHouseArchStorage();
    if (Object.keys(all).length === 0) {
        const seed = generateHouseSeed();
        setHouseArchStorage(seed);
        __seedGenerated = true;
        return seed;
    }
    return all;
}

// 在需要的地方调用，例如：initHouseArchSeed();
