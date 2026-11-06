// 临时验证脚本：三层档案数据层补齐（vm 沙箱加载 house-arch-data.js）
const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('js/house-arch-data.js', 'utf8');
const store = {};
const sandbox = {
    console,
    localStorage: {
        getItem: k => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: k => { delete store[k]; }
    },
    fetch: undefined,
    window: {},
    document: { addEventListener: () => {}, querySelectorAll: () => [] }
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const ensure = sandbox.ensureRiskArchiveLayer;
const normalize = sandbox.normalizeHouseRecord;
if (typeof ensure !== 'function') throw new Error('ensureRiskArchiveLayer 未导出');
if (typeof normalize !== 'function') throw new Error('normalizeHouseRecord 未导出');

// 样例：1 房 2 隐患（1 整治中 + 1 已销号），1 份鉴定被治理事件引用
const rec = {
    no: 'NF-2025-00001',
    risk: 'warning', riskLevel: '第二类', governance: 'doing',
    hazardRecords: [
        { id: 'HZ-NF-2025-00001-001', currentStatus: '整治中', initialJudge: '第二类', createdAt: '2024-06-01T09:00:00', createdBy: '王建国', sourceType: '排查', sourceId: 'INS-1', description: '墙体开裂' },
        { id: 'HZ-NF-2025-00001-002', currentStatus: '已销号', initialJudge: '第三类', createdAt: '2024-05-01T09:00:00', createdBy: '李强', sourceType: '巡查', sourceId: 'PAT-1', description: '屋面渗漏' }
    ],
    hazardDynamics: [
        { id: 'DYN-1', hazardId: 'HZ-NF-2025-00001-001', actionType: '登记', actionTime: '2024-06-01 09:00', operator: '王建国' },
        { id: 'DYN-2', hazardId: 'HZ-NF-2025-00001-001', actionType: '管控', actionTime: '2024-06-05 10:00', operator: '张伟', content: '设置围挡' },
        { id: 'DYN-3', hazardId: 'HZ-NF-2025-00001-002', actionType: '登记', actionTime: '2024-05-01 09:00', operator: '李强' }
    ],
    riskRecords: [
        { id: 'RR-001', hazardId: 'HZ-NF-2025-00001-001', riskLevel: '第二类', sourceType: '排查', sourceId: 'INS-1', createdAt: '2024-06-01T09:00:00' },
        { id: 'RR-002', hazardId: 'HZ-NF-2025-00001-002', riskLevel: '第三类', sourceType: '巡查', sourceId: 'PAT-1', createdAt: '2024-05-01T09:00:00' }
    ],
    governanceEvents: [
        { eventId: 'GE-RR-001', riskRecordId: 'RR-001', hazardId: 'HZ-NF-2025-00001-001', createdAt: '2024-06-02T08:00:00', status: '待治理', data: { appraisalReports: [{ id: 'APP-NF-2025-00001-001' }] } }
    ],
    appraisalReports: [
        { id: 'APP-NF-2025-00001-001', orgName: '奉贤区房屋安全鉴定中心', conclusion: 'B级', appraisalDate: '2024-06-03' }
    ],
    inspectionRecords: [], patrolRecords: [], manageRecords: [], projectRecords: [], closeInfo: { reportTime: '2024-08-01 10:00', reporter: '李志强' }
};

ensure(rec);

const r1 = rec.riskRecords[0], r2 = rec.riskRecords[1], ap = rec.appraisalReports[0];
const assert = (cond, msg) => { if (!cond) throw new Error('断言失败: ' + msg); console.log('  ✓ ' + msg); };

console.log('--- 风险级档案 ---');
assert(r1.archiveNo === 'RA-NF-2025-00001-001', 'r1.archiveNo = ' + r1.archiveNo);
assert(r1.stage === 'rectifying' && r1.stageLabel === '整治中', 'r1.stage = ' + r1.stage + '/' + r1.stageLabel);
assert(r1.appraisalIds.length === 1 && r1.appraisalIds[0] === 'APP-NF-2025-00001-001', 'r1.appraisalIds 关联治理事件鉴定');
assert(r1.timeline.length === 3, 'r1.timeline = ' + r1.timeline.length + ' 条（登记+管控+治理链）: ' + r1.timeline.map(t => t.title).join('→'));
assert(r2.archiveNo === 'RA-NF-2025-00001-002', 'r2.archiveNo = ' + r2.archiveNo);
assert(r2.stage === 'closed' && r2.stageLabel === '已销号', 'r2.stage = ' + r2.stage + '/' + r2.stageLabel);
assert(r2.timeline.some(t => t.node === 'close'), 'r2.timeline 含验收销号节点');

console.log('--- 鉴定级档案 ---');
assert(ap.appraisalNo === 'JD-NF-2025-00001-001', 'ap.appraisalNo = ' + ap.appraisalNo);
assert(ap.effectScope === 'risk', 'ap.effectScope = ' + ap.effectScope);
assert(ap.appliedTo.length === 1 && ap.appliedTo[0].targetId === 'RA-NF-2025-00001-001', 'ap.appliedTo 指向风险档案编号');
assert(rec._riskArchiveVersion === 1, '_riskArchiveVersion = ' + rec._riskArchiveVersion);

console.log('--- 幂等性（再跑一次）---');
const tlBefore = JSON.stringify(rec.riskRecords.map(r => r.timeline));
ensure(rec);
assert(r1.archiveNo === 'RA-NF-2025-00001-001' && ap.appliedTo.length === 1, '编号不重编、appliedTo 不重复');
assert(JSON.stringify(rec.riskRecords.map(r => r.timeline)) === tlBefore, 'timeline 不重复播种');

console.log('--- normalizeHouseRecord 集成 ---');
const bare = { no: 'NF-2025-00099' };
normalize(bare);
assert(Array.isArray(bare.riskRecords) && bare._riskArchiveVersion === 1, '空记录也完成档案层初始化');
assert(bare.riskLevel === '第二类', '原有规范化逻辑不受影响（riskLevel=' + bare.riskLevel + '）');

console.log('--- 风险信息规范字段（6.1.2.17.2）---');
assert(r1.riskNo === 'RSK-RA-NF-2025-00001-001', 'r1.riskNo = ' + r1.riskNo);
assert(r1.riskName.indexOf('第二类') !== -1, 'r1.riskName 含等级: ' + r1.riskName);
assert(r1.discoveryMethod === '排查发现', 'r1.discoveryMethod = ' + r1.discoveryMethod);
assert(r2.discoveryMethod === '巡查发现', 'r2.discoveryMethod = ' + r2.discoveryMethod);
assert(r1.riskPart === '', 'r1.riskPart 无部位数据时为空（样例隐患未设 location）= "' + r1.riskPart + '"');
assert(r1.relatedHouse === 'NF-2025-00001', 'r1.relatedHouse = ' + r1.relatedHouse);
assert(r1.relatedInspectionId === 'INS-1', 'r1.relatedInspectionId = ' + r1.relatedInspectionId);
assert(r2.relatedPatrolId === 'PAT-1', 'r2.relatedPatrolId = ' + r2.relatedPatrolId);
// 幂等：再跑一遍不覆盖已有规范字段
r1.riskName = '自定义名称';
ensure(rec);
assert(r1.riskName === '自定义名称', '规范字段补齐幂等，不覆盖已有值');
// 清单库（const 声明不挂沙箱全局，需 runInContext 取值；浏览器中跨脚本可正常引用）
const lib = vm.runInContext('RISK_TYPE_LIBRARY', sandbox);
assert(typeof lib === 'object' && lib['裂缝'], '风险清单库已导出（含 裂缝）');
assert(lib['裂缝'].descTemplate.indexOf('{part}') !== -1, '裂缝模板含部位占位符');
assert(Object.keys(lib).length === 10, '清单库覆盖 10 类');

console.log('--- 监测点 / 消息通知（6.1.2.17.2）---');
const genMp = vm.runInContext('generateMonitorPoints', sandbox);
const mps = genMp('NF-2025-00001');
assert(mps.length >= 3 && mps.length <= 5, '监测点 3-5 个：' + mps.length);
assert(mps[0].id === 'MP-NF-2025-00001-01', '监测点编号规则：' + mps[0].id);
assert(mps.every(p => p.type && p.location && p.status), '监测点字段齐全（type/location/status）');
assert(JSON.stringify(genMp('NF-2025-00001')) === JSON.stringify(mps), '监测点生成幂等（同编号同结果）');
assert(Array.isArray(bare.monitorPoints) && bare.monitorPoints.length >= 3, 'normalizeHouseRecord 自动补监测点');
const pushN = vm.runInContext('pushNotification', sandbox);
const getN = vm.runInContext('getNotifications', sandbox);
pushN({ no: 'NF-2025-00001', owner: '陈连明', responsiblePerson: '张伟' }, { riskName: '测试风险', hazardType: '裂缝', riskLevel: '第二类', location: '屋面' }, '新风险录入');
const nlist = getN();
assert(nlist.length === 2, '推送 2 条（户主+责任人）：' + nlist.length);
assert(nlist[0].receiver === '张伟' && nlist[1].receiver === '陈连明', '接收人正确');
assert(nlist[0].read === false && nlist[0].title.indexOf('新风险录入') !== -1, '通知未读 + 标题含动作');

console.log('--- 责任单位归属（6.1.2.17.3）---');
const recResp = vm.runInContext('recommendResponsibility', sandbox);
const ensureResp = vm.runInContext('ensureRiskResponsibility', sandbox);
// rec 首跑 ensure 时已回填：no=NF-2025-00001 演示种为低保户 → R6 命中
const resp0 = rec.riskRecords[0].responsibility;
assert(resp0 && resp0.ruleId === 'R6' && resp0.status === '初指', '回填责任单位（低保户→R6）：' + resp0.ruleId);
assert(resp0.primary.type === 'owner' && resp0.support.length === 2 && resp0.support[0].type === 'village' && resp0.support[1].type === 'town', 'R6 主责=户主，配合=村委会+乡镇政府');
assert(resp0.confirmFlow.length === 1 && resp0.confirmFlow[0].step === '网格员初指', '确认流程初始=网格员初指');
// R2 承重结构：摘掉困难标签后按部位关键词命中
const savedTag = rec.difficultyTag;
delete rec.difficultyTag;
rec.riskRecords[0].riskPart = '承重墙';
const sug1 = recResp(rec, rec.riskRecords[0]);
assert(sug1.ruleId === 'R2' && sug1.primary.type === 'owner', 'R2 承重结构规则命中：' + sug1.ruleName);
// R7 兜底：困难群体 + D级
rec.difficultyTag = '低保户';
rec.appraisalReports[0].conclusion = 'D级';
const sug3 = recResp(rec, rec.riskRecords[0]);
assert(sug3.ruleId === 'R7' && sug3.primary.type === 'town', 'R7 乡镇兜底：' + sug3.primary.name);
assert(sug3.reason.indexOf('兜底') !== -1 && sug3.reason.indexOf('补助') !== -1, 'R7 理由含兜底+补助');
// R4 出租共担
rec.appraisalReports[0].conclusion = 'B级';
delete rec.difficultyTag;
rec.usage = { usageType: '出租' };
const sug4 = recResp(rec, rec.riskRecords[0]);
assert(sug4.ruleId === 'R4' && sug4.support[0].type === 'user', 'R4 出租共担（户主+使用人）');
delete rec.usage;
rec.difficultyTag = savedTag;
// 幂等
const before2 = JSON.stringify(resp0);
ensureResp(rec);
assert(JSON.stringify(rec.riskRecords[0].responsibility) === before2, '责任单位回填幂等');
// 多级确认推进
const confirmFn = vm.runInContext('confirmResponsibilityStep', sandbox);
assert(confirmFn(rec, 'RR-001', '村委书记') === true && resp0.status === '村委确认', '初指→村委确认');
assert(confirmFn(rec, 'RR-001', '镇复核员') === true && resp0.status === '乡镇复核', '村委确认→乡镇复核');
assert(confirmFn(rec, 'RR-001', '镇复核员') === false, '末级后不可再推进');
assert(resp0.confirmFlow.length === 3, '确认流程 3 节点齐全');
// 变更履历 + 通知
rec.owner = '陈连明'; rec.responsiblePerson = '王建国';
const changeFn = vm.runInContext('changeResponsibleUnit', sandbox);
const n0 = getN().length;
assert(changeFn(rec, 'RR-001', { type: 'village', reason: '户主失能，村委会代管代修', operator: '镇复核员' }) === true, '变更执行成功');
const log = resp0.changeLogs[0];
assert(log.from.indexOf('户主') !== -1 && log.to.indexOf('村委会') !== -1 && log.reason.indexOf('代管代修') !== -1, '变更履历含from/to/reason');
assert(resp0.primary.type === 'village', '主责已变更为村委会');
assert(getN().length === n0 + 2, '变更后推送通知（户主+责任人）');

console.log('--- 整改措施与执行期限（6.1.2.17.4）---');
const sugDl = vm.runInContext('suggestDeadline', sandbox);
const dl1 = sugDl('第一类', '2024-06-01');
assert(dl1.urgent === true && dl1.text.indexOf('24小时') !== -1, '第一类→24小时紧急时限');
const dl2 = sugDl('第二类', '2024-06-01');
assert(dl2.date === '2024-12-01' && dl2.text.indexOf('3-6个月') !== -1, '第二类→6个月限时：' + dl2.date);
const dlFarm = sugDl('第三类', '2024-09-01');
assert(dlFarm.date === '2025-11-01' && dlFarm.farmNote.indexOf('避开农忙') !== -1, '农忙避让（9月+12月=次年9月撞秋收→顺延11月）：' + dlFarm.date + ' ' + dlFarm.farmNote);
const dlFarm2 = sugDl('第二类', '2024-11-01');
assert(dlFarm2.date === '2025-07-01' && dlFarm2.farmNote.indexOf('7月') !== -1, '第二类撞夏收顺延：' + dlFarm2.date);
assert(sugDl('第一类', '2024-05-01').farmNote === '', '紧急时限不避让农忙');
const lib0 = vm.runInContext('getMeasureLibrary', sandbox)();
assert(lib0.length === 9 && lib0[0].tag === '地基加固', '措施库预置 9 项（含标签）');
assert(lib0.every(m => m.desc && m.requirement && m.dutyAdvice && m.acceptStd), '措施模板五要素齐全');
const pickFn = vm.runInContext('pickMeasuresForRisk', sandbox);
const picks = pickFn({ riskType: '裂缝', riskPart: '承重墙', riskDesc: '墙体开裂' });
assert(picks.length === 2 && picks[0] === 'ML-QT-01', '裂缝→墙体加固措施：' + picks.join(','));
const picks2 = pickFn({ riskType: '渗漏', riskPart: '屋面' });
assert(picks2[0] === 'ML-WM-01', '屋面渗漏→屋面维修措施：' + picks2.join(','));
// ensureRectPlan 回填（rec 首跑 ensure 时已触发）
const rp0 = rec.riskRecords[0].rectPlan;
assert(rp0 && rp0.deadline && rp0.measureIds.length >= 1, 'rectPlan 回填（期限 ' + rp0.deadline + '，措施 ' + rp0.measureIds.join(',') + '）');
assert(rp0.dispatchStatus === '待派发' && Array.isArray(rp0.deadlineAdjusts), 'rectPlan 初始状态正确');
const rpBefore = JSON.stringify(rp0);
const ensureRp = vm.runInContext('ensureRectPlan', sandbox);
ensureRp(rec);
assert(JSON.stringify(rec.riskRecords[0].rectPlan) === rpBefore, 'rectPlan 回填幂等');
// 时限调整留痕
const adjFn = vm.runInContext('adjustRectDeadline', sandbox);
assert(adjFn(rec, 'RR-001', '2026-03-01', '需等待农忙结束后', '技术员') === true, '时限调整成功');
assert(rp0.deadline === '2026-03-01' && rp0.deadlineAdjusts.length === 1, '新时限生效+留痕 1 条');
assert(rp0.deadlineAdjusts[0].reason.indexOf('农忙') !== -1 && rp0.deadlineAdjusts[0].oldDate, '留痕含理由+旧值');
// 派发
const dispFn = vm.runInContext('dispatchRectTask', sandbox);
const n1 = getN().length;
assert(dispFn(rec, 'RR-001') === true && rp0.dispatchStatus === '已派发', '任务派发成功');
assert(rp0.dispatchedTo.length === 4 && rp0.dispatchedTo[0].name.indexOf('村委会') !== -1, '派发对象=责任单位（已变更为村委会）+3抄送，实际：' + rp0.dispatchedTo[0].name);
assert(getN().length === n1 + 2, '派发推送通知');
assert(dispFn(rec, 'RR-001') === false, '重复派发被拦截');
// 时限状态判定
const dlStatus = vm.runInContext('getDeadlineStatus', sandbox);
assert(dlStatus('2020-01-01').overdue === true, '超期判定');
assert(dlStatus('2099-01-01').cls === 'safe', '正常判定');
// 措施库增删改
const upsertM = vm.runInContext('upsertMeasureLibItem', sandbox);
const delM = vm.runInContext('deleteMeasureLibItem', sandbox);
upsertM({ id: 'ML-TEST-01', tag: '临时新增', name: '测试措施', desc: 'd', requirement: 'r', dutyAdvice: 'da', acceptStd: 'a' });
assert(vm.runInContext('getMeasureLibrary', sandbox)().length === 10, '措施库新增');
upsertM({ id: 'ML-TEST-01', tag: '临时新增', name: '测试措施改', desc: 'd', requirement: 'r', dutyAdvice: 'da', acceptStd: 'a' });
assert(vm.runInContext('getMeasureLibrary', sandbox)().length === 10, '措施库编辑不增项');
delM('ML-TEST-01');
assert(vm.runInContext('getMeasureLibrary', sandbox)().length === 9, '措施库删除');

console.log('--- 风险处理过程监控（6.1.2.17.5）---');
const advP = vm.runInContext('advanceRectProcess', sandbox);
const chkP = vm.runInContext('checkProcessOverdue', sandbox);
const escP = vm.runInContext('escalateProcessOverdue', sandbox);
// RR-001 已派发（前段 dispatchRectTask 已执行）→ 播种到待接收
const proc0 = rec.riskRecords[0].rectProcess;
assert(proc0 && proc0.status === 'pendingReceive', '已派发风险播种至待接收');
assert(proc0.history.length === 1 && proc0.history[0].state === 'dispatch', 'history 播种派发事件');
// 流转合法性
assert(advP(rec, 'RR-001', { to: 'rectifying', note: 'x' }).ok === false, '非法流转被拦截（待接收→整改实施）');
// 必传材料校验：现场复核缺照片
const miss = advP(rec, 'RR-001', { to: 'siteReview', note: '复核完毕' });
assert(miss.ok === false && miss.msg.indexOf('现场照片') !== -1, '必传材料缺失拦截：' + miss.msg);
// 完整推进：现场复核
const tl0 = rec.riskRecords[0].timeline.length;
const n2 = getN().length;
const ok1 = advP(rec, 'RR-001', { to: 'siteReview', note: '结构裂缝宽度0.4mm', photos: ['p1.jpg'], operator: '村支书' });
assert(ok1.ok === true && proc0.status === 'siteReview', '流转至现场复核');
assert(proc0.history.length === 2 && rec.riskRecords[0].timeline.length === tl0 + 1, 'history+timeline 双记录');
assert(getN().length === n2 + 2, '流转推送通知');
// 走完全流程：临时措施→工匠→材料→实施→验证
assert(advP(rec, 'RR-001', { to: 'tempMeasure', photos: ['p2.jpg'], evacuation: '已撤离2人' }).ok === true, '临时措施');
assert(advP(rec, 'RR-001', { to: 'artisanPick', artisan: '乡村工匠张师傅' }).ok === true, '工匠选择');
assert(advP(rec, 'RR-001', { to: 'materialPrep', photos: ['p3.jpg'], purchase: '采购单001' }).ok === true, '材料准备');
assert(advP(rec, 'RR-001', { to: 'rectifying', note: '墙面挂网抹面', photos: ['p4.jpg'] }).ok === true, '整改实施');
assert(advP(rec, 'RR-001', { to: 'effectVerify', photos: ['p5.jpg'], conclusion: '裂缝不再发展' }).ok === true, '效果验证');
// 验收驳回闭环
const rej = vm.runInContext('rejectRectProcess', sandbox);
assert(rej(rec, 'RR-001', '局部抹面空鼓，需返工', '镇管理员').ok === true, '验收驳回');
assert(proc0.status === 'rejected' && proc0.history[proc0.history.length - 1].state === 'rejected', '驳回状态+记录');
assert(advP(rec, 'RR-001', { to: 'accepted' }).ok === false, '驳回态不可直接验收');
assert(advP(rec, 'RR-001', { to: 'rectifying', note: '返工完成', photos: ['p6.jpg'] }).ok === true, '驳回→退回整改实施');
// 验收通过（终态）
assert(advP(rec, 'RR-001', { to: 'effectVerify', photos: ['p7.jpg'], conclusion: '复验合格' }).ok === true, '二次效果验证');
assert(advP(rec, 'RR-001', { to: 'accepted', note: '归档' }).ok === true, '验收通过归档');
assert(advP(rec, 'RR-001', { to: 'rectifying' }).ok === false, '终态不可再流转');
// 超期检测：RR-002 未派发（无状态）；构造超期场景
const chk1 = chkP(rec, rec.riskRecords[1]);
assert(chk1.overdue === false, '未派发风险不超期');
// 手工构造：status=tempMeasure, statusSince=20天前（sla 2天，超18天→县级）
rec.riskRecords[1].rectProcess = { status: 'tempMeasure', statusSince: '2026-10-14 08:00', history: [], overdueLevel: '' };
const chk2 = chkP(rec, rec.riskRecords[1]);
assert(chk2.overdue === true && chk2.escalateTo === 'county', '超18天→上报县级：' + chk2.escalateTo);
const n3 = getN().length;
assert(escP(rec, 'RR-002') === true, '超期升级通知已发');
assert(getN().length === n3 + 2, '升级预警推送');
assert(rec.riskRecords[1].rectProcess.overdueLevel === 'county', '同级不重复标记');
assert(escP(rec, 'RR-002') === false, '同级不重复通知');
// 超时未接收特例
rec.riskRecords[1].rectProcess = { status: 'pendingReceive', statusSince: '2026-10-25 08:00', history: [], overdueLevel: '' };
const chk3 = chkP(rec, rec.riskRecords[1]);
assert(chk3.overdue === true && chk3.stateLabel === '待接收', '超时未接收检测');
escP(rec, 'RR-002');
const tlLast = rec.riskRecords[1].timeline[rec.riskRecords[1].timeline.length - 1];
assert(tlLast.title.indexOf('上门告知') !== -1 || tlLast.content.indexOf('上门告知') !== -1, '超时未接收→上门告知通知');
// ensureRectProcess 幂等
const histLen = rec.riskRecords[0].rectProcess.history.length;
vm.runInContext('ensureRectProcess', sandbox)(rec);
assert(rec.riskRecords[0].rectProcess.history.length === histLen && rec.riskRecords[0].rectProcess.status === 'accepted', 'rectProcess 回填幂等');

console.log('--- 风险控制效果评估（6.1.2.17.6）---');
// 合成多房屋数据：2 房，房A 有2条同类风险（复发）1条已验收+满意，房B 第三类危房已解危
const mkHouse = (no, street, village, structure, buildYear, riskLevel, governance, closeStatus, risks) => ({
    no, street, village, houseType: '农村自建房', structure: { structureType: structure }, buildYear,
    riskLevel, governance, closeStatus,
    riskRecords: risks
});
const mkRisk = (id, type, level, done, deadline, acceptTime, verifyConcl, stars) => ({
    id, riskType: type, riskLevel: level,
    rectPlan: done || deadline ? { deadline: deadline || '2026-12-01' } : null,
    rectProcess: done ? { status: 'accepted', statusSince: acceptTime, history: [
        { state: 'effectVerify', time: '2026-10-01', content: verifyConcl },
        { state: 'accepted', time: acceptTime }
    ] } : { status: 'rectifying', statusSince: '2026-10-20', history: [] },
    satisfaction: stars ? { stars: stars } : null
});
const houses = [
    mkHouse('NF-A', '西渡街道', '北新村', '砖混结构', '1985', '第二类', 'doing', '', [
        mkRisk('RA-1', '裂缝', '第二类', true, '2026-11-01', '2026-10-25 10:00', '复验合格，裂缝不再发展', 5),
        mkRisk('RA-2', '裂缝', '第二类', false, null, null, null, null)   // 同类复发
    ]),
    mkHouse('NF-B', '西渡街道', '南渡村', '土木结构', '1975', '第三类', 'done', '已通过', [
        mkRisk('RB-1', '变形', '第三类', true, '2026-09-01', '2026-10-05 10:00', '结构稳定', 4)
    ])
];
const cem = vm.runInContext('computeEffectMetrics', sandbox);
const m6 = cem(houses);
assert(m6.totalRisks === 3 && m6.rectified === 2, '风险总数3/已整改2');
assert(m6.completionRate === 66.7, '完成率 66.7%：' + m6.completionRate);
assert(m6.timelinessRate === 50, '及时率 50%（1按期1超期）：' + m6.timelinessRate);
assert(m6.effectivenessRate === 100, '有效率 100%（结论均合格）：' + m6.effectivenessRate);
assert(m6.recurrenceRate === 50, '复发率 50%（2家有风险的房中1家复发）：' + m6.recurrenceRate);
assert(m6.recurrenceTimes === 1, '复发次数1');
assert(m6.dangerResolveRate === 100 && m6.dangerTotal === 1, '危房解危率 100%（第三类已销号）');
assert(m6.satisfactionAvg === 4.5, '满意度均星 4.5：' + m6.satisfactionAvg);
// 下钻
const drill = vm.runInContext('drillEffectMetrics', sandbox);
const byVillage = drill(houses, 'village');
assert(byVillage.length === 2 && byVillage[0].dim === '北新村', '按村下钻2组：' + byVillage.map(g => g.dim).join('/'));
assert(byVillage[0].metrics.totalRisks === 2, '北新村 2 条风险');
const byYear = drill(houses, 'buildYear');
assert(byYear.length === 2 && byYear.some(g => g.dim === '1980年前'), '按年代分组含1980年前：' + byYear.map(g => g.dim).join('/'));
const byStruct = drill(houses, 'structure');
assert(byStruct.some(g => g.dim === '砖混结构') && byStruct.some(g => g.dim === '土木结构'), '按结构形式分组');
// 高复发类型
const hrt = vm.runInContext('identifyHighRecurrenceTypes', sandbox)(houses);
assert(hrt.length === 1 && hrt[0].type === '裂缝' && hrt[0].times === 1, '高复发类型=裂缝');
// 满意度回填幂等（走 ensureSatisfaction）
const ensSat = vm.runInContext('ensureSatisfaction', sandbox);
const h2 = mkHouse('NF-C', '奉城镇', '洪庙村', '砖木结构', '1990', '第二类', 'done', '', [
    mkRisk('RC-1', '渗漏', '第二类', true, '2026-10-01', '2026-09-20 09:00', '复验合格', null)
]);
ensSat(h2);
assert(h2.riskRecords[0].satisfaction && h2.riskRecords[0].satisfaction.stars >= 4, '满意度回填：' + JSON.stringify(h2.riskRecords[0].satisfaction));
const satBefore = JSON.stringify(h2.riskRecords[0].satisfaction);
ensSat(h2);
assert(JSON.stringify(h2.riskRecords[0].satisfaction) === satBefore, '满意度回填幂等');
// 未验收风险不回填
const h3 = mkHouse('NF-D', '奉城镇', '洪庙村', '砖混', '2000', '第二类', 'doing', '', [
    mkRisk('RD-1', '裂缝', '第二类', false, null, null, null, null)
]);
ensSat(h3);
assert(h3.riskRecords[0].satisfaction == null, '未验收不回填满意度');
// CSV 导出
const csv = vm.runInContext('exportEffectCsv', sandbox)(byVillage, m6);
assert(csv.indexOf('整改完成率') !== -1 && csv.indexOf('北新村') !== -1 && csv.indexOf('66.7') !== -1, 'CSV 含指标+维度+数值');

console.log('\n全部断言通过 ✔');
