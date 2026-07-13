// =========================================================
// 第三方服务机构模块统一数据层
// 文件：js/third-party-data.js
// 作用：统一管理机构、合同、业绩、专家、信用等跨页面数据
// 使用：所有 tp-*.html 页面引入本脚本
// =========================================================

const TP_STORAGE_KEY = 'thirdPartyData';

// 统一数据模型
// orgs:      机构主数据
// contracts: 鉴定合同
// performances: 机构业绩
// experts:   专家库
// credit:    信用档案（可由系统根据业绩/合同自动计算）
function createDefaultData() {
    const orgs = [
        { orgId: 'ORG-20260001', orgName: '上海建科检测技术有限公司', orgCode: '91310000123456789X', legalPerson: '张建科', phone: '021-12345678', region: '上海市黄浦区', field: '建筑工地', orgType: '检测机构', qual: '甲级', status: '正常', creditLevel: 'AAA', score: 92.6, established: '2010-05-20' },
        { orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', orgCode: '91310000876543210Y', legalPerson: '李华安', phone: '021-87654321', region: '上海市静安区', field: '基坑', orgType: '评估机构', qual: '甲级', status: '正常', creditLevel: 'AA', score: 88.3, established: '2012-08-15' },
        { orgId: 'ORG-20260003', orgName: '上海水利安全研究院', orgCode: '91310000567890123Z', legalPerson: '王水研', phone: '021-56789012', region: '上海市徐汇区', field: '交通', orgType: '研究院', qual: '乙级', status: '正常', creditLevel: 'AA', score: 85.7, established: '2015-03-10' },
        { orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', orgCode: '91310000345678901A', legalPerson: '陈消防', phone: '021-34567890', region: '上海市长宁区', field: '玻璃幕墙', orgType: '检测机构', qual: '乙级', status: '正常', creditLevel: 'A', score: 79.5, established: '2018-11-22' },
        { orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', orgCode: '91310000987654321B', legalPerson: '刘燃气', phone: '021-98765432', region: '上海市浦东新区', field: '燃气', orgType: '服务机构', qual: '甲级', status: '正常', creditLevel: 'AAA', score: 91.2, established: '2011-06-18' },
        { orgId: 'ORG-20260006', orgName: '上海城市安全研究院', orgCode: '91310000678901234C', legalPerson: '赵城安', phone: '021-67890123', region: '上海市杨浦区', field: '高空坠物', orgType: '研究院', qual: '甲级', status: '正常', creditLevel: 'AA', score: 87.4, established: '2013-09-05' },
        { orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', orgCode: '91310000456789012D', legalPerson: '孙房鉴', phone: '021-45678901', region: '上海市虹口区', field: '城镇自建房', orgType: '鉴定机构', qual: '甲级', status: '正常', creditLevel: 'AAA', score: 93.5, established: '2008-04-12' },
        { orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', orgCode: '91310000234567890E', legalPerson: '周村镇', phone: '021-23456789', region: '上海市闵行区', field: '农村自建房', orgType: '评估机构', qual: '乙级', status: '正常', creditLevel: 'A', score: 76.8, established: '2019-01-30' }
    ];

    const contracts = [
        { contractId: 'HT-20260001', orgId: 'ORG-20260001', orgName: '上海建科检测技术有限公司', orgCode: '91310000123456789X', projectName: '上海市建筑工地施工安全风险评估', serviceScope: '建筑工地', servicePeriod: '2026-04-01 ~ 2026-06-30', amount: 12.8, payment: '分期付款', deliverable: '施工安全风险评估报告、风险清单及管控建议', acceptance: '报告通过专家评审并提交主管部门备案', status: '已验收', signDate: '2026-03-15' },
        { contractId: 'HT-20260002', orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', orgCode: '91310000876543210Y', projectName: '上海市基坑工程安全监测与评价', serviceScope: '基坑', servicePeriod: '2026-03-15 ~ 2026-05-15', amount: 9.65, payment: '一次性付款', deliverable: '基坑监测报告及安全评价意见', acceptance: '通过专家组评审', status: '已验收', signDate: '2026-03-01' },
        { contractId: 'HT-20260003', orgId: 'ORG-20260003', orgName: '上海水利安全研究院', orgCode: '91310000567890123Z', projectName: '上海市交通基础设施安全风险评估', serviceScope: '交通', servicePeriod: '2026-05-01 ~ 2026-08-31', amount: 21.0, payment: '按里程碑付款', deliverable: '交通基础设施风险评估报告', acceptance: '提交主管部门并通过审核', status: '已验收', signDate: '2026-04-20' },
        { contractId: 'HT-20260004', orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', orgCode: '91310000345678901A', projectName: '上海市玻璃幕墙安全隐患排查', serviceScope: '玻璃幕墙', servicePeriod: '2026-01-10 ~ 2026-03-10', amount: 5.42, payment: '分期付款', deliverable: '玻璃幕墙安全隐患排查报告', acceptance: '隐患整改闭环后验收', status: '已验收', signDate: '2026-01-05' },
        { contractId: 'HT-20260005', orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', orgCode: '91310000987654321B', projectName: '上海市燃气管道安全风险评估', serviceScope: '燃气', servicePeriod: '2026-06-01 ~ 2026-09-30', amount: 16.8, payment: '按里程碑付款', deliverable: '燃气管道风险评估报告及管控建议', acceptance: '通过燃气主管部门评审', status: '已验收', signDate: '2026-05-25' },
        { contractId: 'HT-20260006', orgId: 'ORG-20260006', orgName: '上海城市安全研究院', orgCode: '91310000678901234C', projectName: '上海市高空坠物风险排查评估', serviceScope: '高空坠物', servicePeriod: '2026-02-20 ~ 2026-05-20', amount: 13.2, payment: '一次性付款', deliverable: '高空坠物风险排查评估报告', acceptance: '完成现场复核并备案', status: '已验收', signDate: '2026-02-10' },
        { contractId: 'HT-20260007', orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', orgCode: '91310000456789012D', projectName: '上海市城镇自建房安全鉴定', serviceScope: '城镇自建房', servicePeriod: '2026-05-10 ~ 2026-08-10', amount: 24.5, payment: '分期付款', deliverable: '房屋安全鉴定报告', acceptance: '鉴定结论通过主管部门认可', status: '已验收', signDate: '2026-04-30' },
        { contractId: 'HT-20260008', orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', orgCode: '91310000234567890E', projectName: '上海市农村自建房安全评估', serviceScope: '农村自建房', servicePeriod: '2026-03-01 ~ 2026-06-01', amount: 8.8, payment: '一次性付款', deliverable: '农村自建房安全评估报告', acceptance: '评估报告经乡镇备案', status: '已验收', signDate: '2026-02-25' }
    ];

    const performances = [
        { id: 'PERF-001', orgId: 'ORG-20260001', orgName: '上海建科检测技术有限公司', projectName: '上海市建筑工地施工安全风险评估', domain: '建筑工地', serviceType: '安全评估', client: '上海市住建委', serviceTime: '2026-04-01 ~ 2026-06-30', amount: 12.8, conclusion: '优秀', auditStatus: '已通过' },
        { id: 'PERF-002', orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', projectName: '上海市基坑工程安全监测与评价', domain: '基坑', serviceType: '安全监测', client: '上海市交通委', serviceTime: '2026-03-15 ~ 2026-05-15', amount: 9.65, conclusion: '良好', auditStatus: '已通过' },
        { id: 'PERF-003', orgId: 'ORG-20260003', orgName: '上海水利安全研究院', projectName: '上海市交通基础设施安全风险评估', domain: '交通', serviceType: '风险评估', client: '上海市交通局', serviceTime: '2026-05-01 ~ 2026-08-31', amount: 21.0, conclusion: '优秀', auditStatus: '已通过' },
        { id: 'PERF-004', orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', projectName: '上海市玻璃幕墙安全隐患排查', domain: '玻璃幕墙', serviceType: '隐患排查', client: '上海市房管局', serviceTime: '2026-01-10 ~ 2026-03-10', amount: 5.42, conclusion: '良好', auditStatus: '已通过' },
        { id: 'PERF-005', orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', projectName: '上海市燃气管道安全风险评估', domain: '燃气', serviceType: '安全评估', client: '上海市燃气集团', serviceTime: '2026-06-01 ~ 2026-09-30', amount: 16.8, conclusion: '优秀', auditStatus: '已通过' },
        { id: 'PERF-006', orgId: 'ORG-20260006', orgName: '上海城市安全研究院', projectName: '上海市高空坠物风险排查评估', domain: '高空坠物', serviceType: '风险排查', client: '上海市应急管理局', serviceTime: '2026-02-20 ~ 2026-05-20', amount: 13.2, conclusion: '良好', auditStatus: '已通过' },
        { id: 'PERF-007', orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', projectName: '上海市城镇自建房安全鉴定', domain: '城镇自建房', serviceType: '安全鉴定', client: '上海市房管局', serviceTime: '2026-05-10 ~ 2026-08-10', amount: 24.5, conclusion: '优秀', auditStatus: '已通过' },
        { id: 'PERF-008', orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', projectName: '上海市农村自建房安全评估', domain: '农村自建房', serviceType: '安全评估', client: '上海市农业农村委', serviceTime: '2026-03-01 ~ 2026-06-01', amount: 8.8, conclusion: '良好', auditStatus: '已通过' }
    ];

    const experts = [
        { expertId: 'EXP-002', name: '王晓峰', gender: '男', birth: '1980-03-25', orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', domain: '基坑', direction: '基坑监测', industryExpertGroup: '基坑与地下工程专家组', title: '教授级高工', titleOrg: '中国岩石力学学会', titleTime: '2018-09', years: '18', phone: '13800138002', email: 'wangxf@ha.com', address: '上海市静安区', workplace: '上海华安风险评估中心', status: '正常' },
        { expertId: 'EXP-003', name: '张淑芬', gender: '女', birth: '1978-11-08', orgId: 'ORG-20260003', orgName: '上海水利安全研究院', domain: '交通', direction: '桥梁安全', industryExpertGroup: '交通基础设施安全专家组', title: '研究员', titleOrg: '交通运输部', titleTime: '2016-12', years: '12', phone: '13800138003', email: 'zhangsf@sl.com', address: '上海市徐汇区', workplace: '上海水利安全研究院', status: '正常' },
        { expertId: 'EXP-004', name: '陈志强', gender: '男', birth: '1982-07-19', orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', domain: '玻璃幕墙', direction: '消防检测', industryExpertGroup: '消防与应急救援专家组', title: '高级工程师', titleOrg: '上海市消防协会', titleTime: '2019-04', years: '10', phone: '13800138004', email: 'chenzq@ax.com', address: '上海市长宁区', workplace: '上海安信消防技术有限公司', status: '正常' },
        { expertId: 'EXP-005', name: '刘红梅', gender: '女', birth: '1976-05-30', orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', domain: '燃气', direction: '燃气安全', industryExpertGroup: '城镇燃气安全专家组', title: '教授级高工', titleOrg: '中国城市燃气协会', titleTime: '2014-11', years: '20', phone: '13800138005', email: 'liuhm@rq.com', address: '上海市浦东新区', workplace: '上海燃气安全技术服务中心', status: '正常' },
        { expertId: 'EXP-006', name: '赵建国', gender: '男', birth: '1979-09-14', orgId: 'ORG-20260006', orgName: '上海城市安全研究院', domain: '高空坠物', direction: '城市安全', industryExpertGroup: '城市运行安全专家组', title: '高级工程师', titleOrg: '上海市应急管理局', titleTime: '2017-08', years: '14', phone: '13800138006', email: 'zhaojg@cs.com', address: '上海市杨浦区', workplace: '上海城市安全研究院', status: '正常' },
        { expertId: 'EXP-007', name: '孙丽华', gender: '女', birth: '1981-12-03', orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', domain: '城镇自建房', direction: '房屋鉴定', industryExpertGroup: '房屋安全鉴定专家组', title: '研究员', titleOrg: '住建部', titleTime: '2020-01', years: '11', phone: '13800138007', email: 'sunlh@fj.com', address: '上海市虹口区', workplace: '上海房屋安全鉴定中心', status: '正常' },
        { expertId: 'EXP-008', name: '周海涛', gender: '男', birth: '1983-04-22', orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', domain: '农村自建房', direction: '村镇建筑', industryExpertGroup: '村镇建设安全专家组', title: '高级工程师', titleOrg: '上海市住建委', titleTime: '2021-05', years: '9', phone: '13800138008', email: 'zhouht@cz.com', address: '上海市闵行区', workplace: '上海村镇建设安全评估有限公司', status: '正常' },
        { expertId: 'EXP-009', name: '杨秀英', gender: '女', birth: '1972-03-15', orgId: '', orgName: '', domain: '城镇自建房', direction: '结构检测', industryExpertGroup: '房屋安全鉴定专家组', title: '教授级高工', titleOrg: '中国土木工程学会', titleTime: '2010-08', years: '28', phone: '13800138009', email: 'yangxy@example.com', address: '上海市浦东新区', workplace: '上海市', status: '正常', expertType: '独立专家' },
        { expertId: 'EXP-010', name: '黄志强', gender: '男', birth: '1968-07-21', orgId: '', orgName: '', domain: '基坑', direction: '地基处理', industryExpertGroup: '基坑与地下工程专家组', title: '高级工程师', titleOrg: '中国岩石力学与工程学会', titleTime: '2008-05', years: '32', phone: '13800138010', email: 'huangzq@example.com', address: '上海市徐汇区', workplace: '上海市', status: '正常', expertType: '独立专家' },
        { expertId: 'EXP-011', name: '周涛', gender: '男', birth: '1975-11-30', orgId: '', orgName: '', domain: '交通', direction: '道路桥梁', industryExpertGroup: '交通基础设施安全专家组', title: '注册结构师', titleOrg: '住建部执业资格注册中心', titleTime: '2012-09', years: '24', phone: '13800138011', email: 'zhout@example.com', address: '上海市黄浦区', workplace: '上海市', status: '正常', expertType: '独立专家' }
    ];

    const credit = {};
    orgs.forEach(o => {
        const calc = calculateCreditScoreFromDefaults(o, contracts, performances);
        credit[o.orgId] = {
            orgId: o.orgId,
            orgName: o.orgName,
            creditLevel: calc.level,
            score: calc.score,
            dimensions: calc.dimensions,
            history: [],
            changeLog: [{
                time: nowStr(),
                orgId: o.orgId,
                orgName: o.orgName,
                eventName: '初始信用评分',
                eventKey: 'initial_score',
                type: 'neutral',
                scoreDelta: 0,
                dimension: 'base',
                remark: '系统根据机构资质与历史数据初始化信用评分',
                ruleId: '',
                scoreAfter: calc.score,
                levelAfter: calc.level
            }],
            snapshots: [{
                date: nowStr(),
                score: calc.score,
                level: calc.level
            }]
        };
    });

    const auditConfig = {
        mode: 'single',      // 'single' 单级 | 'multi' 多级
        levels: 1,           // 默认单级
        requiredOpinion: true,
        presetPass: ['材料齐全，予以通过', '符合入库条件', '资质有效期符合要求'],
        presetReject: ['材料不完整，请补充', '资质有效期不足，请更新', '经营范围不符合要求', '法人代表信息有误']
    };

    const auditFlow = {};  // key: orgId, value: { currentLevel, history, status } 审核流程状态

    return { orgs, contracts, performances, experts, credit, projectGroups: [], auditConfig, auditFlow, version: 4, creditRules: getDefaultCreditRules().slice(), creditRuleVersion: 1, creditLastCalcTime: '' };
}

function getDefaultExperts() {
    return createDefaultData().experts;
}

function migrateTPData(data) {
    if (!data) data = {};
    if (!data.projectGroups) data.projectGroups = [];
    if (!data.experts) data.experts = [];
    if (!data.orgs) data.orgs = [];
    if (!data.contracts) data.contracts = [];
    if (!data.performances) data.performances = [];
    if (!data.credit) data.credit = {};
    if (!data.creditRules) data.creditRules = getDefaultCreditRules().slice();
    if (!data.creditRuleVersion) data.creditRuleVersion = 1;
    if (!data.auditConfig) {
        data.auditConfig = {
            mode: 'single',
            levels: 1,
            requiredOpinion: true,
            presetPass: ['材料齐全，予以通过', '符合入库条件', '资质有效期符合要求'],
            presetReject: ['材料不完整，请补充', '资质有效期不足，请更新', '经营范围不符合要求', '法人代表信息有误']
        };
    }
    if (!data.auditFlow) data.auditFlow = {};
    if (data.version !== 4) {
        // 当 experts 为空或只有名字缺失/不规范的数据时，用默认数据重新填充
        var defaults = createDefaultData().experts;
        if (!data.experts.length || data.experts.every(function(e) { return !e.name || !e.expertId; })) {
            data.experts = defaults.slice();
        } else {
            defaults.forEach(function(e) {
                var exists = data.experts.some(function(x) { return x.expertId === e.expertId; });
                if (!exists) data.experts.push(e);
            });
        }
        migrateCreditSnapshots();
        data.version = 4;
        saveTPData(data);
    }
    if (!data.orgApplications) data.orgApplications = [];
    return data;
}

function getTPData() {
    const raw = localStorage.getItem(TP_STORAGE_KEY);
    if (!raw) {
        const data = createDefaultData();
        localStorage.setItem(TP_STORAGE_KEY, JSON.stringify(data));
        return data;
    }
    try {
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            const data = createDefaultData();
            localStorage.setItem(TP_STORAGE_KEY, JSON.stringify(data));
            return data;
        }
        // 仅当核心结构完全缺失时补充默认数据，避免覆盖已有的在线申请等用户数据
        if (!parsed.experts || parsed.experts.length === 0) {
            const defaults = createDefaultData();
            parsed.experts = defaults.experts;
            if (!parsed.orgs) parsed.orgs = defaults.orgs;
            if (!parsed.contracts) parsed.contracts = defaults.contracts;
            if (!parsed.performances) parsed.performances = defaults.performances;
            if (!parsed.credit) parsed.credit = defaults.credit;
            if (!parsed.auditConfig) parsed.auditConfig = defaults.auditConfig;
            if (!parsed.auditFlow) parsed.auditFlow = defaults.auditFlow;
            if (!Array.isArray(parsed.orgApplications)) parsed.orgApplications = [];
            if (!parsed.creditRules) parsed.creditRules = defaults.creditRules;
            if (!parsed.creditRuleVersion) parsed.creditRuleVersion = defaults.creditRuleVersion;
            parsed.version = 4;
            saveTPData(parsed);
        }
        return migrateTPData(parsed);
    } catch (e) {
        const data = createDefaultData();
        localStorage.setItem(TP_STORAGE_KEY, JSON.stringify(data));
        return data;
    }
}

function saveTPData(data) {
    localStorage.setItem(TP_STORAGE_KEY, JSON.stringify(data));
}

// ---------- 查询工具函数 ----------
function getAllOrgs() { return getTPData().orgs; }
function getOrgById(orgId) { return getAllOrgs().find(o => o.orgId === orgId); }
function getOrgByName(orgName) { return getAllOrgs().find(o => o.orgName === orgName); }
function getOrgByCode(orgCode) { return getAllOrgs().find(o => o.orgCode === orgCode); }

function getContractsByOrg(orgId) { return getTPData().contracts.filter(c => c.orgId === orgId); }
function getAllContracts() { return getTPData().contracts; }
function getContractById(contractId) { return getAllContracts().find(c => c.contractId === contractId); }

function getPerformancesByOrg(orgId) { return getTPData().performances.filter(p => p.orgId === orgId); }
function getAllPerformances() { return getTPData().performances; }
function getPerformanceById(id) { return getAllPerformances().find(p => p.id === id); }

function getExpertsByOrg(orgId) { return getTPData().experts.filter(e => e.orgId === orgId); }
function getAllExperts() { return getTPData().experts; }
function getExpertById(expertId) { return getAllExperts().find(e => e.expertId === expertId); }
function getExpertByName(name) { return getAllExperts().find(e => e.name === name); }

function getCreditByOrg(orgId) { return (getTPData().credit || {})[orgId]; }

// ---------- 审核配置与流程 ----------
function getTPAuditConfig() {
    var data = getTPData();
    if (!data.auditConfig) {
        data.auditConfig = {
            mode: 'single',
            levels: 1,
            requiredOpinion: true,
            presetPass: ['材料齐全，予以通过', '符合入库条件', '资质有效期符合要求'],
            presetReject: ['材料不完整，请补充', '资质有效期不足，请更新', '经营范围不符合要求', '法人代表信息有误']
        };
        saveTPData(data);
    }
    return data.auditConfig;
}

function saveTPAuditConfig(config) {
    var data = getTPData();
    data.auditConfig = config;
    saveTPData(data);
}

function getTPAuditFlow(orgId) {
    var data = getTPData();
    if (!data.auditFlow) data.auditFlow = {};
    if (!data.auditFlow[orgId]) {
        data.auditFlow[orgId] = { currentLevel: 0, status: 'pending', history: [] };
        saveTPData(data);
    }
    return data.auditFlow[orgId];
}

function saveTPAuditFlow(orgId, flow) {
    var data = getTPData();
    if (!data.auditFlow) data.auditFlow = {};
    data.auditFlow[orgId] = flow;
    saveTPData(data);
}

function resetTPAuditFlow(orgId) {
    var data = getTPData();
    if (!data.auditFlow) data.auditFlow = {};
    data.auditFlow[orgId] = { currentLevel: 0, status: 'pending', history: [] };
    saveTPData(data);
}

// ---------- 机构在线申请 ----------
function getAllOrgApplications() { return (getTPData().orgApplications || []).slice(); }
function getOrgApplicationById(applicationId) { return getAllOrgApplications().find(a => a.applicationId === applicationId); }
function getOrgApplicationByCode(creditCode) { return getAllOrgApplications().find(a => a.basic && a.basic.creditCode === creditCode); }
function getOrgApplicationsByName(orgName) {
    var n = (orgName || '').toLowerCase();
    return getAllOrgApplications().filter(a => a.basic && (a.basic.enterpriseName || '').toLowerCase().indexOf(n) !== -1);
}
function queryOrgApplicationProgress(query) {
    var name = (query && query.orgName || '').trim().toLowerCase();
    var code = (query && query.orgCode || '').trim().toLowerCase();
    var apps = getAllOrgApplications();
    return apps.filter(function(a) {
        var basic = a.basic || {};
        var matchName = name && (basic.enterpriseName || '').toLowerCase().indexOf(name) !== -1;
        var matchCode = code && (basic.creditCode || '').toLowerCase() === code;
        return name && code ? (matchName && matchCode) : (matchName || matchCode);
    });
}
function queryOrgApplicationProgress(query) {
    var name = (query && query.orgName || '').trim().toLowerCase();
    var code = (query && query.orgCode || '').trim().toLowerCase();
    var apps = getAllOrgApplications();
    return apps.filter(function(a) {
        var basic = a.basic || {};
        var matchName = name && (basic.enterpriseName || '').toLowerCase().indexOf(name) !== -1;
        var matchCode = code && (basic.creditCode || '').toLowerCase() === code;
        return name && code ? (matchName && matchCode) : (matchName || matchCode);
    });
}
function submitOrgApplication(application) {
    const data = getTPData();
    if (!data.orgApplications) data.orgApplications = [];
    const basic = application.basic || {};
    const creditCode = basic.creditCode || '';
    if (creditCode) {
        const exists = data.orgApplications.some(a => a.basic && a.basic.creditCode === creditCode && a.status !== '已驳回');
        if (exists) throw new Error('该统一社会信用代码已有正在审核或已通过的申请，请勿重复提交。');
    }
    application.applicationId = application.applicationId || ('TPA-' + Date.now() + '-' + Math.floor(Math.random() * 900 + 100));
    application.status = application.status || '待审核';
    application.submitTime = application.submitTime || nowStr();
    if (!application.auditHistory) application.auditHistory = [];
    if (!application.flowState) {
        const config = getTPAuditConfig();
        application.flowState = {
            mode: config.mode || 'single',
            levels: parseInt(config.levels || 1, 10),
            currentLevel: 0,
            status: 'pending'
        };
    }
    data.orgApplications.push(application);
    saveTPData(data);
    return application;
}
function updateOrgApplication(application) {
    const data = getTPData();
    if (!data.orgApplications) data.orgApplications = [];
    const idx = data.orgApplications.findIndex(a => a.applicationId === application.applicationId);
    if (idx >= 0) data.orgApplications[idx] = application;
    else data.orgApplications.push(application);
    saveTPData(data);
    return application;
}
function approveOrgApplication(applicationId, level, operator, opinion) {
    return auditOrgApplication(applicationId, level, operator, opinion, 'pass');
}
function rejectOrgApplication(applicationId, level, operator, opinion) {
    return auditOrgApplication(applicationId, level, operator, opinion, 'reject');
}
function auditOrgApplication(applicationId, level, operator, opinion, decision) {
    var app = getOrgApplicationById(applicationId);
    if (!app) return null;
    if (!app.auditHistory) app.auditHistory = [];
    if (!app.flowState) app.flowState = { mode: 'single', levels: 1, currentLevel: 0, status: 'pending' };
    const lv = parseInt(level || 1, 10);
    const cfg = getTPAuditConfig();
    const maxLevel = parseInt(cfg.levels || 1, 10);
    app.auditHistory.push({ level: lv, decision: decision, operator: operator, opinion: opinion, time: nowStr() });
    app.flowState.currentLevel = lv;
    if (decision === 'reject') {
        app.status = '已驳回';
        app.flowState.status = 'rejected';
    } else if (decision === 'pass') {
        if (lv >= maxLevel) {
            app.status = '已通过';
            app.flowState.status = 'approved';
            app.approveTime = nowStr();
            promoteApplicationToOrg(app);
        } else {
            app.status = '审核中';
            app.flowState.status = 'auditing';
        }
    }
    updateOrgApplication(app);
    return app;
}
function promoteApplicationToOrg(app) {
    if (!app || !app.basic) return;
    const basic = app.basic;
    const data = getTPData();
    const existing = data.orgs.find(o => o.orgCode === basic.creditCode);
    if (existing) return existing;
    const orgId = 'ORG-' + (data.orgs.length + 1).toString().padStart(5, '0');
    const newOrg = {
        orgId: orgId,
        orgName: basic.enterpriseName || '',
        orgCode: basic.creditCode || '',
        legalPerson: basic.legalName || app.legal && app.legal.legalName || '',
        phone: basic.phone || (app.legal && app.legal.phone) || '',
        region: basic.address || basic.serviceArea || '',
        field: basic.field || basic.businessScope || '',
        orgType: basic.orgType || '服务机构',
        qual: (app.qualifications && app.qualifications[0] && app.qualifications[0].level) || '乙级',
        status: '正常',
        creditLevel: 'A',
        score: 75,
        established: basic.establishDate || ''
    };
    data.orgs.push(newOrg);
    saveTPData(data);
    return newOrg;
}

// ---------- 项目组 ----------
function getAllProjectGroups() { return (getTPData().projectGroups || []).slice(); }
function getProjectGroupById(projectId) { return getAllProjectGroups().find(p => p.projectId === projectId); }
function updateProjectGroup(project) {
    const data = getTPData();
    if (!data.projectGroups) data.projectGroups = [];
    const idx = data.projectGroups.findIndex(p => p.projectId === project.projectId);
    if (idx >= 0) data.projectGroups[idx] = project;
    else data.projectGroups.push(project);
    saveTPData(data);
    return project;
}
function deleteProjectGroup(projectId) {
    const data = getTPData();
    if (!data.projectGroups) data.projectGroups = [];
    data.projectGroups = data.projectGroups.filter(p => p.projectId !== projectId);
    saveTPData(data);
}
function createProjectGroup(init) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    const projectId = init.projectId || ('PG-' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '-' + String(Math.floor(Math.random() * 9000) + 1000));
    return updateProjectGroup(Object.assign({
        projectId: projectId,
        projectName: '',
        orgId: '',
        orgName: '',
        orgCode: '',
        experts: [],
        status: '待组建',
        createdAt: dateStr,
        contractId: '',
        performanceId: '',
        remark: ''
    }, init));
}
function getProjectGroupsByOrg(orgId) {
    return getAllProjectGroups().filter(p => p.orgId === orgId);
}
function getProjectGroupsByContract(contractId) {
    return getAllProjectGroups().filter(p => p.contractId === contractId);
}
// ---------- URL 参数工具 ----------
function getTPQueryParams() {
    const params = new URLSearchParams(location.search);
    return {
        orgId: params.get('orgId') || '',
        orgName: params.get('orgName') || '',
        orgCode: params.get('orgCode') || '',
        expertId: params.get('expertId') || '',
        contractId: params.get('contractId') || '',
        performanceId: params.get('performanceId') || '',
        projectId: params.get('projectId') || ''
    };
}

function getTPUrlParam(key) {
    return new URLSearchParams(location.search).get(key) || '';
}

// ---------- 跳转函数 ----------
function goToTPOrg(orgId) {
    const org = getOrgById(orgId);
    if (!org) return;
    location.href = 'tp-warehouse.html?orgId=' + encodeURIComponent(orgId)
        + '&orgName=' + encodeURIComponent(org.orgName)
        + '&orgCode=' + encodeURIComponent(org.orgCode || '');
}
function goToTPContract(orgId) {
    const org = getOrgById(orgId);
    if (!org) return;
    location.href = 'tp-contract.html?orgId=' + encodeURIComponent(org.orgId)
        + '&orgName=' + encodeURIComponent(org.orgName)
        + '&orgCode=' + encodeURIComponent(org.orgCode || '');
}
function goToTPPerformance(orgId) {
    const org = getOrgById(orgId);
    if (!org) return;
    location.href = 'tp-performance.html?orgId=' + encodeURIComponent(org.orgId)
        + '&orgName=' + encodeURIComponent(org.orgName)
        + '&orgCode=' + encodeURIComponent(org.orgCode || '');
}
function goToTPCredit(orgId) {
    const org = getOrgById(orgId);
    if (!org) return;
    location.href = 'tp-credit.html?orgId=' + encodeURIComponent(org.orgId)
        + '&orgName=' + encodeURIComponent(org.orgName)
        + '&orgCode=' + encodeURIComponent(org.orgCode || '');
}
function goToTPOverview() {
    location.href = 'tp-overview.html';
}
function goToTPExpert(orgId) {
    location.href = 'tp-expert.html?orgId=' + encodeURIComponent(orgId || '');
}
function goToTPOrgStats(orgId) {
    location.href = 'tp-org-stats.html?orgId=' + encodeURIComponent(orgId || '');
}
function goToTPExpertWorkload(expertId) {
    const expert = getExpertById(expertId);
    location.href = 'tp-expert-workload.html?expertId=' + encodeURIComponent(expertId || '')
        + '&name=' + encodeURIComponent(expert ? expert.name : '');
}
function goToTPExpertSelect(projectId) {
    location.href = 'tp-expert-select.html?projectId=' + encodeURIComponent(projectId || '');
}
function goToTPProject(projectId) {
    location.href = 'tp-expert-select.html?projectId=' + encodeURIComponent(projectId || '');
}

// ---------- 数据更新（增删改） ----------
function updateOrg(org) {
    const data = getTPData();
    const idx = data.orgs.findIndex(o => o.orgId === org.orgId);
    if (idx >= 0) data.orgs[idx] = org;
    else data.orgs.push(org);
    saveTPData(data);
}

function updateContract(contract) {
    const data = getTPData();
    const idx = data.contracts.findIndex(c => c.contractId === contract.contractId);
    if (idx >= 0) data.contracts[idx] = contract;
    else data.contracts.push(contract);
    saveTPData(data);
}

function updatePerformance(performance) {
    const data = getTPData();
    const idx = data.performances.findIndex(p => p.id === performance.id);
    if (idx >= 0) data.performances[idx] = performance;
    else data.performances.push(performance);
    saveTPData(data);
}

function updateExpert(expert) {
    const data = getTPData();
    const idx = data.experts.findIndex(e => e.expertId === expert.expertId);
    if (idx >= 0) data.experts[idx] = expert;
    else data.experts.push(expert);
    saveTPData(data);
}

function updateCredit(creditRecord) {
    const data = getTPData();
    if (!data.credit) data.credit = {};
    data.credit[creditRecord.orgId] = creditRecord;
    saveTPData(data);
}

// ---------- 信用分自动计算（多维度规则） ----------
function calculateCreditScore(orgId) {
    const org = getOrgById(orgId);
    if (!org) return { score: 0, level: 'C', dimensions: {} };
    const contracts = getContractsByOrg(orgId);
    const performances = getPerformancesByOrg(orgId);
    const creditRecord = getCreditByOrg(orgId) || { history: [] };
    const ruleConfig = getCreditRuleConfig();
    return applyCreditRules(calculateCreditScoreFromDefaults(org, contracts, performances, creditRecord), creditRecord, ruleConfig);
}

function calculateCreditScoreFromDefaults(org, contracts, performances, creditRecord) {
    if (!org) return { score: 0, level: 'C', dimensions: {} };
    contracts = contracts || [];
    performances = performances || [];
    creditRecord = creditRecord || { history: [] };

    // 基础信用：资质与信息完整性（基于机构主数据）
    const baseCredit = org.qual === '甲级' ? 95 : (org.qual === '乙级' ? 88 : 80);

    // 履约信用：合同履约率 + 交付及时率
    const totalContract = contracts.length || 1;
    const finished = contracts.filter(c => c.status === '已验收').length;
    const fulfillRate = finished / totalContract;
    const onTimeRate = fulfillRate; // 简化：已验收视为按时
    const performanceCredit = Math.round((fulfillRate * 0.5 + onTimeRate * 0.5) * 100);

    // 质量信用：报告/业绩合格率、验收通过率
    const totalPerf = performances.length || 1;
    const passed = performances.filter(p => p.auditStatus === '已通过').length;
    const excellent = performances.filter(p => p.conclusion === '优秀').length;
    const good = performances.filter(p => p.conclusion === '良好').length;
    const qualityRate = passed / totalPerf;
    const excellentRate = (excellent + good * 0.8) / totalPerf;
    const qualityCredit = Math.round((qualityRate * 0.6 + excellentRate * 0.4) * 100);

    // 行为信用：基于历史事件扣分，默认满分
    const behaviorPenalty = creditRecord.history
        .filter(h => h.type === 'negative')
        .reduce((sum, h) => sum + Math.abs(h.scoreDelta || 0), 0);
    const behaviorCredit = Math.max(0, 100 - behaviorPenalty);

    // 客户评价：满意度评分（简化：基于业绩结论）
    const satisfactionCredit = Math.round(excellentRate * 100);

    // 加权总分：基础25% + 履约25% + 质量25% + 行为15% + 客户10%
    const totalScore = Math.round(
        baseCredit * 0.25 +
        performanceCredit * 0.25 +
        qualityCredit * 0.25 +
        behaviorCredit * 0.15 +
        satisfactionCredit * 0.10
    );

    let level = 'C';
    if (totalScore >= 90) level = 'AAA';
    else if (totalScore >= 85) level = 'AA';
    else if (totalScore >= 80) level = 'A';
    else if (totalScore >= 70) level = 'BBB';
    else if (totalScore >= 60) level = 'BB';
    else level = 'C';

    return {
        score: totalScore,
        level: level,
        dimensions: {
            base: baseCredit,
            performance: performanceCredit,
            quality: qualityCredit,
            behavior: behaviorCredit,
            satisfaction: satisfactionCredit
        }
    };
}

// ---------- 信用规则引擎 ----------
const DEFAULT_CREDIT_RULES = [
    { ruleId: 'RULE-001', version: 1, name: '按时交付报告', eventKey: 'on_time_delivery', dimension: 'performance', type: 'positive', scoreDelta: 0.5, degradeLevel: false, degradeTo: '', enabled: true, description: '机构按合同期限按时交付报告，加 0.5 分' },
    { ruleId: 'RULE-002', version: 1, name: '客户投诉核实', eventKey: 'customer_complaint', dimension: 'satisfaction', type: 'negative', scoreDelta: -2, degradeLevel: false, degradeTo: '', enabled: true, description: '经核实的客户投诉，扣 2 分' },
    { ruleId: 'RULE-003', version: 1, name: '行政处罚', eventKey: 'admin_penalty', dimension: 'behavior', type: 'negative', scoreDelta: -5, degradeLevel: true, degradeTo: '', enabled: true, description: '受到行政处罚，扣 5 分并强制降级一档' },
    { ruleId: 'RULE-004', version: 1, name: '报告质量优良', eventKey: 'quality_excellent', dimension: 'quality', type: 'positive', scoreDelta: 1, degradeLevel: false, degradeTo: '', enabled: true, description: '报告获评优良，加 1 分' },
    { ruleId: 'RULE-005', version: 1, name: '合同履约逾期', eventKey: 'delivery_overdue', dimension: 'performance', type: 'negative', scoreDelta: -1, degradeLevel: false, degradeTo: '', enabled: true, description: '未按合同期限交付，扣 1 分' }
];

const LEVEL_ORDER = ['AAA', 'AA', 'A', 'BBB', 'BB', 'C'];

function nowStr() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
}

function todayStr() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
}

function getCreditRuleConfig() {
    const data = getTPData();
    return {
        rules: data.creditRules ? data.creditRules.slice() : DEFAULT_CREDIT_RULES.slice(),
        version: data.creditRuleVersion || 1,
        lastCalcTime: data.creditLastCalcTime || ''
    };
}

function saveCreditRuleConfig(config) {
    const data = getTPData();
    data.creditRules = (config.rules || []).slice();
    data.creditRuleVersion = config.version || 1;
    data.creditLastCalcTime = config.lastCalcTime || '';
    saveTPData(data);
}

function getDefaultCreditRules() {
    return DEFAULT_CREDIT_RULES.slice();
}

function getCreditRules() {
    return getCreditRuleConfig().rules;
}

function setCreditRules(rules) {
    const config = getCreditRuleConfig();
    config.rules = (rules || []).slice();
    config.version = (config.version || 0) + 1;
    saveCreditRuleConfig(config);
}

function addCreditRule(rule) {
    if (!rule || !rule.ruleId) return false;
    const config = getCreditRuleConfig();
    const idx = config.rules.findIndex(r => r.ruleId === rule.ruleId);
    if (idx >= 0) config.rules[idx] = rule;
    else config.rules.push(rule);
    config.version += 1;
    saveCreditRuleConfig(config);
    return true;
}

function deleteCreditRule(ruleId) {
    const config = getCreditRuleConfig();
    config.rules = config.rules.filter(r => r.ruleId !== ruleId);
    config.version += 1;
    saveCreditRuleConfig(config);
}

function matchCreditRule(eventKey) {
    if (!eventKey) return null;
    const rules = getCreditRules();
    return rules.find(r => r.enabled && r.eventKey === eventKey) || null;
}

function applyCreditRules(calc, creditRecord, ruleConfig) {
    if (!calc) return calc;
    creditRecord = creditRecord || { history: [] };
    ruleConfig = ruleConfig || getCreditRuleConfig();
    const rules = (ruleConfig.rules || []).filter(r => r.enabled);
    let totalDelta = 0;
    let forcedDegrade = null;
    let maxForcedDegradeIndex = -1;

    creditRecord.history.forEach(h => {
        if (!h.eventKey) return;
        const rule = rules.find(r => r.eventKey === h.eventKey);
        if (rule) {
            totalDelta += (rule.scoreDelta || 0);
            if (rule.degradeLevel) {
                const targetIndex = rule.degradeTo ? LEVEL_ORDER.indexOf(rule.degradeTo) : -1;
                if (targetIndex >= 0 && targetIndex > maxForcedDegradeIndex) {
                    maxForcedDegradeIndex = targetIndex;
                    forcedDegrade = rule.degradeTo;
                } else if (!rule.degradeTo) {
                    const currentIndex = LEVEL_ORDER.indexOf(calc.level);
                    const nextIndex = Math.min(LEVEL_ORDER.length - 1, (currentIndex >= 0 ? currentIndex : 0) + 1);
                    if (nextIndex > maxForcedDegradeIndex) {
                        maxForcedDegradeIndex = nextIndex;
                        forcedDegrade = LEVEL_ORDER[nextIndex];
                    }
                }
            }
        }
    });

    let finalScore = Math.max(0, Math.min(100, calc.score + totalDelta));
    let finalLevel = calc.level;
    if (forcedDegrade) {
        finalLevel = forcedDegrade;
    } else {
        if (finalScore >= 90) finalLevel = 'AAA';
        else if (finalScore >= 85) finalLevel = 'AA';
        else if (finalScore >= 80) finalLevel = 'A';
        else if (finalScore >= 70) finalLevel = 'BBB';
        else if (finalScore >= 60) finalLevel = 'BB';
        else finalLevel = 'C';
    }

    return {
        score: Math.round(finalScore),
        level: finalLevel,
        dimensions: calc.dimensions
    };
}

function runDailyCreditCalc() {
    const config = getCreditRuleConfig();
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
    if (config.lastCalcTime === today) return;

    getAllOrgs().forEach(o => syncCredit(o.orgId));
    config.lastCalcTime = today;
    saveCreditRuleConfig(config);
}

function syncCredit(orgId, opts) {
    opts = opts || {};
    const org = getOrgById(orgId);
    if (!org) return;
    const calc = calculateCreditScore(orgId);
    const data = getTPData();
    if (!data.credit) data.credit = {};

    var existing = data.credit[orgId] || {};
    const prevScore = existing.score != null ? existing.score : calc.score;
    const prevLevel = existing.creditLevel || calc.level;
    const changed = prevScore !== calc.score || prevLevel !== calc.level || opts.forceSnapshot === true;

    data.credit[orgId] = {
        orgId: orgId,
        orgName: org.orgName,
        creditLevel: calc.level,
        score: calc.score,
        dimensions: calc.dimensions,
        history: existing.history || [],
        changeLog: existing.changeLog || [],
        snapshots: existing.snapshots || []
    };
    if (changed) {
        const logEntry = {
            time: nowStr(),
            orgId: orgId,
            orgName: org.orgName,
            eventName: '信用分重新计算',
            eventKey: 'credit_recalc',
            type: 'neutral',
            scoreDelta: calc.score - prevScore,
            dimension: 'base',
            remark: '规则或基础数据变化触发信用分重算',
            ruleId: '',
            scoreAfter: calc.score,
            levelAfter: calc.level
        };
        if (!data.credit[orgId].changeLog) data.credit[orgId].changeLog = [];
        data.credit[orgId].changeLog.unshift(logEntry);
        addCreditSnapshot(orgId, calc.score, calc.level, { skipSave: true });
    }
    // 同步回机构主数据
    const idx = data.orgs.findIndex(o => o.orgId === orgId);
    if (idx >= 0) {
        data.orgs[idx].creditLevel = calc.level;
        data.orgs[idx].score = calc.score;
    }
    saveTPData(data);
}

// 记录信用事件（positive/negative），并重新计算信用
function recordCreditEvent(orgId, event) {
    const org = getOrgById(orgId);
    if (!org || !event) return;
    const data = getTPData();
    if (!data.credit) data.credit = {};
    if (!data.credit[orgId]) data.credit[orgId] = { orgId, orgName: org.orgName, history: [], changeLog: [], snapshots: [] };
    if (!data.credit[orgId].history) data.credit[orgId].history = [];
    if (!data.credit[orgId].changeLog) data.credit[orgId].changeLog = [];
    if (!data.credit[orgId].snapshots) data.credit[orgId].snapshots = [];

    const eventTime = event.time || nowStr();
    const datePart = eventTime.split(' ')[0] || todayStr();

    data.credit[orgId].history.unshift({
        time: eventTime,
        orgId: orgId,
        orgName: org.orgName,
        eventName: event.eventName || '信用事件',
        eventKey: event.eventKey || '',
        type: event.type || 'neutral',
        scoreDelta: event.scoreDelta || 0,
        dimension: event.dimension || '',
        remark: event.remark || ''
    });

    saveTPData(data);
    syncCredit(orgId);

    const afterData = getTPData();
    const record = afterData.credit[orgId];
    const scoreAfter = record.score;
    const levelAfter = record.creditLevel;
    const ruleId = event.ruleId || (matchCreditRule(event.eventKey) || {}).ruleId || '';

    record.changeLog.unshift({
        time: eventTime,
        orgId: orgId,
        orgName: org.orgName,
        eventName: event.eventName || '信用事件',
        eventKey: event.eventKey || '',
        type: event.type || 'neutral',
        scoreDelta: event.scoreDelta || 0,
        dimension: event.dimension || '',
        remark: event.remark || '',
        ruleId: ruleId,
        scoreAfter: scoreAfter,
        levelAfter: levelAfter
    });

    saveTPData(afterData);
    addCreditSnapshot(orgId, scoreAfter, levelAfter, { skipSave: false });
}

function addCreditSnapshot(orgId, score, level, opts) {
    opts = opts || {};
    const data = getTPData();
    if (!data.credit) data.credit = {};
    if (!data.credit[orgId]) data.credit[orgId] = { orgId, orgName: (getOrgById(orgId) || {}).orgName, history: [], changeLog: [], snapshots: [] };
    if (!data.credit[orgId].snapshots) data.credit[orgId].snapshots = [];
    const dateStr = todayStr();
    const arr = data.credit[orgId].snapshots;
    const last = arr.length ? arr[arr.length - 1] : null;
    if (!last || last.date !== dateStr || last.score !== score || last.level !== level) {
        arr.push({ date: dateStr, score: score, level: level });
    }
    if (!opts.skipSave) saveTPData(data);
}

function getCreditSnapshots(orgId) {
    const record = getCreditByOrg(orgId) || {};
    return (record.snapshots || []).slice();
}

function getCreditChangeLog(orgId, options) {
    options = options || {};
    const record = getCreditByOrg(orgId) || {};
    let logs = (record.changeLog || []).slice();
    if (options.eventKey) logs = logs.filter(l => l.eventKey === options.eventKey);
    if (options.dimension) logs = logs.filter(l => l.dimension === options.dimension);
    if (options.type) logs = logs.filter(l => l.type === options.type);
    if (options.from || options.to) {
        const from = options.from ? new Date(options.from) : null;
        const to = options.to ? new Date(options.to) : null;
        logs = logs.filter(l => {
            const t = new Date(l.time);
            if (from && t < from) return false;
            if (to && t > to) return false;
            return true;
        });
    }
    if (options.limit) logs = logs.slice(0, options.limit);
    return logs;
}

function clearCreditHistory(orgId) {
    const data = getTPData();
    if (!data.credit || !data.credit[orgId]) return;
    data.credit[orgId].history = [];
    data.credit[orgId].changeLog = [];
    data.credit[orgId].snapshots = [];
    saveTPData(data);
}

function ensureCreditSnapshots(orgId) {
    const record = getCreditByOrg(orgId) || {};
    if (!record.snapshots || !record.snapshots.length) {
        addCreditSnapshot(orgId, record.score, record.creditLevel);
    }
}

function migrateCreditSnapshots() {
    const data = getTPData();
    if (!data.credit) return;
    Object.keys(data.credit).forEach(orgId => {
        const record = data.credit[orgId];
        if (!record.snapshots) record.snapshots = [];
        if (!record.changeLog) record.changeLog = [];
        if (!record.snapshots.length && record.score != null) {
            record.snapshots.push({ date: todayStr(), score: record.score, level: record.creditLevel });
        }
    });
    saveTPData(data);
}

function runDailyCreditCalc() {
    const config = getCreditRuleConfig();
    const today = todayStr();
    if (config.lastCalcTime === today) return;

    getAllOrgs().forEach(o => syncCredit(o.orgId, { forceSnapshot: true }));
    config.lastCalcTime = today;
    saveCreditRuleConfig(config);
}

function syncAllCredit() {
    runDailyCreditCalc();
    getAllOrgs().forEach(o => syncCredit(o.orgId));
}
