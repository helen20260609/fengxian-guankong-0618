import re
path = r'e:\风险管控0618\pages\patrol-task-management.html'
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()

prefix = r'<td><span style="font-size:12px;font-weight:600;color:{};">'
replacements = [
    (prefix.format('var(--danger)') + r'重大隐患', prefix.format('var(--danger)') + '疑似危房'),
    (prefix.format('#c78000') + r'较大隐患', prefix.format('#c78000') + '严重损坏房'),
    (prefix.format('var(--primary)') + r'一般隐患', prefix.format('var(--primary)') + '一般损坏房'),
    (prefix.format('var(--success)') + r'无风险', prefix.format('var(--success)') + '完好房(基本完好房)'),
]
for old, new in replacements:
    s = s.replace(old, new)

with open(path, 'w', encoding='utf-8') as f:
    f.write(s)
print('done')
