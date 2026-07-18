initHouseArchSeed();
const baseData = (() => {
    const recs = getAllHouseRecords();
    return recs.map(r => ({
        no: r.no,
        name: r.name,
        street: r.street,
        community: r.community,
        address: r.address,
        category: r.category,
        year: r.year,
        risk: r.risk,
        governance: r.governance,
        elimination: r.eliminationInfo ?
            (r.closeStatus === '已通过' ? 'done' : r.closeStatus === '审核中' ? 'review' : r.closeStatus === '已驳回' ? 'rejected' : 'pending') :
            'pending',
        owner: r.owner,
        lat: r.lat,
        lng: r.lng,
        responsibleDept: r.responsibleDept,
        responsiblePerson: r.responsiblePerson,
        progress: r.progress,
        hazards: r.hazards || [],
        measures: r.measures || [],
        eliminationInfo: r.eliminationInfo || { applyTime: null, reviewTime: null, reviewer: null, certFiles: [], note: '尚未提交销号申请' }
    }));
})();

let filteredData = [...baseData];
let activeFilter = 'all';
let activeTimeFilter = 'all';
let activeIndex = -1;
let currentLayer = 'governance';
let currentLevel = 'district';
let currentStreet = null;
let currentCommunity = null;
let map, markers = [];
let leftChart, streetRankingChart, measurePieChart;

const RISK_CONFIG = {
    danger: { label: '重大隐患', color: '#d93025', class: 'danger', shape: 'triangle' },
    major: { label: '较大隐患', color: '#f57c00', class: 'major', shape: 'square' },
    warning: { label: '一般隐患', color: '#f9ab00', class: 'warning', shape: 'circle' },
    safe: { label: '安全', color: '#34a853', class: 'safe', shape: 'circle' }
};

const STATUS_CONFIG = {
    pending: { label: '待整治', color: '#9aa0a6', class: 'treat-pending' },
    doing: { label: '整治中', color: '#f9ab00', class: 'treat-doing' },
    done: { label: '已治理', color: '#1e8e3e', class: 'treat-done' },
    overdue: { label: '逾期未整治', color: '#d93025', class: 'treat-overdue' }
};

const ELIMINATION_CONFIG = {
    pending: { label: '待申请', color: '#9aa0a6', class: 'elim-pending' },
    review: { label: '已申请待审核', color: '#1a73e8', class: 'elim-review' },
    done: { label: '审核通过已销号', color: '#1e8e3e', class: 'elim-done' },
    rejected: { label: '审核驳回待整改', color: '#d93025', class: 'elim-rejected' }
};

const TIME_FILTER_CONFIG = {
    all: { label: '全部时间', icon: 'fa-calendar' },
    month: { label: '本月销号', icon: 'fa-calendar-day' },
    quarter: { label: '本季度销号', icon: 'fa-calendar-week' },
    year: { label: '本年度销号', icon: 'fa-calendar-alt' }
};

function matchTimeFilter(item, filter) {
    if (filter === 'all') return true;
    const info = item.eliminationInfo;
    if (!info || !info.reviewTime) return false;
    const date = new Date(info.reviewTime);
    const now = new Date();
    const y = date.getFullYear(), m = date.getMonth(), q = Math.floor(m / 3);
    const cy = now.getFullYear(), cm = now.getMonth(), cq = Math.floor(cm / 3);
    if (filter === 'month') return y === cy && m === cm;
    if (filter === 'quarter') return y === cy && q === cq;
    if (filter === 'year') return y === cy;
    return true;
}


const LAYER_MODES = {
    base: {
        name: '房屋底图', colorBy: 'risk', shapeBy: 'risk', statusMap: RISK_CONFIG,
        filters: [
            { key: 'all', label: '全部', icon: 'fa-home' }, { key: 'danger', label: '重大', icon: 'fa-exclamation-triangle' },
            { key: 'major', label: '较大', icon: 'fa-exclamation-circle' }, { key: 'warning', label: '一般', icon: 'fa-exclamation' },
            { key: 'safe', label: '低风险', icon: 'fa-check-circle' }
        ]
    },
    governance: {
        name: '治理状态', colorBy: 'governance', shapeBy: 'risk', statusMap: STATUS_CONFIG,
        filters: [
            { key: 'all', label: '全部', icon: 'fa-home' }, { key: 'pending', label: '待整治', icon: 'fa-clock' },
            { key: 'doing', label: '整治中', icon: 'fa-spinner' }, { key: 'done', label: '已整治', icon: 'fa-check' },
            { key: 'overdue', label: '逾期未整治', icon: 'fa-exclamation-triangle' }
        ]
    },
    management: {
        name: '管理措施', colorBy: 'governance', shapeBy: 'risk', statusMap: STATUS_CONFIG, measureType: 'management',
        filters: [
            { key: 'all', label: '全部', icon: 'fa-home' }, { key: 'pending', label: '待整治', icon: 'fa-clock' },
            { key: 'doing', label: '整治中', icon: 'fa-spinner' }, { key: 'done', label: '已整治', icon: 'fa-check' },
            { key: 'overdue', label: '逾期未整治', icon: 'fa-exclamation-triangle' }
        ]
    },
    engineering: {
        name: '工程措施', colorBy: 'governance', shapeBy: 'risk', statusMap: STATUS_CONFIG, measureType: 'engineering',
        filters: [
            { key: 'all', label: '全部', icon: 'fa-home' }, { key: 'pending', label: '待整治', icon: 'fa-clock' },
            { key: 'doing', label: '整治中', icon: 'fa-spinner' }, { key: 'done', label: '已整治', icon: 'fa-check' },
            { key: 'overdue', label: '逾期未整治', icon: 'fa-exclamation-triangle' }
        ]
    },
    elimination: {
        name: '消险状态', colorBy: 'elimination', shapeBy: 'risk', statusMap: ELIMINATION_CONFIG,
        filters: [
            { key: 'all', label: '全部', icon: 'fa-home' }, { key: 'pending', label: '待申请', icon: 'fa-clock' },
            { key: 'review', label: '已申请待审核', icon: 'fa-hourglass-half' },
            { key: 'done', label: '审核通过已销号', icon: 'fa-check' },
            { key: 'rejected', label: '审核驳回待整改', icon: 'fa-times-circle' }
        ]
    },
    eliminationHeatmap: {
        name: '销号热力图', colorBy: 'elimination', shapeBy: 'risk', statusMap: ELIMINATION_CONFIG, isHeatmap: true,
        filters: [
            { key: 'all', label: '全部', icon: 'fa-home' }, { key: 'pending', label: '待申请', icon: 'fa-clock' },
            { key: 'review', label: '已申请待审核', icon: 'fa-hourglass-half' },
            { key: 'done', label: '审核通过已销号', icon: 'fa-check' },
            { key: 'rejected', label: '审核驳回待整改', icon: 'fa-times-circle' }
        ]
    }
};

const fengxianBoundary = [
    [30.993, 121.401], [30.960, 121.370], [30.900, 121.385], [30.850, 121.435], [30.860, 121.580], [30.940, 121.600], [30.990, 121.570], [31.010, 121.480], [30.993, 121.401]
];

function getRiskConfig(risk) { return RISK_CONFIG[risk] || RISK_CONFIG.safe; }
function getStatusConfig(governance) { return STATUS_CONFIG[governance] || STATUS_CONFIG.pending; }
function getEliminationConfig(elimination) { return ELIMINATION_CONFIG[elimination] || ELIMINATION_CONFIG.pending; }
function getLayerConfig() { return LAYER_MODES[currentLayer]; }
function getHouseColor(item) {
    const mode = getLayerConfig();
    if (mode.colorBy === 'risk') return getRiskConfig(item.risk).color;
    if (mode.colorBy === 'governance') return getStatusConfig(item.governance).color;
    if (mode.colorBy === 'elimination') return getEliminationConfig(item.elimination).color;
    return '#999';
}
function getHouseShape(item) { return getRiskConfig(item.risk).shape; }
function getCategoryText(cat) { return cat === '砖混' ? '砖混结构' : cat === '砖木' ? '砖木结构' : '框架结构'; }
function getShapeHtml(shape, color, size) {
    size = size || 10;
    if (shape === 'circle') return '<div class="shape circle" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';"></div>';
    if (shape === 'square') return '<div class="shape square" style="width:' + size + 'px;height:' + size + 'px;border-radius:2px;background:' + color + ';"></div>';
    if (shape === 'triangle') { const half = Math.round(size / 2); return '<div class="shape triangle" style="width:0;height:0;border-left:' + half + 'px solid transparent;border-right:' + half + 'px solid transparent;border-bottom:' + size + 'px solid ' + color + ';"></div>'; }
    return '';
}
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}
function createShapeIcon(shape, color, size) {
    size = size || 20;
    let svg = '';
    if (shape === 'circle') svg = '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg"><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + (size/2 - 1) + '" fill="' + color + '" stroke="#fff" stroke-width="1.5"/></svg>';
    else if (shape === 'square') svg = '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="1.5" width="' + (size-3) + '" height="' + (size-3) + '" rx="2" fill="' + color + '" stroke="#fff" stroke-width="1.5"/></svg>';
    else if (shape === 'triangle') { const h = size, w = size, points = (w/2) + ',1.5 1.5,' + (h-1.5) + ' ' + (w-1.5) + ',' + (h-1.5); svg = '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg"><polygon points="' + points + '" fill="' + color + '" stroke="#fff" stroke-width="1.5"/></svg>'; }
    const url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    return L.icon({ iconUrl: url, iconSize: [size, size], iconAnchor: [size/2, size/2], popupAnchor: [0, -size/2] });
}
function createClusterIcon(count, color) {
    const size = count < 10 ? 28 : count < 50 ? 36 : 44;
    return L.divIcon({ className: 'cluster-marker', html: '<div class="cluster-icon" style="width:' + size + 'px;height:' + size + 'px;background:' + color + ';">' + count + '</div>', iconSize: [size, size], iconAnchor: [size/2, size/2] });
}
function initMap() {
    map = L.map('map').setView([30.920, 121.500], 11);
    L.tileLayer('https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}', { attribution: '© GeoQ', maxZoom: 18 }).addTo(map);
    L.polygon(fengxianBoundary, { color: '#1a73e8', weight: 2, fillColor: '#1a73e8', fillOpacity: 0.08, dashArray: '5, 5' }).addTo(map).bindPopup('上海奉贤区范围');
    renderMap();
}
function getFilteredByDrill(data) {
    let list = data;
    if (currentLevel === 'street' && currentStreet) list = list.filter(d => d.street === currentStreet);
    else if ((currentLevel === 'community' || currentLevel === 'building') && currentStreet && currentCommunity) list = list.filter(d => d.street === currentStreet && d.community === currentCommunity);
    return list;
}
function getVisibleData() { return getFilteredByDrill(filteredData); }
function renderMap() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    const data = getVisibleData();
    if (currentLayer === 'eliminationHeatmap') {
        renderHeatmap(data);
    } else if (currentLevel === 'district') renderStreetClusters(data);
    else if (currentLevel === 'street') renderCommunityClusters(data);
    else renderBuildingMarkers(data);
    renderLegend();
    renderStats();
    renderDashboard();
    renderLeftChart();
    if (markers.length && currentLayer !== 'eliminationHeatmap') { const group = L.featureGroup(markers); map.fitBounds(group.getBounds().pad(0.1)); }
}
function renderStreetClusters(data) {
    const groups = {};
    data.forEach(item => { if (!groups[item.street]) groups[item.street] = []; groups[item.street].push(item); });
    Object.keys(groups).forEach(street => {
        const items = groups[street], avgLat = items.reduce((s, i) => s + i.lat, 0) / items.length, avgLng = items.reduce((s, i) => s + i.lng, 0) / items.length;
        const marker = L.marker([avgLat, avgLng], { icon: createClusterIcon(items.length, getAggregateColor(items)) }).addTo(map);
        marker.bindPopup(buildClusterPopup(street, items, 'street'));
        marker.on('click', () => drillToStreet(street));
        markers.push(marker);
    });
}
function renderCommunityClusters(data) {
    const groups = {};
    data.forEach(item => { if (!groups[item.community]) groups[item.community] = []; groups[item.community].push(item); });
    Object.keys(groups).forEach(community => {
        const items = groups[community], avgLat = items.reduce((s, i) => s + i.lat, 0) / items.length, avgLng = items.reduce((s, i) => s + i.lng, 0) / items.length;
        const marker = L.marker([avgLat, avgLng], { icon: createClusterIcon(items.length, getAggregateColor(items)) }).addTo(map);
        marker.bindPopup(buildClusterPopup(community, items, 'community'));
        marker.on('click', () => drillToCommunity(community));
        markers.push(marker);
    });
}
function renderBuildingMarkers(data) {
    data.forEach((item, idx) => {
        const marker = L.marker([item.lat, item.lng], { icon: createShapeIcon(getHouseShape(item), getHouseColor(item), 22) }).addTo(map);
        marker.bindPopup(buildHousePopup(item, idx));
        marker.on('click', () => selectHouse(idx));
        markers.push(marker);
    });
}

function renderHeatmap(data) {
    const mode = getLayerConfig();
    data.forEach(item => {
        if (item.elimination === 'done' || item.elimination === 'review') {
            const color = getHouseColor(item);
            const radius = item.elimination === 'done' ? 28 : 18;
            const marker = L.circleMarker([item.lat, item.lng], {
                radius: radius,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 0.6,
                fillOpacity: 0.45
            }).addTo(map);
            marker.bindPopup(buildHousePopup(item, data.indexOf(item)));
            marker.on('click', () => selectHouse(data.indexOf(item)));
            markers.push(marker);
        }
    });
    if (markers.length) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}
function getAggregateColor(items) {
    const mode = getLayerConfig();
    if (currentLayer === 'governance' || currentLayer === 'management' || currentLayer === 'engineering') {
        if (items.some(i => i.governance === 'overdue')) return STATUS_CONFIG.overdue.color;
        if (items.some(i => i.governance === 'doing')) return STATUS_CONFIG.doing.color;
        if (items.some(i => i.governance === 'pending')) return STATUS_CONFIG.pending.color;
        return STATUS_CONFIG.done.color;
    } else if (currentLayer === 'elimination') {
        if (items.some(i => i.elimination === 'rejected')) return ELIMINATION_CONFIG.rejected.color;
        if (items.some(i => i.elimination === 'pending')) return ELIMINATION_CONFIG.pending.color;
        if (items.some(i => i.elimination === 'review')) return ELIMINATION_CONFIG.review.color;
        return ELIMINATION_CONFIG.done.color;
    } else {
        if (items.some(i => i.risk === 'danger')) return RISK_CONFIG.danger.color;
        if (items.some(i => i.risk === 'major')) return RISK_CONFIG.major.color;
        if (items.some(i => i.risk === 'warning')) return RISK_CONFIG.warning.color;
        return RISK_CONFIG.safe.color;
    }
}
function buildClusterPopup(name, items, level) {
    const mode = getLayerConfig();
    const counts = {};
    items.forEach(item => { const key = mode.colorBy === 'risk' ? item.risk : (mode.colorBy === 'governance' ? item.governance : item.elimination); counts[key] = (counts[key] || 0) + 1; });
    let rows = '';
    Object.keys(mode.statusMap).forEach(key => { const cfg = mode.statusMap[key]; rows += '<div class="popup-section kv"><span>' + cfg.label + '</span><b style="color:' + cfg.color + '">' + (counts[key] || 0) + '</b></div>'; });
    const nextLabel = level === 'street' ? '下钻到街道' : '下钻到社区';
    return '<div style="min-width:180px;"><b>' + name + '</b>（共 ' + items.length + ' 栋）<br/><br/>' + rows + '<br/><button class="archive-btn" onclick="drillFromPopup(\'' + level + '\',\'' + name + '\')">' + nextLabel + '</button></div>';
}
function drillFromPopup(level, name) { if (level === 'street') drillToStreet(name); else drillToCommunity(name); }

function buildHousePopup(item, idx) {
    const info = item.eliminationInfo || {};
    const riskCfg = getRiskConfig(item.risk);
    const statusCfg = getStatusConfig(item.governance);
    const measureHtml = item.measures && item.measures.length ? '<ul>' + item.measures.map(m => '<li>' + (m.type === 'management' ? '管理' : '工程') + '措施：' + m.name + '（' + (m.status === 'done' ? '已完成' : m.status === 'doing' ? '进行中' : '待开展') + '）</li>').join('') + '</ul>' : '<p style="color:var(--text-secondary);font-size:12px;">暂无整治措施</p>';
    const hazardsHtml = item.hazards && item.hazards.length ? '<ul>' + item.hazards.map(h => '<li>' + h.part + '：' + h.type + '（' + h.level + '）</li>').join('') + '</ul>' : '<p style="color:var(--text-secondary);font-size:12px;">暂无隐患</p>';
    return '<div style="min-width:260px;max-width:320px;">' +
        '<div class="popup-section">' +
        '<span class="popup-status-tag" style="color:' + riskCfg.color + ';background:' + hexToRgba(riskCfg.color, 0.12) + '">' + getShapeHtml(riskCfg.shape, riskCfg.color, 10) + ' 隐患等级：' + riskCfg.label + '</span>' +
        '<span class="popup-status-tag" style="color:' + statusCfg.color + ';background:' + hexToRgba(statusCfg.color, 0.12) + '">整治状态：' + statusCfg.label + '</span>' +
        '</div>' +
        '<div class="popup-section"><div class="popup-section-title"><i class="fas fa-home"></i> 基本信息</div>' +
        '<div class="kv"><span>房屋名称</span><b>' + item.name + '</b></div>' +
        '<div class="kv"><span>房屋编号</span><b>' + item.no + '</b></div>' +
        '<div class="kv"><span>地址</span><b>' + item.address + '</b></div>' +
        '<div class="kv"><span>产权人</span><b>' + (item.owner || '-') + '</b></div>' +
        '</div>' +
        '<div class="popup-section"><div class="popup-section-title"><i class="fas fa-exclamation-triangle"></i> 隐患信息</div>' + hazardsHtml + '</div>' +
        '<div class="popup-section"><div class="popup-section-title"><i class="fas fa-tools"></i> 整治措施</div>' + measureHtml + '</div>' +
        '<div class="popup-section"><div class="popup-section-title"><i class="fas fa-tasks"></i> 整治进度</div>' +
        '<div class="kv"><span>完成率</span><b>' + item.progress + '%</b></div>' +
        '<div class="progress-bar"><div class="fill" style="width:' + item.progress + '%"></div></div>' +
        '</div>' +
        '<div class="popup-section"><div class="popup-section-title"><i class="fas fa-sitemap"></i> 责任单位/责任人</div>' +
        '<div class="kv"><span>责任单位</span><b>' + (item.responsibleDept || '-') + '</b></div>' +
        '<div class="kv"><span>责任人</span><b>' + (item.responsiblePerson || '-') + '</b></div>' +
        '</div>' +
        '<div class="popup-section"><div class="popup-section-title"><i class="fas fa-check-double"></i> 销号信息</div>' +
        '<div class="kv"><span>申请时间</span><b>' + (info.applyTime || '未申请') + '</b></div>' +
        '<div class="kv"><span>审核时间</span><b>' + (info.reviewTime || '待审核') + '</b></div>' +
        '<div class="kv"><span>审核人</span><b>' + (info.reviewer || '-') + '</b></div>' +
        '<div class="kv"><span>证明文件</span><b>' + (info.certFiles && info.certFiles.length ? info.certFiles.map(f => '<span class="file-tag"><i class="fas fa-file-alt"></i> ' + f + '</span>').join(' ') : '暂无') + '</b></div>' +
        '<div class="kv"><span>备注</span><b>' + (info.note || '-') + '</b></div>' +
        '</div>' +
        '<button class="archive-btn" onclick="openArchive(' + idx + ')"><i class="fas fa-folder-open"></i> 房屋档案</button>' +
        '</div>';
}
function drillToStreet(street) { currentLevel = 'street'; currentStreet = street; currentCommunity = null; updateBreadcrumb(); renderMap(); renderList(); }
function drillToCommunity(community) { currentLevel = 'community'; currentCommunity = community; updateBreadcrumb(); renderMap(); renderList(); }
function drillToBuilding() { currentLevel = 'building'; updateBreadcrumb(); renderMap(); renderList(); }
function drillUp(level) {
    if (level === 'district') { currentLevel = 'district'; currentStreet = null; currentCommunity = null; }
    else if (level === 'street') { currentLevel = 'street'; currentCommunity = null; }
    else if (level === 'community') { currentLevel = 'community'; }
    updateBreadcrumb(); renderMap(); renderList();
}
function updateBreadcrumb() {
    const container = document.getElementById('breadcrumb');
    let html = '<div class="crumb' + (currentLevel === 'district' ? ' active' : '') + '" data-level="district"><i class="fas fa-map"></i> 奉贤区</div>';
    if (currentStreet) { html += '<i class="fas fa-chevron-right" style="font-size:10px;color:var(--text-secondary);"></i><div class="crumb' + (currentLevel === 'street' ? ' active' : '') + '" data-level="street">' + currentStreet + '</div>'; }
    if (currentCommunity) { html += '<i class="fas fa-chevron-right" style="font-size:10px;color:var(--text-secondary);"></i><div class="crumb' + (currentLevel === 'community' || currentLevel === 'building' ? ' active' : '') + '" data-level="community">' + currentCommunity + '</div>'; }
    container.innerHTML = html;
    container.querySelectorAll('.crumb').forEach(c => c.addEventListener('click', () => { const level = c.dataset.level; if (level === 'district') drillUp('district'); else if (level === 'street') drillUp('street'); else if (level === 'community') drillUp('community'); }));
}
function renderLegend() {
    const mode = getLayerConfig();
    const titleEl = document.getElementById('legendTitle');
    const container = document.getElementById('legendContent');
    if (titleEl) titleEl.innerHTML = '<i class="fas fa-layer-group"></i> <span>' + mode.name + '</span>';
    if (!container) return;
    let html = '';
    if (currentLayer === 'eliminationHeatmap') {
        html = '<div class="legend-row"><span class="legend-color" style="background:#1e8e3e"></span> 审核通过已销号</div>' +
            '<div class="legend-row"><span class="legend-color" style="background:#1a73e8"></span> 已申请待审核</div>' +
            '<div class="legend-row"><span class="legend-shape">●</span> 半径越大表示销号/申请越密集</div>';
    } else {
        html += '<div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">颜色：状态</div>';
        Object.keys(mode.statusMap).forEach(key => { const cfg = mode.statusMap[key]; html += '<div class="legend-item"><span class="legend-dot" style="background:' + cfg.color + ';"></span><span>' + cfg.label + '</span></div>'; });
        html += '<div style="font-size:11px;color:var(--text-secondary);margin:8px 0 6px;">形状：隐患等级</div>';
        Object.keys(RISK_CONFIG).forEach(key => { const cfg = RISK_CONFIG[key]; html += '<div class="legend-item"><span class="legend-symbol" style="color:' + cfg.color + '">' + getShapeHtml(cfg.shape, cfg.color, 12) + '</span><span>' + cfg.label + '</span></div>'; });
    }
    container.innerHTML = html;
}
function renderStats() {
    const mode = getLayerConfig();
    const container = document.getElementById('statsBody');
    if (!container) return;
    const data = getVisibleData();
    const counts = {};
    data.forEach(item => { const v = mode.colorBy === 'risk' ? item.risk : (mode.colorBy === 'governance' ? item.governance : item.elimination); counts[v] = (counts[v] || 0) + 1; });
    const timeLabel = activeTimeFilter !== 'all' ? ' · ' + TIME_FILTER_CONFIG[activeTimeFilter].label : '';
    let html = '<div class="stats-row"><div class="stats-label">房屋总数' + timeLabel + '</div><div class="stats-value">' + data.length + '</div></div>';
    Object.keys(mode.statusMap).forEach(key => { const cfg = mode.statusMap[key]; html += '<div class="stats-row"><div class="stats-label" style="color:' + cfg.color + '">' + cfg.label + '</div><div class="stats-value" style="color:' + cfg.color + '">' + (counts[key] || 0) + '</div></div>'; });
    container.innerHTML = html;
}
function renderDashboard() {
    const data = getVisibleData();
    const done = data.filter(i => i.governance === 'done').length;
    const total = data.length || 1;
    document.getElementById('completionRate').textContent = Math.round(done / total * 100) + '%';
    document.getElementById('overdueCount').textContent = data.filter(i => i.governance === 'overdue').length;
    renderStreetRankingChart();
    renderMeasurePieChart();
}
function renderStreetRankingChart() {
    const streetMap = {};
    baseData.forEach(item => { if (!streetMap[item.street]) streetMap[item.street] = { total: 0, done: 0 }; streetMap[item.street].total++; if (item.governance === 'done') streetMap[item.street].done++; });
    const arr = Object.keys(streetMap).map(k => ({ name: k, rate: Math.round(streetMap[k].done / streetMap[k].total * 100) })).sort((a, b) => b.rate - a.rate);
    if (!streetRankingChart) streetRankingChart = echarts.init(document.getElementById('streetRankingChart'));
    streetRankingChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '15%', bottom: '3%', top: '5%', containLabel: true },
        xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%', fontSize: 10 } },
        yAxis: { type: 'category', data: arr.map(a => a.name), axisLabel: { fontSize: 10 }, inverse: true },
        series: [{ type: 'bar', data: arr.map(a => a.rate), itemStyle: { color: '#1a73e8', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10 } }]
    });
    streetRankingChart.off('click');
    streetRankingChart.on('click', params => drillToStreet(params.name));
}
function renderMeasurePieChart() {
    const data = getVisibleData();
    let mCount = 0, eCount = 0;
    data.forEach(item => { if (item.measures) item.measures.forEach(m => { if (m.type === 'management') mCount++; else if (m.type === 'engineering') eCount++; }); });
    if (!measurePieChart) measurePieChart = echarts.init(document.getElementById('measurePieChart'));
    measurePieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } },
        series: [{ type: 'pie', radius: ['40%', '65%'], center: ['50%', '45%'], data: [{ value: mCount, name: '管理措施', itemStyle: { color: '#1a73e8' } }, { value: eCount, name: '工程措施', itemStyle: { color: '#1e8e3e' } }], label: { fontSize: 10 } }]
    });
    measurePieChart.off('click');
    measurePieChart.on('click', params => switchLayer(params.name === '管理措施' ? 'management' : 'engineering'));
}

function renderLeftChart() {
    const tab = document.querySelector('.chart-tab.active')?.dataset.chart || 'status';
    if (!leftChart) leftChart = echarts.init(document.getElementById('leftChart'));
    if (tab === 'status') renderLeftStatusChart();
    else if (tab === 'street') renderLeftStreetChart();
    else if (tab === 'measure') renderLeftMeasureChart();
    else if (tab === 'trend') renderLeftTrendChart();
}
function renderLeftStatusChart() {
    const data = getVisibleData();
    const counts = { pending: 0, doing: 0, done: 0, overdue: 0 };
    data.forEach(i => { counts[i.governance] = (counts[i.governance] || 0) + 1; });
    leftChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '10%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: { type: 'category', data: ['待整治', '整治中', '已整治', '逾期'], axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
        series: [{ type: 'bar', data: [{ value: counts.pending, itemStyle: { color: STATUS_CONFIG.pending.color } }, { value: counts.doing, itemStyle: { color: STATUS_CONFIG.doing.color } }, { value: counts.done, itemStyle: { color: STATUS_CONFIG.done.color } }, { value: counts.overdue, itemStyle: { color: STATUS_CONFIG.overdue.color } }], label: { show: true, position: 'top', fontSize: 10 } }]
    }, true);
    leftChart.off('click');
    leftChart.on('click', params => {
        const map = { '待整治': 'pending', '整治中': 'doing', '已整治': 'done', '逾期': 'overdue' };
        activeFilter = map[params.name] || 'all'; updateFilterTags(); applyFilter();
    });
}
function renderLeftStreetChart() {
    const counts = {};
    baseData.forEach(i => { counts[i.street] = (counts[i.street] || 0) + 1; });
    const arr = Object.keys(counts).map(k => ({ name: k, value: counts[k] })).sort((a, b) => b.value - a.value);
    leftChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '10%', bottom: '3%', top: '5%', containLabel: true },
        xAxis: { type: 'value', axisLabel: { fontSize: 10 } },
        yAxis: { type: 'category', data: arr.map(a => a.name), axisLabel: { fontSize: 10 }, inverse: true },
        series: [{ type: 'bar', data: arr.map(a => a.value), itemStyle: { color: '#1a73e8', borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', fontSize: 10 } }]
    }, true);
    leftChart.off('click');
    leftChart.on('click', params => drillToStreet(params.name));
}
function renderLeftMeasureChart() {
    const data = getVisibleData();
    let mCount = 0, eCount = 0;
    data.forEach(item => { if (item.measures) item.measures.forEach(m => { if (m.status === 'done') { if (m.type === 'management') mCount++; else eCount++; } }); });
    leftChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } },
        series: [{ type: 'pie', radius: ['35%', '60%'], center: ['50%', '45%'], data: [{ value: mCount, name: '管理措施', itemStyle: { color: '#1a73e8' } }, { value: eCount, name: '工程措施', itemStyle: { color: '#1e8e3e' } }], label: { fontSize: 10 } }]
    }, true);
    leftChart.off('click');
    leftChart.on('click', params => switchLayer(params.name === '管理措施' ? 'management' : 'engineering'));
}
function renderLeftTrendChart() {
    const data = getVisibleData().filter(i => i.elimination === 'done' && i.eliminationInfo && i.eliminationInfo.reviewTime);
    const dateMap = {};
    data.forEach(i => { const d = i.eliminationInfo.reviewTime; dateMap[d] = (dateMap[d] || 0) + 1; });
    const dates = Object.keys(dateMap).sort();
    const values = dates.map(d => dateMap[d]);
    leftChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 10, right: 10, top: 25, bottom: 20, containLabel: true },
        xAxis: { type: 'category', data: dates, axisLabel: { fontSize: 10, rotate: 30 } },
        yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 10 } },
        series: [{ type: 'line', data: values, smooth: true, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(30,142,62,0.5)' }, { offset: 1, color: 'rgba(30,142,62,0.05)' }] } }, itemStyle: { color: '#1e8e3e' } }]
    }, true);
}
function renderTimeFilterTags() {
    const container = document.getElementById('timeFilterTags');
    if (!container) return;
    container.innerHTML = Object.keys(TIME_FILTER_CONFIG).map(k => '<div class="filter-tag time-filter-tag' + (activeTimeFilter === k ? ' active' : '') + '" data-time-filter="' + k + '" title="' + (TIME_FILTER_CONFIG[k].desc || '') + '"><i class="fas ' + TIME_FILTER_CONFIG[k].icon + '"></i> ' + TIME_FILTER_CONFIG[k].label + '</div>').join('');
    container.querySelectorAll('.time-filter-tag').forEach(tag => tag.addEventListener('click', () => { activeTimeFilter = tag.dataset.timeFilter; renderTimeFilterTags(); applyFilter(); }));
}
function switchTimeFilter(filter) {
    activeTimeFilter = filter;
    renderTimeFilterTags();
    applyFilter();
}
function updateFilterTags() {
    const mode = getLayerConfig();
    const container = document.getElementById('filterTags');
    container.innerHTML = mode.filters.map(f => '<div class="filter-tag' + (activeFilter === f.key ? ' active' : '') + '" data-filter="' + f.key + '"><i class="fas ' + f.icon + '"></i> ' + f.label + '</div>').join('');
    container.querySelectorAll('.filter-tag').forEach(tag => tag.addEventListener('click', () => { activeFilter = tag.dataset.filter; updateFilterTags(); applyFilter(); }));
    renderTimeFilterTags();
}
function switchLayer(layer) {
    if (!LAYER_MODES[layer]) return;
    currentLayer = layer; activeFilter = 'all'; activeTimeFilter = 'all';
    document.querySelectorAll('.layer-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.layer === layer));
    const timeArea = document.getElementById('timeFilterArea');
    if (timeArea) timeArea.classList.toggle('visible', layer === 'elimination' || layer === 'eliminationHeatmap');
    updateFilterTags(); renderTimeFilterTags();
    renderMap(); renderList();
}
function renderList() {
    const list = document.getElementById('houseList');
    const data = getVisibleData();
    if (currentLevel !== 'building' && currentLevel !== 'community') {
        list.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:13px;padding:40px 20px;"><i class="fas fa-mouse-pointer" style="display:block;font-size:28px;margin-bottom:12px;color:var(--primary);"></i>请从地图聚合点下钻，或点击左侧街道排名，查看具体建筑列表。</div>';
        document.getElementById('listFooter').textContent = '当前聚合 ' + data.length + ' 栋';
        return;
    }
    list.innerHTML = data.map((item, idx) => {
        const color = getHouseColor(item);
        const shape = getHouseShape(item);
        const statusCfg = getStatusConfig(item.governance);
        return '<div class="house-card ' + (idx === activeIndex ? 'active' : '') + '" data-index="' + idx + '" data-no="' + item.no + '">' +
            '<div class="house-card-header"><div class="house-name" style="color:' + color + '">' + getShapeHtml(shape, color, 12) + ' ' + item.name + '</div><div class="house-code">' + item.no + '</div></div>' +
            '<div class="house-address"><i class="fas fa-map-marker-alt"></i> ' + item.address + '</div>' +
            '<div class="house-address"><i class="fas fa-user"></i> ' + (item.owner || '-') + ' · ' + (item.responsiblePerson || '-') + '</div>' +
            '<div class="house-tags">' +
            '<span class="risk-tag ' + statusCfg.class + '">' + statusCfg.label + '</span>' +
            '<span class="risk-tag ' + getRiskConfig(item.risk).class + '">' + getRiskConfig(item.risk).label + '</span>' +
            '<span class="year-tag" onclick="event.stopPropagation();openArchive(' + idx + ')"><i class="fas fa-folder-open"></i> 档案</span>' +
            '</div></div>';
    }).join('');
    document.getElementById('listFooter').textContent = '共 ' + data.length + ' 条';
    list.querySelectorAll('.house-card').forEach(card => card.addEventListener('click', () => selectHouse(parseInt(card.dataset.index))));
}
function selectHouse(idx) {
    activeIndex = idx; renderList();
    const data = getVisibleData();
    const item = data[idx];
    if (!item) return;
    if (currentLevel !== 'building') { currentLevel = 'building'; updateBreadcrumb(); }
    map.setView([item.lat, item.lng], 17, { animate: true });
    renderMap();
    setTimeout(() => markers.forEach(m => { const ll = m.getLatLng(); if (Math.abs(ll.lat - item.lat) < 0.0001 && Math.abs(ll.lng - item.lng) < 0.0001) m.openPopup(); }), 300);
}
function applyFilter() {
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    filteredData = baseData.filter(item => {
        const matchKeyword = !keyword || item.name.toLowerCase().includes(keyword) || item.address.toLowerCase().includes(keyword) || item.no.toLowerCase().includes(keyword) || (item.owner && item.owner.toLowerCase().includes(keyword)) || (item.community && item.community.toLowerCase().includes(keyword)) || (item.street && item.street.toLowerCase().includes(keyword));
        let matchFilter = true;
        const mode = getLayerConfig();
        if (activeFilter !== 'all') {
            if (mode.colorBy === 'risk') matchFilter = item.risk === activeFilter;
            else if (mode.colorBy === 'governance') matchFilter = item.governance === activeFilter;
            else if (mode.colorBy === 'elimination') matchFilter = item.elimination === activeFilter;
        }
        if (mode.measureType && item.measures) { if (!item.measures.some(m => m.type === mode.measureType)) matchFilter = false; }
        return matchKeyword && matchFilter && matchTimeFilter(item, activeTimeFilter);
    });
    activeIndex = -1;
    renderMap(); renderList();
}
function openArchive(idx) {
    const data = getVisibleData();
    const item = data[idx];
    if (!item) return;
    const modal = document.getElementById('archiveModal');
    modal.dataset.index = idx;
    document.getElementById('archTitle').textContent = item.name;
    document.getElementById('archNo').textContent = item.no;
    switchTab('basic');
    modal.classList.add('active');
}
function closeArchive() { document.getElementById('archiveModal').classList.remove('active'); }

function switchTab(tab) {
    const modal = document.getElementById('archiveModal');
    const idx = parseInt(modal.dataset.index || '0');
    const item = getVisibleData()[idx] || baseData[idx];
    if (!item) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    const body = document.getElementById('archiveBody');
    if (tab === 'basic') {
        body.innerHTML = '<div class="arch-section"><div class="arch-section-title"><i class="fas fa-home"></i> 基本信息</div><div class="arch-row"><div class="arch-label">房屋名称</div><div class="arch-value">' + item.name + '</div></div><div class="arch-row"><div class="arch-label">房屋编号</div><div class="arch-value">' + item.no + '</div></div><div class="arch-row"><div class="arch-label">所属街道</div><div class="arch-value">' + (item.street || '-') + '</div></div><div class="arch-row"><div class="arch-label">所属社区</div><div class="arch-value">' + (item.community || '-') + '</div></div><div class="arch-row"><div class="arch-label">详细地址</div><div class="arch-value">' + item.address + '</div></div><div class="arch-row"><div class="arch-label">产权人</div><div class="arch-value">' + (item.owner || '-') + '</div></div></div>';
    } else if (tab === 'hazard') {
        body.innerHTML = '<div class="arch-section"><div class="arch-section-title"><i class="fas fa-exclamation-triangle"></i> 隐患信息</div>' + (item.hazards && item.hazards.length ? item.hazards.map(h => '<div class="arch-row"><div class="arch-label">隐患部位</div><div class="arch-value">' + h.part + '</div></div><div class="arch-row"><div class="arch-label">隐患类型</div><div class="arch-value">' + h.type + '</div></div><div class="arch-row"><div class="arch-label">危险等级</div><div class="arch-value"><span class="risk-tag ' + getRiskConfig(h.level).class + '">' + getRiskConfig(h.level).label + '</span></div></div><hr style="border:0;border-top:1px solid #eee;margin:8px 0;">').join('') : '<div class="arch-row"><div class="arch-value">暂无隐患记录</div></div>') + '</div>';
    } else if (tab === 'measure') {
        body.innerHTML = '<div class="arch-section"><div class="arch-section-title"><i class="fas fa-tools"></i> 整治措施</div>' + (item.measures && item.measures.length ? item.measures.map(m => '<div class="arch-row"><div class="arch-label">' + (m.type === 'management' ? '管理' : '工程') + '措施</div><div class="arch-value">' + m.name + '</div></div><div class="arch-row"><div class="arch-label">当前状态</div><div class="arch-value"><span class="risk-tag ' + (m.status === 'done' ? 'safe' : m.status === 'doing' ? 'doing' : 'pending') + '">' + (m.status === 'done' ? '已完成' : m.status === 'doing' ? '进行中' : '待开展') + '</span></div></div><hr style="border:0;border-top:1px solid #eee;margin:8px 0;">').join('') : '<div class="arch-row"><div class="arch-value">暂无整治措施</div></div>') + '</div>';
    } else if (tab === 'progress') {
        body.innerHTML = '<div class="arch-section"><div class="arch-section-title"><i class="fas fa-tasks"></i> 整治进度</div><div class="arch-row"><div class="arch-label">完成率</div><div class="arch-value"><b>' + item.progress + '%</b></div></div><div class="progress-bar" style="margin:8px 0;"><div class="fill" style="width:' + item.progress + '%"></div></div><div class="arch-row"><div class="arch-label">整治状态</div><div class="arch-value"><span class="risk-tag ' + getStatusConfig(item.governance).class + '">' + getStatusConfig(item.governance).label + '</span></div></div><div class="arch-row"><div class="arch-label">销号状态</div><div class="arch-value"><span class="risk-tag ' + (item.elimination === 'done' ? 'safe' : 'pending') + '">' + (item.elimination === 'done' ? '已销号' : '未销号') + '</span></div></div></div>';
    } else if (tab === 'responsible') {
        body.innerHTML = '<div class="arch-section"><div class="arch-section-title"><i class="fas fa-sitemap"></i> 责任单位/责任人</div><div class="arch-row"><div class="arch-label">责任单位</div><div class="arch-value">' + (item.responsibleDept || '-') + '</div></div><div class="arch-row"><div class="arch-label">责任人</div><div class="arch-value">' + (item.responsiblePerson || '-') + '</div></div><div class="arch-row"><div class="arch-label">联系电话</div><div class="arch-value">021-5710' + (1000 + Math.floor(Math.random() * 8999)) + '</div></div></div>';
    } else if (tab === 'elimination') {
        const info = item.eliminationInfo || {};
        const cfg = ELIMINATION_CONFIG[item.elimination] || ELIMINATION_CONFIG.pending;
        body.innerHTML = '<div class="arch-section"><div class="arch-section-title"><i class="fas fa-check-double"></i> 销号信息</div><div class="arch-row"><div class="arch-label">销号状态</div><div class="arch-value"><span class="risk-tag ' + cfg.class + '">' + cfg.label + '</span></div></div><div class="arch-row"><div class="arch-label">申请时间</div><div class="arch-value">' + (info.applyTime || '未申请') + '</div></div><div class="arch-row"><div class="arch-label">审核时间</div><div class="arch-value">' + (info.reviewTime || '待审核') + '</div></div><div class="arch-row"><div class="arch-label">审核人</div><div class="arch-value">' + (info.reviewer || '-') + '</div></div><div class="arch-row"><div class="arch-label">备注</div><div class="arch-value">' + (info.note || '-') + '</div></div><div class="arch-row"><div class="arch-label">证明文件</div><div class="arch-value">' + (info.certFiles && info.certFiles.length ? info.certFiles.map(f => '<span class="file-tag"><i class="fas fa-file-alt"></i> ' + f + '</span>').join(' ') : '暂无') + '</div></div></div>';
    }
}
function togglePanel(id, collapsedClass, toggleIconSelector, openIcon, closeIcon) {
    const el = document.getElementById(id);
    const icon = document.querySelector(toggleIconSelector);
    if (!el) return;
    el.classList.toggle(collapsedClass);
    const isCollapsed = el.classList.contains(collapsedClass);
    if (icon) icon.className = 'fas ' + (isCollapsed ? openIcon : closeIcon);
    setTimeout(() => { if (leftChart) leftChart.resize(); if (streetRankingChart) streetRankingChart.resize(); if (measurePieChart) measurePieChart.resize(); }, 260);
}
function bindPanelToggles() {
    const legendClose = document.getElementById('legendClose');
    const legendFloat = document.getElementById('legendFloat');
    if (legendClose) {
        legendClose.addEventListener('click', () => {
            document.getElementById('mapLegend').classList.add('minimized');
            legendFloat.classList.add('show');
        });
    }
    if (legendFloat) {
        legendFloat.addEventListener('click', () => {
            document.getElementById('mapLegend').classList.remove('minimized');
            legendFloat.classList.remove('show');
        });
    }
    const dashClose = document.getElementById('dashClose');
    const dashFloat = document.getElementById('dashFloat');
    if (dashClose) {
        dashClose.addEventListener('click', () => {
            document.getElementById('dashboard').classList.add('minimized');
            dashFloat.classList.add('show');
        });
    }
    if (dashFloat) {
        dashFloat.addEventListener('click', () => {
            document.getElementById('dashboard').classList.remove('minimized');
            dashFloat.classList.remove('show');
        });
    }
    const statsClose = document.getElementById('statsClose');
    const statsFloat = document.getElementById('statsFloat');
    if (statsClose) {
        statsClose.addEventListener('click', () => {
            document.getElementById('statsContent').classList.add('minimized');
            statsFloat.classList.add('show');
        });
    }
    if (statsFloat) {
        statsFloat.addEventListener('click', () => {
            document.getElementById('statsContent').classList.remove('minimized');
            statsFloat.classList.remove('show');
        });
    }
}
function bindEvents() {
    bindPanelToggles();
    document.querySelectorAll('.layer-btn').forEach(btn => btn.addEventListener('click', () => switchLayer(btn.dataset.layer)));
    document.querySelectorAll('.chart-tab').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active')); tab.classList.add('active'); renderLeftChart(); renderList(); }));
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
    document.getElementById('searchInput').addEventListener('input', applyFilter);
    const timeFilterContainer = document.getElementById('timeFilterTags');
    if (timeFilterContainer) {
        timeFilterContainer.addEventListener('click', e => { const tag = e.target.closest('.time-filter-tag'); if (!tag) return; activeTimeFilter = tag.dataset.timeFilter; renderTimeFilterTags(); applyFilter(); });
    }
    document.getElementById('archClose').addEventListener('click', closeArchive);
    document.getElementById('archCloseBtn').addEventListener('click', closeArchive);
    document.getElementById('resetZoom').addEventListener('click', () => { currentLevel = 'district'; currentStreet = null; currentCommunity = null; updateBreadcrumb(); map.setView([30.92, 121.47], 12); renderMap(); renderList(); });
    window.addEventListener('resize', () => { if (leftChart) leftChart.resize(); if (streetRankingChart) streetRankingChart.resize(); if (measurePieChart) measurePieChart.resize(); });
}
function init() {
    initMap();
    updateBreadcrumb();
    updateFilterTags();
    renderTimeFilterTags();
    renderLeftChart();
    renderDashboard();
    bindEvents();
    renderList();
}

init();
