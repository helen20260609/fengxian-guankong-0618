// =========================================================
// 城镇版(URBAN)拆分规则
// 策略:
//  1) isUrbanHouse() 硬编码 return true —— 所有 isUrbanHouse()?A:B / if 自动落到城镇侧
//  2) 删除 RURAL 专属数据定义块(sidebarItems_RURAL/basicData_RURAL 等), 用 URBAN 数据顶替命名
//  3) getter 写死返回城镇数据
//  4) 数据层改读 urbanHouseArch* 数据源, 修 houseType 污染 bug
// 每条规则 [name, find, replace], find 必须在原文件中唯一。
// =========================================================
module.exports = [
    // ---------- 1) 数据层: 默认编号改 CF-, houseType 污染修复 ----------
    ['getCurrentHouseNo 默认编号改CF',
`        function getCurrentHouseNo() {
            const no = getUrlParam('no');
            if (no) return no;
            return getUrlParam('id') || 'NF-2025-00001';
        }`,
`        function getCurrentHouseNo() {
            const no = getUrlParam('no');
            if (no) return no;
            return getUrlParam('id') || 'CF-2025-00001';
        }`],

    // 房屋性质→houseType 同步: 城镇版不同步(避免jbxx"住宅"覆盖"城镇自建房")
    ['syncLibToRootFields 不再用房屋性质覆盖houseType',
`            // 房屋性质 → houseType
            const ht = getVal('房屋性质');
            if (ht !== undefined && ht !== '—') record.houseType = ht;`,
`            // 房屋性质是业务字段(住宅/非住宅), 不再写回 record.houseType(避免污染类型标识)
            // houseType 恒为"城镇自建房", 由路由/数据源决定, 不随表单变化`],

    // ---------- 2) isUrbanHouse() 硬编码为 true ----------
    ['isUrbanHouse 硬编码true',
`        function isUrbanHouse() {
            return currentHouseArch && currentHouseArch.houseType === '城镇自建房';
        }`,
`        // 城镇专属页: 恒为城镇, 不再读取 houseType(拆分后无农村分叉)
        function isUrbanHouse() {
            return true;
        }`],

    // ---------- 3) getter 写死返回城镇数据 ----------
    ['getBasicSubTabs 写死城镇',
`        function getBasicSubTabs()   { return isUrbanHouse() ? basicSubTabs_URBAN_filtered : basicSubTabs_RURAL; }`,
`        function getBasicSubTabs()   { return basicSubTabs_URBAN_filtered; }`],
    ['getSidebarItems 写死城镇',
`        function getSidebarItems()   { return isUrbanHouse() ? sidebarItems_URBAN_filtered : sidebarItems_RURAL; }`,
`        function getSidebarItems()   { return sidebarItems_URBAN_filtered; }`],
    ['getBasicData 写死城镇',
`        function getBasicData()      { return isUrbanHouse() ? basicData_URBAN      : basicData_RURAL; }`,
`        function getBasicData()      { return basicData_URBAN; }`],
    ['getSurveySubTabs 写死城镇',
`        function getSurveySubTabs()  { return isUrbanHouse() ? surveySubTabs_URBAN  : surveySubTabs_RURAL; }`,
`        function getSurveySubTabs()  { return surveySubTabs_URBAN; }`],
    ['getSurveyData 写死城镇',
`        function getSurveyData()     { return isUrbanHouse() ? surveyData_URBAN     : surveyData_RURAL; }`,
`        function getSurveyData()     { return surveyData_URBAN; }`],
    ['getTableData 写死城镇',
`        function getTableData()      { return isUrbanHouse() ? tableData_URBAN      : tableData_RURAL; }`,
`        function getTableData()      { return tableData_URBAN; }`],
    ['getMeasureSubTabs 写死城镇',
`        function getMeasureSubTabs() { return isUrbanHouse() ? measureSubTabs_URBAN : measureSubTabs_RURAL; }`,
`        function getMeasureSubTabs() { return measureSubTabs_URBAN; }`],
    ['getMeasureData 写死城镇',
`        function getMeasureData()    { return isUrbanHouse() ? measureData_URBAN    : measureData_RURAL; }`,
`        function getMeasureData()    { return measureData_URBAN; }`],

    // ---------- 4) 风险口径: 城镇四级(写死, 去掉三元) ----------
    ['riskLabelMap 写死城镇四级',
`        const riskLabelMap = isUrbanHouse() ? {
            '疑似危房': '疑似危房',
            '严重损坏房': '严重损坏房',
            '一般损坏房': '一般损坏房',
            '完好房': '完好房',
            '完好房(基本完好房)': '完好房',
            // 兼容旧三类
            '第三类': '疑似危房',
            '第二类': '一般损坏房',
            '第一类': '完好房'
        } : {
            '第三类': '第三类',
            '第二类': '第二类',
            '第一类': '第一类',
            '已治理': '第一类',
            '疑似危房': '第三类',
            '严重损坏房': '第三类',
            '一般损坏房': '第二类',
            '完好房(基本完好房)': '第一类'
        };`,
`        // 城镇四级口径(拆分后写死)
        const riskLabelMap = {
            '疑似危房': '疑似危房',
            '严重损坏房': '严重损坏房',
            '一般损坏房': '一般损坏房',
            '完好房': '完好房',
            '完好房(基本完好房)': '完好房',
            // 兼容旧三类
            '第三类': '疑似危房',
            '第二类': '一般损坏房',
            '第一类': '完好房'
        };`],

    ['riskBadgeClass 严重损坏房常置serious',
`        // 城镇四级专用：严重损坏房→橙色（serious）
        if (isUrbanHouse()) riskBadgeClass['严重损坏房'] = 'serious';`,
`        // 城镇四级专用：严重损坏房→橙色（serious）
        riskBadgeClass['严重损坏房'] = 'serious';`],

    ['syncHouseArchFromStatus 默认风险等级写死城镇',
`            if (!s.riskLevel) { s.riskLevel = isUrbanHouse() ? '一般损坏房' : '第二类'; changed = true; }`,
`            if (!s.riskLevel) { s.riskLevel = '一般损坏房'; changed = true; }`],

    ['crud riskLevel options 写死城镇',
`                    { key: 'riskLevel', label: '风险等级', type: 'select', options: isUrbanHouse() ? ['疑似危房', '严重损坏房', '一般损坏房', '完好房'] : ['第一类', '第二类', '第三类'] },`,
`                    { key: 'riskLevel', label: '风险等级', type: 'select', options: ['疑似危房', '严重损坏房', '一般损坏房', '完好房'] },`],

    // ---------- 5) 巡查种子数据: 城镇口径(去掉 isUrban 三元) ----------
    ['patrol 种子 城镇机构人员',
`            const isUrban = isUrbanHouse();
            const org = isUrban ? '柘林镇城建中心' : '南桥镇城建中心';
            const persons = isUrban ? ['赵敏', '李志强', '王建国', '陈明华'] : ['王建国', '陈明华', '周敏', '张建军'];`,
`            const org = '柘林镇城建中心';
            const persons = ['赵敏', '李志强', '王建国', '陈明华'];`],

    // ---------- 6) 查看模式: jbxx 走城镇动态组装(去掉 if(isUrban) 包裹的农村分支) ----------
    ['查看模式 jbxx 写死城镇组装',
`            const isUrban = isUrbanHouse();
            // 城镇：按当前房屋性质动态组装字段；农村：保持原有 23 项
            let jbxx;
            if (isUrban) {
                const urbanRows = getJbxxRows(); // 返回 common + (residential | commercial)`,
`            // 城镇：按当前房屋性质动态组装字段
            let jbxx;
            {
                const urbanRows = getJbxxRows(); // 返回 common + (residential | commercial)`],

    // ---------- 7) 字段库持久化: 只 dump/restore 城镇, 不再混入农村 ----------
    ['dumpFieldsLibrary 只写城镇',
`        function dumpFieldsLibrary() {
            return {
                basic_RURAL: basicData_RURAL,
                survey_RURAL: surveyData_RURAL,
                table_RURAL: tableData_RURAL,
                measure_RURAL: measureData_RURAL,
                basic_URBAN: basicData_URBAN,
                survey_URBAN: surveyData_URBAN,
                table_URBAN: tableData_URBAN,
                measure_URBAN: measureData_URBAN
            };
        }`,
`        function dumpFieldsLibrary() {
            // 城镇专属页: 只持久化城镇字段库(拆分后不再写入农村键)
            return {
                basic_URBAN: basicData_URBAN,
                survey_URBAN: surveyData_URBAN,
                table_URBAN: tableData_URBAN,
                measure_URBAN: measureData_URBAN
            };
        }`],

    ['restoreFieldsLibrary 只恢复城镇',
`            const pairs = [
                [basicData_RURAL, lib.basic_RURAL],
                [surveyData_RURAL, lib.survey_RURAL],
                [tableData_RURAL, lib.table_RURAL],
                [measureData_RURAL, lib.measure_RURAL],
                [basicData_URBAN, lib.basic_URBAN],
                [surveyData_URBAN, lib.survey_URBAN],
                [tableData_URBAN, lib.table_URBAN],
                [measureData_URBAN, lib.measure_URBAN]
            ];`,
`            const pairs = [
                [basicData_URBAN, lib.basic_URBAN],
                [surveyData_URBAN, lib.survey_URBAN],
                [tableData_URBAN, lib.table_URBAN],
                [measureData_URBAN, lib.measure_URBAN]
            ];`],

    // ---------- 8) jgxx/syxx 硬引用 RURAL 改为 URBAN(概念一致; tab 已过滤不可达, 仅消除混淆) ----------
    ['jgxx 引用改URBAN',
`            const jgxx = (libJgxx.length ? libJgxx : basicData_RURAL.jgxx).map(function(r) {`,
`            const jgxx = (libJgxx.length ? libJgxx : basicData_URBAN.jgxx).map(function(r) {`],
    ['syxx 引用改URBAN',
`            const syxx = (libSyxx.length ? libSyxx : basicData_RURAL.syxx).map(function(r) {`,
`            const syxx = (libSyxx.length ? libSyxx : basicData_URBAN.syxx).map(function(r) {`],

    // ---------- 9) 删除查看模式 jbxx 的 else{农村22项}死代码块 ----------
    ['删除 jbxx 农村else死代码',
`                jbxx = jbxx.filter(function(row) { return row[0] !== '房屋权属其他内容' && row[0] !== '土地性质其他内容' && row[0] !== '结构类型其他内容'; });
            } else {
                jbxx = [
                // 农村自建房字段
                ['唯一标识', libVal(libJbxx, '唯一标识', s.no || 'NF-2025-00001')],
                ['房屋性质', libVal(libJbxx, '房屋性质', s.houseType || '住宅')],
                ['所在区域', libVal(libJbxx, '所在区域', '奉贤区' + (s.street || '—'))],
                ['路号信息', libVal(libJbxx, '路号信息', s.address || '—')],
                ['不需要排查原因', libVal(libJbxx, '不需要排查原因', '—')],
                ['产权人 / 使用人信息', libVal(libJbxx, '产权人 / 使用人信息', s.owner || '—')],
                ['身份证号码', libVal(libJbxx, '身份证号码', '—')],
                ['房屋类型', libVal(libJbxx, '房屋类型', '仅自住')],
                ['房屋类型二级分类', libVal(libJbxx, '房屋类型二级分类', '独立住宅')],
                ['房屋用途', libVal(libJbxx, '房屋用途', '自住')],
                ['是否同时自住', libVal(libJbxx, '是否同时自住', '是')],
                ['具体用途', libVal(libJbxx, '具体用途', '日常居住')],
                ['人员聚集场所周边', libVal(libJbxx, '人员聚集场所周边', '否')],
                ['其他人员密集场所周边', libVal(libJbxx, '其他人员密集场所周边', '否')],
                ['土地性质', libVal(libJbxx, '土地性质', '集体土地')],
                ['集体土地', libVal(libJbxx, '集体土地', '宅基地')],
                ['所在区域（区域类型）', libVal(libJbxx, '所在区域（区域类型）', '建制镇')],
                ['建筑层数', libVal(libJbxx, '建筑层数', '3层')],
                ['建筑面积 (m²)', libVal(libJbxx, '建筑面积 (m²)', '—')],
                ['建成时间', (s.year ? s.year + '年' : '—')],
                ['户主联系方式', libVal(libJbxx, '户主联系方式', (s.overview && s.overview.phone) || '—'), true],
                ['家庭成员信息', libVal(libJbxx, '家庭成员信息', s.familyMembers || '—'), true]
            ];
            }
            const zjd = [`,
`                jbxx = jbxx.filter(function(row) { return row[0] !== '房屋权属其他内容' && row[0] !== '土地性质其他内容' && row[0] !== '结构类型其他内容'; });
            }
            const zjd = [`],

    // ---------- 10) 侧边栏标题写死城镇(不再读 houseType) ----------
    ['侧边栏标题写死城镇',
`                const houseType = s.houseType === '城镇自建房' ? '城镇自建房' : '农村自建房';
                const isRural = houseType === '农村自建房';
                sidebarHeaderEl.innerHTML = '<i class="fas ' + (isRural ? 'fa-home' : 'fa-city') + '" style="margin-right:8px;color:#202124;"></i>' + houseType + '安全排查';`,
`                const houseType = '城镇自建房';
                sidebarHeaderEl.innerHTML = '<i class="fas fa-city" style="margin-right:8px;color:#202124;"></i>' + houseType + '安全排查';`],

    // ---------- 11) getCurrentHouseArch 返回前强制 houseType=城镇自建房 ----------
    ['强制记录houseType为城镇',
`            if (!Array.isArray(prj0.completeReportFiles)) prj0.completeReportFiles = [];
            if (!Array.isArray(prj0.rectifyPhotos)) prj0.rectifyPhotos = [];
            return rec;
        }`,
`            if (!Array.isArray(prj0.completeReportFiles)) prj0.completeReportFiles = [];
            if (!Array.isArray(prj0.rectifyPhotos)) prj0.rectifyPhotos = [];
            // 城镇专属页: 强制 houseType 为城镇(路由/兜底以此为准, 不受表单房屋性质影响)
            rec.houseType = '城镇自建房';
            return rec;
        }`],
];
