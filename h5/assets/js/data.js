/* ============================================================
   data.js — H5 小程序通用业务数据层（非风险清单类）
   包含：巡查任务、隐患事件、消息、监测点、预警、通讯录
   ============================================================ */
(function () {
    'use strict';

    var now = new Date();

    function dateAdd(minutes) {
        return new Date(now.getTime() + minutes * 60000).toISOString();
    }

    function generateHistory(base, max, min, threshold) {
        var arr = [];
        for (var i = 30; i >= 0; i--) {
            var t = new Date(now.getTime() - i * 24 * 60 * 60000);
            var val = base + (Math.random() - 0.5) * (max - min);
            val = Math.max(min, Math.min(max, val));
            arr.push({ time: t.toISOString(), value: parseFloat(val.toFixed(2)) });
        }
        return arr;
    }

    var DataStore = {
        // 当前用户信息（默认普通用户，方便验证新功能；可在「我的」页面切换角色）
        // 注：app.js 启动时会按当前角色用 usersByRole 覆盖 name/org/avatar/roleLabel
        user: {
            name: '市民用户',
            role: 'public',
            roleLabel: '普通用户',
            org: '上海市奉贤区',
            phone: '13800138000',
            avatar: ''
        },

        // 按角色的用户档案（切换角色时，姓名/单位/头像随之变化）
        usersByRole: {
            public: { name: '市民用户', org: '上海市奉贤区', avatar: 'fa-user' },
            inspector: { name: '张明', org: '上海市奉贤区应急管理局 · 风险巡查科', avatar: 'fa-user-tie' },
            manager: { name: '王建国', org: '上海市奉贤区应急管理局 · 综合协调科', avatar: 'fa-user-shield' },
            enterprise: { name: '李伟', org: '奉贤建设工程有限公司 · 安全管理部', avatar: 'fa-helmet-safety' }
        },

        // 全局统计（与首页浮卡、Tab 徽标联动）
        stats: {
            todo: 12,
            warning: 3,
            inspection: 8,
            unread: 5,
            approval: 3
        },

        // 角色标签映射
        roleLabels: {
            public: '普通用户',
            inspector: '巡查人员',
            manager: '管理人员',
            enterprise: '企业人员'
        },

        // 首页管辖区域风险总览（按角色区分，以上海市奉贤区为例）
        regionStats: {
            inspector: [
                { name: '南桥镇', level: 'high', count: 14, width: 82 },
                { name: '奉城镇', level: 'mid', count: 6, width: 54 },
                { name: '庄行镇', level: 'low', count: 2, width: 22 }
            ],
            manager: [
                { name: '奉贤区', level: 'high', count: 22, width: 78 },
                { name: '南桥镇', level: 'mid', count: 14, width: 52 },
                { name: '奉城镇', level: 'low', count: 8, width: 30 }
            ],
            enterprise: [
                { name: '奉贤新城', level: 'mid', count: 3, width: 48 },
                { name: '南桥园区', level: 'low', count: 1, width: 20 }
            ],
            public: [
                { name: '南桥镇', level: 'high', count: 5, width: 60 },
                { name: '奉城镇', level: 'mid', count: 3, width: 40 },
                { name: '庄行镇', level: 'low', count: 1, width: 20 }
            ]
        },

        // 天气数据（Mock，后续可对接真实 API）
        weather: {
            location: '上海市奉贤区',
            updateTime: dateAdd(-30),
            current: {
                temp: 28,
                tempMax: 32,
                tempMin: 24,
                humidity: 72,
                pressure: 1008,
                windSpeed: 12,
                windDir: '东南风',
                rainfall: 0,
                visibility: 12,
                desc: '多云',
                icon: 'fa-cloud-sun'
            },
            // 未来 24 小时逐时预报
            hourly: [
                { time: '14:00', icon: 'fa-cloud-sun', temp: 29, precipProbability: '10%' },
                { time: '15:00', icon: 'fa-cloud-sun', temp: 30, precipProbability: '10%' },
                { time: '16:00', icon: 'fa-cloud', temp: 30, precipProbability: '15%' },
                { time: '17:00', icon: 'fa-cloud', temp: 29, precipProbability: '15%' },
                { time: '18:00', icon: 'fa-cloud-sun', temp: 28, precipProbability: '10%' },
                { time: '19:00', icon: 'fa-cloud-sun', temp: 27, precipProbability: '10%' },
                { time: '20:00', icon: 'fa-cloud-moon', temp: 26, precipProbability: '5%' },
                { time: '21:00', icon: 'fa-cloud-moon', temp: 25, precipProbability: '5%' },
                { time: '22:00', icon: 'fa-moon', temp: 25, precipProbability: '0%' },
                { time: '23:00', icon: 'fa-moon', temp: 24, precipProbability: '0%' },
                { time: '00:00', icon: 'fa-moon', temp: 24, precipProbability: '0%' },
                { time: '01:00', icon: 'fa-moon', temp: 23, precipProbability: '0%' },
                { time: '02:00', icon: 'fa-moon', temp: 23, precipProbability: '0%' },
                { time: '03:00', icon: 'fa-moon', temp: 23, precipProbability: '0%' },
                { time: '04:00', icon: 'fa-moon', temp: 22, precipProbability: '0%' },
                { time: '05:00', icon: 'fa-cloud-moon', temp: 23, precipProbability: '5%' },
                { time: '06:00', icon: 'fa-cloud-sun', temp: 24, precipProbability: '10%' },
                { time: '07:00', icon: 'fa-cloud-sun', temp: 25, precipProbability: '10%' },
                { time: '08:00', icon: 'fa-sun', temp: 27, precipProbability: '5%' },
                { time: '09:00', icon: 'fa-sun', temp: 28, precipProbability: '5%' },
                { time: '10:00', icon: 'fa-cloud-sun', temp: 29, precipProbability: '10%' },
                { time: '11:00', icon: 'fa-cloud-sun', temp: 30, precipProbability: '10%' },
                { time: '12:00', icon: 'fa-cloud', temp: 31, precipProbability: '15%' },
                { time: '13:00', icon: 'fa-cloud', temp: 30, precipProbability: '15%' }
            ],
            // 未来 7 天逐日预报
            forecast: [
                { date: '2026-06-18', weekday: '今天', icon: 'fa-cloud-sun', weather: '多云', tempMax: 32, tempMin: 24, precipProbability: '20%', windSpeed: '12km/h' },
                { date: '2026-06-19', weekday: '明天', icon: 'fa-cloud-rain', weather: '小雨', tempMax: 29, tempMin: 23, precipProbability: '70%', windSpeed: '16km/h' },
                { date: '2026-06-20', weekday: '周六', icon: 'fa-cloud-showers-heavy', weather: '中雨', tempMax: 27, tempMin: 22, precipProbability: '80%', windSpeed: '20km/h' },
                { date: '2026-06-21', weekday: '周日', icon: 'fa-cloud-sun', weather: '多云转晴', tempMax: 30, tempMin: 22, precipProbability: '10%', windSpeed: '10km/h' },
                { date: '2026-06-22', weekday: '周一', icon: 'fa-sun', weather: '晴', tempMax: 33, tempMin: 24, precipProbability: '5%', windSpeed: '8km/h' },
                { date: '2026-06-23', weekday: '周二', icon: 'fa-cloud-sun', weather: '多云', tempMax: 31, tempMin: 23, precipProbability: '15%', windSpeed: '11km/h' },
                { date: '2026-06-24', weekday: '周三', icon: 'fa-bolt', weather: '雷阵雨', tempMax: 28, tempMin: 22, precipProbability: '65%', windSpeed: '18km/h' }
            ],
            // 气象预警（含发布时间、影响区域、防御指南）
            warnings: [
                {
                    type: 'typhoon',
                    label: '台风预警',
                    level: 'blue',
                    text: '台风外围影响，注意防风',
                    publishTime: '2026-06-18 08:30',
                    area: '上海市奉贤区、浦东新区沿海',
                    guide: ['关好门窗，加固室外搭建物', '停止露天集体活动和高空等户外危险作业', '相关水域水上作业和过往船舶采取积极的应对措施']
                },
                {
                    type: 'rainstorm',
                    label: '暴雨预警',
                    level: 'orange',
                    text: '预计未来 3 小时降雨量将达 50 毫米',
                    publishTime: '2026-06-18 10:15',
                    area: '上海市中南部、奉贤区全境',
                    guide: ['切断有危险的室外电源，暂停户外作业', '处于危险地带的单位应当停课、停业', '做好城市、农田的排涝，注意防范可能引发的山洪、滑坡、泥石流等灾害']
                }
            ]
        },

        // 风险知识库（仅保留已审核通过的数据）
        knowledge: {
            laws: [
                { id: 'law-001', type: 'law', category: '法律', domain: '安全生产', title: '中华人民共和国安全生产法', organ: '全国人大常委会', pubDate: '2021-06-10', effectDate: '2021-09-01', auditStatus: 'approved', summary: '规定了生产经营单位的安全生产保障、从业人员权利义务、监督管理及应急救援等内容。' },
                { id: 'law-002', type: 'law', category: '行政法规', domain: '建筑工地', title: '建设工程安全生产管理条例', organ: '国务院', pubDate: '2003-11-24', effectDate: '2004-02-01', auditStatus: 'approved', summary: '明确了建设工程安全生产责任主体、安全措施及监督管理要求。' },
                { id: 'law-003', type: 'law', category: '部门规章', domain: '燃气安全', title: '城镇燃气管理条例', organ: '国务院', pubDate: '2016-02-06', effectDate: '2016-02-06', auditStatus: 'approved', summary: '规范城镇燃气发展规划、经营与服务、燃气使用及设施保护。' },
                { id: 'law-004', type: 'law', category: '地方性法规', domain: '应急管理', title: '上海市安全生产条例', organ: '上海市人大', pubDate: '2022-10-28', effectDate: '2022-12-01', auditStatus: 'approved', summary: '结合上海实际，细化安全生产各方责任与监管措施。' },
                { id: 'law-005', type: 'law', category: '地方性法规', domain: '自建房', title: '上海市自建房安全管理办法', organ: '上海市人民政府', pubDate: '2023-09-01', effectDate: '2023-10-01', auditStatus: 'approved', summary: '规范本市自建房建设、使用、安全鉴定及隐患治理责任，明确房屋所有权人和管理人安全主体责任。' }
            ],
            policies: [
                { id: 'policy-001', type: 'policy', category: '指导意见', domain: '建筑工地', title: '关于进一步加强建筑施工安全监管的通知', organ: '住建部', pubDate: '2025-03-15', effectDate: '2025-04-01', auditStatus: 'approved', summary: '强化深基坑、高支模、起重机械等危大工程安全监管。' },
                { id: 'policy-002', type: 'policy', category: '实施方案', domain: '防汛防台', title: '2026 年上海市防汛防台工作实施方案', organ: '市防汛办', pubDate: '2026-04-20', effectDate: '2026-05-01', auditStatus: 'approved', summary: '明确汛期值班、物资储备、人员转移及应急响应要求。' },
                { id: 'policy-003', type: 'policy', category: '管理办法', domain: '燃气安全', title: '燃气安全专项整治行动管理办法', organ: '市住建委', pubDate: '2025-08-10', effectDate: '2025-09-01', auditStatus: 'approved', summary: '部署燃气管道、场站、用户端安全隐患排查整治。' }
            ],
            standards: [
                { id: 'std-001', type: 'standard', category: 'GB', domain: '燃气安全', title: 'GB 55009-2021 燃气工程项目规范', organ: '住建部', pubDate: '2021-04-09', effectDate: '2022-01-01', auditStatus: 'approved', summary: '全文强制性工程建设规范，规定燃气工程基本技术要求。' },
                { id: 'std-002', type: 'standard', category: 'JGJ', domain: '建筑工地', title: 'JGJ 311-2013 建筑深基坑工程施工安全技术规范', organ: '住建部', pubDate: '2013-06-09', effectDate: '2014-03-01', auditStatus: 'approved', summary: '规范建筑深基坑工程的设计、施工、监测与验收。' },
                { id: 'std-003', type: 'standard', category: 'JGJ', domain: '建筑工地', title: 'JGJ 130-2011 建筑施工扣件式钢管脚手架安全技术规范', organ: '住建部', pubDate: '2011-01-28', effectDate: '2011-12-01', auditStatus: 'approved', summary: '规定了扣件式钢管脚手架的设计、构造、搭设与拆除要求。' },
                { id: 'std-004', type: 'standard', category: 'DB', domain: '防汛防台', title: 'DB31/T 防汛防台应急管理地方标准', organ: '市市场监管局', pubDate: '2025-05-01', effectDate: '2025-06-01', auditStatus: 'approved', summary: '规范本市防汛防台应急准备、响应行动及灾后恢复。' }
            ],
            floodTyphoon: [
                { id: 'ft-001', type: 'floodTyphoon', category: '应急预案', title: '奉贤区防汛防台应急预案（2026 版）', organ: '区防汛指挥部', pubDate: '2026-04-01', effectDate: '2026-05-01', auditStatus: 'approved', summary: '明确四级响应启动条件、职责分工及处置流程。' },
                { id: 'ft-002', type: 'floodTyphoon', category: '操作手册', title: '地下空间防汛操作手册', organ: '区应急管理局', pubDate: '2025-06-15', effectDate: '2025-07-01', auditStatus: 'approved', summary: '针对地下停车场、地铁站点等地下空间的防汛排水操作指南。' },
                { id: 'ft-003', type: 'floodTyphoon', category: '历史案例', title: '2024 年台风"贝碧嘉"防御复盘报告', organ: '区防汛办', pubDate: '2024-09-20', effectDate: '2024-09-20', auditStatus: 'approved', summary: '总结台风防御经验、薄弱环节及改进措施。' },
                // PC 端防汛手册数据迁移
                { id: 'm1', type: 'floodTyphoon', category: '操作手册', domain: '建筑安全', title: '建筑工地脚手架防风加固操作手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '台风来临前检查连墙件、扫地杆、剪刀撑，补充防风缆绳，拆除易受风构件。' },
                { id: 'm2', type: 'floodTyphoon', category: '操作手册', domain: '建筑安全', title: '建筑施工高处作业人员转移指南', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '明确撤离责任人、路线、集合点和交通工具，优先转移高风险区域人员。' },
                { id: 'm3', type: 'floodTyphoon', category: '操作手册', domain: '建筑安全', title: '建筑深基坑暴雨期间监测与排水手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'pending', summary: '加密排水沟、集水井巡查，配置备用排水泵，监测边坡位移与地下水位。' },
                { id: 'm4', type: 'floodTyphoon', category: '操作手册', domain: '建筑安全', title: '建筑工地塔吊防风操作指南', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '台风前将吊臂转至顺风方向，锁紧夹轨器、锚定装置或防风拉索。' },
                { id: 'm5', type: 'floodTyphoon', category: '操作手册', domain: '建筑安全', title: '建筑工地临时用电防雨措施手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'rejected', summary: '检查配电箱防雨性能、电缆绝缘和漏电保护器，低洼配电设施提前转移。' },
                { id: 'm6', type: 'floodTyphoon', category: '操作手册', domain: '燃气', title: '燃气管道台风巡检与应急处置手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '台风前后对燃气管道、阀门井、调压设施进行巡检，发现泄漏立即处置。' },
                { id: 'm7', type: 'floodTyphoon', category: '操作手册', domain: '燃气', title: '燃气场站防洪防涝操作指南', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'pending', summary: '场站周边排水系统检查、设备防水淹措施、应急停气流程。' },
                { id: 'm8', type: 'floodTyphoon', category: '操作手册', domain: '交通', title: '道路交通台风期间管制与疏导手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '积水路段封闭、交通疏导、应急车辆通行保障。' },
                { id: 'm9', type: 'floodTyphoon', category: '操作手册', domain: '交通', title: '桥梁隧道防汛巡查与应急处置手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'pending', summary: '桥隧排水系统、结构安全、水位监测及交通管制措施。' },
                { id: 'm10', type: 'floodTyphoon', category: '操作手册', domain: '玻璃幕墙', title: '玻璃幕墙台风前检查与加固手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '检查幕墙连接件、密封胶条、开启扇，加固松动构件，清理潜在坠落物。' },
                { id: 'm11', type: 'floodTyphoon', category: '操作手册', domain: '玻璃幕墙', title: '高层既有建筑玻璃幕墙渗漏处置指南', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'rejected', summary: '台风暴雨期间幕墙渗漏应急处置及事后维修。' },
                { id: 'm12', type: 'floodTyphoon', category: '操作手册', domain: '自建房', title: '城镇自建房台风防御手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '屋顶加固、门窗防护、排水疏通、人员转移要点。' },
                { id: 'm13', type: 'floodTyphoon', category: '操作手册', domain: '自建房', title: '农村自建房暴雨洪涝防范指南', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '低洼地区自建房防洪、用电安全、人员撤离路线规划。' },
                { id: 'm14', type: 'floodTyphoon', category: '操作手册', domain: '综合应急', title: '防汛防台综合应急响应手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'approved', summary: '跨部门协调、资源调度、信息报送、灾后恢复全流程指引。' },
                { id: 'm15', type: 'floodTyphoon', category: '操作手册', domain: '综合应急', title: '防汛物资储备与调配手册', organ: '市应急管理局', pubDate: '-', effectDate: '-', auditStatus: 'pending', summary: '沙袋、水泵、发电机、救生衣等物资储备标准与调配流程。' }
            ]
        },

        // 普通用户随手拍记录（提交后进入隐患处置流程）
        myReports: [
            { id: 'MR-2026-0001', title: '路口信号灯不亮', type: '交通安全', level: 'yellow', location: '南桥镇解放路交叉口', status: 'handling', reportTime: dateAdd(-2880), photos: 2, description: '东西向红绿灯均不亮，行人通行混乱。' },
            { id: 'MR-2026-0002', title: '施工围挡破损', type: '建筑工地', level: 'blue', location: '奉城镇某在建工地', status: 'closed', reportTime: dateAdd(-7200), photos: 1, description: '围挡倒地，存在行人误入风险。' }
        ],

        // 我的反馈（与 myReports 同步，展示处理状态）
        myFeedback: [
            { id: 'MR-2026-0001', title: '路口信号灯不亮', status: 'handling', statusLabel: '处理中', updateTime: dateAdd(-60), reply: '已派单至交警支队，预计今日修复。' },
            { id: 'MR-2026-0002', title: '施工围挡破损', status: 'closed', statusLabel: '已办结', updateTime: dateAdd(-120), reply: '施工单位已修复并加固，感谢您反馈。' }
        ],

        // 巡查任务（以奉贤区各街镇为例）
        inspectionTasks: [
            { id: 'IT-2026-0001', type: 'daily', title: '南桥镇日常巡查', area: '南桥镇', location: '南桥路沿线', requirements: '检查建筑工地、基坑、脚手架等重点风险点', deadline: dateAdd(180), priority: 'red', status: 'pending', distance: 1200, points: [{ name: '某工地脚手架', checked: false }, { name: '某基坑支护', checked: false }] },
            { id: 'IT-2026-0002', type: 'special', title: '奉城镇基坑专项巡查', area: '奉城镇', location: '奉浦大道在建项目', requirements: '重点检查基坑排水、支护变形', deadline: dateAdd(120), priority: 'red', status: 'ongoing', distance: 3500, person: '李明华', inspected: 12, total: 15, archiveCount: 5, hiddenCount: 1, startDate: '2025-06-05', endDate: '2025-06-20', points: [{ name: '基坑排水设施', checked: true }, { name: '支护位移监测', checked: false }] },
            { id: 'IT-2026-0003', type: 'temporary', title: '庄行镇燃气异味核查', area: '庄行镇', location: '庄行小区', requirements: '现场核查燃气泄漏情况，拍照记录', deadline: dateAdd(60), priority: 'orange', status: 'pending', distance: 5600, points: [{ name: '户内燃气管道', checked: false }, { name: '燃气表具', checked: false }] },
            { id: 'IT-2026-0004', type: 'review', title: '海湾镇幕墙隐患整改复查', area: '海湾镇', location: '海湾某大厦', requirements: '复查幕墙密封胶更换、连接节点加固情况', deadline: dateAdd(360), priority: 'orange', status: 'pending', distance: 2100, points: [{ name: '幕墙密封胶', checked: false }, { name: '连接节点', checked: false }] },
            { id: 'IT-2026-0005', type: 'daily', title: '金汇镇交通设施巡查', area: '金汇镇', location: '金汇路', requirements: '检查信号灯、标志标线、施工围挡', deadline: dateAdd(240), priority: 'yellow', status: 'pending', distance: 800, points: [{ name: '信号灯运行', checked: false }, { name: '施工围挡', checked: false }] },
            { id: 'IT-2026-0006', type: 'special', title: '青村镇自建房安全排查', area: '青村镇', location: '青村某村', requirements: '检查房屋倾斜、裂缝、违规加层', deadline: dateAdd(480), priority: 'yellow', status: 'pending', distance: 4200, points: [{ name: '房屋倾斜', checked: false }, { name: '墙体裂缝', checked: false }] },
            { id: 'IT-2026-0007', type: 'daily', title: '南桥路燃气调压站日常巡查', area: '南桥镇', location: '燃气调压站', requirements: '检查调压器运行压力、过滤器压差、阀门井积水、泄漏检测等情况', deadline: dateAdd(180), priority: 'orange', status: 'ongoing', distance: 800, person: '张建国', inspected: 8, total: 10, archiveCount: 3, hiddenCount: 2, startDate: '2025-06-01', endDate: '2025-06-15', points: [{ name: '调压器运行压力正常', checked: true }, { name: '过滤器压差在规定范围', checked: false }, { name: '阀门井无积水、无泄漏', checked: false }, { name: '燃气泄漏检测合格', checked: false }] }
        ],

        // 按领域组织的巡查任务（数据来源：PC端智能风险研判 > 各领域 > 预警中心 > 风险巡查任务管理）
        domainInspectionTasks: {
            gas: [
                {
                    id: 'GAS-2025-001', type: 'daily', title: '南桥路燃气调压站日常巡查', area: '南桥镇', location: '南桥路128号', requirements: '检查调压器运行压力、过滤器压差、阀门井积水、泄漏检测等情况', desc: '对南桥路燃气调压站进行日常巡查，重点关注调压设备运行状态、泄漏检测及阀门井积水情况。', deadline: dateAdd(180), priority: 'orange', status: 'ongoing', distance: 800, person: '张建国', inspected: 8, total: 10, archiveCount: 3, hiddenCount: 2, startDate: '2025-06-01', endDate: '2025-06-15',
                    projectName: '南桥路燃气调压站',
                    risks: [
                        { name: '调压站压力表失效', type: '设备故障', level: 'red', levelLabel: '重大', measures: '定期校验、及时更换失效压力表、建立设备台账', basis: '《城镇燃气管理条例》' },
                        { name: '调压器运行异响', type: '设备异常', level: 'yellow', levelLabel: '一般', measures: '停机检查、润滑保养、必要时更换调压器', basis: '《燃气设施运行维护规程》' }
                    ],
                    points: [
                        { name: '调压器运行区域', order: 1, riskType: '设备异常', checkpoints: ['运行压力是否在正常范围', '有无异响、振动', '连接部位是否漏气'], history: ['2025-05-20 记录运行压力偏高，已调整'], checked: true },
                        { name: '过滤器区域', order: 2, riskType: '设备故障', checkpoints: ['过滤器压差是否在规定范围', '排污阀是否关闭严密', '滤芯是否堵塞'], history: ['2025-05-15 已更换滤芯'], checked: false },
                        { name: '阀门井', order: 3, riskType: '设备故障', checkpoints: ['井内无积水', '阀门启闭灵活', '无燃气泄漏'], history: ['2025-05-18 发现积水，已抽排'], checked: false },
                        { name: '泄漏检测点', order: 4, riskType: '燃气泄漏', checkpoints: ['调压站周边可燃气体浓度', '入户管接口', '放散管'], history: [], checked: false }
                    ]
                },
                {
                    id: 'GAS-2025-002', type: 'special', title: '奉浦大道商业综合体专项巡查', area: '奉城镇', location: '奉浦大道666号', requirements: '对商业综合体燃气设施进行专项检查，重点排查燃气泄漏、报警器运行等情况', desc: '针对奉浦大道商业综合体燃气用户开展专项巡查，核查燃气泄漏、报警器运行及表具状态。', deadline: dateAdd(120), priority: 'orange', status: 'ongoing', distance: 1200, person: '李明华', inspected: 12, total: 15, archiveCount: 5, hiddenCount: 1, startDate: '2025-06-05', endDate: '2025-06-20',
                    projectName: '奉浦大道商业综合体',
                    risks: [
                        { name: '管道支护结构松动', type: '结构安全', level: 'orange', levelLabel: '较大', measures: '加固支护结构、定期巡检、限制周边堆载', basis: '《燃气工程项目规范》' }
                    ],
                    points: [
                        { name: '商业综合体燃气表具间', order: 1, riskType: '燃气泄漏', checkpoints: ['表具接口是否漏气', '计量表运行是否正常', '通风是否良好'], history: ['2025-06-01 表具接口微漏，已紧固'], checked: false },
                        { name: '餐饮后厨燃气管道', order: 2, riskType: '结构安全', checkpoints: ['管道支护是否牢固', '软管是否老化', '可燃气体报警器是否运行'], history: ['2025-05-28 报警器离线，已修复'], checked: false },
                        { name: '锅炉房供气管道', order: 3, riskType: '设备异常', checkpoints: ['阀门启闭状态', '压力表示数', '自动切断阀测试'], history: [], checked: false }
                    ]
                },
                {
                    id: 'GAS-2025-003', type: 'review', title: '金海社区燃气管道季度检查', area: '庄行镇', location: '金海公路沿线', requirements: '对社区燃气管道进行季度检查，记录阀门井、调压箱状态', desc: '金海社区燃气管线季度检查任务，覆盖阀门井、调压箱及管道标识完整性。', deadline: dateAdd(360), priority: 'blue', status: 'completed', distance: 1500, person: '王志强', inspected: 20, total: 20, archiveCount: 2, hiddenCount: 0, startDate: '2025-05-20', endDate: '2025-06-10',
                    projectName: '金海社区燃气管道A段',
                    risks: [
                        { name: '管道腐蚀泄漏隐患', type: '管道老化', level: 'orange', levelLabel: '较大', measures: '防腐修复、壁厚检测、必要时更换管段', basis: '《城镇燃气管理条例》' }
                    ],
                    points: [
                        { name: '阀门井A01', order: 1, riskType: '设备故障', checkpoints: ['井盖是否完好', '井内无积水', '阀门无锈蚀、启闭灵活'], history: ['2025-05-10 井盖破损，已更换'], checked: true },
                        { name: '调压箱B02', order: 2, riskType: '设备异常', checkpoints: ['箱体无锈蚀', '运行压力正常', '放散管畅通'], history: [], checked: true },
                        { name: '管道标识段C03', order: 3, riskType: '管道老化', checkpoints: ['标识桩是否缺失', '警示带是否完好', '沿线无占压'], history: ['2025-05-12 标识桩缺失2处，已补设'], checked: true }
                    ]
                },
                {
                    id: 'GAS-2025-004', type: 'daily', title: '海湾旅游区供气站安全巡查', area: '海湾镇', location: '海湾路88号', requirements: '检查供气站设备运行、消防器材、安全标识等情况', desc: '海湾旅游区供气站安全巡查，检查供气设备运行、消防器材及安全标识。', deadline: dateAdd(240), priority: 'blue', status: 'completed', distance: 2000, person: '陈秀英', inspected: 6, total: 6, archiveCount: 1, hiddenCount: 1, startDate: '2025-06-08', endDate: '2025-06-14',
                    projectName: '海湾旅游区供气站',
                    risks: [
                        { name: '供气站安全间距不足', type: '布局缺陷', level: 'yellow', levelLabel: '一般', measures: '优化站内布局、增设隔离设施、严格动火管理', basis: '《燃气供应站设计规范》' }
                    ],
                    points: [
                        { name: '供气站储气区', order: 1, riskType: '布局缺陷', checkpoints: ['安全间距是否满足', '消防器材配备齐全', '静电接地完好'], history: ['2025-06-05 灭火器过期，已更换'], checked: true },
                        { name: '供气站加气区', order: 2, riskType: '燃气泄漏', checkpoints: ['加气机接口无泄漏', '拉断阀功能正常', '车辆静电接地'], history: [], checked: true }
                    ]
                },
                {
                    id: 'GAS-2025-005', type: 'temporary', title: '青村镇老旧小区管网应急排查', area: '青村镇', location: '青村中路沿线', requirements: '对老旧小区燃气管网进行应急排查，重点排查漏气、腐蚀、第三方破坏等隐患', desc: '青村镇老旧小区燃气管网应急排查任务，重点排查漏气、腐蚀及第三方破坏隐患。', deadline: dateAdd(60), priority: 'red', status: 'overdue', distance: 900, person: '刘大伟', inspected: 3, total: 10, archiveCount: 4, hiddenCount: 5, startDate: '2025-06-01', endDate: '2025-06-10',
                    projectName: '青村镇老旧管网改造区',
                    risks: [
                        { name: '阀门井积水严重', type: '设备故障', level: 'blue', levelLabel: '低', measures: '疏通排水、更换密封件、定期抽排', basis: '《燃气设施运行维护规程》' },
                        { name: '管道腐蚀泄漏隐患', type: '管道老化', level: 'orange', levelLabel: '较大', measures: '防腐修复、壁厚检测、必要时更换管段', basis: '《城镇燃气管理条例》' }
                    ],
                    points: [
                        { name: '老旧管网主干线D01', order: 1, riskType: '管道老化', checkpoints: ['管线无明显腐蚀', '沿线无第三方施工', '阴极保护电位正常'], history: ['2025-05-25 发现轻微腐蚀，已防腐处理'], checked: false },
                        { name: '阀门井E02', order: 2, riskType: '设备故障', checkpoints: ['井内无积水', '阀门无泄漏', '井盖完好'], history: ['2025-05-30 积水严重，已抽排并更换密封'], checked: false },
                        { name: '入户引入管F03', order: 3, riskType: '第三方破坏', checkpoints: ['管线上方无占压', '引入管无锈蚀', '用户私接情况'], history: ['2025-06-02 发现用户私接灶具，已整改'], checked: false }
                    ]
                }
            ]
        },

        // 隐患事件（全生命周期）
        hiddenDangers: [
            {
                id: 'HD-2026-0001', eventNo: 'HD-2026-0001', title: '南桥镇某工地脚手架倾斜',
                type: '脚手架工程', level: 'red', domain: 'build',
                location: { address: '南桥镇某在建工地', lat: 30.915, lng: 121.478 },
                hazardPoint: '商场东侧外立面三层',
                description: '监测系统检测到脚手架倾斜速率异常，需立即处置。',
                photos: [], reporter: { name: '张明', role: '巡查人员' }, reportTime: dateAdd(-120),
                source: 'iot', status: 'dispatched', responsibleUnit: '施工单位 A', handler: '李工',
                deadline: dateAdd(240), relatedRiskId: 'build-0015',
                timeline: [
                    { step: '上报', actor: '系统', time: dateAdd(-120), action: '监测预警自动上报', result: '已受理', status: 'completed' },
                    { step: '审核', actor: '王主任', time: dateAdd(-110), action: '审核通过，转派发', result: '属实，派发处置', status: 'completed' },
                    { step: '分派', actor: '平台', time: dateAdd(-100), action: '分派至施工单位 A', result: '李工接单', status: 'active' },
                    { step: '处置', actor: '李工', time: '', action: '待处置', result: '', status: 'pending' },
                    { step: '验收', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            },
            {
                id: 'HD-2026-0002', eventNo: 'HD-2026-0002', title: '奉城镇燃气管线泄漏',
                type: '燃气管线', level: 'red', domain: 'gas',
                location: { address: '奉城镇某路段', lat: 30.938, lng: 121.558 },
                hazardPoint: '奉城镇浦卫东路 18 号建工一村外墟',
                description: '路面有明显燃气异味，疑似管线泄漏。',
                photos: [], reporter: { name: '张明', role: '巡查人员' }, reportTime: dateAdd(-240),
                source: 'manual', status: 'handling', responsibleUnit: '燃气公司', handler: '赵师傅',
                deadline: dateAdd(60), relatedRiskId: 'gas-0001',
                timeline: [
                    { step: '上报', actor: '张明', time: dateAdd(-240), action: '现场上报', result: '已受理', status: 'completed' },
                    { step: '审核', actor: '平台', time: dateAdd(-230), action: '自动审核通过', result: '紧急事件', status: 'completed' },
                    { step: '分派', actor: '平台', time: dateAdd(-220), action: '分派至燃气公司', result: '赵师傅接单', status: 'completed' },
                    { step: '处置', actor: '赵师傅', time: dateAdd(-180), action: '现场抢修中', result: '已关阀，正在查找漏点', status: 'active' },
                    { step: '验收', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            },
            {
                id: 'HD-2026-0003', eventNo: 'HD-2026-0003', title: '庄行镇某大厦幕墙密封胶老化',
                type: '玻璃幕墙', level: 'orange', domain: 'curtain',
                location: { address: '庄行镇某大厦 15 层', lat: 30.965, lng: 121.425 },
                hazardPoint: '庄行镇某大厦 15 层东南侧幕墙',
                description: '幕墙密封胶多处开裂，存在渗漏和脱落风险。',
                photos: [], reporter: { name: '李伟', role: '巡查人员' }, reportTime: dateAdd(-1440),
                source: 'inspection', status: 'closed', responsibleUnit: '物业 B', handler: '孙主管',
                deadline: dateAdd(-60), relatedRiskId: 'curtain-0003',
                timeline: [
                    { step: '上报', actor: '李伟', time: dateAdd(-1440), action: '巡查发现上报', result: '已受理', status: 'completed' },
                    { step: '审核', actor: '王主任', time: dateAdd(-1400), action: '审核通过', result: '非紧急，限期整改', status: 'completed' },
                    { step: '分派', actor: '平台', time: dateAdd(-1380), action: '分派至物业 B', result: '孙主管接单', status: 'completed' },
                    { step: '处置', actor: '孙主管', time: dateAdd(-1000), action: '完成密封胶更换', result: '整改完成', status: 'completed' },
                    { step: '验收', actor: '李伟', time: dateAdd(-720), action: '现场复查', result: '验收通过', status: 'completed' }
                ]
            },
            {
                id: 'HD-2026-0004', eventNo: 'HD-2026-0004', title: '南桥镇某路口信号灯故障',
                type: '交通安全', level: 'yellow', domain: 'traffic',
                location: { address: '南桥镇某路口', lat: 30.910, lng: 121.470 },
                hazardPoint: '南桥镇运河路与南亭公路路口东南角',
                description: '红绿灯不亮，交通秩序混乱。',
                photos: [], reporter: { name: '张明', role: '巡查人员' }, reportTime: dateAdd(-60),
                source: 'manual', status: 'reported', responsibleUnit: '交警队', handler: '',
                deadline: dateAdd(120), relatedRiskId: 'traffic-0001',
                timeline: [
                    { step: '上报', actor: '张明', time: dateAdd(-60), action: '现场上报', result: '已受理', status: 'active' },
                    { step: '审核', actor: '', time: '', action: '待审核', result: '', status: 'pending' },
                    { step: '分派', actor: '', time: '', action: '待分派', result: '', status: 'pending' },
                    { step: '处置', actor: '', time: '', action: '待处置', result: '', status: 'pending' },
                    { step: '验收', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            },
            {
                id: 'HD-2026-0005', eventNo: 'HD-2026-0005', title: '南桥镇某农村自建房墙体开裂',
                type: '农村自建房', level: 'orange', domain: 'selfbuild',
                location: { address: '南桥镇光明村某号', lat: 30.922, lng: 121.462 },
                hazardPoint: '二层承重墙及屋顶圈梁',
                description: '巡查发现该自建房二层承重墙出现明显斜向裂缝，屋顶圈梁局部开裂，存在结构安全隐患。',
                photos: [], reporter: { name: '张明', role: '巡查人员' }, reportTime: dateAdd(-90),
                source: 'inspection', status: 'dispatched', responsibleUnit: '南桥镇城建中心', handler: '刘工',
                deadline: dateAdd(360), relatedRiskId: 'selfbuild-0001',
                timeline: [
                    { step: '上报', actor: '张明', time: dateAdd(-90), action: '巡查发现上报', result: '已受理', status: 'completed' },
                    { step: '审核', actor: '王主任', time: dateAdd(-80), action: '审核通过', result: '结构隐患属实', status: 'completed' },
                    { step: '分派', actor: '平台', time: dateAdd(-70), action: '分派至南桥镇城建中心', result: '刘工接单', status: 'active' },
                    { step: '处置', actor: '刘工', time: '', action: '待处置', result: '', status: 'pending' },
                    { step: '验收', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            }
        ],

        // 系统用户（移动端后台用户管理）
        users: [
            { id: 'U-0001', name: '王主任', phone: '13900139000', role: 'manager', dept: '区应急管理局', position: '应急指挥长', status: 'enabled', avatar: '' },
            { id: 'U-0002', name: '李巡查', phone: '13800138001', role: 'inspector', dept: '区建管委', position: '巡查人员', status: 'enabled', avatar: '' },
            { id: 'U-0003', name: '张工', phone: '13800138005', role: 'enterprise', dept: '施工单位 A', position: '安全员', status: 'enabled', avatar: '' },
            { id: 'U-0004', name: '赵师傅', phone: '13800138002', role: 'inspector', dept: '燃气集团', position: '燃气专家', status: 'enabled', avatar: '' },
            { id: 'U-0005', name: '市民用户', phone: '13800138000', role: 'public', dept: '上海市奉贤区', position: '普通市民', status: 'enabled', avatar: '' },
            { id: 'U-0006', name: '孙主管', phone: '13800138003', role: 'enterprise', dept: '某物业', position: '物业负责人', status: 'disabled', avatar: '' }
        ],

        // 权限审批（移动端后台审批）
        pendingApprovals: [
            { id: 'AP-0001', applicant: '周某某', type: 'account', targetRole: 'inspector', reason: '新入职巡查人员，需开通巡查账号', time: dateAdd(-120), status: 'pending', result: '', handler: '', remark: '' },
            { id: 'AP-0002', applicant: '吴工', type: 'role', targetRole: 'manager', reason: '负责南区工地监管，申请提升为管理人员', time: dateAdd(-240), status: 'pending', result: '', handler: '', remark: '' },
            { id: 'AP-0003', applicant: '郑某', type: 'permission', targetRole: 'enterprise', reason: '企业安全员申请隐患处置权限', time: dateAdd(-480), status: 'approved', result: 'approved', handler: '王主任', remark: '同意开通' },
            { id: 'AP-0004', applicant: '钱某', type: 'account', targetRole: 'public', reason: '普通用户申请成为企业人员', time: dateAdd(-720), status: 'rejected', result: 'rejected', handler: '王主任', remark: '资料不全，请补充后再申请' }
        ],

        // 消息中心
        messages: [
            { id: 'MSG-0001', type: 'warning', title: '南桥镇脚手架风险升级', desc: '监测系统检测到南桥镇某在建工地脚手架倾斜速率异常，风险等级由中升至高，请立即处置。', time: dateAdd(-10), unread: true, link: 'hidden-danger-detail.html?id=HD-2026-0001' },
            { id: 'MSG-0002', type: 'approval', title: '隐患整改方案待审批', desc: '李伟提交了《奉城镇燃气管线隐患整改方案》，等待您审批。', time: dateAdd(-60), unread: true, link: '' },
            { id: 'MSG-0003', type: 'task', title: '新巡查任务已分配', desc: '「南桥镇日常巡查」任务已分配给您，计划完成时间：今日 18:00。', time: dateAdd(-120), unread: true, link: 'inspection-execute.html?id=IT-2026-0001' },
            { id: 'MSG-0004', type: 'approval', title: '整改报告审批通过', desc: '您提交的《海湾镇幕墙隐患整改报告》已通过王主任审批。', time: dateAdd(-180), unread: true, link: 'hidden-danger-detail.html?id=HD-2026-0003' },
            { id: 'MSG-0005', type: 'task', title: '巡查任务即将到期', desc: '您有 2 项巡查任务将于今日 18:00 到期，请尽快完成。', time: dateAdd(-300), unread: true, link: 'inspection-domains.html' },
            { id: 'MSG-0006', type: 'system', title: '知识栏目更新通知', desc: '本月知识栏目已更新 8 篇，涵盖防汛防台、建筑安全等内容。', time: dateAdd(-1440), unread: false, link: '' },
            { id: 'MSG-0007', type: 'system', title: '系统维护完成通知', desc: '平台已于 06-12 凌晨完成系统升级，新增数据分析模块。', time: dateAdd(-2880), unread: false, link: '' }
        ],

        // 监测点
        monitoringPoints: [
            { id: 'MP-0001', name: '南桥某工地基坑位移监测点 A1', domain: 'build', indicator: '水平位移', value: '18.2', unit: 'mm', status: 'red', updateTime: dateAdd(-5), history: generateHistory(18, 25, 15, 30) },
            { id: 'MP-0002', name: '奉城某工地塔吊荷载', domain: 'build', indicator: '吊重', value: '85', unit: '%', status: 'orange', updateTime: dateAdd(-10), history: generateHistory(70, 90, 60, 95) },
            { id: 'MP-0003', name: '庄行某路段燃气浓度', domain: 'gas', indicator: '甲烷浓度', value: '0.02', unit: '%LEL', status: 'green', updateTime: dateAdd(-3), history: generateHistory(0.01, 0.05, 0.01, 0.06) },
            { id: 'MP-0004', name: '金汇某大厦幕墙倾斜', domain: 'curtain', indicator: '倾斜角', value: '2.1', unit: '‰', status: 'green', updateTime: dateAdd(-15), history: generateHistory(1.5, 2.5, 1.0, 3.0) },
            { id: 'MP-0005', name: '海湾某路口车流量', domain: 'traffic', indicator: '饱和度', value: '0.92', unit: '', status: 'orange', updateTime: dateAdd(-8), history: generateHistory(0.6, 1.0, 0.5, 1.0) },
            { id: 'MP-0006', name: '青村某自建房倾斜', domain: 'selfbuild', indicator: '倾斜率', value: '4.5', unit: '‰', status: 'red', updateTime: dateAdd(-20), history: generateHistory(3.0, 5.0, 2.5, 5.5) }
        ],

        // 预警统计
        warningStats: {
            byLevel: { red: 2, orange: 2, yellow: 1, blue: 0 },
            byDomain: { build: 3, gas: 1, traffic: 1, curtain: 0, falling: 0, selfbuild: 0 },
            byDate: [
                { date: '06-15', red: 0, orange: 1, yellow: 0, blue: 0 },
                { date: '06-16', red: 1, orange: 0, yellow: 1, blue: 0 },
                { date: '06-17', red: 1, orange: 1, yellow: 0, blue: 0 },
                { date: '06-18', red: 0, orange: 0, yellow: 0, blue: 0 },
                { date: '06-19', red: 0, orange: 0, yellow: 0, blue: 0 },
                { date: '06-20', red: 0, orange: 0, yellow: 0, blue: 0 },
                { date: '06-21', red: 0, orange: 0, yellow: 0, blue: 0 }
            ]
        },

        // 一张图点位数据（上海奉贤区）
        oneMapPoints: {
            inspectionTasks: [
                { id: 'IT-2026-0001', name: '南桥镇日常巡查', type: 'task', status: 'pending', lat: 30.918, lng: 121.474, area: '南桥镇', responsible: '张巡查', time: dateAdd(-120) },
                { id: 'IT-2026-0002', name: '奉城镇基坑专项巡查', type: 'task', status: 'ongoing', lat: 30.935, lng: 121.563, area: '奉城镇', responsible: '李巡查', time: dateAdd(-240) },
                { id: 'IT-2026-0003', name: '庄行镇燃气设施巡查', type: 'task', status: 'pending', lat: 30.967, lng: 121.421, area: '庄行镇', responsible: '王巡查', time: dateAdd(-360) },
                { id: 'IT-2026-0004', name: '海湾镇防汛巡查', type: 'task', status: 'ongoing', lat: 30.833, lng: 121.533, area: '海湾镇', responsible: '赵巡查', time: dateAdd(-480) },
                { id: 'IT-2026-0005', name: '金汇镇交通设施巡查', type: 'task', status: 'pending', lat: 30.983, lng: 121.510, area: '金汇镇', responsible: '周巡查', time: dateAdd(-600) }
            ],
            hiddenDangers: [
                { id: 'HD-2026-0001', name: '南桥某工地脚手架倾斜', type: 'danger', level: 'red', status: 'handling', lat: 30.915, lng: 121.478, area: '南桥镇', time: dateAdd(-60), responsible: '李工' },
                { id: 'HD-2026-0002', name: '奉城某小区燃气异味', type: 'danger', level: 'orange', status: 'dispatched', lat: 30.938, lng: 121.558, area: '奉城镇', time: dateAdd(-180), responsible: '赵师傅' },
                { id: 'HD-2026-0003', name: '庄行某路口信号灯故障', type: 'danger', level: 'yellow', status: 'closed', lat: 30.965, lng: 121.425, area: '庄行镇', time: dateAdd(-2880), responsible: '交警队' },
                { id: 'HD-2026-0004', name: '海湾某施工围挡破损', type: 'danger', level: 'blue', status: 'closed', lat: 30.838, lng: 121.528, area: '海湾镇', time: dateAdd(-7200), responsible: '施工单位' },
                { id: 'HD-2026-0006', name: '金汇某大厦幕墙密封胶老化', type: 'danger', level: 'orange', status: 'handling', lat: 30.980, lng: 121.505, area: '金汇镇', time: dateAdd(-480), responsible: '孙主管' },
                { id: 'HD-2026-0007', name: '南桥某自建房倾斜', type: 'danger', level: 'red', status: 'dispatched', lat: 30.922, lng: 121.462, area: '南桥镇', time: dateAdd(-90), responsible: '刘工' }
            ],
            rectifications: [
                { id: 'HD-2026-0003', name: '庄行某路口信号灯不亮', type: 'rectification', status: 'completed', lat: 30.965, lng: 121.425, area: '庄行镇', time: dateAdd(-60), responsible: '交警支队' },
                { id: 'HD-2026-0004', name: '海湾施工围挡破损', type: 'rectification', status: 'completed', lat: 30.838, lng: 121.528, area: '海湾镇', time: dateAdd(-120), responsible: '施工单位' },
                { id: 'HD-2026-0005', name: '南桥某大厦玻璃幕墙裂缝', type: 'rectification', status: 'processing', lat: 30.920, lng: 121.480, area: '南桥镇', time: dateAdd(-240), responsible: '物业' },
                { id: 'HD-2026-0008', name: '奉城某路段积水整改', type: 'rectification', status: 'processing', lat: 30.940, lng: 121.570, area: '奉城镇', time: dateAdd(-360), responsible: '市政' }
            ]
        },

        // 预警（支持在线确认 → 任务分派 → 处置反馈 → 验收归档闭环）
        warnings: [
            {
                id: 'W-0001', eventNo: 'W-2026-0001', level: 'red', title: '基坑位移超限预警', domain: 'build',
                location: '南桥镇某工地', time: dateAdd(-5), status: 'handling', handler: '李工',
                responsibleUnit: '施工单位 A', deadline: dateAdd(240),
                description: '监测点 A1 水平位移达到 18.2mm，超过红色预警阈值 18.0mm。',
                indicator: '水平位移', threshold: '18.0mm', currentValue: '18.2mm',
                photos: [],
                timeline: [
                    { step: '预警产生', actor: '监测系统', time: dateAdd(-5), action: '基坑位移超限自动预警', result: '红色预警', status: 'completed' },
                    { step: '在线确认', actor: '王主任', time: dateAdd(-4), action: '确认预警属实', result: '属实，需立即处置', status: 'completed' },
                    { step: '任务分派', actor: '平台', time: dateAdd(-3), action: '分派至施工单位 A', result: '李工接单', status: 'completed' },
                    { step: '处置反馈', actor: '李工', time: dateAdd(-2), action: '已采取加固措施', result: '支护加固中', status: 'active' },
                    { step: '验收归档', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            },
            {
                id: 'W-0002', eventNo: 'W-2026-0002', level: 'red', title: '燃气泄漏报警', domain: 'gas',
                location: '奉城镇某路段', time: dateAdd(-8), status: 'accepting', handler: '赵师傅',
                responsibleUnit: '燃气公司', deadline: dateAdd(60),
                description: '燃气浓度监测仪检测到甲烷浓度 0.08%LEL，超过红色预警阈值 0.05%LEL。',
                indicator: '甲烷浓度', threshold: '0.05%LEL', currentValue: '0.08%LEL',
                photos: [],
                timeline: [
                    { step: '预警产生', actor: '监测系统', time: dateAdd(-8), action: '燃气浓度超限自动预警', result: '红色预警', status: 'completed' },
                    { step: '在线确认', actor: '平台', time: dateAdd(-7), action: '确认预警属实', result: '属实，紧急处置', status: 'completed' },
                    { step: '任务分派', actor: '平台', time: dateAdd(-6), action: '分派至燃气公司', result: '赵师傅接单', status: 'completed' },
                    { step: '处置反馈', actor: '赵师傅', time: dateAdd(-3), action: '已关闭阀门并修复漏点', result: '泄漏已控制', status: 'completed' },
                    { step: '验收归档', actor: '', time: '', action: '待验收', result: '', status: 'active' }
                ]
            },
            {
                id: 'W-0003', eventNo: 'W-2026-0003', level: 'orange', title: '塔吊荷载预警', domain: 'build',
                location: '南桥镇某工地', time: dateAdd(-30), status: 'dispatched', handler: '张工',
                responsibleUnit: '施工单位 A', deadline: dateAdd(120),
                description: '塔吊当前吊重 85%，达到橙色预警阈值 80%。',
                indicator: '吊重占比', threshold: '80%', currentValue: '85%',
                photos: [],
                timeline: [
                    { step: '预警产生', actor: '监测系统', time: dateAdd(-30), action: '塔吊荷载超限自动预警', result: '橙色预警', status: 'completed' },
                    { step: '在线确认', actor: '王主任', time: dateAdd(-28), action: '确认预警属实', result: '属实，需控制吊重', status: 'completed' },
                    { step: '任务分派', actor: '平台', time: dateAdd(-26), action: '分派至施工单位 A', result: '张工接单', status: 'active' },
                    { step: '处置反馈', actor: '张工', time: '', action: '待处置', result: '', status: 'pending' },
                    { step: '验收归档', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            },
            {
                id: 'W-0004', eventNo: 'W-2026-0004', level: 'orange', title: '交通拥堵指数偏高', domain: 'traffic',
                location: '解放路', time: dateAdd(-60), status: 'pending', handler: '',
                responsibleUnit: '', deadline: '',
                description: '解放路早高峰拥堵指数达到 8.2，超过橙色预警阈值 7.5。',
                indicator: '拥堵指数', threshold: '7.5', currentValue: '8.2',
                photos: [],
                timeline: [
                    { step: '预警产生', actor: '交通监测系统', time: dateAdd(-60), action: '拥堵指数偏高自动预警', result: '橙色预警', status: 'active' },
                    { step: '在线确认', actor: '', time: '', action: '待确认', result: '', status: 'pending' },
                    { step: '任务分派', actor: '', time: '', action: '待分派', result: '', status: 'pending' },
                    { step: '处置反馈', actor: '', time: '', action: '待处置', result: '', status: 'pending' },
                    { step: '验收归档', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            },
            {
                id: 'W-0005', eventNo: 'W-2026-0005', level: 'yellow', title: '扬尘浓度轻微超标', domain: 'build',
                location: '奉城镇某工地', time: dateAdd(-120), status: 'closed', handler: '张工',
                responsibleUnit: '施工单位 B', deadline: dateAdd(-60),
                description: '扬尘浓度监测值 0.92mg/m³，超过黄色预警阈值 0.80mg/m³。',
                indicator: '扬尘浓度', threshold: '0.80mg/m³', currentValue: '0.92mg/m³',
                photos: [],
                timeline: [
                    { step: '预警产生', actor: '监测系统', time: dateAdd(-120), action: '扬尘浓度超标自动预警', result: '黄色预警', status: 'completed' },
                    { step: '在线确认', actor: '平台', time: dateAdd(-118), action: '确认预警属实', result: '属实', status: 'completed' },
                    { step: '任务分派', actor: '平台', time: dateAdd(-116), action: '分派至施工单位 B', result: '张工接单', status: 'completed' },
                    { step: '处置反馈', actor: '张工', time: dateAdd(-100), action: '已开启喷淋降尘', result: '浓度已回落至 0.65mg/m³', status: 'completed' },
                    { step: '验收归档', actor: '平台', time: dateAdd(-90), action: '验收通过', result: '已归档', status: 'completed' }
                ]
            }
        ],

        // 通讯录
        contacts: [
            { id: 'C-0001', name: '王主任', position: '应急指挥长', dept: '区应急管理局', phone: '13900139000', domain: '', orgLevel: 'district', isEmergency: true, isOnDuty: true, favorites: true, dutySchedule: ['值班','值班','休息','休息','值班','休息','休息'] },
            { id: 'C-0002', name: '李医生', position: '医疗急救', dept: '120 急救中心', phone: '120', domain: '', orgLevel: 'district', isEmergency: true, isOnDuty: true, favorites: false, dutySchedule: ['值班','值班','值班','值班','值班','值班','值班'] },
            { id: 'C-0003', name: '消防指挥', position: '消防救援', dept: '119 指挥中心', phone: '119', domain: '', orgLevel: 'district', isEmergency: true, isOnDuty: true, favorites: false, dutySchedule: ['值班','值班','值班','值班','值班','值班','值班'] },
            { id: 'C-0004', name: '刘科长', position: '行业管理', dept: '区建管委', phone: '13800138001', domain: 'build', orgLevel: 'industry', isEmergency: false, isOnDuty: true, favorites: true, dutySchedule: ['值班','休息','值班','休息','值班','休息','休息'] },
            { id: 'C-0005', name: '赵工', position: '燃气专家', dept: '燃气集团', phone: '13800138002', domain: 'gas', orgLevel: 'industry', isEmergency: false, isOnDuty: false, favorites: false, dutySchedule: ['休息','值班','休息','值班','休息','值班','休息'] },
            { id: 'C-0006', name: '孙主管', position: '物业负责人', dept: '某物业', phone: '13800138003', domain: 'curtain', orgLevel: 'industry', isEmergency: false, isOnDuty: false, favorites: false, dutySchedule: ['休息','休息','值班','值班','休息','休息','值班'] },
            { id: 'C-0007', name: '周警官', position: '交警联络员', dept: '交警支队', phone: '13800138004', domain: 'traffic', orgLevel: 'duty', isEmergency: false, isOnDuty: true, favorites: false, dutySchedule: ['值班','值班','休息','休息','值班','值班','休息'] }
        ],

        // 评估分析
        assessment: {
            score: 87,
            level: '良',
            dimensions: {
                timeliness: { label: '处置及时性', score: 92, weight: 30 },
                compliance: { label: '处置规范性', score: 85, weight: 25 },
                effectiveness: { label: '处置有效性', score: 88, weight: 25 },
                resource: { label: '资源投入合理性', score: 82, weight: 20 }
            },
            events: { total: 128, disposed: 119, onTimeRate: 93, recurrenceRate: 4 },
            efficiency: { avgTime: 4.2, passRate: 96, coverage: 91 },
            eventCategories: {
                emergency: { label: '突发事件', year: 12, month: 3, day: 0, mom: -8, rate: 92 },
                traffic: { label: '道路交通', year: 45, month: 8, day: 1, mom: 5, rate: 88 },
                safety: { label: '安全隐患', year: 56, month: 11, day: 2, mom: 12, rate: 85 },
                weather: { label: '气象预警', year: 15, month: 2, day: 0, mom: -3, rate: 96 }
            }
        },

        // 巡查轨迹
        patrolTracks: [
            {
                date: '2026-06-21',
                mode: 'full',
                distance: 12.5,
                duration: 240,
                coverage: '南桥镇、奉城镇',
                arrivalRate: 92,
                points: [
                    { lat: 30.915, lng: 121.478, time: dateAdd(-240), taskId: 'IT-2026-0001', completed: true },
                    { lat: 30.920, lng: 121.465, time: dateAdd(-180), taskId: 'IT-2026-0001', completed: true },
                    { lat: 30.935, lng: 121.563, time: dateAdd(-120), taskId: 'IT-2026-0002', completed: true },
                    { lat: 30.930, lng: 121.570, time: dateAdd(-60), taskId: 'IT-2026-0002', completed: false }
                ]
            }
        ],

        // 巡查执行历史记录（任务完成后写入）
        inspectionHistory: [],

        // 路线规划
        routePlans: [
            {
                date: '2026-06-21',
                points: [
                    { id: 'P1', name: '南桥镇某工地', lat: 30.915, lng: 121.478, eta: '09:30', type: 'task', completed: true },
                    { id: 'P2', name: '解放路交通监测点', lat: 30.910, lng: 121.470, eta: '10:15', type: 'task', completed: true },
                    { id: 'P3', name: '奉城镇某基坑', lat: 30.935, lng: 121.563, eta: '11:00', type: 'danger', completed: false },
                    { id: 'P4', name: '金汇某小区燃气调压站', lat: 30.980, lng: 121.505, eta: '11:45', type: 'danger', completed: false }
                ]
            }
        ],

        // 辅助决策事件
        decisionEvents: [
            { id: 'DE-0001', category: 'emergency', title: '南桥某工地脚手架坍塌险情', region: '南桥镇', level: 'red', time: dateAdd(-120), status: 'disposed', disposalRate: 100, responsible: '区应急管理局', description: '监测发现某工地脚手架出现倾斜，已组织人员撤离并加固。', mom: -8 },
            { id: 'DE-0002', category: 'traffic', title: '解放路施工拥堵', region: '南桥镇', level: 'orange', time: dateAdd(-180), status: 'disposed', disposalRate: 100, responsible: '交警支队', description: '解放路施工导致早高峰拥堵，已加派警力疏导。', mom: 5 },
            { id: 'DE-0003', category: 'safety', title: '奉城某大厦幕墙玻璃自爆', region: '奉城镇', level: 'orange', time: dateAdd(-240), status: 'handling', disposalRate: 60, responsible: '区住建委', description: '大厦 15 层幕墙玻璃自爆，已设置警戒区域，正在安排维修。', mom: 12 },
            { id: 'DE-0004', category: 'weather', title: '台风蓝色预警响应', region: '全区', level: 'blue', time: dateAdd(-300), status: 'disposed', disposalRate: 100, responsible: '区防汛办', description: '台风蓝色预警已启动，各单位进入应急响应状态。', mom: -3 },
            { id: 'DE-0005', category: 'emergency', title: '庄行某路段燃气泄漏', region: '庄行镇', level: 'red', time: dateAdd(-60), status: 'handling', disposalRate: 40, responsible: '燃气集团', description: '路面出现燃气异味，疑似管线泄漏，正在抢修中。', mom: 0 }
        ],

        // 实时发布
        realTimeReleases: [
            { id: 'RT-0001', type: 'warning', level: 'red', title: '基坑位移超限紧急预警', unit: '区应急管理局', region: '南桥镇某工地', time: dateAdd(-5), status: '处置中', content: '监测点 A1 水平位移达 18.2mm，超过预警阈值，请立即组织人员撤离并启动应急预案。', contact: '李工 13800138001', read: false },
            { id: 'RT-0002', type: 'notice', level: 'orange', title: '关于加强汛期建筑工地巡查的通知', unit: '区建管委', region: '全区', time: dateAdd(-60), status: '已发布', content: '请各工地严格落实汛期值班制度，重点检查基坑、脚手架、临建板房等部位。', contact: '刘科长 13800138001', read: false },
            { id: 'RT-0003', type: 'tip', level: 'blue', title: '高温天气作业提示', unit: '区应急管理局', region: '全区', time: dateAdd(-120), status: '已发布', content: '未来三天最高气温将达 35℃ 以上，请合理安排户外作业时间，做好防暑降温措施。', contact: '王主任 13900139000', read: false },
            { id: 'RT-0004', type: 'warning', level: 'orange', title: '塔吊荷载预警', unit: '区安监站', region: '奉城镇某工地', time: dateAdd(-30), status: '已分派', content: '塔吊当前吊重 85%，接近额定荷载，请严格控制吊装重量。', contact: '张工 13800138005', read: false }
        ],

        // 在线排查任务（5.1 在线排查与处置）
        onlineInspectionTasks: [
            { id: 'OI-2026-0001', type: 'daily', title: '南桥镇日常排查', area: '南桥镇', location: '南桥路沿线', level: 'red', source: '任务派发', deadline: dateAdd(180), status: 'pending', description: '', result: '' },
            { id: 'OI-2026-0002', type: 'special', title: '汛期基坑专项排查', area: '奉城镇', location: '奉浦大道在建项目', level: 'red', source: '预警联动', deadline: dateAdd(120), status: 'pending', description: '', result: '' },
            { id: 'OI-2026-0003', type: 'temporary', title: '投诉核查：某小区燃气异味', area: '庄行镇', location: '庄行小区', level: 'orange', source: '公众举报', deadline: dateAdd(60), status: 'pending', description: '', result: '' },
            { id: 'OI-2026-0004', type: 'review', title: '幕墙隐患整改复查', area: '金汇镇', location: '金汇某大厦', level: 'orange', source: '复查任务', deadline: dateAdd(360), status: 'pending', description: '', result: '' }
        ],

        // 分数评价数据集（6.2 分数评价）
        scoreEvaluations: [
            { id: 'SE-0001', eventNo: 'HD-2026-0003', title: '庄行镇某大厦幕墙密封胶老化', unit: '物业 B', score: 94, level: '优', timeliness: 96, compliance: 92, effectiveness: 95, resource: 92, reason: '' },
            { id: 'SE-0002', eventNo: 'HD-2026-0002', title: '奉城镇燃气管线泄漏', unit: '燃气公司', score: 88, level: '良', timeliness: 90, compliance: 88, effectiveness: 90, resource: 84, reason: '资源投入略超预算' },
            { id: 'SE-0003', eventNo: 'HD-2026-0005', title: '某路口信号灯故障', unit: '交警队', score: 76, level: '良', timeliness: 82, compliance: 78, effectiveness: 75, resource: 68, reason: '处置用时偏长，流程记录不完整' },
            { id: 'SE-0004', eventNo: 'HD-2026-0006', title: '施工围挡破损', unit: '施工单位', score: 58, level: '差', timeliness: 60, compliance: 55, effectiveness: 60, resource: 55, reason: '复发 2 次，整改不规范' },
            { id: 'SE-0005', eventNo: 'HD-2026-0007', title: '某大厦玻璃幕墙裂缝', unit: '物业', score: 91, level: '良', timeliness: 94, compliance: 90, effectiveness: 92, resource: 88, reason: '' }
        ],

        // 事件分类统计（6.1 事件分类展示）
        eventCategories: {
            emergency: { label: '突发事件', year: 12, month: 3, day: 0, mom: -8, rate: 92 },
            traffic: { label: '道路交通', year: 45, month: 8, day: 1, mom: 5, rate: 88 },
            safety: { label: '安全隐患', year: 56, month: 11, day: 2, mom: 12, rate: 85 },
            weather: { label: '气象预警', year: 15, month: 2, day: 0, mom: -3, rate: 96 }
        }
    };

    DataStore.getTask = function (id) {
        var found = this.inspectionTasks.find(function (t) { return t.id === id; });
        if (found) return found;
        var domains = this.domainInspectionTasks || {};
        for (var domain in domains) {
            found = domains[domain].find(function (t) { return t.id === id; });
            if (found) return found;
        }
        return null;
    };
    DataStore.getHiddenDanger = function (id) {
        return this.hiddenDangers.find(function (h) { return h.id === id; });
    };
    DataStore.getMessage = function (id) {
        return this.messages.find(function (m) { return m.id === id; });
    };
    DataStore.getContact = function (id) {
        return this.contacts.find(function (c) { return c.id === id; });
    };
    DataStore.getKnowledge = function (id) {
        var all = [].concat(
            this.knowledge.laws,
            this.knowledge.policies,
            this.knowledge.standards,
            this.knowledge.floodTyphoon
        );
        return all.find(function (item) { return item.id === id; });
    };
    DataStore.getReport = function (id) {
        return this.myReports.find(function (r) { return r.id === id; });
    };
    DataStore.addReport = function (report) {
        this.myReports.unshift(report);
        this.myFeedback.unshift({
            id: report.id,
            title: report.title,
            status: report.status,
            statusLabel: '待受理',
            updateTime: report.reportTime,
            reply: '您的反馈已收到，正在分派处理。'
        });
        // 同时生成一条隐患，进入隐患处置流程
        this.hiddenDangers.unshift({
            id: report.id,
            eventNo: report.id,
            title: report.title,
            type: report.type,
            level: report.level || 'yellow',
            domain: report.domain || 'other',
            location: { address: report.location, lat: 0, lng: 0 },
            description: report.description,
            photos: report.photos || [],
            videos: report.videos || [],
            audios: report.audios || [],
            gps: report.gps || null,
            extra: report.extra || {},
            reporter: { name: this.user.name, role: this.user.roleLabel },
            reportTime: report.reportTime,
            source: 'public',
            status: 'reported',
            responsibleUnit: '',
            handler: '',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            relatedRiskId: report.relatedRiskId || '',
            timeline: [
                { step: '上报', actor: this.user.name, time: report.reportTime, action: '随手拍上报', result: '已受理', status: 'active' },
                { step: '审核', actor: '', time: '', action: '待审核', result: '', status: 'pending' },
                { step: '分派', actor: '', time: '', action: '待分派', result: '', status: 'pending' },
                { step: '处置', actor: '', time: '', action: '待处置', result: '', status: 'pending' },
                { step: '验收', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
            ]
        });
    };

    // 恢复实时发布阅读状态
    (function restoreReleaseReadState() {
        var readState = localStorage.getItem('risk-release-read');
        if (readState) {
            try {
                var readIds = JSON.parse(readState);
                DataStore.realTimeReleases.forEach(function(item) {
                    if (readIds.indexOf(item.id) !== -1) item.read = true;
                });
            } catch (e) {}
        }
    })();

    DataStore.getRealTimeRelease = function (id) {
        return this.realTimeReleases.find(function (r) { return r.id === id; });
    };
    DataStore.getDecisionEvent = function (id) {
        return this.decisionEvents.find(function (e) { return e.id === id; });
    };
    DataStore.getRoutePlan = function (id) {
        return this.routePlans.find(function (r) { return r.id === id; });
    };
    DataStore.getPatrolTrack = function (id) {
        return this.patrolTracks.find(function (t) { return t.id === id; });
    };
    DataStore.getScoreEvaluation = function (id) {
        return this.scoreEvaluations.find(function (s) { return s.id === id; });
    };
    DataStore.getOnlineInspectionTask = function (id) {
        return this.onlineInspectionTasks.find(function (t) { return t.id === id; });
    };
    DataStore.markReleaseRead = function (id) {
        var item = this.getRealTimeRelease(id);
        if (item) item.read = true;
        var readIds = this.realTimeReleases.filter(function (r) { return r.read; }).map(function (r) { return r.id; });
        localStorage.setItem('risk-release-read', JSON.stringify(readIds));
    };
    DataStore.markAllReleasesRead = function () {
        this.realTimeReleases.forEach(function (r) { r.read = true; });
        var readIds = this.realTimeReleases.map(function (r) { return r.id; });
        localStorage.setItem('risk-release-read', JSON.stringify(readIds));
    };
    DataStore.submitOnlineInspection = function (result) {
        // result: { taskId, conclusion, hiddenDanger, disposal, handler, deadline, photos }
        var task = this.getOnlineInspectionTask(result.taskId);
        if (task) {
            task.status = 'completed';
            task.result = result;
        }
        // 生成隐患记录
        if (result.conclusion === 'abnormal' || result.conclusion === 'review') {
            var eventNo = 'HD-' + new Date().getFullYear() + '-' + String(this.hiddenDangers.length + 1).padStart(4, '0');
            this.hiddenDangers.unshift({
                id: eventNo,
                eventNo: eventNo,
                title: result.hiddenDanger.title || task.title,
                type: result.hiddenDanger.type || '其他',
                level: result.hiddenDanger.level || 'yellow',
                domain: result.hiddenDanger.domain || 'other',
                location: { address: result.hiddenDanger.location || task.location, lat: 0, lng: 0 },
                description: result.hiddenDanger.description || '',
                photos: result.photos || [],
                reporter: { name: this.user.name, role: this.user.roleLabel },
                reportTime: new Date().toISOString(),
                source: 'onlineInspection',
                status: result.disposal === 'immediate' ? 'handling' : 'reported',
                responsibleUnit: result.disposal === 'immediate' ? this.user.org : (result.responsibleUnit || ''),
                handler: result.disposal === 'immediate' ? this.user.name : '',
                deadline: result.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                relatedRiskId: result.hiddenDanger.relatedRiskId || '',
                timeline: [
                    { step: '上报', actor: this.user.name, time: new Date().toISOString(), action: '在线排查上报', result: '已受理', status: 'active' },
                    { step: '审核', actor: '', time: '', action: '待审核', result: '', status: 'pending' },
                    { step: '分派', actor: '', time: '', action: '待分派', result: '', status: 'pending' },
                    { step: '处置', actor: '', time: '', action: '待处置', result: '', status: 'pending' },
                    { step: '验收', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            });
        }
        return true;
    };
    DataStore.submitDisposalFeedback = function (hiddenDangerId, feedback) {
        var hd = this.getHiddenDanger(hiddenDangerId);
        if (!hd) return false;
        hd.status = 'accepting';
        hd.timeline.forEach(function (step) {
            if (step.step === '处置') {
                step.status = 'completed';
                step.time = feedback.time || new Date().toISOString();
                step.result = feedback.measures || '已处置';
            }
        });
        hd.timeline.push({
            step: '验收',
            actor: '',
            time: '',
            action: '待验收',
            result: '',
            status: 'pending'
        });
        return true;
    };

    DataStore.getWarning = function (id) {
        return this.warnings.find(function (w) { return w.id === id; });
    };

    DataStore.confirmAndDispatchWarning = function (id, data) {
        var w = this.getWarning(id);
        if (!w) return false;
        var now = new Date().toISOString();
        w.status = 'dispatched';
        w.handler = data.handler || w.handler || '待分配';
        w.responsibleUnit = data.responsibleUnit || w.responsibleUnit || '';
        w.deadline = data.deadline || w.deadline || '';
        w.timeline.forEach(function (step) {
            if (step.step === '在线确认') {
                step.status = 'completed';
                step.time = now;
                step.actor = data.confirmer || '平台';
                step.result = '预警属实';
            }
            if (step.step === '任务分派') {
                step.status = 'completed';
                step.time = now;
                step.actor = '平台';
                step.result = '分派至 ' + (w.responsibleUnit || w.handler);
            }
            if (step.step === '处置反馈') {
                step.status = 'active';
                step.time = '';
                step.actor = w.handler;
                step.action = '待处置';
                step.result = '';
            }
        });
        return true;
    };

    DataStore.submitWarningFeedback = function (id, feedback) {
        var w = this.getWarning(id);
        if (!w) return false;
        var time = feedback.time || new Date().toISOString();
        w.status = 'accepting';
        w.timeline.forEach(function (step) {
            if (step.step === '处置反馈') {
                step.status = 'completed';
                step.time = time;
                step.actor = w.handler || '处置人';
                step.action = feedback.measures || '已处置';
                step.result = feedback.result || '处置完成';
            }
        });
        var acceptStep = w.timeline.find(function (s) { return s.step === '验收归档'; });
        if (acceptStep) {
            acceptStep.status = 'active';
            acceptStep.time = '';
            acceptStep.actor = '';
            acceptStep.action = '待验收';
            acceptStep.result = '';
        }
        return true;
    };

    DataStore.acceptWarning = function (id, result) {
        var w = this.getWarning(id);
        if (!w) return false;
        var now = new Date().toISOString();
        w.status = 'closed';
        w.timeline.forEach(function (step) {
            if (step.step === '验收归档') {
                step.status = 'completed';
                step.time = now;
                step.actor = result.actor || '验收人';
                step.action = '验收通过';
                step.result = result.remark || '已归档';
            }
        });
        return true;
    };

    DataStore.rejectWarning = function (id, result) {
        var w = this.getWarning(id);
        if (!w) return false;
        var now = new Date().toISOString();
        w.status = 'handling';
        w.timeline.forEach(function (step) {
            if (step.step === '处置反馈') {
                step.status = 'active';
                step.time = now;
                step.actor = w.handler || '处置人';
                step.action = '驳回重做';
                step.result = result.remark || '需重新处置';
            }
            if (step.step === '验收归档') {
                step.status = 'pending';
                step.time = '';
                step.actor = '';
                step.action = '待验收';
                step.result = '';
            }
        });
        return true;
    };

    DataStore.getUser = function (id) {
        return this.users.find(function (u) { return u.id === id; });
    };
    DataStore.addUser = function (user) {
        var id = 'U-' + String(this.users.length + 1).padStart(4, '0');
        user.id = id;
        user.status = user.status || 'enabled';
        this.users.unshift(user);
        return id;
    };
    DataStore.updateUser = function (id, data) {
        var u = this.getUser(id);
        if (!u) return false;
        Object.keys(data).forEach(function (k) { u[k] = data[k]; });
        return true;
    };
    DataStore.toggleUserStatus = function (id) {
        var u = this.getUser(id);
        if (!u) return false;
        u.status = u.status === 'enabled' ? 'disabled' : 'enabled';
        return true;
    };

    DataStore.addAnnouncement = function (item) {
        var id = 'RT-' + String(this.realTimeReleases.length + 1).padStart(4, '0');
        var now = new Date().toISOString();
        var release = {
            id: id,
            type: item.type || 'notice',
            level: item.level || 'blue',
            title: item.title,
            unit: item.unit || DataStore.user.org,
            region: item.region || '全区',
            time: now,
            status: item.type === 'warning' ? '处置中' : '已发布',
            content: item.content,
            contact: item.contact || DataStore.user.name + ' ' + DataStore.user.phone,
            read: false
        };
        this.realTimeReleases.unshift(release);
        this.messages.unshift({
            id: 'MSG-' + Date.now(),
            type: 'system',
            title: '新' + (item.type === 'warning' ? '预警' : (item.type === 'tip' ? '提示' : '公告')) + '：' + item.title,
            desc: item.content.substring(0, 60) + (item.content.length > 60 ? '...' : ''),
            time: now,
            unread: true,
            link: 'real-time-release.html?id=' + id
        });
        return id;
    };

    DataStore.getApproval = function (id) {
        return this.pendingApprovals.find(function (a) { return a.id === id; });
    };
    DataStore.approveApproval = function (id, data) {
        var a = this.getApproval(id);
        if (!a || a.status !== 'pending') return false;
        var now = new Date().toISOString();
        a.status = 'approved';
        a.result = 'approved';
        a.handler = data.handler || '管理员';
        a.remark = data.remark || '审批通过';
        this.messages.unshift({
            id: 'MSG-' + Date.now(),
            type: 'approval',
            title: '权限申请已通过',
            desc: a.applicant + ' 申请的 ' + this.roleLabels[a.targetRole] + ' 权限已通过审批',
            time: now,
            unread: true,
            link: ''
        });
        return true;
    };
    DataStore.rejectApproval = function (id, data) {
        var a = this.getApproval(id);
        if (!a || a.status !== 'pending') return false;
        var now = new Date().toISOString();
        a.status = 'rejected';
        a.result = 'rejected';
        a.handler = data.handler || '管理员';
        a.remark = data.remark || '审批驳回';
        this.messages.unshift({
            id: 'MSG-' + Date.now(),
            type: 'approval',
            title: '权限申请被驳回',
            desc: a.applicant + ' 申请的 ' + this.roleLabels[a.targetRole] + ' 权限未通过：' + a.remark,
            time: now,
            unread: true,
            link: ''
        });
        return true;
    };

    DataStore.addInspectionRecord = function (record) {
        if (!record || !record.taskId) return false;
        if (!this.inspectionHistory) this.inspectionHistory = [];

        // 写入执行历史
        this.inspectionHistory.unshift(record);

        // 更新任务对象
        var task = this.getTask(record.taskId);
        if (task) {
            task.completedAt = record.submitTime;
            task.executionRecord = record;
            task.pointResults = record.pointResults || [];
            if (record.conclusion === 'normal') {
                task.status = 'completed';
            } else if (record.conclusion === 'review') {
                task.status = 'review';
                task.reviewDate = record.reviewDate;
                task.reviewRequirements = record.reviewRequirements;
                task.reviewStatus = 'pending';
            } else {
                task.status = 'hasIssue';
            }
        }

        // 若存在异常点位，为每个异常生成隐患记录
        var abnormalItems = (record.pointResults || []).filter(function (p) { return p.result === 'abnormal'; });
        var self = this;
        abnormalItems.forEach(function (item) {
            var eventNo = 'HD-' + new Date().getFullYear() + '-' + String(self.hiddenDangers.length + 1).padStart(4, '0');
            self.hiddenDangers.unshift({
                id: eventNo,
                eventNo: eventNo,
                title: item.pointName + '隐患',
                type: item.riskType || '其他',
                level: item.level || 'yellow',
                domain: task ? (task.domain || 'other') : 'other',
                location: { address: record.location ? record.location.address : (task ? task.area + ' ' + task.location : ''), lat: 0, lng: 0 },
                description: item.remark || ('巡查发现 ' + item.pointName + ' 存在异常'),
                photos: record.photos || [],
                reporter: { name: self.user.name, role: self.user.roleLabel },
                reportTime: record.submitTime,
                source: 'inspection',
                status: 'reported',
                responsibleUnit: '',
                handler: '',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                relatedRiskId: item.riskId || '',
                timeline: [
                    { step: '上报', actor: self.user.name, time: record.submitTime, action: '巡查异常上报', result: '已受理', status: 'active' },
                    { step: '审核', actor: '', time: '', action: '待审核', result: '', status: 'pending' },
                    { step: '分派', actor: '', time: '', action: '待分派', result: '', status: 'pending' },
                    { step: '处置', actor: '', time: '', action: '待处置', result: '', status: 'pending' },
                    { step: '验收', actor: '', time: '', action: '待验收', result: '', status: 'pending' }
                ]
            });
        });

        return true;
    };

    window.DataStore = DataStore;
})();
