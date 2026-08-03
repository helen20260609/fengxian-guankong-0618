from pathlib import Path
import re

p = Path('e:/风险管控0618/pages/situation-rural-house.html')
text = p.read_text(encoding='utf-8')

hex_map = [
    ('#ff2d55','#f43f5e'), ('#ff4d4f','#f43f5e'), ('#ff5e7d','#fb7185'),
    ('#ff7a45','#f97316'), ('#ffb347','#fdba74'),
    ('#f5b041','#facc15'), ('#f9d976','#fde68a'), ('#ffc53d','#facc15'),
    ('#00d4ff','#38bdf8'), ('#80f0ff','#7dd3fc'), ('#00a8ff','#0ea5e9'),
    ('#00b4d8','#0ea5e9'), ('#00a8cc','#0ea5e9'),
    ('#00e5c9','#2dd4bf'), ('#6effdd','#5eead4'), ('#00bfa0','#14b8a6'),
    ('#00c9a7','#14b8a6'), ('#52c41a','#22c55e'), ('#1e8e3e','#16a34a'),
    ('#7ce547','#4ade80'), ('#818cf8','#a78bfa'), ('#5369fe','#6366f1'),
]
for old, new in hex_map:
    text = text.replace(old, new)

rgba_map = [
    (r'rgba\(0,\s*212,\s*255,\s*([0-9.]+)\)', r'rgba(56, 189, 248, \1)'),
    (r'rgba\(0,\s*150,\s*255,\s*([0-9.]+)\)', r'rgba(14, 165, 233, \1)'),
    (r'rgba\(0,\s*229,\s*201,\s*([0-9.]+)\)', r'rgba(45, 212, 191, \1)'),
    (r'rgba\(0,\s*191,\s*165,\s*([0-9.]+)\)', r'rgba(20, 184, 166, \1)'),
    (r'rgba\(82,\s*196,\s*26,\s*([0-9.]+)\)', r'rgba(34, 197, 94, \1)'),
    (r'rgba\(30,\s*142,\s*62,\s*([0-9.]+)\)', r'rgba(22, 163, 74, \1)'),
    (r'rgba\(83,\s*109,\s*254,\s*([0-9.]+)\)', r'rgba(139, 92, 246, \1)'),
    (r'rgba\(255,\s*45,\s*85,\s*([0-9.]+)\)', r'rgba(244, 63, 94, \1)'),
    (r'rgba\(255,\s*122,\s*69,\s*([0-9.]+)\)', r'rgba(249, 115, 22, \1)'),
    (r'rgba\(245,\s*176,\s*65,\s*([0-9.]+)\)', r'rgba(250, 204, 21, \1)'),
]
for pat, repl in rgba_map:
    text = re.sub(pat, repl, text, flags=re.IGNORECASE)

p.write_text(text, encoding='utf-8')
print('color refinement done')
