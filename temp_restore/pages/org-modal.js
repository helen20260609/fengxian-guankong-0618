/**
 * ===== 组织架构弹窗组件 JS =====
 * 依赖：org-data.js（组织架构数据）
 * 
 * 提供两个弹窗：
 * 1. 单位选择弹窗（unitModal）- 选择单个部门
 * 2. 人员选择弹窗（orgModal）- 按部门筛选并选择人员
 */

// ===== 状态变量 =====
let _unitCallback = null;
let _unitSelectedDeptId = null;
let _orgCallback = null;
let _orgUnitFilter = null;
let selectedOrgPersonIds = new Set();
let currentOrgDeptId = 'dept1';
let expandedOrgDepts = new Set(['dept1']);

// ===== 单位选择弹窗 =====

function openUnitModal(callback) {
    _unitCallback = callback;
    _unitSelectedDeptId = null;
    document.getElementById('unitModal').classList.add('active');
    renderUnitTree();
    highlightUnitSelection();
}

function closeUnitModal() {
    document.getElementById('unitModal').classList.remove('active');
    _unitCallback = null;
    _unitSelectedDeptId = null;
}

function confirmUnitSelection() {
    if (!_unitSelectedDeptId) {
        alert('请先选择一个部门');
        return;
    }
    const dept = findDeptById(orgData, _unitSelectedDeptId);
    if (_unitCallback) {
        _unitCallback(_unitSelectedDeptId, dept ? dept.name : '');
    }
    closeUnitModal();
}

function renderUnitTree() {
    const container = document.getElementById('unitTreePanel');
    if (!container) return;
    container.innerHTML = buildUnitTreeHtml(orgData, 0);
    highlightUnitSelection();
}

function buildUnitTreeHtml(nodes, depth) {
    return nodes.map(node => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedOrgDepts.has(node.id);
        const indent = depth * 12;
        const isSelected = _unitSelectedDeptId === node.id;

        let html = `<div class="org-tree-item ${isSelected ? 'selected' : ''}" style="padding-left:${16 + indent}px" data-id="${node.id}" onclick="selectUnit('${node.id}')">`;
        if (hasChildren) {
            html += `<i class="fas fa-chevron-right toggle-icon ${isExpanded ? 'expanded' : ''}" style="margin-right:4px;" onclick="event.stopPropagation();toggleUnitDept('${node.id}')"></i>`;
        } else {
            html += `<i class="fas fa-building" style="margin-right:4px;font-size:11px;"></i>`;
        }
        html += `<span>${node.name}</span></div>`;

        if (hasChildren && isExpanded) {
            html += `<div class="org-tree-children">${buildUnitTreeHtml(node.children, depth + 1)}</div>`;
        }
        return html;
    }).join('');
}

function toggleUnitDept(deptId) {
    if (expandedOrgDepts.has(deptId)) {
        expandedOrgDepts.delete(deptId);
    } else {
        expandedOrgDepts.add(deptId);
    }
    renderUnitTree();
}

function selectUnit(deptId) {
    const dept = findDeptById(orgData, deptId);
    const hasChildren = dept && dept.children && dept.children.length > 0;
    
    // 如果有子节点，先展开/折叠
    if (hasChildren) {
        toggleUnitDept(deptId);
    }
    
    // 选中该节点
    _unitSelectedDeptId = deptId;
    highlightUnitSelection();
}

function highlightUnitSelection() {
    document.querySelectorAll('#unitTreePanel .org-tree-item').forEach(item => {
        item.classList.toggle('selected', item.dataset.id === _unitSelectedDeptId);
    });
}

// ===== 人员选择弹窗 =====

function openOrgModal(callback, options = {}) {
    _orgCallback = callback;
    _orgUnitFilter = options.unitFilter || null;
    selectedOrgPersonIds = new Set();

    // 根据单位筛选确定当前部门
    if (_orgUnitFilter) {
        currentOrgDeptId = _orgUnitFilter;
        expandedOrgDepts = new Set([_orgUnitFilter]);
    } else {
        currentOrgDeptId = 'dept1';
        expandedOrgDepts = new Set(['dept1']);
    }

    document.getElementById('orgModal').classList.add('active');
    if (_orgUnitFilter) {
        renderOrgTreeFiltered();
    } else {
        renderOrgTree();
    }
    renderOrgPersons();
    updateOrgPanelTitle();
}

function closeOrgModal() {
    document.getElementById('orgModal').classList.remove('active');
    _orgCallback = null;
    _orgUnitFilter = null;
}

function confirmOrgSelection() {
    const selectedPersons = orgPersons.filter(p => selectedOrgPersonIds.has(p.id));
    if (_orgCallback) {
        _orgCallback(selectedPersons);
    }
    closeOrgModal();
}

function renderOrgTreeFiltered() {
    const container = document.getElementById('orgTreePanel');
    if (!container) return;
    const filteredData = getFilteredOrgData(orgData, currentOrgDeptId);
    container.innerHTML = buildOrgTreeHtml(filteredData, 0, true);
}

function renderOrgTree() {
    const container = document.getElementById('orgTreePanel');
    if (!container) return;
    container.innerHTML = buildOrgTreeHtml(orgData, 0);
}

function getFilteredOrgData(nodes, targetId) {
    for (const node of nodes) {
        if (node.id === targetId) {
            return [node];
        }
        if (node.children && node.children.length > 0) {
            const found = getFilteredOrgData(node.children, targetId);
            if (found.length > 0) {
                return [{ ...node, children: found }];
            }
        }
    }
    return [];
}

function buildOrgTreeHtml(nodes, depth, isFiltered = false) {
    return nodes.map(node => {
        const isExpanded = expandedOrgDepts.has(node.id);
        const isActive = currentOrgDeptId === node.id;
        const hasChildren = node.children && node.children.length > 0;
        const indent = depth * 12;

        let html = `<div class="org-tree-item ${isActive ? 'active' : ''}" style="padding-left:${16 + indent}px" data-id="${node.id}" onclick="selectOrgDept('${node.id}')">`;
        if (hasChildren) {
            html += `<i class="fas fa-chevron-right toggle-icon ${isExpanded ? 'expanded' : ''}" style="margin-right:4px;" onclick="event.stopPropagation();toggleOrgDept('${node.id}')"></i>`;
        } else {
            html += `<i class="fas fa-building" style="margin-right:4px;font-size:11px;"></i>`;
        }
        html += `<span>${node.name}</span></div>`;

        if (hasChildren && isExpanded) {
            html += `<div class="org-tree-children">${buildOrgTreeHtml(node.children, depth + 1, isFiltered)}</div>`;
        }
        return html;
    }).join('');
}

function toggleOrgDept(deptId) {
    if (expandedOrgDepts.has(deptId)) {
        expandedOrgDepts.delete(deptId);
    } else {
        expandedOrgDepts.add(deptId);
    }
    if (document.getElementById('orgModal').classList.contains('active')) {
        if (_orgUnitFilter) {
            renderOrgTreeFiltered();
        } else {
            renderOrgTree();
        }
    }
}

function selectOrgDept(deptId) {
    currentOrgDeptId = deptId;
    if (document.getElementById('orgModal').classList.contains('active')) {
        if (_orgUnitFilter) {
            renderOrgTreeFiltered();
        } else {
            renderOrgTree();
        }
    }
    renderOrgPersons();
    updateOrgPanelTitle();
}

function renderOrgPersons() {
    const searchInput = document.getElementById('orgPersonSearch');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const tbody = document.getElementById('orgPersonTableBody');
    if (!tbody) return;

    const deptPersons = orgPersons.filter(p => {
        const inDept = p.deptId === currentOrgDeptId || isChildDept(p.deptId, currentOrgDeptId);
        const matchSearch = !search || p.name.toLowerCase().includes(search);
        return inDept && matchSearch;
    });

    if (deptPersons.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--text-secondary);">暂无人员</td></tr>`;
        return;
    }

    tbody.innerHTML = deptPersons.map(p => `
        <tr class="${selectedOrgPersonIds.has(p.id) ? 'selected' : ''}" data-id="${p.id}">
            <td><input type="checkbox" class="person-checkbox" ${selectedOrgPersonIds.has(p.id) ? 'checked' : ''} onchange="toggleOrgPerson('${p.id}')"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.role || '-'}</td>
            <td>${p.dept}</td>
            <td>${p.phone}</td>
        </tr>
    `).join('');

    const selectAllCheckbox = document.getElementById('orgSelectAll');
    if (selectAllCheckbox) {
        const allChecked = deptPersons.length > 0 && deptPersons.every(p => selectedOrgPersonIds.has(p.id));
        selectAllCheckbox.checked = allChecked;
    }
}

function isChildDept(childId, parentId) {
    function findNode(nodes, id) {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }
    function isDescendant(node, targetId) {
        if (!node.children) return false;
        for (const child of node.children) {
            if (child.id === targetId) return true;
            if (isDescendant(child, targetId)) return true;
        }
        return false;
    }
    const parentNode = findNode(orgData, parentId);
    if (!parentNode) return false;
    return isDescendant(parentNode, childId);
}

function toggleOrgPerson(personId) {
    if (selectedOrgPersonIds.has(personId)) {
        selectedOrgPersonIds.delete(personId);
    } else {
        selectedOrgPersonIds.add(personId);
    }
    renderOrgPersons();
    updateOrgPanelTitle();
}

function toggleOrgSelectAll() {
    const searchInput = document.getElementById('orgPersonSearch');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const deptPersons = orgPersons.filter(p => {
        const inDept = p.deptId === currentOrgDeptId || isChildDept(p.deptId, currentOrgDeptId);
        const matchSearch = !search || p.name.toLowerCase().includes(search);
        return inDept && matchSearch;
    });

    const allSelected = deptPersons.every(p => selectedOrgPersonIds.has(p.id));
    if (allSelected) {
        deptPersons.forEach(p => selectedOrgPersonIds.delete(p.id));
    } else {
        deptPersons.forEach(p => selectedOrgPersonIds.add(p.id));
    }
    renderOrgPersons();
    updateOrgPanelTitle();
}

function filterOrgPersons() {
    renderOrgPersons();
}

function updateOrgPanelTitle() {
    const titleEl = document.getElementById('orgPanelTitle');
    if (!titleEl) return;
    const dept = findDeptById(orgData, currentOrgDeptId);
    const deptName = dept ? dept.name : '未知部门';
    const selectedCount = selectedOrgPersonIds.size;
    titleEl.innerHTML = `<strong>${deptName}</strong> · 已选 ${selectedCount} 人`;
}

function findDeptById(nodes, id) {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children && node.children.length > 0) {
            const found = findDeptById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

// ===== 工具函数 =====

function removeSelectedPerson(personId) {
    selectedOrgPersonIds.delete(personId);
    // 触发外部更新回调（如果页面有定义）
    if (typeof updatePersonDisplay === 'function') {
        updatePersonDisplay();
    }
}

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { openUnitModal, closeUnitModal, openOrgModal, closeOrgModal };
}
