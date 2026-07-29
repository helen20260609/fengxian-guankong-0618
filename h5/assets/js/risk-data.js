/* ============================================================
   risk-data.js — H5 风险清单数据层
   数据源：
   - 建筑工地：与 PC 端 pages/risk-list-build.html 最新 39 条保持一致
   - 燃气安全：与 PC 端 pages/gas-risk-data.js 结构对齐（92 条）
   - 其他领域：按相同 schema 补充模拟数据
   Schema：{ id, domain, main, sub, content, riskIdentify, accident, level, measures, basis, cases }
   ============================================================ */
(function () {
    'use strict';

    var DOMAINS = {
        build: { id: 'build', name: '建筑工地', icon: 'fa-hard-hat' },
        foundation: { id: 'foundation', name: '基坑工程', icon: 'fa-dungeon' },
        traffic: { id: 'traffic', name: '交通安全', icon: 'fa-traffic-light' },
        curtain: { id: 'curtain', name: '玻璃幕墙', icon: 'fa-building' },
        gas: { id: 'gas', name: '燃气安全', icon: 'fa-fire' },
        falling: { id: 'falling', name: '高空坠物', icon: 'fa-person-falling' },
        selfbuild: { id: 'selfbuild', name: '自建房安全', icon: 'fa-house-chimney' }
    };

    // 建筑工地：39 条（与 PC 端 risk-list-build.html 一致）
    var buildData = [
        { main: '基坑工程', sub: '基坑工程', content: '开挖、支护、降水', riskIdentify: '开挖深度超过5m（含5m）的基坑（槽）的土方开挖、支护、降水工程。', accident: '坍塌、机械伤害、物体打击、高处坠落、环境破坏', level: 'red', measures: '编制专项方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ311-2023' },
        { main: '基坑工程', sub: '基坑工程', content: '开挖、支护、降水', riskIdentify: '开挖深度超过3m（含3m）的基坑（槽）的土方开挖、支护、降水工程。', accident: '坍塌、机械伤害、物体打击、高处坠落、环境破坏', level: 'orange', measures: '编制专项方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ311-2023' },
        { main: '基坑工程', sub: '基坑工程', content: '开挖、支护、降水', riskIdentify: '开挖深度虽未超过3m，但地质条件、周围环境和地下管线复杂，或影响毗邻建、构筑物安全的基坑（槽）的土方开挖、支护、降水工程。', accident: '坍塌、机械伤害、物体打击、高处坠落、环境破坏', level: 'orange', measures: '编制专项方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ311-2023' },
        { main: '基坑工程', sub: '基坑工程', content: '开挖、支护、降水', riskIdentify: '开挖深度未超过3m，但地质条件、周围环境和地下管线情况良好', accident: '坍塌、机械伤害、物体打击、高处坠落、环境破坏', level: 'yellow', measures: '编制专项方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ311-2023' },
        { main: '模板工程及支撑体系', sub: '模板工程及支撑体系', content: '模板安装、拆除、支撑体系', riskIdentify: '各类工具式模板工程：包括滑模、爬模、飞模、隧道模等工程。', accident: '高处坠落、坍塌、机械伤害、物体打击', level: 'red', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ162-2008' },
        { main: '模板工程及支撑体系', sub: '模板工程及支撑体系', content: '模板安装、拆除、支撑体系', riskIdentify: '混凝土模板支撑工程：搭设高度8m及以上，或搭设跨度18m及以上，或施工总荷载（设计值）15kN/m2及以上，或集中线荷载（设计值）20kN/m及以上。', accident: '高处坠落、坍塌、机械伤害、物体打击', level: 'red', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ162-2008' },
        { main: '模板工程及支撑体系', sub: '模板工程及支撑体系', content: '模板安装、拆除、支撑体系', riskIdentify: '承重支撑体系：用于钢结构安装等满堂支撑体系，承受单点集中荷载7kN及以上。', accident: '高处坠落、坍塌、机械伤害、物体打击', level: 'red', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ162-2008' },
        { main: '模板工程及支撑体系', sub: '模板工程及支撑体系', content: '模板安装、拆除、支撑体系', riskIdentify: '各类工具式模板工程：包括滑模、爬模、飞模、隧道模等工程。', accident: '高处坠落、坍塌、机械伤害、物体打击', level: 'orange', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ162-2008' },
        { main: '模板工程及支撑体系', sub: '模板工程及支撑体系', content: '模板安装、拆除、支撑体系', riskIdentify: '混凝土模板支撑工程：搭设高度5m及以上，或搭设跨度10m及以上，或施工总荷载（荷载效应基本组合的设计值，以下简称设计值）10kN/m2及以上，或集中线荷载（设计值）15kN/m及以上，或高度大于支撑水平投影宽度且相对独立无联系构件的混凝土模板支撑工程。', accident: '高处坠落、坍塌、机械伤害、物体打击', level: 'orange', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ162-2008' },
        { main: '模板工程及支撑体系', sub: '模板工程及支撑体系', content: '模板安装、拆除、支撑体系', riskIdentify: '承重支撑体系：用于钢结构安装等满堂支撑体系，承受单点集中荷载7kN及以上。', accident: '高处坠落、坍塌、机械伤害、物体打击', level: 'orange', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ162-2008' },
        { main: '起重吊装及起重机械安装拆卸工程', sub: '起重吊装及起重机械安装拆卸工程', content: '起重吊装、起重设备安装拆除', riskIdentify: '采用非常规起重设备、方法，且单件起吊重量在100kN及以上的起重吊装工程。', accident: '起重伤害、触电、高处坠落、坍塌', level: 'red', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ276-2012' },
        { main: '起重吊装及起重机械安装拆卸工程', sub: '起重吊装及起重机械安装拆卸工程', content: '起重吊装、起重设备安装拆除', riskIdentify: '起重量300kN及以上，或搭设总高度200m及以上，或搭设基础标高在200m及以上的起重机械安装和拆卸工程。', accident: '起重伤害、触电、高处坠落、坍塌', level: 'red', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ276-2012' },
        { main: '起重吊装及起重机械安装拆卸工程', sub: '起重吊装及起重机械安装拆卸工程', content: '起重吊装、起重设备安装拆除', riskIdentify: '采用非常规起重设备、方法，且单件起吊重量在10kN及以上的起重吊装工程。', accident: '起重伤害、触电、高处坠落、坍塌', level: 'orange', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ276-2012' },
        { main: '起重吊装及起重机械安装拆卸工程', sub: '起重吊装及起重机械安装拆卸工程', content: '起重吊装、起重设备安装拆除', riskIdentify: '采用起重机械进行安装的工程。', accident: '起重伤害、触电、高处坠落、坍塌', level: 'orange', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ276-2012' },
        { main: '起重吊装及起重机械安装拆卸工程', sub: '起重吊装及起重机械安装拆卸工程', content: '起重吊装、起重设备安装拆除', riskIdentify: '起重机械安装和拆卸工程。', accident: '起重伤害、触电、高处坠落、坍塌', level: 'orange', measures: '编制专项施工方案，组织专家论证，遵守操作规程，进行安全交底，定期检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ276-2012' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '搭设高度50m及以上的落地式钢管脚手架工程。', accident: '坍塌、高处坠落、物体打击', level: 'red', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '提升高度在150m及以上的附着式升降脚手架工程或附着式升降操作平台工程。', accident: '坍塌、高处坠落、物体打击', level: 'red', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '分段架体搭设高度20m及以上的悬挑式脚手架工程。', accident: '坍塌、高处坠落、物体打击', level: 'orange', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '搭设高度24m及以上的落地式钢管脚手架工程（包括采光井、电梯井脚手架）。', accident: '坍塌、高处坠落、物体打击', level: 'orange', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '附着式升降脚手架工程。', accident: '坍塌、高处坠落、物体打击', level: 'orange', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '悬挑式脚手架工程。', accident: '坍塌、高处坠落、物体打击', level: 'orange', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '高处作业吊篮。', accident: '坍塌、高处坠落、物体打击', level: 'orange', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '卸料平台、操作平台工程。', accident: '坍塌、高处坠落、物体打击', level: 'orange', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '脚手架工程', sub: '脚手架工程', content: '脚手架搭设、使用、拆除、附着式脚手架、高处作业吊篮、悬挑脚手架', riskIdentify: '异型脚手架工程。', accident: '坍塌、高处坠落、物体打击', level: 'orange', measures: '执行专项施工方案或技术规范，遵守操作规程，进行安全交底，组织检查验收', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、JGJ130-2011、JGJ231-2021' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '施工高度50m及以上的建筑幕墙安装工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'red', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '跨度36m及以上的钢结构安装工程，或跨度60m及以上的网架和索膜结构安装工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'red', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '开挖深度16m及以上的人工挖孔桩工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'red', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '水下作业工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'red', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '重量1000kN及以上的大型结构整体顶升、平移、转体等施工工艺。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'red', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '采用新技术、新工艺、新材料、新设备可能影响工程施工安全，尚无国家、行业及地方技术标准的分部分项工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'red', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '建筑幕墙安装工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'orange', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '钢结构、网架和索膜结构安装工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'orange', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '人工挖孔桩工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'orange', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '水下作业工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'orange', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '装配式建筑混凝土预制构件安装工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'orange', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '采用新技术、新工艺、新材料、新设备可能影响工程施工安全，尚无国家、行业及地方技术标准的分部分项工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'orange', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他', sub: '其他', content: '幕墙、钢结构、人工挖孔桩、水下作业、PC安装、有限空间等', riskIdentify: '包含有限空间作业的施工工程。', accident: '高处坠落、物体打击、触电、中毒和窒息、火灾', level: 'orange', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度；执行专项方案和技术规范，遵守操作规程，进行交底', basis: '《上海市建设工程危险性较大的分部分项工程安全管理实施细则》、《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他工程', sub: '其他工程', content: '一般工程', riskIdentify: '除超过一定规模的危险性较大的分部分项工程和危险性较大的分部分项工程的一般工程', accident: '生产事故', level: 'yellow', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度', basis: '《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' },
        { main: '其他工程', sub: '其他工程', content: '桩基、装饰装修、室外总体', riskIdentify: '桩基、装饰装修、室外总体工程', accident: '生产事故', level: 'blue', measures: '建立安全生产保证体系；建立健全各级各岗位安全生产责任制度', basis: '《上海市建设工程施工安全监督管理办法》、《上海市建设工程质量和安全管理条例》' }
    ];

    // 燃气安全：复用 PC 端 gas-risk-data.js 的 92 条结构
    var gasData = [
        { main: '燃气管线', sub: '碳钢管', content: '设备、设施、工具附件缺陷', riskIdentify: '管道用材不符合国家相关规范要求形成管体破裂', accident: '火灾、其它爆炸', level: 'orange', measures: '1.安全管理：加强采购验收管理；2.应急处置：制定泄漏应急预案；3.培训教育：定期开展安全培训。', basis: 'GB50028-2006' },
        { main: '燃气管线', sub: '碳钢管', content: '设备、设施、工具附件缺陷', riskIdentify: '管道焊接质量不达标，形成焊缝缺陷', accident: '火灾、其它爆炸', level: 'orange', measures: '1.加强焊接工艺评定；2.严格焊缝检测；3.建立焊接质量追溯制度。', basis: 'GB50028-2006' },
        { main: '燃气管线', sub: '碳钢管', content: '防护缺陷', riskIdentify: '管道防腐层破损，造成管体腐蚀', accident: '火灾、其它爆炸', level: 'orange', measures: '1.定期检测防腐层；2.及时修复破损；3.阴极保护系统维护。', basis: 'GB50028-2006' },
        { main: '燃气管线', sub: '碳钢管', content: '防护缺陷', riskIdentify: '管道埋深不足，受外部荷载影响', accident: '火灾、其它爆炸', level: 'yellow', measures: '1.按规范埋设；2.加装套管保护；3.设置警示标识。', basis: 'GB50028-2006' },
        { main: '燃气管线', sub: '碳钢管', content: '电危害', riskIdentify: '杂散电流腐蚀造成管体减薄', accident: '火灾、其它爆炸', level: 'yellow', measures: '1.安装排流设施；2.定期电位检测；3.腐蚀监测。', basis: 'GB50028-2006' },
        { main: '燃气管线', sub: 'PE管', content: '设备、设施、工具附件缺陷', riskIdentify: 'PE管材质量不合格，存在砂眼、杂质', accident: '火灾、其它爆炸', level: 'orange', measures: '1.严格进场检验；2.抽样检测；3.供应商评价。', basis: 'CJJ63-2018' },
        { main: '燃气管线', sub: 'PE管', content: '设备、设施、工具附件缺陷', riskIdentify: 'PE管热熔连接质量不良', accident: '火灾、其它爆炸', level: 'orange', measures: '1.持证上岗；2.工艺参数控制；3.外观检查及无损检测。', basis: 'CJJ63-2018' },
        { main: '燃气管线', sub: 'PE管', content: '防护缺陷', riskIdentify: 'PE管受第三方施工破坏', accident: '火灾、其它爆炸', level: 'red', measures: '1.加强管线巡查；2.施工监护；3.定位标识清晰。', basis: 'CJJ63-2018' },
        { main: '燃气管线', sub: '阀门', content: '设备、设施、工具附件缺陷', riskIdentify: '阀门内漏，关闭不严', accident: '火灾、其它爆炸', level: 'yellow', measures: '1.定期维护保养；2.启闭测试；3.及时更换损坏阀门。', basis: 'GB50028-2006' },
        { main: '燃气管线', sub: '阀门', content: '设备、设施、工具附件缺陷', riskIdentify: '阀门井积水、塌陷，影响操作', accident: '火灾、其它爆炸', level: 'yellow', measures: '1.定期清理阀门井；2.修复井室；3.设置排水设施。', basis: 'GB50028-2006' },
        { main: '燃气场站', sub: '储配站', content: '设备、设施、工具附件缺陷', riskIdentify: '储罐安全附件失效（安全阀、压力表）', accident: '火灾、其它爆炸', level: 'red', measures: '1.定期校验安全附件；2.日常巡检；3.建立台账。', basis: 'GB50028-2006' },
        { main: '燃气场站', sub: '储配站', content: '设备、设施、工具附件缺陷', riskIdentify: '储罐本体腐蚀、裂纹', accident: '火灾、其它爆炸', level: 'red', measures: '1.定期检验；2.壁厚检测；3.防腐维护。', basis: 'GB50028-2006' },
        { main: '燃气场站', sub: '储配站', content: '电危害', riskIdentify: '场站电气设备不防爆', accident: '火灾、其它爆炸', level: 'red', measures: '1.选用防爆电气；2.定期检查；3.接地可靠。', basis: 'GB50058-2014' },
        { main: '燃气场站', sub: '储配站', content: '防护缺陷', riskIdentify: '场站消防器材缺失或过期', accident: '火灾、其它爆炸', level: 'orange', measures: '1.配备足量消防器材；2.定期检查更换；3.培训使用。', basis: 'GB50016-2014' },
        { main: '燃气场站', sub: '调压站', content: '设备、设施、工具附件缺陷', riskIdentify: '调压器故障导致出口超压', accident: '火灾、其它爆炸', level: 'red', measures: '1.安装超压切断装置；2.定期维护；3.压力监测。', basis: 'GB50028-2006' },
        { main: '燃气场站', sub: '调压站', content: '设备、设施、工具附件缺陷', riskIdentify: '调压站过滤器堵塞', accident: '供气中断', level: 'yellow', measures: '1.定期清洗过滤器；2.压差监测；3.备用调压路。', basis: 'GB50028-2006' },
        { main: '燃气场站', sub: '加气站', content: '设备、设施、工具附件缺陷', riskIdentify: '加气机计量不准、泄漏', accident: '火灾、其它爆炸', level: 'orange', measures: '1.定期检定；2.泄漏检测；3.拉断阀检查。', basis: 'GB50156-2021' },
        { main: '燃气场站', sub: '加气站', content: '电危害', riskIdentify: '加气站静电接地不良', accident: '火灾、其它爆炸', level: 'red', measures: '1.车辆静电接地；2.人体静电释放；3.接地电阻检测。', basis: 'GB50156-2021' },
        { main: '燃气用户', sub: '居民用户', content: '设备、设施、工具附件缺陷', riskIdentify: '燃气软管老化、龟裂、脱落', accident: '火灾、中毒、其它爆炸', level: 'orange', measures: '1.定期入户安检；2.更换金属软管；3.用户宣传教育。', basis: 'CJJ94-2009' },
        { main: '燃气用户', sub: '居民用户', content: '使用不当', riskIdentify: '用户私接、改装燃气设施', accident: '火灾、中毒、其它爆炸', level: 'orange', measures: '1.入户检查；2.制止违规；3.宣传教育。', basis: 'CJJ94-2009' },
        { main: '燃气用户', sub: '居民用户', content: '使用不当', riskIdentify: '燃气器具超期使用或不合格', accident: '火灾、中毒', level: 'yellow', measures: '1.推广合格器具；2.超期提醒更换；3.熄火保护检查。', basis: 'GB17905-2008' },
        { main: '燃气用户', sub: '商业用户', content: '设备、设施、工具附件缺陷', riskIdentify: '商业燃气报警器失效或未安装', accident: '火灾、中毒、其它爆炸', level: 'red', measures: '1.强制安装报警器；2.定期检测；3.联动切断装置。', basis: 'CJJ94-2009' },
        { main: '燃气用户', sub: '商业用户', content: '使用不当', riskIdentify: '餐饮场所燃气瓶组间设置不规范', accident: '火灾、其它爆炸', level: 'orange', measures: '1.规范瓶组间设置；2.通风换气；3.防爆电气。', basis: 'GB50016-2014' },
        { main: '燃气用户', sub: '工业用户', content: '设备、设施、工具附件缺陷', riskIdentify: '工业燃烧器熄火保护失效', accident: '火灾、其它爆炸', level: 'red', measures: '1.定期检测熄火保护；2.联锁控制；3.操作规程。', basis: 'GB6222-2005' },
        { main: '燃气用户', sub: '工业用户', content: '防护缺陷', riskIdentify: '工业燃气管道标识不清', accident: '火灾、其它爆炸', level: 'yellow', measures: '1.规范标识；2.定期巡检；3.第三方施工监护。', basis: 'GB7231-2003' },
        { main: '燃气施工', sub: '第三方施工', content: '管理缺陷', riskIdentify: '第三方施工破坏燃气管道', accident: '火灾、其它爆炸', level: 'red', measures: '1.施工交底；2.现场监护；3.管线探测。', basis: 'CJJ51-2016' },
        { main: '燃气施工', sub: '第三方施工', content: '管理缺陷', riskIdentify: '施工方案未进行燃气管道保护论证', accident: '火灾、其它爆炸', level: 'orange', measures: '1.方案审查；2.专家论证；3.保护措施落实。', basis: 'CJJ51-2016' },
        { main: '燃气施工', sub: '抢修作业', content: '作业环境不良', riskIdentify: '燃气泄漏区域明火、静电引燃', accident: '火灾、其它爆炸', level: 'red', measures: '1.警戒隔离；2.气体检测；3.防爆工具。', basis: 'CJJ51-2016' },
        { main: '燃气施工', sub: '抢修作业', content: '防护缺陷', riskIdentify: '抢修人员未佩戴防护装备', accident: '中毒、窒息', level: 'orange', measures: '1.配备呼吸器；2.通风换气；3.安全培训。', basis: 'CJJ51-2016' }
    ];

    // 基坑工程（从建筑工地数据中抽取 + 补充监测类风险）
    var foundationData = [
        { main: '基坑监测', sub: '位移监测', content: '基坑周边土体位移', riskIdentify: '基坑周边地表沉降速率超过预警值', accident: '坍塌、周边建筑变形', level: 'red', measures: '加密监测频次，启动应急预案，组织专家会商', basis: 'JGJ311-2023' },
        { main: '基坑监测', sub: '位移监测', content: '支护结构水平位移', riskIdentify: '支护桩（墙）顶水平位移超过设计允许值', accident: '坍塌', level: 'red', measures: '立即停止开挖，反压土，增加支撑', basis: 'JGJ311-2023' },
        { main: '基坑监测', sub: '支撑体系', content: '内支撑轴力', riskIdentify: '内支撑轴力异常增大或减小', accident: '坍塌', level: 'orange', measures: '复测支撑轴力，检查节点连接，必要时加固', basis: 'JGJ311-2023' },
        { main: '基坑监测', sub: '地下水', content: '坑内外水位', riskIdentify: '坑内降水导致周边地下水位下降过快', accident: '地面沉降、建构筑物变形', level: 'orange', measures: '回灌措施，调整降水方案', basis: 'JGJ311-2023' },
        { main: '基坑工程', sub: '土方开挖', content: '分层开挖', riskIdentify: '超挖、掏挖、逆作法工序混乱', accident: '坍塌', level: 'orange', measures: '按方案分层分段开挖，及时支护', basis: 'JGJ311-2023' },
        { main: '基坑工程', sub: '支护体系', content: '锚索/土钉', riskIdentify: '锚索张拉锁定值不足，土钉注浆不饱满', accident: '坍塌', level: 'orange', measures: '严格验收，抽检抗拔力', basis: 'JGJ120-2012' }
    ];

    // 交通安全：模拟数据
    var trafficData = [
        { main: '道路交通事故', sub: '交叉口', content: '机动车冲突', riskIdentify: '大型交叉口未设置信号控制，冲突点多', accident: '碰撞、伤亡', level: 'red', measures: '设置信号灯/让行标志，优化相位', basis: 'GB5768-2022' },
        { main: '道路交通事故', sub: '路段', content: '超速行驶', riskIdentify: '学校、医院周边路段限速标志缺失', accident: '碰撞、伤亡', level: 'orange', measures: '完善限速标志，增设减速设施', basis: 'GB5768-2022' },
        { main: '道路交通事故', sub: '施工区域', content: '占道施工', riskIdentify: '道路施工围挡侵占车道，警示不足', accident: '碰撞、拥堵', level: 'orange', measures: '规范设置警示区、缓冲区，夜间照明', basis: 'GB5768-2022' },
        { main: '交通拥堵', sub: '主干道', content: '高峰拥堵', riskIdentify: '早晚高峰流量超过道路通行能力', accident: '通行效率下降、事故风险', level: 'yellow', measures: '信号优化、诱导分流、公交优先', basis: '城市道路工程设计规范' },
        { main: '公共交通', sub: '公交场站', content: '场站运行', riskIdentify: '公交场站充电桩电气故障', accident: '火灾、触电', level: 'orange', measures: '定期检测绝缘，配备灭火器材', basis: 'GB50966-2014' },
        { main: '轨道交通', sub: '盾构区间', content: '盾构施工', riskIdentify: '盾构掘进引发地面沉降', accident: '地面塌陷、建构筑物变形', level: 'red', measures: '实时监测，控制掘进参数，同步注浆', basis: 'GB50157-2013' }
    ];

    // 玻璃幕墙：模拟数据
    var curtainData = [
        { main: '幕墙结构', sub: '支撑结构', content: '构件锈蚀', riskIdentify: '幕墙钢结构、连接件锈蚀严重', accident: '幕墙坠落', level: 'red', measures: '定期检测，除锈防腐，更换受损构件', basis: 'JGJ102-2003' },
        { main: '幕墙结构', sub: '连接节点', content: '连接松动', riskIdentify: '幕墙与主体结构连接螺栓松动、缺失', accident: '幕墙坠落', level: 'red', measures: '全面排查连接节点，紧固或更换', basis: 'JGJ102-2003' },
        { main: '密封材料', sub: '硅酮密封胶', content: '老化开裂', riskIdentify: '幕墙密封胶超过使用年限，出现开裂、粉化', accident: '渗漏、玻璃脱落', level: 'orange', measures: '定期更换密封胶，检查粘结性', basis: 'JGJ102-2003' },
        { main: '开启扇', sub: '五金件', content: '铰链、滑撑失效', riskIdentify: '幕墙开启扇五金件锈蚀、松动', accident: '开启扇坠落', level: 'orange', measures: '定期维护五金件，限制开启角度', basis: 'JGJ102-2003' },
        { main: '玻璃面板', sub: '钢化玻璃', content: '自爆', riskIdentify: '幕墙钢化玻璃存在硫化镍杂质，存在自爆风险', accident: '玻璃坠落、伤人', level: 'orange', measures: '采用均质钢化玻璃，贴膜防护', basis: 'JGJ102-2003' },
        { main: '幕墙清洗', sub: '高空作业', content: '吊篮作业', riskIdentify: '幕墙清洗吊篮安全装置失效', accident: '高处坠落', level: 'red', measures: '严格验收吊篮，作业人员持证上岗', basis: 'JGJ202-2010' }
    ];

    // 高空坠物：模拟数据
    var fallingData = [
        { main: '外墙饰面', sub: '面砖/涂料', content: '空鼓脱落', riskIdentify: '建筑外墙饰面存在空鼓、开裂', accident: '坠物伤人', level: 'red', measures: '定期排查，及时修复空鼓部位', basis: 'JGJ110-2008' },
        { main: '附属设施', sub: '空调外机', content: '支架锈蚀', riskIdentify: '空调外机支架锈蚀、固定不牢', accident: '外机坠落', level: 'orange', measures: '检查加固支架，更换锈蚀构件', basis: '建筑装饰装修工程质量验收标准' },
        { main: '附属设施', sub: '广告牌', content: '结构老化', riskIdentify: '户外广告牌钢结构锈蚀、基础不牢', accident: '广告牌倒塌', level: 'red', measures: '定期安全检测，加固或拆除', basis: 'CECS148-2003' },
        { main: '附属设施', sub: '阳台花盆', content: '摆放不稳', riskIdentify: '高层建筑阳台花盆、杂物易坠落', accident: '坠物伤人', level: 'yellow', measures: '加强宣传，规范摆放', basis: '民法典侵权责任编' },
        { main: '建筑施工', sub: '脚手架', content: '物体打击', riskIdentify: '施工脚手架材料、工具坠落', accident: '物体打击', level: 'orange', measures: '设置密目网、挡脚板，规范堆放', basis: 'JGJ59-2011' },
        { main: '树木', sub: '行道树', content: '枯枝断裂', riskIdentify: '行道树枯枝、病虫害枝干断裂坠落', accident: '砸伤行人、车辆', level: 'yellow', measures: '定期修剪，清除枯枝', basis: '城市绿化条例' }
    ];

    // 自建房安全：模拟数据
    var selfbuildData = [
        { main: '结构安全', sub: '地基基础', content: '不均匀沉降', riskIdentify: '房屋出现明显倾斜、墙体裂缝', accident: '坍塌', level: 'red', measures: '停止使用，委托鉴定，加固或拆除', basis: 'GB50300-2013' },
        { main: '结构安全', sub: '承重墙体', content: '墙体开裂', riskIdentify: '承重墙出现贯通裂缝、受压破坏', accident: '坍塌', level: 'red', measures: '专业鉴定，结构加固', basis: 'GB50300-2013' },
        { main: '违规改建', sub: '加层扩建', content: '擅自加层', riskIdentify: '自建房擅自加层、扩建，超出原设计荷载', accident: '坍塌', level: 'red', measures: '责令停工，委托鉴定，恢复原状', basis: '城乡规划法' },
        { main: '违规改建', sub: '拆改承重墙', content: '破坏承重结构', riskIdentify: '装修过程中拆改承重墙、梁、柱', accident: '坍塌', level: 'red', measures: '制止违法行为，恢复原状，鉴定评估', basis: '建设工程质量管理条例' },
        { main: '消防安全', sub: '疏散通道', content: '通道堵塞', riskIdentify: '出租房疏散通道狭窄、堆放杂物', accident: '火灾伤亡', level: 'orange', measures: '清理通道，增设消防设施', basis: 'GB50016-2014' },
        { main: '消防安全', sub: '电气线路', content: '线路老化', riskIdentify: '电气线路私拉乱接、老化', accident: '火灾', level: 'orange', measures: '规范线路敷设，更换老化线路', basis: 'GB50054-2011' }
    ];

    function withDomain(data, domain) {
        var caseMap = {
            build: { title: '某工地基坑坍塌事故', desc: '2024 年 5 月，某工地因超挖且未及时支护导致基坑局部坍塌。整改：严格按方案分层开挖、加强支护监测。' },
            foundation: { title: '某深基坑支撑失稳事件', desc: '2024 年 7 月，某基坑因支撑体系安装不及时导致局部变形。整改：增加临时支撑、加密监测频率。' },
            traffic: { title: '某路口交通事故', desc: '2024 年 6 月，某路口因信号灯故障导致多车追尾。整改：修复信号设施、增设警示标志。' },
            curtain: { title: '某大厦玻璃幕墙坠落', desc: '2024 年 8 月，某大厦因密封胶老化导致玻璃面板脱落。整改：更换密封胶、全面排查连接件。' },
            gas: { title: '某路段燃气泄漏爆炸', desc: '2024 年 4 月，某路段因第三方施工破坏燃气管道引发泄漏。整改：加强施工监护、完善管线标识。' },
            falling: { title: '某小区外墙砖脱落伤人', desc: '2024 年 9 月，某小区外墙饰面空鼓脱落砸伤行人。整改：排查空鼓、重新粘贴加固。' },
            selfbuild: { title: '某自建房坍塌事故', desc: '2024 年 3 月，某自建房因擅自加层导致结构超载坍塌。整改：拆除违规加层、委托结构鉴定。' }
        };
        return data.map(function (item, idx) {
            var cases = [];
            if (idx === 0 && caseMap[domain]) {
                cases.push(caseMap[domain]);
            }
            if (idx === 1) {
                cases.push({ title: '某项目脚手架高处坠落', desc: '2024 年 8 月，某项目脚手架搭设不规范导致人员坠落。整改：重新论证方案、增设连墙件、全封闭防护。' });
            }
            return Object.assign({}, item, {
                id: domain + '-' + String(idx + 1).padStart(4, '0'),
                domain: domain,
                cases: cases
            });
        });
    }

    var RiskData = {
        domains: DOMAINS,
        data: {
            build: withDomain(buildData, 'build'),
            foundation: withDomain(foundationData, 'foundation'),
            traffic: withDomain(trafficData, 'traffic'),
            curtain: withDomain(curtainData, 'curtain'),
            gas: withDomain(gasData, 'gas'),
            falling: withDomain(fallingData, 'falling'),
            selfbuild: withDomain(selfbuildData, 'selfbuild')
        },
        getList: function (domain, filters) {
            filters = filters || {};
            var list = this.data[domain] || [];
            if (filters.level) {
                list = list.filter(function (item) { return item.level === filters.level; });
            }
            if (filters.keyword) {
                var kw = filters.keyword.toLowerCase();
                list = list.filter(function (item) {
                    return (item.main + item.sub + item.content + item.riskIdentify + item.accident + item.basis).toLowerCase().indexOf(kw) !== -1;
                });
            }
            return list;
        },
        getDetail: function (id) {
            for (var domain in this.data) {
                for (var i = 0; i < this.data[domain].length; i++) {
                    if (this.data[domain][i].id === id) return this.data[domain][i];
                }
            }
            return null;
        },
        getAll: function () {
            var all = [];
            for (var domain in this.data) {
                all = all.concat(this.data[domain]);
            }
            return all;
        },
        search: function (keyword) {
            return this.getAll().filter(function (item) {
                return (item.main + item.sub + item.content + item.riskIdentify).toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
            });
        }
    };

    window.RiskData = RiskData;
})();
