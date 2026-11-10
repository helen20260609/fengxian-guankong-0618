
        // 基础数据：农村房屋档案 + 异步合并城镇房屋档案
        let baseData = (() => {
            const recs = getAllHouseRecords();
            return recs.filter(r => (r.houseType || '') !== '城镇自建房').map(r => ({
                no: r.no,
                name: r.name,
                street: r.street,
                address: r.address,
                category: r.category,
                year: r.year,
                risk: r.risk,
                owner: r.owner,
                community: r.community,
                houseType: '农村自建房',
                rectDeadline: r.rectDeadline,
                completeDate: r.completeDate,
                completeStatus: r.governStatus,
                manageMeasure: r.manageMeasure,
                projectMeasure: r.projectMeasure,
                totalTask: r.totalTask,
                doneTask: r.doneTask,
                fundUsed: r.fundUsed,
                fundTotal: r.fundTotal,
                overdue: r.overdue,
                lat: r.lat,
                lng: r.lng
            }));
        })();

        // 异步加载城镇自建房数据（隔离加载，避免全局函数名冲突）
        (function loadUrbanData() {
            fetch('../js/urban-house-arch-data.js')
                .then(res => res.text())
                .then(code => {
                    const factory = new Function(code + ';return { initHouseArchSeed: initHouseArchSeed, getAllHouseRecords: getAllHouseRecords };');
                    const urbanAPI = factory();
                    urbanAPI.initHouseArchSeed();
                    const urbanRecs = urbanAPI.getAllHouseRecords().map(r => ({
                        no: r.no,
                        name: r.name,
                        street: r.street,
                        address: r.address,
                        category: r.category,
                        year: r.year,
                        risk: r.risk,
                        owner: r.owner,
                        community: r.community,
                        houseType: '城镇自建房',
                        rectDeadline: r.rectDeadline,
                        completeDate: r.completeDate,
                        completeStatus: r.governStatus,
                        manageMeasure: r.manageMeasure,
                        projectMeasure: r.projectMeasure,
                        totalTask: r.totalTask,
                        doneTask: r.doneTask,
                        fundUsed: r.fundUsed,
                        fundTotal: r.fundTotal,
                        overdue: r.overdue,
                        lat: r.lat,
                        lng: r.lng
                    }));
                    baseData = baseData.concat(urbanRecs);
                    updateCategoryCounts();
                    updateStats();
                })
                .catch(err => console.error('加载城镇自建房数据失败:', err));
        })();

        const projectTypeNames = ['结构加固', '屋面修缮', '基础加固', '墙体修复', '排水改造', '电气改造', '消防改造'];
        const projectCompanyNames = ['上海建工集团', '奉贤城建公司', '华建工程公司', '东方建设集团', ' municipal engineering 公司'];
        const projectTypeMap = {
            '结构加固': '结构加固',
            '屋面修缮': '屋面修缮',
            '基础加固': '基础加固',
            '墙体修复': '墙体修复',
            '排水改造': '排水改造',
            '电气改造': '电气改造',
            '消防改造': '消防改造'
        };

        function generateProjectRecords() {
            const records = [];
            baseData.forEach(house => {
                const n = house.projectMeasure || 0;
                if (n <= 0) return;
                const types = [];
                while (types.length < n) {
                    const t = projectTypeNames[(types.length + house.no.length) % projectTypeNames.length];
                    if (!types.includes(t)) types.push(t);
                }
                const fundPer = house.projectMeasure > 0 ? Math.round(house.fundTotal / house.projectMeasure) : 0;
                types.forEach((type, idx) => {
                    const company = projectCompanyNames[(house.no.length + idx) % projectCompanyNames.length];
                    const fund = fundPer + Math.round(((house.no.charCodeAt(0) + house.no.charCodeAt(house.no.length-1)) % 100 - 50) * 100);
                    const status = house.completeStatus === '已治理' ? '已完成' : (house.completeStatus === '整治中' ? '进行中' : '未开工');
                    records.push({
                        id: house.no + '-P' + (idx + 1),
                        houseNo: house.no,
                        houseName: house.name,
                        street: house.street,
                        type: type,
                        company: company,
                        fund: fund,
                        status: status,
                        startDate: house.completeDate || '2025-01-01',
                        isDone: status === '已完成'
                    });
                });
            });
            return records;
        }

        let projectRecords = generateProjectRecords();
        let currentProjectTab = 'type';

        const riskMap = {
            danger: { label: '第三类', color: '#d93025' },
            major: { label: '第三类', color: '#e8710a' },
            warning: { label: '第二类', color: '#f9ab00' },
            safe: { label: '第一类', color: '#1a73e8' }
        };
        // 按当前 category 动态返回风险标签（城镇四级口径 / 农村三类口径）
        function getRiskLabel(code, houseType) {
            const isUrban = houseType === '城镇自建房' || (!houseType && window.hsStatsCategory === '城镇自建房');
            const urbanMap = { danger: '疑似危房', major: '疑似严重损坏房', warning: '疑似一般损坏房', safe: '完好房（基本完好房）' };
            const ruralMap = { danger: '第三类', major: '第三类', warning: '第二类', safe: '第一类' };
            return (isUrban ? urbanMap : ruralMap)[code] || code;
        }
        // 按当前 category 获取 riskMap 的动态版（用于图表 label 等）
        function getDynamicRiskMap() {
            const isUrban = window.hsStatsCategory === '城镇自建房';
            if (isUrban) {
                return {
                    danger: { label: '疑似危房', color: '#d93025' },
                    major: { label: '疑似严重损坏房', color: '#e8710a' },
                    warning: { label: '疑似一般损坏房', color: '#f9ab00' },
                    safe: { label: '完好房（基本完好房）', color: '#1a73e8' }
                };
            }
            return riskMap;
        }

        const houseTypeMap = {
            '农村自建房': '农村自建房',
            '新建住宅': '新建住宅',
            '老旧小区': '老旧小区'
        };

        const categoryMap = {
            '砖混': '砖混结构',
            '砖木': '砖木结构',
            '框架': '框架结构'
        };

        const reportTypeLabels = {
            comprehensive: '综合统计报表',
            weekly: '周报',
            monthly: '月报',
            quarterly: '季报',
            yearly: '年报'
        };

        let charts = {};
        let currentMeasureTab = 'type';
        let reportCharts = {};
        let reportHeaders = [];
        let currentReportData = [];
        let currentReportConfig = {};

        const defaultReportHeaders = [
            { key: 'dimension', label: '统计维度', width: 120, visible: true },
            { key: 'totalTask', label: '整治任务总量', width: 110, visible: true },
            { key: 'doneTask', label: '已完成数量', width: 100, visible: true },
            { key: 'completionRate', label: '整治完成率', width: 100, visible: true },
            { key: 'overdueTask', label: '逾期未整治数', width: 110, visible: true },
            { key: 'manageMeasure', label: '管理措施数量', width: 110, visible: true },
            { key: 'projectMeasure', label: '工程措施数量', width: 110, visible: true },
            { key: 'fundUsed', label: '已使用资金（元）', width: 130, visible: true },
            { key: 'fundTotal', label: '预算资金（元）', width: 130, visible: true },
            { key: 'fundUsageRate', label: '资金执行率', width: 100, visible: true }
        ];

        function cloneHeaders(headers) {
            return headers.map(h => Object.assign({}, h));
        }

        function getYearGroup(year) {
            if (year < 1980) return '1980年以前';
            if (year < 1990) return '1980-1989年';
            if (year < 2000) return '1990-1999年';
            return '2000年以后';
        }

        function groupBy(data, keyFn) {
            const map = {};
            data.forEach(item => {
                const key = keyFn(item);
                map[key] = (map[key] || 0) + 1;
            });
            return map;
        }

        function initFilters() {
            const streetSet = new Set(baseData.map(i => i.street));
            const streetSelect = document.getElementById('streetFilter');
            streetSet.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                streetSelect.appendChild(opt);
            });
            streetSelect.addEventListener('change', () => {
                updateStats();
                const view = document.getElementById('viewFilter').value;
                if (view === 'measure') updateMeasureStats();
                if (view === 'project') updateProjectStats();
            });
            document.getElementById('riskFilter').addEventListener('change', () => {
                updateStats();
                const view = document.getElementById('viewFilter').value;
                if (view === 'measure') updateMeasureStats();
                if (view === 'project') updateProjectStats();
            });
            document.getElementById('viewFilter').addEventListener('change', e => switchView(e.target.value));
            const periodSel = document.getElementById('reportPeriod');
            if (periodSel) periodSel.addEventListener('change', toggleCustomDate);
        }

        function toggleCustomDate() {
            const wrap = document.getElementById('customDateWrap');
            if (!wrap) return;
            wrap.style.display = document.getElementById('reportPeriod').value === 'custom' ? 'flex' : 'none';
        }

        function getReportPeriodDates() {
            const today = new Date();
            const period = document.getElementById('reportPeriod').value;
            let start, end;
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);
            if (period === 'week') {
                const day = today.getDay() || 7;
                start = new Date(today);
                start.setDate(today.getDate() - day + 1);
                start.setHours(0, 0, 0, 0);
                end = endOfDay;
            } else if (period === 'month') {
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = endOfDay;
            } else if (period === 'quarter') {
                const month = today.getMonth();
                const q = Math.floor(month / 3);
                start = new Date(today.getFullYear(), q * 3, 1);
                end = endOfDay;
            } else if (period === 'year') {
                start = new Date(today.getFullYear(), 0, 1);
                end = endOfDay;
            } else {
                start = parseDate(document.getElementById('reportStartDate').value) || new Date('2025-01-01');
                end = parseDate(document.getElementById('reportEndDate').value) || endOfDay;
                end.setHours(23, 59, 59, 999);
            }
            return { start, end, period };
        }

        function parseDate(str) {
            if (!str) return null;
            const d = new Date(str);
            return isNaN(d) ? null : d;
        }

        function formatDate(d) {
            if (!d) return '';
            if (typeof d === 'string') return d.slice(0, 10);
            return d.toISOString().slice(0, 10);
        }

        function getFilteredData() {
            const street = document.getElementById('streetFilter').value;
            const risk = document.getElementById('riskFilter').value;
            const cat = window.hsStatsCategory || '农村自建房';
            return baseData.filter(item => {
                const isUrban = item.houseType === '城镇自建房';
                if (cat === '城镇自建房' && !isUrban) return false;
                if (cat === '农村自建房' && isUrban) return false;
                if (street && item.street !== street) return false;
                if (risk === 'danger') return item.risk === 'danger' || item.risk === 'major';
                if (risk) return item.risk === risk;
                return true;
            });
        }

        function updateSummary(data) {
            document.getElementById('totalCount').textContent = data.length;
            const isUrban = window.hsStatsCategory === '城镇自建房';
            if (isUrban) {
                // 城镇四级：danger 和 major 分开，第4个卡片显示一般损坏房
                document.getElementById('dangerCount').textContent = data.filter(i => i.risk === 'danger').length;
                document.getElementById('warningCount').textContent = data.filter(i => i.risk === 'major').length;
                document.getElementById('safeCount').textContent = data.filter(i => i.risk === 'warning').length;
            } else {
                document.getElementById('dangerCount').textContent = data.filter(i => i.risk === 'danger' || i.risk === 'major').length;
                document.getElementById('warningCount').textContent = data.filter(i => i.risk === 'warning').length;
                document.getElementById('safeCount').textContent = data.filter(i => i.risk === 'safe').length;
            }
        }

        // 按当前 category 更新 summary 卡片标签和 riskFilter 选项
        function updateRiskFilterLabels() {
            const isUrban = window.hsStatsCategory === '城镇自建房';
            // 更新 summary 卡片标签
            const summaryLabels = isUrban
                ? { danger: '疑似危房', warning: '疑似严重损坏房', safe: '疑似一般损坏房' }
                : { danger: '第三类', warning: '第二类', safe: '第一类' };
            const dangerLabel = document.querySelector('#dangerCount')?.closest('.summary-card')?.querySelector('.summary-label');
            const warningLabel = document.querySelector('#warningCount')?.closest('.summary-card')?.querySelector('.summary-label');
            const safeLabel = document.querySelector('#safeCount')?.closest('.summary-card')?.querySelector('.summary-label');
            if (dangerLabel) dangerLabel.textContent = summaryLabels.danger;
            if (warningLabel) warningLabel.textContent = summaryLabels.warning;
            if (safeLabel) safeLabel.textContent = summaryLabels.safe;
            // 切换第4个卡片的 icon 颜色和图标（城镇=疑似一般损坏房 黄色警告 / 农村=第一类 蓝色盾牌）
            const safeIcon = document.querySelector('#safeCount')?.closest('.summary-card')?.querySelector('.summary-icon');
            if (safeIcon) {
                const iconEl = safeIcon.querySelector('i');
                if (isUrban) {
                    safeIcon.className = 'summary-icon gold';
                    if (iconEl) iconEl.className = 'fas fa-exclamation';
                } else {
                    safeIcon.className = 'summary-icon cyan';
                    if (iconEl) iconEl.className = 'fas fa-shield-alt';
                }
            }
            // 更新 riskFilter 选项
            const riskFilter = document.getElementById('riskFilter');
            if (riskFilter) {
                const currentVal = riskFilter.value;
                const options = isUrban
                    ? [['', '全部等级'], ['danger', '疑似危房'], ['major', '疑似严重损坏房'], ['warning', '疑似一般损坏房'], ['safe', '完好房（基本完好房）']]
                    : [['', '全部等级'], ['danger', '第三类'], ['warning', '第二类'], ['safe', '第一类']];
                riskFilter.innerHTML = options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');
                // 恢复之前选中的值（如果还存在）
                if (currentVal && options.some(([v]) => v === currentVal)) {
                    riskFilter.value = currentVal;
                }
            }
        }

        function renderStreetChart(data) {
            const map = groupBy(data, i => i.street);
            const x = Object.keys(map);
            const y = Object.values(map);
            const option = {
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: x, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: [{
                    data: y,
                    type: 'bar',
                    itemStyle: { color: '#1a73e8', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            };
            charts.street.setOption(option);
        }

        function renderStructureChart(data) {
            const map = groupBy(data, i => categoryMap[i.category] || i.category);
            const option = {
                tooltip: { trigger: 'item' },
                legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
                series: [{
                    type: 'pie',
                    radius: ['35%', '60%'],
                    center: ['50%', '42%'],
                    data: Object.entries(map).map(([name, value]) => ({ name, value })),
                    label: { formatter: '{b}\n{c}栋', fontSize: 11, lineHeight: 14 },
                    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }
                }]
            };
            charts.structure.setOption(option);
        }

        function renderYearChart(data) {
            const order = ['1980年以前', '1980-1989年', '1990-1999年', '2000年以后'];
            const map = groupBy(data, i => getYearGroup(i.year));
            const x = order.filter(k => map[k] !== undefined);
            const y = x.map(k => map[k]);
            const option = {
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: x, axisLabel: { interval: 0, fontSize: 11 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: [{
                    data: y,
                    type: 'line',
                    smooth: true,
                    areaStyle: { color: 'rgba(26,115,232,0.15)' },
                    itemStyle: { color: '#1a73e8' },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            };
            charts.year.setOption(option);
        }

        function renderRiskTable(data) {
            const total = data.length || 1;
            const isUrban = window.hsStatsCategory === '城镇自建房';
            // 城镇四级：danger/major/warning/safe 分开；农村三类：danger 合并 major
            const order = isUrban ? ['danger', 'major', 'warning', 'safe'] : ['danger', 'warning', 'safe'];
            const tagMap = { danger: 'tag-danger', major: 'tag-major', warning: 'tag-warning', safe: 'tag-safe' };
            const labelMap = isUrban
                ? { danger: '疑似危房', major: '疑似严重损坏房', warning: '疑似一般损坏房', safe: '完好房（基本完好房）' }
                : { danger: '第三类', major: '第三类', warning: '第二类', safe: '第一类' };
            const tbody = document.querySelector('#riskTable tbody');
            tbody.innerHTML = order.map(risk => {
                let count;
                if (isUrban) {
                    count = data.filter(i => i.risk === risk).length;
                } else {
                    count = risk === 'danger'
                        ? data.filter(i => i.risk === 'danger' || i.risk === 'major').length
                        : data.filter(i => i.risk === risk).length;
                }
                const pct = ((count / total) * 100).toFixed(2) + '%';
                const tagClass = tagMap[risk];
                return `<tr><td><span class="tag ${tagClass}">${labelMap[risk]}</span></td><td>${count}</td><td>${pct}</td></tr>`;
            }).join('');
        }

        // ============ 管理措施统计 ============
        function generateMeasureRecords() {
            const measureTypes = ['停止使用', '停止经营', '封控警示', '人员撤离', '持续监控'];
            const records = [];
            const houses = getFilteredData();
            const riskToMeasure = {
                'danger': ['停止使用', '人员撤离', '持续监控'],
                'major': ['封控警示', '持续监控', '停止使用'],
                'warning': ['持续监控', '停止使用'],
                'safe': ['停止经营', '持续监控']
            };
            const personByStreet = {
                '南桥镇': '李志强',
                '奉城镇': '王建国',
                '四团镇': '张建军',
                '柘林镇': '陈明华',
                '庄行镇': '刘大海',
                '金汇镇': '赵桂花',
                '青村镇': '孙明华',
                '海湾镇': '周志军'
            };
            const effectEvaluations = [
                '风险已有效控制，无新增变形',
                '风险已有效控制，需继续观察',
                '风险部分控制，需加强巡查',
                '风险已有效控制，隐患基本消除',
                '风险已降低，建议定期复查'
            ];
            houses.forEach((h, idx) => {
                const risk = h.risk;
                const types = riskToMeasure[risk] || ['持续监控'];
                const count = 1 + (idx % 3);
                for (let i = 0; i < count; i++) {
                    const mType = types[i % types.length];
                    const done = (risk === 'danger' && i === 0) || (risk === 'major' && i < 2) || (risk === 'warning' && i < 2) || (risk === 'safe' && i < 1);
                    const controlled = done && ((h.no.charCodeAt(0) + h.no.charCodeAt(h.no.length-1)) % 100) > 15;
                    const effectIdx = controlled ? 0 : ((h.no.charCodeAt(0) + h.no.charCodeAt(h.no.length-1)) % 100) > 50 ? 1 : 3;
                    const effect = effectEvaluations[effectIdx % effectEvaluations.length];
                    records.push({
                        id: 'M-' + h.no + '-' + (i + 1),
                        houseNo: h.no,
                        houseName: h.name,
                        street: h.street,
                        risk: h.risk,
                        measureType: mType,
                        responsiblePerson: personByStreet[h.street] || '李志强',
                        responsibleDept: h.street + '城建中心',
                        done: done,
                        controlled: controlled,
                        effectEvaluation: effect,
                        startTime: '2024-07-05',
                        planEndTime: '2024-09-30',
                        changeCount: h.risk === 'danger' ? 1 : 0
                    });
                }
            });
            return records;
        }

        function pct(n, total) {
            return total ? ((n / total) * 100).toFixed(2) + '%' : '0.00%';
        }

        function updateMeasureSummary(records) {
            document.getElementById('measureTotalCount').textContent = records.length;
            document.getElementById('measureDoneCount').textContent = records.filter(r => r.done).length;
            document.getElementById('measureControlCount').textContent = records.filter(r => r.controlled).length;
            document.getElementById('measureChangeCount').textContent = records.reduce((s, r) => s + r.changeCount, 0);
        }

        function renderMeasureTypeCharts(records) {
            const typeMap = groupBy(records, r => r.measureType);
            const types = Object.keys(typeMap);
            const values = Object.values(typeMap);
            const doneMap = {};
            const controlledMap = {};
            records.forEach(r => {
                doneMap[r.measureType] = (doneMap[r.measureType] || 0) + (r.done ? 1 : 0);
                controlledMap[r.measureType] = (controlledMap[r.measureType] || 0) + (r.controlled ? 1 : 0);
            });
            const doneRates = types.map(t => Number(((doneMap[t] || 0) / typeMap[t] * 100).toFixed(2)));
            charts.measureType.setOption({
                tooltip: { trigger: 'item' },
                legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
                series: [{
                    type: 'pie', radius: ['35%', '60%'], center: ['50%', '42%'],
                    data: types.map((t, i) => ({ name: t, value: values[i] })),
                    label: { formatter: '{b}\n{c}条', fontSize: 11, lineHeight: 14 },
                    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }
                }]
            });
            charts.measureTypeFreq.setOption({
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: types, axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: [{
                    data: values, type: 'bar',
                    itemStyle: { color: '#1a73e8', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            });
            charts.measureTypeDone.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: types, axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
                series: [{
                    data: doneRates, type: 'bar', name: '完成率',
                    itemStyle: { color: '#1e8e3e', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#measureTypeTable tbody');
            tbody.innerHTML = types.map(t => {
                const total = typeMap[t];
                const done = doneMap[t] || 0;
                const controlled = controlledMap[t] || 0;
                return `<tr><td>${t}</td><td>${total}</td><td>${done}</td><td>${controlled}</td><td>${pct(done, total)}</td><td>${pct(controlled, total)}</td></tr>`;
            }).join('');
        }

        function renderMeasureAreaCharts(records) {
            const areaMap = groupBy(records, r => r.street);
            const areas = Object.keys(areaMap);
            const values = Object.values(areaMap);
            const doneMap = {}; const controlledMap = {}; const typeMap = {};
            records.forEach(r => {
                doneMap[r.street] = (doneMap[r.street] || 0) + (r.done ? 1 : 0);
                controlledMap[r.street] = (controlledMap[r.street] || 0) + (r.controlled ? 1 : 0);
                typeMap[r.street] = typeMap[r.street] || {};
                typeMap[r.street][r.measureType] = (typeMap[r.street][r.measureType] || 0) + 1;
            });
            const doneRates = areas.map(a => Number(((doneMap[a] || 0) / areaMap[a] * 100).toFixed(2)));
            charts.measureArea.setOption({
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: areas, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: [{
                    data: values, type: 'bar',
                    itemStyle: { color: '#00b4d8', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            });
            const allTypes = ['停止使用', '停止经营', '封控警示', '人员撤离', '持续监控'];
            const series = allTypes.map((t, idx) => ({
                name: t, type: 'bar', stack: 'area',
                data: areas.map(a => typeMap[a][t] || 0),
                label: { show: true, position: 'inside', fontSize: 10, color: '#fff' }
            }));
            charts.measureAreaType.setOption({
                tooltip: { trigger: 'axis' },
                legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
                grid: { left: '3%', right: '4%', bottom: '18%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: areas, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: series
            });
            charts.measureAreaDone.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: areas, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
                series: [{
                    data: doneRates, type: 'bar',
                    itemStyle: { color: '#009688', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#measureAreaTable tbody');
            tbody.innerHTML = areas.map(a => {
                const total = areaMap[a]; const done = doneMap[a] || 0; const controlled = controlledMap[a] || 0;
                return `<tr><td>${a}</td><td>${total}</td><td>${done}</td><td>${controlled}</td><td>${pct(done, total)}</td><td>${pct(controlled, total)}</td></tr>`;
            }).join('');
        }

        function renderMeasurePersonCharts(records) {
            const personMap = groupBy(records, r => r.responsiblePerson);
            const persons = Object.keys(personMap);
            const values = Object.values(personMap);
            const doneMap = {}; const controlledMap = {}; const typeMap = {};
            records.forEach(r => {
                doneMap[r.responsiblePerson] = (doneMap[r.responsiblePerson] || 0) + (r.done ? 1 : 0);
                controlledMap[r.responsiblePerson] = (controlledMap[r.responsiblePerson] || 0) + (r.controlled ? 1 : 0);
                typeMap[r.responsiblePerson] = typeMap[r.responsiblePerson] || {};
                typeMap[r.responsiblePerson][r.measureType] = (typeMap[r.responsiblePerson][r.measureType] || 0) + 1;
            });
            const doneRates = persons.map(p => Number(((doneMap[p] || 0) / personMap[p] * 100).toFixed(2)));
            charts.measurePerson.setOption({
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: persons, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: [{
                    data: values, type: 'bar',
                    itemStyle: { color: '#7c4dff', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            });
            const allTypes = ['停止使用', '停止经营', '封控警示', '人员撤离', '持续监控'];
            const series = allTypes.map((t, idx) => ({
                name: t, type: 'bar', stack: 'person',
                data: persons.map(p => typeMap[p][t] || 0),
                label: { show: true, position: 'inside', fontSize: 10, color: '#fff' }
            }));
            charts.measurePersonType.setOption({
                tooltip: { trigger: 'axis' },
                legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
                grid: { left: '3%', right: '4%', bottom: '18%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: persons, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: series
            });
            charts.measurePersonDone.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: persons, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
                series: [{
                    data: doneRates, type: 'bar',
                    itemStyle: { color: '#ec407a', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#measurePersonTable tbody');
            tbody.innerHTML = persons.map(p => {
                const total = personMap[p]; const done = doneMap[p] || 0; const controlled = controlledMap[p] || 0;
                return `<tr><td>${p}</td><td>${total}</td><td>${done}</td><td>${controlled}</td><td>${pct(done, total)}</td><td>${pct(controlled, total)}</td></tr>`;
            }).join('');
        }

        function renderMeasureEffectCharts(records) {
            const effectMap = groupBy(records, r => r.effectEvaluation);
            const effects = Object.keys(effectMap);
            const values = Object.values(effectMap);
            const typeEffect = {};
            records.forEach(r => {
                typeEffect[r.measureType] = typeEffect[r.measureType] || { total: 0, good: 0 };
                typeEffect[r.measureType].total++;
                if (r.controlled) typeEffect[r.measureType].good++;
            });
            const types = Object.keys(typeEffect);
            const goodRates = types.map(t => Number(((typeEffect[t].good / typeEffect[t].total) * 100).toFixed(2)));
            const changeMap = groupBy(records, r => r.street);
            const areas = Object.keys(changeMap);
            const changeValues = areas.map(a => records.filter(r => r.street === a).reduce((s, r) => s + r.changeCount, 0));
            charts.measureEffect.setOption({
                tooltip: { trigger: 'item' },
                legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } },
                series: [{
                    type: 'pie', radius: ['35%', '60%'], center: ['50%', '42%'],
                    data: effects.map((e, i) => ({ name: e, value: values[i] })),
                    label: { formatter: '{b}\n{c}条', fontSize: 10, lineHeight: 14 },
                    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }
                }]
            });
            charts.measureEffectType.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: types, axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
                series: [{
                    data: goodRates, type: 'bar',
                    itemStyle: { color: '#1a73e8', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 }
                }]
            });
            charts.measureChange.setOption({
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: areas, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: [{
                    data: changeValues, type: 'line', smooth: true,
                    areaStyle: { color: 'rgba(236,64,122,0.15)' },
                    itemStyle: { color: '#ec407a' },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#measureEffectTable tbody');
            const total = records.length || 1;
            tbody.innerHTML = effects.map(e => {
                const count = effectMap[e];
                const p = ((count / total) * 100).toFixed(2) + '%';
                return `<tr><td>${e}</td><td>${count}</td><td>${p}</td><td><span class="tag tag-info">统计</span></td></tr>`;
            }).join('');
        }

        function updateProjectSummary(records) {
            document.getElementById('projectTotalCount').textContent = records.length;
            document.getElementById('projectDoneCount').textContent = records.filter(r => r.isDone).length;
            document.getElementById('projectFundTotal').textContent = records.reduce((s, r) => s + r.fund, 0).toLocaleString();
            document.getElementById('projectCompanyCount').textContent = new Set(records.map(r => r.company)).size;
        }

        function getProjectRecords() {
            const filteredHouses = getFilteredData();
            const validNos = new Set(filteredHouses.map(h => h.no));
            return projectRecords.filter(r => validNos.has(r.houseNo));
        }

        function getProjectFundGroup(fund) {
            if (fund < 30000) return '3万元以下';
            if (fund < 80000) return '3-8万元';
            if (fund < 150000) return '8-15万元';
            return '15万元以上';
        }

        function renderProjectTypeCharts(records) {
            const typeMap = groupBy(records, r => r.type);
            const types = Object.keys(typeMap);
            const counts = types.map(t => typeMap[t]);
            const doneCounts = types.map(t => records.filter(r => r.type === t && r.isDone).length);
            const funds = types.map(t => records.filter(r => r.type === t).reduce((s, r) => s + r.fund, 0));
            charts.projectType.setOption({
                tooltip: { trigger: 'item' },
                legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } },
                series: [{
                    type: 'pie', radius: ['35%', '60%'], center: ['50%', '42%'],
                    data: types.map((t, i) => ({ name: t, value: counts[i] })),
                    label: { formatter: '{b}\n{c}条', fontSize: 10, lineHeight: 14 },
                    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }
                }]
            });
            charts.projectTypeFreq.setOption({
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: types, axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: [{
                    data: counts, type: 'bar',
                    itemStyle: { color: '#1a73e8', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            });
            charts.projectTypeDone.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: types, axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
                series: [{
                    data: types.map((t, i) => Number(((doneCounts[i] / counts[i]) * 100).toFixed(2))), type: 'bar',
                    itemStyle: { color: '#1e8e3e', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#projectTypeTable tbody');
            tbody.innerHTML = types.map((t, i) => {
                const rate = counts[i] ? ((doneCounts[i] / counts[i]) * 100).toFixed(2) + '%' : '0.00%';
                return `<tr><td>${t}</td><td>${counts[i]}</td><td>${doneCounts[i]}</td><td>${funds[i].toLocaleString()}</td><td>${rate}</td></tr>`;
            }).join('');
        }

        function renderProjectCompanyCharts(records) {
            const companyMap = groupBy(records, r => r.company);
            const companies = Object.keys(companyMap);
            const counts = companies.map(c => companyMap[c]);
            const doneCounts = companies.map(c => records.filter(r => r.company === c && r.isDone).length);
            const funds = companies.map(c => records.filter(r => r.company === c).reduce((s, r) => s + r.fund, 0));
            charts.projectCompany.setOption({
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: companies, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', minInterval: 1 },
                series: [{
                    data: counts, type: 'bar',
                    itemStyle: { color: '#1a73e8', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            });
            const typeByCompany = {};
            records.forEach(r => { typeByCompany[r.company] = typeByCompany[r.company] || {}; typeByCompany[r.company][r.type] = (typeByCompany[r.company][r.type] || 0) + 1; });
            const allTypes = [...new Set(records.map(r => r.type))];
            const series = allTypes.map(type => ({
                name: type, type: 'bar', stack: 'total',
                data: companies.map(c => typeByCompany[c] && typeByCompany[c][type] || 0)
            }));
            charts.projectTypeCompany.setOption({
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } },
                grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: companies, axisLabel: { rotate: 25, fontSize: 10, interval: 0 } },
                yAxis: { type: 'value', minInterval: 1 },
                series
            });
            charts.projectCompanyDone.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: companies, axisLabel: { rotate: 25, fontSize: 11, interval: 0 } },
                yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
                series: [{
                    data: companies.map((c, i) => counts[i] ? Number(((doneCounts[i] / counts[i]) * 100).toFixed(2)) : 0), type: 'bar',
                    itemStyle: { color: '#1e8e3e', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#projectCompanyTable tbody');
            tbody.innerHTML = companies.map((c, i) => {
                const rate = counts[i] ? ((doneCounts[i] / counts[i]) * 100).toFixed(2) + '%' : '0.00%';
                return `<tr><td>${c}</td><td>${counts[i]}</td><td>${doneCounts[i]}</td><td>${funds[i].toLocaleString()}</td><td>${rate}</td></tr>`;
            }).join('');
        }

        function renderProjectFundCharts(records) {
            const fundMap = groupBy(records, r => getProjectFundGroup(r.fund));
            const fundGroups = ['3万元以下', '3-8万元', '8-15万元', '15万元以上'];
            const counts = fundGroups.map(g => fundMap[g] || 0);
            const funds = fundGroups.map(g => records.filter(r => getProjectFundGroup(r.fund) === g).reduce((s, r) => s + r.fund, 0));
            charts.projectFund.setOption({
                tooltip: { trigger: 'item' },
                legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 10 } },
                series: [{
                    type: 'pie', radius: ['35%', '60%'], center: ['50%', '42%'],
                    data: fundGroups.map((g, i) => ({ name: g, value: counts[i] })),
                    label: { formatter: '{b}\n{c}条', fontSize: 10, lineHeight: 14 },
                    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }
                }]
            });
            const typeFundMap = {};
            records.forEach(r => { typeFundMap[r.type] = (typeFundMap[r.type] || 0) + r.fund; });
            const types = Object.keys(typeFundMap);
            const typeFunds = types.map(t => typeFundMap[t]);
            charts.projectFundType.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c}元' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: types, axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value' },
                series: [{
                    data: typeFunds, type: 'bar',
                    itemStyle: { color: '#f57c00', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            });
            const monthMap = {};
            records.forEach(r => {
                const month = r.startDate.slice(0, 7);
                monthMap[month] = (monthMap[month] || 0) + r.fund;
            });
            const months = Object.keys(monthMap).sort();
            const monthFunds = months.map(m => monthMap[m]);
            charts.projectFundTrend.setOption({
                tooltip: { trigger: 'axis', formatter: '{b}: {c}元' },
                grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: months, axisLabel: { fontSize: 11 } },
                yAxis: { type: 'value' },
                series: [{
                    data: monthFunds, type: 'line', smooth: true,
                    areaStyle: { color: 'rgba(26,115,232,0.15)' },
                    itemStyle: { color: '#1a73e8' },
                    label: { show: true, position: 'top', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#projectFundTable tbody');
            const total = records.length || 1;
            tbody.innerHTML = fundGroups.map((g, i) => {
                const p = ((counts[i] / total) * 100).toFixed(2) + '%';
                return `<tr><td>${g}</td><td>${counts[i]}</td><td>${funds[i].toLocaleString()}</td><td>${p}</td></tr>`;
            }).join('');
        }

        function updateProjectStats() {
            projectRecords = generateProjectRecords();
            const records = getProjectRecords();
            updateProjectSummary(records);
            renderProjectTypeCharts(records);
            renderProjectCompanyCharts(records);
            renderProjectFundCharts(records);
        }

        function switchProjectTab(tab) {
            currentProjectTab = tab;
            document.querySelectorAll('#projectView .measure-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
            ['type', 'company', 'fund'].forEach(t => {
                document.getElementById('projectChart' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('active', t === tab);
            });
            setTimeout(() => Object.values(charts).forEach(c => c && c.resize()), 50);
        }

        function updateMeasureStats() {
            const records = generateMeasureRecords();
            updateMeasureSummary(records);
            renderMeasureTypeCharts(records);
            renderMeasureAreaCharts(records);
            renderMeasurePersonCharts(records);
            renderMeasureEffectCharts(records);
        }

        function switchMeasureTab(tab) {
            currentMeasureTab = tab;
            document.querySelectorAll('.measure-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
            ['type', 'area', 'person', 'effect'].forEach(t => {
                document.getElementById('measureChart' + t.charAt(0).toUpperCase() + t.slice(1)).classList.toggle('active', t === tab);
            });
            setTimeout(() => {
                Object.values(charts).forEach(c => c.resize());
            }, 50);
        }

        function switchView(view) {
            const houseView = document.getElementById('houseView');
            const measureView = document.getElementById('measureView');
            const projectView = document.getElementById('projectView');
            const reportView = document.getElementById('reportView');
            const btnExport = document.getElementById('btnExport');
            if (houseView) {
                houseView.style.display = 'none';
                houseView.style.flexDirection = '';
                houseView.style.flex = '';
                houseView.style.minHeight = '';
            }
            if (measureView) measureView.style.display = 'none';
            if (projectView) projectView.style.display = 'none';
            if (reportView) reportView.style.display = 'none';
            if (view === 'house') {
                if (houseView) {
                    houseView.style.display = 'flex';
                    houseView.style.flexDirection = 'column';
                    houseView.style.flex = '1';
                    houseView.style.minHeight = '0';
                }
                if (btnExport) btnExport.innerHTML = '<i class="fas fa-download"></i> 导出数据';
                updateStats();
                setTimeout(() => {
                    if (charts.street) charts.street.resize();
                    if (charts.structure) charts.structure.resize();
                    if (charts.year) charts.year.resize();
                }, 50);
            } else if (view === 'measure') {
                if (measureView) measureView.style.display = 'flex';
                if (btnExport) btnExport.innerHTML = '<i class="fas fa-download"></i> 导出数据';
                updateMeasureStats();
                setTimeout(() => Object.values(charts).forEach(c => c.resize()), 50);
            } else if (view === 'project') {
                if (projectView) {
                    projectView.style.display = 'flex';
                    projectView.style.flexDirection = 'column';
                    projectView.style.flex = '1';
                    projectView.style.minHeight = '0';
                }
                if (btnExport) btnExport.innerHTML = '<i class="fas fa-download"></i> 导出工程数据';
                updateProjectStats();
                setTimeout(() => Object.values(charts).forEach(c => c && c.resize()), 50);
            } else if (view === 'report') {
                if (reportView) reportView.style.display = 'flex';
                if (btnExport) btnExport.innerHTML = '<i class="fas fa-file-export"></i> 导出报表';
                initReport();
                setTimeout(() => Object.values(reportCharts).forEach(c => c && c.resize()), 50);
            }
        }

        function updateStats() {
            const data = getFilteredData();
            updateSummary(data);
            renderStreetChart(data);
            renderStructureChart(data);
            renderYearChart(data);
            renderRiskTable(data);
        }

        function exportData() {
            const view = document.getElementById('viewFilter').value;
            if (view === 'report') {
                exportReport();
                return;
            }
            if (view === 'measure') {
                const records = generateMeasureRecords();
                const headers = ['变更编号', '唯一标识', '街镇', '风险等级', '措施类型', '责任人', '责任单位', '是否完成', '是否有效控制', '效果评估', '变更次数'];
                const rows = records.map(r => [r.id, r.houseNo, r.street, getRiskLabel(r.risk, r.houseType), r.measureType, r.responsiblePerson, r.responsibleDept, r.done ? '是' : '否', r.controlled ? '是' : '否', r.effectEvaluation, r.changeCount]);
                const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = '管理措施统计.csv';
                link.click();
                return;
            }
            if (view === 'project') {
                projectRecords = generateProjectRecords();
                const records = getProjectRecords();
                const headers = ['工程编号', '唯一标识', '街镇', '措施类型', '施工单位', '资金(元)', '工程状态', '开工日期'];
                const rows = records.map(r => [r.id, r.houseNo, r.street, r.type, r.company, r.fund, r.status, r.startDate]);
                const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = '工程措施统计.csv';
                link.click();
                return;
            }
            const data = getFilteredData();
            const headers = ['编号', '街镇', '地址', '结构类型', '建成年代', '风险等级', '产权人'];
            const rows = data.map(i => [i.no, i.street, i.address, categoryMap[i.category], i.year, getRiskLabel(i.risk, i.houseType), i.owner]);
            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = '房屋建筑统计.csv';
            link.click();
        }

        // ============ 自定义统计报表生成 ============
        function initReport() {
            document.getElementById('reportStartDate').value = '2025-01-01';
            document.getElementById('reportEndDate').value = new Date().toISOString().slice(0, 10);
            toggleCustomDate();
        }

        function getReportConfig() {
            const type = document.getElementById('reportType').value;
            const period = document.getElementById('reportPeriod').value;
            const dimension = document.getElementById('reportDimension').value;
            const sort = document.getElementById('reportSort').value;
            const metrics = Array.from(document.querySelectorAll('#reportMetrics input:checked')).map(i => i.value);
            const chartTypes = Array.from(document.querySelectorAll('#reportCharts input:checked')).map(i => i.value);
            const { start, end } = getReportPeriodDates();
            return { type, period, dimension, sort, metrics, chartTypes, start, end };
        }

        function filterByDate(data, start, end) {
            return data.filter(item => {
                if (item.completeDate && item.completeDate.trim()) {
                    const d = parseDate(item.completeDate);
                    if (d && d >= start && d <= end) return true;
                }
                if (item.rectDeadline) {
                    const d = parseDate(item.rectDeadline);
                    if (d && d >= start && d <= end) return true;
                }
                return true;
            });
        }

        function computeDimensionData(data, dimension) {
            if (dimension === 'all') {
                const row = aggregateGroup(data, '全部');
                row.dimension = '全部';
                return [row];
            }
            const keyMap = {
                street: 'street',
                community: 'community',
                houseType: 'houseType',
                risk: 'risk'
            };
            const key = keyMap[dimension] || 'street';
            const groups = {};
            data.forEach(item => {
                const k = item[key] || '未知';
                if (!groups[k]) groups[k] = [];
                groups[k].push(item);
            });
            return Object.entries(groups).map(([name, list]) => {
                const row = aggregateGroup(list, name);
                row.dimension = name;
                return row;
            });
        }

        function aggregateGroup(list, name) {
            const totalTask = list.reduce((s, i) => s + (i.totalTask || 0), 0);
            const doneTask = list.reduce((s, i) => s + (i.doneTask || 0), 0);
            const overdueTask = list.filter(i => i.overdue).length;
            const manageMeasure = list.reduce((s, i) => s + (i.manageMeasure || 0), 0);
            const projectMeasure = list.reduce((s, i) => s + (i.projectMeasure || 0), 0);
            const fundUsed = list.reduce((s, i) => s + (i.fundUsed || 0), 0);
            const fundTotal = list.reduce((s, i) => s + (i.fundTotal || 0), 0);
            const riskDistribution = { danger: 0, major: 0, warning: 0, safe: 0 };
            list.forEach(i => { if (i.risk) riskDistribution[i.risk] = (riskDistribution[i.risk] || 0) + 1; });
            const completionRate = totalTask ? Number((doneTask / totalTask * 100).toFixed(2)) : 0;
            const fundUsageRate = fundTotal ? Number((fundUsed / fundTotal * 100).toFixed(2)) : 0;
            return { dimension: name, totalTask, doneTask, completionRate, overdueTask, manageMeasure, projectMeasure, fundUsed, fundTotal, fundUsageRate, riskDistribution };
        }

        function sortReportData(data, sort) {
            const copy = data.slice();
            const map = {
                default: () => 0,
                totalTaskDesc: (a, b) => b.totalTask - a.totalTask,
                completionRateDesc: (a, b) => b.completionRate - a.completionRate,
                overdueTaskAsc: (a, b) => a.overdueTask - b.overdueTask,
                fundUsageDesc: (a, b) => b.fundUsed - a.fundUsed
            };
            return copy.sort(map[sort] || map.default);
        }

        function generateReport() {
            const overlay = document.getElementById('reportProgressOverlay');
            const text = document.getElementById('reportProgressText');
            overlay.classList.add('open');
            const steps = ['数据汇聚中…', '指标计算中…', '图表渲染中…'];
            let i = 0;
            text.textContent = steps[0];
            const timer = setInterval(() => {
                i++;
                if (i < steps.length) {
                    text.textContent = steps[i];
                } else {
                    clearInterval(timer);
                    overlay.classList.remove('open');
                    doGenerateReport('手动生成');
                    showHsToast('报表生成完成，已存入生成历史');
                }
            }, 450);
        }

        function doGenerateReport(genBy) {
            const config = getReportConfig();
            currentReportConfig = config;
            let data = getFilteredData();
            data = filterByDate(data, config.start, config.end);
            let rows = computeDimensionData(data, config.dimension);
            rows = sortReportData(rows, config.sort);
            currentReportData = rows;
            document.getElementById('reportPeriodLabel').textContent = `${formatDate(config.start)} 至 ${formatDate(config.end)} · ${rows.length} 条`;
            renderReport(rows, config);
            document.getElementById('reportExportGroup').style.display = 'flex';
            archiveReport(config, rows, genBy || '手动生成');
        }

        function renderReport(rows, config) {
            const container = document.getElementById('reportPreviewBody');
            container.innerHTML = '';
            const title = reportTypeLabels[config.type] || '统计报表';
            const dimensionLabel = document.getElementById('reportDimension').options[document.getElementById('reportDimension').selectedIndex].text;

            const headerHtml = `<div class="report-title">${title}</div><div class="report-subtitle">统计维度：${dimensionLabel} | 周期：${formatDate(config.start)} 至 ${formatDate(config.end)}</div>`;

            const totalRow = {
                dimension: '合计',
                totalTask: rows.reduce((s, r) => s + r.totalTask, 0),
                doneTask: rows.reduce((s, r) => s + r.doneTask, 0),
                overdueTask: rows.reduce((s, r) => s + r.overdueTask, 0),
                manageMeasure: rows.reduce((s, r) => s + r.manageMeasure, 0),
                projectMeasure: rows.reduce((s, r) => s + r.projectMeasure, 0),
                fundUsed: rows.reduce((s, r) => s + r.fundUsed, 0),
                fundTotal: rows.reduce((s, r) => s + r.fundTotal, 0)
            };
            totalRow.completionRate = totalRow.totalTask ? Number((totalRow.doneTask / totalRow.totalTask * 100).toFixed(2)) : 0;
            totalRow.fundUsageRate = totalRow.fundTotal ? Number((totalRow.fundUsed / totalRow.fundTotal * 100).toFixed(2)) : 0;

            const kpiHtml = `<div class="report-section"><div class="report-section-title"><i class="fas fa-chart-bar"></i> 核心指标</div><div class="report-kpi-grid">
                <div class="report-kpi"><div class="report-kpi-value">${totalRow.totalTask}</div><div class="report-kpi-label">整治任务总量</div></div>
                <div class="report-kpi"><div class="report-kpi-value">${totalRow.completionRate}%</div><div class="report-kpi-label">整治完成率</div></div>
                <div class="report-kpi"><div class="report-kpi-value">${totalRow.overdueTask}</div><div class="report-kpi-label">逾期未整治</div></div>
                <div class="report-kpi"><div class="report-kpi-value">${totalRow.manageMeasure + totalRow.projectMeasure}</div><div class="report-kpi-label">措施总数</div></div>
            </div></div>`;

            let tableHtml = '';
            if (config.metrics.includes('table') || config.metrics.length > 0) {
                const visibleHeaders = reportHeaders.filter(h => h.visible);
                const ths = visibleHeaders.map(h => `<th style="width:${h.width}px">${h.label}</th>`).join('');
                const tds = (row) => `<tr>${visibleHeaders.map(h => {
                    const key = h.key;
                    if (key === 'completionRate' || key === 'fundUsageRate') return `${row[key] || 0}%`;
                    if (key === 'fundUsed' || key === 'fundTotal') return (row[key] || 0).toLocaleString('zh-CN');
                    return row[key] !== undefined ? row[key] : '-';
                }).map(v => `<td>${v}</td>`).join('')}</tr>`;
                tableHtml = `<div class="report-section"><div class="report-section-title"><i class="fas fa-table"></i> 明细数据</div><table class="report-table"><thead><tr>${ths}</tr></thead><tbody>${rows.map(tds).join('')}${rows.length > 1 ? `<tr style="font-weight:600;background:#f7f8fa;">${visibleHeaders.map(h => {
                    if (h.key === 'dimension') return '<td>合计</td>';
                    if (totalRow[h.key] !== undefined) {
                        if (h.key === 'completionRate' || h.key === 'fundUsageRate') return `<td>${totalRow[h.key]}%</td>`;
                        if (h.key === 'fundUsed' || h.key === 'fundTotal') return `<td>${totalRow[h.key].toLocaleString('zh-CN')}</td>`;
                        return `<td>${totalRow[h.key]}</td>`;
                    }
                    return '<td>-</td>';
                }).join('')}</tr>` : ''}</tbody></table></div>`;
            }

            let chartsHtml = '<div class="report-section"><div class="report-section-title"><i class="fas fa-chart-pie"></i> 可视化图表</div>';
            const chartTypes = config.chartTypes;
            if (chartTypes.includes('bar')) chartsHtml += `<div id="reportChartBar" class="report-chart-wrap"></div>`;
            if (chartTypes.includes('pie')) chartsHtml += `<div id="reportChartPie" class="report-chart-wrap"></div>`;
            if (chartTypes.includes('line')) chartsHtml += `<div id="reportChartLine" class="report-chart-wrap"></div>`;
            chartsHtml += '</div>';

            let rankHtml = '';
            if (config.metrics.includes('streetRank') && rows.length > 1) {
                const ranked = rows.slice().sort((a, b) => b.completionRate - a.completionRate);
                const medal = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
                const rateColor = r => r >= 80 ? '#1e8e3e' : r >= 50 ? '#f9a825' : '#d93025';
                rankHtml = `<div class="report-section"><div class="report-section-title"><i class="fas fa-trophy"></i> 街道整治排名（按完成率）</div>
                    <table class="report-table"><thead><tr><th style="width:70px">名次</th><th>街道/维度</th><th>整治任务</th><th>已完成</th><th>完成率</th><th>逾期</th></tr></thead>
                    <tbody>${ranked.map((r, i) => `<tr><td>${medal(i)}</td><td>${r.dimension}</td><td>${r.totalTask}</td><td>${r.doneTask}</td><td style="color:${rateColor(r.completionRate)};font-weight:600;">${r.completionRate}%</td><td>${r.overdueTask}</td></tr>`).join('')}</tbody></table>
                    <div id="reportChartRank" class="report-chart-wrap"></div></div>`;
            }

            container.innerHTML = headerHtml + kpiHtml + rankHtml + tableHtml + chartsHtml;

            setTimeout(() => {
                if (rankHtml) renderReportRank(rows);
                if (chartTypes.includes('bar')) renderReportBar(rows, config);
                if (chartTypes.includes('pie')) renderReportPie(rows, config);
                if (chartTypes.includes('line')) renderReportLine(rows, config);
            }, 0);
        }

        function renderReportRank(rows) {
            const dom = document.getElementById('reportChartRank');
            if (!dom) return;
            if (reportCharts.rank) reportCharts.rank.dispose();
            reportCharts.rank = echarts.init(dom);
            const ranked = rows.slice().sort((a, b) => a.completionRate - b.completionRate);
            reportCharts.rank.setOption({
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                grid: { left: '3%', right: '6%', bottom: '5%', top: '8%', containLabel: true },
                xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
                yAxis: { type: 'category', data: ranked.map(r => r.dimension), axisLabel: { fontSize: 11 } },
                series: [{
                    name: '整治完成率', type: 'bar', barWidth: 16,
                    data: ranked.map(r => ({
                        value: r.completionRate,
                        itemStyle: { color: r.completionRate >= 80 ? '#1e8e3e' : r.completionRate >= 50 ? '#f9a825' : '#d93025', borderRadius: [0, 4, 4, 0] }
                    })),
                    label: { show: true, position: 'right', formatter: '{c}%', fontSize: 11 }
                }]
            });
        }

        function renderReportBar(rows, config) {
            const dom = document.getElementById('reportChartBar');
            if (!dom) return;
            if (reportCharts.bar) reportCharts.bar.dispose();
            reportCharts.bar = echarts.init(dom);
            const metrics = config.metrics.filter(m => ['totalTask', 'doneTask', 'overdueTask', 'manageMeasure', 'projectMeasure'].includes(m));
            const metricLabels = { totalTask: '整治任务', doneTask: '已完成', overdueTask: '逾期', manageMeasure: '管理措施', projectMeasure: '工程措施' };
            const x = rows.map(r => r.dimension);
            const series = (metrics.length ? metrics : ['totalTask']).map(m => ({
                name: metricLabels[m], type: 'bar', data: rows.map(r => r[m] || 0),
                itemStyle: { borderRadius: [4, 4, 0, 0] }
            }));
            reportCharts.bar.setOption({
                tooltip: { trigger: 'axis' }, legend: { bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: x, axisLabel: { rotate: rows.length > 6 ? 30 : 0, fontSize: 11 } },
                yAxis: { type: 'value', minInterval: 1 }, series
            });
        }

        function renderReportPie(rows, config) {
            const dom = document.getElementById('reportChartPie');
            if (!dom) return;
            if (reportCharts.pie) reportCharts.pie.dispose();
            reportCharts.pie = echarts.init(dom);
            let data = [];
            if (config.metrics.includes('riskDistribution')) {
                const riskCounts = { danger: 0, major: 0, warning: 0, safe: 0 };
                rows.forEach(r => { Object.keys(riskCounts).forEach(k => { riskCounts[k] += r.riskDistribution[k] || 0; }); });
                data = Object.entries(riskCounts).map(([k, v]) => ({ name: getDynamicRiskMap()[k].label, value: v }));
            } else if (config.metrics.includes('totalTask')) {
                data = rows.map(r => ({ name: r.dimension, value: r.totalTask }));
            } else {
                data = rows.map(r => ({ name: r.dimension, value: r.totalTask }));
            }
            reportCharts.pie.setOption({
                tooltip: { trigger: 'item' }, legend: { bottom: 0, type: 'scroll' },
                series: [{
                    type: 'pie', radius: ['35%', '60%'], center: ['50%', '42%'], data,
                    label: { formatter: '{b}\n{c}', fontSize: 11 }, itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 }
                }]
            });
        }

        function renderReportLine(rows, config) {
            const dom = document.getElementById('reportChartLine');
            if (!dom) return;
            if (reportCharts.line) reportCharts.line.dispose();
            reportCharts.line = echarts.init(dom);
            const x = rows.map(r => r.dimension);
            const series = [];
            if (config.metrics.includes('totalTask')) series.push({ name: '整治任务', type: 'line', smooth: true, data: rows.map(r => r.totalTask) });
            if (config.metrics.includes('doneTask')) series.push({ name: '已完成', type: 'line', smooth: true, data: rows.map(r => r.doneTask) });
            if (config.metrics.includes('overdueTask')) series.push({ name: '逾期', type: 'line', smooth: true, data: rows.map(r => r.overdueTask) });
            if (!series.length) series.push({ name: '整治任务', type: 'line', smooth: true, data: rows.map(r => r.totalTask) });
            reportCharts.line.setOption({
                tooltip: { trigger: 'axis' }, legend: { bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
                xAxis: { type: 'category', data: x, axisLabel: { rotate: rows.length > 6 ? 30 : 0, fontSize: 11 } },
                yAxis: { type: 'value', minInterval: 1 }, series
            });
        }

        // ============ 自定义表头 ============
        function openReportHeaderConfig() {
            renderHeaderList();
            document.getElementById('reportHeaderModal').classList.add('open');
        }

        function closeReportHeaderConfig() {
            document.getElementById('reportHeaderModal').classList.remove('open');
        }

        function renderHeaderList() {
            const list = document.getElementById('headerList');
            list.innerHTML = reportHeaders.map((h, idx) => `
                <div class="header-list-item" draggable="true" data-index="${idx}">
                    <i class="fas fa-grip-lines drag-handle"></i>
                    <input type="text" value="${h.label}" data-field="label" data-index="${idx}">
                    <input type="number" value="${h.width}" data-field="width" data-index="${idx}" title="列宽">
                    <label><input type="checkbox" ${h.visible ? 'checked' : ''} data-field="visible" data-index="${idx}"> 显示</label>
                </div>
            `).join('');
            bindHeaderDrag();
            list.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', e => {
                    const idx = +e.target.dataset.index;
                    const field = e.target.dataset.field;
                    if (field === 'label') reportHeaders[idx].label = e.target.value;
                    else if (field === 'width') reportHeaders[idx].width = +e.target.value || 100;
                    else if (field === 'visible') reportHeaders[idx].visible = e.target.checked;
                });
            });
        }

        function bindHeaderDrag() {
            let srcIdx = null;
            document.querySelectorAll('#headerList .header-list-item').forEach(item => {
                item.addEventListener('dragstart', e => { srcIdx = +item.dataset.index; item.style.opacity = '0.5'; });
                item.addEventListener('dragend', e => { item.style.opacity = '1'; srcIdx = null; });
                item.addEventListener('dragover', e => e.preventDefault());
                item.addEventListener('drop', e => {
                    e.preventDefault();
                    const dstIdx = +item.dataset.index;
                    if (srcIdx === null || srcIdx === dstIdx) return;
                    const moved = reportHeaders.splice(srcIdx, 1)[0];
                    reportHeaders.splice(dstIdx, 0, moved);
                    renderHeaderList();
                });
            });
        }

        function saveReportHeaders() {
            closeReportHeaderConfig();
            if (currentReportData.length) generateReport();
        }

        function resetReportHeaders() {
            reportHeaders = cloneHeaders(defaultReportHeaders);
            renderHeaderList();
        }

        // ============ 导出报表 ============
        function reportFileName(ext) {
            const t = (currentReportConfig && reportTypeLabels[currentReportConfig.type]) || '统计报表';
            return `${t}_${formatDate(new Date())}.${ext}`;
        }

        function exportReport() {
            if (!currentReportData.length) {
                alert('请先生成报表');
                return;
            }
            exportReportExcel();
        }

        function exportReportCSV() {
            const visible = reportHeaders.filter(h => h.visible);
            const headers = visible.map(h => h.label);
            const rows = currentReportData.map(r => visible.map(h => {
                if (h.key === 'completionRate' || h.key === 'fundUsageRate') return (r[h.key] || 0) + '%';
                return r[h.key] !== undefined ? r[h.key] : '';
            }));
            const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            downloadBlob(blob, reportFileName('csv'));
        }

        function exportReportExcel() {
            const visible = reportHeaders.filter(h => h.visible);
            const headers = visible.map(h => h.label);
            const rows = currentReportData.map(r => visible.map(h => {
                if (h.key === 'completionRate' || h.key === 'fundUsageRate') return (r[h.key] || 0) + '%';
                return r[h.key] !== undefined ? r[h.key] : '';
            }));
            const xml = buildExcelXml(headers, rows);
            const blob = new Blob(['\ufeff' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            downloadBlob(blob, reportFileName('xls'));
        }

        function buildExcelXml(headers, rows) {
            const escapeXml = s => String(s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
            const headerRow = headers.map(h => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('');
            const bodyRows = rows.map(row => `<Row>${row.map(cell => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join('')}</Row>`).join('');
            return `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="统计报表"><Table>
<Row>${headerRow}</Row>
${bodyRows}
</Table></Worksheet>
</Workbook>`;
        }

        function exportReportWord() {
            const visible = reportHeaders.filter(h => h.visible);
            const headers = visible.map(h => h.label);
            const rows = currentReportData.map(r => visible.map(h => {
                if (h.key === 'completionRate' || h.key === 'fundUsageRate') return (r[h.key] || 0) + '%';
                return r[h.key] !== undefined ? r[h.key] : '';
            }));
            const ths = headers.map(h => `<th>${h}</th>`).join('');
            const trs = rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
            const html = `<html><body><h2>统计报表</h2><table border="1" cellspacing="0" cellpadding="6"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
            const blob = new Blob(['\ufeff' + html], { type: 'application/msword;charset=utf-8;' });
            downloadBlob(blob, reportFileName('doc'));
        }

        function exportReportPDF() {
            if (!currentReportData.length) {
                alert('请先生成报表');
                return;
            }
            const t = (currentReportConfig && reportTypeLabels[currentReportConfig.type]) || '统计报表';
            const body = document.getElementById('reportPreviewBody').cloneNode(true);
            body.querySelectorAll('.report-chart-wrap').forEach(el => el.remove());
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
            document.body.appendChild(iframe);
            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${t}</title>
                <style>
                    body { font-family: "Microsoft YaHei", sans-serif; padding: 24px; color: #202124; }
                    .report-title { text-align: center; font-size: 20px; font-weight: 700; margin-bottom: 4px; }
                    .report-subtitle { text-align: center; font-size: 12px; color: #5f6368; margin-bottom: 18px; }
                    .report-section { margin-bottom: 18px; }
                    .report-section-title { font-size: 14px; font-weight: 600; margin-bottom: 10px; padding-left: 8px; border-left: 3px solid #1a73e8; }
                    .report-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                    .report-kpi { border: 1px solid #e8eaed; border-radius: 6px; padding: 12px; text-align: center; }
                    .report-kpi-value { font-size: 20px; font-weight: 700; color: #1a73e8; }
                    .report-kpi-label { font-size: 12px; color: #5f6368; margin-top: 4px; }
                    .report-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    .report-table th, .report-table td { border: 1px solid #e8eaed; padding: 6px 8px; text-align: center; }
                    .report-table th { background: #f7f8fa; }
                </style></head><body>${body.innerHTML}</body></html>`);
            doc.close();
            setTimeout(() => {
                if (!iframe.contentWindow) return;
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => iframe.remove(), 60000);
            }, 300);
            showHsToast('已打开打印视图，可在打印对话框中选择“另存为 PDF”');
        }

        function downloadBlob(blob, filename) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        }

        // ============ 报表子页签 / 提示 ============
        function switchReportPane(pane) {
            document.querySelectorAll('.report-subtab').forEach(t => t.classList.toggle('active', t.dataset.pane === pane));
            document.querySelectorAll('.report-pane').forEach(p => p.classList.remove('active'));
            const target = document.getElementById('reportPane' + pane.charAt(0).toUpperCase() + pane.slice(1));
            if (target) target.classList.add('active');
            if (pane === 'template') renderTemplateList();
            if (pane === 'schedule') renderScheduleList();
            if (pane === 'history') renderHistoryList();
        }

        let hsToastTimer = null;
        function showHsToast(msg) {
            const el = document.getElementById('hsToast');
            document.getElementById('hsToastText').textContent = msg;
            el.classList.add('show');
            if (hsToastTimer) clearTimeout(hsToastTimer);
            hsToastTimer = setTimeout(() => el.classList.remove('show'), 2600);
        }

        function lsRead(key, def) {
            try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; }
        }
        function lsWrite(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
        function nowStr() {
            const d = new Date();
            const p = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
        }
        const hsDimLabels = { all: '全部', street: '按街镇', community: '按社区（村居）', houseType: '按房屋类型', risk: '按风险等级' };
        const hsMetricLabels = { totalTask: '任务总量', doneTask: '已完成', completionRate: '完成率', overdueTask: '逾期数', manageMeasure: '管理措施', projectMeasure: '工程措施', riskDistribution: '等级分布', streetRank: '街道排名', fundUsage: '资金使用' };
        const hsChartLabels = { bar: '柱状图', pie: '饼图', line: '折线图', table: '明细表格' };
        function periodDatesFor(period, startStr, endStr) {
            const today = new Date();
            const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);
            if (period === 'week') { const day = today.getDay() || 7; const s = new Date(today); s.setDate(today.getDate() - day + 1); s.setHours(0, 0, 0, 0); return { start: s, end: endOfDay }; }
            if (period === 'month') return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: endOfDay };
            if (period === 'quarter') { const q = Math.floor(today.getMonth() / 3); return { start: new Date(today.getFullYear(), q * 3, 1), end: endOfDay }; }
            if (period === 'year') return { start: new Date(today.getFullYear(), 0, 1), end: endOfDay };
            const s = parseDate(startStr) || new Date('2025-01-01');
            const e = parseDate(endStr) || endOfDay; e.setHours(23, 59, 59, 999);
            return { start: s, end: e };
        }
        function computeRowsForConfig(cfg) {
            let data = getFilteredData();
            const pd = periodDatesFor(cfg.period, cfg.start, cfg.end);
            data = filterByDate(data, pd.start, pd.end);
            let rows = computeDimensionData(data, cfg.dimension);
            return sortReportData(rows, cfg.sort || 'default');
        }
        function applyReportConfig(cfg) {
            document.getElementById('reportType').value = cfg.type || 'comprehensive';
            document.getElementById('reportPeriod').value = cfg.period || 'year';
            document.getElementById('reportDimension').value = cfg.dimension || 'street';
            document.getElementById('reportSort').value = cfg.sort || 'default';
            document.querySelectorAll('#reportMetrics input').forEach(i => { i.checked = (cfg.metrics || []).includes(i.value); });
            document.querySelectorAll('#reportCharts input').forEach(i => { i.checked = (cfg.chartTypes || []).includes(i.value); });
            if (cfg.period === 'custom') {
                document.getElementById('reportStartDate').value = (cfg.start || '').slice(0, 10);
                document.getElementById('reportEndDate').value = (cfg.end || '').slice(0, 10);
            }
            toggleCustomDate();
        }
        function reviveConfig(cfg) {
            const c = Object.assign({}, cfg);
            if (typeof c.start === 'string') c.start = c.start.slice(0, 10);
            if (typeof c.end === 'string') c.end = c.end.slice(0, 10);
            return c;
        }

        // ============ 模板库 ============
        const HS_TPL_KEY = 'hs_report_templates';
        const hsPresetTemplates = [
            { id: 'TPL-P1', name: '周报 · 按街镇', preset: true, cfg: { type: 'weekly', period: 'week', dimension: 'street', sort: 'completionRateDesc', metrics: ['totalTask', 'doneTask', 'completionRate', 'overdueTask'], chartTypes: ['bar', 'table'] } },
            { id: 'TPL-P2', name: '月报 · 综合指标', preset: true, cfg: { type: 'monthly', period: 'month', dimension: 'street', sort: 'totalTaskDesc', metrics: ['totalTask', 'doneTask', 'completionRate', 'overdueTask', 'manageMeasure', 'projectMeasure', 'riskDistribution', 'streetRank', 'fundUsage'], chartTypes: ['bar', 'pie', 'line', 'table'] } },
            { id: 'TPL-P3', name: '年度总结 · 按房屋类型', preset: true, cfg: { type: 'yearly', period: 'year', dimension: 'houseType', sort: 'totalTaskDesc', metrics: ['totalTask', 'doneTask', 'completionRate', 'manageMeasure', 'projectMeasure', 'fundUsage'], chartTypes: ['bar', 'pie', 'table'] } }
        ];
        function getAllTemplates() { return hsPresetTemplates.concat(lsRead(HS_TPL_KEY, [])); }
        function renderTemplateList() {
            const grid = document.getElementById('tplGrid');
            const list = getAllTemplates();
            grid.innerHTML = list.map(t => {
                const c = t.cfg;
                const meta = `类型：${reportTypeLabels[c.type] || c.type} ｜ 维度：${hsDimLabels[c.dimension] || c.dimension}<br>` +
                    `指标：${(c.metrics || []).map(m => hsMetricLabels[m] || m).join('、') || '默认'}<br>` +
                    `图表：${(c.chartTypes || []).map(x => hsChartLabels[x] || x).join('、') || '默认'}`;
                return `<div class="tpl-card">
                    <div class="tpl-card-name"><i class="fas fa-file-invoice" style="color:var(--primary);"></i> ${t.name} ${t.preset ? '<span class="tpl-badge">预置</span>' : ''}</div>
                    <div class="tpl-card-meta">${meta}</div>
                    <div class="tpl-card-actions">
                        <button class="btn btn-primary" onclick="loadTemplate('${t.id}')"><i class="fas fa-bolt"></i> 加载并生成</button>
                        ${t.preset ? '' : `<button class="btn" onclick="deleteTemplate('${t.id}')"><i class="fas fa-trash"></i> 删除</button>`}
                    </div>
                </div>`;
            }).join('');
        }
        function openTplSaveModal() {
            const cfg = getReportConfig();
            document.getElementById('tplSaveSummary').innerHTML =
                `将保存：${reportTypeLabels[cfg.type]} ｜ ${hsDimLabels[cfg.dimension]} ｜ 指标 ${cfg.metrics.length} 项 ｜ 图表 ${cfg.chartTypes.length} 项 ｜ 排序：${document.getElementById('reportSort').selectedOptions[0].text}`;
            document.getElementById('tplNameInput').value = '';
            document.getElementById('tplSaveModal').classList.add('open');
        }
        function closeTplSaveModal() { document.getElementById('tplSaveModal').classList.remove('open'); }
        function confirmSaveTemplate() {
            const name = document.getElementById('tplNameInput').value.trim();
            if (!name) { alert('请输入模板名称'); return; }
            const cfg = getReportConfig();
            const list = lsRead(HS_TPL_KEY, []);
            list.push({ id: 'TPL-' + Date.now(), name, preset: false, cfg: { type: cfg.type, period: cfg.period, dimension: cfg.dimension, sort: cfg.sort, metrics: cfg.metrics, chartTypes: cfg.chartTypes } });
            lsWrite(HS_TPL_KEY, list);
            closeTplSaveModal();
            showHsToast('模板已保存到模板库');
            renderTemplateList();
        }
        function loadTemplate(id) {
            const t = getAllTemplates().find(x => x.id === id);
            if (!t) return;
            applyReportConfig(reviveConfig(t.cfg));
            switchReportPane('generate');
            generateReport();
        }
        function deleteTemplate(id) {
            if (!confirm('确认删除该模板？')) return;
            lsWrite(HS_TPL_KEY, lsRead(HS_TPL_KEY, []).filter(t => t.id !== id));
            renderTemplateList();
            showHsToast('模板已删除');
        }

        // ============ 定时生成任务 ============
        const HS_SCH_KEY = 'hs_report_schedules';
        function computeNextRun(cycle, from) {
            const base = from ? new Date(from) : new Date();
            const d = new Date(base); d.setHours(8, 0, 0, 0);
            if (d <= base) d.setDate(d.getDate() + 1);
            if (cycle === 'weekly') { while (d.getDay() !== 1) d.setDate(d.getDate() + 1); }
            else if (cycle === 'monthly') { while (d.getDate() !== 1) d.setDate(d.getDate() + 1); }
            else if (cycle === 'quarterly') { while (!(d.getDate() === 1 && d.getMonth() % 3 === 0)) d.setDate(d.getDate() + 1); }
            else if (cycle === 'yearly') { while (!(d.getDate() === 1 && d.getMonth() === 0)) d.setDate(d.getDate() + 1); }
            const p = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} 08:00`;
        }
        function seedSchedules() {
            if (localStorage.getItem(HS_SCH_KEY)) return;
            lsWrite(HS_SCH_KEY, [
                { id: 'SCH-001', name: '农村自建房整治周报', type: 'weekly', cycle: 'weekly', dimension: 'street', enabled: true, lastRun: '2025-06-09 08:00', nextRun: computeNextRun('weekly') },
                { id: 'SCH-002', name: '房屋安全整治月报', type: 'monthly', cycle: 'monthly', dimension: 'street', enabled: true, lastRun: '2025-06-01 08:00', nextRun: computeNextRun('monthly') }
            ]);
        }
        function getSchedules() { return lsRead(HS_SCH_KEY, []); }
        const hsCycleLabels = { weekly: '每周一 08:00', monthly: '每月1日 08:00', quarterly: '每季首月1日 08:00', yearly: '每年1月1日 08:00' };
        function renderScheduleList() {
            const tbody = document.getElementById('scheduleTbody');
            const list = getSchedules();
            if (!list.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-secondary);padding:24px;">暂无定时任务，点击右上角“新增任务”创建</td></tr>'; return; }
            tbody.innerHTML = list.map(s => `<tr>
                <td>${s.name}</td>
                <td>${reportTypeLabels[s.type] || s.type}</td>
                <td>${hsDimLabels[s.dimension] || s.dimension}</td>
                <td>${hsCycleLabels[s.cycle] || s.cycle}</td>
                <td>${s.lastRun || '--'}</td>
                <td>${s.enabled ? (s.nextRun || '--') : '已停用'}</td>
                <td><span class="status-pill ${s.enabled ? 'on' : 'off'}">${s.enabled ? '启用中' : '已停用'}</span></td>
                <td>
                    <button class="btn" style="padding:4px 8px;font-size:12px;" onclick="runScheduleNow('${s.id}')" title="立即生成一次"><i class="fas fa-play"></i> 立即执行</button>
                    <button class="btn" style="padding:4px 8px;font-size:12px;" onclick="toggleSchedule('${s.id}')">${s.enabled ? '停用' : '启用'}</button>
                    <button class="btn" style="padding:4px 8px;font-size:12px;" onclick="deleteSchedule('${s.id}')">删除</button>
                </td>
            </tr>`).join('');
        }
        let editingScheduleId = null;
        function openScheduleModal(id) {
            editingScheduleId = id || null;
            const s = id ? getSchedules().find(x => x.id === id) : null;
            document.getElementById('schName').value = s ? s.name : '';
            document.getElementById('schType').value = s ? s.type : 'weekly';
            document.getElementById('schCycle').value = s ? s.cycle : 'weekly';
            document.getElementById('schDimension').value = s ? s.dimension : 'street';
            document.getElementById('schEnabled').checked = s ? !!s.enabled : true;
            document.getElementById('scheduleModal').classList.add('open');
        }
        function closeScheduleModal() { document.getElementById('scheduleModal').classList.remove('open'); editingScheduleId = null; }
        function saveSchedule() {
            const name = document.getElementById('schName').value.trim();
            if (!name) { alert('请输入任务名称'); return; }
            const list = getSchedules();
            const data = {
                name,
                type: document.getElementById('schType').value,
                cycle: document.getElementById('schCycle').value,
                dimension: document.getElementById('schDimension').value,
                enabled: document.getElementById('schEnabled').checked
            };
            if (editingScheduleId) {
                const s = list.find(x => x.id === editingScheduleId);
                if (s) Object.assign(s, data, { nextRun: computeNextRun(data.cycle) });
            } else {
                list.push(Object.assign({ id: 'SCH-' + Date.now(), lastRun: null, nextRun: computeNextRun(data.cycle) }, data));
            }
            lsWrite(HS_SCH_KEY, list);
            closeScheduleModal();
            renderScheduleList();
            showHsToast('定时任务已保存');
        }
        function toggleSchedule(id) {
            const list = getSchedules();
            const s = list.find(x => x.id === id);
            if (!s) return;
            s.enabled = !s.enabled;
            if (s.enabled) s.nextRun = computeNextRun(s.cycle);
            lsWrite(HS_SCH_KEY, list);
            renderScheduleList();
        }
        function deleteSchedule(id) {
            if (!confirm('确认删除该定时任务？')) return;
            lsWrite(HS_SCH_KEY, getSchedules().filter(s => s.id !== id));
            renderScheduleList();
            showHsToast('定时任务已删除');
        }
        function runScheduleNow(id) {
            const list = getSchedules();
            const s = list.find(x => x.id === id);
            if (!s) return;
            const periodMap = { weekly: 'week', monthly: 'month', quarterly: 'quarter', yearly: 'year', comprehensive: 'year' };
            const cfg = { type: s.type, period: periodMap[s.type] || 'year', dimension: s.dimension, sort: 'default', metrics: ['totalTask', 'doneTask', 'completionRate', 'overdueTask', 'manageMeasure', 'projectMeasure', 'riskDistribution', 'fundUsage'], chartTypes: ['bar', 'pie', 'table'] };
            const rows = computeRowsForConfig(cfg);
            archiveReport(cfg, rows, '定时任务', s.name);
            s.lastRun = nowStr();
            s.nextRun = computeNextRun(s.cycle);
            lsWrite(HS_SCH_KEY, list);
            renderScheduleList();
            showHsToast(`任务「${s.name}」执行完成，报表已存档并通知相关责任人`);
        }

        // ============ 生成历史 ============
        const HS_HIS_KEY = 'hs_report_history';
        function getReportHistory() { return lsRead(HS_HIS_KEY, []); }
        function archiveReport(cfg, rows, genBy, schName) {
            const list = getReportHistory();
            const serialCfg = reviveConfig(cfg);
            if (cfg.start instanceof Date) serialCfg.start = formatDate(cfg.start);
            else if (!cfg.start) serialCfg.start = formatDate(periodDatesFor(cfg.period).start);
            if (cfg.end instanceof Date) serialCfg.end = formatDate(cfg.end);
            else if (!cfg.end) serialCfg.end = formatDate(periodDatesFor(cfg.period).end);
            const done = rows.reduce((s2, r) => s2 + r.doneTask, 0);
            const total = rows.reduce((s2, r) => s2 + r.totalTask, 0);
            list.unshift({
                id: 'RPT-' + Date.now(),
                name: (schName ? schName + ' · ' : '') + (reportTypeLabels[cfg.type] || '统计报表'),
                type: cfg.type, genBy: genBy || '手动生成', genTime: nowStr(),
                periodText: `${serialCfg.start} 至 ${serialCfg.end}`,
                summary: `共 ${rows.length} 个维度分组，任务 ${total} 项，完成 ${done} 项`,
                cfg: serialCfg, rows
            });
            if (list.length > 50) list.length = 50;
            lsWrite(HS_HIS_KEY, list);
        }
        function seedReportHistory() {
            if (localStorage.getItem(HS_HIS_KEY)) return;
            const mk = (type, period, dimension, genBy, genTime, schName) => {
                const cfg = { type, period, dimension, sort: 'default', metrics: ['totalTask', 'doneTask', 'completionRate', 'overdueTask'], chartTypes: ['bar', 'table'] };
                const pd = periodDatesFor(period);
                const rows = computeRowsForConfig(cfg);
                const done = rows.reduce((s2, r) => s2 + r.doneTask, 0);
                const total = rows.reduce((s2, r) => s2 + r.totalTask, 0);
                return { id: 'RPT-SEED-' + genTime.replace(/\D/g, ''), name: (schName ? schName + ' · ' : '') + reportTypeLabels[type], type, genBy, genTime, periodText: `${formatDate(pd.start)} 至 ${formatDate(pd.end)}`, summary: `共 ${rows.length} 个维度分组，任务 ${total} 项，完成 ${done} 项`, cfg: { type, period, dimension, sort: 'default', metrics: cfg.metrics, chartTypes: cfg.chartTypes, start: formatDate(pd.start), end: formatDate(pd.end) }, rows };
            };
            lsWrite(HS_HIS_KEY, [
                mk('weekly', 'week', 'street', '定时任务', '2025-06-09 08:00', '农村自建房整治周报'),
                mk('monthly', 'month', 'street', '定时任务', '2025-06-01 08:00', '房屋安全整治月报'),
                mk('quarterly', 'quarter', 'houseType', '手动生成', '2025-05-28 15:42'),
                mk('yearly', 'year', 'risk', '手动生成', '2025-05-20 10:18')
            ]);
        }
        function seedReportDemoData() { seedSchedules(); seedReportHistory(); }
        function renderHistoryList() {
            const tbody = document.getElementById('historyTbody');
            const list = getReportHistory();
            if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:24px;">暂无生成历史</td></tr>'; return; }
            tbody.innerHTML = list.map(r => `<tr>
                <td>${r.id}</td>
                <td>${r.name}</td>
                <td>${reportTypeLabels[r.type] || r.type}</td>
                <td>${r.periodText}</td>
                <td><span class="tag tag-info">${r.genBy}</span></td>
                <td>${r.genTime}</td>
                <td>
                    <button class="btn" style="padding:4px 8px;font-size:12px;" onclick="viewHistory('${r.id}')"><i class="fas fa-eye"></i> 查看</button>
                    <button class="btn" style="padding:4px 8px;font-size:12px;" onclick="downloadHistoryRec('${r.id}')"><i class="fas fa-file-excel"></i> 导出</button>
                    <button class="btn" style="padding:4px 8px;font-size:12px;" onclick="deleteHistory('${r.id}')">删除</button>
                </td>
            </tr>`).join('');
        }
        function viewHistory(id) {
            const r = getReportHistory().find(x => x.id === id);
            if (!r) return;
            const cfg = reviveConfig(r.cfg);
            applyReportConfig(cfg);
            currentReportConfig = cfg;
            currentReportData = r.rows;
            document.getElementById('reportPeriodLabel').textContent = `${r.periodText} · ${r.rows.length} 条（历史快照 ${r.genTime}）`;
            renderReport(r.rows, cfg);
            document.getElementById('reportExportGroup').style.display = 'flex';
            switchReportPane('generate');
        }
        function downloadHistoryRec(id) {
            const r = getReportHistory().find(x => x.id === id);
            if (!r) return;
            const visible = reportHeaders.filter(h => h.visible);
            const headers = visible.map(h => h.label);
            const rows = r.rows.map(row => visible.map(h => {
                if (h.key === 'completionRate' || h.key === 'fundUsageRate') return (row[h.key] || 0) + '%';
                return row[h.key] !== undefined ? row[h.key] : '';
            }));
            const xml = buildExcelXml(headers, rows);
            const blob = new Blob(['\ufeff' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
            downloadBlob(blob, `${r.name}_${r.genTime.slice(0, 10)}.xls`);
            showHsToast('历史报表已导出');
        }
        function deleteHistory(id) {
            if (!confirm('确认删除该生成记录？')) return;
            lsWrite(HS_HIS_KEY, getReportHistory().filter(r => r.id !== id));
            renderHistoryList();
        }

        function init() {
            reportHeaders = cloneHeaders(defaultReportHeaders);
            charts.street = echarts.init(document.getElementById('chartStreet'));
            charts.structure = echarts.init(document.getElementById('chartStructure'));
            charts.year = echarts.init(document.getElementById('chartYear'));
            setTimeout(() => {
                if (charts.street) charts.street.resize();
                if (charts.structure) charts.structure.resize();
                if (charts.year) charts.year.resize();
            }, 0);
            charts.measureType = echarts.init(document.getElementById('chartMeasureType'));
            charts.measureTypeFreq = echarts.init(document.getElementById('chartMeasureTypeFreq'));
            charts.measureTypeDone = echarts.init(document.getElementById('chartMeasureTypeDone'));
            charts.measureArea = echarts.init(document.getElementById('chartMeasureArea'));
            charts.measureAreaType = echarts.init(document.getElementById('chartMeasureAreaType'));
            charts.measureAreaDone = echarts.init(document.getElementById('chartMeasureAreaDone'));
            charts.measurePerson = echarts.init(document.getElementById('chartMeasurePerson'));
            charts.measurePersonType = echarts.init(document.getElementById('chartMeasurePersonType'));
            charts.measurePersonDone = echarts.init(document.getElementById('chartMeasurePersonDone'));
            charts.measureEffect = echarts.init(document.getElementById('chartMeasureEffect'));
            charts.measureEffectType = echarts.init(document.getElementById('chartMeasureEffectType'));
            charts.measureChange = echarts.init(document.getElementById('chartMeasureChange'));
            charts.projectType = echarts.init(document.getElementById('chartProjectType'));
            charts.projectTypeFreq = echarts.init(document.getElementById('chartProjectTypeFreq'));
            charts.projectTypeDone = echarts.init(document.getElementById('chartProjectTypeDone'));
            charts.projectCompany = echarts.init(document.getElementById('chartProjectCompany'));
            charts.projectTypeCompany = echarts.init(document.getElementById('chartProjectTypeCompany'));
            charts.projectCompanyDone = echarts.init(document.getElementById('chartProjectCompanyDone'));
            charts.projectFund = echarts.init(document.getElementById('chartProjectFund'));
            charts.projectFundType = echarts.init(document.getElementById('chartProjectFundType'));
            charts.projectFundTrend = echarts.init(document.getElementById('chartProjectFundTrend'));
            initFilters();
            initCategoryTabs();
            updateCategoryCounts();
            updateRiskFilterLabels();
            updateStats();
            seedReportDemoData();
            window.addEventListener('resize', () => {
                Object.values(charts).forEach(c => c.resize());
                Object.values(reportCharts).forEach(c => c && c.resize());
            });
        }

        init();

        // =========================================================
        // 农村/城镇自建房分类 TAB
        // =========================================================
        function initCategoryTabs() {
            // 支持 URL 参数 ?category=
            const urlCat = new URLSearchParams(location.search).get('category');
            window.hsStatsCategory = urlCat || '农村自建房';
            document.querySelectorAll('#categoryTabs .category-tab').forEach(tab => {
                const isActive = tab.dataset.category === window.hsStatsCategory;
                tab.classList.toggle('active', isActive);
                tab.addEventListener('click', () => {
                    if (tab.dataset.category === window.hsStatsCategory) return;
                    window.hsStatsCategory = tab.dataset.category;
                    document.querySelectorAll('#categoryTabs .category-tab').forEach(t => {
                        t.classList.toggle('active', t.dataset.category === window.hsStatsCategory);
                    });
                    // 更新风险筛选和汇总卡片标签
                    updateRiskFilterLabels();
                    // 刷新当前视图
                    const view = document.getElementById('viewFilter').value;
                    if (view === 'house') updateStats();
                    else if (view === 'measure') updateMeasureStats();
                    else if (view === 'project') updateProjectStats();
                    else if (view === 'report') initReport();
                    setTimeout(() => {
                        Object.values(charts).forEach(c => c && c.resize());
                        Object.values(reportCharts).forEach(c => c && c.resize());
                    }, 50);
                });
            });
        }

        function updateCategoryCounts() {
            const rural = baseData.filter(d => d.houseType !== '城镇自建房').length;
            const urban = baseData.filter(d => d.houseType === '城镇自建房').length;
            const elR = document.getElementById('countRural');
            const elU = document.getElementById('countUrban');
            if (elR) elR.textContent = rural;
            if (elU) elU.textContent = urban;
        }
    