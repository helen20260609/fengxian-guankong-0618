import pandas as pd
import json

df = pd.read_excel('城镇农村自建房安全风险辨识清单0602.xlsx', header=1)
for col in ['序号','风险主项','分项','分项内容']:
    df[col] = df[col].ffill()
df = df.dropna(subset=['序号'])
# 过滤掉非数字序号行（备注行）
df = df[pd.to_numeric(df['序号'], errors='coerce').notna()]
df['序号'] = df['序号'].astype(int)
level_map = {'低风险':'blue','一般风险':'yellow','较大风险':'orange','重大风险':'red'}
df['level'] = df['风险等级'].map(level_map)
records = []
for _, row in df.iterrows():
    records.append({
        'id': int(row['序号']),
        'main': str(row['风险主项']).strip(),
        'sub': str(row['分项']).strip(),
        'content': str(row['分项内容']).strip(),
        'risk': str(row['风险识别']).strip(),
        'accident': str(row['可能导致事故']).strip() if pd.notna(row['可能导致事故']) else '无',
        'level': row['level'],
        'measure': str(row['主要防范措施']).strip() if pd.notna(row['主要防范措施']) else '无',
        'basis': str(row['工作依据']).strip() if pd.notna(row['工作依据']) else ''
    })
with open('rural-risk-data.json', 'w', encoding='utf-8') as f:
    json.dump(records, f, ensure_ascii=False, indent=2)
print('Saved', len(records), 'records')
for r in records[:5]:
    print(r)
