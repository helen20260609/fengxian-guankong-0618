from pathlib import Path
import re

p = Path('e:/风险管控0618/pages/situation-rural-house.html')
text = p.read_text(encoding='utf-8')

highlight = {
    '#f43f5e': '#fb7185',
    '#f97316': '#fdba74',
    '#facc15': '#fde68a',
    '#38bdf8': '#7dd3fc',
    '#0ea5e9': '#38bdf8',
    '#2dd4bf': '#5eead4',
    '#14b8a6': '#2dd4bf',
    '#22c55e': '#4ade80',
    '#16a34a': '#22c55e',
    '#a78bfa': '#c4b5fd',
    '#8b5cf6': '#a78bfa',
    '#6366f1': '#818cf8',
    '#fb7185': '#fda4af',
    '#fdba74': '#fed7aa',
    '#fde68a': '#fef3c7',
    '#7dd3fc': '#bae6fd',
    '#5eead4': '#99f6e4',
    '#4ade80': '#86efac',
    '#818cf8': '#c7d2fe',
    '#c4b5fd': '#ddd6fe',
}

def gradient_for(color):
    h = highlight.get(color, color)
    return f"new echarts.graphic.LinearGradient(0, 0, 1, 0, [{{offset: 0, color: '{h}'}}, {{offset: 1, color: '{color}'}}])"

# itemStyle: { color: '#hex', ... -> gradient
pattern1 = re.compile(r"itemStyle:\s*\{\s*color:\s*'(#[0-9a-fA-F]{6})',")
def repl1(m):
    return f"itemStyle: {{ color: {gradient_for(m.group(1))},"
text = pattern1.sub(repl1, text)

# itemStyle: { color: '#hex' } (no trailing comma)
pattern2 = re.compile(r"itemStyle:\s*\{\s*color:\s*'(#[0-9a-fA-F]{6})'\s*\}")
def repl2(m):
    return f"itemStyle: {{ color: {gradient_for(m.group(1))} }}"
text = pattern2.sub(repl2, text)

p.write_text(text, encoding='utf-8')
print('gradients applied to simple itemStyle colors')
