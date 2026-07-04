import pandas as pd

# 读取Excel文件，跳过第一行（标题行）
df = pd.read_excel('城镇农村自建房安全风险辨识清单0602.xlsx', header=1)

# 提取有效数据（排除最后一行说明）
df = df[df['序号'].notna() & (df['序号'] != '红：疑似危房\n橙：严重损坏房\n黄：一般损坏房\n蓝：完好房（基本完好房）')]

# 填充主项和分项
df['主项'] = df['主项'].ffill()
df['分项'] = df['分项'].ffill()
df['分项内容'] = df['分项内容'].ffill()

# 按风险等级排序：红-橙-黄-蓝
risk_order = {'红色': 0, '橙色': 1, '黄色': 2, '蓝色': 3}
df['风险排序'] = df['风险分\n级/风\n险标识'].map(risk_order)

# 按主项、分项、风险排序排序
df = df.sort_values(['主项', '分项', '风险排序'])

# 生成HTML表格行
html_rows = []
for idx, row in df.iterrows():
    xuhao = int(row['序号'])
    zhuxiang = row['主项']
    fenxiang = row['分项']
    neirong = row['分项内容']
    bianbie = row['风险辨识']
    fengxian = row['风险分\n级/风\n险标识']
    shigu = row['可能导\n致事故']
    cuoshi = row['主要防范措施']
    
    # 风险等级样式
    risk_class = {'红色': 'red', '橙色': 'orange', '黄色': 'yellow', '蓝色': 'blue'}.get(fengxian, 'blue')
    risk_text = {'红色': '重大', '橙色': '较大', '黄色': '一般', '蓝色': '低'}.get(fengxian, '低')
    
    html_rows.append(f'<tr><td>{xuhao}</td><td>{zhuxiang}</td><td>{fenxiang}</td><td>{neirong}</td><td>{bianbie}</td><td><span class="risk-badge {risk_class}">{fengxian}（{risk_text}）</span></td><td>{shigu}</td><td>{cuoshi}</td><td><button class="btn btn-text" onclick="openModal(\'modal-view-item\')"><i class="fa-solid fa-eye"></i> 查看</button><button class="btn btn-text" onclick="openModal(\'modal-edit-item\')"><i class="fa-solid fa-pen-to-square"></i> 编辑</button><button class="btn btn-text" style="color:var(--danger)" onclick="openModal(\'modal-delete-confirm\')"><i class="fa-solid fa-trash"></i> 删除</button></td></tr>')

# 输出HTML
print('\n'.join(html_rows))
