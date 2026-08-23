# -*- coding: utf-8 -*-
"""
农村自建房档案模块字段表生成器
依据 pages/rural-house-detail.html 的实际渲染逻辑提取所有档案字段
输出: docs/农村自建房档案模块字段表.xlsx
"""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ---------- 样式 ----------
HEADER_FILL = PatternFill("solid", fgColor="1a73e8")
MODULE_FILL = PatternFill("solid", fgColor="e8f0fe")
SUBTAB_FILL = PatternFill("solid", fgColor="f6f9ff")
HEADER_FONT = Font(name="微软雅黑", size=11, bold=True, color="FFFFFF")
MODULE_FONT = Font(name="微软雅黑", size=11, bold=True, color="1a73e8")
SUBTAB_FONT = Font(name="微软雅黑", size=10, bold=True, color="1557b0")
BODY_FONT = Font(name="微软雅黑", size=10)
BORDER = Border(
    left=Side(style="thin", color="dadce0"),
    right=Side(style="thin", color="dadce0"),
    top=Side(style="thin", color="dadce0"),
    bottom=Side(style="thin", color="dadce0"),
)
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)
LEFT = Alignment(horizontal="left", vertical="center", wrap_text=True)

wb = Workbook()
ws = wb.active
ws.title = "档案模块字段表"

# ---------- 表头 ----------
headers = ["一级模块", "二级Tab", "序号", "字段名称", "字段键/来源", "数据类型", "示例值", "备注"]
ws.append(headers)
for col_idx, _ in enumerate(headers, 1):
    cell = ws.cell(row=1, column=col_idx)
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = CENTER
    cell.border = BORDER

# ---------- 字段定义 ----------
# 字段顺序与 pages/rural-house-detail.html 渲染顺序一致
FIELDS = [
    # ================ 1. 房屋概况 overview ================
    ("房屋概况", "基本信息", [
        ("房屋编号", "no / overview.houseNo", "字符串", "NF-2025-00001", "主键"),
        ("房屋名称", "overview.houseName / name", "字符串", "李家宅基1号", ""),
        ("所属乡镇/行政村", "street + community/village", "字符串", "南桥镇 / 张翁庙村", "组合字段"),
        ("自然村", "naturalVillage / village", "字符串", "张翁庙村", ""),
        ("详细地址", "address / overview.address", "字符串", "上海市奉贤区南桥镇张翁庙村3号", ""),
        ("建成年代", "overview.builtYear / year", "字符串", "1990年", ""),
        ("建筑层数", "overview.floors", "字符串", "3层", ""),
        ("建筑面积 (m²)", "overview.buildingArea", "字符串", "83.5", ""),
        ("房屋用途", "overview.usage", "字符串", "自住", ""),
        ("户主姓名", "owner", "字符串", "李骏勇", ""),
        ("户主联系方式", "overview.phone", "字符串", "138****1234", ""),
        ("家庭成员信息", "familyMembers", "字符串", "—", ""),
        ("是否正规设计", "designConstruction.hasProfessionalDesign", "布尔", "是", "designMode=有专业设计→是"),
        ("是否正规施工", "designConstruction.hasQualificationTeam", "布尔", "是", ""),
        ("建造工匠", "designConstruction.builder", "字符串", "—", ""),
        ("建造年份", "designConstruction.buildYear / year", "字符串", "1990年", ""),
        ("改建扩建记录", "designConstruction.expansionRecord / structure.expansionStatus", "字符串", "否", ""),
    ]),
    ("房屋概况", "宅基地信息", [
        ("宅基地面积", "homestead.area", "字符串", "132㎡", ""),
        ("审批情况", "homestead.approvalStatus", "字符串", "审批通过", ""),
        ("权属证明", "homestead.certNo", "字符串", "沪奉宅字2000第00001号", ""),
    ]),
    ("房屋概况", "建设情况", [
        ("常住或使用人数超过 10 人", "overview.over10People", "字符串", "否", "重复"),
        ("设计方式", "designConstruction.designMode", "字符串", "有专业设计", "重复"),
        ("建造方式", "designConstruction.buildMode", "字符串", "有资质施工队伍", "重复"),
        ("结构类型", "overview.structureType / structure.structureType", "字符串", "砌体结构", "重复"),
        ("楼屋盖", "structure.roofType", "字符串", "现浇板", "重复"),
        ("是否改扩建", "structure.expansionStatus", "字符串", "否", "重复"),
        ("是否装修", "structure.decorationStatus", "字符串", "否", "重复"),
    ]),
    ("房屋概况", "管理情况", [
        ("已取得的行政许可", "overview.permit", "字符串", "宅基地批准书", "农村自建房→宅基地批准书"),
        ("违法建设和违法审批", "overview.illegalBuild", "字符串", "否", ""),
    ]),
    ("房屋概况", "设计施工信息", [
        ("设计日期", "designConstruction.designDate", "日期", "1989-05-12", ""),
        ("施工单位", "designConstruction.constructionUnit", "字符串", "上海××建筑工程有限公司", ""),
        ("是否正规设计", "designConstruction.hasProfessionalDesign", "布尔", "是", ""),
        ("是否正规施工", "designConstruction.hasQualificationTeam", "布尔", "是", ""),
        ("填报人", "designConstruction.reporter", "字符串", "—", ""),
        ("设计单位", "designConstruction.designUnit", "字符串", "上海××设计院", ""),
        ("设计单位代码", "designConstruction.designUnitCode", "字符串", "91310120MA1H00001", ""),
        ("施工单位代码", "designConstruction.constructionUnitCode", "字符串", "91310120MA1J00001", ""),
        ("施工资质", "designConstruction.constructionQual", "字符串", "建筑工程施工总承包一级", ""),
        ("监理单位", "designConstruction.supervisionUnit", "字符串", "上海××监理有限公司", ""),
        ("监理单位代码", "designConstruction.supervisionUnitCode", "字符串", "91310120MA1K00001", ""),
        ("建造工匠", "designConstruction.builder", "字符串", "—", ""),
        ("建造年份", "designConstruction.buildYear", "字符串", "1990年", ""),
        ("改建扩建记录", "designConstruction.expansionRecord", "字符串", "否", ""),
        ("设计方式", "designConstruction.designMode", "字符串", "有专业设计", ""),
        ("建造方式", "designConstruction.buildMode", "字符串", "有资质施工队伍", ""),
        ("备注", "designConstruction.remark", "字符串", "—", ""),
    ]),
    ("房屋概况", "结构信息", [
        ("结构形式", "structure.structureType", "字符串", "砌体结构", ""),
        ("建筑层数", "structure.floors", "字符串", "3层", ""),
        ("建筑面积", "structure.buildingArea", "字符串", "83.5㎡", ""),
        ("屋盖类型", "structure.roofType", "字符串", "现浇板", ""),
        ("墙体材料", "structure.wallMaterial", "字符串", "烧结普通砖", ""),
        ("楼盖材料", "structure.floorMaterial", "字符串", "现浇板", ""),
        ("基础形式", "structure.foundationType", "字符串", "条形基础", ""),
        ("抗震信息", "structure.seismicInfo", "字符串", "未做抗震专项设计", ""),
        ("最大跨度", "structure.maxSpan", "字符串", "3.6m", ""),
        ("改扩建情况", "structure.expansionStatus", "字符串", "否", ""),
        ("装修情况", "structure.decorationStatus", "字符串", "否", ""),
        ("备注", "structure.remark", "字符串", "—", ""),
    ]),
    ("房屋概况", "使用信息", [
        ("使用用途", "usage.usageType", "字符串", "自住", ""),
        ("是否自住", "usage.isSelfLive", "布尔", "是", ""),
        ("具体用途", "usage.specificUsage", "字符串", "日常居住", ""),
        ("居住人数", "usage.occupancy", "字符串", "3人", ""),
        ("人员聚集场所周边", "usage.crowdAround", "布尔", "否", ""),
        ("其他人员密集场所周边", "usage.otherCrowdAround", "布尔", "否", ""),
        ("超10人使用", "usage.over10People", "布尔", "否", ""),
        ("变更日期", "usage.historyChanges[].changeDate", "日期", "2005-08-15", "可多条"),
        ("变更类型", "usage.historyChanges[].changeType", "字符串", "改扩建", ""),
        ("变更内容", "usage.historyChanges[].changeContent", "字符串", "对房屋进行改扩建", ""),
        ("审批情况", "usage.historyChanges[].approvalStatus", "字符串", "已审批", ""),
        ("备注", "usage.historyChanges[].remark", "字符串", "—", ""),
    ]),
    # ================ 2. 风险信息记录 risk ================
    ("风险信息记录", "(单Tab)", [
        ("风险编号", "riskInfo.riskNo", "字符串", "RSK-NF-2025-00001", ""),
        ("风险名称", "riskInfo.riskName", "字符串", "李家宅基1号 第二类风险", ""),
        ("风险类型", "riskInfo.riskType", "字符串", "墙体酥碎或倒塌", ""),
        ("风险等级", "riskInfo.riskLevel", "字符串", "第二类", ""),
        ("发现时间", "riskInfo.discoveryTime", "日期", "2025-03-12", ""),
        ("发现方式", "riskInfo.discoveryMethod", "字符串", "日常巡查", ""),
        ("发现人", "riskInfo.discoverer", "字符串", "张三", ""),
        ("风险状态", "riskInfo.riskStatus", "字符串", "待整治", ""),
        ("风险部位", "riskInfo.riskPart", "字符串", "承重墙体", ""),
        ("空间位置", "riskInfo.spatialLocation", "字符串", "上海市奉贤区南桥镇张翁庙村3号", ""),
        ("风险描述", "riskInfo.riskDesc", "字符串", "承重墙体存在裂缝", ""),
        ("关联房屋", "riskInfo.relatedHouse", "字符串", "NF-2025-00001", ""),
        ("关联产权人", "riskInfo.relatedOwner", "字符串", "李骏勇", ""),
        ("关联使用人", "riskInfo.relatedUser", "字符串", "李骏勇", ""),
        ("关联排查ID", "riskInfo.relatedInspectionId", "字符串", "ISP-NF-2025-00001-01", ""),
        ("关联鉴定ID", "riskInfo.relatedAppraisalId", "字符串", "APR-NF-2025-00001-01", ""),
        ("关联巡查ID", "riskInfo.relatedPatrolId", "字符串", "PTR-NF-2025-00001-01", ""),
        ("关联任务ID", "riskInfo.relatedTaskId", "字符串", "TSK-NF-2025-00001-01", ""),
    ]),
    # ================ 3. 排查信息 inspection ================
    ("排查信息", "排查情况", [
        ("排查编号", "inspectionRecords[].id", "字符串", "ISP-NF-2025-00001-01", "可多条"),
        ("排查日期", "inspectionRecords[].checkDate", "日期", "2025-03-12", ""),
        ("排查人", "inspectionRecords[].checker", "字符串", "张三", ""),
        ("排查方式", "inspectionRecords[].method", "字符串", "现场排查", ""),
        ("结构状况", "inspectionRecords[].structCondition", "字符串", "一般损坏", ""),
        ("具体损伤部位", "inspectionRecords[].damagePart", "字符串", "承重墙体", ""),
        ("初步判定", "inspectionRecords[].preliminaryJudgment", "字符串", "第二类", ""),
        ("是否安全鉴定", "inspectionRecords[].needAppraisal", "字符串", "是", ""),
        ("阶段性标识", "inspectionRecords[].stageMark", "字符串", "阶段性验收", ""),
        ("排查结论", "inspectionRecords[].conclusion", "字符串", "存在安全隐患", ""),
        ("现场照片", "inspectionRecords[].photos", "数组", "[照片1, 照片2]", ""),
        ("备注", "inspectionRecords[].remark", "字符串", "—", ""),
    ]),
    ("排查信息", "建房现场安全自查情况", [
        ("自查日期", "inspectionRecords[].selfCheckDate", "日期", "2025-03-10", ""),
        ("自查人", "inspectionRecords[].selfChecker", "字符串", "李骏勇", ""),
        ("自查结论", "inspectionRecords[].selfCheckResult", "字符串", "基本合格", ""),
    ]),
    ("排查信息", "房屋用途现场情况", [
        ("实际用途", "inspectionRecords[].actualUsage", "字符串", "自住", ""),
        ("用途是否变更", "inspectionRecords[].usageChanged", "布尔", "否", ""),
        ("变更说明", "inspectionRecords[].usageChangeNote", "字符串", "—", ""),
    ]),
    # ================ 4. 动态巡查 patrol ================
    ("动态巡查", "(单Tab)", [
        ("巡查编号", "patrolRecords[].id", "字符串", "PTR-NF-2025-00001-01", "可多条"),
        ("巡查日期", "patrolRecords[].patrolDate", "日期", "2025-04-15", ""),
        ("巡查人", "patrolRecords[].patroller", "字符串", "王五", ""),
        ("巡查方式", "patrolRecords[].method", "字符串", "日常巡查", ""),
        ("巡查结果", "patrolRecords[].result", "字符串", "无异常", ""),
        ("隐患描述", "patrolRecords[].hazardDesc", "字符串", "—", ""),
        ("现场照片", "patrolRecords[].photos", "数组", "[照片1, 照片2]", ""),
        ("备注", "patrolRecords[].remark", "字符串", "—", ""),
    ]),
    # ================ 5. 隐患整治 measure ================
    ("隐患整治", "整治方案", [
        ("管理措施", "measures[].name (type=management)", "字符串", "停止使用", ""),
        ("工程措施", "measures[].name (type=project)", "字符串", "维修加固", ""),
        ("当前措施", "currentMeasure", "字符串", "管理措施（停止使用） + 工程措施（维修加固）", ""),
        ("管理措施数", "manageMeasure", "数字", "2", ""),
        ("工程措施数", "projectMeasure", "数字", "1", ""),
        ("整治期限", "rectDeadline", "日期", "2025-12-31", ""),
        ("责任人", "responsiblePerson", "字符串", "李志强", ""),
        ("责任部门", "responsibleDept", "字符串", "南桥镇城建中心", ""),
    ]),
    ("隐患整治", "管理措施记录", [
        ("措施编号", "manageRecords[].id", "字符串", "MNG-NF-2025-00001-01", "可多条"),
        ("措施名称", "manageRecords[].name", "字符串", "停止使用", ""),
        ("下发日期", "manageRecords[].issueDate", "日期", "2025-03-15", ""),
        ("完成日期", "manageRecords[].completeDate", "日期", "2025-03-20", ""),
        ("实施人", "manageRecords[].implementer", "字符串", "李志强", ""),
        ("实施照片", "manageRecords[].implementPhotos", "数组", "[施工前, 施工中]", ""),
        ("完成照片", "manageRecords[].completePhotos", "数组", "[整治后全景, 细节特写]", ""),
        ("状态", "manageRecords[].status", "字符串", "已完成", ""),
    ]),
    ("隐患整治", "工程措施记录", [
        ("项目编号", "projectRecords[].id", "字符串", "PRJ-NF-2025-00001-01", "可多条"),
        ("项目名称", "projectRecords[].name", "字符串", "维修加固", ""),
        ("开工日期", "projectRecords[].startDate", "日期", "2025-04-01", ""),
        ("竣工日期", "projectRecords[].endDate", "日期", "2025-05-15", ""),
        ("施工单位", "projectRecords[].constructionUnit", "字符串", "上海××建筑工程有限公司", ""),
        ("工程措施实施照片", "projectRecords[].implementPhotos", "数组", "[开工, 施工中]", ""),
        ("工程措施完成照片", "projectRecords[].completePhotos", "数组", "[竣工验收, 完成后全景]", ""),
        ("状态", "projectRecords[].status", "字符串", "已完成", ""),
    ]),
    # ================ 6. 隐患动态 control ================
    ("隐患动态", "管控情况", [
        ("长期管控照片", "controlRecords[].longTermPhotos", "数组", "[照片]", "可多条"),
        ("告知承诺书", "controlRecords[].noticeLetter", "字符串", "已签收", ""),
        ("书面计划", "controlRecords[].writtenPlan", "字符串", "已提交", ""),
        ("管控开始日期", "controlRecords[].controlStartDate", "日期", "2025-03-15", ""),
        ("管控措施", "controlRecords[].controlMeasure", "字符串", "限制使用", ""),
        ("管控责任人", "controlRecords[].controller", "字符串", "李志强", ""),
    ]),
    ("隐患动态", "隐患变化记录", [
        ("变化日期", "controlRecords[].changeDate", "日期", "2025-05-01", ""),
        ("变化类型", "controlRecords[].changeType", "字符串", "隐患新增", ""),
        ("变化描述", "controlRecords[].changeDesc", "字符串", "墙体裂缝扩展", ""),
    ]),
    # ================ 7. 阶段性验收 stageAccept ================
    ("阶段性验收", "(单Tab)", [
        ("验收编号", "stageAcceptRecords[].id", "字符串", "STA-NF-2025-00001-01", "可多条"),
        ("验收日期", "stageAcceptRecords[].acceptDate", "日期", "2025-05-20", ""),
        ("验收人", "stageAcceptRecords[].acceptor", "字符串", "区住建局 王工", ""),
        ("验收结论", "stageAcceptRecords[].conclusion", "字符串", "通过", ""),
        ("质检现场照片", "stageAcceptRecords[].photos", "数组", "[照片1, 照片2]", ""),
        ("备注", "stageAcceptRecords[].remark", "字符串", "—", ""),
    ]),
    # ================ 8. 验收销号 close ================
    ("验收销号", "(单Tab)", [
        ("销号状态", "closeStatus", "字符串", "已通过", "未申请/待审核/审核中/已通过/已驳回"),
        ("申请时间", "closeApplyTime / eliminationInfo.applyTime", "日期", "2025-06-01", ""),
        ("审核时间", "closeAuditTime / eliminationInfo.reviewTime", "日期", "2025-06-05", ""),
        ("审核人", "closeAuditor / eliminationInfo.reviewer", "字符串", "区住建局 张工", ""),
        ("审核意见", "closeAuditOpinion", "字符串", "验收合格，同意销号", ""),
        ("驳回原因", "closeRejectReason", "字符串", "—", ""),
        ("证明材料", "eliminationInfo.certFiles", "数组", "[销号申请表.pdf, 整治完成照片.zip]", ""),
        ("整治后照片", "eliminationInfo.afterPhotos", "数组", "[照片]", ""),
        ("相关资料", "eliminationInfo.relatedFiles", "数组", "[资料]", ""),
        ("是否从重点关注移除", "isRemovedFromFocus", "布尔", "是", ""),
    ]),
    # ================ 9. 安全鉴定 appraisal ================
    ("安全鉴定", "(单Tab)", [
        ("鉴定报告编号", "appraisalReports[].id", "字符串", "APR-NF-2025-00001-01", "可多条"),
        ("鉴定单位", "appraisalReports[].appraisalUnit", "字符串", "上海××房屋质量检测站", ""),
        ("鉴定日期", "appraisalReports[].appraisalDate", "日期", "2025-03-20", ""),
        ("鉴定结论", "appraisalReports[].conclusion", "字符串", "B级", "A/B/C/D"),
        ("鉴定报告文件", "appraisalReports[].reportFile", "字符串", "鉴定报告.pdf", ""),
        ("鉴定人", "appraisalReports[].appraiser", "字符串", "赵工", ""),
        ("备注", "appraisalReports[].remark", "字符串", "—", ""),
    ]),
    # ================ 10. 应急处置 emergency ================
    ("应急处置", "(单Tab)", [
        ("预案名称", "emergencyResponse.planName", "字符串", "XX房屋倒塌应急预案", ""),
        ("预案日期", "emergencyResponse.planDate", "日期", "2025-01-15", ""),
        ("演练记录", "emergencyResponse.drillRecords", "数组", "[{date, content, result}]", "可多条"),
        ("响应记录", "emergencyResponse.responseRecords", "数组", "[{date, event, action}]", "可多条"),
    ]),
    # ================ 11. 整治档案 archive ================
    ("整治档案", "(单Tab)", [
        ("归档编号", "archiveRecords[].id", "字符串", "ARC-NF-2025-00001-01", "可多条"),
        ("归档时间", "archiveRecords[].archiveTime", "日期", "2025-06-10", ""),
        ("归档人", "archiveRecords[].archiver", "字符串", "李志强", ""),
        ("档案类型", "archiveRecords[].archiveType", "字符串", "整治档案", ""),
        ("档案内容", "archiveRecords[].content", "字符串", "排查记录/鉴定报告/整治方案", ""),
        ("档案文件", "archiveRecords[].files", "数组", "[排查记录.pdf, 鉴定报告.pdf]", ""),
        ("备注", "archiveRecords[].remark", "字符串", "—", ""),
    ]),
    # ================ 顶部状态栏 statusPanel ================
    ("顶部状态栏", "(全局)", [
        ("风险等级", "riskLevel", "字符串", "第三类", "三类口径：第一/二/三类"),
        ("治理状态", "governStatus", "字符串", "待整治", "待整治/整治中/已整治/逾期未整治"),
        ("当前措施", "currentMeasure", "字符串", "管理措施（停止使用） + 工程措施（维修加固）", ""),
        ("责任人", "responsiblePerson + managerPhone", "字符串", "李志强 138****1234", ""),
    ]),
]

# ---------- 写入数据 ----------
current_row = 2
for module, subtab, fields in FIELDS:
    module_start = current_row
    for idx, (name, key, dtype, example, remark) in enumerate(fields, 1):
        ws.cell(row=current_row, column=1, value=module)
        ws.cell(row=current_row, column=2, value=subtab)
        ws.cell(row=current_row, column=3, value=idx)
        ws.cell(row=current_row, column=4, value=name)
        ws.cell(row=current_row, column=5, value=key)
        ws.cell(row=current_row, column=6, value=dtype)
        ws.cell(row=current_row, column=7, value=example)
        ws.cell(row=current_row, column=8, value=remark)
        current_row += 1
    module_end = current_row - 1

    # 合并一级模块单元格
    if module_end > module_start:
        ws.merge_cells(start_row=module_start, start_column=1, end_row=module_end, end_column=1)
        ws.merge_cells(start_row=module_start, start_column=2, end_row=module_end, end_column=2)

    # 一级模块样式
    mc = ws.cell(row=module_start, column=1)
    mc.fill = MODULE_FILL
    mc.font = MODULE_FONT
    mc.alignment = CENTER
    for r in range(module_start, module_end + 1):
        ws.cell(row=r, column=1).border = BORDER
        ws.cell(row=r, column=1).fill = MODULE_FILL

    # 二级 Tab 样式
    sc = ws.cell(row=module_start, column=2)
    sc.fill = SUBTAB_FILL
    sc.font = SUBTAB_FONT
    sc.alignment = CENTER
    for r in range(module_start, module_end + 1):
        ws.cell(row=r, column=2).border = BORDER
        ws.cell(row=r, column=2).fill = SUBTAB_FILL

# ---------- 统一正文样式 ----------
for row in ws.iter_rows(min_row=2, max_row=current_row - 1):
    for cell in row:
        cell.border = BORDER
        if cell.column in (1, 2, 3, 6):
            cell.alignment = CENTER
        else:
            cell.alignment = LEFT
        if cell.column >= 3:
            cell.font = BODY_FONT

# ---------- 列宽 ----------
col_widths = [14, 18, 6, 30, 45, 10, 35, 28]
for i, w in enumerate(col_widths, 1):
    ws.column_dimensions[get_column_letter(i)].width = w

# 冻结首行
ws.freeze_panes = "A2"

# ---------- 输出 ----------
import os
out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "农村自建房档案模块字段表.xlsx")
wb.save(out_path)
print(f"已生成: {out_path}")
print(f"共 {current_row - 2} 个字段, {len(FIELDS)} 个模块/Tab")
