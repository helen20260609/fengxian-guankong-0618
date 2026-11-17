// 房屋安全模块统一数据层
// 作用：为 hs-register.html / hs-register-detail.html(GIS) / hs-statistics.html / house-arch-detail.html / hidden-close-apply.html
// 提供单一数据源 houseArchData，保持编号、坐标、治理/销号状态全模块一致。

const URBAN_HOUSE_ARCH_KEY = 'urbanHouseArchData';
const URBAN_CLOSE_APPLY_KEY = 'urbanCloseApplyData';
const URBAN_HOUSE_ARCH_DRAFT_KEY_GLOBAL = 'urbanHouseArchDraft';

// ---------------- 编号迁移：城镇 NF- → CF-（每次加载都执行，幂等） ----------------
// 背景：城乡拆分后城镇记录统一使用 CF- 前缀。
// 本函数在每次加载本数据层时执行，把 urbanHouseArchData / urbanHouseArchDraft 里的 NF- 键改为 CF-
// （含 record.no 字段），并做安全备份。幂等：若已无 NF- 键则直接返回，无副作用。
// 注意：旧版曾经用 urbanNoMigratedToCF=1 标记"只跑一次"，但种子重置后会再次生成 NF-，
// 因此改为每次加载都扫描一次，确保仓库中永远没有 NF- 键。
(function __migrateUrbanNoToCF() {
    try {
        var stamp = Date.now();
        ['urbanHouseArchData', 'urbanHouseArchDraft'].forEach(function (key) {
            var raw = localStorage.getItem(key);
            if (!raw) return;
            var all;
            try { all = JSON.parse(raw); } catch (e) { return; }
            if (!all || typeof all !== 'object') return;
            var nfKeys = Object.keys(all).filter(function (k) { return /^NF-/i.test(k); });
            if (!nfKeys.length) return;
            // 备份原始数据（仅在确实发生迁移时）
            try { localStorage.setItem(key + '.nfbackup-' + stamp, raw); } catch (e) {}
            nfKeys.forEach(function (oldKey) {
                var newKey = oldKey.replace(/^NF-/i, 'CF-');
                var rec = all[oldKey];
                if (rec && typeof rec === 'object') {
                    if (rec.no && /^NF-/i.test(rec.no)) rec.no = rec.no.replace(/^NF-/i, 'CF-');
                    if (rec.houseNo && /^NF-/i.test(rec.houseNo)) rec.houseNo = rec.houseNo.replace(/^NF-/i, 'CF-');
                }
                if (!all[newKey]) { all[newKey] = rec; }
                delete all[oldKey];
            });
            localStorage.setItem(key, JSON.stringify(all));
        });
        // 兼容旧标记（之前已迁移过的浏览器不会有 NF- 键，上面的循环自然跳过）
        if (localStorage.getItem('urbanNoMigratedToCF') !== '1') {
            localStorage.setItem('urbanNoMigratedToCF', '1');
        }
    } catch (e) { /* 静默失败，不阻塞页面 */ }
})();

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
// 城镇口径四级：danger→疑似危房(红)；major→疑似严重损坏房(橙)；warning→疑似一般损坏房(黄)；safe→完好房（基本完好房）(蓝)
const RISK_LABEL_MAP = {
    'danger': '疑似危房',
    'major': '疑似严重损坏房',
    'warning': '疑似一般损坏房',
    'safe': '完好房（基本完好房）'
};
const APPRAISAL_LEVEL_MAP = {
    'danger': 'D级',
    'major': 'C级',
    'warning': 'B级',
    'safe': 'A级'
};
const RISK_LABEL_MAP_INV = {
    '疑似危房': 'danger',
    '疑似严重损坏房': 'major',
    '疑似一般损坏房': 'warning',
    '严重损坏房': 'major',
    '一般损坏房': 'warning',
    '完好房': 'safe',
    '完好房（基本完好房）': 'safe',
    '完好房(基本完好房)': 'safe',
    '安全': 'safe',
    '无风险': 'safe'
};

// 城镇自建房展示用风险等级：与数据层保持一致（四级）
const HAZARD_TO_RISK_LEVEL = {
    '疑似危房': '疑似危房',
    '疑似严重损坏房': '疑似严重损坏房',
    '疑似一般损坏房': '疑似一般损坏房',
    '严重损坏房': '疑似严重损坏房',
    '一般损坏房': '疑似一般损坏房',
    '完好房': '完好房（基本完好房）',
    '完好房（基本完好房）': '完好房（基本完好房）',
    '完好房(基本完好房)': '完好房（基本完好房）',
    '安全': '完好房（基本完好房）',
    '无风险': '完好房（基本完好房）'
};
const STATUS_LABEL_MAP = {
    'pending': '待整治',
    'doing': '整治中',
    'done': '已治理',
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
const DISCOVERY_METHODS = ['日常巡查', '专项巡查', '临时巡查', '复查任务'];
const MANAGEMENT_MEASURES = ['停止使用', '封控警示', '人员撤离', '持续监控', '停止经营'];
const ENGINEERING_MEASURES = ['结构加固', '屋面修缮', '基础加固', '墙体修复', '排水改造', '电气改造', '消防改造'];
const MANAGER_PHONES = ['13812345678', '13956781234', '13600001234', '13799998888', '15011112222'];
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
        const raw = localStorage.getItem(URBAN_HOUSE_ARCH_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
}
function __setHouseArchStorage(all) {
    localStorage.setItem(URBAN_HOUSE_ARCH_KEY, JSON.stringify(all));
    __pushToServer('urban-house-arch', all);
}
function __getCloseApplyStorage() {
    try { const raw = localStorage.getItem(URBAN_CLOSE_APPLY_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function __setCloseApplyStorage(list) {
    localStorage.setItem(URBAN_CLOSE_APPLY_KEY, JSON.stringify(list));
}

// ---------------- 后端持久化（原型演示：跨浏览器/跨设备共享） ----------------
// 写入时异步推送到 server.js；读取时启动页先拉后端覆盖本地，保证多端一致
function __pushToServer(apiLabel, obj) {
    try {
        fetch('/api/' + apiLabel, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
        }).catch(function() { /* 后端未启动时静默失败，仍保留 localStorage */ });
    } catch (e) { /* ignore */ }
}
// 从后端拉取并与本地合并（服务端覆盖同号记录，本地独有记录保留）；done 回调无论成败都会执行
// 与农村侧 syncRuralHouseArchFromServer 策略一致，避免服务端旧数据整包替换导致本地记录丢失
function __pullFromServer(apiLabel, storageKey, done) {
    fetch('/api/' + apiLabel)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(obj) {
            if (obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length > 0) {
                try {
                    var local = {};
                    try { local = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (e2) {}
                    var merged = Object.assign({}, local, obj);
                    localStorage.setItem(storageKey, JSON.stringify(merged));
                } catch (e) {}
            }
        })
        .catch(function() { /* 后端不可用时忽略 */ })
        .then(function() { if (typeof done === 'function') done(); });
}
// 启动时拉取发布区+草稿区，全部完成后回调（原型演示入口用）
function initUrbanHouseArchFromServer(done) {
    var pending = 2;
    function fin() { pending--; if (pending <= 0 && typeof done === 'function') done(); }
    __pullFromServer('urban-house-arch', URBAN_HOUSE_ARCH_KEY, fin);
    __pullFromServer('urban-house-arch-draft', URBAN_HOUSE_ARCH_DRAFT_KEY, fin);
}

// 将本地缓存完整写回服务端并返回 Promise。
// 供「保存后立即跳转/刷新」的场景等待落盘，避免 fire-and-forget 的 POST
// 被页面卸载取消、随后被服务端旧数据整条覆盖导致新处置数据丢失（与农房仓同名函数对齐）。
function flushHouseArchToServer() {
    if (typeof fetch !== 'function') return Promise.resolve(false);
    try {
        return fetch('/api/urban-house-arch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(__getHouseArchStorage())
        }).then(function (r) { return !!(r && r.ok); }).catch(function () { return false; });
    } catch (e) { return Promise.resolve(false); }
}

// ---------------- 草稿区（风险档案工作区） ----------------
// 业务模型：风险档案（农村/城镇各自仓库）→ 编辑写入草稿区 → 点同步 → 覆盖到发布区（房屋建筑档案）
const URBAN_HOUSE_ARCH_DRAFT_KEY = 'urbanHouseArchDraft';
const URBAN_HOUSE_ARCH_SYNC_LOG_KEY = 'urbanHouseArchSyncLog';

function __getHouseArchDraft() {
    try {
        const raw = localStorage.getItem(URBAN_HOUSE_ARCH_DRAFT_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
}
function __setHouseArchDraft(all) {
    localStorage.setItem(URBAN_HOUSE_ARCH_DRAFT_KEY, JSON.stringify(all));
    __pushToServer('urban-house-arch-draft', all);
}
function __getSyncLog() {
    try { const raw = localStorage.getItem(URBAN_HOUSE_ARCH_SYNC_LOG_KEY); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
function __setSyncLog(list) {
    localStorage.setItem(URBAN_HOUSE_ARCH_SYNC_LOG_KEY, JSON.stringify(list.slice(-200))); // 只保留最近200条
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
// 城镇自建房统一使用 CF- 前缀（与农村 NF- 区分，避免路由分发错乱）
function generateNo(seq) { return 'CF-2025-' + pad5(seq); }
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
    riskLevel: '疑似一般损坏房', governStatus: '待整治', currentMeasure: '',
    managerName: '', managerPhone: '',
    manageRecords: [], projectRecords: [], qualityTrace: [], archiveRecords: [],
    closeStatus: '未申请', closeApplyTime: '', closeAuditTime: '', closeAuditor: '',
    closeAuditOpinion: '', closeRejectReason: '', isRemovedFromFocus: false,
    lat: 30.92, lng: 121.47, year: 1990, category: '砖混', houseType: '城镇自建房',
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

// 规范化单条记录：保持 risk/riskLevel、governance/governStatus 两对字段一致，
// 销号通过则统一为 safe/完好房（基本完好房） + done/已治理，并补全编号。

// ========== 一房一档·全周期档案补种（6.1.2.23.3：结构特点/建筑材料/维修记录/改造记录）==========
function generateStructureFeatures(rec) {
    const seed = parseInt(String(rec && rec.no || '').replace(/\D/g, '') || '0', 10);
    const st = (rec && rec.structure) || {};
    const basicForms = ['条形基础', '独立基础', '桩基础', '筏板基础'];
    const bearingSystems = ['砖混承重体系', '框架承重体系', '底部框架-上部砖混体系', '内框架承重体系'];
    const floorForms = ['现浇钢筋混凝土楼板', '预制混凝土空心板', '钢-混凝土组合楼盖', '木楼板'];
    const roofForms = ['平屋顶（现浇钢筋混凝土）', '坡屋面（机制平瓦）', '平屋顶（预制板）', '坡屋面（小青瓦）'];
    return {
        basicForm: st.foundationType || basicForms[seed % basicForms.length],
        bearingSystem: st.structureType || bearingSystems[seed % bearingSystems.length],
        floorForm: st.floorMaterial || floorForms[(seed + 1) % floorForms.length],
        roofForm: st.roofType || roofForms[(seed + 2) % roofForms.length]
    };
}

function generateBuildMaterials(rec) {
    const seed = parseInt(String(rec && rec.no || '').replace(/\D/g, '') || '0', 10);
    const masonry = [
        { type: '砌体材料（烧结普通砖）', strength: 'MU10', manufacturer: '本地机砖厂' },
        { type: '砌体材料（混凝土小型空心砌块）', strength: 'MU10', manufacturer: '市建材有限公司' },
        { type: '砌体材料（蒸压灰砂砖）', strength: 'MU15', manufacturer: '区新型建材厂' }
    ];
    const concrete = [
        { type: '混凝土（主体结构）', strength: 'C25', manufacturer: '区商品混凝土搅拌站' },
        { type: '混凝土（主体结构）', strength: 'C30', manufacturer: '市商品混凝土有限公司' },
        { type: '混凝土（圈梁/构造柱）', strength: 'C20', manufacturer: '现场拌制' }
    ];
    const extras = [
        { type: '钢筋', strength: 'HRB400', manufacturer: '本地钢材市场采购' },
        { type: '砌筑砂浆', strength: 'M7.5 水泥砂浆', manufacturer: '现场拌制' },
        { type: '防水材料（屋面）', strength: 'SBS 改性沥青卷材', manufacturer: '市防水材料厂' }
    ];
    return [masonry[seed % masonry.length], concrete[seed % concrete.length], extras[seed % extras.length]];
}

function generateLifecycleRecords(rec, kind) {
    const seed = parseInt(String(rec && rec.no || '').replace(/\D/g, '') || '0', 10);
    const hasRisk = rec && rec.risk && rec.risk !== 'safe';
    const done = rec && (rec.governStatus === '已治理' || rec.governance === 'done' || rec.closeStatus === '已通过');
    const list = [];
    if (kind === 'maintenance') {
        const contents = ['屋面防水层翻修、渗漏处理', '墙体裂缝压力灌浆修补', '外立面抹灰层铲除重做', '阳台栏板加固、防锈处理', '落水管更换、屋面排水疏通'];
        const units = ['街道房屋维修应急中心', '具资质的维修施工企业', '物业服务企业', '产权人自行组织维修'];
        const count = hasRisk ? (1 + seed % 2) : (seed % 3 === 0 ? 1 : 0);
        for (let i = 0; i < count; i++) {
            list.push({
                id: 'WX-' + (rec.no || '') + '-' + String(i + 1).padStart(2, '0'),
                time: '202' + (3 + (seed + i) % 3) + '-0' + ((seed + i) % 9 + 1) + '-1' + (i % 9),
                content: contents[(seed + i) % contents.length],
                unit: units[(seed + i) % units.length],
                cost: (0.5 + ((seed + i) % 6) * 0.5).toFixed(1) + ' 万元',
                remark: done ? '维修完成后纳入整治销号档案' : ''
            });
        }
    } else {
        const contents = ['沿街立面改造', '内部功能布局改造（经审批）', '加装电梯（业主协商一致）', '危房落架大修'];
        const units = ['具资质的施工总承包企业', '区建筑工程公司', '街道城市更新实施主体', '专业加固施工单位'];
        const approvals = ['建设工程规划许可证', '既有建筑改造审批表', '加装电梯联合审查意见', '修缮工程备案表'];
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

function normalizeHouseRecord(record) {
    if (!record) return record;
    const rec = record;
    // 确保 no 存在
    if (!rec.no) rec.no = '';
    // 房屋性质默认住宅（老数据兼容；种子中非住宅已显式标记）
    if (!rec.houseNature) rec.houseNature = '住宅';

    // 确保全要素档案字段存在
    if (!rec.overview) rec.overview = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.overview));
    if (!rec.homestead) rec.homestead = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.homestead));
    if (!rec.designConstruction) rec.designConstruction = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.designConstruction));
    // 历史缓存记录缺竣工时间时按编号确定性补生成
    if (rec.designConstruction && !rec.designConstruction.completionDate) {
        const dcSeed = parseInt(String(rec.no || '').replace(/\D/g, '') || '0', 10);
        const dcYear = parseInt(rec.year, 10) || 2000;
        if (dcSeed > 0) rec.designConstruction.completionDate = dcYear + '-' + pad2(1 + (dcSeed % 12)) + '-' + pad2(1 + (dcSeed % 28));
    }
    // 已持久化的设计施工记录数组同步补齐竣工时间
    if (Array.isArray(rec.designConstructionRecords) && rec.designConstruction) {
        rec.designConstructionRecords.forEach(function (dc) {
            if (dc && !dc.completionDate) dc.completionDate = rec.designConstruction.completionDate || '';
        });
    }
    if (!rec.structure) rec.structure = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.structure));
    if (!rec.usage) rec.usage = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.usage));
    if (!rec.photos) rec.photos = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.photos));
    if (!rec.riskInfo) rec.riskInfo = JSON.parse(JSON.stringify(DEFAULT_HOUSE_STATUS.riskInfo));
    if (!rec.inspectionRecords) rec.inspectionRecords = [];
    if (!rec.appraisalReports) rec.appraisalReports = [];
    if (!rec.patrolRecords) rec.patrolRecords = [];
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

    // 一房一档全周期档案（6.1.2.23.3）：结构特点/建筑材料/维修记录/改造记录（幂等补种）
    if (!rec.structureFeatures) rec.structureFeatures = generateStructureFeatures(rec);
    if (!Array.isArray(rec.buildMaterials)) rec.buildMaterials = generateBuildMaterials(rec);
    if (!Array.isArray(rec.maintenanceRecords)) rec.maintenanceRecords = generateLifecycleRecords(rec, 'maintenance');
    if (!Array.isArray(rec.renovationRecords)) rec.renovationRecords = generateLifecycleRecords(rec, 'renovation');

    // 销号已通过：强制无风险/已治理，但保留原始风险等级用于统计
    if (rec.closeStatus === '已通过') {
        rec.originalRisk = rec.originalRisk || rec.risk || 'warning';
        rec.originalRiskLevel = rec.originalRiskLevel || rec.riskLevel || RISK_LABEL_MAP[rec.risk] || '完好房（基本完好房）';
        rec.risk = 'safe';
        rec.governance = 'done';
        rec.riskLevel = '完好房（基本完好房）';
        rec.governStatus = '已治理';
        rec.isRemovedFromFocus = true;
        rec.riskDisplayLevel = HAZARD_TO_RISK_LEVEL[rec.originalRiskLevel] || rec.originalRiskLevel;
        return rec;
    }

    // 风险等级：以中文 riskLevel（风险等级）为准，回写 risk；若 riskLevel 缺失则反向生成
    if (rec.riskLevel && RISK_LABEL_MAP_INV[rec.riskLevel]) {
        rec.risk = RISK_LABEL_MAP_INV[rec.riskLevel];
    } else if (rec.risk && RISK_LABEL_MAP[rec.risk]) {
        rec.riskLevel = RISK_LABEL_MAP[rec.risk];
    } else {
        rec.risk = 'warning';
        rec.riskLevel = '疑似一般损坏房';
    }

    // 保留原始风险信息（便于销号后追溯）
    rec.originalRisk = rec.originalRisk || rec.risk;
    rec.originalRiskLevel = rec.originalRiskLevel || rec.riskLevel;

    // 城镇自建房风险等级：与数据层保持一致（四级）
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
    rec.riskInfo.riskLevel = rec.riskInfo.riskLevel || rec.riskLevel || '疑似一般损坏房';
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
    const preliminary = risk === 'danger' ? '存在严重安全隐患（疑似危房）' : (risk === 'major' ? '存在一定安全隐患（疑似严重损坏房）' : '未发现安全隐患（完好或基本完好房）');
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
            level: RISK_LABEL_MAP[risk],
            photos: [govDemoPhoto(part + '·' + type + '现场照', '#b3261e')]
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
                    structureStatus: rec.riskLevel || '疑似一般损坏房',
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
    const categories = ['城镇自建房'];
    const structTypes = ['砖混', '砖木', '框架'];

    // 城镇自建房风险分布：安全/轻微瑕疵占多数，危房占少数
    const RISK_DISTRIBUTION = [
        { risk: 'danger',  governanceWeights: { done: 0.35, doing: 0.30, overdue: 0.20, pending: 0.15 }, ratio: 0.10 }, // 疑似危房（红）
        { risk: 'major',   governanceWeights: { done: 0.30, doing: 0.40, overdue: 0.15, pending: 0.15 }, ratio: 0.15 }, // 疑似严重损坏房（橙）
        { risk: 'warning', governanceWeights: { done: 0.45, doing: 0.25, overdue: 0.10, pending: 0.20 }, ratio: 0.25 }, // 疑似一般损坏房（黄·高整治权重）
        { risk: 'warning', governanceWeights: { done: 0.70, doing: 0.15, overdue: 0.05, pending: 0.10 }, ratio: 0.15 }, // 疑似一般损坏房（黄·低整治权重）
        { risk: 'safe',    governanceWeights: { done: 1.0 },                                 ratio: 0.35 }  // 完好房（基本完好房）（蓝）
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
        const category = categories[0]; // 仅城镇自建房
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

        // 治理完成（done）的房屋统一展示为"已治理"；其余按状态映射
        const governStatus = governance === 'done' ? '已治理' : STATUS_LABEL_MAP[governance];
        const riskLevel = RISK_LABEL_MAP[risk];

        // 已销号且治理完成：展示用安全，但保留原始风险用于统计/追溯
        const isClosed = governance === 'done' && closeStatus === '已通过';
        const originalRisk = risk;
        const originalRiskLevel = riskLevel;
        const displayRisk = isClosed ? 'safe' : risk;
        const displayRiskLevel = isClosed ? '完好房（基本完好房）' : riskLevel;

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
            permit: '建设工程规划许可证',
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
            completionDate: year + '-' + pad2(1 + ((i + 5) % 12)) + '-' + pad2(1 + ((i * 7) % 28)),
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
            basis: '依据《危险房屋鉴定标准》综合评定为' + originalRiskLevel,
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
        // 模拟非住宅数据：约 1/3 记录标记为非住宅（含详情页字段库）
        applyCommercialMock(record, i);
        data[no] = record;
    }
    return data;
}

// 非住宅模拟：给记录打非住宅标记，并写入详情页所需的字段库
// 只在种子生成时调用；不影响已有住宅记录
function applyCommercialMock(record, i) {
    if (!record) return;
    // 住宅默认：顶层标记 + 顶层字段库"房屋性质=住宅"不强制写（详情页默认即住宅）
    if (i % 3 !== 0) {
        record.houseNature = '住宅';
        return;
    }
    // ===== 非住宅 =====
    record.houseNature = '非住宅';
    // 顶部概览使用用途改为经营类
    if (record.overview) {
        record.overview.usage = '经营';
        record.overview.isSelfLive = '否';
        record.overview.specificUsage = '出租经营';
    }
    if (record.usage) {
        record.usage.usageType = '经营';
        record.usage.isSelfLive = '否';
        record.usage.specificUsage = '出租经营';
    }
    // 非住宅使用人/单位池
    var users = [
        '奉贤区青少年业余体育学校', '南桥镇社区卫生服务中心', '奉贤区文化馆',
        '南桥镇社区事务受理服务中心', '奉贤区实验幼儿园', '南桥镇敬老院',
        '上海奉贤商业发展有限公司', '南桥镇文化活动中心', '奉贤区图书馆分馆'
    ];
    var supervisors = ['教育', '卫生健康', '文化旅游', '民政', '商务', '机关事务'];
    var propertyNatures = ['政府', '国有企业', '民营企业', '私有'];
    var useTypes = ['非经营用房屋', '经营用房屋'];
    var uses = [
        '其他学校建筑', '医疗卫生用房', '文化设施用房', '养老服务用房',
        '商业服务用房', '办公用房', '社区服务用房', '其他公共建筑'
    ];
    var u = users[i % users.length];
    var sup = supervisors[i % supervisors.length];
    var pn = propertyNatures[i % propertyNatures.length];
    var ut = useTypes[i % useTypes.length];
    var use = uses[i % uses.length];

    // 详情页字段库：jbxx_common（房屋性质=非住宅 + 按该记录值）+ jbxx_commercial
    var jbxxCommon = [
        ['房屋性质', '非住宅'],
        ['所在区域', '奉贤区' + (record.street || '') + (record.community || '')],
        ['建筑名称', record.name || ''],
        ['路号信息', (record.address || '').replace(/^上海市奉贤区/, '')],
        ['是否有物业管理', '否'],
        ['是否为自建房', '是'],
        ['异常标记', record.abnormalMark || '正常'],
        ['建造时间', (record.year || 1990) + '-01'],
        ['是否采用外墙外保温', '否'],
        ['地上建筑面积', (record.overview && record.overview.buildingArea) || '300'],
        ['地下建筑面积', '0'],
        ['地上建筑层数', '2'],
        ['地下建筑层数', '0'],
        ['建筑高度', '8'],
        ['土地性质', '国有土地-公共管理与公共服务用地'],
        ['土地性质其他内容', ''],
        ['结构类型', record.category === '框架' ? '框架结构' : '砌体结构'],
        ['结构类型其他内容', ''],
        ['二级结构类型', '其他'],
        ['是否专业设计建造', '是'],
        ['是否保护性建筑', '否'],
        ['是否取得施工许可', '是'],
        ['外墙面类型', '涂料'],
        ['建筑外立面附属构件', '无']
    ];
    var jbxxCommercial = [
        ['使用人或单位(机构名称)', u],
        ['行业主管部门', sup],
        ['行业主管部门其他内容', ''],
        ['产权性质', pn],
        ['产权性质其他内容', ''],
        ['房屋用途类型', ut],
        ['房屋用途', use],
        ['房屋用途其他内容', '']
    ];
    record._fieldsLibrary = record._fieldsLibrary || {};
    record._fieldsLibrary.basic_URBAN = record._fieldsLibrary.basic_URBAN || {};
    record._fieldsLibrary.basic_URBAN.jbxx_common = jbxxCommon;
    record._fieldsLibrary.basic_URBAN.jbxx_commercial = jbxxCommercial;
    // 兼容旧 jbxx 全量键
    record._fieldsLibrary.basic_URBAN.jbxx = jbxxCommon.concat(jbxxCommercial);
    // 使用情况：非住宅与住宅字段一致(由详情页 basicData_URBAN.syqk 默认提供)
    delete record._fieldsLibrary.basic_URBAN.syqk;
}

// 初始化种子Storage 为空则写入 85 条数据；否则规范化已有数据
function initHouseArchSeed() {
    const all = getHouseArchStorage();
    if (Object.keys(all).length === 0) {
        const seed = generateHouseSeed();
        setHouseArchStorage(seed);
        __seedGenerated = true;
        // 同步生成 closeApplyData，确保 hidden-close-apply 页面可展示
        syncUrbanCloseApplyData(seed);
        return seed;
    }
    // 规范化已存在的数据，确保各页面读取一致
    Object.keys(all).forEach(no => {
        normalizeHouseRecord(all[no]);
        // 迁移：城镇档案评定依据误引农房标准的历史种子数据
        const rc = all[no] && all[no].riskClassification;
        if (rc && typeof rc.basis === 'string' && rc.basis.indexOf('农村住房危险性鉴定标准') !== -1) {
            rc.basis = rc.basis.replace('农村住房危险性鉴定标准', '危险房屋鉴定标准');
        }
    });
    setHouseArchStorage(all);
    // 若 closeApplyData 为空则根据现有房屋数据同步生成
    if (getCloseApplyStorage().length === 0) {
        syncUrbanCloseApplyData(all);
    }
    return all;
}

// 根据 houseArchData 同步 closeApplyData（与房屋状态保持一致）
function syncUrbanCloseApplyData(houses) {
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
    localStorage.setItem(REVIEW_ZONE_CHECKIN_KEY, JSON.stringify(all));
    // 同步写入历史
    const hist = getZoneCheckinHistory();
    hist.unshift(Object.assign({ seq: Date.now() }, record));
    localStorage.setItem(REVIEW_ZONE_HISTORY_KEY, JSON.stringify(hist.slice(0, 100)));
}

function removeZoneCheckin(zoneId) {
    const all = getZoneCheckins();
    delete all[zoneId];
    localStorage.setItem(REVIEW_ZONE_CHECKIN_KEY, JSON.stringify(all));
}

const REVIEW_ZONE_HISTORY_KEY = 'review-2026-zone-checkin-history';
function getZoneCheckinHistory() {
    try { return JSON.parse(localStorage.getItem(REVIEW_ZONE_HISTORY_KEY) || '[]'); } catch (e) { return []; }
}

// 在需要的地方调用，例如：initHouseArchSeed();


// ========== 消息通知（城镇治理演示：localStorage 持久化）==========
const URBAN_HOUSE_NOTIFY_KEY = 'urbanHouseArchNotify';
function getNotifications() {
    try { return JSON.parse(localStorage.getItem(URBAN_HOUSE_NOTIFY_KEY) || '[]'); } catch (e) { return []; }
}
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
    try { localStorage.setItem(URBAN_HOUSE_NOTIFY_KEY, JSON.stringify(list.slice(0, 100))); } catch (e) {}
}

// 到期状态（与农房口径一致：治理详情页共用）
function getDeadlineStatus(deadlineStr) {
    if (!deadlineStr) return { cls: 'info', text: '未设置', days: null };
    const diff = Math.ceil((new Date(deadlineStr) - new Date()) / 86400000);
    if (diff < 0) return { cls: 'danger', text: '已超期 ' + (-diff) + ' 天', days: diff, overdue: true };
    if (diff <= 15) return { cls: 'warning', text: '临近到期（剩 ' + diff + ' 天）', days: diff, near: true };
    return { cls: 'safe', text: '剩 ' + diff + ' 天', days: diff };
}

/* ================= 6.1.2.23.1 房屋安全风险治理（城镇自建房口径，函数与农房一致、字段适配） ================= */
const GOV_MANAGE_TYPES = ['停止使用', '停止经营', '封控警示', '人员撤离', '持续监控'];
// 措施类型说明（新增弹窗按所选类型展示提示）
const GOV_MANAGE_TYPE_DESC = {
    '停止使用': '房屋整体或部分停止使用',
    '停止经营': '停止经营性活动',
    '封控警示': '设置警戒线、张贴警示标识',
    '人员撤离': '组织住户临时搬离',
    '持续监控': '加密巡查、安装监测设备'
};
// 按措施类型的动态扩展字段（标书：如「人员撤离」需填写撤离人数、安置方式、撤离确认人）
const GOV_MANAGE_EXTRA_FIELDS = {
    '停止使用': [
        { key: 'stopScope', label: '停用范围', placeholder: '如：整栋 / 一层东间' },
        { key: 'stopMode', label: '停用方式', placeholder: '如：封锁出入口、切断水电' }
    ],
    '停止经营': [
        { key: 'bizType', label: '经营业态', placeholder: '如：民宿 / 餐饮 / 小卖部' },
        { key: 'bizScope', label: '停业范围', placeholder: '如：整栋 / 沿街铺面' },
        { key: 'licenseDeal', label: '证照处置', placeholder: '如：营业执照已注销 / 已暂扣' }
    ],
    '人员撤离': [
        { key: 'evacueeCount', label: '撤离人数', placeholder: '如：5人' },
        { key: 'settleMode', label: '安置方式', placeholder: '如：投靠亲友 / 村临时安置点' },
        { key: 'evacConfirm', label: '撤离确认人', placeholder: '如：村干部张三' }
    ],
    '封控警示': [
        { key: 'closureRange', label: '封控范围', placeholder: '如：房屋周边5米拉设警戒线' },
        { key: 'warnSign', label: '警示标识', placeholder: '如：张贴警示牌2处、设置围挡' }
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
const CONTRACTOR_LIB_KEY = 'urbanHouseContractorLib';
const CONTRACTOR_LIBRARY_SEED = [
    { id: 'CT-001', name: '奉贤城建建筑工程有限公司', qualification: '建筑工程施工总承包二级', credit: 92, history: '近三年完成城镇自建房加固修缮工程 96 项，验收合格率 100%', phone: '021-57410001' },
    { id: 'CT-002', name: '上海南桥建设发展有限公司', qualification: '建筑工程施工总承包二级', credit: 88, history: '近三年完成城镇危旧房改造工程 58 项，无质量投诉', phone: '021-57410002' },
    { id: 'CT-003', name: '华建城镇建设工程队', qualification: '建筑装修装饰工程专业承包三级', credit: 85, history: '承接城镇房屋局部改造、屋面修缮 130 余项', phone: '021-57410003' },
    { id: 'CT-004', name: '东方古建修缮工程公司', qualification: '特种工程（结构补强）专业承包', credit: 90, history: '完成砖木结构老房加固 52 项，含历史保护建筑 8 栋', phone: '021-57410004' },
    { id: 'CT-005', name: '金汇镇建筑工匠合作社', qualification: '村镇建筑工匠备案（A级）', credit: 82, history: '本街镇房屋维修加固 230 余户，熟悉城区工艺', phone: '021-57410005' },
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
    rec.hazards = Array.isArray(rec.hazards) ? rec.hazards : [];
    rec.hazards.forEach(h => {
        if (!Array.isArray(h.photos) || !h.photos.length) {
            h.photos = [govDemoPhoto((h.part || '隐患部位') + '·' + (h.type || '') + '现场照', '#b3261e')];
        }
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
        if (!p.fundSource) p.fundSource = '城镇房屋安全专项整治资金 + 业主自筹';
        if (!p.planFiles || typeof p.planFiles !== 'object' || Array.isArray(p.planFiles)) {
            p.planFiles = { design: [], org: [], safety: [] };
        }
        if (p.planStatus === undefined) p.planStatus = '已通过';
        if (!Array.isArray(p.progressLogs)) p.progressLogs = [];
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
        templateId: payload.templateId || null,
        templateName: payload.templateName || '',
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
        remind: payload.remind !== false,
        remindDays: (parseInt(payload.remindDays, 10) > 0) ? parseInt(payload.remindDays, 10) : 15,
        remindLogs: [],
        lastRemindedEnd: '',
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
// 到期提醒：实施中且开启提醒的措施，距计划结束 ≤ 提醒天数（含已超期）时生成提醒记录并通知责任人；
// 同一计划结束时间只提醒一次（续期审批通过、计划结束更新后可再次触发）
function checkGovernMeasureRemind(rec) {
    ensureGovernData(rec);
    const hits = [];
    (rec.manageRecords || []).forEach(m => {
        if (m.isDone || m.status === '已结束' || m.remind === false || !m.planEndTime) return;
        const days = (m.remindDays > 0) ? m.remindDays : 15;
        const diff = Math.ceil((new Date(m.planEndTime) - new Date()) / 86400000);
        if (diff > days) return;
        if (m.lastRemindedEnd === m.planEndTime) return;
        m.lastRemindedEnd = m.planEndTime;
        const log = {
            time: __govNow(),
            days: diff,
            text: '到期提醒：管理措施「' + m.measureType + '」（' + (m.implementPart || '整栋房屋') + '）' +
                (diff < 0 ? '已超期 ' + (-diff) + ' 天' : '将于 ' + m.planEndTime + ' 到期（剩 ' + diff + ' 天）') +
                '，已通知责任人 ' + (m.dutyPerson || '—') + (m.phone ? ' ' + m.phone : '') + '，请及时办理续期或转为工程整治'
        };
        (m.remindLogs = m.remindLogs || []).push(log);
        hits.push({ id: m.id, days: diff });
    });
    return hits;
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
        type: (payload && payload.type) || '变更/延长',
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

// 治理过程记录：支持多次手动补充，每次形成时间轴节点
function addGovernLog(rec, payload) {
    ensureGovernData(rec);
    if (!Array.isArray(rec.governLogs)) rec.governLogs = [];
    rec.governLogs.push({
        id: 'GL-' + (rec.no || 'X') + '-' + (rec.governLogs.length + 1),
        time: __govNow(),
        content: (payload && payload.content) || '',
        recorder: (payload && payload.recorder) || '当前用户',
        photos: (payload && payload.photos) || []
    });
    return { ok: true };
}

// ---- 工程措施 ----
function addGovernEng(rec, payload) {
    ensureGovernData(rec);
    const seq = rec.projectRecords.length + 1;
    const item = {
        id: 'GE-' + (rec.no || 'X') + '-' + String(seq).padStart(3, '0') + '-' + Date.now() % 1000,
        engType: payload.engType || '维修加固',
        templateId: payload.templateId || null,
        templateName: payload.templateName || '',
        projectName: payload.engType || '维修加固',
        scope: payload.scope || '',
        startDate: payload.startDate || __govToday(),
        endDate: payload.endDate || '',
        companyId: payload.companyId || '',
        companyCode: payload.companyCode || '',
        company: payload.company || '',
        contractorSource: payload.contractorSource || (payload.companyId && payload.companyId.indexOf('ORG-') === 0 ? 'thirdParty' : 'legacy'),
        contractorSnapshot: payload.contractorSnapshot ? JSON.parse(JSON.stringify(payload.contractorSnapshot)) : null,
        leader: payload.leader || '',
        manager: payload.leader || '',
        phone: payload.phone || '',
        budget: payload.budget || 0,
        fund: payload.budget || 0,
        fundSource: payload.fundSource || '',
        planFiles: payload.planFiles || { design: [], org: [], safety: [] },
        isMajor: !!payload.isMajor,
        expertReview: payload.expertReview ? JSON.parse(JSON.stringify(payload.expertReview)) : null,
        nodes: GOV_ENG_NODES.map(name => ({ name: name, status: '待验收', time: '', conclusion: '', recorder: '', photos: [] })),
        acceptReport: null,
        planStatus: '待审核',
        planAudit: null,
        progressLogs: [],
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
// 治理方案审核（通过 / 驳回）
function auditGovernEngPlan(rec, id, payload) {
    ensureGovernData(rec);
    const p = rec.projectRecords.find(x => x.id === id);
    if (!p) return { ok: false, msg: '未找到工程措施' };
    if (p.planStatus !== '待审核') return { ok: false, msg: '该方案不在待审核状态' };
    const pass = !payload || payload.pass !== false;
    p.planStatus = pass ? '已通过' : '已驳回';
    p.planAudit = {
        result: p.planStatus,
        opinion: (payload && payload.opinion) || '',
        auditor: (payload && payload.auditor) || '当前用户',
        time: (payload && payload.time) || __govNow()
    };
    if (pass) p.status = '进行中';
    return { ok: true };
}
// 方案驳回后重新报审
function resubmitGovernEngPlan(rec, id) {
    ensureGovernData(rec);
    const p = rec.projectRecords.find(x => x.id === id);
    if (!p) return { ok: false, msg: '未找到工程措施' };
    if (p.planStatus !== '已驳回') return { ok: false, msg: '仅驳回状态可重新报审' };
    p.planStatus = '待审核';
    return { ok: true };
}
// 实施进度填报（只增不减，竣工验收后自动 100%）
function reportGovernEngProgress(rec, id, payload) {
    ensureGovernData(rec);
    const p = rec.projectRecords.find(x => x.id === id);
    if (!p) return { ok: false, msg: '未找到工程措施' };
    if (p.planStatus !== '已通过') return { ok: false, msg: '方案审核通过后才能填报进度' };
    if (p.isDone) return { ok: false, msg: '工程已竣工，无需填报进度' };
    const v = payload && parseInt(payload.progress, 10);
    if (isNaN(v) || v < 0 || v > 100) return { ok: false, msg: '进度需在 0~100 之间' };
    if (v < (p.progress || 0)) return { ok: false, msg: '进度不能低于当前值（' + (p.progress || 0) + '%）' };
    p.progress = v;
    if (!Array.isArray(p.progressLogs)) p.progressLogs = [];
    p.progressLogs.push({ progress: v, note: (payload && payload.note) || '', reporter: (payload && payload.reporter) || '当前用户', time: __govNow(), photos: (payload && payload.photos) || [] });
    return { ok: true };
}
// 关键节点验收（基础验收 / 材料进场验收 / 主体验收）
function saveGovernEngNode(rec, id, nodeName, payload) {
    ensureGovernData(rec);
    const p = rec.projectRecords.find(x => x.id === id);
    if (!p) return { ok: false, msg: '未找到工程措施' };
    if (p.planStatus !== '已通过') return { ok: false, msg: '方案审核通过后才能节点验收' };
    const node = (p.nodes || []).find(n => n.name === nodeName);
    if (!node) return { ok: false, msg: '未找到节点' };
    node.status = '已验收';
    node.time = (payload && payload.time) || __govToday();
    node.conclusion = (payload && payload.conclusion) || '合格';
    node.recorder = (payload && payload.recorder) || '当前用户';
    node.photos = (payload && payload.photos) || [];
    const doneCnt = p.nodes.filter(n => n.status === '已验收').length;
    p.progress = Math.max(p.progress || 0, Math.round(doneCnt / p.nodes.length * 90));
    return { ok: true };
}
// 竣工验收报告 → 工程措施完成 → 联动更新房屋治理状态
function finishGovernEng(rec, id, report) {
    ensureGovernData(rec);
    const p = rec.projectRecords.find(x => x.id === id);
    if (!p) return { ok: false, msg: '未找到工程措施' };
    if (p.planStatus !== '已通过') return { ok: false, msg: '方案审核通过后才能竣工验收' };
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

// ---- 巡查任务反查（台账数据来源于「巡查任务管理」，按房屋唯一标识关联） ----
function getUrbanPatrolTasks() {
    let tasks = [];
    try { const raw = localStorage.getItem('urbanPatrolTasks'); tasks = raw ? JSON.parse(raw) : []; } catch (e) { tasks = []; }
    return Array.isArray(tasks) ? tasks : [];
}
function urbanPatrolTaskOfHouse(no) {
    let hit = null;
    getUrbanPatrolTasks().forEach(t => {
        if (!t || !Array.isArray(t.houseNos) || t.houseNos.indexOf(no) < 0) return;
        if (!hit || (Number(t.id) || 0) > (Number(hit.id) || 0)) hit = t;
    });
    return hit;
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
        byTown: {}, byManageType: {}, byEngType: {},
        // 治理房屋按区域 × 完成情况
        byTownGov: {},
        // 管理措施多维分析：使用频率（条数）+ 效果（完成率 / 风险管控率）
        manage: { total: 0, done: 0, controlled: 0, byType: {}, byTown: {}, byPerson: {} },
        // 工程措施多维分析：实施数量 + 完成率 + 资金规模
        eng: { total: 0, done: 0, fundSum: 0, byType: {}, byCompany: {}, byFund: [] }
    };
    const FUND_BUCKETS = [
        { label: '未填概算', min: -1, max: 0 },
        { label: '1万以下', min: 0, max: 10000 },
        { label: '1-3万', min: 10000, max: 30000 },
        { label: '3-5万', min: 30000, max: 50000 },
        { label: '5-10万', min: 50000, max: 100000 },
        { label: '10万以上', min: 100000, max: Infinity }
    ];
    s.eng.byFund = FUND_BUCKETS.map(b => ({ label: b.label, min: b.min, max: b.max, cnt: 0, fund: 0 }));
    function bump(obj, key, done, fund) {
        const k = key || '未知';
        if (!obj[k]) obj[k] = { cnt: 0, done: 0, fund: 0 };
        obj[k].cnt++;
        if (done) obj[k].done++;
        obj[k].fund += fund || 0;
    }
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
        if (!s.byTownGov[town]) s.byTownGov[town] = { total: 0, done: 0, doing: 0, overdue: 0, pending: 0 };
        s.byTownGov[town].total++;
        s.byTownGov[town][g === 'done' ? 'done' : (g === 'doing' ? 'doing' : (g === 'overdue' ? 'overdue' : 'pending'))]++;
        (rec.manageRecords || []).forEach(m => {
            const t = m.measureType || '其他';
            s.byManageType[t] = (s.byManageType[t] || 0) + 1;
            const done = !!(m.isDone || m.status === '已结束');
            s.manage.total++;
            if (done) s.manage.done++;
            if (m.riskControlled) s.manage.controlled++;
            bump(s.manage.byType, t, done, 0);
            bump(s.manage.byTown, town, done, 0);
            bump(s.manage.byPerson, m.dutyPerson || '未指定', done, 0);
        });
        (rec.projectRecords || []).forEach(p => {
            const t = p.engType || GOV_ENG_TYPE_MAP[p.projectName] || '其他';
            s.byEngType[t] = (s.byEngType[t] || 0) + 1;
            const done = !!p.isDone;
            const fund = Number(p.budget || p.fund || 0) || 0;
            s.eng.total++;
            if (done) s.eng.done++;
            s.eng.fundSum += fund;
            bump(s.eng.byType, t, done, fund);
            bump(s.eng.byCompany, p.company || '未定单位', done, fund);
            const b = s.eng.byFund.find(x => fund > x.min && (x.max === Infinity ? fund >= x.min : fund <= x.max))
                || s.eng.byFund[s.eng.byFund.length - 1];
            b.cnt++; b.fund += fund;
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
    const FLAG = 'urbanHouseGovernDemoV1';
    try { if (!force && localStorage.getItem(FLAG)) return 0; } catch (e) {}
    const recs = getAllHouseRecords().filter(r => r.houseType === '城镇自建房' && r.risk && r.risk !== 'safe');
    const persons = ['李志强', '王建国', '陈明华', '周敏', '张建军', '刘伟', '赵敏'];
    const fundSources = ['城镇房屋安全专项整治资金 + 业主自筹', '业主自筹', '区镇两级财政补助'];
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
                    m.extras.settleMode = (i + mi) % 2 ? '投靠亲友' : '社区临时安置点';
                    m.extras.evacConfirm = '社区干部 ' + persons[(i + mi) % persons.length];
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
                        reason: ['雨季连续降雨无法施工', '住户搬迁协调中', '等待维修资金审批下达'][i % 3],
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
                    dispatcher: i % 2 ? '区房管局' : (r.street || '') + '房管办',
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
                    dutyUnit: (r.street || '') + '房管办', dutyPerson: persons[i % persons.length], phone: '13812345678',
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
                    dutyUnit: (r.street || '') + '房管办', dutyPerson: persons[(i + 2) % persons.length], phone: '13956781234',
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

