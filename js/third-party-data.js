// =========================================================
// 第三方服务机构模块统一数据层
// 文件：js/third-party-data.js
// 作用：统一管理机构、合同、业绩、专家、信用等跨页面数据
// 使用：所有 tp-*.html 页面引入本脚本
// =========================================================

const TP_STORAGE_KEY = 'thirdPartyData';
const INITIAL_CREDIT_SCORE = 75;
const INITIAL_CREDIT_LEVEL = 'B';

// 统一数据模型
// orgs:      机构主数据
// contracts: 鉴定合同
// performances: 机构业绩
// experts:   专家库
// credit:    信用档案（可由系统根据业绩/合同自动计算）
function createDefaultData() {
    const orgs = [
        { orgId: 'ORG-20260001', orgName: '上海建科检测技术有限公司', orgCode: '91310000123456789X', legalPerson: '张建科', phone: '021-12345678', region: '上海市奉贤区南桥镇', field: '建筑工地', orgType: '检测机构', qual: '甲级', status: '正常', creditLevel: 'AAA', score: 92.6, established: '2010-05-20' },
        { orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', orgCode: '91310000876543210Y', legalPerson: '李华安', phone: '021-87654321', region: '上海市奉贤区奉城镇', field: '基坑', orgType: '评估机构', qual: '甲级', status: '正常', creditLevel: 'AA', score: 88.3, established: '2012-08-15' },
        { orgId: 'ORG-20260003', orgName: '上海水利安全研究院', orgCode: '91310000567890123Z', legalPerson: '王水研', phone: '021-56789012', region: '上海市奉贤区金汇镇', field: '交通', orgType: '研究院', qual: '乙级', status: '正常', creditLevel: 'AA', score: 85.7, established: '2015-03-10' },
        { orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', orgCode: '91310000345678901A', legalPerson: '陈消防', phone: '021-34567890', region: '上海市奉贤区西渡街道', field: '玻璃幕墙', orgType: '检测机构', qual: '乙级', status: '正常', creditLevel: 'A', score: 79.5, established: '2018-11-22' },
        { orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', orgCode: '91310000987654321B', legalPerson: '刘燃气', phone: '021-98765432', region: '上海市奉贤区柘林镇', field: '燃气', orgType: '服务机构', qual: '甲级', status: '正常', creditLevel: 'AAA', score: 91.2, established: '2011-06-18' },
        { orgId: 'ORG-20260006', orgName: '上海城市安全研究院', orgCode: '91310000678901234C', legalPerson: '赵城安', phone: '021-67890123', region: '上海市奉贤区奉浦街道', field: '高空坠物', orgType: '研究院', qual: '甲级', status: '正常', creditLevel: 'AA', score: 87.4, established: '2013-09-05' },
        { orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', orgCode: '91310000456789012D', legalPerson: '孙房鉴', phone: '021-45678901', region: '上海市奉贤区青村镇', field: '城镇自建房', orgType: '鉴定机构', qual: '甲级', status: '正常', creditLevel: 'AAA', score: 93.5, established: '2008-04-12' },
        { orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', orgCode: '91310000234567890E', legalPerson: '周村镇', phone: '021-23456789', region: '上海市奉贤区庄行镇', field: '农村自建房', orgType: '评估机构', qual: '乙级', status: '正常', creditLevel: 'A', score: 76.8, established: '2019-01-30' }
    ];

    const contracts = [
        { contractId: 'HT-20260001', orgId: 'ORG-20260001', orgName: '上海建科检测技术有限公司', orgCode: '91310000123456789X', projectName: '上海市建筑工地施工安全风险评估', serviceScope: '建筑工地', servicePeriod: '2026-04-01 ~ 2026-06-30', amount: 12.8, payment: '分期付款', deliverable: '施工安全风险评估报告、风险清单及管控建议', acceptance: '报告通过专家评审并提交主管部门备案', status: '已验收', signDate: '2026-03-15' },
        { contractId: 'HT-20260002', orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', orgCode: '91310000876543210Y', projectName: '上海市基坑工程安全监测与评价', serviceScope: '基坑', servicePeriod: '2026-03-15 ~ 2026-05-15', amount: 9.65, payment: '一次性付款', deliverable: '基坑监测报告及安全评价意见', acceptance: '通过专家组评审', status: '已验收', signDate: '2026-03-01' },
        { contractId: 'HT-20260003', orgId: 'ORG-20260003', orgName: '上海水利安全研究院', orgCode: '91310000567890123Z', projectName: '上海市交通基础设施安全风险评估', serviceScope: '交通', servicePeriod: '2026-05-01 ~ 2026-08-31', amount: 21.0, payment: '按里程碑付款', deliverable: '交通基础设施风险评估报告', acceptance: '提交主管部门并通过审核', status: '已验收', signDate: '2026-04-20' },
        { contractId: 'HT-20260004', orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', orgCode: '91310000345678901A', projectName: '上海市玻璃幕墙安全隐患排查', serviceScope: '玻璃幕墙', servicePeriod: '2026-01-10 ~ 2026-03-10', amount: 5.42, payment: '分期付款', deliverable: '玻璃幕墙安全隐患排查报告', acceptance: '隐患整改闭环后验收', status: '已验收', signDate: '2026-01-05' },
        { contractId: 'HT-20260005', orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', orgCode: '91310000987654321B', projectName: '上海市燃气管道安全风险评估', serviceScope: '燃气', servicePeriod: '2026-06-01 ~ 2026-09-30', amount: 16.8, payment: '按里程碑付款', deliverable: '燃气管道风险评估报告及管控建议', acceptance: '通过燃气主管部门评审', status: '已验收', signDate: '2026-05-25' },
        { contractId: 'HT-20260006', orgId: 'ORG-20260006', orgName: '上海城市安全研究院', orgCode: '91310000678901234C', projectName: '上海市高空坠物风险排查评估', serviceScope: '高空坠物', servicePeriod: '2026-02-20 ~ 2026-05-20', amount: 13.2, payment: '一次性付款', deliverable: '高空坠物风险排查评估报告', acceptance: '完成现场复核并备案', status: '已验收', signDate: '2026-02-10' },
        { contractId: 'HT-20260007', orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', orgCode: '91310000456789012D', projectName: '上海市城镇自建房安全鉴定', serviceScope: '城镇自建房', servicePeriod: '2026-05-10 ~ 2026-08-10', amount: 24.5, payment: '分期付款', deliverable: '房屋安全鉴定报告', acceptance: '鉴定结论通过主管部门认可', status: '已验收', signDate: '2026-04-30' },
        { contractId: 'HT-20260008', orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', orgCode: '91310000234567890E', projectName: '上海市农村自建房安全评估', serviceScope: '农村自建房', servicePeriod: '2026-03-01 ~ 2026-06-01', amount: 8.8, payment: '一次性付款', deliverable: '农村自建房安全评估报告', acceptance: '评估报告经镇/街道备案', status: '已验收', signDate: '2026-02-25' }
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
        { expertId: 'EXP-002', name: '王晓峰', gender: '男', birth: '1980-03-25', orgId: 'ORG-20260002', orgName: '上海华安风险评估中心', domain: '基坑', direction: '基坑监测', industryExpertGroup: '基坑与地下工程专家组', title: '教授级高工', titleLevel: '正高级', titleOrg: '中国岩石力学学会', titleTime: '2018-09', years: '18', phone: '13800138002', email: 'wangxf@ha.com', address: '上海市静安区', workplace: '上海华安风险评估中心', serviceTime: '工作日 9:00-17:00', status: '正常' },
        { expertId: 'EXP-003', name: '张淑芬', gender: '女', birth: '1978-11-08', orgId: 'ORG-20260003', orgName: '上海水利安全研究院', domain: '交通', direction: '桥梁安全', industryExpertGroup: '交通基础设施安全专家组', title: '研究员', titleLevel: '正高级', titleOrg: '交通运输部', titleTime: '2016-12', years: '12', phone: '13800138003', email: 'zhangsf@sl.com', address: '上海市徐汇区', workplace: '上海水利安全研究院', serviceTime: '工作日 9:00-17:00', status: '正常' },
        { expertId: 'EXP-004', name: '陈志强', gender: '男', birth: '1982-07-19', orgId: 'ORG-20260004', orgName: '上海安信消防技术有限公司', domain: '玻璃幕墙', direction: '消防检测', industryExpertGroup: '消防与应急救援专家组', title: '高级工程师', titleLevel: '副高级', titleOrg: '上海市消防协会', titleTime: '2019-04', years: '10', phone: '13800138004', email: 'chenzq@ax.com', address: '上海市长宁区', workplace: '上海安信消防技术有限公司', serviceTime: '工作日 9:00-17:00；火灾应急随时响应', status: '正常' },
        { expertId: 'EXP-005', name: '刘红梅', gender: '女', birth: '1976-05-30', orgId: 'ORG-20260005', orgName: '上海燃气安全技术服务中心', domain: '燃气', direction: '燃气安全', industryExpertGroup: '城镇燃气安全专家组', title: '教授级高工', titleLevel: '正高级', titleOrg: '中国城市燃气协会', titleTime: '2014-11', years: '20', phone: '13800138005', email: 'liuhm@rq.com', address: '上海市浦东新区', workplace: '上海燃气安全技术服务中心', serviceTime: '全天候（燃气应急抢修响应）', status: '正常' },
        { expertId: 'EXP-006', name: '赵建国', gender: '男', birth: '1979-09-14', orgId: 'ORG-20260006', orgName: '上海城市安全研究院', domain: '高空坠物', direction: '城市安全', industryExpertGroup: '城市运行安全专家组', title: '高级工程师', titleLevel: '副高级', titleOrg: '上海市应急管理局', titleTime: '2017-08', years: '14', phone: '13800138006', email: 'zhaojg@cs.com', address: '上海市杨浦区', workplace: '上海城市安全研究院', serviceTime: '工作日 9:00-17:00', status: '正常' },
        { expertId: 'EXP-007', name: '孙丽华', gender: '女', birth: '1981-12-03', orgId: 'ORG-20260007', orgName: '上海房屋安全鉴定中心', domain: '城镇自建房', direction: '房屋鉴定', industryExpertGroup: '房屋安全鉴定专家组', title: '研究员', titleLevel: '正高级', titleOrg: '住建部', titleTime: '2020-01', years: '11', phone: '13800138007', email: 'sunlh@fj.com', address: '上海市虹口区', workplace: '上海房屋安全鉴定中心', serviceTime: '工作日 9:00-17:00', status: '正常' },
        { expertId: 'EXP-008', name: '周海涛', gender: '男', birth: '1983-04-22', orgId: 'ORG-20260008', orgName: '上海村镇建设安全评估有限公司', domain: '农村自建房', direction: '村镇建筑', industryExpertGroup: '村镇建设安全专家组', title: '高级工程师', titleLevel: '副高级', titleOrg: '上海市住建委', titleTime: '2021-05', years: '9', phone: '13800138008', email: 'zhouht@cz.com', address: '上海市闵行区', workplace: '上海村镇建设安全评估有限公司', serviceTime: '工作日 9:00-17:00', status: '正常' },
        { expertId: 'EXP-009', name: '杨秀英', gender: '女', birth: '1972-03-15', orgId: '', orgName: '', domain: '城镇自建房', direction: '结构检测', industryExpertGroup: '房屋安全鉴定专家组', title: '教授级高工', titleLevel: '正高级', titleOrg: '中国土木工程学会', titleTime: '2010-08', years: '28', phone: '13800138009', email: 'yangxy@example.com', address: '上海市浦东新区', workplace: '上海市', serviceTime: '周一至周五 9:00-18:00', status: '正常', expertType: '独立专家' },
        { expertId: 'EXP-010', name: '黄志强', gender: '男', birth: '1968-07-21', orgId: '', orgName: '', domain: '基坑', direction: '地基处理', industryExpertGroup: '基坑与地下工程专家组', title: '高级工程师', titleLevel: '副高级', titleOrg: '中国岩石力学与工程学会', titleTime: '2008-05', years: '32', phone: '13800138010', email: 'huangzq@example.com', address: '上海市徐汇区', workplace: '上海市', serviceTime: '工作日及周末可预约', status: '正常', expertType: '独立专家' },
        { expertId: 'EXP-011', name: '周涛', gender: '男', birth: '1975-11-30', orgId: '', orgName: '', domain: '交通', direction: '道路桥梁', industryExpertGroup: '交通基础设施安全专家组', title: '注册结构师', titleLevel: '副高级', titleOrg: '住建部执业资格注册中心', titleTime: '2012-09', years: '24', phone: '13800138011', email: 'zhout@example.com', address: '上海市黄浦区', workplace: '上海市', serviceTime: '全天候', status: '正常', expertType: '独立专家' }
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
            snapshots: buildSeedSnapshots(o.orgId, calc.score, calc.level)
        };
    });

    // 演示用信用行为记录（良好/不良行为），用于展示信用记录列表与单条事件详情
    const demoCreditEvents = {
        'ORG-20260001': [
            { time: '2026-10-20 10:15:00', eventName: '评估报告获市级优秀案例', type: 'positive', scoreDelta: 3, dimension: 'quality', remark: '施工安全风险评估报告入选市级优秀案例库，予以加分' },
            { time: '2026-08-12 14:30:00', eventName: '报告数据错误被退回整改', type: 'negative', scoreDelta: -5, dimension: 'behavior', remark: '风险清单数据与实际不符，报告被退回并要求限期整改' }
        ],
        'ORG-20260005': [
            { time: '2026-09-28 09:40:00', eventName: '主动上报重大隐患线索', type: 'positive', scoreDelta: 2, dimension: 'behavior', remark: '巡查中主动上报燃气安全隐患线索并协助处置，予以加分' },
            { time: '2026-07-30 16:05:00', eventName: '未按合同约定时间提交报告', type: 'negative', scoreDelta: -8, dimension: 'behavior', remark: '鉴定报告逾期 15 天提交，按合同条款予以扣分' }
        ],
        'ORG-20260007': [
            { time: '2026-09-05 11:20:00', eventName: '鉴定结论与复核结果严重不符', type: 'negative', scoreDelta: -10, dimension: 'behavior', remark: '房屋安全鉴定结论经复核被推翻，记入不良行为记录' }
        ]
    };
    Object.keys(demoCreditEvents).forEach(orgId => {
        const entry = credit[orgId];
        const org = orgs.find(o => o.orgId === orgId);
        if (!entry || !org) return;
        // 与 recordCreditEvent 一致按时间倒序（最新在前）：unshift 需从最旧开始
        demoCreditEvents[orgId].slice().reverse().forEach(ev => {
            entry.history.unshift({
                time: ev.time, orgId: orgId, orgName: org.orgName,
                eventName: ev.eventName, eventKey: '', type: ev.type,
                scoreDelta: ev.scoreDelta, dimension: ev.dimension, remark: ev.remark
            });
        });
        // 按含行为记录的口径重算，保证分值/等级/维度与记录一致
        const calc = calculateCreditScoreFromDefaults(org, contracts.filter(c => c.orgId === orgId), performances.filter(p => p.orgId === orgId), entry);
        entry.score = calc.score;
        entry.creditLevel = calc.level;
        entry.dimensions = calc.dimensions;
        org.score = calc.score;
        org.creditLevel = calc.level;
        demoCreditEvents[orgId].slice().reverse().forEach(ev => {
            entry.changeLog.unshift({
                time: ev.time, orgId: orgId, orgName: org.orgName,
                eventName: ev.eventName, eventKey: '', type: ev.type,
                scoreDelta: ev.scoreDelta, dimension: ev.dimension, remark: ev.remark,
                ruleId: '', scoreAfter: calc.score, levelAfter: calc.level
            });
        });
        var todaySnap = { date: todayStr(), score: calc.score, level: calc.level };
        var lastSnap = entry.snapshots[entry.snapshots.length - 1];
        if (lastSnap && lastSnap.date === todaySnap.date) entry.snapshots[entry.snapshots.length - 1] = todaySnap;
        else entry.snapshots.push(todaySnap);
    });

    const auditConfig = {
        mode: 'single',      // 'single' 单级 | 'multi' 多级
        levels: 1,           // 默认单级
        requiredOpinion: true,
        presetPass: ['材料齐全，予以通过', '符合入库条件', '资质有效期符合要求'],
        presetReject: ['材料不完整，请补充', '资质有效期不足，请更新', '经营范围不符合要求', '法人代表信息有误'],
        presetVerify: ['申请资料与原件扫描件不一致，需比对核验', '法人身份信息待核实，发起实名核验', '资质证书真伪待向发证机关核验', '企业法人证明文件存疑，需补充核验', '联系电话无法接通，需电话核验', '注册地址存疑，需现场核验']
    };

    const auditFlow = {};  // key: orgId, value: { currentLevel, history, status } 审核流程状态

    return { orgs, contracts, performances, experts, credit, auditConfig, auditFlow, version: 8, creditRules: getDefaultCreditRules().slice(), creditRuleVersion: 1, creditRuleHistory: [{ version: 1, time: nowStr(), summary: '初始规则版本', rules: getDefaultCreditRules().map(r => Object.assign({}, r)) }], creditLastCalcTime: '', orgApplications: [], expertApplications: [], orgChangeRequests: [], notifications: [], reminderRule: null };
}

function getDefaultExperts() {
    return createDefaultData().experts;
}

// 按职称名称推断职称等级（初级/中级/副高级/正高级），用于存量数据迁移与导入兜底
function inferExpertTitleLevel(title) {
    var t = (title || '').trim();
    if (!t) return '';
    // 先判正高（教授/研究员须精确匹配，避免误判副教授/副研究员）
    if (t.indexOf('教授级') !== -1 || t.indexOf('正高级') !== -1 || t === '教授' || t === '研究员') return '正高级';
    if (t.indexOf('高级') !== -1 || t === '副教授' || t === '副研究员' || t.indexOf('注册') !== -1) return '副高级';
    if (t.indexOf('助理') !== -1 || t.indexOf('技术员') !== -1 || t.indexOf('初级') !== -1) return '初级';
    return '中级';
}

function migrateTPData(data) {
    if (!data) data = {};
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
    if ((data.version || 0) < 5) {
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
        migrateCreditSnapshots(data);
        backfillCreditSnapshotHistory(data);
        data.version = 5;
        saveTPData(data);
    }
    // v6：机构服务区域由上海市辖区调整为奉贤区街道/乡镇
    if ((data.version || 0) < 6) {
        var regionMap = {
            '上海市黄浦区': '上海市奉贤区南桥镇',
            '上海市静安区': '上海市奉贤区奉城镇',
            '上海市徐汇区': '上海市奉贤区金汇镇',
            '上海市长宁区': '上海市奉贤区西渡街道',
            '上海市浦东新区': '上海市奉贤区柘林镇',
            '上海市杨浦区': '上海市奉贤区奉浦街道',
            '上海市虹口区': '上海市奉贤区青村镇',
            '上海市闵行区': '上海市奉贤区庄行镇'
        };
        data.orgs.forEach(function(o) { if (regionMap[o.region]) o.region = regionMap[o.region]; });
        data.version = 6;
        saveTPData(data);
    }
    if (!data.orgApplications) data.orgApplications = [];
    if (!data.expertApplications) data.expertApplications = [];
    if (!data.orgChangeRequests) data.orgChangeRequests = [];
    if (!data.notifications) data.notifications = [];
    // 信用等级统一为 AAA/AA/A/B/C 五级：存量 BBB/BB 映射为 B
    if (data.orgs && data.orgs.length) {
        var levelChanged = false;
        data.orgs.forEach(function(o) {
            if (o.creditLevel === 'BBB' || o.creditLevel === 'BB') { o.creditLevel = 'B'; levelChanged = true; }
        });
        if (data.credit) {
            Object.keys(data.credit).forEach(function(orgId) {
                var rec = data.credit[orgId];
                if (rec && (rec.creditLevel === 'BBB' || rec.creditLevel === 'BB')) { rec.creditLevel = 'B'; levelChanged = true; }
                if (rec && (rec.level === 'BBB' || rec.level === 'BB')) { rec.level = 'B'; levelChanged = true; }
            });
        }
        if (levelChanged) saveTPData(data);
    }
    // 老数据补入库时间：无 admitDate 的机构按索引分配历史月份，便于统计演示
    if (data.orgs && data.orgs.length) {
        var baseMonths = ['2026-01-15','2026-02-10','2026-03-08','2026-04-12','2026-05-20','2026-06-05','2026-07-18','2026-08-22'];
        var admitChanged = false;
        data.orgs.forEach(function(o, i) {
            if (!o.admitDate) { o.admitDate = baseMonths[i % baseMonths.length] || '2026-01-15'; admitChanged = true; }
        });
        if (admitChanged) saveTPData(data);
    }
    // 老数据补服务覆盖街镇：用于服务范围地图统计，每家机构分配 1~3 个奉贤街镇
    if (data.orgs && data.orgs.length) {
        var towns = ['南桥街道','奉浦街道','金海街道','奉城镇','庄行镇','金汇镇','青村镇','柘林镇','四团镇','海湾镇','西渡镇'];
        var townChanged = false;
        data.orgs.forEach(function(o, i) {
            if (!o.serviceTowns || !o.serviceTowns.length) {
                var count = (i % 3) + 1;
                var assigned = [];
                for (var k = 0; k < count; k++) assigned.push(towns[(i + k * 3) % towns.length]);
                o.serviceTowns = assigned;
                townChanged = true;
            }
        });
        if (townChanged) saveTPData(data);
    }
    // 专家补职称等级：存量数据按职称名称推断（初级/中级/副高级/正高级）
    if (data.experts && data.experts.length) {
        var titleLevelChanged = false;
        data.experts.forEach(function(e) {
            if (!e.titleLevel) { e.titleLevel = inferExpertTitleLevel(e.title); titleLevelChanged = true; }
        });
        if (titleLevelChanged) { data.version = 7; saveTPData(data); }
    }
    // 清理同名重复专家：同一姓名保留先出现的记录（系统默认数据），移除历史同步产生的重复项
    if (data.experts && data.experts.length) {
        var seenExpertNames = {};
        var beforeExpertCount = data.experts.length;
        data.experts = data.experts.filter(function(e) {
            var key = e.name || '';
            if (!key) return true;
            if (seenExpertNames[key]) return false;
            seenExpertNames[key] = true;
            return true;
        });
        if (data.experts.length !== beforeExpertCount) { data.version = 8; saveTPData(data); }
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
            if (!Array.isArray(parsed.creditRuleHistory)) parsed.creditRuleHistory = defaults.creditRuleHistory || [];
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

// 获取机构入库时间：优先 admitDate，老数据用 changeHistory 首条新增记录时间兜底
function getOrgAdmitDate(org) {
    if (!org) return '';
    if (org.admitDate) return org.admitDate;
    var hist = org.changeHistory || [];
    var first = hist.filter(function(h) { return h.action === '新增' || h.action === '批量导入'; }).pop();
    return first ? (first.time || '') : '';
}

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
            presetReject: ['材料不完整，请补充', '资质有效期不足，请更新', '经营范围不符合要求', '法人代表信息有误'],
            presetVerify: ['申请资料与原件扫描件不一致，需比对核验', '法人身份信息待核实，发起实名核验', '资质证书真伪待向发证机关核验', '企业法人证明文件存疑，需补充核验', '联系电话无法接通，需电话核验', '注册地址存疑，需现场核验']
        };
        saveTPData(data);
    }
    if (!data.auditConfig.presetVerify) {
        data.auditConfig.presetVerify = ['申请资料与原件扫描件不一致，需比对核验', '法人身份信息待核实，发起实名核验', '资质证书真伪待向发证机关核验', '企业法人证明文件存疑，需补充核验', '联系电话无法接通，需电话核验', '注册地址存疑，需现场核验'];
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
function submitOrgApplication(application) {
    const data = getTPData();
    if (!data.orgApplications) data.orgApplications = [];
    const basic = application.basic || {};
    const creditCode = basic.creditCode || '';
    if (creditCode) {
        const existsOrg = (data.orgs || []).some(o => o.orgCode === creditCode);
        if (existsOrg) throw new Error('该统一社会信用代码的机构已入库，无需重复申请。');
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
    } else if (decision === 'verify') {
        app.status = '核验中';
        app.flowState.status = 'verifying';
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
function getInitialCreditDimensions(behaviorCredit) {
    return {
        base: INITIAL_CREDIT_SCORE,
        performance: null,
        quality: null,
        behavior: behaviorCredit,
        satisfaction: null
    };
}

function createInitialCreditRecord(org) {
    var time = nowStr();
    var initialEvent = {
        time: time,
        orgId: org.orgId,
        orgName: org.orgName,
        eventName: '入库初始信用',
        eventKey: 'initial_credit',
        type: 'neutral',
        scoreDelta: 0,
        dimension: 'base',
        remark: '机构审核入库，初始信用分 ' + INITIAL_CREDIT_SCORE + ' 分，初始等级 ' + INITIAL_CREDIT_LEVEL + ' 级',
        ruleId: '',
        scoreAfter: INITIAL_CREDIT_SCORE,
        levelAfter: INITIAL_CREDIT_LEVEL
    };
    return {
        orgId: org.orgId,
        orgName: org.orgName,
        creditLevel: INITIAL_CREDIT_LEVEL,
        score: INITIAL_CREDIT_SCORE,
        dimensions: getInitialCreditDimensions(100),
        history: [initialEvent],
        changeLog: [Object.assign({}, initialEvent)],
        snapshots: [{ date: todayStr(), score: INITIAL_CREDIT_SCORE, level: INITIAL_CREDIT_LEVEL }]
    };
}

function promoteApplicationToOrg(app) {
    if (!app) return;
    const basic = app.basic || {};
    const data = getTPData();
    const creditCode = basic.creditCode || app.creditCode || '';
    const existing = creditCode && data.orgs.find(o => o.orgCode === creditCode);
    if (existing) return existing;
    const orgId = genBatchOrgId(data);
    const newOrg = {
        orgId: orgId,
        orgName: basic.enterpriseName || app.orgName || '',
        orgCode: creditCode,
        legalPerson: basic.legalName || (app.legal && app.legal.legalName) || app.legalPerson || '',
        phone: basic.legalPhone || basic.phone || (app.legal && app.legal.phone) || app.contact || '',
        region: basic.address || basic.serviceArea || app.address || '',
        field: basic.field || basic.businessScope || app.serviceScope || '',
        orgType: basic.orgType || '服务机构',
        qual: (app.qualifications && app.qualifications[0] && app.qualifications[0].level) || '乙级',
        status: '正常',
        creditLevel: INITIAL_CREDIT_LEVEL,
        score: INITIAL_CREDIT_SCORE,
        established: basic.establishDate || '',
        admitDate: nowStr(),
        serviceTowns: [],
        changeHistory: [{ action: '新增', time: nowStr(), operator: '系统', remark: '机构申报审核通过，正式入库', diff: ['机构名称：' + (basic.enterpriseName || app.orgName || '-'), '统一代码：' + creditCode] }]
    };
    data.orgs.push(newOrg);
    if (!data.credit) data.credit = {};
    data.credit[orgId] = createInitialCreditRecord(newOrg);
    // 将在线申请中填报的关联专家一并入库，并关联到新机构
    if (app.relatedExperts && app.relatedExperts.length) {
        if (!data.experts) data.experts = [];
        app.relatedExperts.forEach(function(ex, idx) {
            if (!ex || !ex.name) return;
            var exists = data.experts.some(function(e) { return e.orgId === orgId && e.name === ex.name; });
            if (exists) return;
            data.experts.push({
                expertId: 'EXP-' + Date.now() + '-' + idx,
                name: ex.name || '',
                title: ex.title || '',
                domain: ex.domain || basic.field || '',
                direction: ex.direction || '',
                phone: ex.phone || '',
                orgId: orgId,
                orgName: newOrg.orgName,
                workplace: newOrg.orgName,
                status: '正常'
            });
        });
    }
    saveTPData(data);
    return newOrg;
}

// ---------- 机构信息变更申请 ----------
function getAllOrgChangeRequests() { return (getTPData().orgChangeRequests || []).slice(); }
function getOrgChangeRequestById(changeId) {
    return getAllOrgChangeRequests().find(function(c) { return c.changeId === changeId; });
}
function getOrgChangeRequestsByOrgId(orgId) {
    return getAllOrgChangeRequests().filter(function(c) { return c.orgId === orgId; });
}
function hasPendingOrgChangeRequest(orgId) {
    return getAllOrgChangeRequests().some(function(c) { return c.orgId === orgId && (c.status === '待审核' || c.status === '审核中'); });
}
function queryOrgChangeRequests(query) {
    var name = (query && query.orgName || '').trim().toLowerCase();
    var code = (query && query.orgCode || '').trim().toLowerCase();
    return getAllOrgChangeRequests().filter(function(c) {
        var matchName = name && (c.orgName || '').toLowerCase().indexOf(name) !== -1;
        var matchCode = code && (c.creditCode || '').toLowerCase() === code;
        return name && code ? (matchName && matchCode) : (matchName || matchCode);
    });
}
function submitOrgChangeRequest(req) {
    var data = getTPData();
    if (!data.orgChangeRequests) data.orgChangeRequests = [];
    var org = (data.orgs || []).find(function(o) { return o.orgId === req.orgId; });
    if (!org) throw new Error('未找到该机构，无法提交变更申请。');
    if (hasPendingOrgChangeRequest(req.orgId)) throw new Error('该机构已有待审核的变更申请，请等待审核完成后再提交。');
    if (!req.changes || !req.changes.length) throw new Error('未检测到变更内容。');
    req.changeId = req.changeId || ('CHG-' + Date.now() + '-' + Math.floor(Math.random() * 900 + 100));
    req.orgName = req.orgName || org.orgName || '';
    req.creditCode = req.creditCode || org.orgCode || '';
    req.status = '待审核';
    req.submitTime = req.submitTime || nowStr();
    if (!req.auditHistory) req.auditHistory = [];
    req.auditHistory.push({ level: 0, decision: 'submit', operator: req.submitter || ('机构-' + (org.orgName || '')), opinion: '提交信息变更申请', time: nowStr() });
    data.orgChangeRequests.push(req);
    saveTPData(data);
    return req;
}
function auditOrgChangeRequest(changeId, operator, opinion, decision) {
    var data = getTPData();
    if (!data.orgChangeRequests) data.orgChangeRequests = [];
    var req = data.orgChangeRequests.find(function(c) { return c.changeId === changeId; });
    if (!req) return null;
    if (req.status !== '待审核' && req.status !== '审核中') return null;
    if (!req.auditHistory) req.auditHistory = [];
    req.auditHistory.push({ level: 1, decision: decision, operator: operator, opinion: opinion, time: nowStr() });
    req.auditTime = nowStr();
    req.auditor = operator;
    req.auditOpinion = opinion || '';
    if (decision === 'reject') {
        req.status = '已驳回';
    } else {
        req.status = '已通过';
        applyOrgChangeRequest(data, req, operator);
    }
    saveTPData(data);
    return req;
}
function applyOrgChangeRequest(data, req, operator) {
    var org = (data.orgs || []).find(function(o) { return o.orgId === req.orgId; });
    if (!org) return;
    var previousName = org.orgName;
    (req.changes || []).forEach(function(c) { org[c.field] = c.newValue; });
    syncOrgRelations(data, org, previousName);
    addOrgChangeHistoryRecord(data, org.orgId, {
        action: '信息变更',
        time: nowStr(),
        operator: operator || '管理员',
        remark: (req.reason || '机构信息变更') + '（变更单号：' + req.changeId + '）',
        diff: (req.changes || []).map(function(c) { return c.label + '：' + (c.oldValue || '空') + ' → ' + (c.newValue || '空'); })
    });
}
function addOrgChangeHistoryRecord(data, orgId, record) {
    var org = (data.orgs || []).find(function(o) { return o.orgId === orgId; });
    if (!org) return;
    if (!org.changeHistory) org.changeHistory = [];
    org.changeHistory.unshift(record);
}
function getOrgChangeHistory(orgId) {
    var org = getOrgById(orgId);
    return (org && org.changeHistory) ? org.changeHistory.slice() : [];
}
function addOrgChangeHistory(orgId, record) {
    var data = getTPData();
    addOrgChangeHistoryRecord(data, orgId, record);
    saveTPData(data);
}

// ---------- 专家在线申请 ----------
function getAllExpertApplications() { return (getTPData().expertApplications || []).slice(); }
function getExpertApplicationById(applicationId) { return getAllExpertApplications().find(a => a.applicationId === applicationId); }
function queryExpertApplicationProgress(query) {
    var name = (query && query.expertName || '').trim().toLowerCase();
    var idCard = (query && query.idCard || '').trim().toLowerCase();
    return getAllExpertApplications().filter(function(a) {
        var basic = a.basic || {};
        var matchName = name && (basic.name || '').toLowerCase().indexOf(name) !== -1;
        var matchIdCard = idCard && (basic.idCard || '').toLowerCase() === idCard;
        return name && idCard ? (matchName && matchIdCard) : (matchName || matchIdCard);
    });
}
function submitExpertApplication(application) {
    const data = getTPData();
    if (!data.expertApplications) data.expertApplications = [];
    const basic = application.basic || {};
    const idCard = basic.idCard || '';
    if (idCard) {
        const existsApp = data.expertApplications.some(a => a.basic && a.basic.idCard === idCard && a.status !== '已驳回');
        if (existsApp) throw new Error('该身份证号已有正在审核或已通过的申请，请勿重复提交。');
        const existsExpert = (data.experts || []).some(e => e.idCard && e.idCard === idCard);
        if (existsExpert) throw new Error('该身份证号的专家已入库，无需重复申请。');
    }
    application.applicationId = application.applicationId || ('EXA-' + Date.now() + '-' + Math.floor(Math.random() * 900 + 100));
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
    data.expertApplications.push(application);
    saveTPData(data);
    return application;
}
function updateExpertApplication(application) {
    const data = getTPData();
    if (!data.expertApplications) data.expertApplications = [];
    const idx = data.expertApplications.findIndex(a => a.applicationId === application.applicationId);
    if (idx >= 0) data.expertApplications[idx] = application;
    else data.expertApplications.push(application);
    saveTPData(data);
    return application;
}
function approveExpertApplication(applicationId, level, operator, opinion) {
    return auditExpertApplication(applicationId, level, operator, opinion, 'pass');
}
function rejectExpertApplication(applicationId, level, operator, opinion) {
    return auditExpertApplication(applicationId, level, operator, opinion, 'reject');
}
function auditExpertApplication(applicationId, level, operator, opinion, decision) {
    var app = getExpertApplicationById(applicationId);
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
    } else if (decision === 'verify') {
        app.status = '核验中';
        app.flowState.status = 'verifying';
    } else if (decision === 'pass') {
        if (lv >= maxLevel) {
            app.status = '已通过';
            app.flowState.status = 'approved';
            app.approveTime = nowStr();
            promoteApplicationToExpert(app);
        } else {
            app.status = '审核中';
            app.flowState.status = 'auditing';
        }
    }
    updateExpertApplication(app);
    return app;
}
function promoteApplicationToExpert(app) {
    if (!app || !app.basic) return;
    const basic = app.basic;
    const data = getTPData();
    if (!data.experts) data.experts = [];
    if (basic.idCard && data.experts.some(e => e.idCard === basic.idCard)) return;
    const newExpert = {
        expertId: 'EXP-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: basic.name || '',
        gender: basic.gender || '',
        birth: basic.birth || '',
        idCard: basic.idCard || '',
        orgId: basic.orgId || '',
        orgName: basic.workplace || '',
        domain: basic.domain || '',
        direction: basic.direction || '',
        industryExpertGroup: basic.industryExpertGroup || '',
        title: basic.title || '',
        titleLevel: basic.titleLevel || inferExpertTitleLevel(basic.title),
        titleOrg: basic.titleOrg || '',
        titleTime: basic.titleTime || '',
        years: basic.years || '',
        phone: basic.phone || '',
        email: basic.email || '',
        address: basic.address || '',
        workplace: basic.workplace || '',
        serviceTime: basic.serviceTime || '',
        status: '正常',
        expertType: basic.orgId ? '机构专家' : '独立专家',
        source: '在线申请'
    };
    data.experts.push(newExpert);
    saveTPData(data);
    return newExpert;
}

// ---------- 机构批量导入 ----------
function genBatchOrgId(data) {
    var seq = data.orgs.length + 1;
    var id;
    do {
        id = 'ORG-' + String(seq).padStart(5, '0');
        seq++;
    } while (data.orgs.some(function(o) { return o.orgId === id; }));
    return id;
}

// items: [{ basic: {...}, personnel: [], qualifications: [], equipment: [], experts: [] }]
function addOrgsBatch(items) {
    const data = getTPData();
    const results = [];
    items.forEach(function(item) {
        const b = item.basic || {};
        const orgId = genBatchOrgId(data);
        const score = parseFloat(b.score) || 75;
        const newOrg = {
            orgId: orgId,
            orgName: b.orgName || '',
            orgCode: b.orgCode || '',
            legalPerson: b.legalPerson || '',
            phone: b.phone || '',
            region: b.region || '',
            field: b.field || '',
            orgType: b.orgType || '服务机构',
            qual: b.qual || '乙级',
            status: '正常',
            creditLevel: score >= 90 ? 'AAA' : (score >= 85 ? 'AA' : (score >= 75 ? 'A' : 'B')),
            score: score,
            established: b.established || '',
            // 弹窗明细扩展字段
            idCard: b.idCard || '',
            capital: b.capital || '',
            serviceArea: b.serviceArea || '',
            industry: b.industry || '',
            businessScope: b.businessScope || '',
            personnel: item.personnel || [],
            qualifications: item.qualifications || [],
            equipment: item.equipment || []
        };
        data.orgs.push(newOrg);
        // 关联专家一并入库
        (item.experts || []).forEach(function(ex, idx) {
            if (!ex || !ex.name) return;
            var exists = data.experts.some(function(e) { return e.orgId === orgId && e.name === ex.name; });
            if (exists) return;
            data.experts.push({
                expertId: 'EXP-' + Date.now() + '-' + idx + '-' + Math.floor(Math.random() * 1000),
                name: ex.name || '',
                title: ex.title || '',
                domain: ex.domain || newOrg.field,
                direction: ex.direction || '',
                phone: ex.phone || '',
                orgId: orgId,
                orgName: newOrg.orgName,
                workplace: newOrg.orgName,
                status: '正常'
            });
        });
        results.push(newOrg);
    });
    saveTPData(data);
    return results;
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
// ---------- 数据更新（增删改） ----------
function syncOrgRelations(data, org, previousName) {
    var oldName = previousName || org.orgName;
    (data.contracts || []).forEach(function(c) {
        if (c.orgId !== org.orgId) return;
        c.orgName = org.orgName;
        c.orgCode = org.orgCode;
    });
    (data.performances || []).forEach(function(p) {
        if (p.orgId === org.orgId) p.orgName = org.orgName;
    });
    (data.experts || []).forEach(function(e) {
        if (e.orgId !== org.orgId) return;
        e.orgName = org.orgName;
        if (e.workplace === oldName) e.workplace = org.orgName;
    });
    if (data.credit && data.credit[org.orgId]) data.credit[org.orgId].orgName = org.orgName;
}

function updateOrg(org) {
    const data = getTPData();
    const idx = data.orgs.findIndex(o => o.orgId === org.orgId);
    const previousName = idx >= 0 ? data.orgs[idx].orgName : org.orgName;
    if (idx >= 0) data.orgs[idx] = org;
    else data.orgs.push(org);
    syncOrgRelations(data, org, previousName);
    saveTPData(data);
}

function updateContract(contract) {
    const data = getTPData();
    const idx = data.contracts.findIndex(c => c.contractId === contract.contractId);
    if (idx >= 0) data.contracts[idx] = contract;
    else data.contracts.push(contract);
    saveTPData(data);
}

function deleteContractById(contractId) {
    const data = getTPData();
    const idx = data.contracts.findIndex(c => c.contractId === contractId);
    if (idx >= 0) {
        data.contracts.splice(idx, 1);
        saveTPData(data);
    }
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

// 基础信用构成：资质真实性（资质等级基准分）+ 信息完整性（资料关键字段完整率）
// 完整率 100% 时基础信用等于资质基准分，资料缺失越多得分越低
const BASE_CREDIT_REQUIRED_FIELDS = ['orgName', 'orgCode', 'legalPerson', 'phone', 'region', 'field', 'orgType', 'qual', 'established'];
function getBaseCreditBreakdown(org) {
    org = org || {};
    const qualScore = org.qual === '甲级' ? 95 : (org.qual === '乙级' ? 88 : 80);
    const missing = BASE_CREDIT_REQUIRED_FIELDS.filter(f => {
        const v = org[f];
        return v === undefined || v === null || String(v).trim() === '';
    });
    const completenessRate = (BASE_CREDIT_REQUIRED_FIELDS.length - missing.length) / BASE_CREDIT_REQUIRED_FIELDS.length;
    return {
        qualScore: qualScore,
        completeness: Math.round(completenessRate * 100),
        missing: missing,
        baseCredit: Math.round(qualScore * (0.6 + 0.4 * completenessRate))
    };
}

// 五维子项明细：用于信用详情展示，口径与 calculateCreditScoreFromDefaults 一致
function getCreditDimensionDetails(orgId) {
    const org = getOrgById(orgId);
    if (!org) return null;
    const contracts = getContractsByOrg(orgId);
    const performances = getPerformancesByOrg(orgId);
    const creditRecord = getCreditByOrg(orgId) || { history: [] };
    const history = creditRecord.history || [];
    const pct = r => Math.round(r * 100);

    const totalContract = contracts.length || 1;
    const fulfillRate = contracts.filter(c => c.status === '已验收').length / totalContract;

    const totalPerf = performances.length || 1;
    const passRate = performances.filter(p => p.auditStatus === '已通过').length / totalPerf;
    const excellent = performances.filter(p => p.conclusion === '优秀').length;
    const good = performances.filter(p => p.conclusion === '良好').length;
    const excellentRate = (excellent + good * 0.8) / totalPerf;

    const negatives = history.filter(h => h.type === 'negative');
    const complaints = negatives.filter(h => h.eventKey === 'customer_complaint').length;

    return {
        hasBusinessData: contracts.length > 0 || performances.length > 0,
        base: getBaseCreditBreakdown(org),
        performance: { fulfillRate: pct(fulfillRate), onTimeRate: pct(fulfillRate) },
        quality: { passRate: pct(passRate), acceptRate: pct(fulfillRate) },
        behavior: {
            violations: negatives.length - complaints,
            complaints: complaints,
            penalty: negatives.reduce((s, h) => s + Math.abs(h.scoreDelta || 0), 0)
        },
        satisfaction: { score: pct(excellentRate), excellentRate: pct(excellentRate) }
    };
}

function calculateCreditScoreFromDefaults(org, contracts, performances, creditRecord) {
    if (!org) return { score: 0, level: 'C', dimensions: {} };
    contracts = contracts || [];
    performances = performances || [];
    creditRecord = creditRecord || { history: [] };

    // 基础信用：资质真实性 + 信息完整性（基于机构主数据）
    const baseCredit = getBaseCreditBreakdown(org).baseCredit;

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

    // 新入库机构尚无业务数据时使用统一初始信用，无数据维度不按 0 分处理
    if (!contracts.length && !performances.length) {
        return {
            score: INITIAL_CREDIT_SCORE,
            level: INITIAL_CREDIT_LEVEL,
            dimensions: getInitialCreditDimensions(behaviorCredit)
        };
    }

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
    else if (totalScore >= 70) level = 'B';
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
    { ruleId: 'RULE-002', version: 1, name: '客户投诉核实', eventKey: 'customer_complaint', dimension: 'behavior', type: 'negative', scoreDelta: -2, degradeLevel: false, degradeTo: '', enabled: true, description: '经核实的客户投诉，扣 2 分' },
    { ruleId: 'RULE-003', version: 1, name: '行政处罚', eventKey: 'admin_penalty', dimension: 'behavior', type: 'negative', scoreDelta: -5, degradeLevel: true, degradeTo: '', enabled: true, description: '受到行政处罚，扣 5 分并强制降级一档' },
    { ruleId: 'RULE-004', version: 1, name: '报告质量优良', eventKey: 'quality_excellent', dimension: 'quality', type: 'positive', scoreDelta: 1, degradeLevel: false, degradeTo: '', enabled: true, description: '报告获评优良，加 1 分' },
    { ruleId: 'RULE-005', version: 1, name: '合同履约逾期', eventKey: 'delivery_overdue', dimension: 'performance', type: 'negative', scoreDelta: -1, degradeLevel: false, degradeTo: '', enabled: true, description: '未按合同期限交付，扣 1 分' }
];

const LEVEL_ORDER = ['AAA', 'AA', 'A', 'B', 'C'];

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

// 信用分 → 等级换算（与 calculateCreditScoreFromDefaults 口径一致）
function scoreToCreditLevel(s) {
    if (s >= 90) return 'AAA';
    if (s >= 85) return 'AA';
    if (s >= 80) return 'A';
    if (s >= 70) return 'B';
    return 'C';
}

// 生成机构信用时序快照：近5个月每月15日一条（分数由当前分向前小幅递减，趋势上行）+ 今天一条
function buildSeedSnapshots(orgId, score, level) {
    var arr = [];
    var seedNum = 0;
    for (var k = 0; k < orgId.length; k++) seedNum += orgId.charCodeAt(k);
    var pad = function(n) { return String(n).padStart(2, '0'); };
    for (var m = 5; m >= 1; m--) {
        var d = new Date();
        d.setMonth(d.getMonth() - m);
        d.setDate(15);
        var dateStr = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
        var delta = Math.round((seedNum % 3 + 1) * m * 0.6);
        var s = Math.max(60, +(score - delta).toFixed(1));
        arr.push({ date: dateStr, score: s, level: scoreToCreditLevel(s) });
    }
    arr.push({ date: todayStr(), score: score, level: level });
    return arr;
}

// 存量数据迁移：无历史快照的机构按当前分向前铺 5 个月历史，保证趋势图可回溯
function backfillCreditSnapshotHistory(data) {
    data = data || getTPData();
    if (!data.credit) return;
    var now = new Date();
    var monthStart = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';
    Object.keys(data.credit).forEach(function(orgId) {
        var record = data.credit[orgId];
        if (!record.snapshots) record.snapshots = [];
        var hasHistory = record.snapshots.some(function(s) { return String(s.date) < monthStart; });
        if (hasHistory || record.score == null) return;
        var hist = buildSeedSnapshots(orgId, record.score, record.creditLevel);
        hist.pop();
        record.snapshots = hist.concat(record.snapshots);
    });
}

function getCreditRuleConfig() {
    const data = getTPData();
    const rules = data.creditRules ? data.creditRules.slice() : DEFAULT_CREDIT_RULES.slice();
    // 口径修正：客户投诉归入行为信用（标书口径：行为信用含违规记录、投诉情况）
    rules.forEach(r => { if (r.eventKey === 'customer_complaint' && r.dimension === 'satisfaction') r.dimension = 'behavior'; });
    return {
        rules: rules,
        version: data.creditRuleVersion || 1,
        lastCalcTime: data.creditLastCalcTime || ''
    };
}

function saveCreditRuleConfig(config) {
    const data = getTPData();
    const oldRules = (data.creditRules ? data.creditRules.slice() : DEFAULT_CREDIT_RULES.slice());
    const newRules = (config.rules || []).slice();
    const oldVersion = data.creditRuleVersion || 1;
    const newVersion = config.version || 1;
    data.creditRules = newRules;
    data.creditRuleVersion = newVersion;
    data.creditLastCalcTime = config.lastCalcTime || '';
    // 版本发生变化时自动存档快照，形成规则版本历史
    if (newVersion !== oldVersion) {
        if (!Array.isArray(data.creditRuleHistory)) data.creditRuleHistory = [];
        if (data.creditRuleHistory.length === 0) {
            data.creditRuleHistory.unshift({
                version: oldVersion,
                time: '',
                summary: '变更前基线版本',
                rules: oldRules.map(r => Object.assign({}, r))
            });
        }
        data.creditRuleHistory.unshift({
            version: newVersion,
            time: nowStr(),
            summary: summarizeRuleChange(oldRules, newRules),
            rules: newRules.map(r => Object.assign({}, r))
        });
        if (data.creditRuleHistory.length > 20) data.creditRuleHistory.length = 20;
    }
    saveTPData(data);
}

// 对比新旧规则集，生成变更摘要
function summarizeRuleChange(oldRules, newRules) {
    const parts = [];
    const oldMap = {};
    (oldRules || []).forEach(r => { oldMap[r.ruleId] = r; });
    const newMap = {};
    (newRules || []).forEach(r => { newMap[r.ruleId] = r; });
    newRules.forEach(r => {
        const old = oldMap[r.ruleId];
        if (!old) { parts.push('新增规则「' + r.name + '」'); return; }
        if (JSON.stringify(old) !== JSON.stringify(r)) {
            if (old.enabled !== r.enabled && old.scoreDelta === r.scoreDelta && old.name === r.name) {
                parts.push((r.enabled ? '启用' : '禁用') + '规则「' + r.name + '」');
            } else {
                parts.push('编辑规则「' + r.name + '」');
            }
        }
    });
    oldRules.forEach(r => {
        if (!newMap[r.ruleId]) parts.push('删除规则「' + r.name + '」');
    });
    return parts.length ? parts.join('；') : '规则配置更新';
}

function getCreditRuleHistory() {
    const data = getTPData();
    return Array.isArray(data.creditRuleHistory) ? data.creditRuleHistory.slice() : [];
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
        else if (finalScore >= 70) finalLevel = 'B';
        else finalLevel = 'C';
    }

    return {
        score: Math.round(finalScore),
        level: finalLevel,
        dimensions: calc.dimensions
    };
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
        addCreditSnapshot(orgId, calc.score, calc.level, { skipSave: true, data: data });
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
    const data = opts.data || getTPData();
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

function migrateCreditSnapshots(data) {
    data = data || getTPData();
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

// ==================== 报告交付提醒消息推送 ====================
// 自动生成提醒任务：扫描未验收合同的服务期限，向机构推送系统消息 + 模拟短信，提醒按时上传鉴定报告
function getAllNotifications() {
    return getTPData().notifications || [];
}
function getNotificationsByOrgId(orgId) {
    return getAllNotifications().filter(function(n) { return n.orgId === orgId; })
        .sort(function(a, b) { return b.time > a.time ? 1 : -1; });
}
function getUnreadNotificationCount(orgId) {
    return getAllNotifications().filter(function(n) { return n.orgId === orgId && !n.read; }).length;
}
function markNotificationRead(notificationId) {
    var data = getTPData();
    var n = (data.notifications || []).find(function(x) { return x.notificationId === notificationId; });
    if (!n || n.read) return;
    n.read = true;
    n.readTime = nowStr();
    saveTPData(data);
}
function markAllNotificationsRead(orgId) {
    var data = getTPData();
    var changed = false;
    (data.notifications || []).forEach(function(n) {
        if (n.orgId === orgId && !n.read) { n.read = true; n.readTime = nowStr(); changed = true; }
    });
    if (changed) saveTPData(data);
}
// 提醒规则配置（规则引擎简化版：总开关 / 提前提醒天数列表 / 逾期频率 / 推送渠道可调）
// 读取时与默认值合并，存量数据无 reminderRule 字段也能直接使用，无需重置
var DEFAULT_REMINDER_RULE = {
    enabled: true,          // 提醒任务总开关
    days: [7, 3, 1],        // 提前提醒天数（降序）；最小档=紧急，最大档=提示，中间档=预警
    overdueDaily: true,     // 逾期后每日提醒（关闭则逾期不提醒）
    channelSystem: true,    // 系统消息
    channelSms: true        // 短信推送（模拟）
};
function getReminderRuleConfig() {
    var data = getTPData();
    var cfg = data.reminderRule || {};
    var days = (Array.isArray(cfg.days) ? cfg.days : DEFAULT_REMINDER_RULE.days)
        .map(function(n) { return parseInt(n, 10); })
        .filter(function(n) { return !isNaN(n) && n > 0; });
    days = days.filter(function(n, i) { return days.indexOf(n) === i; }).sort(function(a, b) { return b - a; });
    if (!days.length) days = DEFAULT_REMINDER_RULE.days.slice();
    return {
        enabled: cfg.enabled !== false,
        days: days,
        overdueDaily: cfg.overdueDaily !== false,
        channelSystem: cfg.channelSystem !== false,
        channelSms: cfg.channelSms !== false
    };
}
function saveReminderRuleConfig(cfg) {
    var data = getTPData();
    data.reminderRule = cfg;
    saveTPData(data);
}
// 命中天数档位的提醒级别：最小档=urgent，最大档=notice，其余=warning
function reminderLevelForDay(matchedDay, daysDesc) {
    if (daysDesc.length <= 1) return 'warning';
    if (matchedDay === daysDesc[daysDesc.length - 1]) return 'urgent';
    if (matchedDay === daysDesc[0]) return 'notice';
    return 'warning';
}
// 按合同服务期限自动生成提醒消息（按 合同+级别+日期 去重），返回本次新增条数
function generateReportReminders() {
    var data = getTPData();
    if (!data.notifications) data.notifications = [];
    var rule = getReminderRuleConfig();
    if (!rule.enabled) return 0;
    var channels = [];
    if (rule.channelSystem) channels.push('system');
    if (rule.channelSms) channels.push('sms');
    if (!channels.length) return 0; // 未启用任何推送渠道
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var dateKey = todayStr();
    var created = 0;
    (data.contracts || []).forEach(function(c) {
        if (!c || c.status === '已验收') return;
        if (c.reports && c.reports.length) return; // 已上传报告不再提醒
        if (!c.servicePeriod) return;
        var parts = c.servicePeriod.split('~');
        if (parts.length < 2) return;
        var deadline = new Date(parts[1].trim());
        if (isNaN(deadline.getTime())) return;
        deadline.setHours(0, 0, 0, 0);
        var diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        var level = null, levelText = '';
        if (diffDays < 0) {
            if (!rule.overdueDaily) return; // 规则关闭逾期提醒
            level = 'overdue'; levelText = '报告已逾期 ' + Math.abs(diffDays) + ' 天';
        } else {
            // 命中规则天数窗口：取最小命中档位定级别
            var matched = rule.days.filter(function(d) { return diffDays <= d; });
            if (!matched.length) return;
            var matchedDay = Math.min.apply(null, matched);
            level = reminderLevelForDay(matchedDay, rule.days);
            levelText = (level === 'urgent' ? '距交付期限仅剩 ' : '距交付期限剩 ') + diffDays + ' 天';
        }
        if (!level) return;
        var dedupeKey = c.contractId + '|' + level + '|' + dateKey;
        if (data.notifications.some(function(n) { return n.dedupeKey === dedupeKey; })) return;
        var org = (data.orgs || []).find(function(o) { return o.orgId === c.orgId; }) || {};
        var deadlineStr = parts[1].trim();
        data.notifications.push({
            notificationId: 'MSG-' + Date.now() + '-' + Math.floor(Math.random() * 900 + 100),
            dedupeKey: dedupeKey,
            orgId: c.orgId || '',
            orgName: c.orgName || '',
            type: '报告上传提醒',
            level: level,
            title: levelText + '，请按时上传鉴定报告',
            content: '【报告上传提醒】' + (c.orgName || '') + '：贵机构承接的"' + (c.projectName || '') + '"（合同编号 ' + c.contractId + '）交付期限为 ' + deadlineStr + '，' + levelText + '，请及时完成鉴定工作并上传鉴定报告。',
            contractId: c.contractId,
            projectName: c.projectName || '',
            deadline: deadlineStr,
            diffDays: diffDays,
            channels: channels,
            sms: rule.channelSms ? { phone: org.phone || '', status: '已送达', time: nowStr() } : null,
            read: false,
            time: nowStr()
        });
        created++;
    });
    if (created > 0) saveTPData(data);
    return created;
}
