# -*- coding: utf-8 -*-
import re, os
from datetime import datetime

BASE = r'e:\风险管控0618'
SRC = os.path.join(BASE, 'pages', 'rural-warning-handle.html')
BAK = os.path.join(BASE, 'backups', 'rural-warning-handle.html.' + datetime.now().strftime('%Y%m%d-%H%M%S'))

with open(SRC, 'r', encoding='utf-8') as f:
    original = f.read()

# 备份
with open(BAK, 'w', encoding='utf-8') as f:
    f.write(original)

# 1. 在 </head> 前引入 house-arch-data.js
if '../js/house-arch-data.js' not in original:
    original = original.replace('</head>', '<script src="../js/house-arch-data.js"></script>\n</head>')

# 2. 替换 body 主体：从 <body> 到 </body>
new_body = '''<body>

<!-- Page Header -->
<div class="page-header">
    <div>
        <div class="breadcrumb">
            <a href="rural-warning-management.html"><i class="fa-solid fa-arrow-left"></i> 返回风险隐患处置中心</a>
            <span class="breadcrumb-sep">/</span>
            <span>风险隐患处置</span>
        </div>
        <div class="page-title" style="margin-top:8px">
            <i class="fa-solid fa-share-nodes"></i>
            <span>风险隐患处置</span>
        </div>
    </div>
</div>

<!-- ===== 步骤条 ===== -->
<div class="step-bar">
    <div class="step-item completed">
        <div class="step-circle">1</div>
        <div class="step-label">接收任务</div>
    </div>
    <div class="step-line"></div>
    <div class="step-item active">
        <div class="step-circle">2</div>
        <div class="step-label">现场勘查</div>
    </div>
    <div class="step-line"></div>
    <div class="step-item">
        <div class="step-circle">3</div>
        <div class="step-label">方案制定</div>
    </div>
    <div class="step-line"></div>
    <div class="step-item">
        <div class="step-circle">4</div>
        <div class="step-label">整治实施</div>
    </div>
    <div class="step-line"></div>
    <div class="step-item">
        <div class="step-circle">5</div>
        <div class="step-label">自检自查</div>
    </div>
    <div class="step-line"></div>
    <div class="step-item">
        <div class="step-circle">6</div>
        <div class="step-label">验收确认</div>
    </div>
</div>

<!-- ===== Two Column Layout ===== -->
<div class="two-column-layout">

<!-- ===== LEFT COLUMN ===== -->
<div class="left-column">

<!-- Left Tab Navigation -->
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
    <button class="left-tab-btn" onclick="switchLeftTab(this,'left-tab-process')">
        <i class="fa-solid fa-list-check"></i> 处置过程
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
                <span class="info-value" id="base-status"><span class="status-tag processing">-</span></span>
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
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">可能后果</span>
                <span class="info-value" id="base-consequence">-</span>
            </div>
        </div>
    </div>
</div>

<!-- ===== 上报人信息 ===== -->
<div class="section-card">
    <div class="section-header">
        <i class="fa-solid fa-user"></i>
        上报人信息
    </div>
    <div class="section-body">
        <div class="info-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="info-item">
                <span class="info-label">姓名</span>
                <span class="info-value" id="reporter-name">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">部门</span>
                <span class="info-value" id="reporter-dept">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">电话</span>
                <span class="info-value" id="reporter-phone">-</span>
            </div>
        </div>
    </div>
</div>

<!-- ===== 规范标准列表 ===== -->
<div class="section-card">
    <div class="section-header">
        <i class="fa-solid fa-book"></i>
        规范标准列表
    </div>
    <div class="section-body" style="padding: 0;">
        <table class="data-table" style="table-layout: auto;">
            <thead>
                <tr>
                    <th style="white-space: nowrap;">标准编号</th>
                    <th>标准名称</th>
                    <th style="white-space: nowrap;">标准类型</th>
                    <th style="white-space: nowrap;">发布机关</th>
                    <th style="white-space: nowrap;">发布日期</th>
                    <th style="white-space: nowrap;">实施日期</th>
                    <th style="white-space: nowrap;">适用领域</th>
                    <th style="white-space: nowrap;">时效状态</th>
                </tr>
            </thead>
            <tbody id="standards-body">
                <tr>
                    <td>JGJ/T 363-2014</td>
                    <td><a href="#" style="color: var(--primary); text-decoration: none;">《农村住房危险性鉴定标准》</a></td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: var(--primary-light); color: var(--primary); font-size: 12px; border-radius: 12px;">行业标准</span></td>
                    <td>住建部</td>
                    <td>2014-06-12</td>
                    <td>2015-05-01</td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: var(--primary-light); color: var(--primary); font-size: 12px; border-radius: 12px;">农村自建房</span></td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: rgba(30,142,62,0.1); color: var(--success); font-size: 12px; border-radius: 12px;">现行有效</span></td>
                </tr>
                <tr>
                    <td>GB 50003-2011</td>
                    <td><a href="#" style="color: var(--primary); text-decoration: none;">《砌体结构设计规范》</a></td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: var(--primary-light); color: var(--primary); font-size: 12px; border-radius: 12px;">国家标准</span></td>
                    <td>住建部</td>
                    <td>2011-07-26</td>
                    <td>2012-08-01</td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: var(--primary-light); color: var(--primary); font-size: 12px; border-radius: 12px;">农村自建房</span></td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: rgba(30,142,62,0.1); color: var(--success); font-size: 12px; border-radius: 12px;">现行有效</span></td>
                </tr>
                <tr>
                    <td>GB 50010-2010</td>
                    <td><a href="#" style="color: var(--primary); text-decoration: none;">《混凝土结构设计规范》（2015年版）</a></td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: var(--primary-light); color: var(--primary); font-size: 12px; border-radius: 12px;">国家标准</span></td>
                    <td>住建部</td>
                    <td>2015-09-03</td>
                    <td>2016-07-01</td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: var(--primary-light); color: var(--primary); font-size: 12px; border-radius: 12px;">农村自建房</span></td>
                    <td><span style="display: inline-block; padding: 3px 10px; background: rgba(30,142,62,0.1); color: var(--success); font-size: 12px; border-radius: 12px;">现行有效</span></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- ===== 处置要求 ===== -->
<div class="section-card" style="margin-top: 16px;">
    <div class="section-header">
        <i class="fa-solid fa-clipboard-list"></i>
        处置要求
    </div>
    <div class="section-body">
        <div class="info-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="info-item">
                <span class="info-label">处置人</span>
                <span class="info-value" id="handle-person">-</span>
            </div>
            <div class="info-item">
                <span class="info-label">处置时限</span>
                <span class="info-value" id="handle-deadline">-</span>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">实施要求</span>
                <span class="info-value" id="handle-implement">-</span>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">验收要求</span>
                <span class="info-value" id="handle-accept">-</span>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">抄送</span>
                <span class="info-value" id="handle-cc">-</span>
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

<!-- ===== TAB: 处置过程 ===== -->
<div id="left-tab-process" class="left-tab-panel">

<!-- 现场勘查 -->
<div class="collapsible-card expanded" id="process-survey">
    <div class="collapsible-header" onclick="toggleCollapsible('process-survey')">
        <div class="collapsible-header-left">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span class="collapsible-header-title">现场勘查</span>
            <span class="collapsible-header-status">进行中</span>
        </div>
        <i class="fa-solid fa-chevron-down collapsible-toggle"></i>
    </div>
    <div class="collapsible-body">
        <div class="form-group">
            <label class="form-sublabel">处置过程记录</label>
            <div id="process-survey-record" style="padding: 12px; background: var(--bg-hover); border-radius: 8px; font-size: 14px; line-height: 1.6; color: var(--text-primary);">
                已抵达现场，对隐患房屋进行初步勘查。房屋为砖混结构，局部墙体存在裂缝，建议进一步进行安全鉴定并制定修缮方案。
            </div>
        </div>
        <div class="form-group">
            <label class="form-sublabel">现场照片</label>
            <div class="photo-grid">
                <div class="photo-item"><i class="fa-regular fa-image"></i></div>
                <div class="photo-item"><i class="fa-regular fa-image"></i></div>
                <div class="photo-item"><i class="fa-regular fa-image"></i></div>
            </div>
        </div>
        <div class="form-group">
            <label class="form-sublabel">附件上传</label>
            <div class="attachment-list">
                <div class="attachment-item">
                    <i class="fa-solid fa-file-pdf"></i>
                    <span class="attachment-name">现场勘查报告.pdf</span>
                    <span class="attachment-size">2.4 MB</span>
                </div>
                <div class="attachment-item">
                    <i class="fa-solid fa-file-word"></i>
                    <span class="attachment-name">风险辨识记录.docx</span>
                    <span class="attachment-size">1.1 MB</span>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 方案制定 -->
<div class="collapsible-card" id="process-plan">
    <div class="collapsible-header" onclick="toggleCollapsible('process-plan')">
        <div class="collapsible-header-left">
            <i class="fa-solid fa-file-pen"></i>
            <span class="collapsible-header-title">方案制定</span>
            <span class="collapsible-header-status">待开始</span>
        </div>
        <i class="fa-solid fa-chevron-down collapsible-toggle"></i>
    </div>
    <div class="collapsible-body">
        <div class="form-group">
            <label class="form-sublabel">处置过程记录</label>
            <div style="padding: 12px; background: var(--bg-hover); border-radius: 8px; font-size: 14px; line-height: 1.6; color: var(--text-secondary); min-height: 80px; display: flex; align-items: center; justify-content: center;">
                暂无记录
            </div>
        </div>
        <div class="form-group">
            <label class="form-sublabel">现场照片</label>
            <div class="photo-grid">
                <div class="photo-item" style="border-style: dashed; color: var(--text-secondary);"><i class="fa-solid fa-image"></i></div>
            </div>
        </div>
        <div class="form-group">
            <label class="form-sublabel">附件上传</label>
            <div style="padding: 12px; background: var(--bg-hover); border-radius: 8px; font-size: 14px; color: var(--text-secondary); text-align: center;">
                暂无附件
            </div>
        </div>
    </div>
</div>

<!-- 整治实施 -->
<div class="collapsible-card" id="process-repair">
    <div class="collapsible-header" onclick="toggleCollapsible('process-repair')">
        <div class="collapsible-header-left">
            <i class="fa-solid fa-wrench"></i>
            <span class="collapsible-header-title">整治实施</span>
            <span class="collapsible-header-status">待开始</span>
        </div>
        <i class="fa-solid fa-chevron-down collapsible-toggle"></i>
    </div>
    <div class="collapsible-body">
        <div class="form-group">
            <label class="form-sublabel">处置过程记录</label>
            <div style="padding: 12px; background: var(--bg-hover); border-radius: 8px; font-size: 14px; line-height: 1.6; color: var(--text-secondary); min-height: 80px; display: flex; align-items: center; justify-content: center;">
                暂无记录
            </div>
        </div>
        <div class="form-group">
            <label class="form-sublabel">现场照片</label>
            <div class="photo-grid">
                <div class="photo-item" style="border-style: dashed; color: var(--text-secondary);"><i class="fa-solid fa-image"></i></div>
            </div>
        </div>
        <div class="form-group">
            <label class="form-sublabel">附件上传</label>
            <div style="padding: 12px; background: var(--bg-hover); border-radius: 8px; font-size: 14px; color: var(--text-secondary); text-align: center;">
                暂无附件
            </div>
        </div>
    </div>
</div>

<!-- 自检自查 -->
<div class="collapsible-card" id="process-check">
    <div class="collapsible-header" onclick="toggleCollapsible('process-check')">
        <div class="collapsible-header-left">
            <i class="fa-solid fa-clipboard-check"></i>
            <span class="collapsible-header-title">自检自查</span>
            <span class="collapsible-header-status">待开始</span>
        </div>
        <i class="fa-solid fa-chevron-down collapsible-toggle"></i>
    </div>
    <div class="collapsible-body">
        <div class="form-group">
            <label class="form-sublabel">处置过程记录</label>
            <div style="padding: 12px; background: var(--bg-hover); border-radius: 8px; font-size: 14px; line-height: 1.6; color: var(--text-secondary); min-height: 80px; display: flex; align-items: center; justify-content: center;">
                暂无记录
            </div>
        </div>
        <div class="form-group">
            <label class="form-sublabel">现场照片</label>
            <div class="photo-grid">
                <div class="photo-item" style="border-style: dashed; color: var(--text-secondary);"><i class="fa-solid fa-image"></i></div>
            </div>
        </div>
        <div class="form-group">
            <label class="form-sublabel">附件上传</label>
            <div style="padding: 12px; background: var(--bg-hover); border-radius: 8px; font-size: 14px; color: var(--text-secondary); text-align: center;">
                暂无附件
            </div>
        </div>
    </div>
</div>

</div>

</div>

<!-- ===== RIGHT COLUMN ===== -->
<div class="right-column">

<!-- ===== 现场勘察过程记录 ===== -->
    <div class="audit-decision-card">
        <div class="audit-decision-header">
            <i class="fa-solid fa-magnifying-glass"></i>
            现场勘察过程记录
        </div>
        <div class="audit-decision-body">
            <div class="form-group">
                <label class="form-label">过程记录</label>
                <textarea class="form-textarea" rows="6" placeholder="请填写当前步骤的处置过程记录..."></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">现场照片</label>
                <div class="photo-grid">
                    <div class="photo-item add-btn"><i class="fa-solid fa-plus"></i></div>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">附件上传</label>
                <div class="upload-area">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    <div class="upload-area-text">点击或拖拽文件到此处上传</div>
                    <div class="upload-area-hint">支持 PDF、Word、Excel、图片等格式</div>
                </div>
                <div class="attachment-list" style="margin-top: 12px;">
                    <div class="attachment-item">
                        <i class="fa-solid fa-file-pdf"></i>
                        <span class="attachment-name">现场勘查报告.pdf</span>
                        <span class="attachment-size">2.4 MB</span>
                        <i class="fa-solid fa-xmark attachment-remove"></i>
                    </div>
                </div>
            </div>
            <!-- 操作按钮 -->
            <div class="btn-bar" style="margin-top: 20px;">
                <button class="btn btn-secondary" onclick="saveDraft()" style="flex: 1; height: 44px; justify-content: center;">
                    <i class="fa-solid fa-floppy-disk"></i> 暂存
                </button>
                <button class="btn btn-primary" onclick="submitDispatch()" style="flex: 1; height: 44px; justify-content: center;">
                    <i class="fa-solid fa-check"></i> 确认提交
                </button>
            </div>
        </div>
    </div>

    <!-- ===== 流转记录 ===== -->
    <div class="audit-decision-card">
        <div class="audit-decision-header">
            <i class="fa-solid fa-clock-rotate-left"></i>
            流转记录
        </div>
        <div class="audit-decision-body">
            <div class="compact-timeline" id="flow-timeline">
                <div class="compact-item completed">
                    <div class="compact-dot"><i class="fa-solid fa-check"></i></div>
                    <div class="compact-content">
                        <div class="compact-title">隐患上报</div>
                        <div class="compact-meta">
                            <i class="fa-solid fa-user"></i> <span class="flow-user">-</span>
                            <i class="fa-solid fa-clock"></i> <span class="flow-time">-</span>
                        </div>
                        <div class="compact-desc">排查发现农村自建房安全隐患，已上报并等待分发。</div>
                    </div>
                </div>
                <div class="compact-item completed">
                    <div class="compact-dot"><i class="fa-solid fa-check"></i></div>
                    <div class="compact-content">
                        <div class="compact-title">任务派发</div>
                        <div class="compact-meta">
                            <i class="fa-solid fa-user"></i> <span class="flow-user">-</span>
                            <i class="fa-solid fa-clock"></i> <span class="flow-time">-</span>
                        </div>
                        <div class="compact-desc">确认隐患信息，派发至隐患整治队，指派处置负责人。</div>
                    </div>
                </div>
                <div class="compact-item completed">
                    <div class="compact-dot"><i class="fa-solid fa-check"></i></div>
                    <div class="compact-content">
                        <div class="compact-title">接收任务</div>
                        <div class="compact-meta">
                            <i class="fa-solid fa-user"></i> <span class="flow-user">-</span>
                            <i class="fa-solid fa-clock"></i> <span class="flow-time">-</span>
                        </div>
                        <div class="compact-desc">接收处置任务，确认现场地址及隐患情况，准备前往现场。</div>
                    </div>
                </div>
                <div class="compact-item active">
                    <div class="compact-dot"></div>
                    <div class="compact-content">
                        <div class="compact-title">现场勘查</div>
                        <div class="compact-meta">
                            <i class="fa-solid fa-user"></i> <span class="flow-user">-</span>
                            <i class="fa-solid fa-clock"></i> <span class="flow-time">-</span>
                        </div>
                        <div class="compact-desc">抵达现场，正在进行现场勘查及风险辨识，填写勘查记录中。</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</div>

<!-- ===== 组织架构弹窗 ===== -->
<div class="org-modal-overlay" id="orgModal">
    <div class="org-modal">
        <div class="org-modal-header">
            <h3><i class="fas fa-sitemap"></i> <span id="orgModalTitle">选择人员</span></h3>
            <button class="org-modal-close" onclick="closeOrgModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="org-modal-body">
            <div class="org-tree-panel" id="orgTreePanel"></div>
            <div class="org-person-panel">
                <div class="org-person-header">
                    <span class="selected-info">已选择 <strong id="orgSelectedCount">0</strong> 人</span>
                </div>
                <div class="org-person-search">
                    <input type="text" id="orgPersonSearch" placeholder="搜索姓名..." oninput="filterOrgPersons()">
                </div>
                <div class="org-person-list">
                    <table class="org-person-table">
                        <thead>
                            <tr>
                                <th style="width:40px;"><input type="checkbox" id="orgSelectAll" onclick="toggleOrgSelectAll()"></th>
                                <th>姓名</th>
                                <th>部门</th>
                                <th>电话</th>
                            </tr>
                        </thead>
                        <tbody id="orgPersonTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="org-modal-footer">
            <button class="btn btn-secondary" onclick="closeOrgModal()">取消</button>
            <button class="btn btn-primary" onclick="confirmOrgSelection()"><i class="fas fa-check"></i> 确定</button>
        </div>
    </div>
</div>
</body>
</html>
'''

original = re.sub(r'<body>.*?</body>', new_body, original, flags=re.DOTALL)

# 3. 替换 templates 为农村自建房版本
new_templates = '''const templates = {
    template1: {
        implement: '1. 立即设置警戒区域，禁止人员靠近隐患部位\\n2. 联系具备资质的房屋安全鉴定机构进行现场复核\\n3. 根据鉴定结论制定加固或拆除方案\\n4. 对危险构件采取临时支护措施\\n5. 实施完成后组织专项验收',
        accept: '1. 结构安全隐患已消除或可控\\n2. 鉴定报告、施工记录、验收材料齐全\\n3. 临时支护措施已拆除或转为永久加固\\n4. 房屋使用安全复核合格'
    },
    template2: {
        implement: '1. 清理开裂部位周边附着物，查明开裂原因\\n2. 对裂缝进行标识、测量并拍照记录\\n3. 采用注浆、挂网抹灰或增设构造柱等方式修复\\n4. 修复完成后进行养护\\n5. 组织现场复核',
        accept: '1. 墙体裂缝已封闭，无继续发展趋势\\n2. 修复材料强度符合要求\\n3. 相关影像及检测记录完整\\n4. 现场复核无新增裂缝'
    },
    template3: {
        implement: '1. 清理屋顶积水、杂物，查找渗漏点\\n2. 对破损屋面进行临时覆盖，防止雨水渗漏扩大\\n3. 更换或修复破损瓦片、防水层\\n4. 修复完成后进行淋水试验\\n5. 整理维修记录',
        accept: '1. 屋面无渗漏，淋水试验合格\\n2. 屋面材料及做法符合当地农房修缮要求\\n3. 维修前后对比影像资料齐全\\n4. 住户确认无渗漏问题'
    },
    template4: {
        implement: '1. 对房屋倾斜、沉降进行监测并记录数据\\n2. 委托专业机构评估地基基础安全状况\\n3. 根据评估结果采取注浆加固、扩大基础或局部托换\\n4. 加固过程中持续监测沉降变化\\n5. 完成后出具加固验收报告',
        accept: '1. 房屋沉降速率趋于稳定并满足规范要求\\n2. 基础加固质量检测报告合格\\n3. 加固过程监测数据完整\\n4. 验收报告及影像资料归档'
    }
};'''

original = re.sub(r'const templates = \{[\s\S]*?\};', new_templates, original)

# 4. 替换应急抢修队/应急抢修为隐患整治队/隐患整治
original = original.replace('应急抢修队', '隐患整治队')

# 5. 在 </script> 前插入动态加载函数，并修改初始化
load_data_script = '''
// ===== 动态加载农村自建房数据 =====
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
    if (status === 'handling') return { label: '处置中', cls: 'processing' };
    if (status === 'pending-dispatch') return { label: '待分发', cls: 'pending' };
    return { label: '现场勘查', cls: 'processing' };
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
function addDays(dateStr, days) {
    const dt = new Date(dateStr);
    dt.setDate(dt.getDate() + days);
    return formatDateTime(dt);
}
function getDeadlineByLevel(level, reportTime) {
    const base = new Date(reportTime || Date.now());
    let days = 7;
    if (level === '重大隐患') days = 1;
    else if (level === '较大隐患') days = 3;
    base.setDate(base.getDate() + days);
    return formatDateTime(base) + '（' + days + '天）';
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
    setHtml('base-status', renderStatusTag('handling'));
    setText('base-source', riskInfo.discoveryMethod || '排查发现');
    setText('base-reportTime', formatDateTime(reportTime));
    setText('base-reporter', rec.owner);
    setText('base-dutyUnit', rec.responsibleDept || (rec.street + '城建中心'));
    setText('base-owner', rec.owner);
    setText('base-desc', riskInfo.riskDesc || (firstHazard.part || '') + '存在' + (riskInfo.riskType || '安全隐患') + '，需进一步处置');
    setText('base-consequence', riskInfo.possibleConsequence || '房屋局部损坏或影响居住安全');

    // 上报人信息
    setText('reporter-name', rec.owner);
    setText('reporter-dept', rec.responsibleDept || (rec.street + '城建中心'));
    setText('reporter-phone', rec.ownerPhone || '-');

    // 处置要求
    setText('handle-person', rec.responsiblePerson || rec.owner);
    setText('handle-deadline', getDeadlineByLevel(level, reportTime));
    setText('handle-implement', rec.manageRecords && rec.manageRecords[0] && rec.manageRecords[0].implementRequirements ?
        rec.manageRecords[0].implementRequirements.replace(/\\n/g, '；') : '1. 设置安全警戒；2. 委托专业机构鉴定；3. 按方案实施整治；4. 完成后组织验收。');
    setText('handle-accept', rec.manageRecords && rec.manageRecords[0] && rec.manageRecords[0].acceptanceRequirements ?
        rec.manageRecords[0].acceptanceRequirements.replace(/\\n/g, '；') : '1. 隐患已消除；2. 整治记录及影像资料齐全；3. 房屋安全复核合格。');
    setText('handle-cc', '村安全员、街镇城建中心');

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
        items.push({ title: '隐患上报', user: rec.owner || '上报人', time: formatDateTime(reportTime), desc: '排查发现农村自建房安全隐患，已上报并等待分发。', completed: true });
        if (records.length) {
            items.push({ title: '任务派发', user: rec.responsiblePerson || '村安全员', time: formatDateTime(records[0].checkDate + ' 09:00'), desc: '确认隐患信息，派发至隐患整治队，指派处置负责人。', completed: true });
        }
        if (manage.length) {
            items.push({ title: '接收任务', user: rec.responsiblePerson || '处置负责人', time: formatDateTime(manage[0].assignTime || reportTime), desc: '接收处置任务，确认现场地址及隐患情况，准备前往现场。', completed: true });
            items.push({ title: '现场勘查', user: rec.responsiblePerson || '处置负责人', time: formatDateTime(manage[0].assignTime || reportTime), desc: '抵达现场，正在进行现场勘查及风险辨识，填写勘查记录中。', completed: false });
        } else {
            items.push({ title: '任务派发', user: rec.responsiblePerson || '村安全员', time: formatDateTime(reportTime), desc: '确认隐患信息，派发至隐患整治队，指派处置负责人。', completed: true });
            items.push({ title: '接收任务', user: rec.responsiblePerson || '处置负责人', time: formatDateTime(reportTime), desc: '接收处置任务，确认现场地址及隐患情况，准备前往现场。', completed: true });
            items.push({ title: '现场勘查', user: rec.responsiblePerson || '处置负责人', time: formatDateTime(reportTime), desc: '抵达现场，正在进行现场勘查及风险辨识，填写勘查记录中。', completed: false });
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

    // 现场勘查过程记录默认内容
    const surveyRecord = document.getElementById('process-survey-record');
    if (surveyRecord) {
        surveyRecord.textContent = '已抵达现场，对 ' + rec.name + ' 进行初步勘查。' + (riskInfo.riskDesc || '房屋存在' + (riskInfo.riskType || '安全隐患')) + '，已拍照记录并设置警戒区域，建议进一步进行安全鉴定并制定修缮方案。';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderOrgTree();
    loadData();
});
'''

# 替换初始化脚本
original = re.sub(r'// Initialize\s*document\.addEventListener\(\'DOMContentLoaded\', function\(\) \{\s*renderOrgTree\(\);\s*\}\);', load_data_script, original)

with open(SRC, 'w', encoding='utf-8') as f:
    f.write(original)

print('Done:', SRC)
print('Backup:', BAK)
