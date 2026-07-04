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
        { contractId: 'HT-20260001', orgId: 'ORG-20260001', orgName: '上海建科检测技术有限公司', orgCode: '91310000123456789X', projectName: '上海市建筑工地施工安全风险评估', serviceScope: '建筑工地', servicePeriod: '2026-04-01 ~ 2026-06-30', amount: 12.8, payment: '分期付款', deliverable: '施工安全风险评估报告、风险清单及管控建议', acceptance: '报告通过专家评审并提交主管部门备案', status: '执行中', signDate: '2026-03-15' },
        { contractId: 'HT-20260002', orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', orgCode: '91310000876543210Y', projectName: '上海市基坑工程安全监测与评价', serviceScope: '基坑', servicePeriod: '2026-03-15 ~ 2026-05-15', amount: 9.65, payment: '一次性付款', deliverable: '基坑监测报告及安全评价意见', acceptance: '通过专家组评审', status: '已验收', signDate: '2026-03-01' },
        { contractId: 'HT-20260003', orgId: 'ORG-20260003', orgName: '上海水利安全研究院', orgCode: '91310000567890123Z', projectName: '上海市交通基础设施安全风险评估', serviceScope: '交通', servicePeriod: '2026-05-01 ~ 2026-08-31', amount: 21.0, payment: '按里程碑付款', deliverable: '交通基础设施风险评估报告', acceptance: '提交主管部门并通过审核', status: '执行中', signDate: '2026-04-20' },
        { contractId: 'HT-20260004', orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', orgCode: '91310000345678901A', projectName: '上海市玻璃幕墙安全隐患排查', serviceScope: '玻璃幕墙', servicePeriod: '2026-01-10 ~ 2026-03-10', amount: 5.42, payment: '分期付款', deliverable: '玻璃幕墙安全隐患排查报告', acceptance: '隐患整改闭环后验收', status: '已验收', signDate: '2026-01-05' },
        { contractId: 'HT-20260005', orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', orgCode: '91310000987654321B', projectName: '上海市燃气管道安全风险评估', serviceScope: '燃气', servicePeriod: '2026-06-01 ~ 2026-09-30', amount: 16.8, payment: '按里程碑付款', deliverable: '燃气管道风险评估报告及管控建议', acceptance: '通过燃气主管部门评审', status: '执行中', signDate: '2026-05-25' },
        { contractId: 'HT-20260006', orgId: 'ORG-20260006', orgName: '上海城市安全研究院', orgCode: '91310000678901234C', projectName: '上海市高空坠物风险排查评估', serviceScope: '高空坠物', servicePeriod: '2026-02-20 ~ 2026-05-20', amount: 13.2, payment: '一次性付款', deliverable: '高空坠物风险排查评估报告', acceptance: '完成现场复核并备案', status: '已验收', signDate: '2026-02-10' },
        { contractId: 'HT-20260007', orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', orgCode: '91310000456789012D', projectName: '上海市城镇自建房安全鉴定', serviceScope: '城镇自建房', servicePeriod: '2026-05-10 ~ 2026-08-10', amount: 24.5, payment: '分期付款', deliverable: '房屋安全鉴定报告', acceptance: '鉴定结论通过主管部门认可', status: '执行中', signDate: '2026-04-30' },
        { contractId: 'HT-20260008', orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', orgCode: '91310000234567890E', projectName: '上海市农村自建房安全评估', serviceScope: '农村自建房', servicePeriod: '2026-03-01 ~ 2026-06-01', amount: 8.8, payment: '一次性付款', deliverable: '农村自建房安全评估报告', acceptance: '评估报告经乡镇备案', status: '已验收', signDate: '2026-02-25' }
    ];

    const performances = [
        { id: 'PERF-001', orgId: 'ORG-20260001', orgName: '上海建科检测技术有限公司', projectName: '上海市建筑工地施工安全风险评估', domain: '建筑工地', serviceType: '安全评估', client: '上海市住建委', serviceTime: '2026-04-01 ~ 2026-06-30', amount: 12.8, conclusion: '优秀', auditStatus: '已通过' },
        { id: 'PERF-002', orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', projectName: '上海市基坑工程安全监测与评价', domain: '基坑', serviceType: '安全监测', client: '上海市交通委', serviceTime: '2026-03-15 ~ 2026-05-15', amount: 9.65, conclusion: '良好', auditStatus: '已通过' },
        { id: 'PERF-003', orgId: 'ORG-20260003', orgName: '上海水利安全研究院', projectName: '上海市交通基础设施安全风险评估', domain: '交通', serviceType: '风险评估', client: '上海市交通局', serviceTime: '2026-05-01 ~ 2026-08-31', amount: 21.0, conclusion: '优秀', auditStatus: '审核中' },
        { id: 'PERF-004', orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', projectName: '上海市玻璃幕墙安全隐患排查', domain: '玻璃幕墙', serviceType: '隐患排查', client: '上海市房管局', serviceTime: '2026-01-10 ~ 2026-03-10', amount: 5.42, conclusion: '合格', auditStatus: '已通过' },
        { id: 'PERF-005', orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', projectName: '上海市燃气管道安全风险评估', domain: '燃气', serviceType: '安全评估', client: '上海市燃气集团', serviceTime: '2026-06-01 ~ 2026-09-30', amount: 16.8, conclusion: '优秀', auditStatus: '已通过' },
        { id: 'PERF-006', orgId: 'ORG-20260006', orgName: '上海城市安全研究院', projectName: '上海市高空坠物风险排查评估', domain: '高空坠物', serviceType: '风险排查', client: '上海市应急管理局', serviceTime: '2026-02-20 ~ 2026-05-20', amount: 13.2, conclusion: '良好', auditStatus: '已通过' },
        { id: 'PERF-007', orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', projectName: '上海市城镇自建房安全鉴定', domain: '城镇自建房', serviceType: '安全鉴定', client: '上海市房管局', serviceTime: '2026-05-10 ~ 2026-08-10', amount: 24.5, conclusion: '优秀', auditStatus: '审核中' },
        { id: 'PERF-008', orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', projectName: '上海市农村自建房安全评估', domain: '农村自建房', serviceType: '安全评估', client: '上海市农业农村委', serviceTime: '2026-03-01 ~ 2026-06-01', amount: 8.8, conclusion: '合格', auditStatus: '已通过' }
    ];

    const experts = [
        { expertId: 'EXP-001', name: '李明远', gender: '男', birth: '1975-08-12', orgId: 'ORG-20260001', orgName: '上海建科检测技术有限公司', domain: '建筑工地', direction: '施工安全', title: '高级工程师', titleOrg: '上海市住建委', titleTime: '2015-06', years: '15', phone: '13800138001', email: 'limy@jk.com', address: '上海市黄浦区', workplace: '上海建科检测技术有限公司', status: '正常' },
        { expertId: 'EXP-002', name: '王晓峰', gender: '男', birth: '1980-03-25', orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', domain: '基坑', direction: '基坑监测', title: '教授级高工', titleOrg: '中国岩石力学学会', titleTime: '2018-09', years: '18', phone: '13800138002', email: 'wangxf@ha.com', address: '上海市静安区', workplace: '上海华安风险评估中心', status: '正常' },
        { expertId: 'EXP-003', name: '张淑芬', gender: '女', birth: '1978-11-08', orgId: 'ORG-20260003', orgName: '上海水利安全研究院', domain: '交通', direction: '桥梁安全', title: '研究员', titleOrg: '交通运输部', titleTime: '2016-12', years: '12', phone: '13800138003', email: 'zhangsf@sl.com', address: '上海市徐汇区', workplace: '上海水利安全研究院', status: '正常' },
        { expertId: 'EXP-004', name: '陈志强', gender: '男', birth: '1982-07-19', orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', domain: '玻璃幕墙', direction: '消防检测', title: '高级工程师', titleOrg: '上海市消防协会', titleTime: '2019-04', years: '10', phone: '13800138004', email: 'chenzq@ax.com', address: '上海市长宁区', workplace: '上海安信消防技术有限公司', status: '正常' },
        { expertId: 'EXP-005', name: '刘红梅', gender: '女', birth: '1976-05-30', orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', domain: '燃气', direction: '燃气安全', title: '教授级高工', titleOrg: '中国城市燃气协会', titleTime: '2014-11', years: '20', phone: '13800138005', email: 'liuhm@rq.com', address: '上海市浦东新区', workplace: '上海燃气安全技术服务中心', status: '正常' },
        { expertId: 'EXP-006', name: '赵建国', gender: '男', birth: '1979-09-14', orgId: 'ORG-20260006', orgName: '上海城市安全研究院', domain: '高空坠物', direction: '城市安全', title: '高级工程师', titleOrg: '上海市应急管理局', titleTime: '2017-08', years: '14', phone: '13800138006', email: 'zhaojg@cs.com', address: '上海市杨浦区', workplace: '上海城市安全研究院', status: '正常' },
        { expertId: 'EXP-007', name: '孙丽华', gender: '女', birth: '1981-12-03', orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', domain: '城镇自建房', direction: '房屋鉴定', title: '研究员', titleOrg: '住建部', titleTime: '2020-01', years: '11', phone: '13800138007', email: 'sunlh@fj.com', address: '上海市虹口区', workplace: '上海房屋安全鉴定中心', status: '正常' },
        { expertId: 'EXP-008', name: '周海涛', gender: '男', birth: '1983-04-22', orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', domain: '农村自建房', direction: '村镇建筑', title: '高级工程师', titleOrg: '上海市住建委', titleTime: '2021-05', years: '9', phone: '13800138008', email: 'zhouht@cz.com', address: '上海市闵行区', workplace: '上海村镇建设安全评估有限公司', status: '正常' },
        { expertId: 'EXP-009', name: '杨秀英', gender: '女', birth: '1972-03-15', orgId: '', orgName: '', domain: '建筑结构', direction: '结构检测', title: '教授级高工', titleOrg: '中国土木工程学会', titleTime: '2010-08', years: '28', phone: '13800138009', email: 'yangxy@example.com', address: '上海市浦东新区', workplace: '上海市', status: '正常', expertType: '独立专家' },
        { expertId: 'EXP-010', name: '黄志强', gender: '男', birth: '1968-07-21', orgId: '', orgName: '', domain: '岩土工程', direction: '地基处理', title: '高级工程师', titleOrg: '中国岩石力学与工程学会', titleTime: '2008-05', years: '32', phone: '13800138010', email: 'huangzq@example.com', address: '上海市徐汇区', workplace: '上海市', status: '正常', expertType: '独立专家' },
        { expertId: 'EXP-011', name: '周涛', gender: '男', birth: '1975-11-30', orgId: '', orgName: '', domain: '市政工程', direction: '道路桥梁', title: '注册结构师', titleOrg: '住建部执业资格注册中心', titleTime: '2012-09', years: '24', phone: '13800138011', email: 'zhout@example.com', address: '上海市黄浦区', workplace: '上海市', status: '正常', expertType: '独立专家' },
        { expertId: 'EXP-012', name: '吴刚', gender: '男', birth: '1980-01-18', orgId: '', orgName: '', domain: '电气自动化', direction: '电气安全', title: '注册岩土工程师', titleOrg: '中国电机工程学会', titleTime: '2015-11', years: '18', phone: '13800138012', email: 'wug@example.com', address: '上海市静安区', workplace: '上海市', status: '正常', expertType: '独立专家' }
    ];

    const credit = {};
    orgs.forEach(o => {
        credit[o.orgId] = {
            orgId: o.orgId,
            orgName: o.orgName,
            creditLevel: o.creditLevel,
            score: o.score,
            history: []
        };
    });

    return { orgs, contracts, performances, experts, credit, projectGroups: [], version: 2 };
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
    if (data.version !== 2) {
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
        data.version = 2;
        saveTPData(data);
    }
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
        if (!parsed || !parsed.experts || parsed.experts.length === 0) {
            const data = createDefaultData();
            localStorage.setItem(TP_STORAGE_KEY, JSON.stringify(data));
            return data;
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

// ---------- 信用分自动计算（简单规则） ----------
function calculateCreditScore(orgId) {
    const org = getOrgById(orgId);
    if (!org) return 0;
    const contracts = getContractsByOrg(orgId);
    const performances = getPerformancesByOrg(orgId);
    const totalContract = contracts.length || 1;
    const finished = contracts.filter(c => c.status === '已验收').length;
    const fulfillRate = finished / totalContract; // 履约率
    const totalPerf = performances.length || 1;
    const excellent = performances.filter(p => p.conclusion === '优秀').length;
    const good = performances.filter(p => p.conclusion === '良好').length;
    const qualityRate = (excellent + good * 0.8) / totalPerf; // 质量系数
    const base = 70;
    const score = Math.min(100, Math.round(base + fulfillRate * 15 + qualityRate * 15));
    let level = 'A';
    if (score >= 90) level = 'AAA';
    else if (score >= 85) level = 'AA';
    else if (score >= 80) level = 'A';
    else if (score >= 70) level = 'BBB';
    else if (score >= 60) level = 'BB';
    else level = 'C';
    return { score, level };
}

function syncCredit(orgId) {
    const org = getOrgById(orgId);
    if (!org) return;
    const calc = calculateCreditScore(orgId);
    const data = getTPData();
    if (!data.credit) data.credit = {};
    data.credit[orgId] = {
        orgId: orgId,
        orgName: org.orgName,
        creditLevel: calc.level,
        score: calc.score,
        history: data.credit[orgId] ? data.credit[orgId].history : []
    };
    // 同步回机构主数据
    const idx = data.orgs.findIndex(o => o.orgId === orgId);
    if (idx >= 0) {
        data.orgs[idx].creditLevel = calc.level;
        data.orgs[idx].score = calc.score;
    }
    saveTPData(data);
}

// 自动同步所有机构信用（可选）
function syncAllCredit() {
    getAllOrgs().forEach(o => syncCredit(o.orgId));
}
