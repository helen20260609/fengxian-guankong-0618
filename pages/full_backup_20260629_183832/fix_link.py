import re

with open('gas-archive.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace first occurrence in enterprise table (before 喜威)
old = '<td class="sticky-col sticky-right"><button class="btn btn-outline" style="padding:4px 10px;font-size:12px">查看</button></td>\n                        </tr>\n                        <tr>\n                            <td class="sticky-col sticky-left">喜威(上海)液化石油气有限公司</td>'
new = '<td class="sticky-col sticky-right"><a href="gas-enterprise-detail.html" class="btn btn-outline" style="padding:4px 10px;font-size:12px;text-decoration:none;display:inline-block">查看</a></td>\n                        </tr>\n                        <tr>\n                            <td class="sticky-col sticky-left">喜威(上海)液化石油气有限公司</td>'
content = content.replace(old, new, 1)

with open('gas-archive.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
