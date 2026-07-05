# 第三方服务机构在线申报与入库管理系统

## 项目简介

本项目是“城市治理风险监管子系统”中“第三方服务机构”模块的独立可运行版本。它提供：

- **机构在线提交资料**：通过浏览器填写机构、法人、资质等信息，提交后生成申请编号。
- **审核进度查询**：使用统一社会信用代码查询当前审核节点与历史记录。
- **机构入库管理**：管理人员在后台查看待审在线申请、多级审核、自动入库。

> 说明：当前版本为纯前端演示（Path A），数据使用浏览器 `localStorage` 持久化，便于本地演示与快速交付。后续可替换为真实后端 API。

---

## 目录结构

```
.
├── package.json          # 项目配置与启动脚本
├── server.js             # Node.js 静态服务器（根目录与 pages 目录）
├── README.md             # 本文件
├── .gitignore            # 忽略备份、临时文件、依赖等
├── index.html            # 系统入口页（原项目主入口）
├── js/
│   ├── third-party-data.js   # 第三方模块统一数据层（localStorage）
│   └── echarts.min.js        # 图表库
├── pages/                # 第三方服务模块页面
│   ├── tp-overview.html          # 机构名录总览
│   ├── tp-warehouse.html         # 机构入库管理（含在线申请审核）
│   ├── tp-org-apply.html         # 机构在线提交资料
│   ├── tp-audit-progress.html    # 公开审核进度查询
│   ├── tp-expert-*.html          # 专家库相关页面
│   ├── tp-contract.html          # 合同管理
│   ├── tp-credit.html            # 信用评价
│   └── ...
├── data/                 # 静态 JSON 数据
├── temp/                 # 运行时临时文件
├── backups/              # 自动备份输出目录
└── tools/                # 辅助脚本（如全量备份 PowerShell 脚本）
```

---

## 快速启动

### 1. 环境要求

- [Node.js](https://nodejs.org/) >= 12.0.0

### 2. 安装与启动

```bash
# 进入项目目录
cd third-party-service-platform

# 启动本地静态服务器
npm start
# 或
node server.js
```

启动成功后，浏览器访问：

```
http://localhost:8000
```

默认首页为 `pages/tp-overview.html`（机构名录）。

### 3. 常用页面地址

| 页面 | 地址 |
|------|------|
| 机构在线提交资料 | `http://localhost:8000/tp-org-apply.html` |
| 审核进度查询 | `http://localhost:8000/tp-audit-progress.html` |
| 机构入库管理 | `http://localhost:8000/tp-warehouse.html` |
| 机构名录总览 | `http://localhost:8000/tp-overview.html` |

---

## 功能说明

### 1. 机构在线提交资料

- 填写法人、企业、资质、服务区域等信息。
- 提交后保存到 `localStorage`，并生成唯一申请编号。
- 提交成功页提供“查询审核进度”入口。

### 2. 审核进度查询

- 输入统一社会信用代码或机构名称查询。
- 展示当前状态、申请编号、提交时间、时间轴记录。

### 3. 机构入库管理

- 在“待审在线申请”区域查看未审核的申请。
- 点击“审核”打开详情弹窗，可填写审核意见并选择“通过/驳回”。
- 通过且满足终审条件时，系统自动将机构写入机构名录。

---

## 数据存储说明

所有数据均存储在浏览器 `localStorage` 中，键名为 `thirdPartyData`。

主要字段：

- `orgs`：已入库机构列表
- `organizations`：机构库（与 `orgs` 保持同步，供不同页面读取）
- `orgApplications`：在线提交的机构申请记录
- `experts`：专家库数据
- `contracts`：合同数据
- `creditRecords`：信用评价记录

> ⚠️ 清除浏览器缓存或无痕模式会导致数据丢失。如需长期保存，请使用正式后端或导出备份。

---

## 备份

项目中包含 `tools/backup.ps1` PowerShell 脚本，可用于全量备份页面文件。在 VS Code 中可直接运行任务“全量备份”。

---

## 后续扩展建议

- 接入真实后端 API，替换 `localStorage` 数据层。
- 增加用户登录与权限控制。
- 支持文件上传（营业执照、资质证书等）。
- 配置审核级别与审核人（当前由 `getTPAuditConfig()` 控制）。

---

## 许可证

MIT
