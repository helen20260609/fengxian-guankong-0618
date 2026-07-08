import os

p = r'e:\\风险管控0618\\pages\\tp-performance.html'

html = '''<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>机构业绩管理 - 第三方服务机构</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="tp-common.css">
<script src="../js/echarts.min.js"></script>
<style>
:root {
    --primary: #1a73e8;
    --primary-dark: #1557b0;
    --primary-light: #e8f0fe;
    --secondary: #0097a7;
    --danger: #d93025;
    --warning: #e37400;
    --success: #1e8e3e;
    --bg-dark: #f0f2f5;
    --bg-card: #ffffff;
    --bg-hover: #e8eaed;
    --text-primary: #202124;
    --text-secondary: #5f6368;
    --border: #dadce0;
    --shadow: rgba(0,0,0,0.08);
    --input-bg: #ffffff;
    --input-border: #dadce0;
    --header-bg: rgba(0,0,0,0.02);
}
:root[data-theme="dark"] {
    --primary: #1e6fdb;
    --primary-dark: #1557b0;
    --primary-light: #e8f1fd;
    --secondary: #00b4d8;
    --danger: #ef4444;
    --warning: #f59e0b;
    --success: #10b981;
    --bg-dark: #0a1628;
    --bg-card: #112240;
    --bg-hover: #1a2f4a;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --border: #1e3a5f;
    --shadow: rgba(0,0,0,0.3);
    --input-bg: rgba(255,255,255,0.05);
    --input-border: #1e3a5f;
    --header-bg: rgba(0,0,0,0.2);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; background: var(--bg-dark); color: var(--text-primary); margin: 0; padding: 20px; }

/* 统计卡片 */
.stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.stat-item { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: flex; align-items: center; gap: 14px; transition: all 0.3s; }
.stat-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px var(--shadow); }
.stat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.stat-icon.blue { background: rgba(26,115,232,0.12); color: var(--primary); }
.stat-icon.green { background: rgba(30,142,62,0.12); color: var(--success); }
.stat-icon.orange { background: rgba(227,116,0,0.12); color: var(--warning); }
.stat-icon.purple { background: rgba(106,68,242,0.12); color: #6a44f2; }
.stat-icon.red { background: rgba(217,48,37,0.12); color: var(--danger); }
.stat-icon.cyan { background: rgba(0,188,212,0.12); color: #00bcd4; }
.stat-info { display: flex; flex-direction: column; }
.stat-number { font-size: 22px; font-weight: 700; color: var(--text-primary); line-height: 1; }
.stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.stat-trend { font-size: 12px; margin-top: 4px; }
.stat-trend.up { color: var(--success); }
.stat-trend.down { color: var(--danger); }

/* 表单卡片 */
.form-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
.form-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.form-title { font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.form-title .badge { font-size: 12px; font-weight: 400; color: var(--text-secondary); margin-left: 4px; }
.form-body { padding: 20px; }

/* 表单布局 */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 16px; }
.form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; color: var(--text-primary); }
.form-group label .required { color: var(--danger); margin-left: 2px; }
.form-group input, .form-group select, .form-group textarea {
    padding: 10px 12px;
    border: 1px solid var(--input-border);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); }
.form-group textarea { resize: vertical; min-height: 80px; }

/* 全宽表单行 */
.form-row-full { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 16px; }

/* 文件上传 */
.file-upload { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--input-border); border-radius: 8px; background: var(--input-bg); flex-wrap: wrap; }
.file-upload input[type="file"] { display: none; }
.file-upload label { padding: 4px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; cursor: pointer; background: var(--bg-card); color: var(--text-primary); transition: all 0.2s; }
.file-upload label:hover { border-color: var(--primary); color: var(--primary); }
.file-upload .file-name { font-size: 13px; color: var(--text-secondary); }
.file-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.file-list-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-card); font-size: 13px; }
.file-list-item .file-name { display: flex; align-items: center; gap: 8px; color: var(--text-primary); }
.file-list-item .file-name i { color: var(--primary); }
.file-list-item .remove-file { cursor: pointer; color: var(--danger); padding: 2px 6px; border-radius: 4px; }
.file-list-item .remove-file:hover { background: rgba(217,48,37,0.1); }

/* 按钮 */
.form-actions { display: flex; align-items: center; gap: 12px; margin-top: 4px; flex-wrap: wrap; }
.btn { padding: 10px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-dark); }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-primary); }
.btn-outline:hover { border-color: var(--primary); color: var(--primary); }
.btn-success { background: var(--success); color: #fff; }
.btn-success:hover { background: #166534; }
.btn-warning { background: var(--warning); color: #fff; }
.btn-warning:hover { background: #b45309; }
.btn-sm { padding: 6px 14px; font-size: 13px; }

/* 筛选栏 */
.filter-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-bar select, .filter-bar input {
    padding: 8px 12px;
    border: 1px solid var(--input-border);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--text-primary);
    font-size: 13px;
    font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}
.filter-bar input { width: 160px; }
.filter-bar .btn { padding: 8px 18px; font-size: 13px; }

/* 图表区域 */
.chart-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
.chart-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.chart-header { padding: 14px 18px; border-bottom: 1px solid var(--border); font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.chart-body { padding: 12px; }
.chart-box { width: 100%; height: 260px; }
.chart-box.tall { height: 320px; }

/* 表格 */
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table th, .data-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); text-align: left; }
.data-table th { background: var(--header-bg); color: var(--text-secondary); font-weight: 600; white-space: nowrap; }
.data-table tr:hover { background: var(--bg-hover); }
.data-table .amount { font-weight: 600; color: var(--primary); }
.data-table .tag { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
.tag-success { background: rgba(30,142,62,0.12); color: var(--success); }
.tag-warning { background: rgba(227,116,0,0.12); color: var(--warning); }
.tag-danger { background: rgba(217,48,37,0.12); color: var(--danger); }
.tag-info { background: rgba(26,115,232,0.12); color: var(--primary); }
.tag-domain { background: var(--primary-light); color: var(--primary); }

/* 状态标签 */
.status-tag { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status-tag.primary { background: var(--primary-light); color: var(--primary); }
.status-tag.success { background: rgba(30,142,62,0.12); color: var(--success); }
.status-tag.warning { background: rgba(227,116,0,0.12); color: var(--warning); }
.status-tag.danger { background: rgba(217,48,37,0.12); color: var(--danger); }
.status-tag.info { background: rgba(0,188,212,0.12); color: #00bcd4; }

/* 操作按钮 */
.action-btns { display: inline-flex; gap: 6px; }
.action-btn { padding: 4px 8px; border-radius: 6px; font-size: 12px; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s; }
.action-btn.view { background: var(--primary-light); color: var(--primary); }
.action-btn.view:hover { background: var(--primary); color: #fff; }
.action-btn.delete { background: rgba(217,48,37,0.1); color: var(--danger); }
.action-btn.delete:hover { background: var(--danger); color: #fff; }
.action-btn.approve { background: rgba(30,142,62,0.1); color: var(--success); }
.action-btn.approve:hover { background: var(--success); color: #fff; }
.action-btn.reject { background: rgba(227,116,0,0.1); color: var(--warning); }
.action-btn.reject:hover { background: var(--warning); color: #fff; }

/* 分页 */
.pagination { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.pagination .btn { padding: 6px 12px; font-size: 13px; }
.pagination .page-info { font-size: 13px; color: var(--text-secondary); }

/* 响应式 */
@media (max-width: 1200px) {
    .chart-grid { grid-template-columns: 1fr; }
    .stat-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
    .stat-row { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
    .form-row-3 { grid-template-columns: 1fr; }
    .filter-bar { flex-direction: column; align-items: stretch; }
    .filter-bar input { width: 100%; }
    .data-table { display: block; overflow-x: auto; }
}
</style>
</head>
<body>

<!-- 统计卡片 -->
<div class="stat-row">
    <div class="stat-item">
        <div class="stat-icon blue"><i class="fas fa-briefcase"></i></div>
        <div class="stat-info">
            <div class="stat-number" id="statTotal">0</div>
            <div class="stat-label">总业绩项目</div>
        </div>
    </div>
    <div class="stat-item">
        <div class="stat-icon purple"><i class="fas fa-coins"></i></div>
        <div class="stat-info">
            <div class="stat-number" id="statAmount">0</div>
            <div class="stat-label">合同总金额（万元）</div>
        </div>
    </div>
    <div class="stat-item">
        <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
        <div class="stat-info">
            <div class="stat-number" id="statApproved">0</div>
            <div class="stat-label">已通过业绩</div>
        </div>
    </div>
    <div class="stat-item">
        <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
        <div class="stat-info">
            <div class="stat-number" id="statPending">0</div>
            <div class="stat-label">待审核</div>
        </div>
    </div>
    <div class="stat-item">
        <div class="stat-icon red"><i class="fas fa-exclamation-circle"></i></div>
        <div class="stat-info">
            <div class="stat-number" id="statRejected">0</div>
            <div class="stat-label">已驳回</div>
        </div>
    </div>
    <div class="stat-item">
        <div class="stat-icon cyan"><i class="fas fa-chart-line"></i></div>
        <div class="stat-info">
            <div class="stat-number" id="statPassRate">0%</div>
            <div class="stat-label">审核通过率</div>
        </div>
    </div>
</div>

<!-- 业绩数据采集 -->
<div class="form-card">
    <div class="form-header">
        <div class="form-title"><i class="fas fa-pencil-alt" style="color: var(--primary);"></i> 业绩数据采集</div>
        <div class="form-title" style="font-weight: 400;"><span class="badge">支持草稿保存、多文件上传、提交审核</span></div>
    </div>
    <div class="form-body">
        <input type="hidden" id="recordId" value="">
        <div class="form-row">
            <div class="form-group">
                <label>项目名称 <span class="required">*</span></label>
                <input type="text" id="inputProjectName" value="奉贤区青村镇农村自建房风险普查">
            </div>
            <div class="form-group">
                <label>委托单位 <span class="required">*</span></label>
                <input type="text" id="inputClient" value="奉贤区住房城乡建设委">
            </div>
        </div>
        <div class="form-row-3">
            <div class="form-group">
                <label>服务领域 <span class="required">*</span></label>
                <select id="inputDomain">
                    <option>建筑工地</option>
                    <option>基坑</option>
                    <option>交通</option>
                    <option>玻璃幕墙</option>
                    <option>燃气</option>
                    <option>高空坠物</option>
                    <option>城镇自建房</option>
                    <option selected>农村自建房</option>
                </select>
            </div>
            <div class="form-group">
                <label>服务类型 <span class="required">*</span></label>
                <select id="inputServiceType">
                    <option>应急咨询</option>
                    <option>安全评估</option>
                    <option>检测检验</option>
                    <option>隐患排查</option>
                </select>
            </div>
            <div class="form-group">
                <label>服务时间 <span class="required">*</span></label>
                <input type="text" id="inputServiceTime" value="2026-01 ~ 2026-06">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>合同金额 (万元)</label>
                <input type="number" id="inputAmount" value="76.5">
            </div>
            <div class="form-group">
                <label>验收结论</label>
                <select id="inputConclusion">
                    <option>合格</option>
                    <option>基本合格</option>
                    <option>不合格</option>
                    <option>待验收</option>
                </select>
            </div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label>业绩说明</label>
                <textarea id="inputDesc">完成奉贤区青村镇 8 个行政村、约 3200 栋农村自建房风险普查，形成一户一档风险台账，提交排查报告 8 份。</textarea>
            </div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label>交付成果</label>
                <textarea id="inputDeliverables" placeholder="填写具体交付成果，如：排查报告、检测报告、评估意见、整改建议等">形成一户一档风险台账，提交排查报告 8 份。</textarea>
            </div>
        </div>
        <div class="form-row-full">
            <div class="form-group">
                <label>证明材料 <span style="font-size:12px;color:var(--text-secondary);">（支持多文件上传）</span></label>
                <div class="file-upload">
                    <label for="fileInput"><i class="fas fa-folder-open"></i> 选择文件</label>
                    <input type="file" id="fileInput" multiple onchange="handleFileSelect(this)">
                    <span class="file-name" id="fileName">未选择任何文件</span>
                </div>
                <div class="file-list" id="fileList"></div>
            </div>
        </div>
        <div class="form-actions">
            <button class="btn btn-outline" onclick="saveDraft()"><i class="fas fa-save"></i> 保存草稿</button>
            <button class="btn btn-primary" onclick="submitPerformance()"><i class="fas fa-paper-plane"></i> 提交审核</button>
            <button class="btn btn-outline" onclick="resetForm()"><i class="fas fa-undo"></i> 重置</button>
        </div>
    </div>
</div>

<!-- 业绩查询分析 -->
<div class="list-card">
    <div class="list-header">
        <div class="list-title"><i class="fas fa-chart-bar"></i> 业绩查询分析</div>
        <button class="list-btn list-btn-success" onclick="exportPerformance()"><i class="fas fa-file-export"></i> 导出业绩证明</button>
    </div>
    <div class="list-body">
        <div class="filter-card">
            <div class="filter-row">
                <div class="filter-item">
                    <label>服务领域</label>
                    <select id="filterDomain">
                        <option value="">全部</option>
                        <option>建筑工地</option>
                        <option>基坑</option>
                        <option>交通</option>
                        <option>玻璃幕墙</option>
                        <option>燃气</option>
                        <option>高空坠物</option>
                        <option>城镇自建房</option>
                        <option>农村自建房</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label>服务类型</label>
                    <select id="filterServiceType">
                        <option value="">全部</option>
                        <option>应急咨询</option>
                        <option>安全评估</option>
                        <option>检测检验</option>
                        <option>隐患排查</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label>审核状态</label>
                    <select id="filterAuditStatus">
                        <option value="">全部</option>
                        <option value="draft">草稿</option>
                        <option value="pending">待审核</option>
                        <option value="approved">已通过</option>
                        <option value="rejected">已驳回</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label>时间范围</label>
                    <select id="filterTimeRange">
                        <option value="">全部</option>
                        <option value="2026">2026年</option>
                        <option value="2025">2025年</option>
                        <option value="last6">近6个月</option>
                        <option value="last3">近3个月</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label>合同金额</label>
                    <select id="filterAmountRange">
                        <option value="">全部</option>
                        <option value="0-50">50万以下</option>
                        <option value="50-100">50-100万</option>
                        <option value="100-200">100-200万</option>
                        <option value="200+">200万以上</option>
                    </select>
                </div>
                <div class="filter-item">
                    <label>验收结论</label>
                    <select id="filterConclusion">
                        <option value="">全部</option>
                        <option>合格</option>
                        <option>基本合格</option>
                        <option>不合格</option>
                        <option>待验收</option>
                    </select>
                </div>
                <div class="filter-item" style="flex:1; min-width:200px; max-width:300px;">
                    <input type="text" id="filterKeyword" placeholder="项目名称 / 委托单位">
                </div>
                <div class="filter-actions">
                    <button class="list-btn list-btn-primary" onclick="applyFilters()"><i class="fas fa-search"></i> 查询</button>
                    <button class="list-btn list-btn-outline" onclick="resetFilters()"><i class="fas fa-undo"></i> 重置</button>
                </div>
            </div>
        </div>

        <div class="chart-grid">
            <div class="chart-card">
                <div class="chart-header"><i class="fas fa-chart-line" style="color: var(--primary);"></i> 业绩增长趋势</div>
                <div class="chart-body"><div id="trendChart" class="chart-box"></div></div>
            </div>
            <div class="chart-card">
                <div class="chart-header"><i class="fas fa-chart-pie" style="color: var(--warning);"></i> 领域业绩分布</div>
                <div class="chart-body"><div id="domainChart" class="chart-box"></div></div>
            </div>
            <div class="chart-card">
                <div class="chart-header"><i class="fas fa-building" style="color: var(--success);"></i> 主要客户分布</div>
                <div class="chart-body"><div id="clientChart" class="chart-box tall"></div></div>
            </div>
        </div>

        <table class="list-table" id="performanceTable">
            <thead>
                <tr>
                    <th>项目名称</th>
                    <th>服务领域</th>
                    <th>服务类型</th>
                    <th>委托单位</th>
                    <th>服务时间</th>
                    <th>合同金额</th>
                    <th>验收结论</th>
                    <th>审核状态</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody id="performanceTableBody">
            </tbody>
        </table>
        <div class="list-pagination" id="pagination"></div>
    </div>
</div>

<script>
(function(){
    var s = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', s);
})();
window.addEventListener('message', function(e) {
    if (e.data && e.data.action === 'setTheme') {
        document.documentElement.setAttribute('data-theme', e.data.theme);
        localStorage.setItem('theme', e.data.theme);
    }
});

// 领域配置
var domains = ['建筑工地','基坑','交通','玻璃幕墙','燃气','高空坠物','城镇自建房','农村自建房'];
var serviceTypes = ['应急咨询','安全评估','检测检验','隐患排查'];
var conclusions = ['合格','基本合格','不合格','待验收'];
var clients = ['奉贤区住房城乡建设委','奉贤区应急管理局','奉贤区交通运输局','奉贤区城管执法局','奉贤区市场监管局','南桥镇人民政府','奉城镇人民政府','庄行镇人民政府','金汇镇人民政府','青村镇人民政府','柘林镇人民政府','四团镇人民政府','海湾镇人民政府','西渡街道办事处','奉浦街道办事处','金海街道办事处','上海市奉贤区燃气管理所','上海市奉贤区建筑管理所','上海市奉贤区市政公路管理所','上海市奉贤区住房保障和房屋管理局'];
var auditStatusMap = {'draft':'草稿','pending':'待审核','approved':'已通过','rejected':'已驳回'};

// 当前文件列表
var selectedFiles = [];

function handleFileSelect(input) {
    if (!input.files || input.files.length === 0) return;
    for (var i = 0; i < input.files.length; i++) {
        selectedFiles.push({
            name: input.files[i].name,
            size: input.files[i].size,
            type: input.files[i].type,
            file: input.files[i]
        });
    }
    renderFileList();
    input.value = '';
}

function renderFileList() {
    var list = document.getElementById('fileList');
    var label = document.getElementById('fileName');
    if (selectedFiles.length === 0) {
        list.innerHTML = '';
        label.textContent = '未选择任何文件';
        return;
    }
    label.textContent = '已选择 ' + selectedFiles.length + ' 个文件';
    list.innerHTML = '';
    selectedFiles.forEach(function(f, idx) {
        var div = document.createElement('div');
        div.className = 'file-list-item';
        div.innerHTML = '<span class="file-name"><i class="fas fa-file"></i> ' + f.name + '</span><span class="remove-file" onclick="removeFile(' + idx + ')" title="移除"><i class="fas fa-times"></i></span>';
        list.appendChild(div);
    });
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderFileList();
}

// 生成模拟数据
function generateData() {
    var data = [];
    var baseNames = {
        '建筑工地': '奉贤区建筑工地安全评估项目',
        '基坑': '奉贤区基坑工程监测项目',
        '交通': '奉贤区道路交通风险评估项目',
        '玻璃幕墙': '奉贤区玻璃幕墙安全检测项目',
        '燃气': '奉贤区燃气管道隐患排查项目',
        '高空坠物': '奉贤区高空坠物风险防控项目',
        '城镇自建房': '奉贤区城镇自建房安全鉴定项目',
        '农村自建房': '奉贤区农村自建房风险普查项目'
    };
    var shanghaiProjects = [
        '南桥镇光明建筑工地安全评估','奉城镇东部路网交通风险评估','庄行镇地下管廊基坑监测','金汇镇世贸商城玻璃幕墙安全检测','青村镇农村自建房风险普查','柘林镇城镇自建房安全鉴定','四团镇燃气管道隐患排查','海湾镇高空坠物风险防控','西渡街道建筑工地安全评估','奉浦街道道路交通风险评估','金海街道基坑工程监测','上海市奉贤区行政服务中心玻璃幕墙安全检测','南桥镇燃气管道隐患排查','奉城镇农村自建房风险普查','庄行镇城镇自建房安全鉴定','金汇镇高空坠物风险防控','青村镇建筑工地安全评估','柘林镇道路交通风险评估','四团镇基坑工程监测','海湾镇玻璃幕墙安全检测','西渡街道燃气管道隐患排查','奉浦街道农村自建房风险普查','金海街道城镇自建房安全鉴定','南桥镇高空坠物风险防控','奉城镇建筑工地安全评估','庄行镇道路交通风险评估','金汇镇基坑工程监测','青村镇玻璃幕墙安全检测','柘林镇燃气管道隐患排查','四团镇农村自建房风险普查','海湾镇城镇自建房安全鉴定','西渡街道高空坠物风险防控','奉浦街道建筑工地安全评估','金海街道道路交通风险评估','南桥镇基坑工程监测','奉城镇玻璃幕墙安全检测','庄行镇燃气管道隐患排查','金汇镇农村自建房风险普查','青村镇城镇自建房安全鉴定','柘林镇高空坠物风险防控','四团镇建筑工地安全评估','海湾镇道路交通风险评估','西渡街道基坑工程监测','奉浦街道玻璃幕墙安全检测','金海街道燃气管道隐患排查','南桥镇农村自建房风险普查','奉城镇城镇自建房安全鉴定','庄行镇高空坠物风险防控','金汇镇建筑工地安全评估','青村镇道路交通风险评估','柘林镇基坑工程监测','四团镇玻璃幕墙安全检测','海湾镇燃气管道隐患排查','西渡街道农村自建房风险普查','奉浦街道城镇自建房安全鉴定','金海街道高空坠物风险防控','南桥镇建筑工地安全评估','奉城镇道路交通风险评估','庄行镇基坑工程监测','金汇镇玻璃幕墙安全检测','青村镇燃气管道隐患排查','柘林镇农村自建房风险普查','四团镇城镇自建房安全鉴定','海湾镇高空坠物风险防控','西渡街道建筑工地安全评估','奉浦街道道路交通风险评估','金海街道基坑工程监测','上海市奉贤区医院玻璃幕墙安全检测','南桥镇燃气管道隐患排查','奉城镇农村自建房风险普查','庄行镇城镇自建房安全鉴定','金汇镇高空坠物风险防控','青村镇建筑工地安全评估','柘林镇道路交通风险评估','四团镇基坑工程监测','海湾镇玻璃幕墙安全检测','西渡街道燃气管道隐患排查','奉浦街道农村自建房风险普查','金海街道城镇自建房安全鉴定','南桥镇高空坠物风险防控','奉城镇建筑工地安全评估'
    ];
    for (var i = 0; i < 86; i++) {
        var domain = domains[Math.floor(Math.random() * domains.length)];
        var type = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        var client = clients[Math.floor(Math.random() * clients.length)];
        var year = Math.random() > 0.35 ? 2026 : 2025;
        var month = Math.floor(Math.random() * 12) + 1;
        var monthStr = month < 10 ? '0' + month : '' + month;
        var startMonth = year + '-' + monthStr;
        var nextMonth = month === 12 ? month : month + 1;
        var endMonthStr = nextMonth < 10 ? '0' + nextMonth : '' + nextMonth;
        var endMonth = year + '-' + endMonthStr;
        var amount = Math.round((Math.random() * 240 + 15) * 10) / 10;
        var day = Math.floor(Math.random() * 20) + 1;
        var dayStr = day < 10 ? '0' + day : '' + day;
        var projectName = i < shanghaiProjects.length ? shanghaiProjects[i] : (baseNames[domain] + '-' + (i + 1));
        var statusArr = ['approved','approved','approved','approved','approved','pending','pending','rejected','draft'];
        var auditStatus = statusArr[Math.floor(Math.random() * statusArr.length)];
        data.push({
            id: i + 1,
            projectName: projectName,
            domain: domain,
            serviceType: type,
            client: client,
            serviceTime: startMonth + '-' + dayStr + ' ~ ' + endMonth + '-' + dayStr,
            startMonth: startMonth,
            amount: amount,
            conclusion: conclusions[Math.floor(Math.random() * conclusions.length)],
            description: '完成相关技术服务，提交报告并验收。',
            deliverables: '排查报告、检测报告、评估意见',
            auditStatus: auditStatus,
            auditRemark: '',
            files: []
        });
    }
    return data;
}

function loadData() {
    var saved = localStorage.getItem('performanceData');
    if (saved) {
        try { return JSON.parse(saved); } catch (e) { return generateData(); }
    }
    return generateData();
}

function saveData() {
    localStorage.setItem('performanceData', JSON.stringify(allData));
}

var allData = loadData();
var filteredData = allData.slice();
var currentPage = 1;
var pageSize = 10;

var trendChart, domainChart, clientChart;

function initCharts() {
    trendChart = echarts.init(document.getElementById('trendChart'));
    domainChart = echarts.init(document.getElementById('domainChart'));
    clientChart = echarts.init(document.getElementById('clientChart'));
    window.addEventListener('resize', function() {
        trendChart.resize();
        domainChart.resize();
        clientChart.resize();
    });
}

function getChartThemeColors() {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        text: isDark ? '#e2e8f0' : '#202124',
        axis: isDark ? '#1e3a5f' : '#dadce0',
        split: isDark ? '#1e3a5f' : '#e8eaed'
    };
}

function updateStats() {
    var total = filteredData.length;
    var amount = filteredData.reduce(function(s, item) { return s + item.amount; }, 0);
    var approved = filteredData.filter(function(item) { return item.auditStatus === 'approved'; }).length;
    var pending = filteredData.filter(function(item) { return item.auditStatus === 'pending'; }).length;
    var rejected = filteredData.filter(function(item) { return item.auditStatus === 'rejected'; }).length;
    var audited = approved + rejected;
    var passRate = audited > 0 ? (approved / audited * 100).toFixed(1) : 0;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statAmount').textContent = amount.toFixed(1);
    document.getElementById('statApproved').textContent = approved;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statRejected').textContent = rejected;
    document.getElementById('statPassRate').textContent = passRate + '%';
}

function updateTrendChart() {
    var monthMap = {};
    filteredData.forEach(function(item) {
        var m = item.startMonth;
        if (!monthMap[m]) monthMap[m] = 0;
        monthMap[m] += item.amount;
    });
    var months = Object.keys(monthMap).sort();
    var values = months.map(function(m) { return monthMap[m].toFixed(1); });
    var colors = getChartThemeColors();

    trendChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: colors.axis } }, axisLabel: { color: colors.text } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: colors.split } }, axisLabel: { color: colors.text } },
        series: [{
            data: values,
            type: 'line',
            smooth: true,
            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset: 0, color: 'rgba(26,115,232,0.3)'}, {offset: 1, color: 'rgba(26,115,232,0.05)'}]) },
            lineStyle: { color: 'var(--primary)', width: 3 },
            itemStyle: { color: 'var(--primary)' }
        }]
    });
}

function updateDomainChart() {
    var domainMap = {};
    filteredData.forEach(function(item) {
        if (!domainMap[item.domain]) domainMap[item.domain] = 0;
        domainMap[item.domain] += item.amount;
    });
    var data = Object.keys(domainMap).map(function(k) { return { value: domainMap[k].toFixed(1), name: k }; });
    var colors = getChartThemeColors();

    domainChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}万元 ({d}%)' },
        legend: { bottom: 0, textStyle: { color: colors.text, fontSize: 11 } },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            data: data,
            label: { show: true, color: colors.text, fontSize: 11 },
            itemStyle: { borderRadius: 6, borderColor: colors.axis, borderWidth: 1 }
        }]
    });
}

function updateClientChart() {
    var clientMap = {};
    filteredData.forEach(function(item) {
        if (!clientMap[item.client]) clientMap[item.client] = 0;
        clientMap[item.client] += item.amount;
    });
    var sorted = Object.keys(clientMap).sort(function(a, b) { return clientMap[b] - clientMap[a]; }).slice(0, 10);
    var data = sorted.map(function(c) { return clientMap[c].toFixed(1); });
    var colors = getChartThemeColors();

    clientChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '8%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', splitLine: { lineStyle: { color: colors.split } }, axisLabel: { color: colors.text } },
        yAxis: { type: 'category', data: sorted, axisLine: { lineStyle: { color: colors.axis } }, axisLabel: { color: colors.text } },
        series: [{
            data: data,
            type: 'bar',
            itemStyle: { color: 'var(--success)', borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: 'right', color: colors.text, fontSize: 11 }
        }]
    });
}

function getAuditStatusClass(status) {
    if (status === 'approved') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'rejected') return 'danger';
    return 'info';
}

function renderTable() {
    var tbody = document.getElementById('performanceTableBody');
    tbody.innerHTML = '';
    var start = (currentPage - 1) * pageSize;
    var end = start + pageSize;
    var pageData = filteredData.slice(start, end);
    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-secondary);padding:24px;">暂无符合条件的数据</td></tr>';
        renderPagination(0);
        return;
    }
    pageData.forEach(function(item) {
        var tr = document.createElement('tr');
        var conclusionClass = 'tag-info';
        if (item.conclusion === '合格') conclusionClass = 'tag-success';
        else if (item.conclusion === '基本合格') conclusionClass = 'tag-warning';
        else if (item.conclusion === '不合格') conclusionClass = 'tag-danger';
        var statusClass = getAuditStatusClass(item.auditStatus);
        var auditActions = '';
        if (item.auditStatus === 'pending') {
            auditActions = '<button class="action-btn approve" onclick="auditItem(' + item.id + ', \'approved\')" title="通过"><i class="fas fa-check"></i></button><button class="action-btn reject" onclick="auditItem(' + item.id + ', \'rejected\')" title="驳回"><i class="fas fa-times"></i></button>';
        }
        tr.innerHTML =
            '<td>' + item.projectName + '</td>' +
            '<td><span class="status-tag primary">' + item.domain + '</span></td>' +
            '<td>' + item.serviceType + '</td>' +
            '<td>' + item.client + '</td>' +
            '<td>' + item.serviceTime + '</td>' +
            '<td style="font-weight: 600; color: var(--primary);">' + item.amount.toFixed(1) + ' 万</td>' +
            '<td><span class="status-tag ' + conclusionClass.replace('tag-', '') + '">' + item.conclusion + '</span></td>' +
            '<td><span class="status-tag ' + statusClass + '">' + auditStatusMap[item.auditStatus] + '</span></td>' +
            '<td>' +
                '<div class="action-btns">' +
                    '<button class="action-btn view" onclick="viewItem(' + item.id + ')" title="查看"><i class="fas fa-eye"></i></button>' +
                    auditActions +
                    '<button class="action-btn delete" onclick="deleteItem(' + item.id + ')" title="删除"><i class="fas fa-trash"></i></button>' +
                '</div>' +
            '</td>';
        tbody.appendChild(tr);
    });
    renderPagination(Math.ceil(filteredData.length / pageSize) || 1);
}

function renderPagination(totalPages) {
    var container = document.getElementById('pagination');
    if (!container) return;
    var html = '<span class="page-info">共 ' + filteredData.length + ' 条</span>';
    html += '<button class="page-btn" ' + (currentPage === 1 || totalPages === 0 ? 'disabled' : '') + ' onclick="goPerformancePage(' + (currentPage - 1) + ')">上一页</button>';
    for (var i = 1; i <= totalPages; i++) {
        html += '<button class="page-btn ' + (i === currentPage ? 'active' : '') + '" onclick="goPerformancePage(' + i + ')" ' + (i === currentPage ? 'disabled' : '') + '>' + i + '</button>';
    }
    html += '<button class="page-btn" ' + (currentPage === totalPages || totalPages === 0 ? 'disabled' : '') + ' onclick="goPerformancePage(' + (currentPage + 1) + ')">下一页</button>';
    container.innerHTML = html;
}

function goPerformancePage(page) {
    var totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable();
}

function applyFilters() {
    var domain = document.getElementById('filterDomain').value;
    var type = document.getElementById('filterServiceType').value;
    var auditStatus = document.getElementById('filterAuditStatus').value;
    var timeRange = document.getElementById('filterTimeRange').value;
    var amountRange = document.getElementById('filterAmountRange').value;
    var conclusion = document.getElementById('filterConclusion').value;
    var keyword = document.getElementById('filterKeyword').value.trim().toLowerCase();

    filteredData = allData.filter(function(item) {
        if (domain && item.domain !== domain) return false;
        if (type && item.serviceType !== type) return false;
        if (auditStatus && item.auditStatus !== auditStatus) return false;
        if (conclusion && item.conclusion !== conclusion) return false;
        if (keyword && item.projectName.toLowerCase().indexOf(keyword) === -1 && item.client.toLowerCase().indexOf(keyword) === -1) return false;
        if (timeRange) {
            if (timeRange === '2026' && !item.startMonth.startsWith('2026')) return false;
            if (timeRange === '2025' && !item.startMonth.startsWith('2025')) return false;
            if (timeRange === 'last6' && item.startMonth < '2026-01') return false;
            if (timeRange === 'last3' && item.startMonth < '2026-04') return false;
        }
        if (amountRange) {
            if (amountRange === '0-50' && item.amount >= 50) return false;
            if (amountRange === '50-100' && (item.amount < 50 || item.amount > 100)) return false;
            if (amountRange === '100-200' && (item.amount < 100 || item.amount > 200)) return false;
            if (amountRange === '200+' && item.amount < 200) return false;
        }
        return true;
    });

    currentPage = 1;
    updateAll();
}

function resetFilters() {
    document.getElementById('filterDomain').value = '';
    document.getElementById('filterServiceType').value = '';
    document.getElementById('filterAuditStatus').value = '';
    document.getElementById('filterTimeRange').value = '';
    document.getElementById('filterAmountRange').value = '';
    document.getElementById('filterConclusion').value = '';
    document.getElementById('filterKeyword').value = '';
    filteredData = allData.slice();
    currentPage = 1;
    updateAll();
}

function changePage(delta) {
    var totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    var newPage = currentPage + delta;
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    renderTable();
}

function updateAll() {
    updateStats();
    updateTrendChart();
    updateDomainChart();
    updateClientChart();
    renderTable();
}

function collectFormData() {
    var time = document.getElementById('inputServiceTime').value;
    var parts = time.split('~');
    var startMonth = parts[0] ? parts[0].trim() : '2026-01';
    return {
        projectName: document.getElementById('inputProjectName').value.trim(),
        client: document.getElementById('inputClient').value.trim(),
        domain: document.getElementById('inputDomain').value,
        serviceType: document.getElementById('inputServiceType').value,
        serviceTime: time,
        startMonth: startMonth,
        amount: parseFloat(document.getElementById('inputAmount').value) || 0,
        conclusion: document.getElementById('inputConclusion').value,
        description: document.getElementById('inputDesc').value,
        deliverables: document.getElementById('inputDeliverables').value,
        files: selectedFiles.map(function(f) { return f.name; })
    };
}

function validateForm(data) {
    if (!data.projectName || !data.client) {
        alert('请填写项目名称和委托单位');
        return false;
    }
    return true;
}

function saveDraft() {
    var data = collectFormData();
    var recordId = document.getElementById('recordId').value;
    if (!recordId) {
        var newId = Date.now();
        data.id = newId;
        data.auditStatus = 'draft';
        data.auditRemark = '';
        allData.unshift(data);
    } else {
        var idx = allData.findIndex(function(item) { return item.id == recordId; });
        if (idx >= 0) {
            data.id = parseInt(recordId);
            data.auditStatus = allData[idx].auditStatus;
            data.auditRemark = allData[idx].auditRemark;
            allData[idx] = data;
        }
    }
    saveData();
    applyFilters();
    alert('草稿已保存');
}

function submitPerformance() {
    var data = collectFormData();
    if (!validateForm(data)) return;
    var recordId = document.getElementById('recordId').value;
    if (!recordId) {
        data.id = Date.now();
    } else {
        data.id = parseInt(recordId);
    }
    data.auditStatus = 'pending';
    data.auditRemark = '';
    if (recordId) {
        var idx = allData.findIndex(function(item) { return item.id == recordId; });
        if (idx >= 0) allData[idx] = data;
    } else {
        allData.unshift(data);
    }
    saveData();
    resetForm();
    applyFilters();
    alert('业绩数据已提交，进入审核中心。');
}

function auditItem(id, status) {
    var idx = allData.findIndex(function(item) { return item.id === id; });
    if (idx < 0) return;
    var item = allData[idx];
    item.auditStatus = status;
    item.auditRemark = status === 'approved' ? '审核通过，符合业绩认定标准。' : '材料不完整，请补充相关证明材料。';
    saveData();
    applyFilters();
}

function deleteItem(id) {
    if (!confirm('确定删除该业绩记录？')) return;
    var idx = allData.findIndex(function(item) { return item.id === id; });
    if (idx < 0) return;
    allData.splice(idx, 1);
    saveData();
    applyFilters();
}

function viewItem(id) {
    var item = allData.find(function(i) { return i.id === id; });
    if (!item) return;
    document.getElementById('recordId').value = item.id;
    document.getElementById('inputProjectName').value = item.projectName;
    document.getElementById('inputClient').value = item.client;
    document.getElementById('inputDomain').value = item.domain;
    document.getElementById('inputServiceType').value = item.serviceType;
    document.getElementById('inputServiceTime').value = item.serviceTime;
    document.getElementById('inputAmount').value = item.amount;
    document.getElementById('inputConclusion').value = item.conclusion;
    document.getElementById('inputDesc').value = item.description || '';
    document.getElementById('inputDeliverables').value = item.deliverables || '';
    selectedFiles = (item.files || []).map(function(name) { return { name: name }; });
    renderFileList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('recordId').value = '';
    document.getElementById('inputProjectName').value = '';
    document.getElementById('inputClient').value = '';
    document.getElementById('inputDomain').value = domains[0];
    document.getElementById('inputServiceType').value = serviceTypes[0];
    document.getElementById('inputServiceTime').value = '';
    document.getElementById('inputAmount').value = '';
    document.getElementById('inputConclusion').value = conclusions[0];
    document.getElementById('inputDesc').value = '';
    document.getElementById('inputDeliverables').value = '';
    selectedFiles = [];
    renderFileList();
}

function exportPerformance() {
    var approved = filteredData.filter(function(item) { return item.auditStatus === 'approved'; });
    alert('导出功能：正在生成业绩证明报告（共 ' + approved.length + ' 条已通过记录）。');
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initCharts();
    updateAll();
});
</script>
</body>
</html>
'''

with open(p, 'w', encoding='utf-8') as f:
    f.write(html)
print('written', len(html), 'chars')
print('size', os.path.getsize(p))
