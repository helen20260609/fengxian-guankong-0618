import re

with open('e:/风险管控0618/pages/rural-risk-task-add.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    ('燃气企业', '农村自建房'),
    ('燃气场站', '重点房屋'),
    ('燃气管线', '隐患区域'),
    ('燃气用户', '一般农户'),
    ('燃气管理科', '农村自建房管理科'),
    ('燃气巡查组', '农村自建房巡查组'),
    ('南桥路燃气调压站', '南桥镇解放路120号自建房'),
    ('奉浦大道商业综合体', '奉浦街道人民路88号自建房'),
    ('金海社区燃气管道A段', '金海街道建设路55号自建房'),
    ('海湾旅游区供气站', '海湾镇光明路200号自建房'),
    ('青村镇老旧管网改造区', '青村镇朝阳路95号自建房'),
    ('南桥新城燃气计量站', '南桥镇新建路66号自建房'),
    ('奉浦工业区输气主管', '奉浦街道工业路12号自建房'),
    ('金海商务楼燃气设施', '金海街道金海路168号自建房'),
    ('调压站压力表失效', '房屋结构墙体开裂'),
    ('管道腐蚀泄漏隐患', '房屋结构老化'),
    ('供气站安全间距不足', '房屋地基下沉'),
    ('阀门井积水严重', '屋面渗漏'),
    ('调压器运行异响', '梁柱连接节点松动'),
    ('管道支护结构松动', '墙体歪斜'),
    ('管道运行风险', '房屋使用风险'),
    ('设备设施风险', '房屋结构风险'),
    ('《城镇燃气管理条例》', '《农村自建房安全管理办法》'),
    ('燃气设施运行维护规程', '农村自建房安全排查技术规程'),
    ('燃气 - 新增风险巡查任务', '农村自建房 - 新增风险巡查任务'),
    ('>奉贤燃气公司</option>', '>南桥镇</option>'),
    ('>南桥供气站</option>', '>奉城镇</option>'),
    ('中压管网', '危房区域'),
    ('泄漏抢修', '危房抢修'),
    ('设备故障', '结构损坏'),
    ('管道老化', '结构老化'),
    ('布局缺陷', '结构缺陷'),
    ('设备异常', '结构异常'),
    ('结构安全', '结构安全'),
]

for old, new in replacements:
    content = content.replace(old, new)

# typeIconMap 修改
content = content.replace(
    "const typeIconMap = { enterprise: 'fa-building', station: 'fa-gas-pump', pipeline: 'fa-route', user: 'fa-users' };",
    "const typeIconMap = { enterprise: 'fa-building', station: 'fa-house', pipeline: 'fa-map-location-dot', user: 'fa-users' };"
)

with open('e:/风险管控0618/pages/rural-risk-task-add.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('完成替换')

# 检查残留
keywords = ['燃气', '天然气', '燃气管网', '供气', '燃气管线', '燃气管道', '燃气企业', '燃气场站', '燃气用户', '门站', '储配站', '调压站', 'LNG', 'CNG', '调压器', '输气主管', '管道支护', '压力表']
for kw in keywords:
    if kw in content:
        print(f'残留: {kw} - {content.count(kw)}次')
