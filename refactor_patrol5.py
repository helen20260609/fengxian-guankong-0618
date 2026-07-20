import re

html = open('e:/风险管控0618/pages/patrol-task-management.html', 'rb').read().decode('utf-8', 'ignore')

# 1. 先把所有 gas 链接改为 rural 前缀（在替换 script 之前也处理 body 中的）
html = html.replace('gas-risk-task-add.html', 'rural-risk-task-add.html')
html = html.replace('gas-risk-task-edit.html', 'rural-risk-task-edit.html')
html = html.replace('gas-risk-task-Receivable.html', 'rural-risk-task-receive.html')
html = html.replace('gas-risk-task-allocation.html', 'rural-risk-task-allocation.html')
html = html.replace('gas-risk-task-Reassign.html', 'rural-risk-task-reassign.html')

# 2. 表头“巡查范围”改为“巡查房屋数”
html = html.replace('<th>巡查范围</th>', '<th>巡查房屋数</th>')
html = html.replace('<th>巡查点位数</th>', '<th>巡查房屋数</th>')

# 3. 完全替换 <script>...</script> 块
script_pattern = re.compile(r'<script>.*?</script>', re.DOTALL)

new_script = '''<script>
// Theme sync
window.addEventListener('message', function(e) {
    if (e.data && e.data.action === 'setTheme') {
        document.documentElement.setAttribute('data-theme', e.data.theme);
    }
});

// Demo data
let tasks = [
    // ========== 日常巡查 ==========
    { id: 1, no: 'FX-RW-2025-001', name: "南桥镇经营性自建房日常巡查", type: 'routine', typeLabel: '日常巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 3, town: "南桥镇", village: "张翁庙村", houseType: "自住兼经营", structure: "砖混结构", person: "张建国", createBy: '系统管理员', inspected: 1, total: 3, status: 'processing', statusLabel: '进行中', statusClass: 'processing', hiddenCount: 1, hiddenFixed: 0, startDate: '2025-06-01', endDate: '2025-06-10' },
    { id: 2, no: 'FX-RW-2025-002', name: "奉城镇C级危房专项排查", type: 'routine', typeLabel: '日常巡查', riskLevel: "较大隐患", riskLabel: '较大隐患', houseCount: 5, town: "奉城镇", village: "洪庙村", houseType: "自住", structure: "砖木结构", person: "李秀英", createBy: '系统管理员', inspected: 3, total: 5, status: 'processing', statusLabel: '进行中', statusClass: 'processing', hiddenCount: 0, startDate: '2025-06-15', endDate: '2025-06-30' },
    { id: 3, no: 'FX-RW-2025-003', name: "四团镇危旧房屋安全隐患排查", type: 'routine', typeLabel: '日常巡查', riskLevel: "一般隐患", riskLabel: '一般隐患', houseCount: 4, town: "四团镇", village: "五四村", houseType: "自住", structure: "土木结构", person: "王志强", createBy: '系统管理员', inspected: 4, total: 4, status: 'completed', statusLabel: '已完成', statusClass: 'completed', hiddenCount: 3, hiddenFixed: 0, overdueStatus: 'on-time', startDate: '2025-05-20', endDate: '2025-06-10', finishTime: '2025-06-08 10:00' },
    { id: 4, no: 'FX-RW-2025-004', name: "柘林镇农村自建房汛期检查", type: 'routine', typeLabel: '日常巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 6, town: "柘林镇", village: "新寺村", houseType: "自住兼经营", structure: "砖混结构", person: "陈美华", createBy: '系统管理员', inspected: 6, total: 6, status: 'completed', statusLabel: '已完成', statusClass: 'completed', hiddenCount: 2, hiddenFixed: 2, overdueStatus: 'completed-late', startDate: '2025-05-15', endDate: '2025-06-05', finishTime: '2025-06-07 16:30' },
    { id: 5, no: 'FX-RW-2025-005', name: "庄行镇农房翻建工地巡查", type: 'routine', typeLabel: '日常巡查', riskLevel: "无风险", riskLabel: '无风险', houseCount: 3, town: "庄行镇", village: "潘垫村", houseType: "农房辅助用房", structure: "框架结构", person: "刘大海", createBy: '系统管理员', inspected: 0, total: 3, status: 'issued', statusLabel: '待接收', statusClass: 'issued', hiddenCount: 0, startDate: '2025-06-10', endDate: '2025-06-25' },
    { id: 6, no: 'FX-RW-2025-006', name: "金汇镇农村自建房安全复查", type: 'routine', typeLabel: '日常巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 8, town: "金汇镇", village: "明星村", houseType: "自住", structure: "砖混结构", person: "孙明华", createBy: '系统管理员', inspected: 0, total: 8, status: 'draft', statusLabel: '草稿', statusClass: 'draft', hiddenCount: 0, startDate: '2025-06-08', endDate: '2025-06-30' },
    { id: 7, no: 'FX-RW-2025-007', name: "青村镇经营性自建房联合检查", type: 'routine', typeLabel: '日常巡查', riskLevel: "一般隐患", riskLabel: '一般隐患', houseCount: 4, town: "青村镇", village: "李窑村", houseType: "自住兼经营", structure: "砖木结构", person: "赵敏", createBy: '李秀英', inspected: 0, total: 4, status: 'rejected', statusLabel: '任务回退', statusClass: 'rejected', hiddenCount: 0, startDate: '2025-06-12', endDate: '2025-06-28' },
    { id: 8, no: 'FX-RW-2025-008', name: "海湾镇农房辅助用房专项检查", type: 'routine', typeLabel: '日常巡查', riskLevel: "无风险", riskLabel: '无风险', houseCount: 2, town: "海湾镇", village: "星火村", houseType: "农房辅助用房", structure: "框架结构", person: "周强", createBy: '系统管理员', inspected: 1, total: 2, status: 'terminated', statusLabel: '已终止', statusClass: 'terminated', hiddenCount: 0, startDate: '2025-06-01', endDate: '2025-06-15' },

    // ========== 专项巡查 ==========
    { id: 11, no: 'FX-RW-2025-011', name: "南桥镇农村危房销号核查", type: 'special', typeLabel: '专项巡查', riskLevel: "无风险", riskLabel: '无风险', houseCount: 5, town: "南桥镇", village: "杨王村", houseType: "自住", structure: "砖混结构", person: "吴芳", createBy: '系统管理员', inspected: 2, total: 5, status: 'processing', statusLabel: '进行中', statusClass: 'processing', hiddenCount: 1, hiddenFixed: 0, startDate: '2025-06-01', endDate: '2025-06-10' },
    { id: 12, no: 'FX-RW-2025-012', name: "奉城镇农村自建房安全回头看", type: 'special', typeLabel: '专项巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 3, town: "奉城镇", village: "久茂村", houseType: "自住", structure: "砖木结构", person: "郑辉", createBy: '系统管理员', inspected: 1, total: 3, status: 'processing', statusLabel: '进行中', statusClass: 'processing', hiddenCount: 0, startDate: '2025-06-15', endDate: '2025-06-30' },
    { id: 13, no: 'FX-RW-2025-013', name: "四团镇D级危房紧急排查", type: 'special', typeLabel: '专项巡查', riskLevel: "一般隐患", riskLabel: '一般隐患', houseCount: 8, town: "四团镇", village: "三坎村", houseType: "自住", structure: "土木结构", person: "张建国", createBy: '系统管理员', inspected: 8, total: 8, status: 'completed', statusLabel: '已完成', statusClass: 'completed', hiddenCount: 5, hiddenFixed: 2, overdueStatus: 'on-time', startDate: '2025-05-20', endDate: '2025-06-10', finishTime: '2025-06-08 14:00' },
    { id: 14, no: 'FX-RW-2025-014', name: "柘林镇自建房安全隐患整治复查", type: 'special', typeLabel: '专项巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 6, town: "柘林镇", village: "营房村", houseType: "自住兼经营", structure: "砖混结构", person: "李秀英", createBy: '系统管理员', inspected: 6, total: 6, status: 'completed', statusLabel: '已完成', statusClass: 'completed', hiddenCount: 1, hiddenFixed: 1, overdueStatus: 'completed-late', startDate: '2025-05-15', endDate: '2025-06-05', finishTime: '2025-06-07 10:30' },
    { id: 15, no: 'FX-RW-2025-015', name: "庄行镇农村自建房网格化巡查", type: 'special', typeLabel: '专项巡查', riskLevel: "无风险", riskLabel: '无风险', houseCount: 6, town: "庄行镇", village: "张翁庙村", houseType: "自住", structure: "框架结构", person: "王志强", createBy: '系统管理员', inspected: 0, total: 6, status: 'issued', statusLabel: '待接收', statusClass: 'issued', hiddenCount: 0, startDate: '2025-06-10', endDate: '2025-06-25' },
    { id: 16, no: 'FX-RW-2025-016', name: "金汇镇老旧自建房安全体检", type: 'special', typeLabel: '专项巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 2, town: "金汇镇", village: "洪庙村", houseType: "自住", structure: "砖木结构", person: "陈美华", createBy: '系统管理员', inspected: 0, total: 2, status: 'draft', statusLabel: '草稿', statusClass: 'draft', hiddenCount: 0, startDate: '2025-06-12', endDate: '2025-06-28' },
    { id: 17, no: 'FX-RW-2025-017', name: "青村镇农房风险点常态化巡查", type: 'special', typeLabel: '专项巡查', riskLevel: "一般隐患", riskLabel: '一般隐患', houseCount: 4, town: "青村镇", village: "五四村", houseType: "农房辅助用房", structure: "土木结构", person: "刘大海", createBy: '李秀英', inspected: 0, total: 4, status: 'rejected', statusLabel: '任务回退', statusClass: 'rejected', hiddenCount: 0, startDate: '2025-06-15', endDate: '2025-06-30' },
    { id: 18, no: 'FX-RW-2025-018', name: "海湾镇临河自建房防汛专项巡查", type: 'special', typeLabel: '专项巡查', riskLevel: "无风险", riskLabel: '无风险', houseCount: 4, town: "海湾镇", village: "新寺村", houseType: "自住", structure: "框架结构", person: "郑辉", createBy: '系统管理员', inspected: 2, total: 4, status: 'terminated', statusLabel: '已终止', statusClass: 'terminated', hiddenCount: 0, startDate: '2025-06-01', endDate: '2025-06-20' },

    // ========== 临时巡查 ==========
    { id: 21, no: 'FX-RW-2025-021', name: "南桥镇经营性自建房日常巡查", type: 'temporary', typeLabel: '临时巡查', riskLevel: "无风险", riskLabel: '无风险', houseCount: 4, town: "南桥镇", village: "潘垫村", houseType: "自住兼经营", structure: "砖混结构", person: "孙明华", createBy: '系统管理员', inspected: 1, total: 4, status: 'processing', statusLabel: '进行中', statusClass: 'processing', hiddenCount: 1, hiddenFixed: 0, startDate: '2025-06-01', endDate: '2025-06-08' },
    { id: 22, no: 'FX-RW-2025-022', name: "奉城镇C级危房专项排查", type: 'temporary', typeLabel: '临时巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 3, town: "奉城镇", village: "明星村", houseType: "自住", structure: "砖木结构", person: "赵敏", createBy: '系统管理员', inspected: 1, total: 3, status: 'processing', statusLabel: '进行中', statusClass: 'processing', hiddenCount: 0, startDate: '2025-06-15', endDate: '2025-06-25' },
    { id: 23, no: 'FX-RW-2025-023', name: "四团镇危旧房屋安全隐患排查", type: 'temporary', typeLabel: '临时巡查', riskLevel: "一般隐患", riskLabel: '一般隐患', houseCount: 2, town: "四团镇", village: "李窑村", houseType: "自住", structure: "土木结构", person: "张建国", createBy: '系统管理员', inspected: 2, total: 2, status: 'completed', statusLabel: '已完成', statusClass: 'completed', hiddenCount: 2, hiddenFixed: 1, overdueStatus: 'on-time', startDate: '2025-06-10', endDate: '2025-06-15', finishTime: '2025-06-14 09:00' },
    { id: 24, no: 'FX-RW-2025-024', name: "柘林镇农村自建房汛期检查", type: 'temporary', typeLabel: '临时巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 5, town: "柘林镇", village: "星火村", houseType: "自住兼经营", structure: "砖混结构", person: "李秀英", createBy: '系统管理员', inspected: 5, total: 5, status: 'completed', statusLabel: '已完成', statusClass: 'completed', hiddenCount: 1, hiddenFixed: 1, overdueStatus: 'completed-late', startDate: '2025-06-01', endDate: '2025-06-05', finishTime: '2025-06-07 11:00' },
    { id: 25, no: 'FX-RW-2025-025', name: "庄行镇农房翻建工地巡查", type: 'temporary', typeLabel: '临时巡查', riskLevel: "无风险", riskLabel: '无风险', houseCount: 3, town: "庄行镇", village: "杨王村", houseType: "农房辅助用房", structure: "框架结构", person: "周强", createBy: '系统管理员', inspected: 0, total: 3, status: 'issued', statusLabel: '待接收', statusClass: 'issued', hiddenCount: 0, startDate: '2025-06-12', endDate: '2025-06-20' },
    { id: 26, no: 'FX-RW-2025-026', name: "金汇镇农村自建房安全复查", type: 'temporary', typeLabel: '临时巡查', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 2, town: "金汇镇", village: "久茂村", houseType: "自住", structure: "砖木结构", person: "吴芳", createBy: '系统管理员', inspected: 0, total: 2, status: 'draft', statusLabel: '草稿', statusClass: 'draft', hiddenCount: 0, startDate: '2025-06-15', endDate: '2025-06-25' },
    { id: 27, no: 'FX-RW-2025-027', name: "青村镇经营性自建房联合检查", type: 'temporary', typeLabel: '临时巡查', riskLevel: "一般隐患", riskLabel: '一般隐患', houseCount: 3, town: "青村镇", village: "三坎村", houseType: "自住兼经营", structure: "土木结构", person: "郑辉", createBy: '李秀英', inspected: 0, total: 3, status: 'rejected', statusLabel: '任务回退', statusClass: 'rejected', hiddenCount: 0, startDate: '2025-06-10', endDate: '2025-06-28' },
    { id: 28, no: 'FX-RW-2025-028', name: "海湾镇农房辅助用房专项检查", type: 'temporary', typeLabel: '临时巡查', riskLevel: "无风险", riskLabel: '无风险', houseCount: 4, town: "海湾镇", village: "营房村", houseType: "农房辅助用房", structure: "框架结构", person: "王志强", createBy: '系统管理员', inspected: 1, total: 4, status: 'terminated', statusLabel: '已终止', statusClass: 'terminated', hiddenCount: 0, startDate: '2025-06-05', endDate: '2025-06-15' },

    // ========== 复查任务 ==========
    { id: 31, no: 'FX-RW-2025-031', name: "南桥镇农村危房销号核查", type: 'review', typeLabel: '复查任务', riskLevel: "无风险", riskLabel: '无风险', houseCount: 2, town: "南桥镇", village: "张翁庙村", houseType: "自住", structure: "砖混结构", person: "张建国", createBy: '系统管理员', inspected: 1, total: 2, status: 'processing', statusLabel: '进行中', statusClass: 'processing', hiddenCount: 1, hiddenFixed: 0, startDate: '2025-06-01', endDate: '2025-06-08' },
    { id: 32, no: 'FX-RW-2025-032', name: "奉城镇农村自建房安全回头看", type: 'review', typeLabel: '复查任务', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 3, town: "奉城镇", village: "洪庙村", houseType: "自住", structure: "砖木结构", person: "李秀英", createBy: '系统管理员', inspected: 1, total: 3, status: 'processing', statusLabel: '进行中', statusClass: 'processing', hiddenCount: 0, startDate: '2025-06-15', endDate: '2025-06-25' },
    { id: 33, no: 'FX-RW-2025-033', name: "四团镇D级危房紧急排查", type: 'review', typeLabel: '复查任务', riskLevel: "一般隐患", riskLabel: '一般隐患', houseCount: 4, town: "四团镇", village: "五四村", houseType: "自住", structure: "土木结构", person: "王志强", createBy: '系统管理员', inspected: 4, total: 4, status: 'completed', statusLabel: '已完成', statusClass: 'completed', hiddenCount: 0, hiddenFixed: 0, overdueStatus: 'on-time', startDate: '2025-05-20', endDate: '2025-06-10', finishTime: '2025-06-09 10:00' },
    { id: 34, no: 'FX-RW-2025-034', name: "柘林镇自建房安全隐患整治复查", type: 'review', typeLabel: '复查任务', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 3, town: "柘林镇", village: "新寺村", houseType: "自住兼经营", structure: "砖混结构", person: "陈美华", createBy: '系统管理员', inspected: 3, total: 3, status: 'completed', statusLabel: '已完成', statusClass: 'completed', hiddenCount: 1, hiddenFixed: 1, overdueStatus: 'completed-late', startDate: '2025-05-15', endDate: '2025-06-05', finishTime: '2025-06-08 16:00' },
    { id: 35, no: 'FX-RW-2025-035', name: "庄行镇农村自建房网格化巡查", type: 'review', typeLabel: '复查任务', riskLevel: "无风险", riskLabel: '无风险', houseCount: 2, town: "庄行镇", village: "潘垫村", houseType: "自住", structure: "框架结构", person: "刘大海", createBy: '系统管理员', inspected: 0, total: 2, status: 'issued', statusLabel: '待接收', statusClass: 'issued', hiddenCount: 0, startDate: '2025-06-10', endDate: '2025-06-20' },
    { id: 36, no: 'FX-RW-2025-036', name: "金汇镇老旧自建房安全体检", type: 'review', typeLabel: '复查任务', riskLevel: "重大隐患", riskLabel: '重大隐患', houseCount: 3, town: "金汇镇", village: "明星村", houseType: "自住", structure: "砖木结构", person: "孙明华", createBy: '系统管理员', inspected: 0, total: 3, status: 'draft', statusLabel: '草稿', statusClass: 'draft', hiddenCount: 0, startDate: '2025-06-12', endDate: '2025-06-25' },
    { id: 37, no: 'FX-RW-2025-037', name: "青村镇农房风险点常态化巡查", type: 'review', typeLabel: '复查任务', riskLevel: "一般隐患", riskLabel: '一般隐患', houseCount: 2, town: "青村镇", village: "李窑村", houseType: "农房辅助用房", structure: "土木结构", person: "赵敏", createBy: '李秀英', inspected: 0, total: 2, status: 'rejected', statusLabel: '任务回退', statusClass: 'rejected', hiddenCount: 0, startDate: '2025-06-15', endDate: '2025-06-28' },
    { id: 38, no: 'FX-RW-2025-038', name: "海湾镇临河自建房防汛专项巡查", type: 'review', typeLabel: '复查任务', riskLevel: "无风险", riskLabel: '无风险', houseCount: 3, town: "海湾镇", village: "星火村", houseType: "自住", structure: "框架结构", person: "郑辉", createBy: '系统管理员', inspected: 1, total: 3, status: 'terminated', statusLabel: '已终止', statusClass: 'terminated', hiddenCount: 0, startDate: '2025-06-05', endDate: '2025-06-15' },
];

function getProgressColor(inspected, total) {
    const pct = inspected / total;
    if (pct >= 1) return 'green';
    return 'blue';
}

function getRiskColor(riskLevel) {
    if (riskLevel === '重大隐患') return 'var(--danger)';
    if (riskLevel === '较大隐患') return '#c78000';
    if (riskLevel === '一般隐患') return 'var(--primary)';
    return 'var(--success)';
}

function getHiddenRectifyCell(t) {
    const total = t.hiddenCount || 0;
    const fixed = t.hiddenFixed || 0;
    if (['issued','draft','rejected'].includes(t.status) || t.inspected === 0) {
        return '<span class="rectify-cell pending">--</span>';
    }
    if (total === 0) return '<span class="rectify-cell none">0处 · 无隐患</span>';
    if (fixed === total) return `<span class="rectify-cell fully">${total}处 · 全部整改</span>`;
    if (fixed === 0) return `<span class="rectify-cell unfixed">${total}处 · 未整改</span>`;
    return `<span class="rectify-cell partial">${total}处 · 部分整改(${fixed}/${total})</span>`;
}

function getOverdueMark(t) {
    if (t.status !== 'completed' && t.status !== 'processing') {
        return '<span class="overdue-mark na">-</span>';
    }
    const today = '2025-06-22';
    const endDate = t.endDate;
    if (t.status === 'completed') {
        const finishTime = t.finishTime ? t.finishTime.split(' ')[0] : null;
        if (finishTime && finishTime > endDate) {
            return '<span class="overdue-mark completed-late"><i class="fas fa-exclamation-circle" style="font-size:10px;"></i>逾期完成</span>';
        }
        return '<span class="overdue-mark on-time"><i class="fas fa-check-circle" style="font-size:10px;"></i>按时完成</span>';
    }
    if (t.status === 'processing' && today > endDate) {
        return '<span class="overdue-mark overdue"><i class="fas fa-exclamation-triangle" style="font-size:10px;"></i>已逾期</span>';
    }
    return '<span class="overdue-mark na">-</span>';
}

let currentTab = 'routine';

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-content-wrapper').forEach(el => el.classList.remove('active'));
    document.querySelector(`.tab-nav-item[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`tab-${tab}`).classList.add('active');
    applyFilter();
}

function getTasksByTab(tab) {
    const typeMap = { 'routine': 'routine', 'special': 'special', 'temporary': 'temporary', 'review': 'review' };
    return tasks.filter(t => t.type === typeMap[tab]);
}

function renderTasksByTab(tab, data) {
    const tbody = document.getElementById(`taskTableBody-${tab}`);
    const emptyState = document.getElementById(`emptyState-${tab}`);
    const table = document.getElementById(`taskTable-${tab}`);

    if (data.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    const statusOrder = { 'processing': 0, 'completed': 1, 'pending-exec': 2, 'pending-assign': 3, 'issued': 4, 'draft': 5, 'rejected': 6 };
    const sortedData = [...data].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    tbody.innerHTML = sortedData.map(t => {
        const pct = t.total ? Math.round((t.inspected / t.total) * 100) : 0;
        const color = getProgressColor(t.inspected, t.total);
        const riskColor = getRiskColor(t.riskLevel || t.riskLabel);
        return `
        <tr>
            <td><strong>${t.name}</strong></td>
            <td><span style="font-size:12px;font-weight:600;color:${riskColor};">${t.riskLabel || t.riskLevel || '-'}</span></td>
            <td><span style="color:var(--primary);font-weight:600;">${t.houseCount}</span> 间</td>
            <td><span style="font-size:12px;color:var(--text-secondary);">${t.town || '-'}</span></td>
            <td><i class="fas fa-user" style="color:var(--text-secondary);margin-right:4px;font-size:11px;"></i>${t.person || '-'}</td>
            <td>${t.startDate || '-'}</td>
            <td>${t.endDate || '-'}</td>
            <td>
                ${t.status !== 'draft' && t.status !== 'issued' && t.status !== 'rejected' ? `
                <div class="progress-cell">
                    <div class="progress-bar">
                        <div class="progress-fill ${color}" style="width:${pct}%"></div>
                    </div>
                    <span class="progress-text">${t.inspected}/${t.total} (${pct}%)</span>
                </div>
                ` : '-'}
            </td>
            <td><span class="status-tag ${t.statusClass}">${t.statusLabel}</span></td>
            <td>${getOverdueMark(t)}</td>
            <td>${t.finishTime || '-'}</td>
            <td>${getHiddenRectifyCell(t)}</td>
            <td><i class="fas fa-user" style="color:var(--text-secondary);margin-right:4px;font-size:11px;"></i>${t.createBy || '-'}</td>
            <td>
                <div class="actions">
                    ${getStatusActions(t)}
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

function renderAllTabs() {
    ['routine', 'special', 'temporary', 'review'].forEach(tab => {
        const data = getTasksByTab(tab);
        renderTasksByTab(tab, data);
    });
    updateKPI(tasks);
}

function updateKPI(data) {
    const total = data.length;
    const processing = data.filter(t => t.status === 'processing').length;
    const completed = data.filter(t => t.status === 'completed').length;
    const pendingReceive = data.filter(t => t.status === 'issued').length;
    const hidden = data.reduce((sum, t) => sum + (t.hiddenCount || 0), 0);
    const majorHidden = data.filter(t => t.riskLevel === '重大隐患').length;
    const today = '2025-06-22';
    const overdue = data.filter(t => t.status === 'processing' && today > t.endDate).length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById('kpiPendingReceive').textContent = pendingReceive;
    document.getElementById('kpiProcessing').textContent = processing;
    document.getElementById('kpiOverdue').textContent = overdue;
    document.getElementById('kpiPendingClose').textContent = hidden;
    document.getElementById('kpiMajorHidden').textContent = majorHidden;
    document.getElementById('kpiCompletionRate').textContent = completionRate;
}

function applyFilter() {
    const status = document.getElementById('filterStatus').value;
    const riskLevel = document.getElementById('filterUrgency').value;
    const town = document.getElementById('filterUnit').value;
    const village = document.getElementById('filterVillage') ? document.getElementById('filterVillage').value : '';
    const houseType = document.getElementById('filterHouseType') ? document.getElementById('filterHouseType').value : '';
    const structure = document.getElementById('filterStructure') ? document.getElementById('filterStructure').value : '';
    const name = document.getElementById('filterName').value.toLowerCase();
    const person = document.getElementById('filterPerson').value.toLowerCase();
    const startDateFrom = document.getElementById('filterStartDateFrom').value;
    const startDateTo = document.getElementById('filterStartDateTo').value;

    const baseData = getTasksByTab(currentTab);
    const filtered = baseData.filter(t => {
        const matchStatus = !status || t.status === status;
        const matchRiskLevel = !riskLevel || (t.riskLevel === riskLevel || t.riskLabel === riskLevel);
        const matchTown = !town || t.town === town;
        const matchVillage = !village || (t.village || '') === village;
        const matchHouseType = !houseType || (t.houseType || '') === houseType;
        const matchStructure = !structure || (t.structure || '') === structure;
        const matchName = !name || t.name.toLowerCase().includes(name);
        const matchPerson = !person || t.person.toLowerCase().includes(person);
        const matchDateFrom = !startDateFrom || t.startDate >= startDateFrom;
        const matchDateTo = !startDateTo || t.startDate <= startDateTo;
        return matchStatus && matchRiskLevel && matchTown && matchVillage && matchHouseType && matchStructure && matchName && matchPerson && matchDateFrom && matchDateTo;
    });

    renderTasksByTab(currentTab, filtered);
}

function resetFilter() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterUrgency').value = '';
    document.getElementById('filterUnit').value = '';
    if (document.getElementById('filterVillage')) document.getElementById('filterVillage').value = '';
    if (document.getElementById('filterHouseType')) document.getElementById('filterHouseType').value = '';
    if (document.getElementById('filterStructure')) document.getElementById('filterStructure').value = '';
    document.getElementById('filterName').value = '';
    document.getElementById('filterPerson').value = '';
    document.getElementById('filterStartDateFrom').value = '';
    document.getElementById('filterStartDateTo').value = '';
    renderAllTabs();
}

function openModal() {
    document.getElementById('taskModal').classList.add('active');
    const nextId = tasks.length + 1;
    const date = new Date();
    const year = date.getFullYear();
    const seq = String(nextId).padStart(3, '0');
    document.getElementById('taskNo').value = `FX-RW-${year}-${seq}`;
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('active');
    document.getElementById('taskName').value = '';
    document.getElementById('taskType').value = '';
    document.getElementById('taskPerson').value = '';
    document.getElementById('taskArchiveCount').value = '';
    document.getElementById('taskTotalCount').value = '';
    document.getElementById('taskStartDate').value = '';
    document.getElementById('taskEndDate').value = '';
    document.getElementById('taskDesc').value = '';
}

function saveTask() {
    const no = document.getElementById('taskNo').value.trim();
    const name = document.getElementById('taskName').value.trim();
    const type = document.getElementById('taskType').value;
    const person = document.getElementById('taskPerson').value.trim();
    const totalCount = parseInt(document.getElementById('taskTotalCount').value) || 0;

    if (!no || !name || !type || !person || !totalCount) {
        alert('请填写所有必填项');
        return;
    }

    const typeMap = {
        routine: '日常巡查',
        special: '专项巡查',
        temporary: '临时巡查'
    };

    const newTask = {
        id: Date.now(),
        name: name,
        type: type,
        typeLabel: typeMap[type],
        houseCount: parseInt(document.getElementById('taskArchiveCount').value) || 0,
        person: person,
        inspected: 0,
        total: totalCount,
        status: 'draft',
        statusLabel: '草稿',
        statusClass: 'draft',
        hiddenCount: 0
    };

    tasks.unshift(newTask);
    renderAllTabs();
    closeModal();
}

function getStatusActions(t) {
    if (t.status === 'draft') {
        return `
            <button class="action-link view" onclick="editTask(${t.id})">编辑</button>
            <button class="action-link delete" onclick="deleteTask(${t.id})">删除</button>
        `;
    }
    if (t.status === 'rejected') {
        return `
            <button class="action-link view" onclick="editReturnedTask(${t.id})">修改</button>
            <button class="action-link delete" onclick="deleteTask(${t.id})">删除</button>
        `;
    }
    if (t.status === 'issued') {
        return `
            <button class="action-link view" onclick="receiveTask(${t.id})">接收任务</button>
            <button class="action-link view" onclick="viewTask(${t.id})">查看</button>
        `;
    }
    if (t.status === 'pending-assign') {
        return `
            <button class="action-link view" onclick="assignPersonTask(${t.id})">分配人员</button>
            <button class="action-link view" onclick="viewTask(${t.id})">查看</button>
        `;
    }
    if (t.status === 'pending-exec' || t.status === 'processing') {
        return `
            <button class="action-link view" onclick="adjustTask(${t.id})">调整</button>
            <button class="action-link view" onclick="viewTask(${t.id})">查看</button>
        `;
    }
    return `<button class="action-link view" onclick="viewTask(${t.id})">查看</button>`;
}

function renderStatusActions(t) {
    return getStatusActions(t);
}

function viewTask(id) {
    window.location.href = 'rural-risk-task-detail.html?id=' + id;
}

function editTask(id) {
    window.location.href = 'rural-risk-task-edit.html?id=' + id;
}

function editReturnedTask(id) {
    window.location.href = 'rural-risk-task-add.html?mode=returned&id=' + id;
}

function deleteTask(id) {
    if (confirm('确定要删除该巡查任务吗？')) {
        tasks = tasks.filter(t => t.id !== id);
        renderAllTabs();
    }
}

function publishTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = 'issued';
        task.statusLabel = '待接收';
        task.statusClass = 'issued';
        renderAllTabs();
        alert('任务已发布');
    }
}

function adjustTask(id) {
    window.location.href = 'rural-risk-task-adjust.html?id=' + id;
}

function receiveTask(id) {
    window.location.href = 'rural-risk-task-receive.html?id=' + id;
}

function cancelTask(id) {
    if (confirm('确定要取消该任务吗？')) {
        tasks = tasks.filter(t => t.id !== id);
        renderAllTabs();
    }
}

function assignPersonTask(id) {
    window.location.href = 'rural-risk-task-allocation.html?id=' + id;
}

function reassignTask(id) {
    window.location.href = 'rural-risk-task-reassign.html?id=' + id;
}

function checkInTask(id) {
    alert('点位打卡：打开打卡界面（演示）');
}

function reportIssueTask(id) {
    alert('上报问题：打开问题上报界面（演示）');
}

// Init
renderAllTabs();
</script>'''

html, count = script_pattern.subn(new_script, html, count=1)
print('Script blocks replaced:', count)

# 4. 清理 body 中残留的燃气相关文字
html = html.replace('燃气', '农村自建房')
html = html.replace('调压站', '自建房')
html = html.replace('供气站', '自然村')
html = html.replace('巡查点位', '巡查房屋')

# 保存
open('e:/风险管控0618/pages/patrol-task-management.html', 'wb').write(html.encode('utf-8'))
print('Saved')
