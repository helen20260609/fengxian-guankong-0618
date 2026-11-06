import sys

path = sys.argv[1] if len(sys.argv) > 1 else r'e:\风险管控0618\pages\rural-risk-archive-overview.html'
target = sys.argv[2] if len(sys.argv) > 2 else '乡镇/街道'
replacement = sys.argv[3] if len(sys.argv) > 3 else '镇/街道'

with open(path, 'rb') as f:
    raw = f.read()
try:
    text = raw.decode('utf-8')
except UnicodeDecodeError:
    text = raw.decode('gbk')
text = text.replace(f'<th>{target}</th>', f'<th>{replacement}</th>' if replacement else '')
with open(path, 'wb') as f:
    f.write(text.encode('utf-8'))
print('done')
