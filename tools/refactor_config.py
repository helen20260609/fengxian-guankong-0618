import re

# 读取文件
html = open('e:/风险管控0618/pages/patrol-task-config.html', 'rb').read().decode('utf-8', 'ignore')

# 乡镇、行政村、风险等级、房屋类型、结构类型、巡查人员选项（供替换数据使用）
TOWNS = ['南桥镇', '奉城镇', '四团镇', '柘林镇', '庄行镇', '金汇镇', '青村镇', '海湾镇']
VILLAGES = ['张翁庙村', '洪庙村', '五四村', '新寺村', '潘垫村', '明星村', '李窑村', '星火村', '杨王村', '久茂村', '三坎村', '营房村']
RISK_LEVELS = ['重大隐患', '较大隐患', '一般隐患', '无风险']
HOUSE_TYPES = ['自住', '自住兼经营', '农房辅助用房']
STRUCTURES = ['砖混结构', '框架结构', '砖木结构', '土木结构']
PERSONS = ['张建国', '李秀英', '王志强', '陈美华', '刘大海', '孙明华', '赵敏', '周强', '吴芳', '郑辉']
TASK_TYPES = ['日常巡查', '专项巡查', '临时巡查']
CYCLE_TYPES = ['每天', '每周', '每月', '每年']

# 辅助函数：随机但确定的选择（基于字符串哈希）
def choose_from(options, key):
    idx = hash(key) % len(options)
    return options[idx]

# 1. 替换页面标题和页面文字中的燃气/商业/城市相关描述
html = html.replace('巡查配置管理', '农村自建房巡查配置管理')
html = html.replace('燃气', '农村自建房')
html = html.replace('商业综合体', '农村经营性自建房')
html = html.replace('基坑', '危房')
html = html.replace('幕墙', '农房结构')
html = html.replace('汛期', '汛期农房')
html = html.replace('台风', '极端天气')

# 2. 替换表格表头
html = html.replace('<th>配置名称</th>', '<th>配置名称</th>')
html = html.replace('<th>任务类型</th>', '<th>任务类型</th>')
html = html.replace('<th>紧急程度</th>', '<th>风险等级</th>')
html = html.replace('<th>巡查点位数</th>', '<th>巡查房屋数</th>')
html = html.replace('<th>生成周期</th>', '<th>生成周期</th>')
html = html.replace('<th>任务期限</th>', '<th>任务期限</th>')
html = html.replace('<th>巡查单位</th>', '<th>乡镇/街道</th>')
html = html.replace('<th>巡查人员</th>', '<th>巡查人员</th>')
html = html.replace('<th>创建人</th>', '<th>创建人</th>')
html = html.replace('<th>状态</th>', '<th>状态</th>')
html = html.replace('<th>下次生成</th>', '<th>下次生成</th>')
html = html.replace('<th>操作</th>', '<th>操作</th>')

# 3. 替换筛选条件相关文字
html = html.replace('>配置名称</span>', '>配置名称</span>')
html = html.replace('>任务类型</span>', '>任务类型</span>')
html = html.replace('>生成周期</span>', '>生成周期</span>')
html = html.replace('>状态</span>', '>状态</span>')
html = html.replace('>紧急程度</label>', '>风险等级</label>')
html = html.replace('>巡查单位</label>', '>乡镇/街道</label>')
html = html.replace('placeholder="请输入配置名称"', 'placeholder="请输入配置名称"')
html = html.replace('placeholder="搜索配置名称、巡查单位"', 'placeholder="搜索配置名称、乡镇/街道"')
html = html.replace('placeholder="搜索配置名称、巡查单位、巡查人员"', 'placeholder="搜索配置名称、乡镇/街道、行政村、巡查人员"')

# 4. 替换筛选选项
# 紧急程度选项 -> 风险等级
html = html.replace('<option value="极高">极高</option>', '<option value="重大隐患">重大隐患</option>')
html = html.replace('<option value="高">高</option>', '<option value="较大隐患">较大隐患</option>')
html = html.replace('<option value="中">中</option>', '<option value="一般隐患">一般隐患</option>')
html = html.replace('<option value="低">低</option>', '<option value="无风险">无风险</option>')
html = html.replace('<option value="">全部紧急程度</option>', '<option value="">全部风险等级</option>')

# 巡查单位选项 -> 乡镇/街道
html = html.replace('<option value="">全部巡查单位</option>', '<option value="">全部乡镇/街道</option>')
html = html.replace('<option value="">选择巡查单位</option>', '<option value="">选择乡镇/街道</option>')

# 替换具体单位名示例为乡镇名
html = html.replace('>奉贤燃气公司</option>', '>南桥镇</option>')
html = html.replace('>南桥供气站</option>', '>奉城镇</option>')
html = html.replace('>奉城燃气公司</option>', '>四团镇</option>')
html = html.replace('>四团供气站</option>', '>柘林镇</option>')
html = html.replace('>柘林燃气公司</option>', '>庄行镇</option>')
html = html.replace('>庄行供气站</option>', '>金汇镇</option>')
html = html.replace('>金汇燃气公司</option>', '>青村镇</option>')
html = html.replace('>青村供气站</option>', '>海湾镇</option>')
html = html.replace('>建设工程安全质量监督站</option>', '>南桥镇</option>')
html = html.replace('>基坑监测中心</option>', '>奉城镇</option>')
html = html.replace('>应急巡查组</option>', '>四团镇</option>')

# 5. 替换示例数据行
sample_config_names = [
    '南桥镇经营性自建房日常巡查配置', '奉城镇C级危房专项排查配置', '四团镇危旧房屋安全隐患排查配置',
    '柘林镇农村自建房汛期检查配置', '庄行镇农房翻建工地巡查配置', '金汇镇农村自建房安全复查配置',
    '青村镇经营性自建房联合检查配置', '海湾镇农房辅助用房专项检查配置', '南桥镇农村危房销号核查配置',
    '奉城镇农村自建房安全回头看配置', '四团镇D级危房紧急排查配置', '柘林镇自建房安全隐患整治复查配置'
]

# 6. 替换具体示例文本
html = html.replace('商业综合体日常巡查', '南桥镇经营性自建房日常巡查')
html = html.replace('汛期基坑专项巡查', '奉城镇C级危房专项排查')
html = html.replace('台风幕墙专项巡查', '四团镇危旧房屋安全隐患排查')
html = html.replace('建设工程安全质量监督站', '南桥镇')
html = html.replace('基坑监测中心', '奉城镇')
html = html.replace('应急巡查组', '四团镇')
html = html.replace('刘大伟', '张建国')
html = html.replace('李四', '李秀英')
html = html.replace('王五', '王志强')

# 7. 替换规则配置说明和日志说明
html = html.replace('规则执行日志', '配置执行日志')
html = html.replace('规则配置说明', '配置规则说明')
html = html.replace('按固定周期自动生成，覆盖管辖区域全部风险点', '按固定周期自动生成，覆盖管辖区域全部农村自建房')
html = html.replace('按固定周期或事件触发，针对特定风险类型', '按固定周期或事件触发，针对特定农村自建房风险类型')
html = html.replace('不走规则，通过「手动创建任务」生成', '不走规则，通过「手动创建巡查任务」生成')
html = html.replace('规则变更后，次日生效的任务按新规则执行', '规则变更后，次日生效的巡查任务按新规则执行')
html = html.replace('支持规则暂停/启用，暂停期间不生成任务', '支持规则暂停/启用，暂停期间不生成巡查任务')

# 保存文件
open('e:/风险管控0618/pages/patrol-task-config.html', 'wb').write(html.encode('utf-8'))
print('Done')
