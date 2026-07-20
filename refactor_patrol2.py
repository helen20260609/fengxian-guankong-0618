import re

html = open('e:/风险管控0618/pages/patrol-task-management.html', 'rb').read().decode('utf-8', 'ignore')

# 定义替换池
TASK_NAMES = [
    '南桥镇经营性自建房日常巡查', '奉城镇C级危房专项排查', '四团镇危旧房屋安全隐患排查',
    '柘林镇农村自建房汛期检查', '庄行镇农房翻建工地巡查', '金汇镇农村自建房安全复查',
    '青村镇经营性自建房联合检查', '海湾镇农房辅助用房专项检查', '南桥镇农村危房销号核查',
    '奉城镇农村自建房安全回头看', '四团镇D级危房紧急排查', '柘林镇自建房安全隐患整治复查',
    '庄行镇农村自建房网格化巡查', '金汇镇老旧自建房安全体检', '青村镇农房风险点常态化巡查',
    '海湾镇临河自建房防汛专项巡查'
]
TOWNS = ['南桥镇', '奉城镇', '四团镇', '柘林镇', '庄行镇', '金汇镇', '青村镇', '海湾镇']
VILLAGES = ['张翁庙村', '洪庙村', '五四村', '新寺村', '潘垫村', '明星村', '李窑村', '星火村', '杨王村', '久茂村', '三坎村', '营房村']
RISK_LEVELS = ['重大隐患', '较大隐患', '一般隐患', '无风险']
RISK_COLORS = {
    '重大隐患': 'var(--danger)',
    '较大隐患': '#c78000',
    '一般隐患': 'var(--primary)',
    '无风险': 'var(--success)'
}
HOUSE_TYPES = ['自住', '自住兼经营', '农房辅助用房']
STRUCTURES = ['砖混结构', '框架结构', '砖木结构', '土木结构']
PERSONS = ['张建国', '李秀英', '王志强', '陈美华', '刘大海', '孙明华', '赵敏', '周强', '吴芳', '郑辉', '杨林', '徐静']
CREATORS = ['系统管理员', '张建国', '李秀英', '王志强']
STATUSES = [
    ('processing', '进行中'), ('completed', '已完成'), ('draft', '草稿'),
    ('issued', '待接收'), ('rejected', '任务回退'), ('terminated', '已终止')
]
OVERDUE_MARKS = ['已逾期', '按时完成', '逾期完成', '-']
RECTIFIES = [
    ('unfixed', '1处 · 未整改'), ('none', '0处 · 无隐患'), ('partial', '2处 · 部分整改'),
    ('fully', '3处 · 全部整改'), ('unfixed', '2处 · 未整改'), ('none', '0处 · 无隐患')
]

row_counter = [0]

def row_replacer(m):
    """替换单个表格行中所有字段为农村自建房数据"""
    row = m.group(0)
    idx = row_counter[0]
    row_counter[0] += 1

    # 任务名称
    row = re.sub(r'(<td><strong>)[^<]*?(</strong></td>)', r'\1{}\2'.format(TASK_NAMES[idx % len(TASK_NAMES)]), row, count=1)

    # 风险等级（第二个 td 内 span）
    risk = RISK_LEVELS[idx % len(RISK_LEVELS)]
    risk_color = RISK_COLORS[risk]
    row = re.sub(r'(<td><span style="font-size:12px;font-weight:600;color:)[^;]+(;">)[^<]+(</span></td>)', r'\1{}\2{}\3'.format(risk_color, risk), row, count=1)

    # 巡查房屋数（原“巡查点位数”）
    count = 3 + (idx % 8)
    row = re.sub(r'(<td><span style="color:var\(--primary\);font-weight:600;">)\d+(</span>)\s*个点位(</td>)', r'\1{}\2 间\3'.format(count), row, count=1)
    row = re.sub(r'(<td><span style="color:var\(--primary\);font-weight:600;">)\d+(</span>)\s*巡查点位(</td>)', r'\1{}\2 间\3'.format(count), row, count=1)

    # 乡镇/街道（原“巡查单位”）
    town = TOWNS[idx % len(TOWNS)]
    row = re.sub(r'(<td><span style="font-size:12px;color:var\(--text-secondary\);">)[^<]+(</span></td>)', r'\1{}\2'.format(town), row, count=1)

    # 巡查人员
    person = PERSONS[idx % len(PERSONS)]
    row = re.sub(r'(<i class="fas fa-user"[^>]*></i>)[^<]+(</td>)', r'\1{}\2'.format(person), row, count=1)

    # 创建人
    creator = CREATORS[idx % len(CREATORS)]
    row = re.sub(r'(<i class="fas fa-user" style="color:var\(--text-secondary\);margin-right:4px;font-size:11px;"></i>)[^<]+(</td>)', r'\1{}\2'.format(creator), row, count=1)

    # 状态
    status_class, status_label = STATUSES[idx % len(STATUSES)]
    row = re.sub(r'(<span class="status-tag )[^"]+(">)[^<]+(</span>)', r'\1{}\2{}\3'.format(status_class, status_label), row, count=1)

    # 标记
    mark = OVERDUE_MARKS[idx % len(OVERDUE_MARKS)]
    if mark == '-':
        row = re.sub(r'(<td><span class="overdue-mark )[^"]+(">)[^<]*?</span>[^<]*(</span>)?</td>', r'<td><span class="overdue-mark na">-</span></td>', row, count=1)
    else:
        mark_class = 'overdue' if '逾期' in mark and mark != '按时完成' else ('completed-late' if '逾期完成' in mark else ('on-time' if '按时' in mark else 'na'))
        icon = 'fa-exclamation-triangle' if mark == '已逾期' else ('fa-check-circle' if mark in ['按时完成', '逾期完成'] else '')
        if icon:
            row = re.sub(r'(<td><span class="overdue-mark )[^"]+("><i class="fas )[^"]+( [^"]*" style="font-size:10px;"></i>)[^<]+(</span></td>)', r'\1{}\2{}\3{}\4'.format(mark_class, 'fa-' + icon, mark), row, count=1)
        else:
            row = re.sub(r'(<td><span class="overdue-mark )[^"]+(">)[^<]+(</span></td>)', r'\1{}\2{}\3'.format(mark_class, mark), row, count=1)

    # 隐患整改情况
    rect_class, rect_text = RECTIFIES[idx % len(RECTIFIES)]
    row = re.sub(r'(<td><span class="rectify-cell )[^"]+(">)[^<]+(</span></td>)', r'\1{}\2{}\3'.format(rect_class, rect_text), row, count=1)

    return row

# 替换所有 table rows
html, count = re.subn(r'<tr>\s*<td><strong>.*?</strong></td>.*?</tr>', row_replacer, html, flags=re.DOTALL)
print('Replaced rows:', count)

# 替换筛选选项中的单位
html = html.replace('<option value="农村自建房管理所">农村自建房管理所</option>', '<option value="南桥镇">南桥镇</option>')
html = html.replace('<option value="城市综合管理科（安全监督科）">城市综合管理科（安全监督科）</option>', '<option value="奉城镇">奉城镇</option>')
html = html.replace('<option value="交通建设管理中心">交通建设管理中心</option>', '<option value="四团镇">四团镇</option>')
html = html.replace('<option value="建设工程安全质量监督站">建设工程安全质量监督站</option>', '<option value="柘林镇">柘林镇</option>')
html = html.replace('<option value="城乡建设管理科">城乡建设管理科</option>', '<option value="庄行镇">庄行镇</option>')

# 替换风险等级选项
html = html.replace('<option value="high">高</option>', '<option value="重大隐患">重大隐患</option>')
html = html.replace('<option value="medium">中</option>', '<option value="较大隐患">较大隐患</option>')
html = html.replace('<option value="low">低</option>', '<option value="一般隐患">一般隐患</option>')
html = html.replace('<option value="">全部风险等级</option>', '<option value="">全部风险等级</option>')

# 添加行政村、房屋类型、结构形式筛选（在 filter-row 中追加）
# 替换第二个 filter-row 中的时间范围之前，插入行政村和房屋类型筛选
html = html.replace(
    '<div class="filter-item" style="min-width:260px;">\n                <label>时间范围</label>',
    '<div class="filter-item" style="min-width:140px;">\n                <label>行政村</label>\n                <select class="filter-select" id="filterVillage">\n                    <option value="">全部</option>\n                    <option value="张翁庙村">张翁庙村</option>\n                    <option value="洪庙村">洪庙村</option>\n                    <option value="五四村">五四村</option>\n                    <option value="新寺村">新寺村</option>\n                    <option value="潘垫村">潘垫村</option>\n                    <option value="明星村">明星村</option>\n                    <option value="李窑村">李窑村</option>\n                    <option value="星火村">星火村</option>\n                    <option value="杨王村">杨王村</option>\n                    <option value="久茂村">久茂村</option>\n                    <option value="三坎村">三坎村</option>\n                    <option value="营房村">营房村</option>\n                </select>\n            </div>\n            <div class="filter-item" style="min-width:120px;">\n                <label>房屋类型</label>\n                <select class="filter-select" id="filterHouseType">\n                    <option value="">全部</option>\n                    <option value="自住">自住</option>\n                    <option value="自住兼经营">自住兼经营</option>\n                    <option value="农房辅助用房">农房辅助用房</option>\n                </select>\n            </div>\n            <div class="filter-item" style="min-width:120px;">\n                <label>结构形式</label>\n                <select class="filter-select" id="filterStructure">\n                    <option value="">全部</option>\n                    <option value="砖混结构">砖混结构</option>\n                    <option value="框架结构">框架结构</option>\n                    <option value="砖木结构">砖木结构</option>\n                    <option value="土木结构">土木结构</option>\n                </select>\n            </div>\n            <div class="filter-item" style="min-width:260px;">\n                <label>时间范围</label>'
)

# 更新 KPI 标签
html = html.replace('<span class="kpi-card-label">待闭环隐患</span>', '<span class="kpi-card-label">待销号任务</span>')
html = html.replace('<span class="kpi-card-label">任务完成率</span>', '<span class="kpi-card-label">完成率</span>')

# 更新 script 中的字段映射和示例数据
# 替换字段名
html = html.replace('urgencyLabel', 'riskLabel')
html = html.replace('urgencyColor', 'riskColor')
html = html.replace('archiveCount', 'houseCount')
html = html.replace('unit:', 'town:')

# 更新 script 中 sampleTasks 数据生成函数（如果有的话）
# 查找 script 中所有包含 "const sampleTasks" 或类似数组定义的地方

def script_data_replacer(m):
    """替换 script 数据定义块"""
    block = m.group(0)
    # 把 block 中所有对象字面量进行字段替换
    block = re.sub(r'name:\s*"[^"]*"', lambda mm: 'name: "{}"'.format(TASK_NAMES[hash(mm.group(0)) % len(TASK_NAMES)]), block)
    block = re.sub(r'unit:\s*"[^"]*"', lambda mm: 'town: "{}"'.format(TOWNS[hash(mm.group(0)) % len(TOWNS)]), block)
    block = re.sub(r'urgency:\s*"[^"]*"', lambda mm: 'riskLevel: "{}"'.format(RISK_LEVELS[hash(mm.group(0)) % len(RISK_LEVELS)]), block)
    block = re.sub(r'archiveCount:\s*\d+', lambda mm: 'houseCount: {}'.format(3 + (hash(mm.group(0)) % 8)), block)
    return block

# 替换 script 内容
html = re.sub(r'(<script>)(.*?)(</script>)', lambda m: m.group(1) + script_data_replacer(re.search(r'(<script>)(.*?)(</script>)', html, re.S).group(2)) + m.group(3), html, flags=re.S, count=1)

# 清理所有 "燃气" 相关残留
html = html.replace('燃气', '农村自建房')
html = html.replace('调压站', '自建房')
html = html.replace('供气站', '自然村')
html = html.replace('管网排查', '危房排查')
html = html.replace('管网设施', '房屋结构')
html = html.replace('商业街区农村自建房设施巡检', '商业街区经营性自建房巡查')
html = html.replace('老旧小区', '老旧自建房')
html = html.replace('农村自建房设施', '农村自建房')
html = html.replace('农村自建房巡检', '农村自建房巡查')
html = html.replace('农村自建房调压站', '农村自建房')
html = html.replace('巡查点位', '巡查房屋')

# 保存
open('e:/风险管控0618/pages/patrol-task-management.html', 'wb').write(html.encode('utf-8'))
print('Saved')
