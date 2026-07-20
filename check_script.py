import re

html = open('e:/风险管控0618/pages/patrol-task-management.html', 'rb').read().decode('utf-8', 'ignore')

m = re.search(r'<script>(.*?)</script>', html, re.S)
if m:
    script = m.group(1)
    print('script length', len(script))
    for pat in [r'innerHTML\s*=\s*`([^`]*?)`', r"innerHTML\s*=\s*'([^']*?)'", r'innerHTML\s*=\s*"([^"]*?)"']:
        matches = re.findall(pat, script, re.S)
        print('pattern', pat, 'matches', len(matches))
        for i, mm in enumerate(matches[:5]):
            print('---', i, repr(mm[:200]))
else:
    print('no script tag')
