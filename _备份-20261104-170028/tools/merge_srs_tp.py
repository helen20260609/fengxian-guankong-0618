# -*- coding: utf-8 -*-
"""按菜单顺序整合10份第三方服务机构需求规格说明书为一份总文档（不含专家选取）"""
import os
import re

DOC_DIR = r'D:\风险管控\doc'
OUT = os.path.join(DOC_DIR, '智能风险研判——第三方服务机构功能需求规格说明书.md')

ORDER = [
    ('第三方服务机构机构总览功能需求规格说明书.md', '机构总览'),
    ('第三方服务机构机构在线申报功能需求规格说明书.md', '机构在线申报'),
    ('第三方服务机构审核进度查询功能需求规格说明书.md', '审核进度查询'),
    ('第三方服务机构机构信息管理功能需求规格说明书.md', '机构信息管理'),
    ('第三方服务机构鉴定合同管理功能需求规格说明书.md', '鉴定合同管理'),
    ('第三方服务机构机构业绩管理功能需求规格说明书.md', '机构业绩管理'),
    ('第三方服务机构机构信用管理功能需求规格说明书.md', '机构信用管理'),
    ('第三方服务机构机构信息统计功能需求规格说明书.md', '机构信息统计'),
    ('第三方服务机构专家库管理功能需求规格说明书.md', '专家库管理'),
    ('第三方服务机构申请专家机构评估功能需求规格说明书.md', '申请专家/机构评估'),
]

HEADER = '''上海市奉贤区政府采购 2026-013

上海市奉贤区建管委政务信息系统整合平台—奉贤区城市治理风险监管子系统项目需求规格说明书

——智能风险研判（第三方服务机构）模块

上海联平科技有限公司

2026年8月15日

**版本信息**

| 项目名称 | 上海市奉贤区建管委政务信息系统整合平台—奉贤区城市治理风险监管子系统 |
| --- | --- |
| 文档名称 | 智能风险研判——第三方服务机构功能需求规格说明书 |
| 文档版本 | V1.0 |
| 编制单位 | 上海联平科技有限公司 |
| 编制日期 | 2026年8月15日 |
| 密级 | 内部资料，注意保密 |

**修订记录**

| 版本 | 日期 | 修订说明 | 编制/修订人 |
| --- | --- | --- | --- |
| V1.0 | 2026-08-15 | 新建文档，整合第三方服务机构治理模块10项功能需求 | 项目组 |

**版权声明**

本文档版权归上海联平科技有限公司所有，仅供上海市奉贤区建设和管理委员会（以下简称"奉贤区建管委"）及相关项目干系人为本项目建设、实施、验收之目的使用。未经书面许可，任何单位和个人不得以任何形式复制、传播或用于其他用途。

**目录**

1 平台功能需求
1.1 智能风险研判（第三方服务机构）

| 序号 | 功能模块 |
| --- | --- |
| 1 | 机构总览 |
| 2 | 机构在线申报 |
| 3 | 审核进度查询 |
| 4 | 机构信息管理 |
| 5 | 鉴定合同管理 |
| 6 | 机构业绩管理 |
| 7 | 机构信用管理 |
| 8 | 机构信息统计 |
| 9 | 专家库管理 |
| 10 | 申请专家/机构评估 |

---

# 1 平台功能需求

## 1.1 智能风险研判（第三方服务机构）

第三方服务机构治理模块作为风险管控平台的核心能力支撑，通过构建标准化的第三方服务机构准入、监管、考核体系，实现第三方服务力量从申报、入库、履约到退出的全周期闭环管理。

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
