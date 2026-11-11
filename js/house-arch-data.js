// 房屋安全模块统一数据层
// 作用：为 hs-register.html / hs-register-detail.html(GIS) / hs-statistics.html / house-arch-detail.html / hidden-close-apply.html
// 提供单一数据源 houseArchData，保持编号、坐标、治理/销号状态全模块一致。

const HOUSE_ARCH_KEY = 'houseArchData';
const CLOSE_APPLY_KEY = 'closeApplyData';

const MODULE_STREETS = ['南桥镇', '奉城镇', '庄行镇', '金汇镇', '青村镇', '柘林镇', '四团镇', '海湾镇', '西渡街道', '奉浦街道', '海湾旅游区', '头桥街道', '金海街道'];
const MODULE_COMMUNITIES = ['张翁庙村', '洪庙村', '五四村', '新寺村', '潘垫村', '明星村', '李窑村', '星火村', '杨王村', '久茂村', '三坎村', '营房村', '解放社区', '人民社区', '新建社区', '环城社区'];

// 奉贤区镇/街道 → 下辖村/居委（真实行政区划数据，与 data/fengxian-town-villages.json 一致）
const FENGXIAN_TOWN_VILLAGES = {
    '南桥镇': ["沈陆村","杨王村","曙光村","张翁庙村","华严村","庙泾村","光明村","朝阳村","江海村","五星村","卓越村","育秀村","新成村","六墩村","古华村","运河村"],
    '奉城镇': ["洪庙村","洪南村","洪北村","白衣聚村","北宋村","南宋村","蔡家桥村","东新市村","二桥村","奉城村","高桥村","红旗村","花厅村","集贤村","老街村","利民村","联民村","民众村","南门港村","塘外村","卫季村","协新村","新杨村","盐行村","永益村","朱墩村","三角洋村","大门村","灯民村","墩外村"],
    '青村镇': ["吴房村","北唐村","元通村","金王村","李窑村","石海村","湾张村","桃园村","西吴村","解放村","工农村","张弄村","和中村","申隆一村","申隆二村","岳和村","陶宅村","钟家村","姚家村","朱店村","南星村","北港村","钱忠村","青龙村","青村水产村"],
    '庄行镇': ["吕桥村","东风村","长浜村","存古村","西校村","汇安村","杨溇村","芦泾村","浦秀村","渔沥村","新叶村","马路村","张塘村","牛溇村","潘垫村","新华村","烟墩村","庄行村","东风新村"],
    '金汇镇': ["金汇村","金星村","东星村","新强村","白沙村","百曲村","南陈村","北丁村","行南村","南行村","光泰村","光辉村","资福村","梁典村","乐善村","梅园村","周家村","墩头村","华星村","泰南村","泰东村","泰青村","泰顺村","泰日村","泰日水产村"],
    '四团镇': ["四团村","团南村","团北村","三坎村","坎南村","坎北村","五效村","五古村","五四村","向阳村","桐桥村","夏家村","拾村村","拾村南村","拾村北村","平南村","平北村","平海村","平安村","邵厂村","邵靴村","红卫村","新建村","新桥村","新张村","渔墩村","渔洋村","渔秧村"],
    '柘林镇': ["柘林村","柘南村","柘北村","冯桥村","法华村","立新村","华亭村","华亭渔村","夹路村","郊南村","郊北村","金海村","临海村","临南村","临北村","新寺村","寺南村","寺北村","胡桥村","桥南村","桥北村","兴隆村","兴园村","兴农渔村","迎龙村","海湾村","海畔新村"],
    '海湾镇': ["海湾村","星火村","燎原村","五二村","五七村","五九村","海兴村","海滨村","海光村","海湾水产村"],
    '西渡街道': ["灯塔村","发展村","五宅村","益民村","南渡村","北新村","金港村","关港村","果园村"],
    '奉浦街道': ["奉浦一居","奉浦二居","奉浦三居","奉浦四居","奉浦五居","奉浦六居","奉浦七居","奉浦八居","奉浦九居","奉浦十居","韩村村","陈湾村","公谊村","树园村"],
    '金海街道': ["龙潭村","陈谊村","齐贤村","南郊村","石家村","屠家村","韩树村","金水村","金海村"],
    '头桥街道': ["头桥二居","分水墩村","南宋村","北宋村","东新市村","蔡家桥村","二桥村","红旗村","花厅村","集贤村","老街村","利民村","联民村","民众村","南门港村","塘外村","卫季村","协新村","新杨村","盐行村","永益村","朱墩村"],
    '海湾旅游区': []
};

const MODULE_RISKS = ['danger', 'major', 'warning', 'safe'];
const MODULE_GOVERNANCE = ['pending', 'doing', 'done', 'overdue'];

// 把房屋风险状态映射到统一风险等级（内部数据层）
// 新口径：疑似危房(红)/严重损坏房(橙)→第三类(红)；一般损坏房(黄)→第二类(黄)；完好房(基本完好房)(蓝)→第一类(蓝)
const RISK_LABEL_MAP = {
    'danger': '第三类',
    'major': '第三类',
    'warning': '第二类',
    'safe': '第一类'
};
const APPRAISAL_LEVEL_MAP = {
    'danger': 'D级',
    'major': 'C级',
    'warning': 'B级',
    'safe': 'A级'
};
const RISK_LABEL_MAP_INV = {
    '第三类': 'danger',
    '第二类': 'warning',
    '第一类': 'safe',
    '疑似危房': 'danger',
    '严重损坏房': 'danger',
    '一般损坏房': 'warning',
    '完好房(基本完好房)': 'safe',
    '安全': 'safe',
    '无风险': 'safe'
};

// 农村自建房展示用风险等级：与数据层保持一致（已统一为风险等级）
const HAZARD_TO_RISK_LEVEL = {
    '第三类': '第三类',
    '第二类': '第二类',
    '第一类': '第一类',
    '疑似危房': '第三类',
    '严重损坏房': '第三类',
    '一般损坏房': '第二类',
    '完好房(基本完好房)': '第一类',
    '安全': '第一类',
    '无风险': '第一类'
};
const STATUS_LABEL_MAP = {
    'pending': '未整治',
    'doing': '整治中',
    'done': '已整治',
    'overdue': '逾期未整治'
};
const STATUS_LABEL_MAP_INV = {
    '未整治': 'pending',
    '待整治': 'pending',
    '整治中': 'doing',
    '已治理': 'done',
    '已整治': 'done',
    '逾期未整治': 'overdue'
};

// 完整的隐患部位/类型/措施词库，用于生成丰富的种子数据
const HAZARD_PARTS = ['承重墙', '屋面', '地基基础', '木构架', '楼梯间', '阳台', '外墙', '梁柱', '楼板', '排水系统'];
const HAZARD_TYPES = ['裂缝', '渗漏', '沉降', '腐朽', '破损', '变形', '倾斜', '钢筋锈蚀', '抹灰脱落', '积水'];
const DISCOVERY_METHODS = ['日常巡查', '专项巡查', '临时巡查', '复查任务'];
const MANAGEMENT_MEASURES = ['停止使用', '封控警示', '人员撤离', '持续监控', '停止经营'];
const ENGINEERING_MEASURES = ['结构加固', '屋面修缮', '基础加固', '墙体修复', '排水改造', '电气改造', '消防改造'];
const MANAGER_PHONES = ['13812345678', '13956781234', '13600001234', '13799998888', '15011112222'];
const RESPONSIBLE_PERSONS = ['李志强', '王建国', '陈明华', '周敏', '张建军', '刘伟', '赵敏'];
const AUDITORS = ['王建国', '李志强', '周敏', '陈明华'];
const ENGINEERING_COMPANIES = ['上海建工集团', '奉贤城建公司', '华建工程公司', '东方建设集团', '沪奉建设工程公司'];
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
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
        // 自愈：剔除 key 与记录编号不一致的历史脏数据（数组并入字典产生的 "0".."n" 错位副本），
        // 避免脏 key 随 patchHouseRecord/POST 回写服务端污染 house-arch.json
        Object.keys(parsed).forEach(k => {
            const rec = parsed[k];
            if (!rec || typeof rec !== 'object' || Array.isArray(rec)) { delete parsed[k]; return; }
            if (rec.no && String(rec.no) !== String(k)) delete parsed[k];
        });
        return parsed;
    } catch (e) { return {}; }
}

// 服务端同步开关：避免 init / merge 过程中递归写回
let __syncToServerEnabled = true;
function __postToServer(all) {
    if (!__syncToServerEnabled) return;
    if (typeof fetch !== 'function') return;
    try {
        fetch('/api/house-arch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(all)
        }).catch(function() { /* 离线场景静默失败 */ });
    } catch (e) { /* ignore */ }
}

function __setHouseArchStorage(all) {
    __safeSetLocal(HOUSE_ARCH_KEY, all);
    __postToServer(all);
}

// 安全写 localStorage：超限时静默失败（数据已 POST 到服务端，本地缓存仅作加速）
let __quotaWarned = false;
function __safeSetLocal(key, obj) {
    try {
        localStorage.setItem(key, JSON.stringify(obj));
        return true;
    } catch (e) {
        if (e && (e.name === 'QuotaExceededError' || /quota/i.test(e.message || ''))) {
            if (!__quotaWarned) {
                __quotaWarned = true;
                console.warn('[house-arch-data] localStorage 写入超限，本次仅存服务端（数据不丢失），本地缓存已跳过。');
            }
            // 尝试只写当前操作的单条记录，最小化本地占用
            try { localStorage.removeItem(key); } catch (_) {}
            return false;
        }
        return false;
    }
}

// 从服务端拉取档案并合并到本地（服务端数据优先，本地独有保留）
// 返回 Promise；调用方可不等待
function syncHouseArchFromServer() {
    if (typeof fetch !== 'function') return Promise.resolve(false);
    return fetch('/api/house-arch').then(function(r) {
        if (!r.ok) return false;
        return r.json();
    }).then(function(serverData) {
        if (!serverData || typeof serverData !== 'object' || Array.isArray(serverData)) return false;
        var serverCount = Object.keys(serverData).length;
        if (serverCount === 0) return false;
        var local = __getHouseArchStorage();
        if (__localDirty) {
            // 拉取在飞期间本地已有写入：本地优先回写服务端，不吃本地新数据
            __localDirty = false;
            __postToServer(local);
            return true;
        }
        // 服务端优先合并：服务端有的覆盖，本地独有的保留
        var merged = Object.assign({}, local, serverData);
        __syncToServerEnabled = false; // 合并写回本地时不要再回写服务端
        try {
            __safeSetLocal(HOUSE_ARCH_KEY, merged);
        } finally {
            __syncToServerEnabled = true;
        }
        return true;
    }).catch(function() { return false; });
}

// 将本地缓存完整写回服务端并返回 Promise。
// 供「保存后立即跳转/刷新」的场景等待落盘，避免 fire-and-forget 的 POST
// 被页面卸载取消、随后被服务端旧数据整条覆盖导致新登记数据丢失。
function flushHouseArchToServer() {
    if (typeof fetch !== 'function') return Promise.resolve(false);
    try {
        return fetch('/api/house-arch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(__getHouseArchStorage())
        }).then(function (r) { return !!(r && r.ok); }).catch(function () { return false; });
    } catch (e) { return Promise.resolve(false); }
}
function __getCloseApplyStorage() {
    try { const raw = localStorage.getItem(CLOSE_APPLY_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function __setCloseApplyStorage(list) {
    __safeSetLocal(CLOSE_APPLY_KEY, list);
}

// ---------------- 草稿区（风险档案工作区） ----------------
// 业务模型：风险档案（农村/城镇各自仓库）→ 编辑写入草稿区 → 点同步 → 覆盖到发布区（房屋建筑档案）
const HOUSE_ARCH_DRAFT_KEY = 'houseArchDraft';
const HOUSE_ARCH_SYNC_LOG_KEY = 'houseArchSyncLog';

function __getHouseArchDraft() {
    try {
        const raw = localStorage.getItem(HOUSE_ARCH_DRAFT_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
}
function __setHouseArchDraft(all) {
    __safeSetLocal(HOUSE_ARCH_DRAFT_KEY, all);
    if (!__syncToServerEnabled) return;
    if (typeof fetch !== 'function') return;
    try {
        fetch('/api/rural-house-arch-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(all)
        }).catch(function() { /* 离线静默 */ });
    } catch (e) { /* ignore */ }
}

// 启动时从服务端拉取发布区+草稿区覆盖本地（服务端优先，本地独有保留）
function syncRuralHouseArchFromServer() {
    if (typeof fetch !== 'function') return Promise.resolve(false);
    function pull(api, key) {
        return fetch(api).then(function(r) { return r.ok ? r.json() : null; }).then(function(serverData) {
            if (!serverData || typeof serverData !== 'object' || Array.isArray(serverData)) return;
            if (Object.keys(serverData).length === 0) return;
            var local = {};
            try { local = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) {}
            var merged = Object.assign({}, local, serverData);
            __syncToServerEnabled = false;
            try { __safeSetLocal(key, merged); } finally { __syncToServerEnabled = true; }
        }).catch(function() {});
    }
    return Promise.all([
        pull('/api/house-arch', HOUSE_ARCH_KEY),
        pull('/api/rural-house-arch-draft', HOUSE_ARCH_DRAFT_KEY)
    ]).then(function() { return true; });
}
function __getSyncLog() {
    try { const raw = localStorage.getItem(HOUSE_ARCH_SYNC_LOG_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function __setSyncLog(list) {
    __safeSetLocal(HOUSE_ARCH_SYNC_LOG_KEY, list.slice(-200)); // 只保留最近200条
}

// 读草稿（无草稿时回落到发布区，保证首次进入也能看到数据）
function getDraftRecord(no) {
    const draft = __getHouseArchDraft();
    if (draft[no]) {
        if (typeof normalizeHouseRecord === 'function') normalizeHouseRecord(draft[no]);
        return draft[no];
    }
    return getHouseRecord(no);
}
function getAllDraftRecords() {
    const draft = __getHouseArchDraft();
    const publish = getHouseArchStorage();
    // 合并：草稿优先，发布兜底
    const merged = Object.assign({}, publish, draft);
    Object.keys(merged).forEach(no => { if (typeof normalizeHouseRecord === 'function') normalizeHouseRecord(merged[no]); });
    return Object.values(merged);
}
function setDraftRecord(no, record) {
    const draft = __getHouseArchDraft();
    draft[no] = record;
    if (typeof normalizeHouseRecord === 'function') normalizeHouseRecord(draft[no]);
    __setHouseArchDraft(draft);
    return record;
}
// 同步：草稿 → 发布区，并写日志
// 同步后保留草稿（让草稿=发布区，getSyncStatus 返回 synced）
function publishDraftRecord(no, operator) {
    const draft = __getHouseArchDraft();
    if (!draft[no]) return { ok: false, msg: '草稿不存在' };
    // 打同步时间戳（用于 getSyncStatus 判断）
    draft[no]._syncedAt = new Date().toISOString();
    setHouseRecord(no, draft[no]);
    // 同步后保留草稿（草稿=发布区，状态为已同步）
    // 关键：修改 draft 后要写回 localStorage，否则 _syncedAt 不生效
    __setHouseArchDraft(draft);
    // 写日志
    const log = __getSyncLog();
    log.push({ no: no, time: draft[no]._syncedAt, operator: operator || 'system' });
    __setSyncLog(log);
    return { ok: true };
}
// 查询同步状态：
//   'synced'  — 有草稿且草稿._syncedAt 存在（用户显式同步过）
//   'pending' — 有草稿但无 _syncedAt（编辑过但未同步）
//   'new'     — 无草稿（从未编辑过）
function getSyncStatus(no) {
    const draft = __getHouseArchDraft();
    if (!draft[no]) return 'new';
    return draft[no]._syncedAt ? 'synced' : 'pending';
}
// 列出所有有草稿的编号
function getDraftedNos() {
    const draft = __getHouseArchDraft();
    return Object.keys(draft);
}
// 批量同步
function publishAllDrafts(operator) {
    const draft = __getHouseArchDraft();
    const keys = Object.keys(draft);
    let ok = 0, fail = 0;
    keys.forEach(no => {
        const r = publishDraftRecord(no, operator);
        if (r.ok) ok++; else fail++;
    });
    return { total: keys.length, ok: ok, fail: fail };
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
    riskLevel: '第二类', governStatus: '未整治', currentMeasure: '',
    managerName: '', managerPhone: '',
    manageRecords: [], projectRecords: [], qualityTrace: [], archiveRecords: [],
    closeStatus: '未申请', closeApplyTime: '', closeAuditTime: '', closeAuditor: '',
    closeAuditOpinion: '', closeRejectReason: '', isRemovedFromFocus: false,
    lat: 30.92, lng: 121.47, year: 1990, category: '砖混', houseType: '农村自建房', houseNature: '住宅',
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
        completionDate: '', designDrawings: [],
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
    // 风险信息记录（基础 / 特征 / 关联）
    riskInfo: {
        riskNo: '',
        riskName: '',
        riskType: '',
        riskLevel: '',
        discoveryTime: '',
        discoveryMethod: '',
        discoverer: '',
        riskStatus: '',
        riskPart: '',
        spatialLocation: '',
        riskDesc: '',
        relatedHouse: '',
        relatedOwner: '',
        relatedUser: '',
        relatedInspectionId: '',
        relatedAppraisalId: '',
        relatedPatrolId: '',
        relatedTaskId: ''
    },
    inspectionRecords: [],
    appraisalReports: [],
    patrolRecords: [],
    riskIdentification: [],
    riskClassification: { level: '', basis: '', assessTime: '', assessor: '' },
    emergencyResponse: {
        planName: '', planDate: '', drillRecords: [], responseRecords: []
    },
    // 验收销号详情（close 模块 19 列）
    closeInfo: {
        projectMeasure: '', closeMethod: '', hazardEliminated: '', appraisalAfter: '',
        thirdPartyResult: '', contactName: '', contactPhone: '', infoUpdated: '',
        remark: '', reporter: '', reportTime: '',
        completeCertFiles: [], expertOpinionFiles: [], afterPhotos: [], relatedFiles: []
    }
};

// ============================================================
// 三层档案（房屋级 / 风险级 / 鉴定级）数据层补齐（幂等，只增不改）
// - 风险级：riskRecords[i] 增加 archiveNo（档案编号）、stage/stageLabel（生命周期阶段）、
//           timeline[]（流转时间线，为空时由既有数据播种）、appraisalIds[]（关联鉴定）
// - 鉴定级：appraisalReports[i] 增加 appraisalNo、effectScope（whole-house/risk）、appliedTo[]
// stage/appraisalIds/appliedTo 为派生字段每次重算；archiveNo/appraisalNo/timeline 一经写入不覆盖。
// ============================================================
const RISK_ARCHIVE_LAYER_VERSION = 1;
const RISK_STAGE_LABELS = {
    discovered: '已发现',
    verified: '已核实',
    graded: '已分级',
    rectifying: '整治中',
    accepting: '待验收',
    closed: '已销号'
};

function generateRiskArchiveNo(no, seq) { return 'RA-' + (no || 'X') + '-' + String(seq || 1).padStart(3, '0'); }
function generateAppraisalArchiveNo(no, seq) { return 'JD-' + (no || 'X') + '-' + String(seq || 1).padStart(3, '0'); }

// 生命周期阶段推导：以隐患台账状态为主，等级信息兜底；处置流程验收通过视为已销号
function deriveRiskStage(rr, hz) {
    const hzStatus = hz && hz.currentStatus;
    if (hzStatus === '已销号') return 'closed';
    if (rr && rr.rectProcess && rr.rectProcess.status === 'accepted') return 'closed';
    if (hzStatus === '整治中') return 'rectifying';
    if (hzStatus === '管控中') return 'graded';
    return (rr && rr.riskLevel) || (hz && (hz.initialJudge || hz.currentLevel)) ? 'verified' : 'discovered';
}

// 时间线播种（仅当 timeline 为空）：汇总登记/动态/治理/销号既有痕迹
function seedRiskTimeline(rec, rr, hz) {
    const tl = [];
    if (rr.createdAt || (hz && hz.createdAt)) {
        tl.push({
            time: (hz && hz.createdAt) || rr.createdAt,
            node: 'register', title: '隐患登记',
            operator: (hz && hz.createdBy) || rr.person || '',
            source: (rr.sourceType || '') + (rr.sourceId ? '·' + rr.sourceId : ''),
            derived: true
        });
    }
    (rec.hazardDynamics || []).forEach(d => {
        if (!hz || d.hazardId !== hz.id || d.actionType === '登记') return;
        tl.push({
            time: d.actionTime || '', node: 'dynamic', title: d.actionType || '动态',
            operator: d.operator || '', content: d.content || '',
            conclusion: d.conclusion || '', levelAfter: d.levelAfter || '', derived: true
        });
    });
    (rec.governanceEvents || []).forEach(ev => {
        if (ev.riskRecordId !== rr.id && !(hz && ev.hazardId === hz.id)) return;
        tl.push({ time: ev.createdAt || '', node: 'governance', title: '纳入治理链', content: ev.status || '', derived: true });
    });
    if (hz && hz.currentStatus === '已销号') {
        const ci = rec.closeInfo || {};
        tl.push({ time: ci.reportTime || hz.closeTime || '', node: 'close', title: '验收销号', operator: ci.reporter || '', derived: true });
    }
    return tl.sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
}

// 关联鉴定报告：治理事件链引用的鉴定 + riskInfo 弱关联 + 单鉴定兜底（1房1活跃风险1鉴定）
function linkRiskAppraisals(rec, rr, hz) {
    const ids = [];
    (rec.governanceEvents || []).forEach(ev => {
        if (ev.riskRecordId !== rr.id && !(hz && ev.hazardId === hz.id)) return;
        const ar = ev.data && ev.data.appraisalReports;
        if (Array.isArray(ar)) ar.forEach(a => { if (a && a.id && ids.indexOf(a.id) === -1) ids.push(a.id); });
    });
    const ri = rec.riskInfo || {};
    if (ri.relatedAppraisalId && ids.indexOf(ri.relatedAppraisalId) === -1 &&
        (rec.appraisalReports || []).some(a => a.id === ri.relatedAppraisalId)) {
        ids.push(ri.relatedAppraisalId);
    }
    const apps = rec.appraisalReports || [];
    const activeRisks = (rec.riskRecords || []).filter(r => r.stage !== 'closed');
    if (!ids.length && apps.length === 1 && activeRisks.length === 1 && activeRisks[0] === rr) {
        ids.push(apps[0].id);
    }
    return ids;
}

// ========== 监测点清单（6.1.2.17.2 演示种子数据）==========
// 类型：倾角计/裂缝计/沉降观测点/位移计/水位计；按房屋编号稳定派生 3-5 个
const MONITOR_POINT_TYPES = ['倾角计', '裂缝计', '沉降观测点', '位移计', '水位计'];
function generateMonitorPoints(no) {
    const seed = parseInt(String(no || '').replace(/\D/g, '') || '0', 10);
    const parts = ['屋面东南角', '承重外墙', '地基基础北侧', '楼梯间', '后檐墙'];
    const count = 3 + (seed % 3); // 3-5 个
    const list = [];
    for (let i = 0; i < count; i++) {
        list.push({
            id: 'MP-' + no + '-' + String(i + 1).padStart(2, '0'),
            type: MONITOR_POINT_TYPES[(seed + i) % MONITOR_POINT_TYPES.length],
            location: parts[(seed + i) % parts.length],
            status: (seed + i) % 5 === 4 ? '离线' : '在线',
            installDate: '2024-0' + ((seed + i) % 9 + 1) + '-1' + (i % 9)
        });
    }
    return list;
}

// ========== 一房一档·全周期档案补种（6.1.2.23.3：结构特点/建筑材料/维修记录/改造记录）==========
// 结构特点：优先从已有 structure 字段派生，缺失时按编号确定性生成
function generateStructureFeatures(rec) {
    const seed = parseInt(String(rec && rec.no || '').replace(/\D/g, '') || '0', 10);
    const st = (rec && rec.structure) || {};
    const basicForms = ['条形基础', '独立基础', '毛石基础', '扩展基础'];
    const bearingSystems = ['砖混承重体系', '木构架承重体系', '石木混合承重体系', '底部框架-上部砖混体系'];
    const floorForms = ['现浇钢筋混凝土楼板', '预制混凝土空心板', '木楼板', '钢-木组合楼盖'];
    const roofForms = ['坡屋面（小青瓦）', '坡屋面（机制平瓦）', '平屋顶（现浇钢筋混凝土）', '平屋顶（预制板）'];
    return {
        basicForm: st.foundationType || basicForms[seed % basicForms.length],
        bearingSystem: st.structureType || bearingSystems[seed % bearingSystems.length],
        floorForm: st.floorMaterial || floorForms[(seed + 1) % floorForms.length],
        roofForm: st.roofType || roofForms[(seed + 2) % roofForms.length]
    };
}

// 建筑材料：材料类型/强度等级/生产厂家（2-3 条，按编号确定性生成）
function generateBuildMaterials(rec) {
    const seed = parseInt(String(rec && rec.no || '').replace(/\D/g, '') || '0', 10);
    const masonry = [
        { type: '砌体材料（烧结普通砖）', strength: 'MU10', manufacturer: '本地机砖厂' },
        { type: '砌体材料（混凝土小型空心砌块）', strength: 'MU7.5', manufacturer: '县建材有限公司' },
        { type: '砌体材料（毛石）', strength: 'MU30', manufacturer: '就近采石场' }
    ];
    const mortar = [
        { type: '砌筑砂浆', strength: 'M5 水泥混合砂浆', manufacturer: '现场拌制' },
        { type: '砌筑砂浆', strength: 'M7.5 水泥砂浆', manufacturer: '现场拌制' }
    ];
    const extras = [
        { type: '混凝土（圈梁/构造柱）', strength: 'C20', manufacturer: '现场拌制' },
        { type: '木材（檩条/椽子）', strength: '杉木，含水率≤18%', manufacturer: '本地木材加工厂' },
        { type: '混凝土（楼盖）', strength: 'C25', manufacturer: '乡镇商品混凝土站' }
    ];
    const list = [masonry[seed % masonry.length], mortar[seed % mortar.length]];
    list.push(extras[seed % extras.length]);
    return list;
}

// 维修/改造记录：有风险或已治理房屋 1-2 条，安全房按编号稀疏生成
function generateLifecycleRecords(rec, kind) {
    const seed = parseInt(String(rec && rec.no || '').replace(/\D/g, '') || '0', 10);
    const hasRisk = rec && rec.risk && rec.risk !== 'safe';
    const done = rec && (rec.governStatus === '已治理' || rec.governance === 'done' || rec.closeStatus === '已通过');
    const list = [];
    if (kind === 'maintenance') {
        const contents = ['屋面小青瓦翻修、渗漏处理', '墙体裂缝水泥砂浆填缝修补', '木檩条更换并做防腐处理', '散水坡修复、房屋周边排水疏通', '门窗更换、五金修缮'];
        const units = ['本村乡村建设工匠', '镇建筑施工队', '户主自行维修', '县建筑维修服务队'];
        const count = hasRisk ? (1 + seed % 2) : (seed % 3 === 0 ? 1 : 0);
        for (let i = 0; i < count; i++) {
            list.push({
                id: 'WX-' + (rec.no || '') + '-' + String(i + 1).padStart(2, '0'),
                time: '202' + (3 + (seed + i) % 3) + '-0' + ((seed + i) % 9 + 1) + '-1' + (i % 9),
                content: contents[(seed + i) % contents.length],
                unit: units[(seed + i) % units.length],
                cost: (0.3 + ((seed + i) % 5) * 0.4).toFixed(1) + ' 万元',
                remark: done ? '维修完成后纳入整治销号档案' : ''
            });
        }
    } else {
        const contents = ['厨房改造（独立厨房外建）', '卫生间改造', '加层扩建（经审批）', '危房改造（落架大修）'];
        const units = ['镇建筑施工队', '县建筑工程公司', '本村乡村建设工匠', '具备资质的施工企业'];
        const approvals = ['乡村建设规划许可证', '宅基地翻建审批表', '危房改造审批表', '村镇建设审批意见书'];
        if (seed % 4 === 0 || done) {
            list.push({
                id: 'GZ-' + (rec.no || '') + '-01',
                time: '202' + (2 + seed % 4) + '-0' + (seed % 9 + 1) + '-2' + (seed % 8),
                content: contents[seed % contents.length],
                unit: units[seed % units.length],
                approvalFile: approvals[seed % approvals.length],
                remark: seed % 2 === 0 ? '改造后结构安全复核合格' : ''
            });
        }
    }
    return list;
}

// ========== 消息通知（6.1.2.17.2 演示：localStorage 持久化）==========
const HOUSE_NOTIFY_KEY = 'houseArchNotify';
function getNotifications() {
    try { return JSON.parse(localStorage.getItem(HOUSE_NOTIFY_KEY) || '[]'); } catch (e) { return []; }
}
// 推送通知：风险录入/修改后通知责任人与监管人员（演示：写入本地通知中心）
function pushNotification(rec, riskRec, action) {
    if (!rec) return;
    const list = getNotifications();
    const now = new Date();
    const pad = n => (n < 10 ? '0' : '') + n;
    const ts = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    const receivers = [rec.owner, rec.responsiblePerson].filter(Boolean);
    if (!receivers.length) receivers.push('监管人员');
    receivers.forEach(who => {
        list.unshift({
            id: 'NT' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            time: ts,
            receiver: who,
            title: '【' + (action || '风险信息') + '】' + (riskRec.riskName || riskRec.hazardType || '风险记录'),
            content: (rec.no || '') + ' ' + (riskRec.hazardType || '') + '（' + (riskRec.riskLevel || '') + '）' + (riskRec.location ? ' @' + riskRec.location : ''),
            houseNo: rec.no || '',
            read: false
        });
    });
    try { localStorage.setItem(HOUSE_NOTIFY_KEY, JSON.stringify(list.slice(0, 100))); } catch (e) {}
}

// ========== 风险清单库（6.1.2.17.2）：类型 → 描述模板 + 防范措施建议 ==========
// 手动录入时按类型自动带入；仅作演示种子数据
const RISK_TYPE_LIBRARY = {
    '裂缝':     { descTemplate: '{part}存在裂缝，缝宽超限，持续发展可能影响结构安全', prevention: '定期观测裂缝发展；设置观测标记；必要时委托专业机构鉴定', hazard: '裂缝持续发展可致构件承载力丧失，严重时引发局部坍塌，危及居住人员安全' },
    '渗漏':     { descTemplate: '{part}存在渗漏，长期浸水导致材料性能退化', prevention: '及时修缮防水层；保持排水通畅；雨季加强巡查', hazard: '长期渗漏导致墙体酥碱、木构件腐朽、钢筋锈蚀，降低结构耐久性与承载力' },
    '沉降':     { descTemplate: '{part}存在不均匀沉降，可能引起结构倾斜开裂', prevention: '设置沉降观测点；控制周边堆载；发现加速沉降立即上报', hazard: '不均匀沉降可致房屋倾斜、墙体开裂，严重时整体失稳倒塌' },
    '腐朽':     { descTemplate: '{part}木构件腐朽，承载能力下降', prevention: '保持通风干燥；防腐处理；严重腐朽构件及时更换', hazard: '木构件腐朽蛀蚀致承载力骤降，可能引发屋面或楼层局部塌落' },
    '破损':     { descTemplate: '{part}存在破损，影响正常使用及结构安全', prevention: '及时修复破损部位；避免超载使用；纳入日常巡查重点', hazard: '破损部位易进一步扩大，遇外力或恶劣天气可能局部坍塌、坠落伤人' },
    '变形':     { descTemplate: '{part}存在明显变形，超出正常使用限值', prevention: '限制使用荷载；加强变形监测；必要时支撑加固', hazard: '变形超限致结构受力失衡，持续发展可能引发构件断裂或整体失稳' },
    '倾斜':     { descTemplate: '{part}存在倾斜，倾斜率接近或超过限值', prevention: '安装倾斜监测设备；疏散危险区域人员；制定应急撤离预案', hazard: '倾斜加剧可致房屋整体倾覆倒塌，危及住户及周边人员生命财产安全' },
    '钢筋锈蚀': { descTemplate: '{part}钢筋锈蚀，截面削弱，耐久性下降', prevention: '除锈防腐处理；修补保护层；潮湿环境加强检查', hazard: '锈蚀削弱钢筋截面、胀裂混凝土保护层，构件承载力持续下降' },
    '抹灰脱落': { descTemplate: '{part}抹灰层空鼓脱落，存在坠落伤人风险', prevention: '及时铲除空鼓抹灰；下方设置警示区域；行人通道重点排查', hazard: '抹灰层高空坠落易砸伤行人，存在人身伤害风险' },
    '积水':     { descTemplate: '{part}长期积水，侵蚀基础及墙体材料', prevention: '疏通排水设施；增设散水坡；雨后及时清理积水', hazard: '长期积水浸泡基础墙体，降低地基承载力，诱发沉降与倾斜' }
};

// ========== 责任单位归属（6.1.2.17.3 演示）==========
// 责任主体类型
const RESPONSIBLE_UNIT_TYPES = {
    owner: '户主（产权人）', user: '使用人（租户）', renovator: '改扩建实施人',
    village: '村委会', town: '乡镇政府', county: '县级政府部门'
};
// 各单位类型默认职责边界
const RESPONSIBLE_DUTY_MAP = {
    owner: '整改主体责任（结构安全）', user: '使用安全', renovator: '整改主体责任（自行实施部分）',
    village: '协助整改', town: '统筹支持', county: '行业监管'
};

// 推荐规则库：按优先级排列，命中第一条即返回（演示规则引擎）
const RESPONSIBILITY_RULES = [
    { id: 'R7', name: '重大风险乡镇兜底',
      match: (rr, rec) => !!rec.difficultyTag && ((rec.appraisalReports || []).some(a => a.conclusion === 'D级') || rr.riskLevel === '第一类'),
      primary: 'town', support: ['county'],
      reason: () => '困难群体房屋存在涉及公共安全的重大风险，户主无力整改，推荐乡镇政府作为兜底责任单位，申请上级补助资金' },
    { id: 'R6', name: '困难群体协助整改',
      match: (rr, rec) => !!rec.difficultyTag,
      primary: 'owner', support: ['village', 'town'],
      reason: rec => '该户属' + (rec.difficultyTag || '困难群体') + '，推荐户主为责任主体，村委会协助整改、乡镇政府统筹支持' },
    { id: 'R3', name: '擅自改扩建',
      match: rr => /改扩|加建|扩建|加层/.test((rr.riskType || '') + (rr.riskDesc || '') + (rr.hazardDesc || '') + (rr.riskPart || '')),
      primary: 'renovator', support: ['owner'],
      reason: () => '擅自改扩建风险，推荐实施改扩建的责任人作为整改责任主体，户主配合' },
    { id: 'R4', name: '出租房屋共担',
      match: (rr, rec) => ((rec.usage && rec.usage.usageType) || '') === '出租',
      primary: 'owner', support: ['user'],
      reason: () => '出租房屋风险，户主负责结构安全、使用人负责使用安全，共同承担责任' },
    { id: 'R1', name: '地基基础风险',
      match: rr => /地基|基础|沉降/.test((rr.riskType || '') + (rr.riskDesc || '') + (rr.hazardDesc || '') + (rr.riskPart || '')),
      primary: 'owner', support: [],
      reason: () => '地基基础风险，推荐户主作为整改责任主体' },
    { id: 'R2', name: '承重结构风险',
      match: rr => /承重|梁|柱|墙体|结构|裂缝|屋面/.test((rr.riskType || '') + (rr.riskDesc || '') + (rr.hazardDesc || '') + (rr.riskPart || '')),
      primary: 'owner', support: [],
      reason: () => '承重结构风险，推荐户主作为整改责任主体' },
    { id: 'R5', name: '空置房屋',
      match: (rr, rec) => ((rec.usage && rec.usage.usageType) || '') === '空置',
      primary: 'owner', support: [],
      reason: () => '空置房屋风险，推荐户主作为责任主体，纳入村委会日常监管' },
    { id: 'R0', name: '默认产权人负责',
      match: () => true,
      primary: 'owner', support: [],
      reason: () => '产权清晰的房屋风险，责任单位默认为户主' }
];

// 单位类型 → 具体单位/人员名称（对接农房产权库的演示映射）
function resolveResponsibleName(rec, rr, type) {
    const street = rec.street || '属地';
    switch (type) {
        case 'owner': return rec.owner || '户主';
        case 'user': return (rr && rr.relatedUser && rr.relatedUser !== rec.owner) ? rr.relatedUser : '租户';
        case 'renovator': {
            const db = rec.designBuild || rec.designInfo || {};
            return db.builder || db.craftsman || rec.owner || '改扩建实施人';
        }
        case 'village': {
            const v = rec.village || rec.community || '';
            return (v && v !== '--') ? (v.indexOf('村') === -1 && v.indexOf('委') === -1 ? v + '村委会' : v) : (street + '村委会');
        }
        case 'town': return street.indexOf('街道') !== -1 ? street + '办事处' : street + '人民政府';
        case 'county': return '区房屋管理局';
        default: return RESPONSIBLE_UNIT_TYPES[type] || type;
    }
}

// 规则推荐（纯函数）：返回 { ruleId, ruleName, reason, primary, support[] }
function recommendResponsibility(rec, rr) {
    const rule = RESPONSIBILITY_RULES.find(r => r.match(rr, rec)) || RESPONSIBILITY_RULES[RESPONSIBILITY_RULES.length - 1];
    const mk = type => ({
        type: type,
        label: RESPONSIBLE_UNIT_TYPES[type] || type,
        name: resolveResponsibleName(rec, rr, type),
        duty: RESPONSIBLE_DUTY_MAP[type] || ''
    });
    return {
        ruleId: rule.id,
        ruleName: rule.name,
        reason: rule.reason(rec),
        primary: mk(rule.primary),
        support: (rule.support || []).map(mk)
    };
}

// 确认流程节点（多级确认）
const RESP_CONFIRM_STEPS = ['网格员初指', '村委确认', '乡镇复核'];

// 补齐风险级记录的责任单位归属（幂等，仅补缺）
function ensureRiskResponsibility(rec) {
    if (!rec) return rec;
    // 困难群体标识（演示种子：仅补缺，正式版对接困难群体数据库）
    if (rec.difficultyTag === undefined) rec.difficultyTag = (rec.no === 'NF-2025-00001') ? '低保户' : '';
    (rec.riskRecords || []).forEach(rr => {
        if (rr.responsibility) return;
        const sug = recommendResponsibility(rec, rr);
        rr.responsibility = {
            ruleId: sug.ruleId,
            ruleName: sug.ruleName,
            ruleReason: sug.reason,
            primary: sug.primary,
            support: sug.support,
            status: '初指',
            confirmFlow: [{ step: RESP_CONFIRM_STEPS[0], operator: rr.person || rec.responsiblePerson || '网格员', time: rr.date || '', note: '按规则 ' + sug.ruleId + '（' + sug.ruleName + '）自动推荐' }],
            changeLogs: []
        };
    });
    return rec;
}

// 多级确认推进（初指 → 村委确认 → 乡镇复核）；返回 false 表示已到末级或记录缺失
function confirmResponsibilityStep(rec, riskRecordId, operator) {
    const rr = (rec.riskRecords || []).find(r => r.id === riskRecordId || r.archiveNo === riskRecordId);
    if (!rr || !rr.responsibility) return false;
    const resp = rr.responsibility;
    const curIdx = RESP_CONFIRM_STEPS.indexOf(resp.status === '初指' ? RESP_CONFIRM_STEPS[0] : resp.status);
    if (curIdx < 0 || curIdx >= RESP_CONFIRM_STEPS.length - 1) return false;
    const next = RESP_CONFIRM_STEPS[curIdx + 1];
    const now = new Date();
    const pad = n => (n < 10 ? '0' : '') + n;
    const ts = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    resp.status = next;
    resp.confirmFlow.push({ step: next, operator: operator || '当前用户', time: ts, note: next === '村委确认' ? '村委审核确认责任单位' : '乡镇复核最终确认' });
    return true;
}

// 责任单位变更：记录变更履历并推送通知
function changeResponsibleUnit(rec, riskRecordId, payload) {
    const rr = (rec.riskRecords || []).find(r => r.id === riskRecordId || r.archiveNo === riskRecordId);
    if (!rr || !rr.responsibility || !payload) return false;
    const resp = rr.responsibility;
    const now = new Date();
    const pad = n => (n < 10 ? '0' : '') + n;
    const ts = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    const from = resp.primary.label + ' ' + resp.primary.name;
    resp.primary = {
        type: payload.type,
        label: RESPONSIBLE_UNIT_TYPES[payload.type] || payload.type,
        name: payload.name || resolveResponsibleName(rec, rr, payload.type),
        duty: RESPONSIBLE_DUTY_MAP[payload.type] || ''
    };
    if (Array.isArray(payload.support)) resp.support = payload.support.map(t => ({
        type: t, label: RESPONSIBLE_UNIT_TYPES[t] || t, name: resolveResponsibleName(rec, rr, t), duty: RESPONSIBLE_DUTY_MAP[t] || ''
    }));
    resp.changeLogs.push({ time: ts, operator: payload.operator || '当前用户', from: from, to: resp.primary.label + ' ' + resp.primary.name, reason: payload.reason || '' });
    try { pushNotification(rec, { riskName: rr.riskName, hazardType: rr.riskType, riskLevel: rr.riskLevel, location: rr.riskPart }, '责任单位变更'); } catch (e) {}
    return true;
}

// ========== 整改措施与执行期限（6.1.2.17.4 演示）==========
// 整改措施库：独立存储于 localStorage（key 见下），支持增删改查与标签分类
const MEASURE_LIB_KEY = 'houseMeasureLib';
// 预置措施模板：充分考虑农村适用性，描述通俗化
// 措施施工示意图（演示：内联 SVG dataURL，正式版为上传图片/附件）
function makeMeasureSvg(text, color) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80">' +
        '<rect width="120" height="80" rx="4" fill="' + color + '"/>' +
        '<rect x="8" y="8" width="104" height="64" rx="2" fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="4 3"/>' +
        '<text x="60" y="38" font-size="13" fill="#fff" text-anchor="middle" font-family="Microsoft YaHei">' + text + '</text>' +
        '<text x="60" y="56" font-size="10" fill="rgba(255,255,255,.85)" text-anchor="middle" font-family="Microsoft YaHei">施工示意图</text>' +
        '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
const MEASURE_LIBRARY_SEED = [
    { id: 'ML-DJ-01', tag: '地基加固', name: '夯实加固', desc: '对软弱地基分层回填素土并逐层夯实，每层厚度不超过30厘米', requirement: '夯实度达到规范要求，雨天停止作业', dutyAdvice: '户主聘请有资质施工队伍', acceptStd: '地基承载力检测合格，沉降观测稳定', img: makeMeasureSvg('夯实加固', '#8b5a2b') },
    { id: 'ML-DJ-02', tag: '地基加固', name: '碎石桩加固', desc: '在基础周边打入碎石桩挤密地基土，提高地基承载力', requirement: '桩位布置经技术人员确认，施工期做好沉降观测', dutyAdvice: '乡镇政府统筹专业队伍', acceptStd: '复合地基承载力检测合格', img: makeMeasureSvg('碎石桩加固', '#8b5a2b') },
    { id: 'ML-QT-01', tag: '墙体加固', name: '钢筋网抹面', desc: '墙体裂缝修补可采用水泥砂浆填缝，墙面挂钢筋网后抹面加固', requirement: '钢筋网与墙体可靠锚固，抹面厚度均匀', dutyAdvice: '户主组织施工，村委会协助监督', acceptStd: '抹面平整无空鼓，裂缝不再发展', img: makeMeasureSvg('钢筋网抹面', '#b03a2e') },
    { id: 'ML-QT-02', tag: '墙体加固', name: '增设扶壁柱', desc: '在墙体薄弱部位增设砖砌或混凝土扶壁柱，提高墙体稳定性', requirement: '扶壁柱与原墙可靠连接，基础同步处理', dutyAdvice: '户主聘请有资质施工队伍', acceptStd: '扶壁柱垂直度合格，连接部位无开裂', img: makeMeasureSvg('增设扶壁柱', '#b03a2e') },
    { id: 'ML-MG-01', tag: '木构件更换', name: '檩条更换', desc: '木构件更换需选用干燥木材并做防腐处理，腐朽檩条整根更换', requirement: '木材含水率符合要求，防腐处理到位', dutyAdvice: '户主组织农村工匠施工', acceptStd: '新檩条安装牢固，挠度合格', img: makeMeasureSvg('檩条更换', '#7d6608') },
    { id: 'ML-MG-02', tag: '木构件更换', name: '椽子更换', desc: '腐朽、虫蛀椽子按原规格更换，更换前对相邻构件临时支撑', requirement: '先支撑后更换，禁止大面积拆除', dutyAdvice: '户主组织农村工匠施工', acceptStd: '屋面平整，椽子固定可靠', img: makeMeasureSvg('椽子更换', '#7d6608') },
    { id: 'ML-WM-01', tag: '屋面维修', name: '小青瓦修补', desc: '破损小青瓦按原样式补配更换，屋脊、檐口重点部位挂灰坐浆', requirement: '瓦面铺设平整，排水顺畅无倒泛水', dutyAdvice: '户主组织农村工匠施工', acceptStd: '雨后检查无渗漏', img: makeMeasureSvg('小青瓦修补', '#1a5276') },
    { id: 'ML-WM-02', tag: '屋面维修', name: '防水处理', desc: '屋面清理后满铺防水卷材或涂刷防水涂料，节点部位加强处理', requirement: '基层干燥平整，搭接宽度符合要求', dutyAdvice: '户主聘请专业防水队伍', acceptStd: '蓄水或淋水试验无渗漏', img: makeMeasureSvg('防水处理', '#1a5276') },
    { id: 'ML-CC-01', tag: '拆除重建', name: '整体拆除重建', desc: 'D级危房或无修缮价值房屋整体拆除，按宅基地审批面积原址重建', requirement: '拆除前完成人员安置，重建履行审批手续', dutyAdvice: '乡镇政府统筹，申请危房改造补助', acceptStd: '重建房屋竣工验收合格', img: makeMeasureSvg('拆除重建', '#6c3483'), fundingNodes: '3个月内完成危房改造补助申请，6个月内启动施工，12个月内完成整改' }
];
function getMeasureLibrary() {
    try {
        const raw = localStorage.getItem(MEASURE_LIB_KEY);
        if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length) return arr; }
    } catch (e) {}
    return JSON.parse(JSON.stringify(MEASURE_LIBRARY_SEED));
}
function saveMeasureLibrary(list) {
    try { localStorage.setItem(MEASURE_LIB_KEY, JSON.stringify(list)); } catch (e) {}
}
function upsertMeasureLibItem(item) {
    const lib = getMeasureLibrary();
    const idx = lib.findIndex(m => m.id === item.id);
    if (idx !== -1) lib[idx] = item; else lib.push(item);
    saveMeasureLibrary(lib);
    return item;
}
function deleteMeasureLibItem(id) {
    saveMeasureLibrary(getMeasureLibrary().filter(m => m.id !== id));
}
// 一键导入预置模板：缺失的整条补入；已存在但缺示意图/阶段性节点的补齐字段
function importMeasureLibSeed() {
    const lib = getMeasureLibrary();
    let added = 0, updated = 0;
    MEASURE_LIBRARY_SEED.forEach(function(seed) {
        const cur = lib.find(m => m.id === seed.id);
        if (!cur) { lib.push(JSON.parse(JSON.stringify(seed))); added++; return; }
        ['img', 'fundingNodes'].forEach(function(k) {
            if (!cur[k] && seed[k]) { cur[k] = seed[k]; updated++; }
        });
    });
    saveMeasureLibrary(lib);
    return { added: added, updated: updated };
}

// 时限规则：按风险等级生成建议时限（演示：沪标三级 ↔ 规范四档映射）
const DEADLINE_RULES = [
    { level: '第一类', tier: '重大风险', text: '立即撤离人员并采取临时措施（24小时内）', days: 1, urgent: true },
    { level: '第二类', tier: '较大风险', text: '限时整改（3-6个月）', months: 6 },
    { level: '第三类', tier: '一般风险', text: '常规整改（6-12个月）', months: 12 },
    { level: '低风险', tier: '低风险', text: '纳入计划整改（12-24个月或纳入日常维护）', months: 24 }
];
// 农忙月份（演示农事日历）：5-6月夏收、9-10月秋收
const FARM_BUSY_MONTHS = [5, 6, 9, 10];
// 按等级+农事日历建议时限：落点撞农忙则顺延至农忙后
function suggestDeadline(riskLevel, startDateStr) {
    const rule = DEADLINE_RULES.find(r => r.level === riskLevel) || DEADLINE_RULES[2];
    const start = startDateStr ? new Date(startDateStr) : new Date();
    let d;
    if (rule.days) {
        d = new Date(start.getTime() + rule.days * 86400000);
    } else {
        d = new Date(start.getTime());
        d.setMonth(d.getMonth() + rule.months);
    }
    let farmNote = '';
    if (!rule.urgent && FARM_BUSY_MONTHS.indexOf(d.getMonth() + 1) !== -1) {
        // 顺延至农忙结束次月1日
        let m = d.getMonth() + 1;
        while (FARM_BUSY_MONTHS.indexOf(m) !== -1) m = m === 12 ? 1 : m + 1;
        d = new Date(d.getFullYear() + (m < d.getMonth() + 1 ? 1 : 0), m - 1, 1);
        farmNote = '已避开农忙时节，顺延至' + m + '月';
    }
    const pad = n => (n < 10 ? '0' : '') + n;
    const dateStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    return { date: dateStr, ruleLevel: rule.level, tier: rule.tier, text: rule.text, urgent: !!rule.urgent, farmNote: farmNote };
}

// 按风险类型匹配措施标签（演示规则）
const MEASURE_TAG_RULES = [
    { kw: /地基|基础|沉降/, tag: '地基加固' },
    { kw: /墙|裂缝|倾斜|承重/, tag: '墙体加固' },
    { kw: /木|檩|椽|腐朽|虫蛀/, tag: '木构件更换' },
    { kw: /屋面|渗漏|瓦|防水/, tag: '屋面维修' },
    { kw: /D级|拆除|重建/, tag: '拆除重建' }
];
function pickMeasuresForRisk(rr) {
    const lib = getMeasureLibrary();
    const text = (rr.riskType || '') + (rr.riskDesc || '') + (rr.hazardDesc || '') + (rr.riskPart || '');
    const rule = MEASURE_TAG_RULES.find(r => r.kw.test(text));
    const tag = rule ? rule.tag : '';
    // 命中标签取前 2 条；未命中默认取钢筋网抹面+小青瓦修补（农村高频）
    let picks = tag ? lib.filter(m => m.tag === tag).slice(0, 2) : [];
    if (!picks.length) picks = lib.filter(m => ['ML-QT-01', 'ML-WM-01'].indexOf(m.id) !== -1);
    return picks.map(m => m.id);
}

// 补齐风险级记录的整改方案 rectPlan（幂等，仅补缺）
function ensureRectPlan(rec) {
    if (!rec) return rec;
    (rec.riskRecords || []).forEach(rr => {
        if (rr.rectPlan) return;
        const sug = suggestDeadline(rr.riskLevel || '第三类', String(rr.date || '').slice(0, 10));
        rr.rectPlan = {
            measureIds: pickMeasuresForRisk(rr),
            tempMeasures: [],
            deadline: sug.date,
            deadlineText: sug.text + (sug.farmNote ? '（' + sug.farmNote + '）' : ''),
            deadlineUrgent: sug.urgent,
            deadlineAdjusts: [],
            dispatchStatus: '待派发',
            dispatchedTo: [],
            dispatchTime: ''
        };
    });
    return rec;
}

// 时限调整：留痕（旧值/新值/理由/时间/操作人）
function adjustRectDeadline(rec, riskRecordId, newDate, reason, operator) {
    const rr = (rec.riskRecords || []).find(r => r.id === riskRecordId || r.archiveNo === riskRecordId);
    if (!rr || !rr.rectPlan || !newDate) return false;
    const now = new Date();
    const pad = n => (n < 10 ? '0' : '') + n;
    const ts = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    rr.rectPlan.deadlineAdjusts.push({ oldDate: rr.rectPlan.deadline, newDate: newDate, reason: reason || '', time: ts, operator: operator || '当前用户' });
    rr.rectPlan.deadline = newDate;
    return true;
}

// 派发整改任务：主责单位 + 抄送村支书/网格员/乡镇建设管理员，联动消息通知
function dispatchRectTask(rec, riskRecordId, operator) {
    const rr = (rec.riskRecords || []).find(r => r.id === riskRecordId || r.archiveNo === riskRecordId);
    if (!rr || !rr.rectPlan || rr.rectPlan.dispatchStatus === '已派发') return false;
    const primaryName = (rr.responsibility && rr.responsibility.primary) ? rr.responsibility.primary.name : (rec.owner || '户主');
    const now = new Date();
    const pad = n => (n < 10 ? '0' : '') + n;
    const ts = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    rr.rectPlan.dispatchStatus = '已派发';
    rr.rectPlan.dispatchTime = ts;
    rr.rectPlan.dispatchedTo = [
        { role: '责任单位', name: primaryName },
        { role: '村支书', name: '村支书（抄送）' },
        { role: '网格员', name: '网格员（抄送）' },
        { role: '乡镇建设管理员', name: '乡镇建设管理员（抄送）' }
    ];
    // 联动处置过程状态机（6.1.2.17.5）：派发即进入「待接收」
    if (rr.rectProcess && !rr.rectProcess.status) {
        rr.rectProcess.status = 'pendingReceive';
        rr.rectProcess.statusSince = ts;
        rr.rectProcess.history.push({
            time: ts, state: 'dispatch', title: '整改任务派发',
            operator: operator || '系统', content: '期限 ' + (rr.rectPlan.deadline || '—'),
            photos: [], derived: true
        });
    }
    try {
        pushNotification(rec, { riskName: rr.riskName, hazardType: rr.riskType, riskLevel: rr.riskLevel, location: rr.riskPart },
            '整改任务派发（期限 ' + rr.rectPlan.deadline + '）');
    } catch (e) {}
    return true;
}

// 时限状态：safe=正常 / warning=临近（≤15天）/ danger=已超期
function getDeadlineStatus(deadlineStr) {
    if (!deadlineStr) return { cls: 'info', text: '未设置', days: null };
    const diff = Math.ceil((new Date(deadlineStr) - new Date()) / 86400000);
    if (diff < 0) return { cls: 'danger', text: '已超期 ' + (-diff) + ' 天', days: diff, overdue: true };
    if (diff <= 15) return { cls: 'warning', text: '临近到期（剩 ' + diff + ' 天）', days: diff, near: true };
    return { cls: 'safe', text: '剩 ' + diff + ' 天', days: diff };
}

// ========== 风险处理过程监控（6.1.2.17.5 演示）==========
// 10 态处置状态机：定义标签 / 操作角色 / 必传材料规则 / 状态 SLA（天）
const RECT_PROCESS_STATES = {
    pendingReceive: { label: '待接收',   role: '责任人（户主）',       slaDays: 3,  uploads: [] },
    siteReview:     { label: '现场复核', role: '村干部/乡镇建设管理员', slaDays: 7,  uploads: ['复核记录', '现场照片'] },
    tempMeasure:    { label: '临时措施', role: '责任人（户主）',       slaDays: 2,  uploads: ['警戒线照片', '人员撤离记录'] },
    artisanPick:    { label: '工匠选择', role: '责任人（户主）',       slaDays: 15, uploads: ['工匠信息'] },
    materialPrep:   { label: '材料准备', role: '责任人（户主）',       slaDays: 15, uploads: ['材料采购证明', '材料进场照片'] },
    rectifying:     { label: '整改实施', role: '责任人（户主）',       slaDays: 30, uploads: ['实施过程记录', '现场照片'] },
    effectVerify:   { label: '效果验证', role: '村干部/乡镇建设管理员', slaDays: 7,  uploads: ['验证照片', '验证结论'] },
    accepted:       { label: '验收通过', role: '乡镇建设管理员/县级部门', slaDays: null, uploads: [] },
    rejected:       { label: '验收驳回', role: '乡镇建设管理员/县级部门', slaDays: null, uploads: ['驳回理由'] },
    overdue:        { label: '逾期未整改', role: '系统（自动升级）',    slaDays: null, uploads: [] }
};
const RECT_STATE_ORDER = ['pendingReceive', 'siteReview', 'tempMeasure', 'artisanPick', 'materialPrep', 'rectifying', 'effectVerify', 'accepted'];
// 合法流转表（验收驳回 → 退回整改实施；逾期未整改 → 恢复整改实施）
const RECT_STATE_FLOW = {
    pendingReceive: ['siteReview'],
    siteReview:     ['tempMeasure'],
    tempMeasure:    ['artisanPick'],
    artisanPick:    ['materialPrep'],
    materialPrep:   ['rectifying'],
    rectifying:     ['effectVerify'],
    effectVerify:   ['accepted', 'rejected'],
    rejected:       ['rectifying'],
    overdue:        ['rectifying'],
    accepted:       []
};
// 必传材料校验规则：state → [{ key, label, isPhoto }]
const RECT_STATE_RULES = {
    siteReview:   [{ key: 'note', label: '复核记录' }, { key: 'photos', label: '现场照片', isPhoto: true }],
    tempMeasure:  [{ key: 'photos', label: '警戒线照片', isPhoto: true }, { key: 'evacuation', label: '人员撤离记录' }],
    artisanPick:  [{ key: 'artisan', label: '工匠信息' }],
    materialPrep: [{ key: 'photos', label: '材料进场照片', isPhoto: true }, { key: 'purchase', label: '材料采购证明' }],
    rectifying:   [{ key: 'note', label: '实施过程记录' }, { key: 'photos', label: '现场照片', isPhoto: true }, { key: 'hiddenAccept', label: '隐蔽工程验收记录', optional: true }],
    effectVerify: [{ key: 'photos', label: '验证照片', isPhoto: true }, { key: 'conclusion', label: '验证结论' }],
    rejected:     [{ key: 'note', label: '驳回理由' }]
};
function __rectNow() {
    const now = new Date();
    const pad = n => (n < 10 ? '0' : '') + n;
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
}
// 第六遍：补齐处置过程 rectProcess（幂等，仅补缺）；已派发任务播种至「待接收」，已销号风险播种至「验收通过」（由闭环数据派生）
function ensureRectProcess(rec) {
    if (!rec) return rec;
    (rec.riskRecords || []).forEach(rr => {
        const ci = rec.closeInfo || {};
        // 存量升级：已销号但 rectProcess 仍为空状态的，补派生闭环记录
        if (rr.rectProcess && !rr.rectProcess.status && rr.stage === 'closed') {
            const t = ci.reportTime || __rectNow();
            rr.rectProcess.status = 'accepted';
            rr.rectProcess.statusSince = t;
            (rr.rectProcess.history = rr.rectProcess.history || []).push(
                { time: t, state: 'rectifying', title: '整改实施', operator: rr.person || '', content: '整治措施实施完成（历史闭环数据派生）', photos: [], derived: true },
                { time: t, state: 'effectVerify', title: '效果验证', operator: ci.reporter || '乡镇建设管理员', content: '复验合格，风险消除（历史闭环数据派生）', photos: [], derived: true },
                { time: t, state: 'accepted', title: '验收通过', operator: ci.reporter || '乡镇建设管理员', content: '整改完成并归档（历史闭环数据派生）', photos: [], derived: true }
            );
            return;
        }
        if (rr.rectProcess) return;
        const dispatched = rr.rectPlan && rr.rectPlan.dispatchStatus === '已派发';
        const closed = rr.stage === 'closed';
        const rp = {
            status: closed ? 'accepted' : (dispatched ? 'pendingReceive' : ''),
            statusSince: closed ? (ci.reportTime || '') : (dispatched ? (rr.rectPlan.dispatchTime || __rectNow()) : ''),
            history: [],
            overdueLevel: ''   // '' | village | town | county
        };
        if (closed) {
            rp.history.push({ time: rp.statusSince, state: 'rectifying', title: '整改实施', operator: rr.person || '', content: '整治措施实施完成（历史闭环数据派生）', photos: [], derived: true });
            rp.history.push({ time: rp.statusSince, state: 'effectVerify', title: '效果验证', operator: ci.reporter || '乡镇建设管理员', content: '复验合格，风险消除（历史闭环数据派生）', photos: [], derived: true });
            rp.history.push({ time: rp.statusSince, state: 'accepted', title: '验收通过', operator: ci.reporter || '乡镇建设管理员', content: '整改完成并归档（历史闭环数据派生）', photos: [], derived: true });
        } else if (dispatched) {
            rp.history.push({
                time: rr.rectPlan.dispatchTime || __rectNow(),
                state: 'dispatch', title: '整改任务派发',
                operator: '系统', content: '期限 ' + (rr.rectPlan.deadline || '—'),
                photos: [], derived: true
            });
        }
        rr.rectProcess = rp;
    });
    return rec;
}
// 校验必传材料，返回缺失项标签数组
function validateRectStateUploads(stateKey, payload) {
    const rules = RECT_STATE_RULES[stateKey] || [];
    const missing = [];
    rules.forEach(r => {
        if (r.optional) return;
        const v = payload ? payload[r.key] : null;
        const ok = r.isPhoto ? (Array.isArray(v) && v.length > 0) : !!(v && String(v).trim());
        if (!ok) missing.push(r.label);
    });
    return missing;
}
// 状态推进：校验流转合法性 + 必传材料；追加 history + 风险事件链 timeline；推送通知
function advanceRectProcess(rec, riskRecordId, payload) {
    const rr = (rec.riskRecords || []).find(r => r.id === riskRecordId || r.archiveNo === riskRecordId);
    if (!rr || !rr.rectProcess || !payload || !payload.to) return { ok: false, msg: '参数不完整' };
    const proc = rr.rectProcess;
    const from = proc.status;
    if (from === 'accepted') return { ok: false, msg: '已验收归档，不可再流转' };
    const allowed = RECT_STATE_FLOW[from] || [];
    if (allowed.indexOf(payload.to) === -1) {
        return { ok: false, msg: '不允许从「' + (RECT_PROCESS_STATES[from] || {}).label + '」流转至「' + (RECT_PROCESS_STATES[payload.to] || {}).label + '」' };
    }
    const missing = validateRectStateUploads(payload.to, payload);
    if (missing.length) return { ok: false, msg: '缺少必传材料：' + missing.join('、') };
    const ts = __rectNow();
    const st = RECT_PROCESS_STATES[payload.to];
    const ev = {
        time: ts, state: payload.to, title: st.label,
        operator: payload.operator || '当前用户',
        role: payload.role || st.role,
        content: payload.note || payload.conclusion || '',
        photos: Array.isArray(payload.photos) ? payload.photos : [],
        extra: {
            evacuation: payload.evacuation || '',
            artisan: payload.artisan || '',
            purchase: payload.purchase || '',
            hiddenAccept: payload.hiddenAccept || ''
        }
    };
    proc.history.push(ev);
    proc.status = payload.to;
    proc.statusSince = ts;
    proc.overdueLevel = '';
    // 同步风险事件链时间轴（6.1.2.17.1 载体复用）
    if (!Array.isArray(rr.timeline)) rr.timeline = [];
    rr.timeline.push({
        time: ts, node: 'process', title: '处置：' + st.label,
        operator: ev.operator, content: ev.content, photos: ev.photos
    });
    try {
        pushNotification(rec, { riskName: rr.riskName, hazardType: rr.riskType, riskLevel: rr.riskLevel, location: rr.riskPart },
            '处置进展：' + st.label);
    } catch (e) {}
    return { ok: true };
}
// 验收驳回：effectVerify → rejected（理由必填，经统一流转校验）
function rejectRectProcess(rec, riskRecordId, reason, operator) {
    return advanceRectProcess(rec, riskRecordId, { to: 'rejected', note: reason, operator: operator || '乡镇建设管理员' });
}
// 分状态超期检测：返回 { overdue, days, slaDays, escalateTo } —— 逐级上报 村→镇→县
function checkProcessOverdue(rec, rr) {
    const proc = rr && rr.rectProcess;
    if (!proc || !proc.status || proc.status === 'accepted') return { overdue: false };
    const st = RECT_PROCESS_STATES[proc.status];
    if (!st || !st.slaDays || !proc.statusSince) return { overdue: false };
    const days = Math.floor((new Date() - new Date(String(proc.statusSince).replace(' ', 'T'))) / 86400000);
    if (days <= st.slaDays) return { overdue: false, days: days, slaDays: st.slaDays };
    const overDays = days - st.slaDays;
    let escalateTo = 'village';
    if (overDays > 7) escalateTo = 'town';
    if (overDays > 15) escalateTo = 'county';
    return { overdue: true, days: days, slaDays: st.slaDays, overDays: overDays, escalateTo: escalateTo, stateLabel: st.label };
}
// 超时未接收 → 通知村干部上门告知；分状态超期 → 分级预警通知（幂等：同级不重复）
function escalateProcessOverdue(rec, riskRecordId) {
    const rr = (rec.riskRecords || []).find(r => r.id === riskRecordId || r.archiveNo === riskRecordId);
    if (!rr || !rr.rectProcess) return false;
    const chk = checkProcessOverdue(rec, rr);
    if (!chk.overdue) return false;
    const proc = rr.rectProcess;
    if (proc.overdueLevel === chk.escalateTo) return false;
    proc.overdueLevel = chk.escalateTo;
    const ESC_LABEL = { village: '村委会', town: '乡镇政府', county: '县级住建部门' };
    const target = ESC_LABEL[chk.escalateTo];
    const msg = proc.status === 'pendingReceive'
        ? '超时未接收整改任务，请' + target + '安排村干部上门告知'
        : '「' + chk.stateLabel + '」超期 ' + chk.overDays + ' 天，预警逐级上报至' + target;
    try {
        pushNotification(rec, { riskName: rr.riskName, hazardType: rr.riskType, riskLevel: rr.riskLevel, location: rr.riskPart }, msg);
    } catch (e) {}
    if (!Array.isArray(rr.timeline)) rr.timeline = [];
    rr.timeline.push({ time: __rectNow(), node: 'overdue', title: '超期预警（上报' + target + '）', operator: '系统', content: msg });
    return true;
}

// ========== 风险控制效果评估（6.1.2.17.6 演示）==========
// 满意度回访：已验收（accepted）风险幂等回填 4-5 星演示评价
function ensureSatisfaction(rec) {
    if (!rec) return rec;
    (rec.riskRecords || []).forEach((rr, i) => {
        if (rr.satisfaction != null) return;
        const done = rr.rectProcess && rr.rectProcess.status === 'accepted';
        if (!done) return;
        // 确定性伪随机：按档案序号 4/5 星交替
        rr.satisfaction = { stars: (i % 2 === 0 ? 5 : 4), comment: i % 2 === 0 ? '整改及时，居住安心' : '整改到位，回访满意', visitTime: (rr.rectProcess.statusSince || '') };
    });
    return rec;
}

// 等级数值化（沪标三级：第三类最重）用于整改前后对比
const __LEVEL_SCORE = { '第三类': 3, '第二类': 2, '第一类': 1 };
// 汇总单房屋指标明细（供总览聚合）：返回该房屋所有风险的评估条目
function collectRiskEvalItems(rec) {
    const items = [];
    (rec.riskRecords || []).forEach(rr => {
        const proc = rr.rectProcess || {};
        const done = proc.status === 'accepted';
        // 按期判定：验收通过时间 ≤ 当前期限（含调整后）
        let onTime = null;
        if (done && rr.rectPlan && rr.rectPlan.deadline) {
            const acceptEv = (proc.history || []).filter(h => h.state === 'accepted').pop();
            const acceptTime = acceptEv ? String(acceptEv.time).slice(0, 10) : '';
            onTime = acceptTime && acceptTime <= rr.rectPlan.deadline;
        }
        // 整改有效率：验收通过 且 （效果验证结论合格 或 后续巡查无同类问题——演示：结论含「合格/不再发展」）
        let effective = null;
        if (done) {
            const verifyEvs = (proc.history || []).filter(h => h.state === 'effectVerify');
            const lastVerify = verifyEvs[verifyEvs.length - 1];
            const concl = lastVerify ? String(lastVerify.content || '') : '';
            effective = /合格|不再发展|通过|稳定/.test(concl);
        }
        items.push({
            houseNo: rec.no,
            street: rec.street || '', village: rec.village || rec.community || '',
            structure: (rec.structure && rec.structure.structureType) || rec.structureType || '',
            buildYear: rec.buildYear || (rec.basic && rec.basic.buildYear) || '',
            riskId: rr.id, riskType: rr.riskType || rr.hazardType || '', riskLevel: rr.riskLevel || '',
            rectified: done, onTime: onTime, effective: effective,
            satisfaction: rr.satisfaction || null
        });
    });
    return items;
}
// 复发判定：同一房屋同一风险类型出现次数 >1 视为复发
function countRecurrence(rec) {
    const typeMap = {};
    (rec.riskRecords || []).forEach(rr => {
        const t = rr.riskType || rr.hazardType || '';
        if (!t) return;
        typeMap[t] = (typeMap[t] || 0) + 1;
    });
    let recurTypes = 0, recurTimes = 0;
    Object.keys(typeMap).forEach(t => {
        if (typeMap[t] > 1) { recurTypes++; recurTimes += typeMap[t] - 1; }
    });
    return { recurTypes: recurTypes, recurTimes: recurTimes, typeMap: typeMap };
}

// 6 项指标聚合（输入：房屋记录数组）
function computeEffectMetrics(records) {
    const m = {
        totalRisks: 0, rectified: 0, onTime: 0, onTimeBase: 0,
        effective: 0, effectiveBase: 0,
        dangerTotal: 0, dangerResolved: 0,
        satisfactionSum: 0, satisfactionCount: 0,
        recurHouses: 0, recurTimes: 0, houseWithRisks: 0
    };
    (records || []).forEach(rec => {
        const items = collectRiskEvalItems(rec);
        if (items.length) m.houseWithRisks++;
        const rec2 = countRecurrence(rec);
        if (rec2.recurTypes > 0) m.recurHouses++;
        m.recurTimes += rec2.recurTimes;
        items.forEach(it => {
            m.totalRisks++;
            if (it.rectified) m.rectified++;
            if (it.onTime !== null) { m.onTimeBase++; if (it.onTime) m.onTime++; }
            if (it.effective !== null) { m.effectiveBase++; if (it.effective) m.effective++; }
            if (it.satisfaction) { m.satisfactionSum += it.satisfaction.stars; m.satisfactionCount++; }
        });
        // 危房解危率：第三类（严重损坏房）治理完成且销号通过
        if ((rec.riskLevel === '第三类' || (rec.overview && rec.overview.riskLevel === '第三类'))) {
            m.dangerTotal++;
            if (rec.governance === 'done' && rec.closeStatus === '已通过') m.dangerResolved++;
        }
    });
    const pct = (a, b) => b > 0 ? Math.round((a / b) * 1000) / 10 : null;
    return {
        completionRate: pct(m.rectified, m.totalRisks),          // 整改完成率
        timelinessRate: pct(m.onTime, m.onTimeBase),             // 整改及时率
        effectivenessRate: pct(m.effective, m.effectiveBase),    // 整改有效率
        recurrenceRate: pct(m.recurHouses, m.houseWithRisks),    // 复发率（房屋口径）
        recurrenceTimes: m.recurTimes,
        dangerResolveRate: pct(m.dangerResolved, m.dangerTotal), // 危房解危率
        dangerTotal: m.dangerTotal, dangerResolved: m.dangerResolved,
        satisfactionAvg: m.satisfactionCount ? Math.round((m.satisfactionSum / m.satisfactionCount) * 10) / 10 : null, // 农户满意度（均星）
        satisfactionCount: m.satisfactionCount,
        totalRisks: m.totalRisks, rectified: m.rectified
    };
}
// 多维度下钻：dimKey ∈ street|village|structure|buildYear|riskLevel
function drillEffectMetrics(records, dimKey) {
    const groups = {};
    (records || []).forEach(rec => {
        let key;
        if (dimKey === 'buildYear') {
            const y = parseInt(rec.buildYear || (rec.basic && rec.basic.buildYear) || 0, 10);
            key = !y ? '未知' : (y < 1980 ? '1980年前' : (y < 2000 ? '1980-1999' : (y < 2010 ? '2000-2009' : '2010年后')));
        } else if (dimKey === 'structure') {
            key = (rec.structure && rec.structure.structureType) || rec.structureType || '未知';
        } else if (dimKey === 'village') {
            key = rec.village || rec.community || '未知';
        } else if (dimKey === 'riskLevel') {
            key = rec.riskLevel || '未知';
        } else {
            key = rec.street || '未知';
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(rec);
    });
    return Object.keys(groups).map(k => ({ dim: k, metrics: computeEffectMetrics(groups[k]) }))
        .sort((a, b) => (b.metrics.totalRisks || 0) - (a.metrics.totalRisks || 0));
}
// 高复发风险类型识别（后评估：薄弱环节）
function identifyHighRecurrenceTypes(records) {
    const agg = {};
    (records || []).forEach(rec => {
        const rec2 = countRecurrence(rec);
        Object.keys(rec2.typeMap).forEach(t => {
            if (rec2.typeMap[t] > 1) {
                if (!agg[t]) agg[t] = { type: t, houses: 0, times: 0 };
                agg[t].houses++; agg[t].times += rec2.typeMap[t] - 1;
            }
        });
    });
    return Object.keys(agg).map(k => agg[k]).sort((a, b) => b.times - a.times);
}
// 导出 CSV（演示：替代 PDF/Word/Excel）
function exportEffectCsv(dimRows, metrics) {
    const esc = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    let csv = '﻿指标,数值\n';
    csv += '整改完成率(%),' + (metrics.completionRate == null ? '—' : metrics.completionRate) + '\n';
    csv += '整改及时率(%),' + (metrics.timelinessRate == null ? '—' : metrics.timelinessRate) + '\n';
    csv += '整改有效率(%),' + (metrics.effectivenessRate == null ? '—' : metrics.effectivenessRate) + '\n';
    csv += '复发率(%),' + (metrics.recurrenceRate == null ? '—' : metrics.recurrenceRate) + '\n';
    csv += '危房解危率(%),' + (metrics.dangerResolveRate == null ? '—' : metrics.dangerResolveRate) + '\n';
    csv += '农户满意度(均星),' + (metrics.satisfactionAvg == null ? '—' : metrics.satisfactionAvg) + '\n\n';
    csv += '维度,风险总数,已整改,完成率(%),及时率(%),有效率(%),复发率(%),解危率(%),满意度\n';
    (dimRows || []).forEach(r => {
        const mm = r.metrics;
        csv += [esc(r.dim), mm.totalRisks, mm.rectified,
            mm.completionRate == null ? '—' : mm.completionRate,
            mm.timelinessRate == null ? '—' : mm.timelinessRate,
            mm.effectivenessRate == null ? '—' : mm.effectivenessRate,
            mm.recurrenceRate == null ? '—' : mm.recurrenceRate,
            mm.dangerResolveRate == null ? '—' : mm.dangerResolveRate,
            mm.satisfactionAvg == null ? '—' : mm.satisfactionAvg].join(',') + '\n';
    });
    return csv;
}

function ensureRiskArchiveLayer(rec) {
    if (!rec) return rec;
    if (!Array.isArray(rec.riskRecords)) rec.riskRecords = [];
    if (!Array.isArray(rec.appraisalReports)) rec.appraisalReports = [];

    // 档案编号：缺失即补（按数组序号生成，稳定不重复）
    rec.riskRecords.forEach((rr, i) => { if (!rr.archiveNo) rr.archiveNo = generateRiskArchiveNo(rec.no, i + 1); });
    rec.appraisalReports.forEach((a, i) => { if (!a.appraisalNo) a.appraisalNo = generateAppraisalArchiveNo(rec.no, i + 1); });

    const findHz = rr => (rec.hazardRecords || []).find(h => h.id === (rr.hazardId || (Array.isArray(rr.linkedHazardIds) && rr.linkedHazardIds[0]))) || null;

    // 第一遍：生命周期阶段（linkRiskAppraisals 的兜底规则依赖全量 stage）
    rec.riskRecords.forEach(rr => {
        rr.stage = deriveRiskStage(rr, findHz(rr));
        rr.stageLabel = RISK_STAGE_LABELS[rr.stage] || rr.stage;
    });
    // 第二遍：关联鉴定 + 时间线播种
    rec.riskRecords.forEach(rr => {
        rr.appraisalIds = linkRiskAppraisals(rec, rr, findHz(rr));
        if (!Array.isArray(rr.timeline)) rr.timeline = [];
        if (!rr.timeline.length) rr.timeline = seedRiskTimeline(rec, rr, findHz(rr));
    });

    // 第三遍（6.1.2.17.2）：补齐风险级规范字段——基础/特征/关联三维度（幂等，仅补缺）
    const ri = rec.riskInfo || {};
    rec.riskRecords.forEach((rr, i) => {
        const hz = findHz(rr);
        if (!rr.riskNo) rr.riskNo = 'RSK-' + (rr.archiveNo || (rec.no + '-' + String(i + 1).padStart(3, '0')));
        if (!rr.riskName) rr.riskName = (rec.name || rec.no || '') + ' ' + (rr.riskLevel || '') + '风险';
        if (!rr.riskType) rr.riskType = (hz && hz.hazardType) || ri.riskType || '';
        if (!rr.discoveryMethod) rr.discoveryMethod = rr.sourceType === '巡查' ? '巡查发现' : (rr.sourceType === '鉴定' ? '鉴定确认' : (rr.sourceType === '排查' ? '排查发现' : (ri.discoveryMethod || '排查发现')));
        if (!rr.riskPart) rr.riskPart = (hz && (hz.location || hz.hazardPart)) || ri.riskPart || '';
        if (!rr.spatialLocation) rr.spatialLocation = ri.spatialLocation || rec.address || '';
        if (!rr.riskDesc) rr.riskDesc = rr.hazardDesc || ri.riskDesc || '';
        if (!rr.relatedHouse) rr.relatedHouse = rec.no || '';
        if (!rr.relatedOwner) rr.relatedOwner = rec.owner || ri.relatedOwner || '';
        if (!rr.relatedUser) rr.relatedUser = ri.relatedUser || rec.owner || '';
        if (!rr.relatedInspectionId && rr.sourceType === '排查' && rr.sourceId) rr.relatedInspectionId = rr.sourceId;
        if (!rr.relatedPatrolId && rr.sourceType === '巡查' && rr.sourceId) rr.relatedPatrolId = rr.sourceId;
    });

    // 鉴定级：登记被风险记录的消费关系
    // effectScope（派生）：仅被 1 条风险记录引用 → risk；多条引用或无引用 → 整屋 whole-house
    rec.appraisalReports.forEach(a => {
        if (!Array.isArray(a.appliedTo)) a.appliedTo = [];
        const linkedRisks = rec.riskRecords.filter(rr => (rr.appraisalIds || []).indexOf(a.id) !== -1);
        a.effectScope = linkedRisks.length === 1 ? 'risk' : 'whole-house';
        linkedRisks.forEach(rr => {
            if (!a.appliedTo.some(t => t.type === 'grading' && t.targetId === rr.archiveNo)) {
                a.appliedTo.push({ type: 'grading', targetId: rr.archiveNo });
            }
        });
    });

    // 第四遍（6.1.2.17.3）：责任单位归属补齐（幂等，仅补缺）
    ensureRiskResponsibility(rec);

    // 第五遍（6.1.2.17.4）：整改措施与时限补齐（幂等，仅补缺）
    ensureRectPlan(rec);

    // 第六遍（6.1.2.17.5）：处置过程状态机补齐（幂等，仅补缺）
    ensureRectProcess(rec);

    // 第七遍（6.1.2.17.6）：满意度回访补齐（幂等，仅补缺，仅已验收风险）
    ensureSatisfaction(rec);

    rec._riskArchiveVersion = RISK_ARCHIVE_LAYER_VERSION;
    return rec;
}

// 规范化单条记录：保持 risk/riskLevel、governance/governStatus 两对字段一致，
// 销号通过则统一为 safe/第一类 + done/已治理，并补全编号。
function normalizeHouseRecord(record) {
    if (!record) return record;
    const rec = record;
    // 确保 no 存在
    if (!rec.no) rec.no = '';

    // 历史脏数据修复：房屋性质(住宅/非住宅)曾被误写入 houseType，
    // 按编号序号奇偶还原房屋类别（与生成器 i%2 规则一致：偶数=农村自建房，奇数=城镇自建房）
    if (rec.houseType === '住宅' || rec.houseType === '非住宅') {
        if (!rec.houseNature) rec.houseNature = rec.houseType;
        const seqDigits = parseInt(String(rec.no || '').split('-').pop(), 10);
        rec.houseType = (seqDigits % 2 === 1) ? '城镇自建房' : '农村自建房';
    }

    // 确保全要素档案字段存在
    if (!rec.overview) rec.overview = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.overview));
    if (!rec.homestead) rec.homestead = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.homestead));
    if (!rec.designConstruction) rec.designConstruction = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.designConstruction));
    if (!rec.structure) rec.structure = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.structure));
    if (!rec.usage) rec.usage = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.usage));
    if (!rec.photos) rec.photos = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.photos));
    if (!rec.riskInfo) rec.riskInfo = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.riskInfo));
    if (!rec.inspectionRecords) rec.inspectionRecords = [];
    if (!rec.appraisalReports) rec.appraisalReports = [];
    if (!rec.patrolRecords) rec.patrolRecords = [];
    // 监测点清单（幂等）：供风险录入时选取关联
    if (!Array.isArray(rec.monitorPoints) || !rec.monitorPoints.length) rec.monitorPoints = generateMonitorPoints(rec.no);
    // 历史缓存记录缺失鉴定报告时按编号补生成（非安全房才需要鉴定）
    if (rec.risk && rec.risk !== 'safe') {
        const idx = parseInt(String(rec.no || '').replace(/\D/g, '') || '0', 10);
        if (!rec.appraisalReports.length) {
            rec.appraisalReports = generateAppraisalReports(rec.no, rec.risk, rec.governance || 'pending', idx);
        }
    } else if (!rec.appraisalReports.length) {
        rec.appraisalReports = [];
    }
    if (!rec.riskIdentification) rec.riskIdentification = [];
    if (!rec.riskClassification) rec.riskClassification = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.riskClassification));
    if (!rec.emergencyResponse) rec.emergencyResponse = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.emergencyResponse));
    if (!rec.closeInfo) rec.closeInfo = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.closeInfo));
    // 静态数据修改留痕（2026-10-19 新增，三层档案改造）
    if (!Array.isArray(rec.changeLog)) rec.changeLog = [];

    // 一房一档全周期档案（6.1.2.23.3）：结构特点/建筑材料/维修记录/改造记录（幂等补种）
    if (!rec.structureFeatures) rec.structureFeatures = generateStructureFeatures(rec);
    if (!Array.isArray(rec.buildMaterials)) rec.buildMaterials = generateBuildMaterials(rec);
    if (!Array.isArray(rec.maintenanceRecords)) rec.maintenanceRecords = generateLifecycleRecords(rec, 'maintenance');
    if (!Array.isArray(rec.renovationRecords)) rec.renovationRecords = generateLifecycleRecords(rec, 'renovation');

    // 房屋性质：旧数据缺省时按使用类型派生（自住/出租/空置→住宅；自住兼经营/其他→非住宅）
    if (!rec.houseNature) {
        const ut = (rec.usage && rec.usage.usageType) || (rec.overview && rec.overview.usage) || '';
        rec.houseNature = (ut === '自住兼经营' || ut === '其他') ? '非住宅' : '住宅';
    }

    // 销号已通过：强制无风险/已治理，但保留原始风险等级用于统计
    if (rec.closeStatus === '已通过') {
        rec.originalRisk = rec.originalRisk || rec.risk || 'warning';
        rec.originalRiskLevel = rec.originalRiskLevel || rec.riskLevel || RISK_LABEL_MAP[rec.risk] || '第一类';
        rec.risk = 'safe';
        rec.governance = 'done';
        rec.riskLevel = '第一类';
        rec.governStatus = '已治理';
        rec.isRemovedFromFocus = true;
        rec.riskDisplayLevel = HAZARD_TO_RISK_LEVEL[rec.originalRiskLevel] || rec.originalRiskLevel;
        return ensureRiskArchiveLayer(rec);
    }

    // 风险等级：以中文 riskLevel（风险等级）为准，回写 risk；若 riskLevel 缺失则反向生成
    if (rec.riskLevel && RISK_LABEL_MAP_INV[rec.riskLevel]) {
        rec.risk = RISK_LABEL_MAP_INV[rec.riskLevel];
    } else if (rec.risk && RISK_LABEL_MAP[rec.risk]) {
        rec.riskLevel = RISK_LABEL_MAP[rec.risk];
    } else {
        rec.risk = 'warning';
        rec.riskLevel = '第二类';
    }

    // 保留原始风险信息（便于销号后追溯）
    rec.originalRisk = rec.originalRisk || rec.risk;
    rec.originalRiskLevel = rec.originalRiskLevel || rec.riskLevel;

    // 农村自建房风险等级：与数据层保持一致（已统一）
    rec.riskDisplayLevel = HAZARD_TO_RISK_LEVEL[rec.riskLevel] || rec.riskLevel;
    if (rec.governStatus && STATUS_LABEL_MAP_INV[rec.governStatus]) {
        rec.governance = STATUS_LABEL_MAP_INV[rec.governStatus];
    } else if (rec.governance && STATUS_LABEL_MAP[rec.governance]) {
        rec.governStatus = STATUS_LABEL_MAP[rec.governance];
    } else {
        rec.governance = 'pending';
        rec.governStatus = '待整治';
    }

    if (!rec.closeStatus) rec.closeStatus = '未申请';
    if (!rec.riskInfo) rec.riskInfo = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.riskInfo));
    rec.riskInfo.riskLevel = rec.riskInfo.riskLevel || rec.riskLevel || '第二类';
    rec.riskInfo.riskStatus = rec.riskInfo.riskStatus || rec.governStatus || '待整治';
    rec.riskInfo.relatedHouse = rec.riskInfo.relatedHouse || rec.no || '';
    rec.riskInfo.relatedOwner = rec.riskInfo.relatedOwner || rec.owner || '';
    // 旧缓存记录补充发现方式（按编号数字轮换 4 类）
    if (!rec.riskInfo.discoveryMethod) {
        const idx = parseInt(String(rec.no || '').replace(/\D/g, '') || '0', 10);
        rec.riskInfo.discoveryMethod = DISCOVERY_METHODS[idx % DISCOVERY_METHODS.length];
    }

    // 旧缓存记录缺失整治措施记录时按编号补生成（非安全房）
    if (rec.risk && rec.risk !== 'safe') {
        const idx = parseInt(String(rec.no || '').replace(/\D/g, '') || '0', 10);
        const totalTask = rec.totalTask || (1 + (idx % 4));
        const doneTask = rec.doneTask !== undefined ? rec.doneTask : (rec.governance === 'done' ? totalTask : 0);
        if (!rec.manageRecords || !rec.manageRecords.length) {
            rec.manageRecords = generateManageRecords(rec.no, rec.risk, rec.governance || 'pending', doneTask, totalTask, idx);
        }
        if (!rec.projectRecords || !rec.projectRecords.length) {
            rec.projectRecords = generateProjectRecordsLocal(rec.no, rec.risk, rec.governance || 'pending', rec.projectMeasure || 1, idx, rec.fundTotal || 30000);
        }
        // 补齐计划相关字段
        if (!rec.rectDeadline && rec.manageRecords && rec.manageRecords[0]) rec.rectDeadline = rec.manageRecords[0].planEndTime || '';
        if (!rec.responsiblePerson) rec.responsiblePerson = RESPONSIBLE_PERSONS[idx % RESPONSIBLE_PERSONS.length];
        if (!rec.managerPhone) rec.managerPhone = MANAGER_PHONES[idx % MANAGER_PHONES.length];
        // 工程措施记录缺失的整治字段按既有数据补生成
        if (rec.projectRecords && rec.projectRecords.length) {
            rec.projectRecords.forEach((p, i2) => {
                if (!p.renovateApplyNo && !p.subsidyApplyNo) {
                    p.renovateApplyNo = p.subsidyApplyNo = 'BT-' + (p.taskNo || rec.no) + '-' + String(i2 + 1).padStart(3, '0');
                }
                if (p.subsidyAmount === undefined && p.fund !== undefined) p.subsidyAmount = p.fund;
                if (!p.taskNo) p.taskNo = rec.no;
                if (p.isDone && !p.acceptConclusion) p.acceptConclusion = '合格';
                if (!p.acceptUnit) p.acceptUnit = (rec.street || '海湾镇') + '建设管理部门';
                if (!p.acceptChecker) p.acceptChecker = p.manager || rec.responsiblePerson || RESPONSIBLE_PERSONS[(idx + i2) % RESPONSIBLE_PERSONS.length];
                if (!p.acceptDate) p.acceptDate = p.endDate || '';
            });
        }
    }

    return ensureRiskArchiveLayer(rec);
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
// 本地脏标记：sync 拉取在飞期间发生的本地写入，合并时改为本地优先，
// 避免旧快照把刚写入的登记/核实数据整条覆盖丢失（TOCTOU 竞态修复）
let __localDirty = false;
function setHouseRecord(no, record) {
    __localDirty = true;
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

// 局部更新单条记录：来源页面只改自己负责的模块，避免整对象覆盖互相踩踏
// 用法：patchHouseRecord(no, function(rec){ rec.patrolRecords.push(newPatrol); });
// patcher 收到 normalize 后的完整记录，改完自动持久化
function patchHouseRecord(no, patcher) {
    const rec = getHouseRecord(no) || ensureHouseRecord(no);
    if (typeof patcher === 'function') {
        patcher(rec);
    } else if (patcher && typeof patcher === 'object') {
        // 也支持传对象做浅合并（数组按模块整体替换，调用方需先读再合并）
        Object.keys(patcher).forEach(k => { rec[k] = patcher[k]; });
    }
    setHouseRecord(no, rec);
    return rec;
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
    // 部分已治理房屋增加一条变更续期记录
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
        const acceptDate = isDone ? endDate : '';
        const subsidyApplyNo = 'BT-' + no + '-' + String(idx + 1).padStart(3, '0');
        const acceptUnit = MODULE_STREETS[i % MODULE_STREETS.length] + '建设管理部门';
        const acceptChecker = RESPONSIBLE_PERSONS[(i + idx + 2) % RESPONSIBLE_PERSONS.length];
        records.push({
            id: no + '-P' + (idx + 1),
            taskNo: no,
            renovateApplyNo: subsidyApplyNo,
            projectName: pName,
            company: company,
            startDate: startDate,
            endDate: endDate,
            fund: projectFund,
            subsidyApplyNo: subsidyApplyNo,
            subsidyAmount: projectFund,
            acceptConclusion: isDone ? '合格' : '',
            acceptUnit: acceptUnit,
            acceptChecker: acceptChecker,
            acceptDate: acceptDate,
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
    const checkTime = pad2(8 + (i % 3)) + ':' + pad2(10 + (i % 40));
    // 农房初步判定仅三类：第一类（安全）/第二类（一般隐患）/第三类（严重隐患）
    const preliminary = risk === 'danger' ? '存在严重安全隐患(第三类)' : (risk === 'major' ? '存在一定安全隐患(第二类)' : '未发现安全隐患(第一类)');
    const conclusion = risk === 'danger' ? '存在重大安全隐患' : (risk === 'major' ? '存在较大安全隐患' : '存在一般安全隐患');
    const checkerRole = i % 2 === 0 ? '村干部' : '网格员';
    const checkOrg = i % 3 === 0 ? '奉城镇人民政府' : ('奉城镇' + VILLAGES[i % VILLAGES.length] + '村民委员会');
    const foundProblem = part + type;
    const hazardDesc = part + '出现' + type + '，存在' + RISK_LABEL_MAP[risk] + '风险，需尽快采取安全整治措施。';
    return [{
        id: 'INS-' + no + '-001',
        checkDate: checkDate,
        checkTime: checkTime,
        checkOrg: checkOrg,
        checker: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        checkerPhone: MANAGER_PHONES[i % MANAGER_PHONES.length],
        checkerRole: checkerRole,
        structureStatus: RISK_LABEL_MAP[risk],
        damagePart: part,
        overload: '否',
        otherRisk: '暂无',
        otherRisks: '暂无',
        preliminaryJudge: preliminary,
        preliminary: preliminary,
        checkConclusion: conclusion,
        foundProblem: foundProblem,
        hazardDesc: hazardDesc,
        location: '119.8563,28.8964',
        dutyPerson: RESPONSIBLE_PERSONS[(i + 1) % RESPONSIBLE_PERSONS.length],
        dutyPhone: MANAGER_PHONES[(i + 1) % MANAGER_PHONES.length],
        ownerName: RESPONSIBLE_PERSONS[(i + 1) % RESPONSIBLE_PERSONS.length],
        ownerPhone: MANAGER_PHONES[(i + 1) % MANAGER_PHONES.length],
        safetyName: RESPONSIBLE_PERSONS[(i + 3) % RESPONSIBLE_PERSONS.length],
        safetyPhone: MANAGER_PHONES[(i + 3) % MANAGER_PHONES.length],
        photos: '',
        preAppraisal: '否',
        noAppraisalReason: '资金尚未到位',
        proofFiles: '',
        remark: part + '存在' + type + '，需进行安全整治',
        reporter: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length],
        reportTime: checkDate + ' 09:00',
        updateTime: checkDate + ' 14:30',
        // 关联巡查任务字段
        sourceType: '排查发现',
        taskId: '',
        taskNo: '',
        taskName: ''
    }];
}

// 生成鉴定报告
function generateAppraisalReports(no, risk, governance, i) {
    if (risk === 'safe') return [];
    const isDone = governance === 'done';
    // 编号索引归一化，避免统一社会信用代码等派生字段过长
    const idx = i > 999 ? (i % 1000) : i;
    const appraisalDate = '2024-' + pad2(6 + (idx % 4)) + '-' + pad2(10 + (idx % 15));
    return [{
        id: 'APP-' + no + '-001',
        orgName: APPRAISAL_UNITS[idx % APPRAISAL_UNITS.length],
        orgCode: '91310120MA1K' + pad5(idx),
        appraisalDate: appraisalDate,
        appraiser: RESPONSIBLE_PERSONS[(idx + 2) % RESPONSIBLE_PERSONS.length],
        conclusion: APPRAISAL_LEVEL_MAP[risk] || RISK_LABEL_MAP[risk],
        level: APPRAISAL_LEVEL_MAP[risk] || RISK_LABEL_MAP[risk],
        phaseTag: '阶段性鉴定',
        reportFiles: '',
        remark: '东侧承重墙需加固',
        reporter: RESPONSIBLE_PERSONS[idx % RESPONSIBLE_PERSONS.length],
        reportTime: appraisalDate + ' 10:00'
    }];
}

// 生成巡查检查记录（近 6 个月滚动，确保当前时间有数据）
function generatePatrolRecords(no, risk, governance, i) {
    const records = [];
    const now = new Date();
    const months = risk === 'safe' ? 2 : (governance === 'done' ? 4 : (governance === 'doing' ? 3 : 2));
    // 以当前月份为基准往前推 m 个月，保证趋势图在当前半年内有数据
    for (let m = 0; m < months; m++) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        // 在同一个月内分散日期，避免全挤在 1 号
        const day = Math.min(28, 5 + ((i + m * 7) % 24));
        const patrolDate = year + '-' + pad2(month) + '-' + pad2(day);
        // 判定结果：safe 多为无隐患销号；done 多为 AB 级；其它按风险等级给复核/隐患
        let decision = '需专业人员复核';
        if (risk === 'safe' || (governance === 'done' && m >= 2)) {
            decision = m % 3 === 0 ? '经判定无隐患销号' : '鉴定为AB级';
        } else if (governance === 'done' && m === 1) {
            decision = '鉴定为AB级';
        }
        records.push({
            id: 'PAT-' + no + '-' + pad2(m + 1),
            patrolDate: patrolDate,
            patrolType: m % 2 === 0 ? '日常巡查' : '专项检查',
            patrolOrg: MODULE_STREETS[(i - 1) % MODULE_STREETS.length] + '城建中心',
            patrolPerson: RESPONSIBLE_PERSONS[(i + m) % RESPONSIBLE_PERSONS.length],
            content: '检查房屋隐患部位安全状况、管控措施落实情况',
            result: risk === 'safe' ? '正常' : '发现隐患',
            foundProblems: risk === 'safe' ? '' : HAZARD_PARTS[i % HAZARD_PARTS.length] + '存在' + HAZARD_TYPES[(i + 3) % HAZARD_TYPES.length],
            decision: decision,
            photos: '',
            files: '',
            remark: decision === '需专业人员复核' ? '建议安排专家现场复核' : '管控措施到位，持续关注',
            // 关联巡查任务字段
            sourceType: '巡查人员上报',
            taskId: '',
            taskNo: '',
            taskName: ''
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

// 任务类型值域统一映射（与 patrol-task-management.html 一致）
const TASK_TYPE_LABEL_MAP = {
    'routine': '日常巡查',
    'special': '专项巡查',
    'temporary': '临时巡查',
    'review': '复查任务'
};

// 将巡查任务同步到房屋档案记录（双向关联入口）
function syncTaskToHouseRecords(task) {
    if (!task || !Array.isArray(task.houseNos) || task.houseNos.length === 0) return;
    const all = getHouseArchStorage();
    task.houseNos.forEach(no => {
        const rec = all[no];
        if (!rec) return;
        normalizeHouseRecord(rec);
        const now = new Date();
        const dateStr = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
        const timeStr = dateStr + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes());

        // 排查记录：任务为专项/复查时生成排查记录
        if (task.type === 'special' || task.type === 'review') {
            const existingIns = (rec.inspectionRecords || []).find(r => r.taskId === String(task.id));
            if (!existingIns) {
                const insId = 'INS-' + no + '-' + String(rec.inspectionRecords.length + 1).padStart(3, '0');
                rec.inspectionRecords.push({
                    id: insId,
                    checkDate: dateStr,
                    checker: task.person || '',
                    checkerPhone: '',
                    structureStatus: rec.riskLevel || '第二类',
                    damagePart: '',
                    overload: '否',
                    otherRisk: '暂无',
                    preliminaryJudge: '',
                    location: '',
                    dutyPerson: '',
                    dutyPhone: '',
                    photos: '',
                    preAppraisal: '否',
                    noAppraisalReason: '',
                    proofFiles: '',
                    remark: '由巡查任务同步生成：' + (task.name || ''),
                    reporter: task.person || '',
                    reportTime: timeStr,
                    sourceType: task.type === 'review' ? '复查任务' : '专项巡查',
                    taskId: String(task.id),
                    taskNo: task.no || '',
                    taskName: task.name || ''
                });
                if (!Array.isArray(task.recordIds)) task.recordIds = [];
                task.recordIds.push({ type: 'inspection', id: insId, houseNo: no });
            }
        }

        // 巡查检查记录：所有任务类型都生成巡查记录
        const existingPat = (rec.patrolRecords || []).find(r => r.taskId === String(task.id));
        if (!existingPat) {
            const patId = 'PAT-' + no + '-' + String(rec.patrolRecords.length + 1).padStart(3, '0');
            rec.patrolRecords.push({
                id: patId,
                patrolDate: dateStr,
                patrolType: TASK_TYPE_LABEL_MAP[task.type] || '日常巡查',
                patrolOrg: (task.town || '') + '城建中心',
                patrolPerson: task.person || '',
                content: task.desc || '检查房屋隐患部位安全状况、管控措施落实情况',
                result: '正常',
                foundProblems: '',
                decision: '经判定无隐患销号',
                photos: '',
                files: '',
                remark: '由巡查任务同步生成：' + (task.name || ''),
                sourceType: '巡查人员上报',
                taskId: String(task.id),
                taskNo: task.no || '',
                taskName: task.name || ''
            });
            if (!Array.isArray(task.recordIds)) task.recordIds = [];
            task.recordIds.push({ type: 'patrol', id: patId, houseNo: no });
        }
    });
    setHouseArchStorage(all);
}

// ============================================================
// 排查记录库 → 农房档案 同步（2026回头看 / 农房回头看 等来源共用）
// 规则：
//  - 只向 inspectionRecords 追加记录（按 sourceTag+recordId 去重），不修改房屋风险等级/整治状态
//  - 结论为隐患时，同步把 rectify 的鉴定与整治信息写入档案 riskIdentification / manageRecords
// ============================================================

// 隐患判定：结论出现这些关键词视为存在隐患
const INSPECT_DANGER_RE = /隐患|危险|C级|D级|需要整改|存在/;

// 把一条排查记录库记录同步到农房档案（inspectionRecords 追加一条）
// record: 排查记录库中的记录（含 houseNo/town/village/answers/submitTime 等）
// sourceTag: 来源标识，如 '2026回头看' 或 '农房回头看'
// 返回 { appended: bool, insId: string|null }
function syncInspectRecordToHouse(record, sourceTag) {
    if (!record || !record.houseNo) return { appended: false, insId: null };
    var srcKey = (sourceTag || '') + '|' + (record.id || record.houseNo);
    var now = new Date();
    var dateStr = (record.submitTime || '').slice(0, 10) ||
        now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
    var timeStr = record.submitTime || (dateStr + ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()));
    var ans = record.answers || {};
    var conclusion = ans.conclusion || ans.result || '';
    var isDanger = INSPECT_DANGER_RE.test(conclusion);
    var checker = ans.inspectorSignature || ans.inspector || record.inspector || record.person || '';
    var photos = [];
    if (record.photos) {
        Object.keys(record.photos).forEach(function (k) {
            var v = record.photos[k];
            if (Array.isArray(v)) photos = photos.concat(v);
        });
    }
    var result = { appended: false, insId: null };
    patchHouseRecord(record.houseNo, function (rec) {
        if (!Array.isArray(rec.inspectionRecords)) rec.inspectionRecords = [];
        // 去重：同一来源同一记录只追加一次
        var dup = rec.inspectionRecords.some(function (r) { return r.srcKey === srcKey; });
        if (dup) { result.appended = false; return; }
        var insId = 'INS-' + record.houseNo + '-' + String(rec.inspectionRecords.length + 1).padStart(3, '0');
        rec.inspectionRecords.push({
            id: insId,
            checkDate: dateStr,
            checker: checker,
            checkerPhone: ans.inspectorPhone || '',
            structureStatus: ans.structureType || rec.riskLevel || '第二类',
            damagePart: ans.damagePart || '',
            overload: ans.overload || '否',
            otherRisk: isDanger ? conclusion : '暂无',
            preliminaryJudge: conclusion,
            location: ans.address || record.address || '',
            dutyPerson: ans.dutyPerson || '',
            dutyPhone: ans.dutyPhone || '',
            photos: photos.join(','),
            preAppraisal: (record.rectify && record.rectify.appraisal && record.rectify.appraisal.done) || '否',
            noAppraisalReason: '',
            proofFiles: '',
            remark: '由' + (sourceTag || '排查') + '同步生成',
            reporter: checker,
            reportTime: timeStr,
            sourceType: sourceTag || '排查',
            town: record.town || rec.street || '',
            village: record.village || rec.community || '',
            srcKey: srcKey,
            srcRecordId: record.id || '',
            taskId: record.id || '',
            taskNo: record.id || '',
            taskName: (sourceTag || '排查') + '·' + (record.town || '') + (record.village || '')
        });
        result.appended = true;
        result.insId = insId;
    });
    return result;
}

// 把一条记录的整治信息（rectify）同步到农房档案
// 写入 riskIdentification（鉴定结论）与 manageRecords（整治措施），均按 srcKey 去重
function syncRectifyRecordToHouse(record, sourceTag) {
    if (!record || !record.houseNo || !record.rectify) return { appraisal: false, measure: false };
    var srcKey = (sourceTag || '') + '|' + (record.id || record.houseNo);
    var appr = record.rectify.appraisal || {};
    var meas = record.rectify.measures || {};
    var now = new Date();
    var dateStr = (record.rectify.updateTime || '').slice(0, 10) ||
        now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
    var res = { appraisal: false, measure: false };
    patchHouseRecord(record.houseNo, function (rec) {
        // 鉴定报告
        if (appr.done === '是' || appr.conclusion) {
            if (!Array.isArray(rec.riskIdentification)) rec.riskIdentification = [];
            var dupA = rec.riskIdentification.some(function (r) { return r.srcKey === srcKey; });
            if (!dupA) {
                rec.riskIdentification.push({
                    id: 'APPR-' + record.houseNo + '-' + String(rec.riskIdentification.length + 1).padStart(3, '0'),
                    identifyDate: appr.date || dateStr,
                    orgName: appr.orgName || '',
                    orgCode: appr.orgCode || '',
                    conclusion: appr.conclusion || '',
                    srcKey: srcKey,
                    sourceType: sourceTag || '整治',
                    remark: '由' + (sourceTag || '整治') + '同步生成'
                });
                res.appraisal = true;
            }
        }
        // 整治措施
        var hasMeasure = (meas.controlDone === '是') || (meas.engineeringDone === '是') ||
            (Array.isArray(meas.controlTypes) && meas.controlTypes.length) ||
            (Array.isArray(meas.engineeringTypes) && meas.engineeringTypes.length);
        if (hasMeasure) {
            if (!Array.isArray(rec.manageRecords)) rec.manageRecords = [];
            var dupM = rec.manageRecords.some(function (r) { return r.srcKey === srcKey; });
            if (!dupM) {
                var types = [];
                if (Array.isArray(meas.controlTypes)) types = types.concat(meas.controlTypes);
                if (Array.isArray(meas.engineeringTypes)) types = types.concat(meas.engineeringTypes);
                rec.manageRecords.push({
                    id: 'M-' + record.houseNo + '-' + String(rec.manageRecords.length + 1).padStart(3, '0'),
                    measureType: types.join('、') || '整治',
                    implementPart: '整栋房屋',
                    startTime: meas.ownerDate || dateStr,
                    planEndTime: '',
                    actualEndTime: meas.districtDate || meas.townDate || dateStr,
                    controlTypes: meas.controlTypes || [],
                    engineeringTypes: meas.engineeringTypes || [],
                    ownerSign: meas.ownerSign || '',
                    townSign: meas.townSign || '',
                    districtSign: meas.districtSign || '',
                    srcKey: srcKey,
                    sourceType: sourceTag || '整治',
                    remark: '由' + (sourceTag || '整治') + '同步生成'
                });
                res.measure = true;
            }
        }
    });
    return res;
}

// ============ 静态数据修改留痕（2026-10-19 三层档案改造） ============

// 留痕的静态区块及其字段标签映射
var CHANGE_LOG_SECTIONS = {
    overview: {
        label: '房屋概况',
        fields: {
            floors: '房屋层数', area: '建筑面积', buildYear: '建造年份',
            usage: '使用用途', structure: '结构类型', address: '房屋地址',
            owner: '产权人', belongTo: '所属街镇村居'
        }
    },
    homestead: {
        label: '宅基地信息',
        fields: {
            area: '宅基地面积', certNo: '宅基地证号', approveDate: '批准日期',
            usage: '宅基地用途', ownership: '权属情况'
        }
    },
    structure: {
        label: '结构信息',
        fields: {
            type: '结构类型', floors: '结构层数', height: '房屋高度',
            span: '跨度', foundation: '基础形式'
        }
    },
    usage: {
        label: '使用情况',
        fields: {
            usageType: '使用类型', specificUsage: '具体用途', occupants: '居住人数',
            isRented: '是否出租', rentArea: '出租面积'
        }
    }
};

// 生成留痕记录 ID
function generateChangeLogId(rec) {
    var seq = (rec.changeLog || []).length + 1;
    return 'CHG-' + (rec.no || 'UNK') + '-' + String(seq).padStart(3, '0');
}

// 添加一条留痕记录
function addChangeLog(rec, fieldPath, fieldLabel, oldValue, newValue, source, sourceId, operator) {
    if (!rec) return;
    if (!Array.isArray(rec.changeLog)) rec.changeLog = [];
    rec.changeLog.push({
        id: generateChangeLogId(rec),
        fieldPath: fieldPath,
        fieldLabel: fieldLabel || fieldPath,
        oldValue: oldValue !== undefined ? String(oldValue) : '',
        newValue: newValue !== undefined ? String(newValue) : '',
        changedAt: new Date().toLocaleString('sv-SE').slice(0, 16),
        changedBy: operator || '',
        source: source || 'manual',
        sourceId: sourceId || ''
    });
}

// 对比静态区块差异，自动生成留痕记录
// oldRec / newRec：完整房屋记录；返回追加的留痕条数
function diffStaticFields(oldRec, newRec, source, sourceId, operator) {
    if (!oldRec || !newRec) return 0;
    var count = 0;
    Object.keys(CHANGE_LOG_SECTIONS).forEach(function(sectionKey) {
        var sectionConf = CHANGE_LOG_SECTIONS[sectionKey];
        var oldSec = oldRec[sectionKey] || {};
        var newSec = newRec[sectionKey] || {};
        // 收集所有出现过的字段
        var allFields = {};
        Object.keys(oldSec).forEach(function(k){ allFields[k] = true; });
        Object.keys(newSec).forEach(function(k){ allFields[k] = true; });
        Object.keys(allFields).forEach(function(fieldKey) {
            var oldVal = oldSec[fieldKey];
            var newVal = newSec[fieldKey];
            // 跳过数组/对象（如 photos），只做标量对比
            if (typeof oldVal === 'object' || typeof newVal === 'object') return;
            var oldStr = (oldVal !== undefined && oldVal !== null) ? String(oldVal) : '';
            var newStr = (newVal !== undefined && newVal !== null) ? String(newVal) : '';
            if (oldStr !== newStr) {
                var fieldLabel = (sectionConf.fields && sectionConf.fields[fieldKey]) || fieldKey;
                addChangeLog(newRec, sectionKey + '.' + fieldKey, sectionConf.label + '-' + fieldLabel,
                    oldStr, newStr, source, sourceId, operator);
                count++;
            }
        });
    });
    return count;
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
        '徐家宅基','悦城小区','朱家宅基','湖城小区','胡家宅基','桂城小区','何家宅基','阳城小区','罗家宅基','绿城小区',
        '马家宅基','南庭小区','高家宅基','北城小区','孙家宅基','东苑小区','吴家宅基','西亭小区','郑家宅基','中城小区'
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
        '顾骏','侯瑞烁','邵顺','孟祥华','龙洋顺','肖泽宇','钱文昊','严志强','温婷婷','安志远'
    ];
    const structTypes = ['砖混', '砖木', '框架'];

    // 真实的农村自建房风险分布：安全/轻微瑕疵占多数，危房占少数
    const RISK_DISTRIBUTION = [
        { risk: 'danger',  governanceWeights: { done: 0.35, doing: 0.30, overdue: 0.20, pending: 0.15 }, ratio: 0.10 }, // 第三类（原疑似危房）
        { risk: 'major',   governanceWeights: { done: 0.30, doing: 0.40, overdue: 0.15, pending: 0.15 }, ratio: 0.15 }, // 第三类（原严重损坏房）
        { risk: 'warning', governanceWeights: { done: 0.45, doing: 0.25, overdue: 0.10, pending: 0.20 }, ratio: 0.25 }, // 第二类（高整治权重）
        { risk: 'warning', governanceWeights: { done: 0.70, doing: 0.15, overdue: 0.05, pending: 0.10 }, ratio: 0.15 }, // 第二类（低整治权重）
        { risk: 'safe',    governanceWeights: { done: 1.0 },                                 ratio: 0.35 }  // 第一类
    ];

    const weightedPick = (weights) => {
        const keys = Object.keys(weights);
        const vals = keys.map(k => weights[k]);
        const sum = vals.reduce((a, b) => a + b, 0);
        let r = Math.random() * sum;
        for (let i = 0; i < keys.length; i++) {
            r -= vals[i];
            if (r <= 0) return keys[i];
        }
        return keys[keys.length - 1];
    };

    const seedCount = 120;
    for (let i = 1; i <= seedCount; i++) {
        const no = generateNo(i);
        const nameIdx = (i - 1) % names.length;
        const name = names[nameIdx] + (i > 30 ? '·' + i + '号' : i + '号');
        const street = streets[(i - 1) % streets.length];
        const mappedVillages = FENGXIAN_TOWN_VILLAGES[street];
        const townVillages = (mappedVillages && mappedVillages.length) ? mappedVillages : ['海湾社区'];
        const community = townVillages[(i - 1) % townVillages.length];
        const address = '上海市奉贤区' + street + community + (i * 3) + '号';
        // 农房仓只生成农村自建房；城镇自建房由 urban-house-arch-data.js 独立仓生成（CF- 编号、四级口径）
        const category = '农村自建房';
        const struct = structTypes[i % 3];
        const year = 1970 + (i % 45);
        const owner = owners[i - 1] || '未知';

        // 按真实分布抽取风险与治理状态
        const bucket = weightedPick(Object.fromEntries(RISK_DISTRIBUTION.map((r, idx) => [idx, r.ratio])));
        const riskConfig = RISK_DISTRIBUTION[bucket];
        let risk = riskConfig.risk;
        let governance = weightedPick(riskConfig.governanceWeights);

        // 安全房统一治理完成
        if (risk === 'safe') governance = 'done';

        const totalTask = risk === 'safe' ? 0 : (1 + (i % 4) + (risk === 'danger' ? 2 : 0));
        const doneTask = governance === 'done' ? totalTask : (governance === 'doing' ? Math.max(1, Math.floor(totalTask * (0.3 + (i % 5) * 0.15))) : 0);
        const manageMeasure = totalTask > 0 ? (1 + (i % 2) + (risk === 'danger' ? 1 : 0)) : 0;
        const projectMeasure = totalTask > 0 ? (1 + (i % 3) + (risk === 'danger' ? 1 : 0)) : 0;
        const fundTotal = totalTask > 0 ? (25000 + (i * 1800) + (risk === 'danger' ? 30000 : risk === 'major' ? 15000 : 0)) : 0;
        const fundUsed = Math.round(fundTotal * (doneTask / (totalTask || 1)) * (0.8 + (i % 4) * 0.05));
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
            // 已治理分布：部分尚未申请销号（可演示"申请销号"），部分审核中，部分已通过
            closeStatus = i % 4 === 0 ? '未申请' : (i % 4 === 1 ? '待审核' : (i % 4 === 2 ? '审核中' : '已通过'));
            if (closeStatus !== '未申请') {
                applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
            }
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

        const eliminationInfo = {
            applyTime: applyTime || null,
            reviewTime: auditTime || null,
            reviewer: auditor || null,
            certFiles: closeStatus === '已通过' ? ['销号申请表.pdf', '整治完成照片.zip'] : (applyTime ? ['销号申请表.pdf'] : []),
            note: closeStatus === '已通过' ? '已销号' : (closeStatus === '已驳回' ? rejectReason : '尚未提交销号申请')
        };

        // 治理完成（done）的房屋统一展示为"已整治"；其余按状态映射
        const governStatus = governance === 'done' ? '已整治' : STATUS_LABEL_MAP[governance];
        const riskLevel = RISK_LABEL_MAP[risk];

        // 已销号且治理完成：展示用安全，但保留原始风险用于统计/追溯
        const isClosed = governance === 'done' && closeStatus === '已通过';
        const originalRisk = risk;
        const originalRiskLevel = riskLevel;
        const displayRisk = isClosed ? 'safe' : risk;
        const displayRiskLevel = isClosed ? '第一类' : riskLevel;

        const managerName = owner;
        const managerPhone = MANAGER_PHONES[i % MANAGER_PHONES.length];
        const responsiblePerson = RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length];
        const responsibleDept = street + '城建中心';

        const manageRecords = generateManageRecords(no, originalRisk, governance, doneTask, totalTask, i);
        const projectRecords = generateProjectRecordsLocal(no, originalRisk, governance, projectMeasure, i, fundTotal);
        const qualityTrace = generateQualityTrace(no, originalRisk, governance, projectMeasure, i);
        const archiveRecords = generateArchiveRecords(no, originalRisk, governance, closeStatus, i);

        // 全要素档案字段
        const village = community;
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
            completionDate: year + '-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)),
            designDrawings: [],
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
            expansionStatus: expansionStatus, decorationStatus: decorationStatus,
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

        const inspectionRecords = generateInspectionRecords(no, originalRisk, i);
        const appraisalReports = generateAppraisalReports(no, originalRisk, governance, i);
        const patrolRecords = generatePatrolRecords(no, originalRisk, governance, i);
        const riskIdentification = generateRiskIdentification(no, originalRisk, i);
        const riskClassification = {
            level: originalRiskLevel,
            basis: '依据《农村住房危险性鉴定标准》综合评定为' + originalRiskLevel,
            assessTime: inspectionRecords.length ? inspectionRecords[0].checkDate : '',
            assessor: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length]
        };
        const emergencyResponse = generateEmergencyResponse(no, originalRisk, governance, i);
        const photos = generateHousePhotos(no, i);
        const riskPart = HAZARD_PARTS[i % HAZARD_PARTS.length];
        const riskType = HAZARD_TYPES[(i + 3) % HAZARD_TYPES.length];
        const riskInfo = {
            riskNo: 'RSK-' + no,
            riskName: name + ' ' + originalRiskLevel + '风险',
            riskType: riskType,
            riskLevel: originalRiskLevel,
            discoveryTime: inspectionRecords.length ? inspectionRecords[0].checkDate : '',
            discoveryMethod: DISCOVERY_METHODS[i % DISCOVERY_METHODS.length],
            discoverer: inspectionRecords.length ? inspectionRecords[0].checker : '',
            riskStatus: governStatus,
            riskPart: riskPart,
            spatialLocation: '上海市奉贤区' + street + community + (i * 3) + '号',
            riskDesc: riskPart + '存在' + riskType + '，影响结构安全',
            relatedHouse: no,
            relatedOwner: owner,
            relatedUser: usageType === '自住' ? owner : (usageType === '出租' ? '租户' : ''),
            relatedInspectionId: inspectionRecords.length ? inspectionRecords[0].id : '',
            relatedAppraisalId: appraisalReports.length ? appraisalReports[0].id : '',
            relatedPatrolId: patrolRecords.length ? patrolRecords[0].id : '',
            relatedTaskId: manageRecords.length ? manageRecords[0].id : ''
        };

        const record = {
            no, name, owner, street, community, address, village,
            category: struct,
            houseType: category,
            houseNature: (usageType === '自住兼经营' || usageType === '其他') ? '非住宅' : '住宅',
            riskLevel: displayRiskLevel,
            risk: displayRisk,
            originalRisk,
            originalRiskLevel,
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
            photos, riskInfo, inspectionRecords, appraisalReports, patrolRecords,
            riskIdentification, riskClassification, emergencyResponse
        };
        data[no] = record;
    }
    return data;
}

// 初始化种子Storage 为空则写入 85 条数据；否则规范化已有数据
// 服务端同步 Promise 缓存：每个页面会话只发起一次，
// 避免「渲染 → initHouseArchSeed → fetch → house-arch-synced → 渲染」无限循环导致列表乱跳
let __serverSyncPromise = null;
function initHouseArchSeed() {
    // 异步从服务端拉取最新档案合并（服务端数据优先）
    // 合并后触发一次 hashchange/自定义事件，让使用方刷新
    if (typeof syncHouseArchFromServer === 'function' && !__serverSyncPromise) {
        __serverSyncPromise = syncHouseArchFromServer().then(function(merged) {
            if (merged) {
                try { document.dispatchEvent(new CustomEvent('house-arch-synced')); } catch (e) {}
            }
            return merged;
        });
    }

    // 初始化阶段（种子生成/规范化回写/closeApply 同步）一律不回写服务端：
    // 服务端拉取尚在途，抢先 POST 会用本地旧快照整体覆盖服务端较新数据；
    // 之后用户操作触发的 setHouseRecord/flushHouseArchToServer 仍正常推送。
    __syncToServerEnabled = false;
    try {
        const all = getHouseArchStorage();
        if (Object.keys(all).length === 0) {
            const seed = generateHouseSeed();
            setHouseArchStorage(seed);
            __seedGenerated = true;
            // 同步生成 closeApplyData，确保 hidden-close-apply 页面可展示
            syncCloseApplyData(seed);
            // 注入演示记录（见下）
            __injectDemoRecords(seed);
            return seed;
        }
        // 规范化已存在的数据，确保各页面读取一致
        Object.keys(all).forEach(no => normalizeHouseRecord(all[no]));
        // 一次性清洗：农房仓只保留农村自建房
        // - 剔除城镇自建房种子记录（已迁移至城镇仓 urbanHouseArchData，CF- 编号）
        // - 剔除 CF- 城镇编号误入记录、houseType 截断损坏记录、非标准编号前缀的历史脏数据
        const beforeCount = Object.keys(all).length;
        Object.keys(all).forEach(no => {
            const r = all[no] || {};
            const t = r.houseType || '';
            const validPrefix = /^NF-/.test(no) || /^FX-NC-ZF-/.test(no);
            if (t === '城镇自建房' || /^CF-/.test(no) || !validPrefix || (t && t !== '农村自建房')) {
                delete all[no];
            }
        });
        if (Object.keys(all).length !== beforeCount) {
            try { console.info('[house-arch] 清洗农房仓脏数据：' + beforeCount + ' → ' + Object.keys(all).length); } catch (e) {}
        }
        setHouseArchStorage(all);
        // 若 closeApplyData 为空则根据现有房屋数据同步生成
        if (getCloseApplyStorage().length === 0) {
            syncCloseApplyData(all);
        }
        // 演示记录兜底：本地缺失时从服务端 json 拉取注入（保证演示效果可重建）
        __injectDemoRecords(all);
        return all;
    } finally {
        __syncToServerEnabled = true;
    }
}

// ============================================================
// 演示记录（种子级）：清空 localStorage 后仍可从服务端 json 重建
// 数据本体在 data/house-arch.json，此处只登记编号；缺失时自动拉取注入。
// ============================================================
const DEMO_HOUSE_NOS = ['NF-2025-00018'];
let __demoInjecting = false;
function __injectDemoRecords(currentAll) {
    if (typeof fetch !== 'function') return;
    if (__demoInjecting) return;
    const missing = DEMO_HOUSE_NOS.filter(no => !(currentAll && currentAll[no]));
    if (missing.length === 0) return;
    __demoInjecting = true;
    fetch('/api/house-arch').then(function (r) { return r.ok ? r.json() : null; }).then(function (serverData) {
        if (!serverData || typeof serverData !== 'object') return;
        const all = getHouseArchStorage();
        let changed = false;
        missing.forEach(no => {
            if (!all[no] && serverData[no]) {
                all[no] = serverData[no];
                if (typeof normalizeHouseRecord === 'function') normalizeHouseRecord(all[no]);
                changed = true;
            }
        });
        if (changed) {
            __syncToServerEnabled = false; // 注入来自服务端，无需回写
            try { setHouseArchStorage(all); } finally { __syncToServerEnabled = true; }
            try { document.dispatchEvent(new CustomEvent('house-arch-synced')); } catch (e) {}
        }
    }).catch(function () { /* 离线静默 */ }).finally(function () { __demoInjecting = false; });
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

// ============================================================
// 2026回头看 · 片区打卡（Zone Checkin）
// 房屋种子坐标以 (30.92, 121.47) 为中心 ±0.09 随机分布，
// 这里按象限划分 4 个片区，覆盖全部分布范围。
// ============================================================
const REVIEW_ZONES = [
    { id: 'Z-NE', name: '东北片区', centerLat: 30.965, centerLng: 121.515, radius: 8000 },
    { id: 'Z-NW', name: '西北片区', centerLat: 30.965, centerLng: 121.425, radius: 8000 },
    { id: 'Z-SE', name: '东南片区', centerLat: 30.875, centerLng: 121.515, radius: 8000 },
    { id: 'Z-SW', name: '西南片区', centerLat: 30.875, centerLng: 121.425, radius: 8000 }
];
const REVIEW_ZONE_SPLIT = { lat: 30.92, lng: 121.47 };
const REVIEW_ZONE_CHECKIN_KEY = 'review-2026-zone-checkins'; // { zoneId: {zoneId,zoneName,lat,lng,time,source,operator} }

// 按坐标判断所属片区
function getZoneByCoord(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    const ns = lat >= REVIEW_ZONE_SPLIT.lat ? 'N' : 'S';
    const ew = lng >= REVIEW_ZONE_SPLIT.lng ? 'E' : 'W';
    const id = 'Z-' + ns + ew;
    return REVIEW_ZONES.find(z => z.id === id) || null;
}

function getZoneById(zoneId) {
    return REVIEW_ZONES.find(z => z.id === zoneId) || null;
}

// 读取全部片区打卡记录 { zoneId: record }
function getZoneCheckins() {
    try { return JSON.parse(localStorage.getItem(REVIEW_ZONE_CHECKIN_KEY) || '{}'); } catch (e) { return {}; }
}

// 写入/覆盖某片区打卡记录
function saveZoneCheckin(record) {
    const all = getZoneCheckins();
    all[record.zoneId] = record;
    __safeSetLocal(REVIEW_ZONE_CHECKIN_KEY, all);
    // 同步写入历史
    const hist = getZoneCheckinHistory();
    hist.unshift(Object.assign({ seq: Date.now() }, record));
    __safeSetLocal(REVIEW_ZONE_HISTORY_KEY, hist.slice(0, 100));
}

function removeZoneCheckin(zoneId) {
    const all = getZoneCheckins();
    delete all[zoneId];
    __safeSetLocal(REVIEW_ZONE_CHECKIN_KEY, all);
}

const REVIEW_ZONE_HISTORY_KEY = 'review-2026-zone-checkin-history';
function getZoneCheckinHistory() {
    try { return JSON.parse(localStorage.getItem(REVIEW_ZONE_HISTORY_KEY) || '[]'); } catch (e) { return []; }
}

// 在需要的地方调用，例如：initHouseArchSeed();

// ============================================================
// 6.1.2.23.1 房屋安全风险治理（农房）：管理措施记录 + 工程措施记录
// 存储复用 rec.manageRecords / rec.projectRecords，ensureGovernData 幂等补齐新字段
// ============================================================
const GOV_MANAGE_TYPES = ['停止使用', '停止经营', '封控警示', '人员撤离', '持续监控'];
// 按措施类型的动态扩展字段（标书：如「人员撤离」需填写撤离人数、安置方式、撤离确认人）
const GOV_MANAGE_EXTRA_FIELDS = {
    '人员撤离': [
        { key: 'evacueeCount', label: '撤离人数', placeholder: '如：5人' },
        { key: 'settleMode', label: '安置方式', placeholder: '如：投靠亲友 / 村临时安置点' },
        { key: 'evacConfirm', label: '撤离确认人', placeholder: '如：村干部张三' }
    ],
    '封控警示': [
        { key: 'closureRange', label: '封控范围', placeholder: '如：房屋周边5米拉设警戒线' }
    ],
    '持续监控': [
        { key: 'monitorFreq', label: '巡查/监测频次', placeholder: '如：每日1次' },
        { key: 'monitorDevice', label: '监测设备', placeholder: '如：倾角计、裂缝计（可选）' }
    ]
};
const GOV_ENG_TYPES = ['拆除重建', '维修加固', '局部改造', '防护设施增设'];
const GOV_ENG_NODES = ['基础验收', '材料进场验收', '主体验收'];
// 旧工程措施词库 → 标书四类映射（存量数据归并展示）
const GOV_ENG_TYPE_MAP = {
    '拆除重建': '拆除重建',
    '结构加固': '维修加固', '基础加固': '维修加固', '墙体修复': '维修加固', '屋面修缮': '维修加固', '维修加固': '维修加固',
    '局部改造': '局部改造', '排水改造': '局部改造', '电气改造': '局部改造', '消防改造': '局部改造',
    '防护设施增设': '防护设施增设'
};

// 施工单位机构库：资质等级 / 信用评分 / 历史业绩，选择施工单位时展示辅助决策
const CONTRACTOR_LIB_KEY = 'houseContractorLib';
const CONTRACTOR_LIBRARY_SEED = [
    { id: 'CT-001', name: '奉贤城建建筑工程有限公司', qualification: '建筑工程施工总承包二级', credit: 92, history: '近三年完成农房加固修缮工程 86 项，验收合格率 100%', phone: '021-57410001' },
    { id: 'CT-002', name: '上海南桥建设发展有限公司', qualification: '建筑工程施工总承包二级', credit: 88, history: '近三年完成农村危房改造工程 62 项，无质量投诉', phone: '021-57410002' },
    { id: 'CT-003', name: '华建乡村建设工程队', qualification: '建筑装修装饰工程专业承包三级', credit: 85, history: '承接农房局部改造、屋面修缮 120 余项', phone: '021-57410003' },
    { id: 'CT-004', name: '东方古建修缮工程公司', qualification: '特种工程（结构补强）专业承包', credit: 90, history: '完成砖木结构农房加固 45 项，含历史保护建筑 6 栋', phone: '021-57410004' },
    { id: 'CT-005', name: '金汇镇建筑工匠合作社', qualification: '村镇建筑工匠备案（A级）', credit: 82, history: '本镇农房维修加固 200 余户，熟悉本地工艺', phone: '021-57410005' },
    { id: 'CT-006', name: '临港新片区建设工程公司', qualification: '建筑工程施工总承包一级', credit: 95, history: '承担拆除重建类项目 38 项，含集中安置点建设 3 处', phone: '021-57410006' }
];
function getContractorLibrary() {
    try {
        const list = JSON.parse(localStorage.getItem(CONTRACTOR_LIB_KEY) || 'null');
        if (Array.isArray(list) && list.length) return list;
    } catch (e) {}
    const seed = JSON.parse(JSON.stringify(CONTRACTOR_LIBRARY_SEED));
    try { localStorage.setItem(CONTRACTOR_LIB_KEY, JSON.stringify(seed)); } catch (e) {}
    return seed;
}
function saveContractorLibrary(list) {
    try { localStorage.setItem(CONTRACTOR_LIB_KEY, JSON.stringify(list || [])); } catch (e) {}
}

function __govNow() {
    const now = new Date();
    const pad = n => (n < 10 ? '0' : '') + n;
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
}
function __govToday() { return __govNow().slice(0, 10); }

// 幂等补齐治理字段（只增不改，档案页既有读口不受影响）
function ensureGovernData(rec) {
    if (!rec) return;
    rec.manageRecords = Array.isArray(rec.manageRecords) ? rec.manageRecords : [];
    rec.projectRecords = Array.isArray(rec.projectRecords) ? rec.projectRecords : [];
    rec.manageRecords.forEach((m, i) => {
        if (!m.id) m.id = 'GM-' + (rec.no || 'X') + '-' + String(i + 1).padStart(3, '0');
        if (!m.status) m.status = (m.isDone || m.actualEndTime) ? '已结束' : '实施中';
        if (!m.extras || typeof m.extras !== 'object') m.extras = {};
        if (!Array.isArray(m.changes)) m.changes = [];
    });
    rec.projectRecords.forEach((p, i) => {
        if (!p.id) p.id = 'GE-' + (rec.no || 'X') + '-' + String(i + 1).padStart(3, '0');
        if (!p.engType) p.engType = GOV_ENG_TYPE_MAP[p.projectName] || '维修加固';
        if (p.companyId === undefined) {
            const hit = CONTRACTOR_LIBRARY_SEED.find(c => c.name === p.company);
            p.companyId = hit ? hit.id : '';
        }
        if (p.leader === undefined) p.leader = p.manager || '';
        if (p.budget === undefined) p.budget = p.fund || 0;
        if (!p.fundSource) p.fundSource = '危房改造补助 + 农户自筹';
        if (!p.planFiles || typeof p.planFiles !== 'object' || Array.isArray(p.planFiles)) {
            p.planFiles = { design: [], org: [], safety: [] };
        }
        if (!Array.isArray(p.nodes) || !p.nodes.length) {
            const done = !!p.isDone;
            p.nodes = GOV_ENG_NODES.map(name => ({
                name: name,
                status: done ? '已验收' : '待验收',
                time: done ? (p.endDate || '') : '',
                conclusion: done ? '合格' : '',
                recorder: done ? (p.acceptChecker || '') : '',
                photos: []
            }));
        }
        if (p.acceptReport === undefined) {
            p.acceptReport = p.isDone ? {
                conclusion: p.acceptConclusion || '合格',
                staff: p.acceptChecker || '',
                unit: p.acceptUnit || '',
                date: p.acceptDate || p.endDate || '',
                photos: []
            } : null;
        }
    });
    if (rec.governTask === undefined) rec.governTask = null;
}

// ---- 管理措施 ----
function addGovernManage(rec, payload) {
    ensureGovernData(rec);
    const seq = rec.manageRecords.length + 1;
    const item = {
        id: 'GM-' + (rec.no || 'X') + '-' + String(seq).padStart(3, '0') + '-' + Date.now() % 1000,
        measureType: payload.measureType || '',
        implementPart: payload.implementPart || '',
        startTime: payload.startTime || __govToday(),
        planEndTime: payload.planEndTime || '',
        actualEndTime: '',
        requirement: payload.requirement || '',
        dutyUnit: payload.dutyUnit || '',
        dutyPerson: payload.dutyPerson || '',
        phone: payload.phone || '',
        measureDesc: payload.measureDesc || payload.measureType || '',
        implementPhotos: Array.isArray(payload.implementPhotos) ? payload.implementPhotos : [],
        completePhotos: [],
        isDone: false,
        status: '实施中',
        extras: payload.extras || {},
        changes: [],
        effectEvaluation: '',
        riskControlled: false,
        reporter: payload.reporter || '当前用户',
        reportTime: __govNow()
    };
    rec.manageRecords.unshift(item);
    if (rec.governance === 'pending') { rec.governance = 'doing'; rec.governStatus = '整治中'; }
    return item;
}
function finishGovernManage(rec, id, payload) {
    ensureGovernData(rec);
    const m = rec.manageRecords.find(x => x.id === id);
    if (!m) return { ok: false, msg: '未找到措施记录' };
    m.completePhotos = (payload && payload.completePhotos) || [];
    m.effectEvaluation = (payload && payload.effectEvaluation) || '';
    m.riskControlled = !!(payload && payload.riskControlled);
    m.actualEndTime = (payload && payload.actualEndTime) || __govToday();
    m.isDone = true;
    m.status = '已结束';
    syncGovernHouseStatus(rec);
    return { ok: true };
}
// 变更/延长申请：提交进入待审批；审批通过才更新计划结束时间，履历可追溯
function addGovernChange(rec, id, payload) {
    ensureGovernData(rec);
    const m = rec.manageRecords.find(x => x.id === id);
    if (!m) return { ok: false, msg: '未找到措施记录' };
    m.changes.push({
        id: 'CHG-' + id + '-' + (m.changes.length + 1),
        time: __govNow(),
        applicant: (payload && payload.applicant) || '当前用户',
        reason: (payload && payload.reason) || '',
        oldEnd: m.planEndTime || '',
        newEnd: (payload && payload.newEnd) || '',
        status: '待审批',
        auditor: '',
        auditTime: '',
        auditOpinion: ''
    });
    return { ok: true };
}
function auditGovernChange(rec, id, changeId, pass, auditor, opinion) {
    ensureGovernData(rec);
    const m = rec.manageRecords.find(x => x.id === id);
    if (!m) return { ok: false, msg: '未找到措施记录' };
    const c = m.changes.find(x => x.id === changeId);
    if (!c || c.status !== '待审批') return { ok: false, msg: '变更记录不存在或已审批' };
    c.status = pass ? '已审批' : '已驳回';
    c.auditor = auditor || '当前用户';
    c.auditTime = __govNow();
    c.auditOpinion = opinion || '';
    if (pass && c.newEnd) m.planEndTime = c.newEnd;
    return { ok: true };
}

// ---- 工程措施 ----
function addGovernEng(rec, payload) {
    ensureGovernData(rec);
    const seq = rec.projectRecords.length + 1;
    const item = {
        id: 'GE-' + (rec.no || 'X') + '-' + String(seq).padStart(3, '0') + '-' + Date.now() % 1000,
        engType: payload.engType || '维修加固',
        projectName: payload.engType || '维修加固',
        scope: payload.scope || '',
        startDate: payload.startDate || __govToday(),
        endDate: payload.endDate || '',
        companyId: payload.companyId || '',
        company: payload.company || '',
        leader: payload.leader || '',
        manager: payload.leader || '',
        phone: payload.phone || '',
        budget: payload.budget || 0,
        fund: payload.budget || 0,
        fundSource: payload.fundSource || '',
        planFiles: payload.planFiles || { design: [], org: [], safety: [] },
        nodes: GOV_ENG_NODES.map(name => ({ name: name, status: '待验收', time: '', conclusion: '', recorder: '', photos: [] })),
        acceptReport: null,
        status: '进行中',
        isDone: false,
        progress: 0,
        reporter: payload.reporter || '当前用户',
        reportTime: __govNow(),
        remark: payload.remark || ''
    };
    rec.projectRecords.unshift(item);
    if (rec.governance === 'pending') { rec.governance = 'doing'; rec.governStatus = '整治中'; }
    return item;
}
// 关键节点验收（基础验收 / 材料进场验收 / 主体验收）
function saveGovernEngNode(rec, id, nodeName, payload) {
    ensureGovernData(rec);
    const p = rec.projectRecords.find(x => x.id === id);
    if (!p) return { ok: false, msg: '未找到工程措施' };
    const node = (p.nodes || []).find(n => n.name === nodeName);
    if (!node) return { ok: false, msg: '未找到节点' };
    node.status = '已验收';
    node.time = (payload && payload.time) || __govToday();
    node.conclusion = (payload && payload.conclusion) || '合格';
    node.recorder = (payload && payload.recorder) || '当前用户';
    node.photos = (payload && payload.photos) || [];
    const doneCnt = p.nodes.filter(n => n.status === '已验收').length;
    p.progress = Math.round(doneCnt / p.nodes.length * 90);
    return { ok: true };
}
// 竣工验收报告 → 工程措施完成 → 联动更新房屋治理状态
function finishGovernEng(rec, id, report) {
    ensureGovernData(rec);
    const p = rec.projectRecords.find(x => x.id === id);
    if (!p) return { ok: false, msg: '未找到工程措施' };
    if (!report || !report.conclusion || !report.date) return { ok: false, msg: '请填写验收结论与验收日期' };
    p.acceptReport = {
        conclusion: report.conclusion,
        staff: report.staff || '',
        unit: report.unit || '',
        date: report.date,
        photos: report.photos || []
    };
    p.isDone = true;
    p.status = '已完成';
    p.progress = 100;
    p.endDate = report.date;
    syncGovernHouseStatus(rec);
    pushNotification(rec, { riskName: '工程措施竣工验收', hazardType: p.engType || '工程措施', riskLevel: p.acceptReport.conclusion }, '治理完成');
    return { ok: true };
}
// 联动：任一工程措施竣工，或全部管理措施结束且无工程措施 → 房屋标记「已治理」
function syncGovernHouseStatus(rec) {
    if (!rec) return;
    const engDone = (rec.projectRecords || []).some(p => p.isDone);
    const mgAllDone = (rec.manageRecords || []).length > 0 &&
        rec.manageRecords.every(m => m.isDone || m.status === '已结束') &&
        !(rec.projectRecords || []).length;
    if ((engDone || mgAllDone) && rec.governance !== 'done') {
        rec.governance = 'done';
        rec.governStatus = '已整治';
        if (!rec.completeDate) rec.completeDate = __govToday();
        return;
    }
    // 有正在进行的管理/工程措施且房屋仍是待整治 → 联动为整治中，保持地图状态一致
    const anyDoing = (rec.manageRecords || []).some(m => !(m.isDone || m.status === '已结束')) ||
        (rec.projectRecords || []).some(p => !p.isDone);
    if (anyDoing && rec.governance === 'pending') {
        rec.governance = 'doing';
        rec.governStatus = '整治中';
    }
}

// ---- 排查任务下发（批量 / 定向指派） ----
function dispatchGovernTask(nos, payload) {
    if (!Array.isArray(nos) || !nos.length) return 0;
    let cnt = 0;
    nos.forEach(no => {
        patchHouseRecord(no, rec => {
            ensureGovernData(rec);
            rec.governTask = {
                taskNo: 'PT-' + no,
                taskType: (payload && payload.taskType) || '批量下发',
                dispatcher: (payload && payload.dispatcher) || '当前用户',
                dispatchTime: __govNow(),
                deadline: (payload && payload.deadline) || '',
                status: '已下发'
            };
        });
        cnt++;
    });
    return cnt;
}

// ---- 单条记录治理派生信息（列表页用） ----
function govStatsOf(rec) {
    ensureGovernData(rec);
    const mTotal = rec.manageRecords.length;
    const mDone = rec.manageRecords.filter(m => m.isDone || m.status === '已结束').length;
    const pTotal = rec.projectRecords.length;
    const pDone = rec.projectRecords.filter(p => p.isDone).length;
    const today = __govToday();
    const mOverdue = rec.manageRecords.filter(m => !(m.isDone || m.status === '已结束') && m.planEndTime && m.planEndTime < today).length;
    return { mTotal: mTotal, mDone: mDone, pTotal: pTotal, pDone: pDone, mOverdue: mOverdue };
}

// ---- 治理多维统计（按区域 / 措施类型 / 完成情况） ----
function govListStats(records) {
    const s = {
        total: 0, doing: 0, done: 0, pending: 0, overdue: 0,
        byTown: {}, byManageType: {}, byEngType: {}
    };
    (records || []).forEach(rec => {
        if (rec.risk === 'safe') return;
        s.total++;
        const g = rec.governance || 'pending';
        if (g === 'done') s.done++;
        else if (g === 'doing') s.doing++;
        else if (g === 'overdue') s.overdue++;
        else s.pending++;
        const town = rec.street || '未知';
        s.byTown[town] = (s.byTown[town] || 0) + 1;
        (rec.manageRecords || []).forEach(m => {
            const t = m.measureType || '其他';
            s.byManageType[t] = (s.byManageType[t] || 0) + 1;
        });
        (rec.projectRecords || []).forEach(p => {
            const t = p.engType || GOV_ENG_TYPE_MAP[p.projectName] || '其他';
            s.byEngType[t] = (s.byEngType[t] || 0) + 1;
        });
    });
    return s;
}

/* ================= 6.1.2.23.1 演示数据种子（农房安全风险治理） ================= */
// SVG 占位照片（dataURL），供演示页面缩略图 / 灯箱查看
function govDemoPhoto(text, bg) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200">'
        + '<rect width="320" height="200" fill="' + bg + '"/>'
        + '<rect x="8" y="8" width="304" height="184" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2" stroke-dasharray="8 6"/>'
        + '<text x="160" y="92" fill="#fff" font-size="20" text-anchor="middle" font-family="sans-serif">' + text + '</text>'
        + '<text x="160" y="124" fill="rgba(255,255,255,.85)" font-size="13" text-anchor="middle" font-family="sans-serif">演示照片</text>'
        + '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function govAddDays(iso, n) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// 一次性把存量种子记录充实为可演示数据（幂等，本地标记只执行一次；force 可重灌）
function seedGovernDemoData(force) {
    const FLAG = 'houseGovernDemoV3';
    try { if (!force && localStorage.getItem(FLAG)) return 0; } catch (e) {}
    const recs = getAllHouseRecords().filter(r => r.houseType === '农村自建房' && r.risk && r.risk !== 'safe');
    const persons = ['李志强', '王建国', '陈明华', '周敏', '张建军', '刘伟', '赵敏'];
    const fundSources = ['危房改造补助 + 农户自筹', '农户自筹', '区镇两级财政补助'];
    const pickPhotos = v => Array.isArray(v) ? v.filter(u => typeof u === 'string' && u.indexOf('data:image') === 0) : [];
    recs.forEach((rec, i) => {
        patchHouseRecord(rec.no, r => {
            ensureGovernData(r);
            const base = r.no;
            // ---- 管理措施：照片 / 扩展字段 / 变更履历 ----
            r.manageRecords.forEach((m, mi) => {
                const ip = pickPhotos(m.implementPhotos);
                m.implementPhotos = ip.length ? ip : [govDemoPhoto(m.measureType + '落实照', '#c5221f'), govDemoPhoto('现场管控照', '#e37400')];
                if (!m.extras) m.extras = {};
                if (m.measureType === '人员撤离' && !m.extras.evacueeCount) {
                    m.extras.evacueeCount = (3 + ((i + mi) % 4)) + '人';
                    m.extras.settleMode = (i + mi) % 2 ? '投靠亲友' : '村临时安置点';
                    m.extras.evacConfirm = '村支书 ' + persons[(i + mi) % persons.length];
                }
                if (m.measureType === '封控警示' && !m.extras.closureRange) m.extras.closureRange = '房屋周边' + (3 + (i % 4)) + '米拉设警戒线，出入口张贴警示标识';
                if (m.measureType === '持续监控' && !m.extras.monitorFreq) {
                    m.extras.monitorFreq = ['每日1次', '每周2次', '每周3次'][i % 3];
                    m.extras.monitorDevice = ['倾角计1个', '裂缝计2个', '人工巡查'][i % 3];
                }
                if (m.status === '已结束') {
                    const cp = pickPhotos(m.completePhotos);
                    m.completePhotos = cp.length ? cp : [govDemoPhoto('管控解除确认', '#188038'), govDemoPhoto('现场复查照', '#188038')];
                    if (!m.effectEvaluation) m.effectEvaluation = '风险已有效控制，未发生次生问题';
                }
            });
            // 变更履历：i%4===0 → 已审批（自动延长结束时间）；i%5===0 → 待审批（演示批准/驳回按钮）
            if (i % 4 === 0 || i % 5 === 0) {
                const target = r.manageRecords.find(m => m.status === '实施中');
                if (target && !target.changes.length) {
                    const pending = i % 5 === 0;
                    const chg = {
                        id: 'CH-' + base + '-001',
                        oldEnd: target.planEndTime,
                        newEnd: govAddDays(target.planEndTime, 30),
                        reason: ['雨季连续降雨无法施工', '需等待农忙结束后实施', '等待危房改造指标下达'][i % 3],
                        applyTime: govAddDays(target.startTime, 10) + ' 10:20',
                        applicant: target.reporter || persons[i % persons.length],
                        status: pending ? '待审批' : '已审批',
                        auditor: pending ? '' : '王建国',
                        auditTime: pending ? '' : govAddDays(target.startTime, 12) + ' 15:40'
                    };
                    target.changes.push(chg);
                    if (!pending) target.planEndTime = chg.newEnd;
                }
            }
            // ---- 工程措施：机构库 / 方案文件 / 节点时间轴 / 竣工照片 ----
            r.projectRecords.forEach((p, pi) => {
                const ct = CONTRACTOR_LIBRARY_SEED[(i + pi) % CONTRACTOR_LIBRARY_SEED.length];
                p.companyId = ct.id;
                p.company = ct.name;
                if (!p.leader) p.leader = persons[(i + pi) % persons.length];
                if (!p.budget) p.budget = 5 + ((i * 7 + pi * 3) % 20);
                p.fundSource = fundSources[(i + pi) % fundSources.length];
                p.planFiles = {
                    design: [base + '-设计图纸.pdf', base + '-结构计算书.pdf'],
                    org: [base + '-施工组织设计.pdf'],
                    safety: pi % 2 ? [base + '-安全专项方案.pdf'] : [base + '-安全专项方案.pdf', base + '-应急预案.pdf']
                };
                const doneCnt = p.isDone ? 3 : (p.progress >= 70 ? 2 : (p.progress >= 30 ? 1 : 0));
                const nodeDays = [20, 45, 75];
                p.nodes.forEach((n, ni) => {
                    if (ni < doneCnt) {
                        n.status = '已验收';
                        n.time = (p.isDone && ni === 2) ? (p.endDate || govAddDays(p.startDate, nodeDays[ni])) : govAddDays(p.startDate, nodeDays[ni]);
                        n.conclusion = '合格';
                        n.recorder = persons[(i + pi + ni) % persons.length];
                        n.photos = [govDemoPhoto(n.name + '现场照', '#1a73e8')];
                    } else {
                        n.status = '待验收';
                        n.time = ''; n.conclusion = ''; n.recorder = ''; n.photos = [];
                    }
                });
                if (p.isDone && p.acceptReport && !pickPhotos(p.acceptReport.photos).length) {
                    p.acceptReport.photos = [govDemoPhoto('竣工后整体照', '#188038'), govDemoPhoto('验收签字页', '#188038')];
                }
            });
            // ---- 排查任务下发（含已逾期 / 临期 / 远期三类期限） ----
            if (!r.governTask && i % 3 !== 0) {
                r.governTask = {
                    taskNo: 'RW-' + base,
                    taskType: i % 2 ? '批量下发' : '定向指派',
                    dispatcher: i % 2 ? '区建交委' : (r.street || '') + '建设管理部门',
                    dispatchTime: '2026-10-' + String(5 + (i % 20)).padStart(2, '0') + ' 09:30',
                    deadline: ['2026-11-25', '2026-12-20', '2026-10-30'][Math.floor(i / 3) % 3],
                    status: '已下发'
                };
            }
            // ---- 特色案例补充：逾期封控 / 临期监控 ----
            if (i % 6 === 0 && !r.manageRecords.some(m => m.status === '实施中' && m.planEndTime < '2026-11-10')) {
                r.manageRecords.push({
                    id: 'GM-' + base + '-D1', measureType: '封控警示', implementPart: '整栋房屋',
                    startTime: '2026-08-15', planEndTime: '2026-10-15', actualEndTime: '',
                    requirement: '立即对危险区域采取封控，设置围挡和警示标识',
                    dutyUnit: (r.street || '') + '城建中心', dutyPerson: persons[i % persons.length], phone: '13812345678',
                    measureDesc: '封控警示：设置围挡、警示标识，安排专人巡查',
                    implementPhotos: [govDemoPhoto('警戒线设置', '#c5221f'), govDemoPhoto('警示标识张贴', '#e37400')],
                    completePhotos: [], isDone: false, status: '实施中',
                    extras: { closureRange: '房屋周边5米拉设警戒线' },
                    changes: [], effectEvaluation: '', riskControlled: false,
                    reporter: persons[(i + 1) % persons.length], reportTime: '2026-08-15 09:10'
                });
            } else if (i % 6 === 1 && !r.manageRecords.some(m => m.status === '实施中' && m.planEndTime >= '2026-11-10' && m.planEndTime <= '2026-11-25')) {
                r.manageRecords.push({
                    id: 'GM-' + base + '-D2', measureType: '持续监控', implementPart: '东立面墙体',
                    startTime: '2026-10-20', planEndTime: '2026-11-18', actualEndTime: '',
                    requirement: '对裂缝发展情况加密监测，每日记录',
                    dutyUnit: (r.street || '') + '城建中心', dutyPerson: persons[(i + 2) % persons.length], phone: '13956781234',
                    measureDesc: '持续监控：安装裂缝计，每日巡查记录',
                    implementPhotos: [govDemoPhoto('裂缝计安装照', '#7b1fa2')],
                    completePhotos: [], isDone: false, status: '实施中',
                    extras: { monitorFreq: '每日1次', monitorDevice: '裂缝计2个' },
                    changes: [], effectEvaluation: '', riskControlled: false,
                    reporter: persons[(i + 3) % persons.length], reportTime: '2026-10-20 14:30'
                });
            }
            syncGovernHouseStatus(r);
        });
    });
    try { localStorage.setItem(FLAG, '1'); } catch (e) {}
    return recs.length;
}