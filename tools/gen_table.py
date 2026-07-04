import pandas as pd

df = pd.read_excel('城镇农村自建房安全风险辨识清单0602.xlsx', header=1)
df = df[df['序号'].notna() & (df['序号'] != '红：疑似危房\n橙：严重损坏房\n黄：一般损坏房\n蓝：完好房（基本完好房）')]
df['主项'] = df['主项'].ffill()
df['分项'] = df['分项'].ffill()
df['分项内容'] = df['分项内容'].ffill()

risk_order = {'红色':0, '橙色':1, '黄色':2, '蓝色':3}
df['风险排序'] = df['风险分\n级/风\n险标识'].map(risk_order)
df = df.sort_values(['主项', '分项', '风险排序'])

risk_class = {'红色':'red', '橙色':'orange', '黄色':'yellow', '蓝色':'blue'}

main_groups = {}
for _, r in df.iterrows():
    main = r['主项']
    if main not in main_groups:
        main_groups[main] = []
    main_groups[main].append(r)

html_parts = []
for main_cat, items in main_groups.items():
    html_parts.append(f'        <!-- {main_cat} -->')
    html_parts.append(f'        <div class="tree-group-header" onclick="toggleTreeGroup(this)">')
    html_parts.append(f'            <span style="flex:1"><span class="toggle-arrow">▼</span> {main_cat}</span>')
    html_parts.append('        </div>')
    html_parts.append('        <div class="tree-children">')
    for r in items:
        sub = r['分项']
        content = str(r['分项内容']).strip() if pd.notna(r['分项内容']) else ''
        risk = r['风险分\n级/风\n险标识']
        rc = risk_class.get(risk, 'blue')
        html_parts.append(f'            <div class="tree-row">')
        html_parts.append(f'                <span>{main_cat}</span><span>{sub}</span>')
        html_parts.append(f'                <span class="cell-content">{content}</span>')
        html_parts.append(f'                <span style="text-align:center"><span class="risk-dot {rc}"></span></span>')
        html_parts.append(f'                <span class="cell-actions" style="text-align:center">')
        html_parts.append(f'                    <a onclick="openModal(\'modal-view-item\')">查看</a>')
        html_parts.append(f'                    <a onclick="openModal(\'modal-edit-item\')">编辑</a>')
        html_parts.append(f'                    <a class="del" onclick="openModal(\'modal-delete-confirm\')">删除</a>')
        html_parts.append('                </span>')
        html_parts.append('            </div>')
    html_parts.append('        </div>')

with open('table_rows.html', 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_parts))

print('Done', len(df))
