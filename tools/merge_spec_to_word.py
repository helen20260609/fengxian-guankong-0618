# -*- coding: utf-8 -*-
"""
将两个需求规格说明书 md 合并为一个 Word 文档：
  第一块：农村自建房风险档案总览
  第二块：农村自建房风险控制效果评估
"""
import re
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OVERVIEW_MD = r"e:\风险管控0618\docs\农村自建房风险档案总览功能需求规格说明书_20260827.md"
EVAL_MD = r"e:\风险管控0618\docs\农村自建房风险控制效果评估功能需求规格说明书_20260827.md"
OUT = r"e:\风险管控0618\docs\农村自建房风险档案功能需求规格说明书_20260827.docx"

FONT = "宋体"
HEI = "黑体"


def set_font(run, name=FONT, size=10.5, bold=False, color=None):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = color
    r = run._element.rPr
    rFonts = r.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        r.append(rFonts)
    rFonts.set(qn("w:eastAsia"), name)
    rFonts.set(qn("w:ascii"), name)
    rFonts.set(qn("w:hAnsi"), name)


def set_cell_bg(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def add_title(doc, text, size=22, name=HEI, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=6, space_after=6):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    run = p.add_run(text)
    set_font(run, name=name, size=size, bold=True)
    return p


def add_para(doc, text, size=10.5, bold=False, name=FONT, align=WD_ALIGN_PARAGRAPH.LEFT, indent=False):
    p = doc.add_paragraph()
    p.alignment = align
    if indent:
        p.paragraph_format.first_line_indent = Pt(size * 2)
    run = p.add_run(text)
    set_font(run, name=name, size=size, bold=bold)
    return p


def add_heading(doc, text, level):
    sizes = {1: 16, 2: 14, 3: 12, 4: 11, 5: 10.5}
    size = sizes.get(level, 10.5)
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12 if level <= 2 else 8)
    p.paragraph_format.space_after = Pt(6 if level <= 2 else 4)
    run = p.add_run(text)
    set_font(run, name=HEI, size=size, bold=True)
    # 大纲级别，便于导航
    pPr = p._element.get_or_add_pPr()
    ol = OxmlElement("w:outlineLvl")
    ol.set(qn("w:val"), str(level - 1))
    pPr.append(ol)
    return p


def parse_table_block(lines, i):
    """从行 i 开始解析 markdown 表格，返回 (rows, next_i)"""
    rows = []
    while i < len(lines) and lines[i].strip().startswith("|"):
        row = [c.strip() for c in lines[i].strip().strip("|").split("|")]
        rows.append(row)
        i += 1
    # 去掉分隔行 (---)
    rows = [r for r in rows if not all(re.fullmatch(r":?-{2,}:?", c or "---") for c in r)]
    return rows, i


def add_table(doc, rows):
    if not rows:
        return
    ncol = max(len(r) for r in rows)
    rows = [r + [""] * (ncol - len(r)) for r in rows]
    table = doc.add_table(rows=len(rows), cols=ncol)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for ri, row in enumerate(rows):
        for ci, cell_text in enumerate(row):
            cell = table.cell(ri, ci)
            cell.text = ""
            p = cell.paragraphs[0]
            run = p.add_run(cell_text)
            is_header = (ri == 0)
            set_font(run, name=FONT, size=9, bold=is_header)
            if is_header:
                set_cell_bg(cell, "D9E2F3")
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph()


def render_md_section(doc, md_text):
    """把 md 文本渲染进 doc（跳过原有的封面/版权/目录部分）"""
    lines = md_text.split("\n")
    i = 0
    in_code = False
    code_buf = []
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # 代码块
        if stripped.startswith("```"):
            if in_code:
                p = doc.add_paragraph()
                run = p.add_run("\n".join(code_buf))
                set_font(run, name="Consolas", size=9)
                pPr = p._element.get_or_add_pPr()
                shd = OxmlElement("w:shd")
                shd.set(qn("w:val"), "clear")
                shd.set(qn("w:fill"), "F5F5F5")
                pPr.append(shd)
                code_buf = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code_buf.append(line)
            i += 1
            continue

        # 表格
        if stripped.startswith("|"):
            rows, i = parse_table_block(lines, i)
            add_table(doc, rows)
            continue

        # 标题
        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            level = len(m.group(1))
            text = m.group(2).strip()
            # 原 md 的 #### 模块标题 -> 提升层级观感
            add_heading(doc, text, min(level + 2, 5))
            i += 1
            continue

        # 列表
        m = re.match(r"^(\s*)[-*]\s+(.*)$", line)
        if m:
            text = m.group(2).strip()
            p = doc.add_paragraph(style="List Bullet")
            run = p.add_run(text)
            set_font(run, size=10.5)
            i += 1
            continue
        m = re.match(r"^(\s*)(\d+)\.\s+(.*)$", line)
        if m:
            text = m.group(3).strip()
            p = doc.add_paragraph(style="List Number")
            run = p.add_run(text)
            set_font(run, size=10.5)
            i += 1
            continue

        # 引用/空行/普通段落
        if stripped.startswith(">"):
            add_para(doc, stripped.lstrip("> ").strip(), size=9, name=FONT)
        elif stripped == "" or stripped == "---" or stripped == "<br>":
            pass
        else:
            # 去掉 ** 加粗标记但保留加粗
            bold = stripped.startswith("**") and stripped.endswith("**")
            text = stripped.replace("**", "")
            add_para(doc, text, size=10.5, bold=bold, indent=not bold)
        i += 1


def extract_body(md_text):
    """去掉封面、版本信息、修订记录、版权、目录，只保留正文（从 '# 1 平台功能需求' 开始）"""
    idx = md_text.find("# 1 平台功能需求")
    if idx >= 0:
        body = md_text[idx:]
    else:
        body = md_text
    # 去掉正文中的一级标题（我们将在合并文档里统一写）
    body = re.sub(r"^# 1 平台功能需求\s*$", "", body, flags=re.M)
    body = re.sub(r"^## 1\.1 智能风险研判\s*$", "", body, flags=re.M)
    # 去掉模块自身的 ### 1.1.1 xxx 标题（合并文档统一编号）
    body = re.sub(r"^### 1\.1\.1 .+$", "", body, flags=re.M)
    return body


def main():
    with open(OVERVIEW_MD, encoding="utf-8") as f:
        overview = f.read()
    with open(EVAL_MD, encoding="utf-8") as f:
        ev = f.read()

    doc = Document()
    # 页面设置 A4
    sec = doc.sections[0]
    sec.page_width = Cm(21)
    sec.page_height = Cm(29.7)
    sec.left_margin = Cm(2.5)
    sec.right_margin = Cm(2.5)
    sec.top_margin = Cm(2.5)
    sec.bottom_margin = Cm(2.5)

    # ===== 封面 =====
    add_title(doc, "上海市奉贤区政府采购 2026-013", size=16)
    doc.add_paragraph()
    add_title(doc, "上海市奉贤区建管委政务信息系统整合平台", size=18)
    add_title(doc, "—奉贤区城市治理风险监管子系统项目", size=18)
    add_title(doc, "需求规格说明书", size=18)
    for _ in range(3):
        doc.add_paragraph()
    add_title(doc, "——农村自建房风险档案模块", size=15)
    add_title(doc, "（风险档案总览 / 风险控制效果评估）", size=13)
    for _ in range(4):
        doc.add_paragraph()
    add_title(doc, "上海联平科技有限公司", size=14)
    add_title(doc, "2026年8月27日", size=14)
    doc.add_page_break()

    # ===== 版本信息 =====
    add_heading(doc, "版本信息", 1)
    add_table(doc, [
        ["项目", "上海市奉贤区政府采购2026-013上海市奉贤区建管委政务信息系统整合平台—奉贤区城市治理风险监管子系统项目"],
        ["文档名称", "需求规格说明书（农村自建房风险档案模块）"],
        ["文档编号", ""],
        ["版本", "1.0"],
        ["作者", ""],
        ["审核", ""],
        ["批准", ""],
        ["文件状态", "□草稿 □正式发布 □正在修订"],
    ])
    add_heading(doc, "修订记录", 1)
    add_table(doc, [
        ["日期", "文档版本", "修订描述", "文档作者"],
        ["2026-08-27", "V1.0", "合并《农村自建房风险档案总览功能需求规格说明书》（V3.0）与《农村自建房风险控制效果评估功能需求规格说明书》（V1.0），按两个子模块分块编排", ""],
    ])
    doc.add_paragraph()
    add_para(doc, "本文件作为未发行作品受中华人民共和国和/或其他国家著作权法的保护。本文件所含信息均属于上海联平科技有限公司和/或其关联公司或其相关技术合作者所有且为机密信息。本文件所含信息的全部或其中任一部分除被用于评估上海联平科技有限公司和/或其关联公司外，不可因任何目的被复制、使用或者泄露。禁止任何未经上海联平科技有限公司和/或其关联公司的专项书面许可，对于本文件所含信息的全部或其中任一部分的使用和泄露。", size=9)
    doc.add_page_break()

    # ===== 目录 =====
    add_heading(doc, "目录", 1)
    toc = [
        "1 平台功能需求",
        "1.1 智能风险研判",
        "1.1.1 农村自建房风险档案总览",
        "1.1.2 农村自建房风险控制效果评估",
        "附录A 风险等级归一化映射表",
        "附录B 鉴定状态与风险等级对应关系",
        "附录C 核心指标计算公式汇总",
    ]
    for t in toc:
        add_para(doc, t, size=11)
    doc.add_page_break()

    # ===== 正文 =====
    add_heading(doc, "1 平台功能需求", 1)
    add_heading(doc, "1.1 智能风险研判", 2)
    add_para(doc, "智能风险研判模块作为风险管控平台的核心能力支撑，通过构建标准化的风险清单体系、动态化的风险档案管理和智能化的辅助决策能力，实现风险从识别、评估到处置的全周期闭环管理。农村自建房风险档案模块包含两个子模块：风险档案总览、风险控制效果评估。", indent=True)

    # 第一块：总览
    add_heading(doc, "1.1.1 农村自建房风险档案总览", 3)
    render_md_section(doc, extract_body(overview))

    doc.add_page_break()

    # 第二块：评估
    add_heading(doc, "1.1.2 农村自建房风险控制效果评估", 3)
    # 评估文档中的 附：核心指标计算公式汇总 标题改为 附录C
    eval_body = extract_body(ev)
    eval_body = eval_body.replace("## 附：核心指标计算公式汇总", "## 附录C 核心指标计算公式汇总")
    render_md_section(doc, eval_body)

    doc.save(OUT)
    print("OK ->", OUT)


if __name__ == "__main__":
    main()
