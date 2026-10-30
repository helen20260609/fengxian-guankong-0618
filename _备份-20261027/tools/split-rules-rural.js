// =========================================================
// 农村版(RURAL)拆分规则 —— 与城镇版对称
// 策略: isUrbanHouse() 硬编码 false, getter 写死 RURAL, 风险口径写死三类,
//       字段库只持久化 _RURAL, 编号保持 NF-。URBAN 定义块保留为不可达死代码。
// =========================================================
module.exports = [
    // ---------- 1) isUrbanHouse() 硬编码 false ----------
    ['isUrbanHouse 硬编码false',
`        function isUrbanHouse() {
            return currentHouseArch && currentHouseArch.houseType === '城镇自建房';
        }`,
`        // 农村专属页: 恒为农村, 不再读取 houseType(拆分后无城镇分叉)
        function isUrbanHouse() {
            return false;
        }`],

    // ---------- 2) getter 写死 RURAL ----------
    ['getBasicSubTabs 写死农村',
`        function getBasicSubTabs()   { return isUrbanHouse() ? basicSubTabs_URBAN_filtered : basicSubTabs_RURAL; }`,
`        function getBasicSubTabs()   { return basicSubTabs_RURAL; }`],
    ['getSidebarItems 写死农村',
`        function getSidebarItems()   { return isUrbanHouse() ? sidebarItems_URBAN_filtered : sidebarItems_RURAL; }`,
`        function getSidebarItems()   { return sidebarItems_RURAL; }`],
    ['getBasicData 写死农村',
`        function getBasicData()      { return isUrbanHouse() ? basicData_URBAN      : basicData_RURAL; }`,
`        function getBasicData()      { return basicData_RURAL; }`],
    ['getSurveySubTabs 写死农村',
`        function getSurveySubTabs()  { return isUrbanHouse() ? surveySubTabs_URBAN  : surveySubTabs_RURAL; }`,
`        function getSurveySubTabs()  { return surveySubTabs_RURAL; }`],
    ['getSurveyData 写死农村',
`        function getSurveyData()     { return isUrbanHouse() ? surveyData_URBAN     : surveyData_RURAL; }`,
`        function getSurveyData()     { return surveyData_RURAL; }`],
    ['getTableData 写死农村',
`        function getTableData()      { return isUrbanHouse() ? tableData_URBAN      : tableData_RURAL; }`,
`        function getTableData()      { return tableData_RURAL; }`],
    ['getMeasureSubTabs 写死农村',
`        function getMeasureSubTabs() { return isUrbanHouse() ? measureSubTabs_URBAN : measureSubTabs_RURAL; }`,
`        function getMeasureSubTabs() { return measureSubTabs_RURAL; }`],
    ['getMeasureData 写死农村',
`        function getMeasureData()    { return isUrbanHouse() ? measureData_URBAN    : measureData_RURAL; }`,
`        function getMeasureData()    { return measureData_RURAL; }`],

    // ---------- 3) 风险口径: 农村三类 ----------
    ['riskLabelMap 写死农村三类',
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
`        // 农村三类口径(拆分后写死)
        const riskLabelMap = {
            '第三类': '第三类',
            '第二类': '第二类',
            '第一类': '第一类',
            '已治理': '第一类',
            '疑似危房': '第三类',
            '严重损坏房': '第三类',
            '一般损坏房': '第二类',
            '完好房(基本完好房)': '第一类'
        };`],

    // 农村不启用 严重损坏房→serious(保持 danger)
    ['riskBadgeClass 去掉城镇serious覆盖',
`        // 城镇四级专用：严重损坏房→橙色（serious）
        if (isUrbanHouse()) riskBadgeClass['严重损坏房'] = 'serious';`,
`        // 农村页: 严重损坏房沿用 danger(不启用城镇 serious)`],

    ['syncHouseArchFromStatus 默认风险等级写死农村',
`            if (!s.riskLevel) { s.riskLevel = isUrbanHouse() ? '一般损坏房' : '第二类'; changed = true; }`,
`            if (!s.riskLevel) { s.riskLevel = '第二类'; changed = true; }`],

    ['crud riskLevel options 写死农村',
`                    { key: 'riskLevel', label: '风险等级', type: 'select', options: isUrbanHouse() ? ['疑似危房', '严重损坏房', '一般损坏房', '完好房'] : ['第一类', '第二类', '第三类'] },`,
`                    { key: 'riskLevel', label: '风险等级', type: 'select', options: ['第一类', '第二类', '第三类'] },`],

    // ---------- 4) 巡查种子: 农村口径 ----------
    ['patrol 种子 农村机构人员',
`            const isUrban = isUrbanHouse();
            const org = isUrban ? '柘林镇城建中心' : '南桥镇城建中心';
            const persons = isUrban ? ['赵敏', '李志强', '王建国', '陈明华'] : ['王建国', '陈明华', '周敏', '张建军'];`,
`            const org = '南桥镇城建中心';
            const persons = ['王建国', '陈明华', '周敏', '张建军'];`],

    // ---------- 5) 查看模式 jbxx: 去掉城镇分支, 保留农村23项 ----------
    ['查看模式 jbxx 写死农村',
`            const isUrban = isUrbanHouse();
            // 城镇：按当前房屋性质动态组装字段；农村：保持原有 23 项
            let jbxx;
            if (isUrban) {
                const urbanRows = getJbxxRows(); // 返回 common + (residential | commercial)
                // 给每行加 libVal 回退，确保旧字段库数据可显示
                jbxx = urbanRows.map(function(row) {
                    const label = row[0];
                    const fallback = row[1];
                    // 优先读 libJbxx（用户编辑过的值）
                    const userVal = libVal(libJbxx, label, undefined);
                    return [label, (userVal !== undefined && userVal !== null && userVal !== '') ? userVal : fallback];
                });
                // 查看页面：隐藏"房屋权属其他内容"、"土地性质其他内容"和"结构类型其他内容"（编辑辅助字段，非独立展示项）
                jbxx = jbxx.filter(function(row) { return row[0] !== '房屋权属其他内容' && row[0] !== '土地性质其他内容' && row[0] !== '结构类型其他内容'; });
            } else {
                jbxx = [`,
`            // 农村：保持原有 23 项
            let jbxx;
            {
                jbxx = [`],

    // ---------- 6) 字段库持久化: 只 dump/restore 农村 ----------
    ['dumpFieldsLibrary 只写农村',
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
            // 农村专属页: 只持久化农村字段库(拆分后不再写入城镇键)
            return {
                basic_RURAL: basicData_RURAL,
                survey_RURAL: surveyData_RURAL,
                table_RURAL: tableData_RURAL,
                measure_RURAL: measureData_RURAL
            };
        }`],

    ['restoreFieldsLibrary 只恢复农村',
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
                [basicData_RURAL, lib.basic_RURAL],
                [surveyData_RURAL, lib.survey_RURAL],
                [tableData_RURAL, lib.table_RURAL],
                [measureData_RURAL, lib.measure_RURAL]
            ];`],

    // ---------- 7) 侧边栏标题写死农村 ----------
    ['侧边栏标题写死农村',
`                const houseType = s.houseType === '城镇自建房' ? '城镇自建房' : '农村自建房';
                const isRural = houseType === '农村自建房';
                sidebarHeaderEl.innerHTML = '<i class="fas ' + (isRural ? 'fa-home' : 'fa-city') + '" style="margin-right:8px;color:#202124;"></i>' + houseType + '安全排查';`,
`                const houseType = '农村自建房';
                sidebarHeaderEl.innerHTML = '<i class="fas fa-home" style="margin-right:8px;color:#202124;"></i>' + houseType + '安全排查';`],

    // ---------- 8) 强制 houseType=农村自建房 ----------
    ['强制记录houseType为农村',
`            if (!Array.isArray(prj0.completeReportFiles)) prj0.completeReportFiles = [];
            if (!Array.isArray(prj0.rectifyPhotos)) prj0.rectifyPhotos = [];
            return rec;
        }`,
`            if (!Array.isArray(prj0.completeReportFiles)) prj0.completeReportFiles = [];
            if (!Array.isArray(prj0.rectifyPhotos)) prj0.rectifyPhotos = [];
            // 农村专属页: 强制 houseType 为农村(路由/兜底以此为准, 不受表单房屋性质影响)
            rec.houseType = '农村自建房';
            return rec;
        }`],
];
