// 通用弹窗函数与检查项渲染（用于 pages/gas-risk-task-*.html）

// 打开巡查点详情弹窗
function openPointModal(point) {
    let overlay = document.getElementById('pointModalOverlay');
    if (!overlay) {
        document.body.insertAdjacentHTML('beforeend', `
            <div class="pc-modal-overlay" id="pointModalOverlay" onclick="closePointModal(event)">
                <div class="pc-modal" onclick="event.stopPropagation()">
                    <div class="pc-modal-header">
                        <div class="pc-modal-title"><i class="fa-solid fa-map-location-dot"></i> 巡查点详情</div>
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

    document.getElementById('pointModalBody').innerHTML = buildPointModalContent(point);
    overlay.classList.add('active');
}

// 关闭巡查点详情弹窗
function closePointModal(event) {
    if (event) event.stopPropagation();
    const overlay = document.getElementById('pointModalOverlay');
    if (overlay) overlay.classList.remove('active');
}

// 构建弹窗内容
function buildPointModalContent(point) {
    const taskName = typeof taskData !== 'undefined' && taskData ? taskData.name : '-';
    const company = point.company || point.enterprise || '-';
    const statusHtml = renderStatusLabel(point.status, point.statusLabel);
    const riskHtml = renderRiskLabel(point.risk, point.riskLabel);

    const checkItems = point.checkItems && point.checkItems.length > 0
        ? point.checkItems.map((item, index) => buildCheckItemCard(item, index)).join('')
        : '<div class="empty-state" style="padding:30px 0;"><i class="fas fa-clipboard-list"></i><p>暂无检查项记录</p></div>';

    return `
        <div class="point-detail-section">
            <div class="point-detail-section-title">巡查点信息</div>
            <div class="point-info-grid">
                <div class="point-info-item">
                    <span class="point-info-label">巡查点名称</span>
                    <span class="point-info-value">${point.name}</span>
                </div>
                <div class="point-info-item">
                    <span class="point-info-label">巡查点类型</span>
                    <span class="point-info-value">${point.type}</span>
                </div>
                <div class="point-info-item">
                    <span class="point-info-label">所属任务</span>
                    <span class="point-info-value">${taskName}</span>
                </div>
                <div class="point-info-item">
                    <span class="point-info-label">所属企业</span>
                    <span class="point-info-value">${company}</span>
                </div>
                <div class="point-info-item full-width">
                    <span class="point-info-label">地址</span>
                    <span class="point-info-value">${point.address}</span>
                </div>
                <div class="point-info-item">
                    <span class="point-info-label">巡查状态</span>
                    <span class="point-info-value">${statusHtml}</span>
                </div>
                <div class="point-info-item">
                    <span class="point-info-label">巡查时间</span>
                    <span class="point-info-value">${point.time || '-'}</span>
                </div>
            </div>
        </div>
        <div class="point-detail-section">
            <div class="point-detail-section-title">风险等级</div>
            <div style="padding:0 14px;">${riskHtml}</div>
        </div>
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
        red: { class: 'red', label: '重大风险' },
        orange: { class: 'orange', label: '较大风险' },
        yellow: { class: 'yellow', label: '一般风险' },
        blue: { class: 'blue', label: '低风险' }
    };
    const level = levelMap[item.level] || levelMap.blue;
    const hasDetail = item.result && item.result !== 'normal';
    const resultClass = item.result === 'normal' ? 'normal' : item.result === 'abnormal' ? 'abnormal' : item.result === 'recheck' ? 'recheck' : '';
    const resultIcon = item.result === 'normal' ? 'fa-check-circle' : item.result === 'abnormal' ? 'fa-triangle-exclamation' : item.result === 'recheck' ? 'fa-clock' : 'fa-circle-question';
    const resultLabel = item.resultLabel || (item.result === 'normal' ? '正常' : item.result === 'abnormal' ? '异常' : item.result === 'recheck' ? '需复查' : '-');

    // 异常/需复查详情内容
    let detailHtml = '';
    if (item.result === 'abnormal') {
        detailHtml = buildAbnormalDetail(item);
    } else if (item.result === 'recheck') {
        detailHtml = buildRecheckDetail(item);
    }

    return `
        <div class="check-item-card ${item.result || ''}" data-id="${item.id}">
            <div class="check-item-main" onclick="toggleCheckItem(${item.id})">
                <div class="check-item-index">${index + 1}</div>
                <div class="check-item-info">
                    <div class="check-item-header">
                        <div class="check-item-title">${item.sub} - ${item.content}</div>
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

function buildAbnormalDetail(item) {
    const disposal = item.disposal || 'handle-now';
    const disposalLabel = disposal === 'handle-now' ? '立即处置' : '上报转办';
    const disposalIcon = disposal === 'handle-now' ? 'fa-bolt' : 'fa-share-from-square';
    return `
        <div class="detail-section">
            <div class="detail-section-title">异常上报</div>
            <div class="detail-form">
                <div class="form-row">
                    <label class="form-label">处置方式</label>
                    <div class="option-group">
                        <div class="option-item ${disposal === 'handle-now' ? 'active' : ''}">
                            <i class="fa-solid ${disposalIcon}"></i>
                            <span>${disposalLabel}</span>
                        </div>
                    </div>
                </div>
                <div class="form-row">
                    <label class="form-label">隐患等级</label>
                    <div class="fake-input">${item.riskLevel || '较大风险'}</div>
                </div>
                <div class="form-row">
                    <label class="form-label">隐患描述</label>
                    <div class="fake-textarea">${item.description || '请描述隐患具体情况...'}</div>
                </div>
                <div class="form-row">
                    <label class="form-label">影响范围</label>
                    <div class="fake-input">${item.scopeDesc || '如：影响周边3户居民'}</div>
                </div>
                <div class="form-row">
                    <label class="form-label">紧急程度</label>
                    <div class="fake-input">${item.urgency || '高'}</div>
                </div>
                <div class="form-row">
                    <label class="form-label">现场证据（拍照）</label>
                    <div class="photo-upload">
                        <div class="photo-box">
                            <i class="fa-solid fa-camera"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
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
        alert('未找到该巡查点信息');
        return;
    }
    openPointModal(point);
}
