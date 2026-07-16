# -*- coding: utf-8 -*-
import re, os
from datetime import datetime

BASE = r'e:\风险管控0618'
SRC = os.path.join(BASE, 'pages', 'rural-warning-dispatch.html')
BAK = os.path.join(BASE, 'backups', 'rural-warning-dispatch.html.' + datetime.now().strftime('%Y%m%d-%H%M%S'))

with open(SRC, 'r', encoding='utf-8') as f:
    original = f.read()

# 备份
with open(BAK, 'w', encoding='utf-8') as f:
    f.write(original)

# 1. 在 </head> 前引入 house-arch-data.js
if '../js/house-arch-data.js' not in original:
    original = original.replace('</head>', '<script src="../js/house-arch-data.js"></script>\n</head>')

# 2. 替换左侧列内容
new_left_column = """<!-- Left Tab Navigation -->
<div class="left-tabs">
    <button class="left-tab-btn active" onclick="switchLeftTab(this,'left-tab-base')">
        <i class="fa-solid fa-circle-info"></i> 基础信息
    </button>
    <button class="left-tab-btn" onclick="switchLeftTab(this,'left-tab-facility')">
        <i class="fa-solid fa-house"></i> 房屋信息
    </button>
    <button class="left-tab-btn" onclick="switchLeftTab(this,'left-tab-monitor')">
        <i class="fa-solid fa-clipboard-list"></i> 检查记录
    </button>
    <button class="left-tab-btn" onclick="switchLeftTab(this,'left-tab-evidence')">
        <i class="fa-solid fa-camera"></i> 现场证据
    </button>
</div>

<!-- ===== TAB: 基础信息 ===== -->
<div id="left-tab-base" class="left-tab-panel active">

<!-- ===== 隐患基础信息 ===== -->
<div class="section-card">
    <div class="section-header">
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-circle-info"></i>
            隐患基础信息
        </div>
    </div>
    <div class="section-body">
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">隐患名称</span>
                <span class="info-value" id="base-riskName">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">隐患类型</span>
                <span class="info-value" id="base-riskType">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">隐患等级</span>
                <span class="info-value" id="base-riskLevel"><span class="risk-badge red">-</span></span>
            </div>
            <div class="info-item">
                <span class="info-label">所属房屋</span>
                <span class="info-value" id="base-houseName">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">隐患地址</span>
                <span class="info-value" id="base-address">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">影响范围</span>
                <span class="info-value" id="base-influence">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">当前状态</span>
                <span class="info-value" id="base-status"><span class="status-tag pending">待分发</span></span>
            </div>
            <div class="info-item">
                <span class="info-label">上报来源</span>
                <span class="info-value" id="base-source">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">上报时间</span>
                <span class="info-value" id="base-reportTime">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">上报人</span>
                <span class="info-value" id="base-reporter">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">处置单位</span>
                <span class="info-value" id="base-dutyUnit">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">产权人</span>
                <span class="info-value" id="base-owner">-</span>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">隐患描述</span>
                <span class="info-value" id="base-desc">-</span>
            </div>
        </div>
    </div>
</div>

<!-- ===== 风险详情 ===== -->
<div class="section-card" style="margin-top: 16px;">
    <div class="section-header">
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
            风险详情
        </div>
    </div>
    <div class="section-body">
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">风险部位</span>
                <span class="info-value" id="risk-part">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">风险类型</span>
                <span class="info-value" id="risk-type">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">风险等级</span>
                <span class="info-value" id="risk-class-level"><span class="risk-badge orange">-</span></span>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">风险描述</span>
                <span class="info-value" id="risk-desc">-</span>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">评定依据</span>
                <span class="info-value" id="risk-basis">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">评定时间</span>
                <span class="info-value" id="risk-assessTime">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">评定人</span>
                <span class="info-value" id="risk-assessor">-</span>
            </div>
        </div>
    </div>
</div>

</div>

<!-- ===== TAB: 房屋信息 ===== -->
<div id="left-tab-facility" class="left-tab-panel">

<!-- ===== 房屋信息 ===== -->
<div class="section-card">
    <div class="section-header">
        <i class="fa-solid fa-house"></i>
        房屋信息
    </div>
    <div class="section-body">
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">房屋编号</span>
                <span class="info-value" id="house-no">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">房屋结构</span>
                <span class="info-value" id="house-structure">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">层数</span>
                <span class="info-value" id="house-floors">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">建筑面积</span>
                <span class="info-value" id="house-area">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">屋顶形式</span>
                <span class="info-value" id="house-roof">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">墙体材料</span>
                <span class="info-value" id="house-wall">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">基础类型</span>
                <span class="info-value" id="house-foundation">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">建造年代</span>
                <span class="info-value" id="house-year">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">使用性质</span>
                <span class="info-value" id="house-usage">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">居住人数</span>
                <span class="info-value" id="house-occupancy">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">是否自住</span>
                <span class="info-value" id="house-selfLive">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">改扩建情况</span>
                <span class="info-value" id="house-expansion">-</span>
            </div>
        </div>
    </div>
</div>

<!-- ===== 房屋位置 ===== -->
<div class="section-card">
    <div class="section-header">
        <i class="fa-solid fa-map-location-dot"></i>
        房屋位置
    </div>
    <div class="section-body">
        <div class="gis-map-container">
            <div class="gis-map-placeholder">
                <i class="fa-solid fa-map"></i>
                <span>GIS 地图组件占位（接入高德/天地图引擎）</span>
                <div class="gis-map-marker">
                    <i class="fa-solid fa-location-dot"></i>
                </div>
                <div class="gis-map-info">
                    <div class="gis-map-info-item">
                        <i class="fa-solid fa-location-crosshairs"></i>
                        <span class="coord-label">经度</span>
                        <span class="coord-value" id="house-lng">-</span>
                    </div>
                    <div class="gis-map-info-item">
                        <i class="fa-solid fa-location-crosshairs"></i>
                        <span class="coord-label">纬度</span>
                        <span class="coord-value" id="house-lat">-</span>
                    </div>
                    <div class="gis-map-info-item">
                        <i class="fa-solid fa-road"></i>
                        <span class="coord-label">位置</span>
                        <span class="coord-value" id="house-location">-</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</div>

<!-- ===== TAB: 检查记录 ===== -->
<div id="left-tab-monitor" class="left-tab-panel">

<!-- ===== 检查记录 ===== -->
<div class="section-card">
    <div class="section-header">
        <i class="fa-solid fa-clipboard-list"></i>
        检查记录
    </div>
    <div class="section-body">
        <table class="data-table">
            <thead>
                <tr>
                    <th>检查时间</th>
                    <th>检查类型</th>
                    <th>检查人</th>
                    <th>检查结果</th>
                    <th>检查结论</th>
                </tr>
            </thead>
            <tbody id="inspection-records-body">
                <tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:24px;">暂无检查记录</td></tr>
            </tbody>
        </table>
    </div>
</div>

</div>

<!-- ===== TAB: 现场证据 ===== -->
<div id="left-tab-evidence" class="left-tab-panel">

<!-- ===== 现场照片 ===== -->
<div class="section-card">
    <div class="section-header">
        <i class="fa-solid fa-camera"></i>
        现场照片
    </div>
    <div class="section-body">
        <div class="evidence-gallery" id="evidence-gallery">
            <div class="evidence-item">
                <div class="evidence-thumb">
                    <i class="fa-regular fa-image"></i>
                </div>
                <div class="evidence-info">暂无现场照片</div>
            </div>
        </div>
    </div>
</div>

</div>

</div>"""

left_col_start = '<div class="left-column">\n'
right_col_start = '<div class="right-column">'
start_idx = original.find(left_col_start)
right_idx = original.find(right_col_start, start_idx + len(left_col_start))
if start_idx >= 0 and right_idx > start_idx:
    original = original[:start_idx + len(left_col_start)] + new_left_column + original[right_idx:]

# 3. 修改流转记录区域，清空静态内容，改为动态填充容器
flow_old = '<div class="compact-timeline">\n            <div class="compact-item completed">\n                <div class="compact-dot"><i class="fa-solid fa-check"></i></div>\n                <div class="compact-content">\n                    <div class="compact-title">隐患上报</div>\n                    <div class="compact-meta">\n                        <i class="fa-solid fa-user"></i> 张伟\n                        <i class="fa-solid fa-clock"></i> 2025-06-06 14:32\n                    </div>\n                    <div class="compact-desc">物联传感器检测到可燃气体浓度超限，系统自动上报隐患。</div>\n                </div>\n            </div>\n            <div class="compact-item active">\n                <div class="compact-dot"></div>\n                <div class="compact-content">\n                    <div class="compact-title">任务分发</div>\n                    <div class="compact-meta">\n                        <i class="fa-solid fa-user"></i> 李强（调度中心）\n                        <i class="fa-solid fa-clock"></i> 2025-06-06 14:35\n                    </div>\n                    <div class="compact-desc">当前处于分发环节，等待确认处置人及处置要求后下发。</div>\n                </div>\n            </div>\n        </div>'
flow_new = '<div class="compact-timeline" id="flow-timeline">\n            <div class="compact-item active">\n                <div class="compact-dot"></div>\n                <div class="compact-content">\n                    <div class="compact-title">任务分发</div>\n                    <div class="compact-meta">\n                        <i class="fa-solid fa-user"></i> -\n                        <i class="fa-solid fa-clock"></i> -\n                    </div>\n                    <div class="compact-desc">当前处于分发环节，等待确认处置人及处置要求后下发。</div>\n                </div>\n            </div>\n        </div>'
if flow_old in original:
    original = original.replace(flow_old, flow_new)

# 4. 在原有脚本中插入动态加载函数并修改初始化
load_data_funcs = """// ===== 动态加载农村自建房数据 =====
function getUrlParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || '';
}
function pad2(n) { return n < 10 ? '0' + n : n; }
function formatDateTime(d) {
    if (!d) return '-';
    if (typeof d === 'string' && d.includes(' ')) return d;
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate()) + ' ' + pad2(dt.getHours()) + ':' + pad2(dt.getMinutes());
}
function mapRiskClass(level) {
    if (level === '重大隐患') return 'red';
    if (level === '较大隐患') return 'orange';
    if (level === '一般隐患') return 'yellow';
    return 'blue';
}
function mapStatus(status) {
    if (status === 'reject-check') return { label: '已驳回', cls: 'reject-audit' };
    if (status === 'closed') return { label: '已销号', cls: 'reject-audit' };
    if (status === 'pending-accept') return { label: '待验收', cls: 'pending' };
    if (status === 'handling') return { label: '处置中', cls: 'pending' };
    if (status === 'pending-dispatch') return { label: '待分发', cls: 'pending' };
    return { label: '待审核', cls: 'pending' };
}
function renderBadge(level) {
    const cls = mapRiskClass(level);
    return `<span class="risk-badge ${cls}">${level}</span>`;
}
function renderStatusTag(statusKey) {
    const s = mapStatus(statusKey);
    return `<span class="status-tag ${s.cls}">${s.label}</span>`;
}
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '-';
}
function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}
function loadData() {
    if (typeof initHouseArchSeed !== 'function' || typeof getHouseRecord !== 'function') return;
    initHouseArchSeed();
    const no = getUrlParam('no');
    if (!no) return;
    const rec = getHouseRecord(no);
    if (!rec) return;
    const riskInfo = rec.riskInfo || {};
    const riskClass = rec.riskClassification || {};
    const structure = rec.structure || {};
    const usage = rec.usage || {};
    const firstHazard = (rec.hazards && rec.hazards[0]) || {};
    const firstInspection = (rec.inspectionRecords && rec.inspectionRecords[0]) || {};
    const reportTime = firstInspection.reportTime || (firstInspection.checkDate ? firstInspection.checkDate + ' 09:00' : '2025-06-01 09:00');
    const level = riskInfo.riskLevel || rec.riskLevel || '一般隐患';

    // 基础信息
    setText('base-riskName', riskInfo.riskName || rec.name + ' 风险隐患');
    setText('base-riskType', riskInfo.riskType || firstHazard.type || '结构隐患');
    setHtml('base-riskLevel', renderBadge(level));
    setText('base-houseName', rec.name);
    setText('base-address', rec.address);
    setText('base-influence', riskInfo.spatialLocation || rec.address);
    setHtml('base-status', renderStatusTag('pending-dispatch'));
    setText('base-source', riskInfo.discoveryMethod || '排查发现');
    setText('base-reportTime', formatDateTime(reportTime));
    setText('base-reporter', rec.owner);
    setText('base-dutyUnit', rec.responsibleDept || (rec.street + '城建中心'));
    setText('base-owner', rec.owner);
    setText('base-desc', riskInfo.riskDesc || (firstHazard.part || '') + '存在' + (riskInfo.riskType || '安全隐患') + '，需进一步处置');

    // 风险详情
    setText('risk-part', riskInfo.riskPart || firstHazard.part || '-');
    setText('risk-type', riskInfo.riskType || firstHazard.type || '-');
    setHtml('risk-class-level', renderBadge(riskClass.level || level));
    setText('risk-desc', riskInfo.riskDesc || '-');
    setText('risk-basis', riskClass.basis || '依据《农村住房危险性鉴定标准》综合评定');
    setText('risk-assessTime', formatDateTime(riskClass.assessTime || firstInspection.checkDate));
    setText('risk-assessor', riskClass.assessor || firstInspection.checker || '-');

    // 房屋信息
    setText('house-no', rec.no);
    setText('house-structure', structure.structureType || rec.category || '-');
    setText('house-floors', structure.floors || '-');
    setText('house-area', structure.buildingArea || '-');
    setText('house-roof', structure.roofType || '-');
    setText('house-wall', structure.wallMaterial || '-');
    setText('house-foundation', structure.foundationType || '-');
    setText('house-year', rec.year || '-');
    setText('house-usage', usage.usageType || '-');
    setText('house-occupancy', usage.occupancy || '-');
    setText('house-selfLive', usage.isSelfLive || '-');
    setText('house-expansion', structure.expansionStatus || '否');
    setText('house-lng', rec.lng || '-');
    setText('house-lat', rec.lat || '-');
    setText('house-location', rec.address);

    // 检查记录
    const tbody = document.getElementById('inspection-records-body');
    if (tbody) {
        const records = rec.inspectionRecords || [];
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary);padding:24px;">暂无检查记录</td></tr>';
        } else {
            tbody.innerHTML = records.map(r => `
                <tr>
                    <td>${formatDateTime(r.checkDate + ' ' + (r.checkTime || '09:00'))}</td>
                    <td>${r.checkType || '日常检查'}</td>
                    <td>${r.checker || '-'}</td>
                    <td>${r.checkResult || '-'}</td>
                    <td>${r.checkConclusion || '-'}</td>
                </tr>
            `).join('');
        }
    }

    // 现场证据
    const gallery = document.getElementById('evidence-gallery');
    if (gallery) {
        const photos = rec.photos ? (Array.isArray(rec.photos) ? rec.photos : []) : [];
        if (photos.length === 0) {
            gallery.innerHTML = `
                <div class="evidence-item">
                    <div class="evidence-thumb"><i class="fa-regular fa-image"></i></div>
                    <div class="evidence-info">暂无现场照片</div>
                </div>`;
        } else {
            gallery.innerHTML = photos.slice(0, 8).map(p => `
                <div class="evidence-item">
                    <div class="evidence-thumb"><i class="fa-regular fa-image"></i></div>
                    <div class="evidence-info">${p.description || '现场照片'}<br>${p.shootTime || '-'}</div>
                </div>
            `).join('');
        }
    }

    // 流转记录
    const timeline = document.getElementById('flow-timeline');
    if (timeline) {
        const records = rec.inspectionRecords || [];
        const manage = rec.manageRecords || [];
        const items = [];
        items.push({ title: '隐患上报', user: rec.owner || '上报人', time: formatDateTime(reportTime), desc: '隐患上报，等待分发', completed: true });
        if (records.length) {
            items.push({ title: '检查排查', user: records[0].checker || '排查人员', time: formatDateTime(records[0].checkDate + ' 09:00'), desc: records[0].checkConclusion || '现场检查并记录隐患', completed: true });
        }
        if (manage.length) {
            items.push({ title: '任务分配', user: rec.responsiblePerson || '处置负责人', time: formatDateTime(manage[0].assignTime || reportTime), desc: manage[0].taskName || '已分配处置任务', completed: false });
        }
        timeline.innerHTML = items.map(item => `
            <div class="compact-item ${item.completed ? 'completed' : 'active'}">
                <div class="compact-dot">${item.completed ? '<i class="fa-solid fa-check"></i>' : ''}</div>
                <div class="compact-content">
                    <div class="compact-title">${item.title}</div>
                    <div class="compact-meta">
                        <span><i class="fa-solid fa-user"></i> ${item.user}</span>
                        <span><i class="fa-solid fa-clock"></i> ${item.time}</span>
                    </div>
                    <div class="compact-desc">${item.desc}</div>
                </div>
            </div>
        `).join('');
    }
}

// Initialize"""

init_marker = """// Initialize"""
if init_marker in original:
    original = original.replace(init_marker, load_data_funcs, 1)
else:
    print('警告：未找到 // Initialize 标记，动态加载函数未插入')

# 修改 DOMContentLoaded 初始化，同时调用 renderOrgTree 和 loadData
init_listener_old = """document.addEventListener('DOMContentLoaded', function() {
    renderOrgTree();
});"""
init_listener_new = """document.addEventListener('DOMContentLoaded', function() {
    renderOrgTree();
    loadData();
});"""
if init_listener_old in original:
    original = original.replace(init_listener_old, init_listener_new, 1)
else:
    # 兜底：在 </script> 前追加
    original = original.replace('</script>\n</body>', '\nloadData();\n</script>\n</body>')

with open(SRC, 'w', encoding='utf-8') as f:
    f.write(original)

print('已生成新的 rural-warning-dispatch.html，备份：', BAK)
