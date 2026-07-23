#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重构 js/house-arch-data.js 的 generateHouseSeed 函数，生成更丰富的模拟数据。
- 风险等级：疑似危房 / 严重损坏房 / 一般损坏房 / 完好房(基本完好房)
- 治理状态：待整治 / 整治中 / 已整治 / 逾期未整治
- 销号状态：未申请 / 审核中 / 已通过 / 待审核 / 已驳回
- 分布更真实：高风险房屋占少数，低风险/安全占多数
- 保持与现有数据结构兼容
"""
import os
import re
import numpy as np

FILE = r"e:\风险管控0618\js\house-arch-data.js"

# 生成新的 generateHouseSeed 函数体
new_func = '''function generateHouseSeed() {
    const streets = MODULE_STREETS;
    const communities = MODULE_COMMUNITIES;
    const data = {};

    // 中心点：奉贤区约 30.92, 121.47，随机撒点
    const baseLat = 30.92, baseLng = 121.47;
    const rand = (seed) => {
        const x = Math.sin(seed + 1) * 10000;
        return x - Math.floor(x);
    };

    const names = [
        '李家宅基','贤城小区','张家宅基','新城小区','陈家宅基','华城小区','赵家宅基','海城小区','周家宅基','联城小区',
        '徐家宅基','悦城小区','朱家宅基','湖城小区','胡家宅基','桂城小区','何家宅基','阳城小区','罗家宅基','绿城小区',
        '马家宅基','南庭小区','高家宅基','北城小区','孙家宅基','东苑小区','吴家宅基','西亭小区','郑家宅基','中城小区'
    ];
    const owners = [
        '李骏勇','王超','张涛建','刘东','陈玲','杨城磊','黄刚安','赵超岩','周堂','吴基轩',
        '徐骁泰','孙福腾','胡熠磊','朱琴','高峰','林娜洋','何泰博','郭逸培','马骞','罗燕云',
        '梁超然','宋骏','郑强刚','谢彦桂','韩琳春','唐敏香','冯云莲','于泽硕','董东','萧煊硕',
        '程彦磊','曹雪','袁香','邓清泽','许磊青','傅东煜','沈丽博','曾建洋','彭骁玲','吕峻',
        '苏军刚','卢清英','蒋强泽','蔡磊','贾倩兰','丁安','魏峰勇','薛骐瑞','叶东逸','阎恒',
        '余轩培','潘慧','杜娟泰','戴春瑞','夏强骏','钟珍','汪娜寿','田静','任莲云','姜祥',
        '范国昊','方春懿','石凤超','姚霖宇','谭凯静','廖硕秋','邹骥','熊毅','金雪刚','陆文英',
        '郝霖祥','孔娜昊','白琴','崔禧','康倩嘉','毛骥瑞','邱崇云','秦铭珍','江文宸','史熠',
        '顾骏','侯瑞烁','邵顺','孟祥华','龙洋顺','肖泽宇','钱文昊','严志强','温婷婷','安志远'
    ];
    const categories = ['农村自建房', '城镇自建房'];
    const structTypes = ['砖混', '砖木', '框架'];

    // 真实的农村自建房风险分布：完好房/一般损坏房占多数，危房占少数
    const RISK_DISTRIBUTION = [
        { risk: 'danger',  governanceWeights: { done: 0.35, doing: 0.30, overdue: 0.20, pending: 0.15 }, ratio: 0.10 }, // 疑似危房
        { risk: 'major',   governanceWeights: { done: 0.30, doing: 0.40, overdue: 0.15, pending: 0.15 }, ratio: 0.15 }, // 严重损坏房
        { risk: 'warning', governanceWeights: { done: 0.45, doing: 0.25, overdue: 0.10, pending: 0.20 }, ratio: 0.25 }, // 一般损坏房（高整治权重）
        { risk: 'warning', governanceWeights: { done: 0.70, doing: 0.15, overdue: 0.05, pending: 0.10 }, ratio: 0.15 }, // 一般损坏房（低整治权重）
        { risk: 'safe',    governanceWeights: { done: 1.0 },                                 ratio: 0.35 }  // 完好房(基本完好房)
    ];

    const weightedPick = (weights) => {
        const keys = Object.keys(weights);
        const vals = keys.map(k => weights[k]);
        const sum = vals.reduce((a, b) => a + b, 0);
        let r = Math.random() * sum;
        for (let i = 0; i < keys.length; i++) {
            r -= vals[i];
            if (r <= 0) return keys[i];
        }
        return keys[keys.length - 1];
    };

    const seedCount = 120;
    for (let i = 1; i <= seedCount; i++) {
        const no = generateNo(i);
        const nameIdx = (i - 1) % names.length;
        const name = names[nameIdx] + (i > 30 ? '·' + i + '号' : i + '号');
        const street = streets[(i - 1) % streets.length];
        const community = communities[(i - 1) % communities.length];
        const address = '上海市奉贤区' + street + community + (i * 3) + '号';
        const category = categories[i % 2];
        const struct = structTypes[i % 3];
        const year = 1970 + (i % 45);
        const owner = owners[i - 1] || '未知';

        // 按真实分布抽取风险与治理状态
        const bucket = weightedPick(Object.fromEntries(RISK_DISTRIBUTION.map((r, idx) => [idx, r.ratio])));
        const riskConfig = RISK_DISTRIBUTION[bucket];
        let risk = riskConfig.risk;
        let governance = weightedPick(riskConfig.governanceWeights);

        // 安全房统一治理完成
        if (risk === 'safe') governance = 'done';

        const totalTask = risk === 'safe' ? 0 : (1 + (i % 4) + (risk === 'danger' ? 2 : 0));
        const doneTask = governance === 'done' ? totalTask : (governance === 'doing' ? Math.max(1, Math.floor(totalTask * (0.3 + (i % 5) * 0.15))) : 0);
        const manageMeasure = totalTask > 0 ? (1 + (i % 2) + (risk === 'danger' ? 1 : 0)) : 0;
        const projectMeasure = totalTask > 0 ? (1 + (i % 3) + (risk === 'danger' ? 1 : 0)) : 0;
        const fundTotal = totalTask > 0 ? (25000 + (i * 1800) + (risk === 'danger' ? 30000 : risk === 'major' ? 15000 : 0)) : 0;
        const fundUsed = Math.round(fundTotal * (doneTask / (totalTask || 1)) * (0.8 + (i % 4) * 0.05));
        const overdue = governance === 'overdue';

        // 坐标：按编号种子随机，保证在奉贤区范围内
        const seed = i * 137;
        const lat = baseLat + (rand(seed) - 0.5) * 0.18;
        const lng = baseLng + (rand(seed + 999) - 0.5) * 0.22;

        const rectDeadline = '2025-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28));
        const completeDate = governance === 'done' ? ('2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28))) : '';

        // 隐患与措施
        const hazards = generateHazards(risk, i);
        const measures = generateMeasures(risk, governance, projectMeasure, i);
        const currentMeasure = measures.map(m => (m.type === 'management' ? '管理' : '工程') + '措施（' + m.name + '）').join(' + ');

        // 销号状态分布
        let closeStatus = '未申请';
        let applyTime = '';
        let auditTime = '';
        let auditor = '';
        let auditOpinion = '';
        let rejectReason = '';
        if (governance === 'done') {
            closeStatus = i % 3 === 0 ? '已通过' : (i % 3 === 1 ? '待审核' : '审核中');
            applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
            if (closeStatus === '已通过') {
                auditTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(2 + (i % 27));
                auditor = '区住建局 ' + AUDITORS[i % AUDITORS.length];
                auditOpinion = '验收合格，同意销号';
            }
        } else if (governance === 'doing' && i % 3 === 0) {
            closeStatus = '审核中';
            applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
        } else if (overdue && i % 2 === 0) {
            closeStatus = '已驳回';
            applyTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(1 + (i % 28));
            auditTime = '2025-' + pad2(1 + (i % 6)) + '-' + pad2(2 + (i % 27));
            auditor = '区住建局 ' + AUDITORS[(i + 1) % AUDITORS.length];
            rejectReason = '整治不到位，需补充材料';
        }

        // 已销号且治理完成的风险统一为 safe/完好房(基本完好房)
        if (governance === 'done' && closeStatus === '已通过') {
            risk = 'safe';
        }

        const eliminationInfo = {
            applyTime: applyTime || null,
            reviewTime: auditTime || null,
            reviewer: auditor || null,
            certFiles: closeStatus === '已通过' ? ['销号申请表.pdf', '整治完成照片.zip'] : (applyTime ? ['销号申请表.pdf'] : []),
            note: closeStatus === '已通过' ? '已销号' : (closeStatus === '已驳回' ? rejectReason : '尚未提交销号申请')
        };

        const governStatus = STATUS_LABEL_MAP[governance];
        const riskLevel = RISK_LABEL_MAP[risk];
        const managerName = owner;
        const managerPhone = MANAGER_PHONES[i % MANAGER_PHONES.length];
        const responsiblePerson = RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length];
        const responsibleDept = street + '城建中心';

        const manageRecords = generateManageRecords(no, risk, governance, doneTask, totalTask, i);
        const projectRecords = generateProjectRecordsLocal(no, risk, governance, projectMeasure, i, fundTotal);
        const qualityTrace = generateQualityTrace(no, risk, governance, projectMeasure, i);
        const archiveRecords = generateArchiveRecords(no, risk, governance, closeStatus, i);

        // 全要素档案字段
        const village = VILLAGES[(i - 1) % VILLAGES.length];
        const floors = FLOOR_OPTIONS[i % FLOOR_OPTIONS.length];
        const buildingArea = (80 + (i * 3.5)).toFixed(1);
        const roofType = ROOF_TYPES[i % ROOF_TYPES.length];
        const foundationType = FOUNDATION_TYPES[i % FOUNDATION_TYPES.length];
        const landNature = LAND_NATURES[i % LAND_NATURES.length];
        const designMode = DESIGN_MODES[i % DESIGN_MODES.length];
        const buildMode = BUILD_MODES[i % BUILD_MODES.length];
        const usageType = USAGE_TYPES[i % USAGE_TYPES.length];
        const over10 = OVER_10_PEOPLE[i % OVER_10_PEOPLE.length];
        const expansionStatus = EXPANSION_OPTIONS[i % EXPANSION_OPTIONS.length];
        const decorationStatus = DECORATION_OPTIONS[i % DECORATION_OPTIONS.length];

        const overview = {
            houseName: name, houseNo: no, houseType: category,
            structureType: struct === '砖混' ? '砌体结构' : (struct === '框架' ? '框架结构' : '砖木结构'),
            floors: floors + '层', buildingArea: buildingArea, builtYear: String(year),
            landNature: landNature, address: address, belongTo: street + ' · ' + village,
            owner: owner, idCard: '310226' + (1960 + (i % 40)) + pad2(1 + (i % 12)) + pad2(1 + (i % 28)) + pad2(i % 100),
            phone: MANAGER_PHONES[i % MANAGER_PHONES.length],
            usage: usageType, isSelfLive: usageType === '自住' ? '是' : '否',
            specificUsage: usageType === '自住' ? '日常居住' : (usageType === '出租' ? '出租居住' : '—'),
            crowdAround: '否', otherCrowdAround: '否', over10People: over10,
            permit: category === '农村自建房' ? '宅基地批准书' : '建设工程规划许可证',
            illegalBuild: '否'
        };

        const homestead = {
            landNature: landNature,
            plotNo: 'ZD-' + (2000 + (i % 25)) + pad2(1 + (i % 12)) + pad2(1 + (i % 28)),
            area: (120 + (i * 2)).toFixed(1) + '㎡',
            approvalStatus: '审批通过',
            certNo: '沪奉宅字' + (2000 + (i % 25)) + '第' + pad5(i) + '号',
            approvalDept: '上海市奉贤区规划和自然资源局',
            approvalDate: (2000 + (i % 25)) + '-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)),
            remark: ''
        };

        const designConstruction = {
            designUnit: DESIGN_UNITS[i % DESIGN_UNITS.length],
            designUnitCode: '91310120MA1H' + pad5(i),
            designDate: (year - 1) + '-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)),
            constructionUnit: ENGINEERING_COMPANIES[i % ENGINEERING_COMPANIES.length],
            constructionUnitCode: '91310120MA1J' + pad5(i),
            constructionQual: i % 3 === 0 ? '建筑工程施工总承包一级' : (i % 3 === 1 ? '建筑工程施工总承包二级' : '房屋建筑工程施工总承包三级'),
            supervisionUnit: SUPERVISION_UNITS[i % SUPERVISION_UNITS.length],
            supervisionUnitCode: '91310120MA1K' + pad5(i),
            designMode: designMode,
            buildMode: buildMode,
            hasProfessionalDesign: designMode === '有专业设计',
            hasQualificationTeam: buildMode === '有资质施工队伍'
        };

        const structure = {
            structureType: struct === '砖混' ? '砌体结构' : (struct === '框架' ? '框架结构' : '砖木结构'),
            floors: floors + '层',
            buildingArea: buildingArea + '㎡',
            roofType: roofType,
            wallMaterial: struct === '框架' ? '加气混凝土砌块' : '烧结普通砖',
            floorMaterial: roofType,
            foundationType: foundationType,
            seismicInfo: '未做抗震专项设计',
            maxSpan: (3.6 + (i % 5) * 0.3).toFixed(1) + 'm',
            expansionStatus: expansionStatus, decorationStatus: decorationStatus,
            remark: ''
        };

        const usage = {
            usageType: usageType,
            isSelfLive: usageType === '自住' ? '是' : '否',
            specificUsage: overview.specificUsage,
            occupancy: over10 === '是' ? '12人' : (2 + (i % 6)) + '人',
            crowdAround: '否',
            otherCrowdAround: '否',
            over10People: over10,
            historyChanges: []
        };
        if (expansionStatus !== '否') {
            usage.historyChanges.push({
                changeDate: (year + 5 + (i % 10)) + '-' + pad2(1 + (i % 12)) + '-' + pad2(1 + (i % 28)),
                changeType: expansionStatus,
                changeContent: '对房屋进行' + expansionStatus,
                approvalStatus: '已审批',
                remark: ''
            });
        }

        const inspectionRecords = generateInspectionRecords(no, risk, i);
        const appraisalReports = generateAppraisalReports(no, risk, governance, i);
        const patrolRecords = generatePatrolRecords(no, risk, governance, i);
        const riskIdentification = generateRiskIdentification(no, risk, i);
        const riskClassification = {
            level: riskLevel,
            basis: '依据《农村住房危险性鉴定标准》综合评定为' + riskLevel,
            assessTime: inspectionRecords.length ? inspectionRecords[0].checkDate : '',
            assessor: RESPONSIBLE_PERSONS[i % RESPONSIBLE_PERSONS.length]
        };
        const emergencyResponse = generateEmergencyResponse(no, risk, governance, i);
        const photos = generateHousePhotos(no, i);
        const riskPart = HAZARD_PARTS[i % HAZARD_PARTS.length];
        const riskType = HAZARD_TYPES[(i + 3) % HAZARD_TYPES.length];
        const riskInfo = {
            riskNo: 'RSK-' + no,
            riskName: name + ' ' + RISK_LABEL_MAP[risk] + '风险',
            riskType: riskType,
            riskLevel: riskLevel,
            discoveryTime: inspectionRecords.length ? inspectionRecords[0].checkDate : '',
            discoveryMethod: '排查发现',
            discoverer: inspectionRecords.length ? inspectionRecords[0].checker : '',
            riskStatus: governStatus,
            riskPart: riskPart,
            spatialLocation: '上海市奉贤区' + street + community + (i * 3) + '号',
            riskDesc: riskPart + '存在' + riskType + '，影响结构安全',
            relatedHouse: no,
            relatedOwner: owner,
            relatedUser: usageType === '自住' ? owner : (usageType === '出租' ? '租户' : ''),
            relatedInspectionId: inspectionRecords.length ? inspectionRecords[0].id : '',
            relatedAppraisalId: appraisalReports.length ? appraisalReports[0].id : '',
            relatedPatrolId: patrolRecords.length ? patrolRecords[0].id : '',
            relatedTaskId: manageRecords.length ? manageRecords[0].id : ''
        };

        const record = {
            no, name, owner, street, community, address, village,
            category: struct,
            houseType: category,
            riskLevel, risk,
            governStatus, governance,
            closeStatus,
            closeApplyTime: applyTime, closeAuditTime: auditTime, closeAuditor: auditor,
            closeAuditOpinion: auditOpinion, closeRejectReason: rejectReason,
            isRemovedFromFocus: closeStatus === '已通过',
            currentMeasure, managerName, managerPhone,
            manageRecords, projectRecords, qualityTrace, archiveRecords,
            lat, lng, year, totalTask, doneTask, overdue,
            manageMeasure, projectMeasure, fundUsed, fundTotal,
            rectDeadline, completeDate,
            hazards, measures, eliminationInfo,
            progress: totalTask ? Math.round(doneTask / totalTask * 100) : 100,
            responsibleDept,
            responsiblePerson,
            overview, homestead, designConstruction, structure, usage,
            photos, riskInfo, inspectionRecords, appraisalReports, patrolRecords,
            riskIdentification, riskClassification, emergencyResponse
        };
        data[no] = record;
    }
    return data;
}
'''

with open(FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# 匹配 function generateHouseSeed() { ... } 直到 // 初始化种子
pattern = r'// 生成 85 条 NF-2025-XXXXX 数据.*?function generateHouseSeed\(\) \{.*?\n\}\n\n// 初始化种子'
match = re.search(pattern, content, re.DOTALL)
if not match:
    print('未匹配到 generateHouseSeed 函数，尝试更宽松的匹配')
    # 宽松匹配：从 function generateHouseSeed() { 开始，到 }\n\n// 初始化种子 结束
    pattern = r'function generateHouseSeed\(\) \{.*?\n\}\n\n// 初始化种子'
    match = re.search(pattern, content, re.DOTALL)

if not match:
    print('ERROR: 无法定位 generateHouseSeed 函数')
    exit(1)

start, end = match.span()
new_content = content[:start] + new_func + '\n// 初始化种子' + content[end+len('// 初始化种子'):]

with open(FILE, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('已更新 generateHouseSeed：120条记录，风险分布更丰富')

# 输出替换后的数据分布预览
print('风险分布权重：疑似危房10% | 严重损坏房15% | 一般损坏房25% | 完好房(基本完好房)35%')
