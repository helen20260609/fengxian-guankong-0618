import re

html = open('e:/风险管控0618/pages/patrol-task-management.html', 'rb').read().decode('utf-8', 'ignore')

# 1. 替换所有 gas-risk-task-add.html 为 rural-risk-task-add.html
html = html.replace('gas-risk-task-add.html', 'rural-risk-task-add.html')

# 2. 其他 gas 相关链接也统一改为 rural 前缀（编辑、接收、分配等）
html = html.replace('gas-risk-task-edit.html', 'rural-risk-task-edit.html')
html = html.replace('gas-risk-task-Receivable.html', 'rural-risk-task-receive.html')
html = html.replace('gas-risk-task-allocation.html', 'rural-risk-task-allocation.html')
html = html.replace('gas-risk-task-Reassign.html', 'rural-risk-task-reassign.html')

# 3. 表头“巡查范围”改为“巡查房屋数”
html = html.replace('<th>巡查范围</th>', '<th>巡查房屋数</th>')

# 4. 替换整个 renderTasksByTab 函数
old_render = r'''function renderTasksByTab\(tab, data\) \{\s*const tbody = document\.getElementById\(`taskTableBody-\$\{tab\}`\);\s*const emptyState = document\.getElementById\(`emptyState-\$\{tab\}`\);\s*const table = document\.getElementById\(`taskTable-\$\{tab\}`\);[\s\S]*?\}\);\s*\}\s*\}'''

new_render = '''function renderTasksByTab(tab, data) {
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
        const riskColor = t.riskLevel === '重大隐患' ? 'var(--danger)' : t.riskLevel === '较大隐患' ? '#c78000' : t.riskLevel === '一般隐患' ? 'var(--primary)' : 'var(--success)';
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
}'''

html, count = re.subn(old_render, new_render, html)
print('renderTasksByTab replaced:', count)

# 5. 修复 getHiddenRectifyCell 函数
old_rectify = r'''function getHiddenRectifyCell\(t\) \{[\s\S]*?\}'''
new_rectify = '''function getHiddenRectifyCell(t) {
    const total = t.hiddenCount || 0;
    const fixed = t.hiddenFixed || 0;
    // 未开始的任务：未接收/草稿/回退，或无巡查进度
    if (['issued','draft','rejected'].includes(t.status) || t.inspected === 0) {
        return '\u003cspan class="rectify-cell pending"\u003e--\u003c/span\u003e';
    }
    if (total === 0) {
        return '\u003cspan class="rectify-cell none"\u003e0处 · 无隐患\u003c/span\u003e';
    }
    if (fixed === total) {
        return `\u003cspan class="rectify-cell fully"\u003e${total}处 · 全部整改\u003c/span\u003e`;
    }
    if (fixed === 0) {
        return `\u003cspan class="rectify-cell unfixed"\u003e${total}处 · 未整改\u003c/span\u003e`;
    }
    return `\u003cspan class="rectify-cell partial"\u003e${total}处 · 部分整改(${fixed}/${total})\u003c/span\u003e`;
}'''
html, count = re.subn(old_rectify, new_rectify, html, count=1)
print('getHiddenRectifyCell replaced:', count)

# 6. 修复 getOverdueMark 函数
old_overdue = r'''function getOverdueMark\(t\) \{[\s\S]*?\}'''
new_overdue = '''function getOverdueMark(t) {
    if (t.status !== 'completed' && t.status !== 'processing') {
        return '\u003cspan class="overdue-mark na"\u003e-\u003c/span\u003e';
    }
    const today = '2025-06-22';
    const endDate = t.endDate;
    if (t.status === 'completed') {
        const finishTime = t.finishTime ? t.finishTime.split(' ')[0] : null;
        if (finishTime && finishTime > endDate) {
            return '\u003cspan class="overdue-mark completed-late"\u003e\u003ci class="fas fa-exclamation-circle" style="font-size:10px;"\u003e\u003c/i\u003e逾期完成\u003c/span\u003e';
        }
        return '\u003cspan class="overdue-mark on-time"\u003e\u003ci class="fas fa-check-circle" style="font-size:10px;"\u003e\u003c/i\u003e按时完成\u003c/span\u003e';
    }
    if (t.status === 'processing' && today > endDate) {
        return '\u003cspan class="overdue-mark overdue"\u003e\u003ci class="fas fa-exclamation-triangle" style="font-size:10px;"\u003e\u003c/i\u003e已逾期\u003c/span\u003e';
    }
    return '\u003cspan class="overdue-mark na"\u003e-\u003c/span\u003e';
}'''
html, count = re.subn(old_overdue, new_overdue, html, count=1)
print('getOverdueMark replaced:', count)

# 7. 修复 updateKPI 函数匹配 HTML 中的 KPI ID
old_kpi = r'''function updateKPI\(data\) \{[\s\S]*?\}'''
new_kpi = '''function updateKPI(data) {
    const total = data.length;
    const processing = data.filter(t => t.status === 'processing').length;
    const completed = data.filter(t => t.status === 'completed').length;
    const pendingReceive = data.filter(t => t.status === 'issued').length;
    const hidden = data.reduce((sum, t) => sum + (t.hiddenCount || 0), 0);
    const majorHidden = data.filter(t => t.riskLevel === '重大隐患').length;
    
    // 计算已逾期任务数（进行中且超过截至日期）
    const today = '2025-06-22';
    const overdue = data.filter(t => {
        if (t.status !== 'processing') return false;
        return today > t.endDate;
    }).length;

    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById('kpiPendingReceive').textContent = pendingReceive;
    document.getElementById('kpiProcessing').textContent = processing;
    document.getElementById('kpiOverdue').textContent = overdue;
    document.getElementById('kpiPendingClose').textContent = hidden;
    document.getElementById('kpiMajorHidden').textContent = majorHidden;
    document.getElementById('kpiCompletionRate').textContent = completionRate;
}'''
html, count = re.subn(old_kpi, new_kpi, html, count=1)
print('updateKPI replaced:', count)

# 8. 修复 applyFilter 字段名
old_filter = r'''function applyFilter\(\) \{[\s\S]*?\}'''
new_filter = '''function applyFilter() {
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
        const matchRiskLevel = !riskLevel || t.riskLevel === riskLevel || t.riskLabel === riskLevel;
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
}'''
html, count = re.subn(old_filter, new_filter, html, count=1)
print('applyFilter replaced:', count)

# 9. 修复 resetFilter 中新增字段
old_reset = r'''function resetFilter\(\) \{[\s\S]*?\}'''
new_reset = '''function resetFilter() {
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
}'''
html, count = re.subn(old_reset, new_reset, html, count=1)
print('resetFilter replaced:', count)

# 保存
open('e:/风险管控0618/pages/patrol-task-management.html', 'wb').write(html.encode('utf-8'))
print('Saved')
