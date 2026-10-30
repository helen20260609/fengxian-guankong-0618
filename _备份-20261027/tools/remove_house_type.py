import re
path = r'e:\风险管控0618\pages\rural-risk-archive-overview.html'
with open(path, 'rb') as f:
    raw = f.read()
try:
    text = raw.decode('utf-8')
except UnicodeDecodeError:
    text = raw.decode('gbk')
text = re.sub(r'\s*<th>房屋类型</th>', '', text)
with open(path, 'wb') as f:
    f.write(text.encode('utf-8'))
print('done')
