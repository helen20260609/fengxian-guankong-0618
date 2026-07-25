// Theme sync
window.addEventListener('message', function(e) {
    if (e.data && e.data.action === 'setTheme') {
        document.documentElement.setAttribute('data-theme', e.data.theme);
    }
});

// ===== Returned/Rejected Task State =====
let isReturnedMode = false;
let returnedRecords = [];

function initReturnedMode() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode !== 'returned') return;

    isReturnedMode = true;
    returnedRecords = [
        { id: 2, returnBy: '安全管理科 李某某', returnTime: '2026-07-01 16:45', reason: '任务范围过大，建议按街镇拆分，并补充重点巡查对象清单。' },
        { id: 1, returnBy: '城市综合管理科 王某某', returnTime: '2026-06-28 09:20', reason: '任务时限与现有巡查计划冲突，请调整起止时间。' }
    ];

    const latest = returnedRecords[0];
    const banner = document.getElementById('returnBanner');
    banner.style.display = 'block';

    renderLatestReturn(latest);
    renderReturnHistory();

    // update page title to reflect edit mode
    document.querySelector('.page-title span').textContent = '修改农村自建房巡查任务';
    document.querySelector('.breadcrumb span:last-child').textContent = '修改农村自建房巡查任务';

    // change submit text
    document.getElementById('btnConfirmText').textContent = '重新提交';

    // 预填部分演示数据（退回任务编辑场景）
    document.getElementById('taskName').value = '庄行镇农村自建房安全排查（退回修改）';
    document.getElementById('taskType').value = 'routine';
    document.getElementById('urgencyLevel').value = 'medium';
}

function renderLatestReturn(record) {
    const reasonId = 'returnReason_' + record.id;
    const body = document.getElementById('returnBannerBody');
    body.innerHTML = `
        <div class="return-banner-row">
            <div><span class="return-banner-label">退回人：</span><span class="return-banner-value">${record.returnBy}</span></div>
            <div><span class="return-banner-label">退回时间：</span><span class="return-banner-value">${record.returnTime}</span></div>
        </div>
        <div style="margin-bottom:4px;"><span class="return-banner-label">退回原因：</span></div>
        <div class="return-reason-text" id="${reasonId}">${record.reason}</div>
    `;

    setTimeout(() => {
        const el = document.getElementById(reasonId);
        if (!el) return;
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20.8;
        const lines = el.scrollHeight / lineHeight;
        if (lines > 3) {
            const toggle = document.createElement('span');
            toggle.className = 'return-reason-toggle';
            toggle.innerHTML = '展开全文';
            toggle.onclick = function() {
                el.classList.toggle('expanded');
                toggle.innerHTML = el.classList.contains('expanded') ? '收起' : '展开全文';
            };
            el.parentNode.insertBefore(toggle, el.nextSibling);
        }
    }, 0);
}

function renderReturnHistory() {
    const section = document.getElementById('returnHistorySection');
    if (returnedRecords.length <= 1) {
        section.style.display = 'none';
        return;
    }
    section.style.display = 'block';

    const list = document.getElementById('returnHistoryList');
    list.innerHTML = returnedRecords.slice(1).map(r => `
        <div class="return-history-item">
            <div class="return-history-meta">
                <span><span class="return-banner-label">退回人：</span>${r.returnBy}</span>
                <span><span class="return-banner-label">退回时间：</span>${r.returnTime}</span>
            </div>
            <div class="return-history-reason">${r.reason}</div>
        </div>
    `).join('');
}

function toggleReturnHistory() {
    const list = document.getElementById('returnHistoryList');
    const toggle = document.getElementById('returnHistoryToggle');
    list.classList.toggle('expanded');
    const isExpanded = list.classList.contains('expanded');
    toggle.innerHTML = isExpanded ? '收起 <i class="fa-solid fa-chevron-up"></i>' : '展开 <i class="fa-solid fa-chevron-down"></i>';
}

// sticky banner effect on scroll
window.addEventListener('scroll', function() {
    const banner = document.getElementById('returnBanner');
    if (!banner || banner.style.display === 'none') return;
    const rect = banner.getBoundingClientRect();
    if (rect.top <= 0) {
        banner.classList.add('sticky');
    } else {
        banner.classList.remove('sticky');
    }
});

// ===== 页面状态变量 =====
let _selectedUnitId = null;
let _selectedUnitName = null;
let _selectedPersons = [];

// ===== 单位选择回调 =====
function onUnitSelected(deptId, deptName) {
    _selectedUnitId = deptId;
    _selectedUnitName = deptName;

    const unitMap = {
        'dept1': 'self', 'dept2': 'self', 'dept3': 'self', 'dept4': 'self', 'dept5': 'self',
        'dept6': 'dept2', 'dept7': 'dept2', 'dept8': 'dept2',
        'dept9': 'dept3', 'dept10': 'dept3',
        'dept11': 'dept4', 'dept12': 'dept4'
    };
    const selectValue = unitMap[deptId] || 'self';

    document.getElementById('assignUnit').value = selectValue;
    document.getElementById('unitPlaceholder').style.display = 'none';
    document.getElementById('selectedUnitDisplay').style.display = 'flex';
    document.getElementById('selectedUnitDisplay').innerHTML =
        `<span class="person-tag">${deptName}<i class="fas fa-times remove" onclick="event.stopPropagation();clearUnitSelection()"></i></span>`;

    onAssignUnitChange();
}

function clearUnitSelection() {
    document.getElementById('assignUnit').value = '';
    document.getElementById('unitPlaceholder').style.display = 'inline';
    document.getElementById('selectedUnitDisplay').style.display = 'none';
    document.getElementById('selectedUnitDisplay').innerHTML = '';
    _selectedUnitId = null;
    _selectedUnitName = null;
    onAssignUnitChange();
}

// ===== 人员选择回调 =====
function onPersonsSelected(selectedPersons) {
    _selectedPersons = selectedPersons;
    const display = document.getElementById('selectedPersonsDisplay');
    const placeholder = document.getElementById('personPlaceholder');

    if (selectedPersons.length === 0) {
        placeholder.style.display = 'inline';
        display.style.display = 'none';
        display.innerHTML = '';
    } else {
        placeholder.style.display = 'none';
        display.style.display = 'flex';
        display.innerHTML = selectedPersons.map(p =>
            `<span class="person-tag">${p.name}<i class="fas fa-times remove" onclick="event.stopPropagation();removePerson('${p.id}')"></i></span>`
        ).join('');
    }
}

function removePerson(personId) {
    _selectedPersons = _selectedPersons.filter(p => p.id !== personId);
    onPersonsSelected(_selectedPersons);
}

function onAssignUnitChange() {
    const unit = document.getElementById('assignUnit').value;
    const personTrigger = document.getElementById('personTrigger');
    const personPlaceholder = document.getElementById('personPlaceholder');
    const assignTip = document.getElementById('assignTip');
    const personRequired = document.getElementById('personRequired');

    if (unit === '') {
        personTrigger.classList.add('disabled');
        personTrigger.onclick = null;
        assignTip.style.display = 'none';
        personRequired.style.display = 'inline';
        personPlaceholder.textContent = '请选择农村自建房巡查人员';
    } else if (unit === 'self') {
        personTrigger.classList.remove('disabled');
        personTrigger.onclick = function() {
            openOrgModal(onPersonsSelected, { unitFilter: _selectedUnitId });
        };
        assignTip.style.display = 'none';
        personRequired.style.display = 'inline';
        personPlaceholder.textContent = '请选择农村自建房巡查人员';
    } else {
        personTrigger.classList.add('disabled');
        personTrigger.onclick = null;
        assignTip.style.display = 'flex';
        personRequired.style.display = 'none';
        _selectedPersons = [];
        onPersonsSelected([]);
        personPlaceholder.textContent = '由指派单位管理员分配';
    }
}

let currentStep = 1;
const totalSteps = 3;
const stepHints = {
    1: '请填写农村自建房巡查任务基本信息，带 * 号为必填项',
    2: '选择巡查街镇范围与农村自建房检查项，专项/临时巡查支持多选街镇。',
    3: '请确认农村自建房巡查任务信息无误后发布'
};

function updateStepper() {
    document.querySelectorAll('.step-item').forEach(item => {
        const step = parseInt(item.dataset.step);
        item.classList.remove('active', 'completed');
        if (step < currentStep) {
            item.classList.add('completed');
            item.querySelector('.step-circle').innerHTML = '<i class="fas fa-check"></i>';
        } else if (step === currentStep) {
            item.classList.add('active');
            item.querySelector('.step-circle').textContent = step;
        } else {
            item.querySelector('.step-circle').textContent = step;
        }
    });

    document.querySelectorAll('.step-line').forEach(line => {
        const lineNum = parseInt(line.dataset.line);
        line.classList.toggle('completed', lineNum < currentStep);
    });

    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('step' + currentStep).classList.add('active');

    document.getElementById('stepHint').textContent = stepHints[currentStep];

    document.getElementById('btnPrev').disabled = currentStep === 1;
    document.getElementById('btnDraft').style.display = currentStep === totalSteps ? 'none' : 'flex';

    if (currentStep === totalSteps) {
        document.getElementById('btnNext').style.display = 'none';
        document.getElementById('btnConfirm').style.display = 'flex';
        document.getElementById('btnConfirmText').textContent = isReturnedMode ? '重新提交' : '确认发布';
        updateConfirmInfo();
    } else {
        document.getElementById('btnNext').style.display = 'flex';
        document.getElementById('btnConfirm').style.display = 'none';
    }
}

function nextStep() {
    if (currentStep === 1) {
        const name = document.getElementById('taskName').value.trim();
        const type = document.getElementById('taskType').value;
        const urgency = document.getElementById('urgencyLevel').value;
        const unit = document.getElementById('assignUnit').value;
        const start = document.getElementById('taskStartDate').value;
        const end = document.getElementById('taskEndDate').value;
        if (!name) { alert('请填写任务名称'); return; }
        if (!type) { alert('请选择任务类型'); return; }
        if (!urgency) { alert('请选择紧急程度'); return; }
        if (!unit) { alert('请选择城建中心'); return; }
        if (!start || !end) { alert('请选择任务时限'); return; }
        if (unit === 'self') {
            if (_selectedPersons.length === 0) { alert('请选择农村自建房巡查人员'); return; }
        }
        // 根据任务类型切换Step2显示
        switchStep2ByType(type);
    }
    if (currentStep === 2) {
        const type = document.getElementById('taskType').value;
        if (type === 'routine') {
            if (selectedProjectIds.size === 0) { alert('请至少选择一个农村自建房'); return; }
        } else {
            // 专项/临时巡查：验证街镇和检查项/风险清单
            if (selectedTownIds.size === 0) { alert('请至少选择一个巡查街镇范围'); return; }
            if (customPatrolItems.length === 0 && selectedRiskListIds.size === 0) { alert('请至少添加一个农村自建房检查项或选择农村自建房风险清单'); return; }
        }
    }
    if (currentStep < totalSteps) {
        currentStep++;
        updateStepper();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepper();
    }
}

function saveDraft() {
    alert('任务草稿已暂存！');
}

function confirmPublish() {
    const confirmMsg = isReturnedMode ? '确认重新提交该农村自建房巡查任务？提交后将重新进入审核流程。' : '确认发布该农村自建房巡查任务？发布后任务将立即生效。';
    if (confirm(confirmMsg)) {
        const successMsg = isReturnedMode ? '任务重新提交成功！' : '任务发布成功！';
        alert(successMsg);
        window.parent.postMessage({ action: 'navigate', url: 'pages/patrol-task-management.html' }, '*');
    }
}

// ===== Demo Data: Projects =====
const allProjects = [
    { id: 1, name: '南桥镇解放路120号农村自建房', region: 'nanqiao', regionLabel: '南桥镇', enterprise: '重点自建房', type: 'station', typeLabel: '一般自建房', address: '南桥镇解放路120号', riskDistribution: { red: 3, orange: 5, yellow: 10, blue: 6 }, lastPatrol: '06-15' },
    { id: 2, name: '奉浦街道人民路88号农村自建房', region: 'fengpu', regionLabel: '奉浦街道', enterprise: '一般自建房', type: 'user', typeLabel: '重点自建房', address: '奉浦街道人民路88号', riskDistribution: { red: 0, orange: 1, yellow: 2, blue: 4 }, lastPatrol: '06-10' },
    { id: 3, name: '金海街道建设路55号农村自建房', region: 'jinhai', regionLabel: '金海街道', enterprise: '在建自建房', type: 'pipeline', typeLabel: '在建自建房', address: '金海街道建设路55号', riskDistribution: { red: 0, orange: 2, yellow: 3, blue: 5 }, lastPatrol: '06-12' },
    { id: 4, name: '海湾镇光明路200号农村自建房', region: 'haiwan', regionLabel: '海湾镇', enterprise: '重点自建房', type: 'station', typeLabel: '一般自建房', address: '海湾镇光明路200号', riskDistribution: { red: 5, orange: 8, yellow: 20, blue: 10 }, lastPatrol: '06-08' },
    { id: 5, name: '青村镇朝阳路95号农村自建房', region: 'qingcun', regionLabel: '青村镇', enterprise: '在建自建房', type: 'pipeline', typeLabel: '在建自建房', address: '青村镇朝阳路95号', riskDistribution: { red: 1, orange: 3, yellow: 6, blue: 3 }, lastPatrol: '06-05' },
    { id: 6, name: '南桥镇新建路66号农村自建房', region: 'nanqiao', regionLabel: '南桥镇', enterprise: '重点自建房', type: 'station', typeLabel: '一般自建房', address: '南桥镇新建路66号', riskDistribution: { red: 2, orange: 6, yellow: 18, blue: 17 }, lastPatrol: '06-11' },
    { id: 7, name: '奉浦街道工业路12号农村自建房', region: 'fengpu', regionLabel: '奉浦街道', enterprise: '在建自建房', type: 'pipeline', typeLabel: '在建自建房', address: '奉浦街道工业路12号', riskDistribution: { red: 8, orange: 12, yellow: 25, blue: 11 }, lastPatrol: '06-09' },
    { id: 8, name: '金海街道金海路168号农村自建房', region: 'jinhai', regionLabel: '金海街道', enterprise: '一般自建房', type: 'user', typeLabel: '重点自建房', address: '金海街道金海路168号', riskDistribution: { red: 0, orange: 0, yellow: 0, blue: 1 }, lastPatrol: '06-14' },
    { id: 9, name: '海湾镇海湾路88号农村自建房', region: 'haiwan', regionLabel: '海湾镇', enterprise: '在建自建房', type: 'pipeline', typeLabel: '在建自建房', address: '海湾镇海湾路88号', riskDistribution: { red: 0, orange: 1, yellow: 4, blue: 7 }, lastPatrol: '06-07' },
    { id: 10, name: '青村镇青村中路88号农村自建房', region: 'qingcun', regionLabel: '青村镇', enterprise: '一般自建房', type: 'user', typeLabel: '重点自建房', address: '青村镇青村中路88号', riskDistribution: { red: 0, orange: 2, yellow: 3, blue: 6 }, lastPatrol: '06-06' },
    { id: 11, name: '南桥镇南桥路256号农村自建房', region: 'nanqiao', regionLabel: '南桥镇', enterprise: '重点自建房', type: 'station', typeLabel: '一般自建房', address: '南桥镇南桥路256号', riskDistribution: { red: 0, orange: 0, yellow: 2, blue: 8 }, lastPatrol: '06-13' },
    { id: 12, name: '奉浦街道奉浦大道128号农村自建房', region: 'fengpu', regionLabel: '奉浦街道', enterprise: '重点自建房', type: 'station', typeLabel: '一般自建房', address: '奉浦街道奉浦大道128号', riskDistribution: { red: 1, orange: 2, yellow: 5, blue: 9 }, lastPatrol: '06-12' },
    { id: 13, name: '四团镇四团公路88号农村自建房', region: 'situan', regionLabel: '四团镇', enterprise: '在建自建房', type: 'pipeline', typeLabel: '在建自建房', address: '四团镇四团公路88号', riskDistribution: { red: 0, orange: 0, yellow: 3, blue: 6 }, lastPatrol: '06-04' },
    { id: 14, name: '庄行镇庄行大道88号农村自建房', region: 'zhuanghang', regionLabel: '庄行镇', enterprise: '一般自建房', type: 'user', typeLabel: '重点自建房', address: '庄行镇庄行大道88号', riskDistribution: { red: 0, orange: 1, yellow: 2, blue: 4 }, lastPatrol: '06-03' },
    { id: 15, name: '柘林镇柘林路66号农村自建房', region: 'tuqiao', regionLabel: '柘林镇', enterprise: '重点自建房', type: 'station', typeLabel: '一般自建房', address: '柘林镇柘林路66号', riskDistribution: { red: 2, orange: 4, yellow: 8, blue: 5 }, lastPatrol: '06-02' },
    { id: 16, name: '金汇镇金汇路88号农村自建房', region: 'xinsi', regionLabel: '金汇镇', enterprise: '在建自建房', type: 'pipeline', typeLabel: '在建自建房', address: '金汇镇金汇路88号', riskDistribution: { red: 0, orange: 1, yellow: 3, blue: 5 }, lastPatrol: '06-01' },
    { id: 17, name: '奉城镇奉城路168号农村自建房', region: 'fengcheng', regionLabel: '奉城镇', enterprise: '重点自建房', type: 'station', typeLabel: '一般自建房', address: '奉城镇奉城路168号', riskDistribution: { red: 0, orange: 2, yellow: 4, blue: 6 }, lastPatrol: '05-30' },
    { id: 18, name: '南桥镇南桥路388号农村自建房', region: 'nanqiao', regionLabel: '南桥镇', enterprise: '一般自建房', type: 'user', typeLabel: '重点自建房', address: '南桥镇南桥路388号', riskDistribution: { red: 0, orange: 0, yellow: 1, blue: 5 }, lastPatrol: '06-16' },
    { id: 19, name: '奉浦街道奉浦大道288号农村自建房', region: 'fengpu', regionLabel: '奉浦街道', enterprise: '一般自建房', type: 'user', typeLabel: '重点自建房', address: '奉浦街道奉浦大道288号', riskDistribution: { red: 0, orange: 0, yellow: 0, blue: 2 }, lastPatrol: '06-15' },
    { id: 20, name: '金海街道金海路99号农村自建房', region: 'jinhai', regionLabel: '金海街道', enterprise: '重点自建房', type: 'station', typeLabel: '一般自建房', address: '金海街道金海路99号', riskDistribution: { red: 1, orange: 3, yellow: 6, blue: 8 }, lastPatrol: '06-14' }
];

let selectedProjects = [];
let filteredProjects = [];
let currentPage = 1;
const pageSize = 10;
let selectedProjectIds = new Set();

function renderProjectTable() {
    const total = filteredProjects.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * pageSize;
    const pageItems = filteredProjects.slice(start, start + pageSize);

    document.getElementById('projectTotalCount').textContent = allProjects.length;
    document.getElementById('projectFilterCount').textContent = total;
    document.getElementById('paginationTotal').textContent = total;

    const tbody = document.getElementById('projectTableBody');
    if (pageItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-secondary);">暂无匹配农村自建房</td></tr>`;
    } else {
        tbody.innerHTML = pageItems.map(p => {
            const isSelected = selectedProjectIds.has(p.id);
            return `
            <tr class="${isSelected ? 'selected' : ''}" data-id="${p.id}">
                <td style="text-align:center;"><input type="checkbox" class="table-checkbox" ${isSelected ? 'checked' : ''} onchange="toggleProjectSelect(${p.id})"></td>
                <td class="project-name-cell">${p.name}</td>
                <td>${p.regionLabel}</td>
                <td>${p.enterprise || '-'}</td>
                <td><span class="project-type-tag ${p.type}">${p.typeLabel}</span></td>
                <td>${p.address}</td>
                <td style="text-align:center;">${renderRiskDistribution(p.riskDistribution)}</td>
                <td style="text-align:center;color:var(--text-secondary);">${p.lastPatrol}</td>
            </tr>
            `;
        }).join('');
    }

    // Update header checkbox
    const allPageSelected = pageItems.length > 0 && pageItems.every(p => selectedProjectIds.has(p.id));
    document.getElementById('tableHeaderCheck').checked = allPageSelected;

    renderPagination(totalPages);
    renderSelectedProjectsBar();
}

function renderRiskDistribution(dist) {
    if (!dist) return '<span style="color:var(--text-secondary);">-</span>';
    const colors = { red: 'var(--danger)', orange: 'var(--warning)', yellow: '#f9c846', blue: 'var(--primary)' };
    const parts = [];
    ['red', 'orange', 'yellow', 'blue'].forEach(key => {
        const val = parseInt(dist[key], 10);
        if (val > 0) {
            parts.push(`<span style="display:inline-flex;align-items:center;gap:4px;margin-right:10px;"><span style="width:8px;height:8px;border-radius:50%;background:${colors[key]};"></span>${val}</span>`);
        }
    });
    return parts.length ? parts.join('') : '<span style="color:var(--text-secondary);">0</span>';
}

function renderPagination(totalPages) {
    const container = document.getElementById('paginationControls');
    let html = '';

    // Prev
    html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span style="padding:0 4px;color:var(--text-secondary);">...</span>`;
        }
    }

    // Next
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;

    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderProjectTable();
}

function toggleProjectSelect(id) {
    if (selectedProjectIds.has(id)) {
        selectedProjectIds.delete(id);
    } else {
        selectedProjectIds.add(id);
    }
    // Update selectedProjects array
    selectedProjects = allProjects.filter(p => selectedProjectIds.has(p.id));
    renderProjectTable();
}

function toggleSelectAllPage() {
    const check = document.getElementById('tableHeaderCheck').checked;
    document.getElementById('selectAllPage').checked = check;
    const start = (currentPage - 1) * pageSize;
    const pageItems = filteredProjects.slice(start, start + pageSize);

    pageItems.forEach(p => {
        if (check) {
            selectedProjectIds.add(p.id);
        } else {
            selectedProjectIds.delete(p.id);
        }
    });

    selectedProjects = allProjects.filter(p => selectedProjectIds.has(p.id));
    renderProjectTable();
}

function applyProjectFilter() {
    const region = document.getElementById('filterRegion').value;
    const enterprise = document.getElementById('filterEnterprise').value;
    const type = document.getElementById('filterProjectType').value;
    const keyword = document.getElementById('filterKeyword').value.toLowerCase();

    filteredProjects = allProjects.filter(p => {
        const matchRegion = !region || p.region === region;
        const matchEnterprise = !enterprise || (p.enterprise || '').includes(enterprise);
        const matchType = !type || p.type === type;
        const matchKeyword = !keyword || p.name.toLowerCase().includes(keyword) || p.address.toLowerCase().includes(keyword);
        return matchRegion && matchEnterprise && matchType && matchKeyword;
    });

    currentPage = 1;
    renderProjectTable();
}

function renderSelectedProjectsBar() {
    const count = selectedProjects.length;
    document.getElementById('selectedProjectCount').textContent = count;

    const container = document.getElementById('selectedProjectsTags');
    if (count === 0) {
        container.innerHTML = '<span style="color:var(--text-secondary);font-size:12px;">暂未选择范围</span>';
    } else {
        container.innerHTML = selectedProjects.map(p => `
            <span class="selected-project-tag">
                ${p.name}
                <i class="fas fa-times remove" onclick="removeSelectedProject(${p.id})"></i>
            </span>
        `).join('');
    }
}

function removeSelectedProject(id) {
    selectedProjectIds.delete(id);
    selectedProjects = allProjects.filter(p => selectedProjectIds.has(p.id));
    renderProjectTable();
}

function clearAllSelectedProjects() {
    selectedProjectIds.clear();
    selectedProjects = [];
    renderProjectTable();
}

// Filter events
function initProjectFilterEvents() {
    document.getElementById('filterRegion').addEventListener('change', applyProjectFilter);
    document.getElementById('filterEnterprise').addEventListener('change', applyProjectFilter);
    document.getElementById('filterProjectType').addEventListener('change', applyProjectFilter);
    document.getElementById('filterKeyword').addEventListener('input', applyProjectFilter);
}

// ===== Step 3: Confirm Info =====
function updateConfirmInfo() {
    const name = document.getElementById('taskName').value || '-';
    const typeMap = { routine: '日常巡查', special: '专项巡查', temporary: '临时巡查' };
    const type = typeMap[document.getElementById('taskType').value] || '-';
    const urgencyMap = { high: '高', medium: '中', low: '低' };
    const urgency = urgencyMap[document.getElementById('urgencyLevel').value] || '-';
    const start = document.getElementById('taskStartDate').value || '-';
    const end = document.getElementById('taskEndDate').value || '-';
    const unit = document.getElementById('assignUnit').value;
    const unitMap = { self: '本部门（奉贤区农村自建房管理科）', dept2: '南桥镇城建中心', dept3: '奉浦街道城建中心', dept4: '金海街道城建中心', dept5: '海湾镇城建中心', dept6: '青村镇城建中心' };
    const unitLabel = unitMap[unit] || '-';
    const selectedPersonNames = _selectedPersons.length > 0 ? _selectedPersons.map(p => p.name).join('、') : (unit !== 'self' && unit !== '' ? '由指派单位管理员分配' : '-');

    const desc = document.getElementById('taskDesc').value || '-';

    document.getElementById('confirmName').textContent = name;
    document.getElementById('confirmType').textContent = type;
    document.getElementById('confirmUrgency').textContent = urgency;
    document.getElementById('confirmPeriod').textContent = start !== '-' ? `${start} 至 ${end}` : '-';
    document.getElementById('confirmUnit').textContent = unitLabel;
    document.getElementById('confirmPerson').textContent = selectedPersonNames;
    document.getElementById('confirmDesc').textContent = desc;

    if (selectedProjects.length > 0) {
        document.getElementById('confirmProjects').innerHTML = selectedProjects.map(p =>
            `<span style="display:inline-block;margin:2px 4px;padding:2px 8px;background:var(--primary-light);color:var(--primary);border-radius:4px;font-size:12px;">${p.name}</span>`
        ).join('');
    } else {
        document.getElementById('confirmProjects').textContent = '-';
    }

    // 专项/临时巡查：显示街镇和检查项/风险清单
    const taskType = document.getElementById('taskType').value;
    if (taskType === 'special' || taskType === 'temporary') {
        const selectedTownNames = townData.filter(t => selectedTownIds.has(t.id)).map(t => t.name);
        const selectedRiskListNames = riskListData.filter(rl => selectedRiskListIds.has(rl.id)).map(rl => rl.name);
        
        // 构建自定义检查项表格HTML
        let customItemsHtml = '';
        if (customPatrolItems.length > 0) {
            customItemsHtml = `
                <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;">
                    <thead>
                        <tr style="background:var(--bg-hover);">
                            <th style="padding:6px 8px;border:1px solid var(--border);text-align:center;width:40px;">序号</th>
                            <th style="padding:6px 8px;border:1px solid var(--border);">主项</th>
                            <th style="padding:6px 8px;border:1px solid var(--border);">分项</th>
                            <th style="padding:6px 8px;border:1px solid var(--border);">分项内容</th>
                            <th style="padding:6px 8px;border:1px solid var(--border);">风险辨识</th>
                            <th style="padding:6px 8px;border:1px solid var(--border);">可能导致事故</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customPatrolItems.map((item, idx) => `
                            <tr>
                                <td style="padding:6px 8px;border:1px solid var(--border);text-align:center;">${idx + 1}</td>
                                <td style="padding:6px 8px;border:1px solid var(--border);">${item.mainItem || '-'}</td>
                                <td style="padding:6px 8px;border:1px solid var(--border);">${item.subItem || '-'}</td>
                                <td style="padding:6px 8px;border:1px solid var(--border);">${item.subContent || '-'}</td>
                                <td style="padding:6px 8px;border:1px solid var(--border);">${item.riskIdentify || '-'}</td>
                                <td style="padding:6px 8px;border:1px solid var(--border);">${item.mayCauseAccident || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
        
        document.getElementById('confirmProjects').innerHTML = `
            <div style="margin-bottom:8px;"><strong style="color:var(--text-secondary);">巡查街镇范围</strong>${selectedTownNames.join('、') || '-'}</div>
            <div style="margin-bottom:8px;"><strong style="color:var(--text-secondary);">农村自建房检查项</strong></div>
            ${customItemsHtml || '<span style="color:var(--text-secondary);">-</span>'}
            <div style="margin-top:8px;"><strong style="color:var(--text-secondary);">农村自建房风险清单：</strong>${selectedRiskListNames.join('、') || '-'}</div>
        `;
    }
}

// ===== 专项/临时巡查：街镇和巡查项数据=====
const townData = [
    { id: 'nanqiao', name: '南桥镇', icon: 'fa-solid fa-city' },
    { id: 'fengpu', name: '奉浦街道', icon: 'fa-solid fa-building' },
    { id: 'jinhai', name: '金海街道', icon: 'fa-solid fa-water' },
    { id: 'haiwan', name: '海湾镇', icon: 'fa-solid fa-umbrella-beach' },
    { id: 'qingcun', name: '青村镇', icon: 'fa-solid fa-tree' },
    { id: 'situan', name: '四团镇', icon: 'fa-solid fa-industry' },
    { id: 'zhuanghang', name: '庄行镇', icon: 'fa-solid fa-tractor' },
    { id: 'tuqiao', name: '柘林镇', icon: 'fa-solid fa-mountain' },
    { id: 'xinsi', name: '金汇镇', icon: 'fa-solid fa-road' },
    { id: 'fengcheng', name: '奉城镇', icon: 'fa-solid fa-landmark' }
];

const patrolItemData = [
    // 预设巡查项已删除，保留空数组以兼容旧代码
];

let selectedTownIds = new Set();
let selectedPatrolItems = new Set(); // 保留以兼容旧代码
let selectedRiskListIds = new Set();

// 根据任务类型切换Step2显示
function switchStep2ByType(type) {
    const routineEl = document.getElementById('step2-routine');
    const specialEl = document.getElementById('step2-special');
    if (type === 'routine') {
        routineEl.style.display = 'block';
        specialEl.style.display = 'none';
    } else {
        routineEl.style.display = 'none';
        specialEl.style.display = 'block';
        renderTownCards();
        renderRiskListTable();
    }
}

// 渲染街镇卡片
function renderTownCards() {
    const grid = document.getElementById('townCardGrid');
    grid.innerHTML = townData.map(town => {
        const isSelected = selectedTownIds.has(town.id);
        return `
            <div class="town-card ${isSelected ? 'selected' : ''}" onclick="toggleTownSelect('${town.id}')" style="position:relative;">
                <i class="${town.icon}"></i>
                <span class="town-name">${town.name}</span>
            </div>
        `;
    }).join('');
    renderSelectedTownsBar();
}

function toggleTownSelect(townId) {
    if (selectedTownIds.has(townId)) {
        selectedTownIds.delete(townId);
    } else {
        selectedTownIds.add(townId);
    }
    renderTownCards();
}

function renderSelectedTownsBar() {
    const bar = document.getElementById('selectedTownsBar');
    const tags = document.getElementById('selectedTownsTags');
    if (selectedTownIds.size === 0) {
        bar.style.display = 'none';
    } else {
        bar.style.display = 'flex';
        const selected = townData.filter(t => selectedTownIds.has(t.id));
        tags.innerHTML = selected.map(t => `
            <span class="selected-town-tag">
                ${t.name}
                <i class="fas fa-times remove" onclick="event.stopPropagation();toggleTownSelect('${t.id}')"></i>
            </span>
        `).join('');
    }
}

// 全选街镇
function selectAllTowns() {
    townData.forEach(t => selectedTownIds.add(t.id));
    renderTownCards();
}

// 重置街镇选择
function resetTowns() {
    selectedTownIds.clear();
    renderTownCards();
}

// 渲染巡查项
function renderPatrolItems() {
    // 预设巡查项已删除，此函数保留为空以兼容旧代码
}

function togglePatrolItem(itemId) {
    // 预设巡查项已删除，此函数保留为空以兼容旧代码
}

// 自定义检查项
let customPatrolItems = [];

function addCustomPatrolItem() {
    customPatrolItems.push({
        id: Date.now() + Math.random(),
        mainItem: '',
        subItem: '',
        subContent: '',
        riskIdentify: '',
        mayCauseAccident: '',
        riskLevel: ''
    });
    renderCustomPatrolItems();
}

function removeCustomPatrolItem(index) {
    customPatrolItems.splice(index, 1);
    renderCustomPatrolItems();
}

function updateCustomPatrolItem(index, field, value) {
    if (customPatrolItems[index]) {
        customPatrolItems[index][field] = value;
    }
}

function renderCustomPatrolItems() {
    const container = document.getElementById('customPatrolItemsList');
    if (customPatrolItems.length === 0) {
        container.innerHTML = '<tr><td colspan="8" class="custom-patrol-empty">暂无自定义检查项，请点击下方"添加检查项"按钮添加</td></tr>';
    } else {
        container.innerHTML = customPatrolItems.map((item, idx) => `
            <tr>
                <td class="cp-index">${idx + 1}</td>
                <td><input type="text" class="cp-input" placeholder="请输入主题" value="${item.mainItem || ''}" onchange="updateCustomPatrolItem(${idx}, 'mainItem', this.value)"></td>
                <td><input type="text" class="cp-input" placeholder="请输入分项" value="${item.subItem || ''}" onchange="updateCustomPatrolItem(${idx}, 'subItem', this.value)"></td>
                <td><input type="text" class="cp-input" placeholder="请输入分项内容" value="${item.subContent || ''}" onchange="updateCustomPatrolItem(${idx}, 'subContent', this.value)"></td>
                <td><input type="text" class="cp-input" placeholder="请输入风险辨识" value="${item.riskIdentify || ''}" onchange="updateCustomPatrolItem(${idx}, 'riskIdentify', this.value)"></td>
                <td><input type="text" class="cp-input" placeholder="请输入可能导致事故" value="${item.mayCauseAccident || ''}" onchange="updateCustomPatrolItem(${idx}, 'mayCauseAccident', this.value)"></td>
                <td style="text-align:center;">
                    <select class="cp-input" style="width:100%;min-width:70px;" onchange="updateCustomPatrolItem(${idx}, 'riskLevel', this.value)">
                        <option value="" ${!item.riskLevel ? 'selected' : ''}>请选择</option>
                        <option value="重大" ${item.riskLevel === '重大' ? 'selected' : ''}>重大</option>
                        <option value="较大" ${item.riskLevel === '较大' ? 'selected' : ''}>较大</option>
                        <option value="一般" ${item.riskLevel === '一般' ? 'selected' : ''}>一般</option>
                        <option value="低" ${item.riskLevel === '低' ? 'selected' : ''}>低</option>
                    </select>
                </td>
                <td class="cp-action">
                    <button class="action-link delete" onclick="removeCustomPatrolItem(${idx})">删除</button>
                </td>
            </tr>
        `).join('');
    }
}

// 回车添加自定义检查项（保留兼容）
document.addEventListener('DOMContentLoaded', function() {
    // 初始化渲染
    renderCustomPatrolItems();
});

// ===== 风险清单数据 =====
const riskListData = [
    { id: 'rl1', name: '农村自建房结构安全风险清单', version: 'V2.1', genTime: '2026-06-20', itemCount: 45 },
    { id: 'rl2', name: '农村自建房使用安全风险清单', version: 'V1.5', genTime: '2026-06-18', itemCount: 32 },
    { id: 'rl3', name: '农村自建房消防风险清单', version: 'V3.0', genTime: '2026-06-15', itemCount: 28 },
    { id: 'rl4', name: '农村自建房周边环境风险清单', version: 'V1.2', genTime: '2026-06-10', itemCount: 18 },
    { id: 'rl5', name: '农村自建房施工过程风险清单', version: 'V2.3', genTime: '2026-06-05', itemCount: 22 }
];

function renderRiskListTable() {
    const tbody = document.getElementById('riskListTableBody');
    tbody.innerHTML = riskListData.map(rl => {
        const isSelected = selectedRiskListIds.has(rl.id);
        return `
            <tr class="${isSelected ? 'selected' : ''}" data-id="${rl.id}">
                <td style="text-align:center;"><input type="checkbox" class="table-checkbox" ${isSelected ? 'checked' : ''} onchange="toggleRiskListSelect('${rl.id}')"></td>
                <td>${rl.name}</td>
                <td style="text-align:center;">${rl.version}</td>
                <td style="text-align:center;">${rl.genTime}</td>
                <td style="text-align:center;">${rl.itemCount}</td>
            </tr>
        `;
    }).join('');
    renderSelectedRiskListBar();
    updateRiskListHeaderCheck();
}

function toggleRiskListSelect(id) {
    if (selectedRiskListIds.has(id)) {
        selectedRiskListIds.delete(id);
    } else {
        selectedRiskListIds.add(id);
    }
    renderRiskListTable();
}

function toggleSelectAllRiskList() {
    const check = document.getElementById('riskListHeaderCheck').checked;
    if (check) {
        riskListData.forEach(rl => selectedRiskListIds.add(rl.id));
    } else {
        selectedRiskListIds.clear();
    }
    renderRiskListTable();
}

function updateRiskListHeaderCheck() {
    const allSelected = riskListData.length > 0 && riskListData.every(rl => selectedRiskListIds.has(rl.id));
    document.getElementById('riskListHeaderCheck').checked = allSelected;
}

function renderSelectedRiskListBar() {
    const bar = document.getElementById('selectedRiskListBar');
    const tags = document.getElementById('selectedRiskListTags');
    if (selectedRiskListIds.size === 0) {
        bar.style.display = 'none';
    } else {
        bar.style.display = 'flex';
        const selected = riskListData.filter(rl => selectedRiskListIds.has(rl.id));
        tags.innerHTML = selected.map(rl => `
            <span class="selected-town-tag">
                ${rl.name}
                <i class="fas fa-times remove" onclick="event.stopPropagation();toggleRiskListSelect('${rl.id}')"></i>
            </span>
        `).join('');
    }
}

// ===== Init =====
const today = new Date();
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
document.getElementById('taskStartDate').value = today.toISOString().split('T')[0];
document.getElementById('taskEndDate').value = nextWeek.toISOString().split('T')[0];

// 初始化指派人员选择状态（未选择单位时禁用）
if (typeof onAssignUnitChange === 'function') onAssignUnitChange();

filteredProjects = [...allProjects];
if (typeof initProjectFilterEvents === 'function') initProjectFilterEvents();
if (typeof renderProjectTable === 'function') renderProjectTable();
if (typeof updateStepper === 'function') updateStepper();
if (typeof initReturnedMode === 'function') initReturnedMode();

// 初始化专项/临时巡查的渲染（如果当前是专项/临时巡查）
const initTaskType = document.getElementById('taskType').value;
if (initTaskType === 'special' || initTaskType === 'temporary') {
    if (typeof renderTownCards === 'function') renderTownCards();
    if (typeof renderRiskListTable === 'function') renderRiskListTable();
}
