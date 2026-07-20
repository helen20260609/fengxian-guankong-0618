import os
import re

pages = r'e:/风险管控0618/pages'

replacements = [
    # CSS
    (r'href=["\'](https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/6\.4\.0/css/all\.min\.css)["\']', 'href="./all.min.css"'),
    (r'href=["\'](https://unpkg\.com/leaflet[^"\']*?/leaflet\.css)["\']', 'href="./leaflet.css"'),
    (r'href=["\'][^"\']*?all\.min\.css["\']', 'href="./all.min.css"'),
    (r'href=["\'][^"\']*?leaflet\.css["\']', 'href="./leaflet.css"'),
    (r'href=["\'][^"\']*?org-modal\.css["\']', 'href="./org-modal.css"'),
    (r'href=["\'][^"\']*?tp-common\.css["\']', 'href="./tp-common.css"'),
    # JS
    (r'src=["\'](https://unpkg\.com/leaflet[^"\']*?/leaflet\.js)["\']', 'src="./leaflet.js"'),
    (r'src=["\'](https://cdn\.jsdelivr\.net/npm/echarts[^"\']*?/echarts\.min\.js)["\']', 'src="./echarts.min.js"'),
    (r'src=["\'](https://cdnjs\.cloudflare\.com/ajax/libs/echarts/[^"\']*?/echarts\.min\.js)["\']', 'src="./echarts.min.js"'),
    (r'src=["\'][^"\']*?echarts\.min\.js["\']', 'src="./echarts.min.js"'),
    (r'src=["\'][^"\']*?leaflet\.js["\']', 'src="./leaflet.js"'),
    (r'src=["\'][^"\']*?org-data\.js["\']', 'src="./org-data.js"'),
    (r'src=["\'][^"\']*?org-modal\.js["\']', 'src="./org-modal.js"'),
    (r'src=["\'][^"\']*?rural-risk-data\.js["\']', 'src="./rural-risk-data.js"'),
]

changed = []
for root, dirs, files in os.walk(pages):
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            rel = os.path.relpath(path, pages).replace('\\', '/')
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                text = fp.read()
            new_text = text
            for pat, repl in replacements:
                new_text = re.sub(pat, repl, new_text)
            if new_text != text:
                with open(path, 'w', encoding='utf-8') as fp:
                    fp.write(new_text)
                changed.append(rel)

print('Changed', len(changed), 'files:')
for c in changed:
    print(' -', c)
