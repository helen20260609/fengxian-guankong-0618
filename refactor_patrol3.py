import re

html = open('e:/风险管控0618/pages/patrol-task-management.html', 'rb').read().decode('utf-8', 'ignore')

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
    row = m.group(0)
    idx = row_counter[0]
    row_counter[0] += 1

    # 任务名称
    def rep_name(mm):
        return f'{mm.group(1)}{TASK_NAMES[idx % len(TASK_NAMES)]}{mm.group(2)}'
    row = re.sub(r'(<td><strong>)[^\u003c]*?(</strong></td>)', rep_name, row, count=1)

    # 风险等级
    risk = RISK_LEVELS[idx % len(RISK_LEVELS)]
    risk_color = RISK_COLORS[risk]
    def rep_risk(mm):
        return f'{mm.group(1)}{risk_color}{mm.group(2)}{risk}{mm.group(3)}'
    row = re.sub(r'(<td><span style="font-size:12px;font-weight:600;color:)[^;]+(;">)[^\u003c]+(</span></td>)', rep_risk, row, count=1)

    # 巡查房屋数
    count = 3 + (idx % 8)
    def rep_count(mm):
        return f'{mm.group(1)}{count}{mm.group(2)} 间{mm.group(3)}'
    row = re.sub(r'(<td><span style="color:var\(--primary\);font-weight:600;">)\d+(</span>)\s*个点位(</td>)', rep_count, row, count=1)
    row = re.sub(r'(<td><span style="color:var\(--primary\);font-weight:600;">)\d+(</span>)\s*巡查点位(</td>)', rep_count, row, count=1)

    # 乡镇/街道
    town = TOWNS[idx % len(TOWNS)]
    def rep_town(mm):
        return f'{mm.group(1)}{town}{mm.group(2)}'
    row = re.sub(r'(<td><span style="font-size:12px;color:var\(--text-secondary\);">)[^\u003c]+(</span></td>)', rep_town, row, count=1)

    # 巡查人员 (第一个匹配)
    person = PERSONS[idx % len(PERSONS)]
    def rep_person(mm):
        return f'{mm.group(1)}{person}{mm.group(2)}'
    row = re.sub(r'(<i class="fas fa-user"[^\u003e]*></i>)[^\u003c]+(</td>)', rep_person, row, count=1)

    # 创建人 (第二个匹配)
    creator = CREATORS[idx % len(CREATORS)]
    def rep_creator(mm):
        return f'{mm.group(1)}{creator}{mm.group(2)}'
    row = re.sub(r'(<i class="fas fa-user" style="color:var\(--text-secondary\);margin-right:4px;font-size:11px;"></i>)[^\u003c]+(</td>)', rep_creator, row, count=1)

    # 状态
    status_class, status_label = STATUSES[idx % len(STATUSES)]
    def rep_status(mm):
        return f'{mm.group(1)}{status_class}{mm.group(2)}{status_label}{mm.group(3)}'
    row = re.sub(r'(<span class="status-tag )[^"]+(">)[^\u003c]+(</span>)', rep_status, row, count=1)

    # 标记
    mark = OVERDUE_MARKS[idx % len(OVERDUE_MARKS)]
    if mark == '-':
        row = re.sub(r'(<td><span class="overdue-mark )[^"]+(">)[^\u003c]*?</span>[^\u003c]*(</span>)?</td>', '<td><span class="overdue-mark na">-</span></td>', row, count=1)
    else:
        mark_class = 'overdue' if mark == '已逾期' else ('completed-late' if mark == '逾期完成' else ('on-time' if mark == '按时完成' else 'na'))
        icon = 'fa-exclamation-triangle' if mark == '已逾期' else 'fa-check-circle'
        def rep_mark(mm):
            return f'{mm.group(1)}{mark_class}{mm.group(2)}fa-{icon}{mm.group(3)}{mark}{mm.group(4)}'
        row = re.sub(r'(<td><span class="overdue-mark )[^"]+("><i class="fas )[^"]+( [^"]*" style="font-size:10px;"></i>)[^\u003c]+(</span></td>)', rep_mark, row, count=1)

    # 隐患整改情况
    rect_class, rect_text = RECTIFIES[idx % len(RECTIFIES)]
    def rep_rect(mm):
        return f'{mm.group(1)}{rect_class}{mm.group(2)}{rect_text}{mm.group(3)}'
    row = re.sub(r'(<td><span class="rectify-cell )[^"]+(">)[^\u003c]+(</span></td>)', rep_rect, row, count=1)

    return row

html, count = re.subn(r'<tr>\s*<td><strong>.*?\u003c/strong>\u003c/td>.*?\u003c/tr>', row_replacer, html, flags=re.DOTALL)
print('Replaced rows:', count)

# 替换筛选选项
html = html.replace('<option value="农村自建房管理所">农村自建房管理所</option>', '<option value="南桥镇">南桥镇</option>')
html = html.replace('<option value="城市综合管理科（安全监督科）">城市综合管理科（安全监督科）</option>', '<option value="奉城镇">奉城镇</option>')
html = html.replace('<option value="交通建设管理中心">交通建设管理中心</option>', '<option value="四团镇">四团镇</option>')
html = html.replace('<option value="建设工程安全质量监督站">建设工程安全质量监督站</option>', '<option value="柘林镇">柘林镇</option>')
html = html.replace('<option value="城乡建设管理科">城乡建设管理科</option>', '<option value="庄行镇">庄行镇</option>')
html = html.replace('<option value="high">高</option>', '<option value="重大隐患">重大隐患</option>')
html = html.replace('<option value="medium">中</option>', '<option value="较大隐患">较大隐患</option>')
html = html.replace('<option value="low">低</option>', '<option value="一般隐患">一般隐患</option>')

# 添加行政村、房屋类型、结构形式筛选
html = html.replace(
    '<div class="filter-item" style="min-width:260px;">\n                <label>时间范围</label>',
    '<div class="filter-item" style="min-width:140px;">\n                <label>行政村</label>\n                <select class="filter-select" id="filterVillage">\n                    <option value="">全部</option>\n                    <option value="张翁庙村">张翁庙村</option>\n                    <option value="洪庙村">洪庙村</option>\n                    <option value="五四村">五四村</option>\n                    <option value="新寺村">新寺村</option>\n                    <option value="潘垫村">潘垫村</option>\n                    <option value="明星村">明星村</option>\n                    <option value="李窑村">李窑村</option>\n                    <option value="星火村">星火村</option>\n                    <option value="杨王村">杨王村</option>\n                    <option value="久茂村">久茂村</option>\n                    <option value="三坎村">三坎村</option>\n                    <option value="营房村">营房村</option>\n                </select>\n            </div>\n            <div class="filter-item" style="min-width:120px;">\n                <label>房屋类型</label>\n                <select class="filter-select" id="filterHouseType">\n                    <option value="">全部</option>\n                    <option value="自住">自住</option>\n                    <option value="自住兼经营">自住兼经营</option>\n                    <option value="农房辅助用房">农房辅助用房</option>\n                </select>\n            </div>\n            <div class="filter-item" style="min-width:120px;">\n                <label>结构形式</label>\n                <select class="filter-select" id="filterStructure">\n                    <option value="">全部</option>\n                    <option value="砖混结构">砖混结构</option>\n                    <option value="框架结构">框架结构</option>\n                    <option value="砖木结构">砖木结构</option>\n                    <option value="土木结构">土木结构</option>\n                </select>\n            </div>\n            <div class="filter-item" style="min-width:260px;">\n                <label>时间范围</label>'
)

# KPI 标签
html = html.replace('<span class="kpi-card-label">待闭环隐患</span>', '<span class="kpi-card-label">待销号任务</span>')
html = html.replace('<span class="kpi-card-label">任务完成率</span>', '<span class="kpi-card-label">完成率</span>')

# script 字段映射
html = html.replace('urgencyLabel', 'riskLabel')
html = html.replace('urgencyColor', 'riskColor')
html = html.replace('archiveCount', 'houseCount')
html = html.replace('unit:', 'town:')

# 清理燃气相关残留
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

open('e:/风险管控0618/pages/patrol-task-management.html', 'wb').write(html.encode('utf-8'))
print('Saved')
