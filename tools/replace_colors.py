from pathlib import Path

p = Path('e:/风险管控0618/pages/situation-rural-house.html')
text = p.read_text(encoding='utf-8')

repl = [
    ('#52c41a', '#00e5c9'),
    ('#1e8e3e', '#00bfa0'),
    ('#7ce547', '#00d4ff'),
    ('#818cf8', '#8b5cf6'),
    ('#5369fe', '#8b5cf6'),
    ('rgba(82,196,26,', 'rgba(0,229,201,'),
    ('rgba(30,142,62,', 'rgba(0,191,165,'),
    ('rgba(83,109,254,', 'rgba(139,92,246,'),
]

for old, new in repl:
    text = text.replace(old, new)

p.write_text(text, encoding='utf-8')
print('done replacements')
