import re

html = open('e:/风险管控0618/pages/patrol-task-analysis.html', 'rb').read().decode('utf-8', 'ignore')

# 1. 注释 saved from url
html = html.replace('http://192.168.70.210/pages/gas-patrol-analysis.html', 'http://192.168.70.210/pages/rural-patrol-analysis.html')

# 2. 替换整段 <script> 为农村自建房数据
script_pattern = re.compile(r'<script>.*?</script>', re.DOTALL)

new_script = '''<script>
// 模拟数据：农村自建房风险巡查分析
const mockData = {
    regions: [
        { name: '南桥镇', taskTotal: 320, taskDone: 285, riskCount: 18, rectifyTotal: 22, rectifyDone: 19 },
        { name: '奉浦街道', taskTotal: 210, taskDone: 193, riskCount: 15, rectifyTotal: 18, rectifyDone: 16 },
        { name: '金汇镇', taskTotal: 280, taskDone: 246, riskCount: 21, rectifyTotal: 20, rectifyDone: 15 },
        { name: '青村镇', taskTotal: 195, taskDone: 154, riskCount: 12, rectifyTotal: 14, rectifyDone: 10 },
        { name: '四团镇', taskTotal: 170, taskDone: 136, riskCount: 14, rectifyTotal: 12, rectifyDone: 9 },
        { name: '柘林镇', taskTotal: 150, taskDone: 123, riskCount: 9, rectifyTotal: 10, rectifyDone: 8 }
    ],
    points: [
        { id: 1, name: '南桥镇人民路12号自建房', type: 'task', status: 'done', lat: 30.9178, lng: 121.4589, time: '2025-06-28 14:30', person: '张建国', region: '南桥镇' },
        { id: 2, name: '奉浦街道环城东路88号经营性自建房', type: 'risk', level: 'major', lat: 30.9234, lng: 121.4723, time: '2025-06-27 09:15', person: '李秀英', region: '奉浦街道' },
        { id: 3, name: '金汇镇工业路45号C级危房', type: 'risk', level: 'large', lat: 30.9456, lng: 121.4891, time: '2025-06-26 16:20', person: '王志强', region: '金汇镇' },
        { id: 4, name: '南桥镇新建中路23号隐患整改中', type: 'rectify', level: 'major', status: 'doing', lat: 30.9189, lng: 121.4601, time: '2025-06-25 10:00', person: '陈美华', region: '南桥镇' },
        { id: 5, name: '奉浦街道八字桥村农房辅助用房', type: 'task', status: 'pending', lat: 30.9245, lng: 121.4734, time: '2025-06-29 08:30', person: '刘大海', region: '奉浦街道' },
        { id: 6, name: '青村镇李窑村土木结构危房', type: 'risk', level: 'general', lat: 30.9100, lng: 121.5200, time: '2025-06-24 11:20', person: '孙明华', region: '青村镇' },
        { id: 7, name: '四团镇三坎村危房整改完成', type: 'rectify', level: 'major', status: 'done', lat: 30.8900, lng: 121.5400, time: '2025-06-23 15:45', person: '赵敏', region: '四团镇' },
        { id: 8, name: '柘林镇营房村砖木结构自建房', type: 'risk', level: 'low', lat: 30.8800, lng: 121.5000, time: '2025-06-22 13:10', person: '郑辉', region: '柘林镇' }
    ]
};

let currentPopupPoint = null;
let isPlaying = false;
let playTimer = null;

const MapConfig = {
    provider: 'amap',
    amapKey: '',
    defaultCenter: [30.92, 121.45],
    defaultZoom: 12
};

let mapManager = null;

function init() {
    renderRegionList();
    initCharts();
    initRankList();
    initMap();
}

function renderRegionList() {
    const container = document.getElementById('regionList');
    const allRegions = ['南桥镇', '奉浦街道', '金汇镇', '青村镇', '四团镇', '柘林镇', '庄行镇', '西渡街道', '海湾镇', '奉城镇', '头桥街道'];
    const regionMap = {};
    mockData.regions.forEach(r => regionMap[r.name] = r);

    container.innerHTML = allRegions.map(name => {
        const r = regionMap[name];
        if (!r) return `
            <div class="region-item" onclick="showRegionStats('${name}')">
                <div class="region-name">${name}</div>
                <div class="region-metrics">
                    <span><i class="fas fa-clipboard-check"></i> 0%</span>
                    <span><i class="fas fa-exclamation-triangle"></i> 0</span>
                    <span><i class="fas fa-wrench"></i> 0%</span>
                </div>
            </div>
        `;
        const completeRate = Math.round(r.taskDone / r.taskTotal * 100);
        const rectifyRate = Math.round(r.rectifyDone / r.rectifyTotal * 100);
        return `
            <div class="region-item" onclick="showRegionStats('${r.name}')">
                <div class="region-name">${r.name}</div>
                <div class="region-metrics">
                    <span><i class="fas fa-clipboard-check"></i> ${completeRate}%</span>
                    <span><i class="fas fa-exclamation-triangle"></i> ${r.riskCount}</span>
                    <span><i class="fas fa-wrench"></i> ${rectifyRate}%</span>
                </div>
            </div>
        `;
    }).join('');
}

function initRankList() {
    const container = document.getElementById('rankList');
    if (!container) return;
    const allRegions = ['南桥镇', '奉浦街道', '金汇镇', '青村镇', '四团镇', '柘林镇', '庄行镇', '西渡街道', '海湾镇', '奉城镇', '头桥街道'];
    const regionMap = {};
    mockData.regions.forEach(r => regionMap[r.name] = r);

    const rankData = allRegions.map(name => {
        const r = regionMap[name];
        const value = r ? Math.round(r.taskDone / r.taskTotal * 100) : 0;
        return { name, value };
    }).sort((a, b) => b.value - a.value);

    container.innerHTML = rankData.map((item, index) => {
        const rankClass = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : 'normal';
        return `
            <div class="rank-item">
                <div class="rank-index ${rankClass}">${index + 1}</div>
                <div class="rank-name">${item.name}</div>
                <div class="rank-bar"><div class="rank-bar-fill" style="width: ${item.value}%"></div></div>
                <div class="rank-value">${item.value}%</div>
            </div>
        `;
    }).join('');
}

function toggleLayer(el, layer) {
    el.classList.toggle('active');
    if (mapManager && mapManager.markers) {
        mapManager.markers.forEach(function(item) {
            if (item.layer === layer) {
                if (el.classList.contains('active')) {
                    item.marker.addTo(mapManager);
                } else {
                    mapManager.removeLayer(item.marker);
                }
            }
        });
    }
    console.log('切换图层:', layer, el.classList.contains('active'));
}

function showPopup(point) {
    currentPopupPoint = point;
    const popup = document.getElementById('infoPopup');
    const iconMap = {
        task: 'fa-clipboard-check',
        risk: 'fa-triangle-exclamation',
        rectify: 'fa-wrench'
    };
    const colorMap = {
        task: 'var(--primary)',
        risk: 'var(--danger)',
        rectify: 'var(--success)'
    };
    document.getElementById('popupIcon').innerHTML = `<i class="fas ${iconMap[point.type]}"></i>`;
    document.getElementById('popupIcon').style.background = colorMap[point.type] + '20';
    document.getElementById('popupIcon').style.color = colorMap[point.type];
    document.getElementById('popupTitle').textContent = point.name;

    const statusText = {
        done: '已完成', pending: '未完成', doing: '整改中'
    };
    const levelText = {
        major: '重大隐患', large: '较大隐患', general: '一般隐患', low: '无风险/低隐患'
    };

    document.getElementById('popupBody').innerHTML = `
        <div class="info-row"><span class="info-row-label">类型</span><span class="info-row-value">${point.type === 'task' ? '巡查任务' : point.type === 'risk' ? '风险隐患' : '整改情况'}</span></div>
        <div class="info-row"><span class="info-row-label">状态</span><span class="info-row-value">${point.level ? levelText[point.level] : statusText[point.status]}</span></div>
        <div class="info-row"><span class="info-row-label">发现时间</span><span class="info-row-value">${point.time}</span></div>
        <div class="info-row"><span class="info-row-label">责任人</span><span class="info-row-value">${point.person}</span></div>
        <div class="info-row"><span class="info-row-label">所属区域</span><span class="info-row-value">${point.region}</span></div>
        <div class="info-row"><span class="info-row-label">坐标</span><span class="info-row-value">${point.lng.toFixed(4)}, ${point.lat.toFixed(4)}</span></div>
    `;

    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.margin = '0';
    popup.classList.add('show');
}

function closePopup() {
    document.getElementById('infoPopup').classList.remove('show');
    currentPopupPoint = null;
}

function viewDetail() {
    if (!currentPopupPoint) return;
    alert('跳转到房屋详情页：' + currentPopupPoint.name + '（ID: ' + currentPopupPoint.id + '）');
}

function showRegionStats(regionName) {
    const region = mockData.regions.find(r => r.name === regionName);
    if (!region) return;
    document.getElementById('modalTitle').textContent = regionName + ' - 区域统计';
    document.getElementById('statCompleteRate').textContent = Math.round(region.taskDone / region.taskTotal * 100) + '%';
    document.getElementById('statRiskCount').textContent = region.riskCount;
    document.getElementById('statRectifyRate').textContent = Math.round(region.rectifyDone / region.rectifyTotal * 100) + '%';
    document.getElementById('statsModal').classList.add('show');

    setTimeout(() => {
        initModalChart(region);
    }, 100);
}

function closeStatsModal() {
    document.getElementById('statsModal').classList.remove('show');
}

function timeControl(action) {
    const slider = document.getElementById('timeSlider');
    const playBtn = document.getElementById('playBtn');
    if (action === 'play') {
        isPlaying = !isPlaying;
        playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        playBtn.classList.toggle('play', !isPlaying);
        if (isPlaying) {
            playTimer = setInterval(() => {
                let val = parseInt(slider.value) + 1;
                if (val > parseInt(slider.max)) val = 0;
                slider.value = val;
                onTimeChange(val);
            }, 1000);
        } else {
            clearInterval(playTimer);
        }
    } else if (action === 'forward') {
        let val = parseInt(slider.value) + 3;
        if (val > parseInt(slider.max)) val = parseInt(slider.max);
        slider.value = val;
        onTimeChange(val);
    } else if (action === 'rewind') {
        let val = parseInt(slider.value) - 3;
        if (val < 0) val = 0;
        slider.value = val;
        onTimeChange(val);
    }
}

function onTimeChange(value) {
    const date = new Date('2025-06-01');
    date.setDate(date.getDate() + parseInt(value));
    document.getElementById('currentTime').textContent = date.toISOString().split('T')[0];
}

function setGranularity(btn, gran) {
    document.querySelectorAll('.granularity-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    console.log('设置时间粒度:', gran);
}

function initCharts() {
    const pieChart = echarts.init(document.getElementById('pieChart'));
    pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0, itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11 } },
        series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '45%'],
            data: [
                { value: 12, name: '重大隐患', itemStyle: { color: '#d93025' } },
                { value: 23, name: '较大隐患', itemStyle: { color: '#e65100' } },
                { value: 34, name: '一般隐患', itemStyle: { color: '#f9c846' } },
                { value: 20, name: '无风险/低隐患', itemStyle: { color: '#1a73e8' } }
            ],
            label: { fontSize: 11 }
        }]
    });

    const lineChart = echarts.init(document.getElementById('lineChart'));
    lineChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['06-24', '06-25', '06-26', '06-27', '06-28', '06-29', '06-30'] },
        yAxis: { type: 'value' },
        series: [{
            type: 'line',
            data: [15, 22, 18, 25, 30, 28, 35],
            smooth: true,
            itemStyle: { color: '#1a73e8' },
            areaStyle: { color: 'rgba(26,115,232,0.1)' }
        }]
    });

    window.addEventListener('resize', () => {
        pieChart.resize();
        lineChart.resize();
    });
}

function initMap() {
    const container = document.getElementById('mapContainer');
    if (!container) return;

    mapManager = L.map('mapContainer').setView(MapConfig.defaultCenter, MapConfig.defaultZoom);

    let tileUrl, attribution;
    if (MapConfig.provider === 'amap' && MapConfig.amapKey) {
        tileUrl = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
        attribution = '&copy; 高德地图';
    } else {
        tileUrl = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
        attribution = '&copy; 高德地图';
    }

    L.tileLayer(tileUrl, {
        attribution: attribution,
        maxZoom: 19,
        subdomains: '1234'
    }).addTo(mapManager);

    mapManager.markers = [];
    renderMapMarkers();

    mapManager.on('click', function(e) {
        if (e.originalEvent && e.originalEvent.target.closest('.info-popup')) return;
        closePopup();
    });
}

function renderMapMarkers() {
    if (!mapManager) return;

    const riskFillColors = {
        major: '#d93025',
        large: '#e65100',
        general: '#f9c846',
        low: '#8ecae6'
    };
    const doneFillColors = {
        major: '#b52a21',
        large: '#bf4100',
        general: '#d4a73a',
        low: '#7ab3cf'
    };

    mockData.points.forEach(function(point) {
        const latlng = [point.lat, point.lng];
        let marker;

        if (point.type === 'task') {
            marker = L.circleMarker(latlng, {
                radius: 8,
                fillColor: '#1a73e8',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.85
            });
        } else if (point.type === 'risk') {
            marker = L.circleMarker(latlng, {
                radius: 8,
                fillColor: riskFillColors[point.level] || '#8ecae6',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            });
        } else if (point.type === 'rectify') {
            const levelColor = riskFillColors[point.level] || '#d93025';
            if (point.status === 'done') {
                const doneColor = doneFillColors[point.level] || '#b52a21';
                marker = L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'custom-marker done-marker',
                        html: `<div class="marker-shape marker-square" style="background:${doneColor};border-color:${doneColor}"><span class="marker-check">✓</span></div>`,
                        iconSize: [18, 18],
                        iconAnchor: [9, 9]
                    })
                });
            } else {
                marker = L.circleMarker(latlng, {
                    radius: 9,
                    fillColor: levelColor,
                    color: levelColor,
                    weight: 4,
                    opacity: 1,
                    fillOpacity: 0.1
                });
            }
        }

        if (marker) {
            marker.addTo(mapManager);
            marker.on('click', function(e) {
                L.DomEvent.stopPropagation(e);
                showPopup(point);
            });
            mapManager.markers.push({ layer: point.type, marker: marker });
        }
    });
}

function initModalChart(region) {
    const modalChart = echarts.init(document.getElementById('modalChart'));
    modalChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['重大隐患', '较大隐患', '一般隐患', '无风险/低隐患'] },
        yAxis: { type: 'value' },
        series: [{
            type: 'bar',
            data: [
                Math.round(region.riskCount * 0.15),
                Math.round(region.riskCount * 0.25),
                Math.round(region.riskCount * 0.40),
                Math.round(region.riskCount * 0.20)
            ],
            itemStyle: {
                color: function(params) {
                    const colors = ['#d93025', '#e65100', '#f9c846', '#1a73e8'];
                    return colors[params.dataIndex];
                },
                borderRadius: [4, 4, 0, 0]
            }
        }]
    });
}

init();
</script>'''

html, count = script_pattern.subn(new_script, html, count=1)
print('Script blocks replaced:', count)

# 3. 标题和文字替换
html = html.replace('燃气 - 巡查任务分析_files', 'rural - 巡查任务分析_files')
html = html.replace('街道巡查完成排名', '乡镇/街道巡查完成排名')
html = html.replace('近7天巡查发现趋势', '近7天农村自建房巡查发现趋势')

open('e:/风险管控0618/pages/patrol-task-analysis.html', 'wb').write(html.encode('utf-8'))
print('Saved')
