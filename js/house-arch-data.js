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
const RISK_LABEL_MAP_INV = {
    '重大隐患': 'danger',
    '较大隐患': 'major',
    '一般隐患': 'warning',
    '安全': 'safe',
    '无风险': 'safe'
};
const STATUS_LABEL_MAP = {
    'pending': '待整治',
    'doing': '整治中',
    'done': '已整治',
    'overdue': '逾期未整治'
};
const STATUS_LABEL_MAP_INV = {
    '待整治': 'pending',
    '整治中': 'doing',
    '已治理': 'done',
    '已整治': 'done',
    '逾期未整治': 'overdue'
};

// 完整的隐患部位/类型/措施词库，用于生成丰富的种子数据
const HAZARD_PARTS = ['承重墙', '屋面', '地基基础', '木构架', '楼梯间', '阳台', '外墙', '梁柱', '楼板', '排水系统'];
const HAZARD_TYPES = ['裂缝', '渗漏', '沉降', '腐朽', '破损', '变形', '倾斜', '钢筋锈蚀', '抹灰脱落', '积水'];
const MANAGEMENT_MEASURES = ['停止使用', '封控警示', '人员撤离', '持续监控', '停止经营'];
const ENGINEERING_MEASURES = ['结构加固', '屋面修缮', '基础加固', '墙体修复', '排水改造', '电气改造', '消防改造'];
const MANAGER_PHONES = ['138-1234-5678', '139-5678-1234', '136-0000-1234', '137-9999-8888', '150-1111-2222'];
const RESPONSIBLE_PERSONS = ['李志强', '王建国', '陈明华', '周敏', '张建军', '刘伟', '赵敏'];
const AUDITORS = ['王建国', '李志强', '周敏', '陈明华'];
const ENGINEERING_COMPANIES = ['上海建工集团', '奉贤城建公司', '华建工程公司', '东方建设集团', ' Municipal Engineering 公司'];
const DESIGN_UNITS = ['上海城乡建筑设计院', '奉贤区建筑设计院', '华东建筑设计研究院', '上海民用建筑设计院', '上海现代建筑设计集团'];
const SUPERVISION_UNITS = ['上海建设工程监理', '奉贤区工程监理公司', '华东工程监理', '上海市政监理', '南方建设监理'];
const APPRAISAL_UNITS = ['上海市房屋安全检测中心', '奉贤区房屋安全鉴定所', '上海建科院房屋鉴定部', '同济大学房屋质量检测站', '上海房屋科学研究院'];
const USAGE_TYPES = ['自住', '自住兼经营', '出租', '空置', '其他'];
const FLOOR_OPTIONS = [1, 2, 3, 4, 5];
const ROOF_TYPES = ['现浇板', '预制板', '木楼盖', '钢屋架', '坡屋顶', '平屋顶'];
const FOUNDATION_TYPES = ['条形基础', '独立基础', '筏板基础', '桩基础', '毛石基础', '三合土基础'];
const LAND_NATURES = ['宅基地', '集体建设用地', '国有划拨', '国有出让', '其他'];
const OVER_10_PEOPLE = ['是', '否'];
const DESIGN_MODES = ['有专业设计', '无专业设计', '通用图集', '自行设计'];
const BUILD_MODES = ['有资质施工队伍', '无资质施工队伍', '自建', '村镇建筑工匠'];
const EXPANSION_OPTIONS = ['否', '改扩建', '加层', '搭建'];
const DECORATION_OPTIONS = ['否', '装修', '二次装修', '外立面改造'];
const VILLAGES = ['张翁庙村', '洪庙村', '五四村', '新寺村', '潘垫村', '明星村', '李窑村', '星火村', '杨王村', '久茂村', '三坎村', '营房村'];
let __seedGenerated = false;

// ---------------- localStorage 读写 ----------------
function __getHouseArchStorage() {
    try {
        const raw = localStorage.getItem(HOUSE_ARCH_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
}
function __setHouseArchStorage(all) {
    localStorage.setItem(HOUSE_ARCH_KEY, JSON.stringify(all));
}
function __getCloseApplyStorage() {
    try { const raw = localStorage.getItem(CLOSE_APPLY_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function __setCloseApplyStorage(list) {
    localStorage.setItem(CLOSE_APPLY_KEY, JSON.stringify(list));
}

// 保持原有名称的全局别名
function getHouseArchStorage() { return __getHouseArchStorage(); }
function setHouseArchStorage(all) { return __setHouseArchStorage(all); }
function getCloseApplyStorage() { return __getCloseApplyStorage(); }
function setCloseApplyStorage(list) { return __setCloseApplyStorage(list); }

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
    no: '', name: '', owner: '', street: '', address: '', community: '', village: '',
    riskLevel: '一般隐患', governStatus: '待整治', currentMeasure: '',
    managerName: '', managerPhone: '',
    manageRecords: [], projectRecords: [], qualityTrace: [], archiveRecords: [],
    closeStatus: '未申请', closeApplyTime: '', closeAuditTime: '', closeAuditor: '',
    closeAuditOpinion: '', closeRejectReason: '', isRemovedFromFocus: false,
    lat: 30.92, lng: 121.47, year: 1990, category: '砖混', houseType: '农村自建房',
    totalTask: 0, doneTask: 0, fundUsed: 0, fundTotal: 0, overdue: false,
    projectMeasure: 0, manageMeasure: 0, rectDeadline: '', completeDate: '',
    hazards: [], measures: [], eliminationInfo: {}, progress: 0, responsibleDept: '', responsiblePerson: '',
    risk: 'warning', governance: 'pending',
    // 全要素档案扩展字段
    overview: {
        houseName: '', houseNo: '', houseType: '', structureType: '',
        floors: '', buildingArea: '', builtYear: '', landNature: '',
        address: '', belongTo: '', owner: '', idCard: '', phone: '',
        usage: '', isSelfLive: '', specificUsage: '', crowdAround: '',
        otherCrowdAround: '', over10People: '', permit: '', illegalBuild: ''
    },
    homestead: {
        landNature: '', plotNo: '', area: '', approvalStatus: '', certNo: '',
        approvalDept: '', approvalDate: '', remark: ''
    },
    designConstruction: {
        designUnit: '', designUnitCode: '', designDate: '',
        constructionUnit: '', constructionUnitCode: '', constructionQual: '',
        supervisionUnit: '', supervisionUnitCode: '',
        designMode: '', buildMode: '',
        hasProfessionalDesign: false, hasQualificationTeam: false
    },
    structure: {
        structureType: '', floors: '', buildingArea: '',
        roofType: '', wallMaterial: '', floorMaterial: '',
        foundationType: '', seismicInfo: '', maxSpan: '',
        expansionStatus: '', decorationStatus: '', remark: ''
    },
    usage: {
        usageType: '', isSelfLive: '', specificUsage: '', occupancy: '',
        crowdAround: '', otherCrowdAround: '', over10People: '',
        historyChanges: []
    },
    photos: {
        exterior: [], interior: [], surrounding: [], hazard: [],
        measure: [], completion: []
    },
    inspectionRecords: [],
    appraisalReports: [],
    patrolRecords: [],
    riskIdentification: [],
    riskClassification: { level: '', basis: '', assessTime: '', assessor: '' },
    emergencyResponse: {
        planName: '', planDate: '', drillRecords: [], responseRecords: []
    }
};

// 规范化单条记录：保持 risk/riskLevel、governance/governStatus 两对字段一致，
// 销号通过则统一为 safe/无风险 + done/已治理，并补全编号。
function normalizeHouseRecord(record) {
    if (!record) return record;
    const rec = record;
    // 确保 no 存在
    if (!rec.no) rec.no = '';

    // 确保全要素档案字段存在
    if (!rec.overview) rec.overview = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.overview));
    if (!rec.homestead) rec.homestead = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.homestead));
    if (!rec.designConstruction) rec.designConstruction = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.designConstruction));
    if (!rec.structure) rec.structure = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.structure));
    if (!rec.usage) rec.usage = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.usage));
    if (!rec.photos) rec.photos = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.photos));
    if (!rec.inspectionRecords) rec.inspectionRecords = [];
    if (!rec.appraisalReports) rec.appraisalReports = [];
    if (!rec.patrolRecords) rec.patrolRecords = [];
    if (!rec.riskIdentification) rec.riskIdentification = [];
    if (!rec.riskClassification) rec.riskClassification = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.riskClassification));
    if (!rec.emergencyResponse) rec.emergencyResponse = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.emergencyResponse));

    // 销号已通过：强制无风险/已治理
    if (rec.closeStatus === '已通过') {
        rec.risk = 'safe';
        rec.governance = 'done';
        rec.riskLevel = '无风险';
        rec.governStatus = '已治理';
        rec.isRemovedFromFocus = true;
        return rec;
    }

    // 风险等级：以中文 riskLevel 为准，回写 risk；若 riskLevel 缺失则反向生成
    if (rec.riskLevel && RISK_LABEL_MAP_INV[rec.riskLevel]) {
        rec.risk = RISK_LABEL_MAP_INV[rec.riskLevel];
    } else if (rec.risk && RISK_LABEL_MAP[rec.risk]) {
        rec.riskLevel = RISK_LABEL_MAP[rec.risk];
    } else {
        rec.risk = 'warning';
        rec.riskLevel = '一般隐患';
    }

    // 治理状态：以中文 governStatus 为准，回写 governance；若缺失则反向生成
    if (rec.governStatus && STATUS_LABEL_MAP_INV[rec.governStatus]) {
        rec.governance = STATUS_LABEL_MAP_INV[rec.governStatus];
    } else if (rec.governance && STATUS_LABEL_MAP[rec.governance]) {
        rec.governStatus = STATUS_LABEL_MAP[rec.governance];
    } else {
        rec.governance = 'pending';
        rec.governStatus = '待整治';
    }

    return rec;
}

// 从统一数据记录获取完整记录（如不存在则返回 null）
function getHouseRecord(no) {
    const all = getHouseArchStorage();
    const rec = all[no] || null;
    if (rec) normalizeHouseRecord(rec);
    return rec;
}
function getAllHouseRecords() {
    const all = getHouseArchStorage();
    Object.keys(all).forEach(no => normalizeHouseRecord(all[no]));
    return Object.values(all);
}

// 设置单条记录并返回所有记录
function setHouseRecord(no, record) {
    const all = getHouseArchStorage();
    all[no] = normalizeHouseRecord(record);
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

// 根据治理状态生成管理措施记录（变更历史）
function generateManageRecords(no, risk, governance, doneTask, totalTask, i) {
    if (risk === 'safe') return [];
    const records = [];
    const isDone = governance === 'done';
    const measureType = MANAGEMENT_MEASURES[i % MANAGEMENT_MEASURES.length];
    const startDate = '2024-' + pad2(6 + (i % 4)) + '-' + pad2(10 + (i % 15));
    const planEnd = '2025-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28));
    const actualEnd = isDone ? '2025-' + pad2(1 + ((i + 2) % 12)) + '-' + pad2(1 + (i % 28)) : '';
    records.push({
        id: 'M-' + no + '-001',
        measureType: measureType,
        implementPart: '整栋房屋',
        startTime: startDate,
        planEndTime: planEnd,
        actualEndTime: actualEnd,
        requirement: '立即对危险区域采取管控，设置围挡和警示标识，必要时组织人员撤离',
        dutyUnit: MODULE_STREETS[(i - 1) % MODULE_STREETS.length] + '城建中心',
        dutyPerson: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        phone: MANAGER_PHONES[i % MANAGER_PHONES.length],
        measureDesc: measureType + '：设置围挡、警示标识，安排专人巡查',
        implementPhotos: '',
        completePhotos: '',
        isDone: isDone || doneTask > 0,
        effectEvaluation: isDone ? '风险已有效控制，无新增变形' : '风险已有效控制，需继续观察',
        riskControlled: isDone || doneTask > 0,
        changeApply: '—',
        remark: '已落实' + measureType + '措施',
        reporter: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        reportTime: startDate + ' 09:00'
    });
    // 部分已整治/已治理房屋增加一条变更续期记录
    if ((isDone || governance === 'doing') && i % 3 === 0) {
        records.push({
            id: 'M-' + no + '-002',
            measureType: measureType,
            implementPart: '整栋房屋',
            startTime: startDate,
            planEndTime: planEnd,
            actualEndTime: actualEnd,
            requirement: '因施工进度调整，申请延长管控期限',
            dutyUnit: MODULE_STREETS[(i - 1) % MODULE_STREETS.length] + '城建中心',
            dutyPerson: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
            phone: MANAGER_PHONES[i % MANAGER_PHONES.length],
            measureDesc: measureType + '续期',
            implementPhotos: '',
            completePhotos: '',
            isDone: isDone,
            effectEvaluation: '风险已有效控制',
            riskControlled: true,
            changeApply: 'CHG-' + no + '-001',
            remark: '经审批同意延长管控至' + planEnd,
            reporter: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
            reportTime: '2024-' + pad2(8 + (i % 3)) + '-' + pad2(10 + (i % 15)) + ' 14:30'
        });
    }
    return records;
}

// 生成工程措施施工过程记录（时间线）
function generateProjectRecordsLocal(no, risk, governance, projectMeasure, i, fundTotal) {
    if (projectMeasure <= 0 || risk === 'safe') return [];
    const records = [];
    const company = ENGINEERING_COMPANIES[i % ENGINEERING_COMPANIES.length];
    const isDone = governance === 'done';
    const startDate = '2024-' + pad2(8 + (i % 3)) + '-' + pad2(1 + (i % 28));
    const endDate = isDone ? '2025-' + pad2(1 + ((i + 2) % 12)) + '-' + pad2(1 + (i % 28)) : '';
    const projectNames = [];
    for (let p = 0; p < projectMeasure; p++) {
        projectNames.push(ENGINEERING_MEASURES[(i + p) % ENGINEERING_MEASURES.length]);
    }
    projectNames.forEach((pName, idx) => {
        const nodeCount = isDone ? 3 : (governance === 'doing' ? 2 : 1);
        const fundPer = projectMeasure > 0 ? Math.round(fundTotal / projectMeasure) : 0;
        const projectFund = fundPer + Math.round((Math.sin(i * 100 + idx) * 0.3) * fundPer);
        const manager = RESPONSIBLE_PERSONS[(i + idx) % RESPONSIBLE_PERSONS.length];
        const phone = MANAGER_PHONES[(i + idx) % MANAGER_PHONES.length];
        const progress = isDone ? 100 : (governance === 'doing' ? 50 : 0);
        const reportTime = isDone ? (endDate + ' 16:00') : (startDate + ' 08:00');
        const remark = isDone ? '工程已竣工，验收合格' : (governance === 'doing' ? '施工进行中，进度约' + progress + '%' : '尚未开工，待资金到位后启动');
        records.push({
            id: no + '-P' + (idx + 1),
            projectName: pName,
            company: company,
            startDate: startDate,
            endDate: endDate,
            fund: projectFund,
            status: isDone ? '已完成' : (governance === 'doing' ? '进行中' : '未开工'),
            isDone: isDone,
            manager: manager,
            phone: phone,
            progress: progress,
            reporter: manager,
            reportTime: reportTime,
            remark: remark,
            timeline: generateProjectTimeline(no, pName, startDate, endDate, isDone, governance, i, idx)
        });
    });
    return records;
}

function generateProjectTimeline(no, pName, startDate, endDate, isDone, governance, i, idx) {
    const timeline = [];
    const fmt = d => d;
    timeline.push({
        title: '进场准备',
        date: startDate,
        desc: '完成现场围挡、材料进场及安全技术交底',
        photos: '',
        acceptConclusion: '合格',
        acceptChecker: RESPONSIBLE_PERSONS[(i + idx) % RESPONSIBLE_PERSONS.length],
        acceptDate: startDate
    });
    if (governance === 'doing' || isDone) {
        timeline.push({
            title: '施工过程',
            date: '2024-' + pad2(9 + (i % 3)) + '-' + pad2(1 + (i % 28)),
            desc: '开展' + pName + '施工，按方案组织实施',
            photos: '',
            acceptConclusion: '整改后合格',
            acceptChecker: RESPONSIBLE_PERSONS[(i + idx + 1) % RESPONSIBLE_PERSONS.length],
            acceptDate: '2024-' + pad2(10 + (i % 2)) + '-' + pad2(1 + (i % 28))
        });
    }
    if (isDone) {
        timeline.push({
            title: '竣工验收',
            date: endDate,
            desc: '完成' + pName + '，组织竣工验收并出具报告',
            photos: '',
            acceptConclusion: '合格',
            acceptChecker: RESPONSIBLE_PERSONS[(i + idx + 2) % RESPONSIBLE_PERSONS.length],
            acceptDate: endDate
        });
    }
    return timeline;
}

// 生成质量追溯记录
function generateQualityTrace(no, risk, governance, projectMeasure, i) {
    if (risk === 'safe' || projectMeasure <= 0) return [];
    const records = [];
    const isDone = governance === 'done';
    records.push({
        id: 'QT-' + no + '-001',
        checkItem: '材料进场验收',
        checkDate: '2024-' + pad2(8 + (i % 3)) + '-' + pad2(1 + (i % 28)),
        checker: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        result: '合格',
        conclusion: '材料合格证、检验报告齐全',
        photos: '',
        files: ''
    });
    records.push({
        id: 'QT-' + no + '-002',
        checkItem: '隐蔽工程验收',
        checkDate: '2024-' + pad2(9 + (i % 3)) + '-' + pad2(1 + (i % 28)),
        checker: RESPONSIBLE_PERSONS[(i + 1) % RESPONSIBLE_PERSONS.length],
        result: isDone ? '合格' : '待验收',
        conclusion: isDone ? '隐蔽工程质量符合设计及规范要求' : '待后续工序完成后统一验收',
        photos: '',
        files: ''
    });
    if (isDone) {
        records.push({
            id: 'QT-' + no + '-003',
            checkItem: '竣工验收',
            checkDate: '2025-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)),
            checker: RESPONSIBLE_PERSONS[(i + 2) % RESPONSIBLE_PERSONS.length],
            result: '合格',
            conclusion: '工程完成质量良好，满足销号条件',
            photos: '',
            files: '竣工验收报告.pdf'
        });
    }
    return records;
}

// 生成整治档案归档记录
function generateArchiveRecords(no, risk, governance, closeStatus, i) {
    const records = [];
    const isDone = governance === 'done';
    const planDate = '2024-' + pad2(7 + (i % 3)) + '-' + pad2(1 + (i % 28));
    const doneDate = isDone ? '2025-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)) : '';
    records.push({
        archiveType: '整治方案',
        archiveNo: no + '-FA',
        archiveTime: planDate,
        archiveStatus: '已归档',
        fileName: '整治方案.pdf',
        uploader: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length]
    });
    if (risk !== 'safe') {
        records.push({
            archiveType: '实施记录',
            archiveNo: no + '-SG',
            archiveTime: isDone ? doneDate : '',
            archiveStatus: isDone ? '已归档' : '待归档',
            fileName: '施工过程记录.pdf',
            uploader: RESPONSIBLE_PERSONS[(i + 1) % RESPONSIBLE_PERSONS.length]
        });
    }
    if (closeStatus === '已通过') {
        records.push({
            archiveType: '验收材料',
            archiveNo: no + '-YS',
            archiveTime: doneDate,
            archiveStatus: '已归档',
            fileName: '验收销号材料.pdf',
            uploader: RESPONSIBLE_PERSONS[(i + 2) % RESPONSIBLE_PERSONS.length]
        });
    }
    return records;
}

// 生成排查记录
function generateInspectionRecords(no, risk, i) {
    if (risk === 'safe') return [];
    const part = HAZARD_PARTS[i % HAZARD_PARTS.length];
    const type = HAZARD_TYPES[(i + 3) % HAZARD_TYPES.length];
    const checkDate = '2024-' + pad2(5 + (i % 4)) + '-' + pad2(10 + (i % 15));
    return [{
        id: 'INS-' + no + '-001',
        checkDate: checkDate,
        checker: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        checkerPhone: MANAGER_PHONES[i % MANAGER_PHONES.length],
        structureStatus: RISK_LABEL_MAP[risk],
        damagePart: part,
        overload: '否',
        otherRisk: '暂无',
        preliminaryJudge: risk === 'danger' ? '立即停止使用' : (risk === 'major' ? '停止使用危险区域' : '加强观察'),
        location: '',
        dutyPerson: RESPONSIBLE_PERSONS[(i + 1) % RESPONSIBLE_PERSONS.length],
        dutyPhone: MANAGER_PHONES[(i + 1) % MANAGER_PHONES.length],
        photos: '',
        preAppraisal: '否',
        noAppraisalReason: '资金尚未到位',
        proofFiles: '',
        remark: part + '存在' + type + '，需进行安全整治',
        reporter: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        reportTime: checkDate + ' 09:00'
    }];
}

// 生成鉴定报告
function generateAppraisalReports(no, risk, governance, i) {
    if (risk === 'safe') return [];
    const isDone = governance === 'done';
    const appraisalDate = '2024-' + pad2(6 + (i % 4)) + '-' + pad2(10 + (i % 15));
    return [{
        id: 'APP-' + no + '-001',
        orgName: APPRAISAL_UNITS[i % APPRAISAL_UNITS.length],
        orgCode: '91310120MA1K' + pad5(i),
        appraisalDate: appraisalDate,
        appraiser: RESPONSIBLE_PERSONS[(i + 2) % RESPONSIBLE_PERSONS.length],
        conclusion: RISK_LABEL_MAP[risk],
        level: RISK_LABEL_MAP[risk],
        phaseTag: '阶段性鉴定',
        reportFiles: '',
        remark: '东侧承重墙需加固',
        reporter: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        reportTime: appraisalDate + ' 10:00'
    }];
}

// 生成巡查检查记录
function generatePatrolRecords(no, risk, governance, i) {
    if (risk === 'safe') return [];
    const records = [];
    const months = governance === 'done' ? 3 : (governance === 'doing' ? 2 : 1);
    for (let m = 0; m < months; m++) {
        records.push({
            id: 'PAT-' + no + '-' + pad2(m + 1),
            patrolDate: '2024-' + pad2(7 + m + (i % 3)) + '-' + pad2(5 + (i % 20)),
            patrolType: m % 2 === 0 ? '日常巡查' : '专项检查',
            patrolOrg: MODULE_STREETS[(i - 1) % MODULE_STREETS.length] + '城建中心',
            patrolPerson: RESPONSIBLE_PERSONS[(i + m) % RESPONSIBLE_PERSONS.length],
            content: '检查房屋隐患部位安全状况、管控措施落实情况',
            result: '正常',
            photos: '',
            files: '',
            remark: '管控措施到位，需持续关注'
        });
    }
    return records;
}

// 生成风险辨识记录
function generateRiskIdentification(no, risk, i) {
    if (risk === 'safe') return [];
    const part = HAZARD_PARTS[i % HAZARD_PARTS.length];
    const type = HAZARD_TYPES[(i + 3) % HAZARD_TYPES.length];
    return [{
        id: 'RIS-' + no + '-001',
        identifyDate: '2024-' + pad2(5 + (i % 4)) + '-' + pad2(10 + (i % 15)),
        identifyPerson: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        hazardPart: part,
        hazardType: type,
        hazardDesc: part + '存在' + type + '，影响结构安全',
        possibleConsequence: '局部坍塌、人员伤亡',
        controlSuggestion: '立即停止使用，设置围挡警示，尽快实施加固',
        photos: ''
    }];
}

// 生成应急处置记录
function generateEmergencyResponse(no, risk, governance, i) {
    const hasPlan = risk !== 'safe' || i % 5 === 0;
    const planDate = '2024-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28));
    const drills = hasPlan ? [{
        drillDate: '2024-' + pad2(6 + (i % 4)) + '-' + pad2(10 + (i % 15)),
        drillOrg: MODULE_STREETS[(i - 1) % MODULE_STREETS.length] + '应急管理办',
        drillContent: '房屋安全隐患应急疏散演练',
        participants: 12 + (i % 8),
        photos: '',
        remark: '演练达到预期效果'
    }] : [];
    const responses = [];
    if (risk !== 'safe' && governance !== 'done' && i % 4 === 0) {
        responses.push({
            responseDate: '2024-' + pad2(8 + (i % 3)) + '-' + pad2(5 + (i % 20)),
            eventDesc: '巡查发现' + HAZARD_PARTS[i % HAZARD_PARTS.length] + '变形加剧',
            responseMeasure: '立即扩大警戒范围，组织人员撤离，安排专家现场研判',
            responseResult: '险情得到控制，无人员伤亡',
            photos: '',
            reporter: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length]
        });
    }
    return {
        planName: hasPlan ? (no + ' 房屋安全应急预案') : '',
        planDate: hasPlan ? planDate : '',
        drillRecords: drills,
        responseRecords: responses
    };
}

// 生成房屋照片占位
function generateHousePhotos(no, i) {
    return {
        exterior: [],
        interior: [],
        surrounding: [],
        hazard: [],
        measure: [],
        completion: []
    };
}

// 生成隐患明细
function generateHazards(risk, i) {
    if (risk === 'safe') return [];
    const count = 1 + (i % 3);
    const hazards = [];
    for (let k = 0; k < count; k++) {
        const part = HAZARD_PARTS[(i + k) % HAZARD_PARTS.length];
        const type = HAZARD_TYPES[(i + k + 3) % HAZARD_TYPES.length];
        hazards.push({
            part: part,
            type: type,
            desc: part + '存在' + type + '，需进行安全整治',
            level: RISK_LABEL_MAP[risk]
        });
    }
    return hazards;
}

// 生成措施明细
function generateMeasures(risk, governance, projectMeasure, i) {
    const measures = [];
    if (risk === 'safe') return measures;
    const isDone = governance === 'done';
    const mgmtName = MANAGEMENT_MEASURES[i % MANAGEMENT_MEASURES.length];
    measures.push({
        type: 'management',
        name: mgmtName,
        status: isDone ? 'done' : (governance === 'doing' ? 'doing' : 'pending'),
        startTime: '2024-' + pad2(6 + (i % 4)) + '-' + pad2(10 + (i % 15)),
        dutyPerson: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length]
    });
    for (let p = 0; p < projectMeasure; p++) {
        const engName = ENGINEERING_MEASURES[(i + p) % ENGINEERING_MEASURES.length];
        measures.push({
            type: 'engineering',
            name: engName,
            status: isDone ? 'done' : (governance === 'doing' ? 'doing' : 'pending'),
            startTime: '2024-' + pad2(8 + (i % 3)) + '-' + pad2(1 + (i % 28)),
            dutyPerson: RESPONSIBLE_PERSONS[(i + p + 1) % RESPONSIBLE_PERSONS.length]
        });
    }
    return measures;
}

// 根据房屋状态生成销号申请记录
function generateCloseApplyForRecord(record) {
    if (record.closeStatus === '未申请') return null;
    return {
        id: generateCloseApplyId('CLOSE'),
        no: record.no,
        name: record.name,
        street: record.street,
        riskLevel: record.riskLevel,
        governStatus: record.governStatus,
        closeStatus: record.closeStatus,
        applicant: record.responsiblePerson || RESPONSIBLE_PERSONS[0],
        applyTime: record.closeApplyTime,
        auditor: record.closeAuditor,
        auditTime: record.closeAuditTime,
        auditOpinion: record.closeAuditOpinion,
        rejectReason: record.closeRejectReason,
        files: record.eliminationInfo && record.eliminationInfo.certFiles ? record.eliminationInfo.certFiles.join(',') : ''
    };
}

// ---------------- 种子数据生成 ----------------
// 生成 85 条 NF-2025-XXXXX 数据，携带完整工作流、隐患、措施、资金、销号等统计字段
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
        const name = names[nameIdx] + (i > 20 ? '·' + i + '号' : i + '号');
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
        const projectMeasure = totalTask > 0 ? (1 + (i % 3)) : 0;
        const fundTotal = totalTask > 0 ? (30000 + (i * 2500)) : 0;
        const fundUsed = Math.round(fundTotal * (doneTask / (totalTask || 1)));
        const overdue = governance === 'overdue';

        // 坐标：按编号种子随机，保证在奉贤区范围内
        const seed = i * 137;
        const lat = baseLat + (rand(seed) - 0.5) * 0.18;
        const lng = baseLng + (rand(seed + 999) - 0.5) * 0.22;

        const rectDeadline = '2025-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28));
        const completeDate = governance === 'done' ? ('2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28))) : '';

        // 隐患与措施
        const hazards = generateHazards(risk, i);
        const measures = generateMeasures(risk, governance, projectMeasure, i);
        const currentMeasure = measures.map(m => (m.type === 'management' ? '管理' : '工程') + '措施（' + m.name + '）').join(' + ');

        // 销号状态分布
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
                auditor = '区住建局 ' + AUDITORS[i % AUDITORS.length];
                auditOpinion = '验收合格，同意销号';
            }
        } else if (governance === 'doing' && i % 3 === 0) {
            closeStatus = '审核中';
            applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
        } else if (overdue && i % 2 === 0) {
            closeStatus = '已驳回';
            applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
            auditTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(2 + (i % 27));
            auditor = '区住建局 ' + AUDITORS[(i + 1) % AUDITORS.length];
            rejectReason = '整治不到位，需补充材料';
        }

        // 已销号且治理完成的风险统一为 safe/无风险
        if (governance === 'done' && closeStatus === '已通过') {
            risk = 'safe';
        }

        const eliminationInfo = {
            applyTime: applyTime || null,
            reviewTime: auditTime || null,
            reviewer: auditor || null,
            certFiles: closeStatus === '已通过' ? ['销号申请表.pdf', '整治完成照片.zip'] : (applyTime ? ['销号申请表.pdf'] : []),
            note: closeStatus === '已通过' ? '已销号' : (closeStatus === '已驳回' ? rejectReason : '尚未提交销号申请')
        };

        const governStatus = STATUS_LABEL_MAP[governance];
        const riskLevel = risk === 'safe' ? (closeStatus === '已通过' ? '无风险' : '安全') : RISK_LABEL_MAP[risk];
        const managerName = owner;
        const managerPhone = MANAGER_PHONES[i % MANAGER_PHONES.length];
        const responsiblePerson = RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length];
        const responsibleDept = street + '城建中心';

        const manageRecords = generateManageRecords(no, risk, governance, doneTask, totalTask, i);
        const projectRecords = generateProjectRecordsLocal(no, risk, governance, projectMeasure, i, fundTotal);
        const qualityTrace = generateQualityTrace(no, risk, governance, projectMeasure, i);
        const archiveRecords = generateArchiveRecords(no, risk, governance, closeStatus, i);

        // 全要素档案字段
        const village = VILLAGES[(i - 1) % VILLAGES.length];
        const floors = FLOOR_OPTIONS[i % FLOOR_OPTIONS.length];
        const buildingArea = (80 + (i * 3.5)).toFixed(1);
        const roofType = ROOF_TYPES[i % ROOF_TYPES.length];
        const foundationType = FOUNDATION_TYPES[i % FOUNDATION_TYPES.length];
        const landNature = LAND_NATURES[i % LAND_NATURES.length];
        const designMode = DESIGN_MODES[i % DESIGN_MODES.length];
        const buildMode = BUILD_MODES[i % BUILD_MODES.length];
        const usageType = USAGE_TYPES[i % USAGE_TYPES.length];
        const over10 = OVER_10_PEOPLE[i % OVER_10_PEOPLE.length];
        const expansionStatus = EXPANSION_OPTIONS[i % EXPANSION_OPTIONS.length];
        const decorationStatus = DECORATION_OPTIONS[i % DECORATION_OPTIONS.length];

        const overview = {
            houseName: name, houseNo: no, houseType: category,
            structureType: struct === '砖混' ? '砌体结构' : (struct === '框架' ? '框架结构' : '砖木结构'),
            floors: floors + '层', buildingArea: buildingArea, builtYear: String(year),
            landNature: landNature, address: address, belongTo: street + ' · ' + village,
            owner: owner, idCard: '310226' + (1960 + (i % 40)) + pad2(1 + (i % 12)) + pad2(1 + (i % 28)) + pad2(i % 100),
            phone: MANAGER_PHONES[i % MANAGER_PHONES.length],
            usage: usageType, isSelfLive: usageType === '自住' ? '是' : '否',
            specificUsage: usageType === '自住' ? '日常居住' : (usageType === '出租' ? '出租居住' : '—'),
            crowdAround: '否', otherCrowdAround: '否', over10People: over10,
            permit: category === '农村自建房' ? '宅基地批准书' : '建设工程规划许可证',
            illegalBuild: '否'
        };

        const homestead = {
            landNature: landNature,
            plotNo: 'ZD-' + (2000 + (i % 25)) + pad2(1 + (i % 12)) + pad2(1 + (i % 28)),
            area: (120 + (i * 2)).toFixed(1) + '㎡',
            approvalStatus: '审批通过',
            certNo: '沪奉宅字' + (2000 + (i % 25)) + '第' + pad5(i) + '号',
            approvalDept: '上海市奉贤区规划和自然资源局',
            approvalDate: (2000 + (i % 25)) + '-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)),
            remark: ''
        };

        const designConstruction = {
            designUnit: DESIGN_UNITS[i % DESIGN_UNITS.length],
            designUnitCode: '91310120MA1H' + pad5(i),
            designDate: (year - 1) + '-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)),
            constructionUnit: ENGINEERING_COMPANIES[i % ENGINEERING_COMPANIES.length],
            constructionUnitCode: '91310120MA1J' + pad5(i),
            constructionQual: i % 3 === 0 ? '建筑工程施工总承包一级' : (i % 3 === 1 ? '建筑工程施工总承包二级' : '房屋建筑工程施工总承包三级'),
            supervisionUnit: SUPERVISION_UNITS[i % SUPERVISION_UNITS.length],
            supervisionUnitCode: '91310120MA1K' + pad5(i),
            designMode: designMode,
            buildMode: buildMode,
            hasProfessionalDesign: designMode === '有专业设计',
            hasQualificationTeam: buildMode === '有资质施工队伍'
        };

        const structure = {
            structureType: struct === '砖混' ? '砌体结构' : (struct === '框架' ? '框架结构' : '砖木结构'),
            floors: floors + '层',
            buildingArea: buildingArea + '㎡',
            roofType: roofType,
            wallMaterial: struct === '框架' ? '加气混凝土砌块' : '烧结普通砖',
            floorMaterial: roofType,
            foundationType: foundationType,
            seismicInfo: '未做抗震专项设计',
            maxSpan: (3.6 + (i % 5) * 0.3).toFixed(1) + 'm',
            expansionStatus: expansionStatus,
            decorationStatus: decorationStatus,
            remark: ''
        };

        const usage = {
            usageType: usageType,
            isSelfLive: usageType === '自住' ? '是' : '否',
            specificUsage: overview.specificUsage,
            occupancy: over10 === '是' ? '12人' : (2 + (i % 6)) + '人',
            crowdAround: '否',
            otherCrowdAround: '否',
            over10People: over10,
            historyChanges: []
        };
        if (expansionStatus !== '否') {
            usage.historyChanges.push({
                changeDate: (year + 5 + (i % 10)) + '-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)),
                changeType: expansionStatus,
                changeContent: '对房屋进行' + expansionStatus,
                approvalStatus: '已审批',
                remark: ''
            });
        }

        const inspectionRecords = generateInspectionRecords(no, risk, i);
        const appraisalReports = generateAppraisalReports(no, risk, governance, i);
        const patrolRecords = generatePatrolRecords(no, risk, governance, i);
        const riskIdentification = generateRiskIdentification(no, risk, i);
        const riskClassification = {
            level: riskLevel,
            basis: '依据《农村住房危险性鉴定标准》综合评定为' + riskLevel,
            assessTime: inspectionRecords.length ? inspectionRecords[0].checkDate : '',
            assessor: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length]
        };
        const emergencyResponse = generateEmergencyResponse(no, risk, governance, i);
        const photos = generateHousePhotos(no, i);

        const record = {
            no, name, owner, street, community, address, village,
            category: struct,
            houseType: category,
            riskLevel, risk,
            governStatus, governance,
            closeStatus,
            closeApplyTime: applyTime, closeAuditTime: auditTime, closeAuditor: auditor,
            closeAuditOpinion: auditOpinion, closeRejectReason: rejectReason,
            isRemovedFromFocus: closeStatus === '已通过',
            currentMeasure, managerName, managerPhone,
            manageRecords, projectRecords, qualityTrace, archiveRecords,
            lat, lng, year, totalTask, doneTask, overdue,
            manageMeasure, projectMeasure, fundUsed, fundTotal,
            rectDeadline, completeDate,
            hazards, measures, eliminationInfo,
            progress: totalTask ? Math.round(doneTask / totalTask * 100) : 100,
            responsibleDept,
            responsiblePerson,
            overview, homestead, designConstruction, structure, usage,
            photos, inspectionRecords, appraisalReports, patrolRecords,
            riskIdentification, riskClassification, emergencyResponse
        };
        data[no] = record;
    }
    return data;
}

// 初始化种子：若 localStorage 为空则写入 85 条数据；否则规范化已有数据
function initHouseArchSeed() {
    const all = getHouseArchStorage();
    if (Object.keys(all).length === 0) {
        const seed = generateHouseSeed();
        setHouseArchStorage(seed);
        __seedGenerated = true;
        // 同步生成 closeApplyData，确保 hidden-close-apply 页面可展示
        syncCloseApplyData(seed);
        return seed;
    }
    // 规范化已存在的数据，确保各页面读取一致
    Object.keys(all).forEach(no => normalizeHouseRecord(all[no]));
    setHouseArchStorage(all);
    // 若 closeApplyData 为空则根据现有房屋数据同步生成
    if (getCloseApplyStorage().length === 0) {
        syncCloseApplyData(all);
    }
    return all;
}

// 根据 houseArchData 同步 closeApplyData（与房屋状态保持一致）
function syncCloseApplyData(houses) {
    const applies = [];
    Object.values(houses).forEach(record => {
        const apply = generateCloseApplyForRecord(record);
        if (apply) applies.push(apply);
    });
    setCloseApplyStorage(applies);
}

// 在需要的地方调用，例如：initHouseArchSeed();
