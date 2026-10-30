import re
import pathlib

files = [
    pathlib.Path(r'E:\\风险管控0618\\pages\\tp-expert-add.html'),
    pathlib.Path(r'E:\\风险管控0618\\pages\\tp-expert-view.js'),
    pathlib.Path(r'E:\\风险管控0618\\pages\\tp-expert.html')
]

group_map = {
    '张奉贤': '建筑施工安全专家组',
    '李秀芳': '高处作业与坠物防护专家组',
    '王建国': '燃气安全专家组',
    '陈志强': '道路交通安全专家组',
    '刘美华': '城镇房屋安全专家组',
    '赵文华': '建筑施工安全专家组',
    '孙丽华': '道路交通安全专家组',
    '周海涛': '基坑与地下工程专家组',
    '吴建平': '玻璃幕墙安全专家组',
    '郑晓燕': '农村房屋安全专家组',
    '徐明辉': '消防安全专家组',
    '杨慧敏': '玻璃幕墙安全专家组'
}

pattern_dir_title = re.compile(r"(direction:\s*'[^']+'),\s*(title:\s*'[^']+')")

for path in files:
    content = path.read_text(encoding='utf-8')
    for name in group_map:
        for m in re.finditer(r"name:\s*'" + re.escape(name) + r"'", content):
            sub = content[m.end():]
            mm = pattern_dir_title.search(sub)
            if mm:
                old = mm.group(0)
                new = f"{mm.group(1)}, industryExpertGroup: '{group_map[name]}', {mm.group(2)}"
                if old in content:
                    content = content.replace(old, new, 1)
                    break
    path.write_text(content, encoding='utf-8')
    print('patched', path)
