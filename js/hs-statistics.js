
        const baseData = (() => {
            const recs = getAllHouseRecords();
            return recs.map(r => ({
                no: r.no,
                name: r.name,
                street: r.street,
                address: r.address,
                category: r.category,
                year: r.year,
                risk: r.risk,
                owner: r.owner,
                community: r.community,
                houseType: r.houseType,
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
                    const fund = fundPer + Math.round((Math.random() - 0.5) * 10000);
                    const status = house.completeStatus === '已完成' ? '已完成' : (house.completeStatus === '整治中' ? '进行中' : '未开工');
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
            danger: { label: '重大', color: '#d93025' },
            major: { label: '较大', color: '#f57c00' },
            warning: { label: '一般', color: '#f9ab00' },
            safe: { label: '低', color: '#1a73e8' }
        };

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
            return d.toISOString().slice(0, 10);
        }

        function getFilteredData() {
            const street = document.getElementById('streetFilter').value;
            const risk = document.getElementById('riskFilter').value;
            return baseData.filter(item => {
                return (!street || item.street === street) && (!risk || item.risk === risk);
            });
        }

        function updateSummary(data) {
            document.getElementById('totalCount').textContent = data.length;
            document.getElementById('dangerCount').textContent = data.filter(i => i.risk === 'danger').length;
            document.getElementById('warningCount').textContent = data.filter(i => i.risk === 'major' || i.risk === 'warning').length;
            document.getElementById('safeCount').textContent = data.filter(i => i.risk === 'safe').length;
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
            const order = ['danger', 'major', 'warning', 'safe'];
            const tbody = document.querySelector('#riskTable tbody');
            tbody.innerHTML = order.map(risk => {
                const count = data.filter(i => i.risk === risk).length;
                const pct = ((count / total) * 100).toFixed(1) + '%';
                const tagClass = risk === 'danger' ? 'tag-danger' : risk === 'major' ? 'tag-warning' : risk === 'warning' ? 'tag-warning' : 'tag-safe';
                return `<tr><td>${riskMap[risk].label}</td><td>${count}</td><td>${pct}</td><td><span class="tag ${tagClass}">${riskMap[risk].label}</span></td></tr>`;
            }).join('');
        }

        function renderRiskTable(data) {
            const total = data.length || 1;
            const order = ['danger', 'major', 'warning', 'safe'];
            const tbody = document.querySelector('#riskTable tbody');
            tbody.innerHTML = order.map(risk => {
                const count = data.filter(i => i.risk === risk).length;
                const pct = ((count / total) * 100).toFixed(1) + '%';
                const tagClass = risk === 'danger' ? 'tag-danger' : risk === 'major' ? 'tag-warning' : risk === 'warning' ? 'tag-warning' : 'tag-safe';
                return `<tr><td>${riskMap[risk].label}</td><td>${count}</td><td>${pct}</td><td><span class="tag ${tagClass}">${riskMap[risk].label}</span></td></tr>`;
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
                    const controlled = done && Math.random() > 0.15;
                    const effectIdx = controlled ? 0 : (Math.random() > 0.5 ? 1 : 3);
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
            return total ? ((n / total) * 100).toFixed(1) + '%' : '0.0%';
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
            const doneRates = types.map(t => (doneMap[t] || 0) / typeMap[t] * 100);
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
            const doneRates = areas.map(a => (doneMap[a] || 0) / areaMap[a] * 100);
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
            const doneRates = persons.map(p => (doneMap[p] || 0) / personMap[p] * 100);
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
            const goodRates = types.map(t => (typeEffect[t].good / typeEffect[t].total) * 100);
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
                const p = ((count / total) * 100).toFixed(1) + '%';
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
            const street = document.getElementById('streetFilter').value;
            const risk = document.getElementById('riskFilter').value;
            const filteredHouses = baseData.filter(item => {
                return (!street || item.street === street) && (!risk || item.risk === risk);
            });
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
                    data: types.map((t, i) => Math.round((doneCounts[i] / counts[i]) * 1000) / 10), type: 'bar',
                    itemStyle: { color: '#1e8e3e', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#projectTypeTable tbody');
            tbody.innerHTML = types.map((t, i) => {
                const rate = counts[i] ? ((doneCounts[i] / counts[i]) * 100).toFixed(1) + '%' : '0.0%';
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
                    data: companies.map((c, i) => counts[i] ? Math.round((doneCounts[i] / counts[i]) * 1000) / 10 : 0), type: 'bar',
                    itemStyle: { color: '#1e8e3e', borderRadius: [4, 4, 0, 0] },
                    label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11 }
                }]
            });
            const tbody = document.querySelector('#projectCompanyTable tbody');
            tbody.innerHTML = companies.map((c, i) => {
                const rate = counts[i] ? ((doneCounts[i] / counts[i]) * 100).toFixed(1) + '%' : '0.0%';
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
                const p = ((counts[i] / total) * 100).toFixed(1) + '%';
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
                const headers = ['变更编号', '房屋编号', '房屋名称', '街镇', '风险等级', '措施类型', '责任人', '责任单位', '是否完成', '是否有效控制', '效果评估', '变更次数'];
                const rows = records.map(r => [r.id, r.houseNo, r.houseName, r.street, riskMap[r.risk].label, r.measureType, r.responsiblePerson, r.responsibleDept, r.done ? '是' : '否', r.controlled ? '是' : '否', r.effectEvaluation, r.changeCount]);
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
                const headers = ['工程编号', '房屋编号', '房屋名称', '街镇', '措施类型', '施工单位', '资金(元)', '工程状态', '开工日期'];
                const rows = records.map(r => [r.id, r.houseNo, r.houseName, r.street, r.type, r.company, r.fund, r.status, r.startDate]);
                const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = '工程措施统计.csv';
                link.click();
                return;
            }
            const data = getFilteredData();
            const headers = ['编号', '名称', '街镇', '地址', '结构类型', '建成年代', '风险等级', '产权人'];
            const rows = data.map(i => [i.no, i.name, i.street, i.address, categoryMap[i.category], i.year, riskMap[i.risk].label, i.owner]);
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
            const completionRate = totalTask ? Math.round((doneTask / totalTask) * 1000) / 10 : 0;
            const fundUsageRate = fundTotal ? Math.round((fundUsed / fundTotal) * 1000) / 10 : 0;
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
            const config = getReportConfig();
            currentReportConfig = config;
            let data = getFilteredData();
            data = filterByDate(data, config.start, config.end);
            let rows = computeDimensionData(data, config.dimension);
            rows = sortReportData(rows, config.sort);
            currentReportData = rows;
            document.getElementById('reportPeriodLabel').textContent = `${formatDate(config.start)} 至 ${formatDate(config.end)} · ${rows.length} 条`;
            renderReport(rows, config);
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
            totalRow.completionRate = totalRow.totalTask ? Math.round((totalRow.doneTask / totalRow.totalTask) * 1000) / 10 : 0;
            totalRow.fundUsageRate = totalRow.fundTotal ? Math.round((totalRow.fundUsed / totalRow.fundTotal) * 1000) / 10 : 0;

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

            container.innerHTML = headerHtml + kpiHtml + tableHtml + chartsHtml;

            setTimeout(() => {
                if (chartTypes.includes('bar')) renderReportBar(rows, config);
                if (chartTypes.includes('pie')) renderReportPie(rows, config);
                if (chartTypes.includes('line')) renderReportLine(rows, config);
            }, 0);
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
                data = Object.entries(riskCounts).map(([k, v]) => ({ name: riskMap[k].label, value: v }));
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
        function exportReport() {
            if (!currentReportData.length) {
                alert('请先生成报表');
                return;
            }
            const format = prompt('请选择导出格式：1-CSV 2-Excel 3-Word 4-PDF', '1');
            if (!format) return;
            switch (format.trim()) {
                case '1': exportReportCSV(); break;
                case '2': exportReportExcel(); break;
                case '3': exportReportWord(); break;
                case '4': exportReportPDF(); break;
                default: alert('请输入 1-4 选择格式');
            }
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
            downloadBlob(blob, '统计报表.csv');
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
            downloadBlob(blob, '统计报表.xls');
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
            downloadBlob(blob, '统计报表.doc');
        }

        function exportReportPDF() {
            const visible = reportHeaders.filter(h => h.visible);
            const headers = visible.map(h => h.label);
            const rows = currentReportData.map(r => visible.map(h => {
                if (h.key === 'completionRate' || h.key === 'fundUsageRate') return (r[h.key] || 0) + '%';
                return r[h.key] !== undefined ? r[h.key] : '';
            }));
            const jsPDF = window.jspdf && window.jspdf.jsPDF;
            if (typeof jsPDF === 'undefined') {
                alert('PDF 导出需要引入 jsPDF 库，当前以 CSV 方式导出。');
                exportReportCSV();
                return;
            }
            const pdf = new jsPDF('l', 'pt', 'a4');
            pdf.text('统计报表', 14, 20);
            if (pdf.autoTable) {
                pdf.autoTable({ head: [headers], body: rows, startY: 30, styles: { fontSize: 9 } });
            } else {
                let y = 40;
                headers.forEach((h, i) => { pdf.text(h, 14 + i * 80, y); });
                y += 15;
                rows.forEach(row => { row.forEach((c, i) => { pdf.text(String(c), 14 + i * 80, y); }); y += 12; });
            }
            pdf.save('统计报表.pdf');
        }

        function downloadBlob(blob, filename) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
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
            updateStats();
            window.addEventListener('resize', () => {
                Object.values(charts).forEach(c => c.resize());
                Object.values(reportCharts).forEach(c => c && c.resize());
            });
        }

        init();
    