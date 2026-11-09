// ===== 专项风险隐患审核：演示任务种子（幂等） =====
// 为"自建房专项风险隐患审核"模块提供待审核任务演示数据：
// 两个已完成填报并提交审核的巡查任务，含 selectedProjects（房屋+检查项+现场照片+坐标），
// 数据结构与 PC/H5 填报产物一致（见 urban-risk-task-detail.html 的 applyFillResult）。
(function () {
    function mockPhoto(label, tone) {
        const bg = tone === 'red' ? '#fdecea' : tone === 'yellow' ? '#fff7e6' : '#e8f0fe';
        const fg = tone === 'red' ? '#b3261e' : tone === 'yellow' ? '#b06000' : '#1557b0';
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="110"><rect width="160" height="110" fill="${bg}"/><rect x="6" y="6" width="148" height="98" fill="none" stroke="${fg}" stroke-width="1.5" stroke-dasharray="5 4"/><text x="80" y="52" font-size="13" fill="${fg}" text-anchor="middle">现场照片</text><text x="80" y="72" font-size="11" fill="${fg}" text-anchor="middle">${label}</text></svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }

    function item(main, sub, content, risk, accident, level, desc, photoLabel) {
        return {
            main: main, sub: sub, content: content, risk: risk, accident: accident,
            level: level, result: level === 'blue' ? 'normal' : 'abnormal',
            description: desc || '',
            photos: level === 'blue' ? [] : [mockPhoto(photoLabel || (main + '-' + sub), level)]
        };
    }
    // 蓝色（正常）检查项
    function okItem(main, sub, content) {
        return { main: main, sub: sub, content: content, risk: '', accident: '', level: 'blue', result: 'normal', description: '', photos: [] };
    }

    const SEED_TASKS = [
        {
            id: 9101, no: 'FX-RW-2026-101', name: '青村镇桃园社区自建房专项排查', type: 'special', typeLabel: '专项巡查',
            town: '青村镇', village: '桃园社区', houseType: '仅自住', structure: '', person: '赵敏', createBy: '系统管理员',
            inspected: 6, total: 6, houseCount: 6, status: 'pending-audit', statusLabel: '待审核', statusClass: 'pending-audit',
            hiddenCount: 6, hiddenFixed: 0,
            startDate: '2026-02-10', endDate: '2026-02-28', finishTime: '2026-02-26 15:20', submitAuditTime: '2026-02-26 15:20',
            selectedProjects: [
                { id: 1, houseNo: 'FX-NC-TY-0201', name: '桃园社区桃园路18号', address: '上海市奉贤区青村镇桃园社区桃园路18号', town: '青村镇', village: '桃园社区', typeLabel: '仅自住', structure: '砖混', year: 1986, floors: 2, area: 168, owner: '张建国', phone: '13901678101', status: 'inspected', time: '2026-02-24 09:40', fillSource: 'h5', lng: 121.5486, lat: 30.8912,
                  checkItems: [
                    item('城镇自建房结构', '承重墙', '墙体出现贯穿性裂缝，最大缝宽约8mm', '墙体开裂持续发展，承重能力下降', '坍塌、人员伤亡', 'red', '东山墙贯穿裂缝，雨雪天有渗水。', '承重墙裂缝'),
                    item('城镇自建房结构', '梁柱', '二层圈梁局部混凝土剥落、钢筋外露锈蚀', '构件截面削弱，承载力下降', '坍塌', 'yellow', '圈梁剥落约30cm。', '圈梁剥落'),
                    okItem('屋面', '屋面', '屋面瓦片完好，无渗漏'),
                    okItem('地基基础', '基础', '基础无明显沉降')
                  ] },
                { id: 2, houseNo: 'FX-NC-TY-0202', name: '桃园社区桃园路42号', address: '上海市奉贤区青村镇桃园社区桃园路42号', town: '青村镇', village: '桃园社区', typeLabel: '自住+经营', structure: '砖木', year: 1978, floors: 1, area: 96, owner: '李秀兰', phone: '13816228202', status: 'inspected', time: '2026-02-24 10:30', fillSource: 'h5', lng: 121.5512, lat: 30.8925,
                  checkItems: [
                    item('木构架', '木柱', '承重木柱根部腐朽，虫蛀明显', '木柱承载力严重下降', '坍塌、人员伤亡', 'red', '两根木柱根部腐朽深度超1/3截面。', '木柱腐朽'),
                    okItem('城镇自建房结构', '承重墙', '墙体无明显裂缝'),
                    okItem('屋面', '屋面', '屋面基本完好')
                  ] },
                { id: 3, houseNo: 'FX-NC-TY-0203', name: '桃园社区解放路7号', address: '上海市奉贤区青村镇桃园社区解放路7号', town: '青村镇', village: '桃园社区', typeLabel: '仅自住', structure: '砖混', year: 1995, floors: 2, area: 182, owner: '王建军', phone: '13601988303', status: 'inspected', time: '2026-02-25 14:10', fillSource: 'pc', lng: 121.5498, lat: 30.8898,
                  checkItems: [
                    item('阳台', '阳台栏板', '二层阳台悬挑梁根部开裂', '悬挑构件存在脱落风险', '高处坠落、人员伤亡', 'yellow', '栏板与墙体交接处裂缝。', '阳台开裂'),
                    okItem('城镇自建房结构', '承重墙', '墙体完好'),
                    okItem('地基基础', '基础', '无沉降')
                  ] },
                { id: 4, houseNo: 'FX-NC-TY-0204', name: '桃园社区桃园路65号', address: '上海市奉贤区青村镇桃园社区桃园路65号', town: '青村镇', village: '桃园社区', typeLabel: '仅自住', structure: '混杂结构', year: 1990, floors: 2, area: 155, owner: '陈丽华', phone: '13917180404', status: 'inspected', time: '2026-02-25 15:00', fillSource: 'pc', lng: 121.5525, lat: 30.8908,
                  checkItems: [
                    item('外墙', '外墙饰面', '外墙大面积空鼓、局部脱落', '饰面脱落伤人风险', '物体打击', 'yellow', '南立面约2㎡空鼓。', '外墙空鼓'),
                    okItem('城镇自建房结构', '承重墙', '墙体完好'),
                    okItem('排水系统', '排水', '排水通畅')
                  ] },
                { id: 5, houseNo: 'FX-NC-TY-0205', name: '桃园社区新建路23号', address: '上海市奉贤区青村镇桃园社区新建路23号', town: '青村镇', village: '桃园社区', typeLabel: '仅自住', structure: '砖混', year: 2008, floors: 3, area: 260, owner: '刘志强', phone: '13564550505', status: 'inspected', time: '2026-02-26 09:20', fillSource: 'h5', lng: 121.5505, lat: 30.8935,
                  checkItems: [
                    okItem('城镇自建房结构', '承重墙', '墙体无裂缝'),
                    okItem('屋面', '屋面', '屋面完好'),
                    okItem('地基基础', '基础', '基础稳固'),
                    okItem('楼梯间', '楼梯', '楼梯构件完好')
                  ] },
                { id: 6, houseNo: 'FX-NC-TY-0206', name: '桃园社区新建路31号', address: '上海市奉贤区青村镇桃园社区新建路31号', town: '青村镇', village: '桃园社区', typeLabel: '仅自住', structure: '钢结构', year: 2015, floors: 2, area: 210, owner: '赵桂芳', phone: '13636360606', status: 'inspected', time: '2026-02-26 10:05', fillSource: 'h5', lng: 121.5535, lat: 30.8920,
                  checkItems: [
                    okItem('城镇自建房结构', '钢构件', '构件无锈蚀变形'),
                    okItem('屋面', '屋面', '屋面完好'),
                    okItem('地基基础', '基础', '基础稳固')
                  ] }
            ]
        },
        {
            id: 9102, no: 'FX-RW-2026-102', name: '奉城镇洪庙社区危旧房复查', type: 'special', typeLabel: '专项巡查',
            town: '奉城镇', village: '洪庙社区', houseType: '仅自住', structure: '', person: '李秀英', createBy: '系统管理员',
            inspected: 4, total: 4, houseCount: 4, status: 'pending-audit', statusLabel: '待审核', statusClass: 'pending-audit',
            hiddenCount: 3, hiddenFixed: 0,
            startDate: '2026-02-12', endDate: '2026-03-05', finishTime: '2026-03-02 11:00', submitAuditTime: '2026-03-02 11:00',
            selectedProjects: [
                { id: 1, houseNo: 'FX-NC-HM-0301', name: '洪庙社区南街15号', address: '上海市奉贤区奉城镇洪庙社区南街15号', town: '奉城镇', village: '洪庙社区', typeLabel: '仅自住', structure: '砖木', year: 1972, floors: 1, area: 88, owner: '孙明辉', phone: '13818180707', status: 'inspected', time: '2026-03-01 09:00', fillSource: 'h5', lng: 121.6285, lat: 30.9155,
                  checkItems: [
                    item('地基基础', '基础', '房屋整体不均匀沉降，门窗变形', '沉降持续发展，结构失稳', '坍塌、人员伤亡', 'red', '室内地面高差约5cm。', '地基沉降'),
                    item('城镇自建房结构', '承重墙', '墙体斜向裂缝多条', '墙体承载力下降', '坍塌', 'red', '裂缝最宽约6mm。', '墙体裂缝'),
                    okItem('屋面', '屋面', '屋面局部渗漏')
                  ] },
                { id: 2, houseNo: 'FX-NC-HM-0302', name: '洪庙社区南街28号', address: '上海市奉贤区奉城镇洪庙社区南街28号', town: '奉城镇', village: '洪庙社区', typeLabel: '仅自住', structure: '砖混', year: 1988, floors: 2, area: 172, owner: '周宝根', phone: '13909090808', status: 'inspected', time: '2026-03-01 10:20', fillSource: 'h5', lng: 121.6302, lat: 30.9168,
                  checkItems: [
                    item('楼板', '预制楼板', '预制板拼缝开裂、个别板底露筋', '楼板整体性差', '坍塌', 'yellow', '客厅板底露筋约20cm。', '楼板露筋'),
                    okItem('城镇自建房结构', '承重墙', '墙体完好'),
                    okItem('地基基础', '基础', '无沉降')
                  ] },
                { id: 3, houseNo: 'FX-NC-HM-0303', name: '洪庙社区东街6号', address: '上海市奉贤区奉城镇洪庙社区东街6号', town: '奉城镇', village: '洪庙社区', typeLabel: '仅自住', structure: '木结构', year: 1965, floors: 1, area: 72, owner: '吴桂英', phone: '13764640909', status: 'inspected', time: '2026-03-02 09:30', fillSource: 'pc', lng: 121.6290, lat: 30.9142,
                  checkItems: [
                    okItem('木构架', '木柱', '木柱基本完好'),
                    okItem('屋面', '屋面', '屋面完好'),
                    okItem('地基基础', '基础', '基础稳固')
                  ] },
                { id: 4, houseNo: 'FX-NC-HM-0304', name: '洪庙社区东街19号', address: '上海市奉贤区奉城镇洪庙社区东街19号', town: '奉城镇', village: '洪庙社区', typeLabel: '仅自住', structure: '砖混', year: 2001, floors: 2, area: 195, owner: '钱伟', phone: '13817471010', status: 'inspected', time: '2026-03-02 10:15', fillSource: 'pc', lng: 121.6315, lat: 30.9150,
                  checkItems: [
                    okItem('城镇自建房结构', '承重墙', '墙体无裂缝'),
                    okItem('屋面', '屋面', '屋面完好'),
                    okItem('排水系统', '排水', '排水通畅')
                  ] }
            ]
        }
    ];

    // 幂等播种：已存在的任务 id 跳过
    window.ensureAuditSeedTasks = function () {
        let tasks = [];
        try { tasks = JSON.parse(localStorage.getItem('urbanPatrolTasks') || '[]'); } catch (e) { tasks = []; }
        if (!Array.isArray(tasks)) tasks = [];
        let changed = false;
        SEED_TASKS.forEach(seed => {
            if (!tasks.some(t => Number(t.id) === seed.id)) {
                tasks.push(JSON.parse(JSON.stringify(seed)));
                changed = true;
            }
        });
        if (changed) {
            try { localStorage.setItem('urbanPatrolTasks', JSON.stringify(tasks)); } catch (e) { /* ignore */ }
        }
    };
})();
