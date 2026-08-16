# -*- coding: utf-8 -*-
"""按菜单顺序整合4份房屋安全管理需求规格说明书为一份总文档"""
import os
import re

DOC_DIR = r'D:\风险管控\doc'
OUT = os.path.join(DOC_DIR, '智能风险研判——房屋安全管理功能需求规格说明书.md')

ORDER = [
    ('房屋建筑档案功能需求规格说明书.md', '房屋建筑档案'),
    ('GIS地图分布功能需求规格说明书.md', 'GIS地图分布'),
    ('隐患销号申请与审核功能需求规格说明书.md', '隐患销号申请与审核'),
    ('统计分析功能需求规格说明书.md', '统计分析'),
]

HEADER = '''上海市奉贤区政府采购 2026-013

上海市奉贤区建管委政务信息系统整合平台—奉贤区城市治理风险监管子系统项目需求规格说明书

——智能风险研判（房屋安全管理）模块

上海联平科技有限公司

2026年8月15日

**版本信息**

| 项目名称 | 上海市奉贤区建管委政务信息系统整合平台—奉贤区城市治理风险监管子系统 |
| --- | --- |
| 文档名称 | 智能风险研判——房屋安全管理功能需求规格说明书 |
| 文档版本 | V1.0 |
| 编制单位 | 上海联平科技有限公司 |
| 编制日期 | 2026年8月15日 |
| 密级 | 内部资料，注意保密 |

**修订记录**

| 版本 | 日期 | 修订说明 | 编制/修订人 |
| --- | --- | --- | --- |
| V1.0 | 2026-08-15 | 新建文档，整合房屋安全管理治理模块4项功能需求 | 项目组 |

**版权声明**

本文档版权归上海联平科技有限公司所有，仅供上海市奉贤区建设和管理委员会（以下简称"奉贤区建管委"）及相关项目干系人为本项目建设、实施、验收之目的使用。未经书面许可，任何单位和个人不得以任何形式复制、传播或用于其他用途。

**目录**

1 平台功能需求
1.1 智能风险研判（房屋安全管理）

| 序号 | 功能模块 |
| --- | --- |
| 1 | 房屋建筑档案 |
| 2 | GIS地图分布 |
| 3 | 隐患销号申请与审核 |
| 4 | 统计分析 |

---

# 1 平台功能需求

## 1.1 智能风险研判（房屋安全管理）

房屋安全管理治理模块作为风险管控平台的重要组成部分，通过构建标准化的房屋建筑档案体系、空间化的GIS地图分布能力、闭环化的隐患销号流程和数据化的统计分析能力，实现房屋安全风险从识别、评估、治理到销号的全周期闭环管理。

'''

def extract_body(text):
    lines = text.split('\n')
    start = None
    for i, ln in enumerate(lines):
        if ln.strip() == '# 1 平台功能需求':
            start = i
            break
    if start is None:
        return text.strip()
    body = lines[start:]
    out = []
    for ln in body:
        s = ln.strip()
        if s == '# 1 平台功能需求':
            continue
        if s.startswith('## 1.1 '):
            continue
        if s.startswith('智能风险研判模块作为风险管控平台的核心能力支撑'):
            continue
        out.append(ln)
    return '\n'.join(out).strip()

def renumber(body, idx, title):
    lines = body.split('\n')
    out = []
    for ln in lines:
        s = ln.strip()
        m = re.match(r'^## 1\.1\.\d+\s+', s)
        if m:
            out.append(f'## 1.1.{idx} {title}')
        elif s.startswith('### '):
            out.append(ln)  # ### 【功能概述】等保持三级
        elif s.startswith('#### '):
            out.append('### ' + s[5:])
        else:
            out.append(ln)
    return '\n'.join(out)

parts = [HEADER]
for i, (fname, title) in enumerate(ORDER, 1):
    path = os.path.join(DOC_DIR, fname)
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    body = extract_body(text)
    body = renumber(body, i, title)
    parts.append(body)
    parts.append('\n')

merged = '\n\n'.join(parts)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(merged)
print('OK', OUT, len(merged))
