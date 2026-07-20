import re

html = open('e:/风险管控0618/pages/patrol-task-management.html', 'rb').read().decode('utf-8', 'ignore')

# Find all template literal strings (backtick) in script
m = re.search(r'<script>(.*?)</script>', html, re.S)
if not m:
    print('No script found')
    exit()

script = m.group(1)

# Find all template literals containing row HTML
backticks = re.findall(r'`([^`]+)`', script)
print('Total backtick templates:', len(backticks))
for i, bt in enumerate(backticks):
    if 'tr' in bt or 'td' in bt or 'class="' in bt:
        print(f'--- Template {i} ---')
        print(bt[:500])
        print()
