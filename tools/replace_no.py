import re

path = r'e:\\风险管控0618\\pages\\hs-register.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

def replace_no(m):
    n = int(m.group(1))
    return 'NF-2025-' + str(n).zfill(5)

text = re.sub(r'310120000000000(\d{3})', replace_no, text)
with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('done')
