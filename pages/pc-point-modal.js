// 通用弹窗函数与检查项渲染（用于 pages/gas-risk-task-*.html）

// 房屋来源徽标（无 source 字段的页面不显示）
const POINT_SOURCE_BADGES = { assigned: '指派', archive: '档案', manual: '新增' };

// 当前打开的房屋（现场照片上传/删除时回写其检查项）
let currentPoint = null;

// 打开巡查点详情弹窗
function openPointModal(point) {
    let overlay = document.getElementById('pointModalOverlay');
    if (!overlay) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="pc-modal-overlay" id="pointModalOverlay" onclick="closePointModal(event)">
                <div class="pc-modal" onclick="event.stopPropagation()">
                    <div class="pc-modal-header">
                        <div class="pc-modal-title"><i class="fa-solid fa-map-location-dot"></i> 巡查房屋详情</div>
                        <button class="pc-modal-close" onclick="closePointModal(event)"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="pc-modal-body" id="pointModalBody"></div>
                    <div class="pc-modal-footer">
                        <button class="btn btn-secondary" onclick="closePointModal(event)">关闭</button>
                    </div>
                </div>
            </div>
        `);
        overlay = document.getElementById('pointModalOverlay');
    }

    const srcLabel = POINT_SOURCE_BADGES[point.source];
    overlay.querySelector('.pc-modal-title').innerHTML =
        '<i class="fa-solid fa-map-location-dot"></i> 巡查房屋详情' +
        (srcLabel ? ` <span class="pc-source-badge ${point.source}">${srcLabel}</span>` : '');
    document.getElementById('pointModalBody').innerHTML = buildPointModalContent(point);
    currentPoint = point;
    overlay.classList.add('active');
    initPointLocationMap(point, 'view');
}

// 关闭巡查点详情弹窗
function closePointModal(event) {
    if (event) event.stopPropagation();
    const overlay = document.getElementById('pointModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

// 房屋信息网格（查看弹窗与填报弹窗共用）
function buildPointHouseInfoGrid(point) {
    const statusHtml = renderStatusLabel(point.status, point.statusLabel);
    const items = [
        ['唯一标识', point.houseNo || ('FX-NC-ZF-' + String(point.id).padStart(4, '0'))],
        ['房屋名称', point.name || '-'],
        ['房屋类型', point.typeLabel || point.type || '-'],
        ['所属镇/街道', point.town || '-'],
        ['村/居委', point.village || '-'],
        ['详细地址', point.address || '-'],
        ['结构类型', point.structure || '-'],
        ['产权人/使用人', point.owner || '-'],
        ['层数', point.floors || '-'],
        ['身份证号', point.idCard || '-'],
        ['建筑面积（㎡）', point.area || '-'],
        ['联系电话', point.phone || '-'],
        ['建筑年代', point.year || '-'],
        ['使用性质', point.useNature || '-'],
        ['房屋状态', point.houseStatus || '-'],
        ['经营类型', point.bizType || '-'],
        ['巡查状态', statusHtml],
        ['巡查时间', point.time || '-']
    ];
    return '<div class="point-info-grid">' + items.map(function (pair) {
        return '<div class="point-info-item"><span class="point-info-label">' + pair[0] + '</span><span class="point-info-value">' + pair[1] + '</span></div>';
    }).join('') + '</div>';
}
// ===== 位置信息（GPS定位 / 地图选点）=====
// H5端：现场打卡自动采集位置并随填报数据上传；PC端：填报弹窗内地图选点
const POINT_LOC_SOURCE_LABELS = { h5: 'H5现场打卡', pc: 'PC地图选点' };
let pointLocMapInst = null;
let pointLocMarker = null;

function pointLocSourceLabel(point) {
    return POINT_LOC_SOURCE_LABELS[point.locationSource] || '未采集';
}

function buildLocationSection(point, mode) {
    const p = mode === 'fill' ? 'fill' : 'view';
    const hasLoc = point.lng != null && point.lat != null;
    const hint = mode === 'fill'
        ? '<div class="point-loc-hint"><i class="fas fa-circle-info"></i> H5端填报通过现场打卡自动采集位置；PC端请在下方地图点击选点</div>'
        : '';
    return `
        <div class="point-detail-section">
            <div class="point-detail-section-title">位置信息（GPS定位 / 地图选点）</div>
            <div class="point-info-grid">
                <div class="point-info-item"><span class="point-info-label">定位方式</span><span class="point-info-value" id="pointLocSource-${p}">${pointLocSourceLabel(point)}</span></div>
                <div class="point-info-item"><span class="point-info-label">经度</span><span class="point-info-value" id="pointLocLng-${p}">${hasLoc ? point.lng : '-'}</span></div>
                <div class="point-info-item"><span class="point-info-label">纬度</span><span class="point-info-value" id="pointLocLat-${p}">${hasLoc ? point.lat : '-'}</span></div>
                <div class="point-info-item"><span class="point-info-label">定位时间</span><span class="point-info-value" id="pointLocTime-${p}">${point.locationTime || '-'}</span></div>
            </div>
            ${hint}
            <div class="point-loc-map" id="pointLocMap-${p}"></div>
        </div>
    `;
}

// 与 house-arch-detail-rural.html 一致的 Leaflet 懒加载
function loadPointLeaflet(callback) {
    if (window.L) { callback(); return; }
    if (!document.getElementById('pointLeafletCss')) {
        const link = document.createElement('link');
        link.id = 'pointLeafletCss';
        link.rel = 'stylesheet';
        link.href = './leaflet.css';
        document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = './leaflet.js';
    script.onload = callback;
    document.head.appendChild(script);
}

function initPointLocationMap(point, mode) {
    const p = mode === 'fill' ? 'fill' : 'view';
    loadPointLeaflet(() => {
        const el = document.getElementById('pointLocMap-' + p);
        if (!el) return;
        if (pointLocMapInst) { pointLocMapInst.remove(); pointLocMapInst = null; pointLocMarker = null; }
        const hasLoc = point.lng != null && point.lat != null;
        const center = hasLoc ? [point.lat, point.lng] : [30.92, 121.45];
        pointLocMapInst = L.map(el.id).setView(center, hasLoc ? 16 : 13);
        // 瓦片源与巡查任务分析页一致：高德地图
        const tile = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', { attribution: '© 高德地图', maxZoom: 19, subdomains: '1234' });
        let tileOk = false;
        tile.on('tileload', () => { tileOk = true; });
        tile.on('tileerror', () => {
            // 离线环境瓦片不可用时，降级为本地奉贤区底图
            setTimeout(() => {
                if (!tileOk && pointLocMapInst && !pointLocMapInst._locFallback) {
                    pointLocMapInst._locFallback = true;
                    pointLocMapInst.removeLayer(tile);
                    L.imageOverlay('./images/fengxian-map.jpg', [[30.85, 121.39], [30.99, 121.55]], { attribution: '奉贤区底图' }).addTo(pointLocMapInst);
                }
            }, 800);
        });
        tile.addTo(pointLocMapInst);
        if (hasLoc) pointLocMarker = L.marker(center).addTo(pointLocMapInst);
        if (mode === 'fill') {
            pointLocMapInst.on('click', function (e) {
                pickPointLocation(point, e.latlng.lat, e.latlng.lng, p);
            });
        }
        setTimeout(() => { if (pointLocMapInst) pointLocMapInst.invalidateSize(); }, 120);
    });
}

// PC端地图选点：点击地图落点并回写坐标到房屋档案
function pickPointLocation(point, lat, lng, p) {
    point.lat = Number(lat.toFixed(6));
    point.lng = Number(lng.toFixed(6));
    point.locationSource = 'pc';
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    point.locationTime = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    if (pointLocMarker) pointLocMapInst.removeLayer(pointLocMarker);
    pointLocMarker = L.marker([point.lat, point.lng]).addTo(pointLocMapInst);
    document.getElementById('pointLocSource-' + p).textContent = pointLocSourceLabel(point);
    document.getElementById('pointLocLng-' + p).textContent = point.lng;
    document.getElementById('pointLocLat-' + p).textContent = point.lat;
    document.getElementById('pointLocTime-' + p).textContent = point.locationTime;
}
// 构建弹窗内容
function buildPointModalContent(point) {
    const statusHtml = renderStatusLabel(point.status, point.statusLabel);
    const riskHtml = renderRiskLabel(point.risk, point.riskLabel);

    const checkItems = point.checkItems && point.checkItems.length > 0
        ? point.checkItems.map((item, index) => buildCheckItemCard(item, index)).join('')
        : '<div class="empty-state" style="padding:30px 0;"><i class="fas fa-clipboard-list"></i><p>暂无检查项记录</p></div>';

    return `
        <div class="point-detail-section">
            <div class="point-detail-section-title">房屋信息</div>
            ${buildPointHouseInfoGrid(point)}
        </div>
        ${buildLocationSection(point, 'view')}
        <div class="point-detail-section">
            <div class="point-detail-section-title">检查项清单</div>
            <div class="check-item-list">
                ${checkItems}
            </div>
        </div>
    `;
}

function renderStatusLabel(status, label) {
    const color = status === 'inspected' ? 'var(--success)' : 'var(--text-secondary)';
    const icon = status === 'inspected' ? 'fa-check-circle' : 'fa-clock';
    return `<span style="color:${color};font-weight:600;"><i class="fas ${icon}" style="margin-right:4px;"></i>${label}</span>`;
}

function renderRiskLabel(risk, label) {
    const riskClass = risk === 'high' ? 'red' : risk === 'medium' ? 'yellow' : 'blue';
    const iconMap = { high: 'fa-triangle-exclamation', medium: 'fa-exclamation', low: 'fa-shield-halved' };
    return `<span class="risk-tag ${riskClass}"><i class="fas ${iconMap[risk] || 'fa-shield-halved'}" style="font-size:10px;"></i> ${label}</span>`;
}

function buildCheckItemCard(item, index) {
    const levelMap = {
        red: { class: 'red', label: '第三类' },
        yellow: { class: 'yellow', label: '第二类' },
        blue: { class: 'blue', label: '第一类' },
        na: { class: 'gray', label: '不适用' }
    };
    const level = levelMap[item.level] || levelMap.blue;
    const hasPhotos = Array.isArray(item.photos) && item.photos.length > 0;
    const hasDetail = item.result === 'abnormal' || item.result === 'recheck' || hasPhotos;
    const resultClass = item.result === 'normal' ? 'normal' : item.result === 'abnormal' ? 'abnormal' : item.result === 'recheck' ? 'recheck' : item.result === 'na' ? 'na' : '';
    const resultIcon = item.result === 'normal' ? 'fa-check-circle' : item.result === 'abnormal' ? 'fa-triangle-exclamation' : item.result === 'recheck' ? 'fa-clock' : item.result === 'na' ? 'fa-ban' : 'fa-circle-question';
    const resultLabel = item.resultLabel || (item.result === 'normal' ? '正常' : item.result === 'abnormal' ? '异常' : item.result === 'recheck' ? '需复查' : item.result === 'na' ? '不适用' : '-');
    // 风险类型（隐患类型）：Excel 目录填报产生的字段，旧数据无此字段不显示
    const riskTypeHtml = (item.riskType && item.riskType !== '无' && item.riskType !== '-')
        ? `<span class="check-item-type">${item.riskType}</span>` : '';
    // 防护措施：有实际内容时才展示
    const protectionHtml = (item.protection && item.protection !== '无' && item.protection !== '-')
        ? `<div class="check-item-desc-line"><strong>防护措施：</strong>${item.protection}</div>` : '';

    // 异常/需复查详情内容
    let detailHtml = '';
    if (item.result === 'abnormal') {
        detailHtml = buildAbnormalDetail(item);
    } else if (item.result === 'recheck') {
        detailHtml = buildRecheckDetail(item);
    } else if (hasPhotos) {
        detailHtml = `<div class="form-row"><label class="form-label">${window.POINT_MODAL_PHOTOS_LABEL || '现场证据（拍照）'}</label>${buildPhotoRowHtml(item)}</div>`;
    }

    return `
        <div class="check-item-card ${item.result || ''}" data-id="${item.id}">
            <div class="check-item-main" onclick="toggleCheckItem(${item.id})">
                <div class="check-item-index">${index + 1}</div>
                <div class="check-item-info">
                    <div class="check-item-header">
                        <div class="check-item-title">${item.sub} - ${item.content}</div>
                        ${riskTypeHtml}
                        <div class="check-item-risk ${level.class}">
                            <i class="fas fa-circle" style="font-size:6px;margin-right:4px;"></i>${level.label}
                        </div>
                    </div>
                    <div class="check-item-desc-line">
                        <strong>风险识别：</strong>${item.risk || '-'}
                    </div>
                    <div class="check-item-desc-line">
                        <strong>可能导致：</strong>${item.accident || '-'}
                    </div>
                    ${protectionHtml}
                </div>
                <div class="check-item-status ${resultClass}">
                    <i class="fa-solid ${resultIcon}"></i>
                    <span>${resultLabel}</span>
                    ${hasDetail ? `<i class="fa-solid fa-chevron-down check-item-arrow"></i>` : ''}
                </div>
            </div>
            ${hasDetail ? `
            <div class="check-item-detail" id="checkItemDetail-${item.id}">
                <div class="check-item-detail-inner">
                    ${detailHtml}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// 异常上报处置方式选项定义；页面可通过 window.POINT_MODAL_DISPOSAL_MODES 覆盖（如农村自建房仅"上报转办"）
const DISPOSAL_MODE_DEFS = {
    'handle-now': { icon: 'fa-bolt', label: '立即处置' },
    'report-transfer': { icon: 'fa-share-from-square', label: '上报转办' }
};

function buildAbnormalDetail(item) {
    const modes = (Array.isArray(window.POINT_MODAL_DISPOSAL_MODES) && window.POINT_MODAL_DISPOSAL_MODES.length > 0)
        ? window.POINT_MODAL_DISPOSAL_MODES
        : ['handle-now', 'report-transfer'];
    const disposal = (item.disposal && modes.indexOf(item.disposal) !== -1) ? item.disposal : modes[0];
    const optionsHtml = modes.map(m => {
        const def = DISPOSAL_MODE_DEFS[m] || { icon: 'fa-circle', label: m };
        return `
                        <div class="option-item ${disposal === m ? 'active' : ''}">
                            <i class="fa-solid ${def.icon}"></i>
                            <span>${def.label}</span>
                        </div>`;
    }).join('');
    // 可通过 window.POINT_MODAL_ABNORMAL_FIELDS 裁剪字段（如农村自建房去掉 处置方式/影响范围）
    const fields = (Array.isArray(window.POINT_MODAL_ABNORMAL_FIELDS) && window.POINT_MODAL_ABNORMAL_FIELDS.length > 0)
        ? window.POINT_MODAL_ABNORMAL_FIELDS
        : ['disposal', 'description', 'scope', 'photos'];
    const rowDefs = {
        disposal: `
                <div class="form-row">
                    <label class="form-label">处置方式</label>
                    <div class="option-group">${optionsHtml}
                    </div>
                </div>`,
        description: `
                <div class="form-row">
                    <label class="form-label">隐患描述</label>
                    <div class="fake-textarea">${item.description || '请描述隐患具体情况...'}</div>
                </div>`,
        scope: `
                <div class="form-row">
                    <label class="form-label">影响范围</label>
                    <div class="fake-input">${item.scopeDesc || '如：影响周边3户居民'}</div>
                </div>`,
        photos: `
                <div class="form-row">
                    <label class="form-label">${window.POINT_MODAL_PHOTOS_LABEL || '现场证据（拍照）'}</label>
                    ${buildPhotoRowHtml(item)}
                </div>`
    };
    const rowsHtml = fields.map(f => rowDefs[f] || '').join('');
    const sectionTitle = window.POINT_MODAL_ABNORMAL_TITLE || '异常上报';
    return `
        <div class="detail-section">
            <div class="detail-section-title">${sectionTitle}</div>
            <div class="detail-form">${rowsHtml}
            </div>
        </div>
    `;
}

// ===== 现场照片：多图批量上传（原型存内存 dataURL；正式环境应上传服务器）=====
// ===== 照片点击放大查看：所有缩略图共用，点击空白/按 Esc 关闭 =====
function openPhotoViewer(src) {
    if (!src) return;
    let overlay = document.getElementById('photoViewerOverlay');
    if (!overlay) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="photo-viewer-overlay" id="photoViewerOverlay" onclick="closePhotoViewer()">
                <img class="photo-viewer-img" id="photoViewerImg" alt="照片放大查看">
                <div class="photo-viewer-tip">点击任意位置或按 Esc 关闭</div>
            </div>`);
        overlay = document.getElementById('photoViewerOverlay');
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closePhotoViewer();
        });
    }
    document.getElementById('photoViewerImg').src = src;
    overlay.classList.add('active');
}

function closePhotoViewer() {
    const overlay = document.getElementById('photoViewerOverlay');
    if (overlay) overlay.classList.remove('active');
}

function buildPhotoRowHtml(item) {
    const photos = Array.isArray(item.photos) ? item.photos : [];
    const thumbs = photos.map((src, i) => `
            <div class="photo-thumb">
                <img src="${src}" alt="现场照片${i + 1}" title="点击放大查看" onclick="pointPhotoView(${item.id}, ${i});event.stopPropagation();">
                <button type="button" class="photo-thumb-del" title="删除" onclick="pointPhotoRemove(${item.id}, ${i});event.stopPropagation();"><i class="fa-solid fa-xmark"></i></button>
            </div>`).join('');
    return `
                    <div class="photo-upload" id="photoRow-${item.id}">${thumbs}
                        <div class="photo-box photo-box-add" title="上传照片（可多选）" onclick="pointPhotoTrigger(${item.id});event.stopPropagation();">
                            <i class="fa-solid fa-camera"></i>
                        </div>
                        <input type="file" id="photoInput-${item.id}" accept="image/*" multiple style="display:none" onchange="pointPhotoChange(${item.id}, this)">
                    </div>`;
}

function pointPhotoTrigger(itemId) {
    const input = document.getElementById('photoInput-' + itemId);
    if (input) input.click();
}

function pointPhotoChange(itemId, input) {
    if (!currentPoint || !input.files || input.files.length === 0) return;
    const item = (currentPoint.checkItems || []).find(it => it.id === itemId);
    if (!item) return;
    item.photos = Array.isArray(item.photos) ? item.photos : [];
    Array.from(input.files).forEach(file => {
        if (!file.type || file.type.indexOf('image/') !== 0) return;
        const reader = new FileReader();
        reader.onload = e => {
            item.photos.push(e.target.result);
            refreshPhotoRow(item);
        };
        reader.readAsDataURL(file);
    });
}

function pointPhotoRemove(itemId, idx) {
    if (!currentPoint) return;
    const item = (currentPoint.checkItems || []).find(it => it.id === itemId);
    if (!item || !Array.isArray(item.photos)) return;
    item.photos.splice(idx, 1);
    refreshPhotoRow(item);
}

function pointPhotoView(itemId, idx) {
    if (!currentPoint) return;
    const item = (currentPoint.checkItems || []).find(it => it.id === itemId);
    if (!item || !Array.isArray(item.photos) || !item.photos[idx]) return;
    openPhotoViewer(item.photos[idx]);
}

function refreshPhotoRow(item) {
    const row = document.getElementById('photoRow-' + item.id);
    if (row) row.outerHTML = buildPhotoRowHtml(item);
}

function buildRecheckDetail(item) {
    return `
        <div class="detail-section">
            <div class="detail-section-title">复查安排</div>
            <div class="detail-form">
                <div class="form-row">
                    <label class="form-label">复查日期</label>
                    <div class="fake-input">
                        <span>${item.recheckDate || '年 / 月 / 日'}</span>
                        <i class="fa-regular fa-calendar"></i>
                    </div>
                </div>
                <div class="form-row">
                    <label class="form-label">复查要求</label>
                    <div class="fake-textarea">${item.recheckDesc || '请填写复查的具体要求...'}</div>
                </div>
            </div>
        </div>
    `;
}

function toggleCheckItem(id) {
    const detail = document.getElementById(`checkItemDetail-${id}`);
    if (detail) {
        detail.classList.toggle('open');
        const card = document.querySelector(`.check-item-card[data-id="${id}"]`);
        if (card) card.classList.toggle('expanded');
    }
}

// 查看巡查点入口（各页面调用）
function viewScopePoint(id) {
    const data = (typeof scopeData !== 'undefined' && scopeData) ? scopeData : [];
    const point = data.find(s => s.id === id);
    if (!point) {
        alert('未找到该房屋信息');
        return;
    }
    openPointModal(point);
}

// ===== 巡查填报弹窗（PC 填报）=====
// H5 思路的 PC 化：每个风险部位一张卡，卡内按等级分级的风险描述单选——选描述即定级；
// 选第二/三类描述即为异常，自动展开隐患上报（隐患描述 + 现场照片）；
// 「不适用」为整部位排除结论。
let fillContext = null; // { point, catalog, onSave, mode, source, selections: [{choice, photos, description}] }

// 由既有检查项反推填报选择：优先用填报时记录的 choice；外部数据（如 H5 上传）按描述文本匹配目录选项
function prefillFillSelection(group, item) {
    const sel = { choice: null, photos: [], description: '' };
    if (!item) return sel;
    sel.photos = Array.isArray(item.photos) ? item.photos.slice() : [];
    sel.description = item.description || '';
    if (item.choice !== undefined && item.choice !== null) {
        sel.choice = item.choice;
        return sel;
    }
    if (item.result === 'na' || item.level === 'na') { sel.choice = 'na'; return sel; }
    const oi = group.options.findIndex(o => o.desc === item.risk && o.level === item.level);
    if (oi !== -1) { sel.choice = oi; return sel; }
    const hasNormal = group.options.some(o => o.level === 'blue');
    if (!hasNormal && item.result === 'normal') { sel.choice = 'ok'; return sel; }
    return sel;
}

function openPointFillModal(point, catalog, onSave, options) {
    if (!Array.isArray(catalog) || catalog.length === 0) {
        alert('未加载风险清单目录');
        return;
    }
    const opts = options || {};
    const editItems = Array.isArray(opts.items) ? opts.items : null;
    // 检查项分两部分：清单内（按目录 gi 对应）+ 清单外新增隐患（extraHazard 标记）
    const stdItems = editItems ? editItems.filter(it => !it.extraHazard) : null;
    const extraTypes = window.RURAL_EXTRA_HAZARD_TYPES || [];
    const extraHazards = editItems
        ? editItems.filter(it => it.extraHazard && extraTypes.indexOf(it.sub) !== -1)
            .map(it => ({ type: it.sub, level: it.level, photos: Array.isArray(it.photos) ? it.photos.slice() : [], description: it.description || '' }))
        : [];
    fillContext = {
        point: point,
        catalog: catalog,
        onSave: onSave,
        mode: opts.mode === 'edit' ? 'edit' : 'fill',
        source: opts.source || 'pc',
        selections: catalog.map((group, gi) => prefillFillSelection(group, stdItems ? stdItems[gi] : null)),
        extraHazards: extraHazards
    };

    let overlay = document.getElementById('pointFillModalOverlay');
    if (!overlay) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="pc-modal-overlay" id="pointFillModalOverlay" onclick="closePointFillModal(event)">
                <div class="pc-modal pc-modal-fill" onclick="event.stopPropagation()">
                    <div class="pc-modal-header">
                        <div class="pc-modal-title" id="pointFillModalTitle"><i class="fa-solid fa-clipboard-check"></i> 巡查填报</div>
                        <button class="pc-modal-close" onclick="closePointFillModal(event)"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="pc-modal-body" id="pointFillModalBody"></div>
                    <div class="pc-modal-footer">
                        <span class="fill-progress" id="fillProgress"></span>
                        <button class="btn btn-secondary" onclick="closePointFillModal(event)">取消</button>
                        <button class="btn btn-primary" id="pointFillSubmitBtn" onclick="submitPointFill()"><i class="fas fa-check"></i> 保存填报</button>
                    </div>
                </div>
            </div>
        `);
        overlay = document.getElementById('pointFillModalOverlay');
    }

    const isEdit = fillContext.mode === 'edit';
    document.getElementById('pointFillModalTitle').innerHTML = `<i class="fa-solid fa-clipboard-check"></i> ${isEdit ? '修改填报' : '巡查填报'}`;
    document.getElementById('pointFillSubmitBtn').innerHTML = `<i class="fas fa-check"></i> ${isEdit ? '保存修改' : '保存填报'}`;
    document.getElementById('pointFillModalBody').innerHTML = buildFillModalContent();
    updateFillProgress();
    initPointLocationMap(point, 'fill');
    overlay.classList.add('active');
}

function closePointFillModal(event) {
    if (event) event.stopPropagation();
    const overlay = document.getElementById('pointFillModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

function buildFillModalContent() {
    const point = fillContext.point;
    const cards = fillContext.catalog.map((group, gi) => buildFillPartCard(group, gi)).join('');
    const sourceTag = fillContext.mode === 'edit'
        ? `<span class="source-tag ${fillContext.source === 'h5' ? 'manual' : 'archive'}" style="margin-left:8px;">${fillContext.source === 'h5' ? 'H5端填报' : 'PC端填报'}</span>`
        : '';
    return `
        <div class="point-detail-section">
            <div class="point-detail-section-title">房屋信息</div>
            <div class="fill-house-bar">
                <div class="fill-house-name"><i class="fa-solid fa-house-chimney"></i> ${point.houseNo || point.name || '-'}${sourceTag}</div>
                <div class="fill-house-meta">${point.address || '-'}　产权人：${point.owner || '-'}</div>
                        </div>
            ${buildPointHouseInfoGrid(point)}
        </div>
        ${buildLocationSection(point, 'fill')}
        <div class="point-detail-section">
            <div class="point-detail-section-title">检查项清单（按风险部位逐项判定）</div>
            ${cards}
        </div>
        ${buildExtraHazardsSection()}
    `;
}

// ===== 清单外问题：本次排查新增隐患（选填）=====
// 勾选隐患类型 → 该类必须上传对应现场照片，并逐项做排查判断（第三类/第二类/第一类）
function buildExtraHazardsSection() {
    const types = window.RURAL_EXTRA_HAZARD_TYPES || [];
    if (!types.length) return '';
    const boxes = types.map((t, ti) => {
        const checked = fillContext.extraHazards.some(h => h.type === t);
        return `<label class="extra-type-box ${checked ? 'checked' : ''}">
                <input type="checkbox" ${checked ? 'checked' : ''} onchange="fillExtraToggle(${ti}, this.checked)">
                <span>${t}</span>
            </label>`;
    }).join('');
    const cards = fillContext.extraHazards.map(h => buildExtraHazardCard(h.type)).join('');
    return `
        <div class="point-detail-section" id="extraHazardsSection">
            <div class="point-detail-section-title extra-hazard-title"><i class="fa-solid fa-plus"></i> 本次排查新增隐患（清单外问题，选填）</div>
            <div class="extra-type-row">
                <span class="extra-type-label">隐患类型</span>
                <div class="extra-type-list">${boxes}</div>
            </div>
            <div id="extraHazardCards">${cards || '<div class="extra-hazard-empty">存在清单外隐患时，勾选对应类型后需上传现场照片并做排查判断</div>'}</div>
        </div>`;
}

function buildExtraHazardCard(type) {
    const types = window.RURAL_EXTRA_HAZARD_TYPES || [];
    const ti = types.indexOf(type);
    const h = fillContext.extraHazards.find(x => x.type === type);
    if (ti === -1 || !h) return '';
    const levels = [
        { v: 'red', label: '第三类' },
        { v: 'yellow', label: '第二类' },
        { v: 'blue', label: '第一类' }
    ];
    const radios = levels.map(l => `
                <label class="extra-level-radio ${l.v} ${h.level === l.v ? 'active' : ''}" onclick="fillExtraLevel(${ti}, '${l.v}')">
                    <span class="extra-level-dot"></span>${l.label}
                </label>`).join('');
    return `
            <div class="extra-hazard-card" id="extraHazardCard-${ti}">
                <div class="extra-hazard-head">
                    <span class="extra-hazard-name">${type}</span>
                    <span class="extra-hazard-required">存在该类情况，需上传对应现场照片</span>
                </div>
                <div class="extra-hazard-row">
                    <span class="extra-hazard-label"><i class="required-star">*</i>排查判断</span>
                    <div class="extra-level-list">${radios}</div>
                </div>
                <div class="extra-hazard-row">
                    <span class="extra-hazard-label"><i class="required-star">*</i>现场照片</span>
                    ${buildExtraPhotoRowHtml(ti)}
                </div>
            </div>`;
}

function fillExtraToggle(ti, checked) {
    const types = window.RURAL_EXTRA_HAZARD_TYPES || [];
    const type = types[ti];
    if (!type || !fillContext) return;
    const idx = fillContext.extraHazards.findIndex(h => h.type === type);
    if (checked && idx === -1) {
        fillContext.extraHazards.push({ type: type, level: null, photos: [], description: '' });
        fillContext.extraHazards.sort((a, b) => types.indexOf(a.type) - types.indexOf(b.type));
    } else if (!checked && idx !== -1) {
        fillContext.extraHazards.splice(idx, 1);
    }
    const sec = document.getElementById('extraHazardsSection');
    if (sec) sec.outerHTML = buildExtraHazardsSection();
}

function fillExtraLevel(ti, level) {
    const types = window.RURAL_EXTRA_HAZARD_TYPES || [];
    const h = fillContext && fillContext.extraHazards.find(x => x.type === types[ti]);
    if (!h) return;
    h.level = level;
    const card = document.getElementById('extraHazardCard-' + ti);
    if (card) {
        card.querySelectorAll('.extra-level-radio').forEach(el => el.classList.remove('active'));
        const target = card.querySelector('.extra-level-radio.' + level);
        if (target) target.classList.add('active');
    }
}

// ===== 清单外隐患照片：多图上传，点击放大 =====
function buildExtraPhotoRowHtml(ti) {
    const types = window.RURAL_EXTRA_HAZARD_TYPES || [];
    const h = fillContext.extraHazards.find(x => x.type === types[ti]);
    const photos = h ? h.photos : [];
    const thumbs = photos.map((src, i) => `
            <div class="photo-thumb">
                <img src="${src}" alt="现场照片${i + 1}" title="点击放大查看" onclick="fillExtraPhotoView(${ti}, ${i});event.stopPropagation();">
                <button type="button" class="photo-thumb-del" title="删除" onclick="fillExtraPhotoRemove(${ti}, ${i});event.stopPropagation();"><i class="fa-solid fa-xmark"></i></button>
            </div>`).join('');
    return `
                    <div class="photo-upload" id="extraPhotoRow-${ti}">${thumbs}
                        <div class="photo-box photo-box-add" title="上传照片（可多选）" onclick="fillExtraPhotoTrigger(${ti});event.stopPropagation();">
                            <i class="fa-solid fa-camera"></i>
                        </div>
                        <input type="file" id="extraPhotoInput-${ti}" accept="image/*" multiple style="display:none" onchange="fillExtraPhotoChange(${ti}, this)">
                    </div>`;
}

function fillExtraPhotoTrigger(ti) {
    const input = document.getElementById('extraPhotoInput-' + ti);
    if (input) input.click();
}

function fillExtraPhotoChange(ti, input) {
    const types = window.RURAL_EXTRA_HAZARD_TYPES || [];
    const h = fillContext && fillContext.extraHazards.find(x => x.type === types[ti]);
    if (!h || !input.files || input.files.length === 0) return;
    Array.from(input.files).forEach(file => {
        if (!file.type || file.type.indexOf('image/') !== 0) return;
        const reader = new FileReader();
        reader.onload = e => {
            h.photos.push(e.target.result);
            refreshExtraPhotoRow(ti);
        };
        reader.readAsDataURL(file);
    });
}

function fillExtraPhotoRemove(ti, idx) {
    const types = window.RURAL_EXTRA_HAZARD_TYPES || [];
    const h = fillContext && fillContext.extraHazards.find(x => x.type === types[ti]);
    if (!h) return;
    h.photos.splice(idx, 1);
    refreshExtraPhotoRow(ti);
}

function fillExtraPhotoView(ti, idx) {
    const types = window.RURAL_EXTRA_HAZARD_TYPES || [];
    const h = fillContext && fillContext.extraHazards.find(x => x.type === types[ti]);
    if (!h || !h.photos[idx]) return;
    openPhotoViewer(h.photos[idx]);
}

function refreshExtraPhotoRow(ti) {
    const row = document.getElementById('extraPhotoRow-' + ti);
    if (row) row.outerHTML = buildExtraPhotoRowHtml(ti);
}

function buildFillPartCard(group, gi) {
    const sel = fillContext.selections[gi];
    const hasNormal = group.options.some(o => o.level === 'blue');
    const opts = [];
    // 无「第一类」描述的部位（建成时间/设计方式/改扩建）：追加「无此风险」正常快捷项
    if (!hasNormal) {
        opts.push({ special: 'ok', label: '无此风险（正常）', level: 'blue', levelLabel: '正常' });
    }
    group.options.forEach((o, oi) => opts.push({ special: false, oi: oi, label: o.desc, level: o.level, levelLabel: o.levelLabel, accident: o.accident, protection: o.protection, riskType: o.riskType }));
    opts.push({ special: 'na', label: '不适用（该部位不涉及）', level: 'na', levelLabel: '不适用' });

    const optionsHtml = opts.map((o) => {
        const value = o.special === 'ok' ? 'ok' : o.special === 'na' ? 'na' : String(o.oi);
        const active = String(sel.choice) === value ? 'active' : '';
        const metaHtml = o.special
            ? ''
            : `<div class="fill-option-meta">可能导致：${o.accident || '-'}　｜　防护措施：${o.protection || '-'}</div>`;
        return `
            <div class="fill-option ${o.level} ${active}" onclick="fillChoose(${gi}, '${value}')">
                <span class="fill-option-radio"><i class="fa-solid fa-check"></i></span>
                <div class="fill-option-body">
                    <div class="fill-option-head">
                        <span class="fill-option-level ${o.level}">${o.levelLabel}</span>
                        ${(!o.special && o.riskType && o.riskType !== '无') ? `<span class="check-item-type">${o.riskType}</span>` : ''}
                    </div>
                    <div class="fill-option-desc">${o.label}</div>
                    ${metaHtml}
                </div>
            </div>`;
    }).join('');

    return `
        <div class="fill-part-card" id="fillPartCard-${gi}">
            <div class="fill-part-head">
                <span class="fill-part-index">${gi + 1}</span>
                <span class="fill-part-title">${group.part} - ${group.content}</span>
                <span class="fill-part-main">${group.main}</span>
            </div>
            <div class="fill-options">${optionsHtml}</div>
            <div class="fill-abnormal-area" id="fillAbnormal-${gi}" style="display:${isFillAbnormal(gi) ? 'block' : 'none'};">
                <div class="form-row">
                    <label class="form-label">隐患描述</label>
                    <textarea class="fill-textarea" id="fillDesc-${gi}" placeholder="请描述隐患具体情况..." oninput="fillDescInput(${gi}, this.value)">${sel.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <label class="form-label">现场照片</label>
                    ${buildFillPhotoRowHtml(gi)}
                </div>
            </div>
        </div>
    `;
}

function isFillAbnormal(gi) {
    const sel = fillContext.selections[gi];
    if (sel.choice === null || sel.choice === 'na' || sel.choice === 'ok') return false;
    const opt = fillContext.catalog[gi].options[Number(sel.choice)];
    return !!opt && (opt.level === 'yellow' || opt.level === 'red');
}

function fillChoose(gi, value) {
    const sel = fillContext.selections[gi];
    sel.choice = (value === 'na' || value === 'ok') ? value : Number(value);
    if (!isFillAbnormal(gi)) { sel.photos = []; sel.description = ''; }
    const card = document.getElementById('fillPartCard-' + gi);
    if (card) card.outerHTML = buildFillPartCard(fillContext.catalog[gi], gi);
    updateFillProgress();
}

function fillDescInput(gi, value) {
    fillContext.selections[gi].description = value;
}

function updateFillProgress() {
    const el = document.getElementById('fillProgress');
    if (!el || !fillContext) return;
    const done = fillContext.selections.filter(s => s.choice !== null).length;
    el.textContent = `已判定 ${done} / ${fillContext.selections.length} 项`;
}

// ===== 填报照片：多图上传（原型存内存 dataURL；正式环境应上传服务器）=====
function buildFillPhotoRowHtml(gi) {
    const photos = fillContext.selections[gi].photos;
    const thumbs = photos.map((src, i) => `
            <div class="photo-thumb">
                <img src="${src}" alt="现场照片${i + 1}" title="点击放大查看" onclick="fillPhotoView(${gi}, ${i});event.stopPropagation();">
                <button type="button" class="photo-thumb-del" title="删除" onclick="fillPhotoRemove(${gi}, ${i});event.stopPropagation();"><i class="fa-solid fa-xmark"></i></button>
            </div>`).join('');
    return `
                    <div class="photo-upload" id="fillPhotoRow-${gi}">${thumbs}
                        <div class="photo-box photo-box-add" title="上传照片（可多选）" onclick="fillPhotoTrigger(${gi});event.stopPropagation();">
                            <i class="fa-solid fa-camera"></i>
                        </div>
                        <input type="file" id="fillPhotoInput-${gi}" accept="image/*" multiple style="display:none" onchange="fillPhotoChange(${gi}, this)">
                    </div>`;
}

function fillPhotoTrigger(gi) {
    const input = document.getElementById('fillPhotoInput-' + gi);
    if (input) input.click();
}

function fillPhotoChange(gi, input) {
    if (!fillContext || !input.files || input.files.length === 0) return;
    const sel = fillContext.selections[gi];
    Array.from(input.files).forEach(file => {
        if (!file.type || file.type.indexOf('image/') !== 0) return;
        const reader = new FileReader();
        reader.onload = e => {
            sel.photos.push(e.target.result);
            refreshFillPhotoRow(gi);
        };
        reader.readAsDataURL(file);
    });
}

function fillPhotoRemove(gi, idx) {
    if (!fillContext) return;
    fillContext.selections[gi].photos.splice(idx, 1);
    refreshFillPhotoRow(gi);
}

function fillPhotoView(gi, idx) {
    if (!fillContext) return;
    const photos = fillContext.selections[gi].photos || [];
    if (!photos[idx]) return;
    openPhotoViewer(photos[idx]);
}

function refreshFillPhotoRow(gi) {
    const row = document.getElementById('fillPhotoRow-' + gi);
    if (row) row.outerHTML = buildFillPhotoRowHtml(gi);
}

// 保存填报：逐项校验 → 生成检查项 → 回调页面联动
function submitPointFill() {
    if (!fillContext) return;
    const total = fillContext.selections.length;
    for (let gi = 0; gi < total; gi++) {
        const sel = fillContext.selections[gi];
        const group = fillContext.catalog[gi];
        if (sel.choice === null) {
            alert(`第 ${gi + 1} 项「${group.part}」尚未判定，请逐项完成后再保存`);
            return;
        }
        if (isFillAbnormal(gi)) {
            if (!sel.description || !sel.description.trim()) {
                alert(`第 ${gi + 1} 项「${group.part}」判定为异常，请填写隐患描述`);
                return;
            }
            if (!sel.photos.length) {
                alert(`第 ${gi + 1} 项「${group.part}」判定为异常，请至少上传 1 张现场照片`);
                return;
            }
        }
    }
    // 清单外新增隐患：勾选的每类都必须完成排查判断并上传对应现场照片
    for (const h of fillContext.extraHazards) {
        if (!h.level) {
            alert(`新增隐患「${h.type}」请选择排查判断（第三类 / 第二类 / 第一类）`);
            return;
        }
        if (!h.photos.length) {
            alert(`新增隐患「${h.type}」存在该类情况，请至少上传 1 张对应现场照片`);
            return;
        }
    }
    const items = buildRuralCheckItemsFromFill(fillContext.selections);
    const allItems = items.concat(buildExtraHazardItems(fillContext.extraHazards, items.length));
    const onSave = fillContext.onSave;
    const point = fillContext.point;
    closePointFillModal();
    if (typeof onSave === 'function') onSave(point, allItems);
}
