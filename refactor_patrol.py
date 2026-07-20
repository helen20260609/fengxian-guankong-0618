import re

# 读取文件
html = open('e:/风险管控0618/pages/patrol-task-management.html', 'rb').read().decode('utf-8', 'ignore')

# 乡镇、行政村、风险等级、房屋类型、结构类型、巡查人员选项（供替换数据使用）
TOWNS = ['南桥镇', '奉城镇', '四团镇', '柘林镇', '庄行镇', '金汇镇', '青村镇', '海湾镇']
VILLAGES = ['张翁庙村', '洪庙村', '五四村', '新寺村', '潘垫村', '明星村', '李窑村', '星火村', '杨王村', '久茂村', '三坎村', '营房村']
RISK_LEVELS = ['重大隐患', '较大隐患', '一般隐患', '无风险']
HOUSE_TYPES = ['自住', '自住兼经营', '农房辅助用房']
STRUCTURES = ['砖混结构', '框架结构', '砖木结构', '土木结构']
PERSONS = ['张建国', '李秀英', '王志强', '陈美华', '刘大海', '孙明华', '赵敏', '周强', '吴芳', '郑辉']
TASK_TYPES = ['日常巡查', '专项巡查', '临时巡查', '复查任务']

# 辅助函数：随机但确定的选择（基于字符串哈希）
def choose_from(options, key):
    idx = hash(key) % len(options)
    return options[idx]

# 1. 替换页面标题和页面文字中的燃气相关描述
html = html.replace('燃气 - 风险巡查任务管理_files', '农村自建房 - 风险巡查任务管理_files')
html = html.replace('燃气巡查', '农村自建房巡查')
html = html.replace('燃气', '农村自建房')
html = html.replace('燃气调压站', '农村自建房')

# 2. 替换 KPI 卡片标签（只看 label 部分）
kpi_replacements = {
    '待接收任务': '待接收任务',
    '进行中任务': '进行中任务',
    '已逾期任务': '已逾期任务',
    '待销号任务': '待销号任务',
    '重大隐患数': '重大隐患数',
    '完成率': '完成率',
    '待分配任务': '待分配任务',
    '已完成任务': '已完成任务',
    '已退回任务': '已退回任务',
    '已终止任务': '已终止任务',
    '巡查点': '巡查房屋',
}

# 3. 替换表格表头：在 thead 的 <th> 中
html = html.replace('<th>巡查单位</th>', '<th>乡镇/街道</th>')
html = html.replace('<th>巡查点位数</th>', '<th>巡查房屋数</th>')
html = html.replace('<th>紧急程度</th>', '<th>风险等级</th>')
html = html.replace('<th>任务类型</th>', '<th>任务类型</th>')
html = html.replace('<th>巡查进度</th>', '<th>巡查进度</th>')
html = html.replace('<th>状态</th>', '<th>状态</th>')
html = html.replace('<th>标记</th>', '<th>标记</th>')
html = html.replace('<th>完成时间</th>', '<th>完成时间</th>')
html = html.replace('<th>隐患整改情况</th>', '<th>隐患整改情况</th>')
html = html.replace('<th>创建人</th>', '<th>创建人</th>')
html = html.replace('<th>操作</th>', '<th>操作</th>')

# 4. 替换模板中的字段名和显示文字
html = html.replace('${t.urgencyLabel || \'-\'}', '${t.riskLabel || \'-\'}')
html = html.replace('${t.archiveCount}', '${t.houseCount}')
html = html.replace('巡查点位数', '巡查房屋数')
html = html.replace('巡查单位', '乡镇/街道')
html = html.replace('紧急程度', '风险等级')
html = html.replace('urgencyColor', 'riskColor')
html = html.replace('urgencyLabel', 'riskLabel')
html = html.replace('archiveCount', 'houseCount')

# 5. 替换筛选条件相关文字和选项
html = html.replace('>紧急程度</label>', '>风险等级</label>')
html = html.replace('>巡查单位</label>', '>乡镇/街道</label>')
html = html.replace('>任务类型</label>', '>任务类型</label>')
html = html.replace('placeholder="搜索任务名称、巡查单位、巡查人员"', 'placeholder="搜索任务名称、乡镇/街道、行政村、巡查人员"')
html = html.replace('placeholder="搜索任务名称、巡查单位"', 'placeholder="搜索任务名称、乡镇/街道"')

# 6. 替换筛选选项中的<option>文本
# 紧急程度选项：极高/高/中/低 -> 风险等级
html = html.replace('<option value="">全部紧急程度</option>', '<option value="">全部风险等级</option>')
html = html.replace('<option value="极高">极高</option>', '<option value="重大隐患">重大隐患</option>')
html = html.replace('<option value="高">高</option>', '<option value="较大隐患">较大隐患</option>')
html = html.replace('<option value="中">中</option>', '<option value="一般隐患">一般隐患</option>')
html = html.replace('<option value="低">低</option>', '<option value="无风险">无风险</option>')

# 巡查单位选项：改为乡镇/街道
html = html.replace('<option value="">全部巡查单位</option>', '<option value="">全部乡镇/街道</option>')
html = html.replace('<option value="">选择巡查单位</option>', '<option value="">选择乡镇/街道</option>')

# 替换可能的具体单位名示例为乡镇名
html = html.replace('>奉贤燃气公司</option>', '>南桥镇</option>')
html = html.replace('>南桥供气站</option>', '>奉城镇</option>')
html = html.replace('>奉城燃气公司</option>', '>四团镇</option>')
html = html.replace('>四团供气站</option>', '>柘林镇</option>')
html = html.replace('>柘林燃气公司</option>', '>庄行镇</option>')
html = html.replace('>庄行供气站</option>', '>金汇镇</option>')
html = html.replace('>金汇燃气公司</option>', '>青村镇</option>')
html = html.replace('>青村供气站</option>', '>海湾镇</option>')

# 7. 替换所有燃气相关的示例数据行（JS objects 中的字符串）
# 定义一个数据映射：燃气主题 -> 农村自建房主题
sample_task_names = [
    '南桥镇经营性自建房日常巡查', '奉城镇C级危房专项排查', '四团镇危旧房屋安全隐患排查',
    '柘林镇农村自建房汛期检查', '庄行镇农房翻建工地巡查', '金汇镇农村自建房安全复查',
    '青村镇经营性自建房联合检查', '海湾镇农房辅助用房专项检查', '南桥镇农村危房销号核查',
    '奉城镇农村自建房安全回头看', '四团镇D级危房紧急排查', '柘林镇自建房安全隐患整治复查'
]

# 由于原始数据很多，我们采用替换规则：在 script 中所有包含 gas 的示例数据数组我们重写为 rural 示例数据
# 先找到所有示例数据数组 const sampleTasks = [...]
# 将其中每个字段值进行替换

def replace_sample_data_field(m):
    """替换示例数据对象字段值"""
    obj = m.group(0)
    # 替换名称
    obj = re.sub(r'name:\s*["\'][^"\']+["\']', lambda mm: 'name: "{}"'.format(choose_from(sample_task_names, mm.group(0))), obj, count=1)
    # 替换 unit -> town
    obj = re.sub(r'unit:\s*["\'][^"\']+["\']', lambda mm: 'town: "{}"'.format(choose_from(TOWNS, mm.group(0))), obj, count=1)
    # 替换 archiveCount -> houseCount
    obj = re.sub(r'archiveCount:\s*\d+', lambda mm: 'houseCount: {}'.format(20 + (hash(mm.group(0)) % 80)), obj, count=1)
    # 替换 urgency -> riskLevel
    obj = re.sub(r'urgency:\s*["\'][^"\']+["\']', lambda mm: 'riskLevel: "{}"'.format(choose_from(RISK_LEVELS, mm.group(0))), obj, count=1)
    # 替换 houseType/structure/village/person 等
    obj = re.sub(r'person:\s*["\'][^"\']+["\']', lambda mm: 'person: "{}"'.format(choose_from(PERSONS, mm.group(0))), obj, count=1)
    return obj

# 匹配所有 JS 对象字面量 { ... } 中含有 name: 和 unit: 或 archiveCount 的对象
html = re.sub(r'\{\s*id:\s*\d+[^}]*\}', replace_sample_data_field, html)

# 8. 替换所有示例数据数组中的名字和单位（由于对象已经被替换，现在替换其他出现的固定字符串）
# 更稳妥的做法：找出所有 id: 1 开头的示例数据块，整体替换为农村自建房示例数据
# 但正则替换可能无法保证顺序。我们可以生成一个完整的 rural 示例数据数组，然后替换 const sampleTasks = [ ... ];

# 找到 const sampleTasks = [ ... ]; 或 const tasks = [ ... ];
array_pattern = re.compile(r'(const\s+\w+\s*=\s*\[)([\s\S]*?)(\];\s*const|\];\s*function|\];\s*let|\];\s*var|\];)', re.DOTALL)

# 生成新的示例数据数组
sample_data = []
for i in range(1, 13):
    sample_data.append(f'''{{
    id: {i},
    name: "{choose_from(sample_task_names, str(i))}",
    taskType: "{choose_from(TASK_TYPES, str(i))}",
    riskLevel: "{choose_from(RISK_LEVELS, str(i))}",
    riskLabel: "{choose_from(RISK_LEVELS, str(i))}",
    riskColor: "var(--danger)",
    houseCount: {20 + (i * 7) % 80},
    town: "{choose_from(TOWNS, str(i))}",
    village: "{choose_from(VILLAGES, str(i))}",
    houseType: "{choose_from(HOUSE_TYPES, str(i))}",
    structure: "{choose_from(STRUCTURES, str(i))}",
    person: "{choose_from(PERSONS, str(i))}",
    startDate: "2025-07-{'{:02d}'.format(i % 30 + 1)}",
    endDate: "2025-07-{'{:02d}'.format((i + 5) % 30 + 1)}",
    progress: {min(100, i * 10 + 5)},
    status: "{['draft', 'issued', 'pending-assign', 'processing', 'completed', 'rejected', 'terminated'][i % 7]}",
    statusLabel: "{['草稿', '待接收', '待分配', '进行中', '已完成', '任务回退', '已终止'][i % 7]}",
    statusClass: "{['draft', 'issued', 'pending-assign', 'processing', 'completed', 'rejected', 'terminated'][i % 7]}",
    finishTime: "{'2025-07-{:02d}'.format((i + 8) % 30 + 1) if i % 7 == 4 else ''}",
    createBy: "{choose_from(PERSONS, 'c' + str(i))}",
    hiddenTotal: {i % 5},
    hiddenFixed: {i % 3},
    overdue: {i % 2 == 1},
    completedLate: {i % 3 == 0}
}}''')

new_array = '[\n' + ',\n'.join(sample_data) + '\n]'

# 替换数组（只替换第一个匹配到的示例数据数组）
def replace_array(m):
    return m.group(1) + new_array + m.group(3)[2:]  # 保留后面的关键字

# 先尝试替换 const sampleTasks = [...]
html, count = array_pattern.subn(replace_array, html, count=1)
print('Replaced sample arrays:', count)

# 9. 处理页面中其他出现的燃气示例文本（如任务名称直接出现在 HTML 中）
html = html.replace('南桥路燃气调压站日常巡查', '南桥镇经营性自建房日常巡查')
html = html.replace('南桥路燃气管道巡查', '奉城镇C级危房专项排查')
html = html.replace('奉城燃气公司', '南桥镇')
html = html.replace('四团燃气站', '奉城镇')
html = html.replace('柘林燃气调压站', '四团镇')

# 10. 修复 innerHTML 标签泄漏问题：查找任何单独的 </span> 或 </div> 文本
# 如果存在，通常是因为字符串拼接错误。我们将其统一清理。
html = re.sub(r'(?<!\w|"|\'|>)\s*\</span\>\s*(?!\s*\<)', '', html)
html = re.sub(r'(?<!\w|"|\'|>)\s*\</div\>\s*(?!\s*\<)', '', html)

# 11. 确保 tab 筛选区正确闭合
# 修复可能由之前复制导致的 "</span>" 泄漏
html = html.replace('</span>\n</span>', '</span>')
html = html.replace('</div>\n</div>', '</div>')

# 保存文件
open('e:/风险管控0618/pages/patrol-task-management.html', 'wb').write(html.encode('utf-8'))
print('Done')
