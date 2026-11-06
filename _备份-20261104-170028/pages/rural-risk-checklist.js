// ===== 农村自建房风险清单标准目录 =====
// 数据来源：《农村自建房风险清单20261030.xlsx》（导入模板，24 行）
// 结构：按「分项（风险部位）」分组，每组内含按风险等级分级的风险描述选项
// 字段对应投标需求：sub=风险部位 / riskType=风险类型 / level=风险等级 / desc=风险描述 / 现场照片在填报时上传
// 等级口径：第一类=blue（正常）/ 第二类=yellow（一般隐患）/ 第三类=red（严重隐患）
window.RURAL_RISK_CHECKLIST = [
    {
        main: '建筑结构信息', part: '地基基础', content: '地基基础情况',
        options: [
            { level: 'blue', levelLabel: '第一类', riskType: '无', desc: '地基基础保持稳定，无明显不均匀沉降；上部结构无不均匀沉降裂缝和倾斜，外露基础完好。', accident: '无', protection: '无' },
            { level: 'yellow', levelLabel: '第二类', riskType: '房屋整体沉降倾斜', desc: '地基基础保持稳定，无明显不均匀沉降；上部结构有轻微不均匀沉降裂缝，外露基础基本完好。', accident: '房屋倾斜或倒塌', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '房屋整体沉降倾斜', desc: '地基基础出现少量损坏，有较明显的不均匀沉降，上部结构出现明显不均匀沉降裂缝，或外露基础明显腐蚀、酥碱、松散和剥落。', accident: '房屋倾斜或倒塌', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '房屋整体沉降倾斜、房屋塌陷变形', desc: '地基基础局部或整体塌陷；上部结构不均匀沉降裂缝严重，且继续发展尚未稳定，或已出现明显倾斜。', accident: '房屋倾斜或倒塌', protection: '维修加固' }
        ]
    },
    {
        main: '建筑结构信息', part: '墙体', content: '墙体情况',
        options: [
            { level: 'blue', levelLabel: '第一类', riskType: '无', desc: '承重墙体基本完好，无明显受力裂缝和变形；墙体转角处和纵、横墙交接处无松动、脱闪现象。', accident: '无', protection: '无' },
            { level: 'yellow', levelLabel: '第二类', riskType: '墙体开裂变形', desc: '承重墙体有少量受力裂缝和变形；墙体转角处和纵、横墙交接处无松动、脱闪现象。', accident: '墙体酥碎或倒塌', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '墙体开裂变形', desc: '承重墙体多数受力裂缝，部分承重墙体明显位移和歪闪；部分山墙转角处和纵、横墙交接处有明显松动、脱闪现象。', accident: '墙体酥碎或倒塌', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '墙体开裂变形', desc: '承重墙体有明显歪闪、局部酥碎或倒塌；墙角处和纵、横墙交接处普遍松动和开裂。', accident: '墙体酥碎或倒塌', protection: '维修加固' }
        ]
    },
    {
        main: '建筑结构信息', part: '梁、柱', content: '梁、柱情况',
        options: [
            { level: 'blue', levelLabel: '第一类', riskType: '无', desc: '梁、柱完好，无明显受力裂缝和变形，梁、柱节点无破损，无裂缝。', accident: '无', protection: '无' },
            { level: 'yellow', levelLabel: '第二类', riskType: '梁柱开裂变形', desc: '梁、柱有轻微受力裂缝，梁、柱节点无破损，无裂缝。', accident: '梁、柱倒塌，房屋坍塌或局部坍塌', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '梁柱开裂变形', desc: '梁、柱出现受力裂缝，但未完全丧失承载能力；个别梁柱节点破损和开裂明显。', accident: '梁、柱倒塌，房屋坍塌或局部坍塌', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '梁柱开裂变形', desc: '梁、柱节点损坏严重；梁、柱普遍开裂；梁、柱有明显变形和位移；部分柱基座滑移严重，有歪闪或局部倒塌。', accident: '梁、柱倒塌，房屋坍塌或局部坍塌', protection: '维修加固' }
        ]
    },
    {
        main: '建筑结构信息', part: '楼、屋盖', content: '楼、屋盖情况',
        options: [
            { level: 'blue', levelLabel: '第一类', riskType: '无', desc: '楼板、屋盖板无明显受力裂缝和变形，板与梁搭接处无松动和裂缝。', accident: '无', protection: '无' },
            { level: 'yellow', levelLabel: '第二类', riskType: '楼面开裂变形', desc: '楼、屋盖板有轻微受力裂缝，但无明显变形；板与墙、梁搭接处有松动和轻微受力裂缝；屋架无倾斜，屋架与柱无明显位移。', accident: '房屋坍塌或局部坍塌', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '楼面开裂变形', desc: '楼、屋盖板有明显开裂；楼、屋盖板与墙、梁搭接处松动和明显受力裂缝，个别屋面板塌落。', accident: '房屋坍塌或局部坍塌', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '楼面开裂变形', desc: '楼、屋盖板普遍开裂，且部分严重开裂；楼、屋盖板与墙、梁搭接处有松动和严重开裂，部分屋面板塌落；屋架歪闪，部分屋盖塌落。', accident: '房屋坍塌或局部坍塌', protection: '维修加固' }
        ]
    },
    {
        main: '建筑结构信息', part: '次要构件', content: '次要构件情况',
        options: [
            { level: 'blue', levelLabel: '第一类', riskType: '无', desc: '非承重墙体、出屋面楼梯间墙体完好或有轻微裂缝。', accident: '无', protection: '无' },
            { level: 'yellow', levelLabel: '第二类', riskType: '其他安全问题', desc: '非承重墙体、出屋面楼梯间墙体等有轻微受力裂缝；抹灰等饰面层可有裂缝或局部散落。', accident: '房屋局部坍塌或次要构件脱落', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '其他安全问题', desc: '非承重墙体普遍明显受力裂缝；部分山墙转角处和纵、横墙交接处有明显松动、脱闪现象。', accident: '房屋局部坍塌或次要构件脱落', protection: '维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '其他安全问题', desc: '非承重墙、女儿墙局部倒塌或严重开裂。', accident: '房屋局部坍塌或次要构件脱落', protection: '维修加固' }
        ]
    },
    // 以下部位无「第一类」描述：符合描述即构成隐患，填报时自动追加「无此风险（正常）」选项
    {
        main: '建筑基本信息', part: '建成时间', content: '楼龄',
        options: [
            { level: 'yellow', levelLabel: '第二类', riskType: '其他安全问题', desc: '≥25年', accident: '年代久远，构件老化损坏', protection: '定期维修加固' },
            { level: 'red', levelLabel: '第三类', riskType: '其他安全问题', desc: '≥40年', accident: '年代久远，构件老化损坏', protection: '定期维修加固' }
        ]
    },
    {
        main: '建筑基本信息', part: '设计方式', content: '有无专业设计',
        options: [
            { level: 'yellow', levelLabel: '第二类', riskType: '其他安全问题', desc: '无专业设计（未采用标准图集）', accident: '承载设计不合格', protection: '进行安全鉴定，按照鉴定结论进行整改' }
        ]
    },
    {
        main: '建筑基本信息', part: '改扩建情况', content: '是否改扩建',
        options: [
            { level: 'red', levelLabel: '第三类', riskType: '使用不当隐患', desc: '存在改扩建情况至少1次', accident: '私自改扩建导致房屋局部荷载变化，引起倒塌或局部倒塌情况的发生。', protection: '进行安全鉴定，按照鉴定结论进行整改' }
        ]
    }
];

// 生成一套填报检查项（每风险部位一项），供保存时写回房屋 checkItems
// 兼容旧模型字段：id/main/sub/content/risk/accident/level/result/photos/description
// 新增投标需求字段：riskType=风险类型 / protection=主要防护措施 / result 支持 'na'（不适用）
function buildRuralCheckItemsFromFill(selections) {
    const catalog = window.RURAL_RISK_CHECKLIST || [];
    const items = [];
    let seq = 0;
    selections.forEach((sel, gi) => {
        const group = catalog[gi];
        if (!group) return;
        if (sel.choice === 'na') {
            items.push({
                id: ++seq,
                main: group.main, sub: group.part, content: group.content,
                riskType: '-', risk: '该部位不涉及', accident: '-', protection: '-',
                level: 'na', result: 'na', resultLabel: '不适用', photos: [],
                choice: 'na'
            });
            return;
        }
        if (sel.choice === 'ok') {
            items.push({
                id: ++seq,
                main: group.main, sub: group.part, content: group.content,
                riskType: '无', risk: '现场检查未发现该风险', accident: '无', protection: '无',
                level: 'blue', result: 'normal', resultLabel: '正常', photos: [],
                choice: 'ok'
            });
            return;
        }
        const opt = group.options[sel.choice];
        if (!opt) return;
        const abnormal = opt.level === 'yellow' || opt.level === 'red';
        items.push({
            id: ++seq,
            main: group.main, sub: group.part, content: group.content,
            riskType: opt.riskType, risk: opt.desc, accident: opt.accident, protection: opt.protection,
            level: opt.level,
            result: abnormal ? 'abnormal' : 'normal',
            resultLabel: abnormal ? '异常' : '正常',
            photos: abnormal ? (sel.photos || []) : [],
            description: abnormal ? (sel.description || '') : '',
            choice: sel.choice
        });
    });
    return items;
}

// ===== 清单外问题：本次排查新增隐患（选填）的 10 类隐患类型 =====
window.RURAL_EXTRA_HAZARD_TYPES = [
    '场地周边安全风险', '房屋整体沉降倾斜', '房屋塌陷变形', '使用不当隐患', '墙体开裂变形',
    '楼面开裂变形', '梁柱开裂变形', '楼梯损伤变形', '阳台开裂变形', '其他安全问题'
];

// 清单外新增隐患 → 检查项：与清单内检查项同构（level 红/黄派生隐患，蓝计入正常），extraHazard 标记用于编辑回选
function buildExtraHazardItems(extraHazards, startSeq) {
    let seq = startSeq || 0;
    return (extraHazards || []).map(h => ({
        id: ++seq,
        main: '清单外问题', sub: h.type, content: h.type,
        riskType: h.type,
        risk: '本次排查现场发现的清单外新增隐患',
        accident: '-', protection: '维修加固',
        level: h.level,
        result: h.level === 'blue' ? 'normal' : 'abnormal',
        resultLabel: h.level === 'blue' ? '正常' : '异常',
        photos: h.photos || [],
        description: h.description || '',
        extraHazard: true
    }));
}
