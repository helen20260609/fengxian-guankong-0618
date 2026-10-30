# 城市风险通小程序 H5（h5/）

本目录存放**移动端小程序 H5** 界面，是 PC 端「城市风险治理综合监测预警平台」的移动延伸，与 PC 端共享同一套设计语言与业务数据模型，形成"现场+后台"协同闭环。

## 目录结构

```
h5/
├── index.html              # 首页：统计、快捷入口、今日动态
├── pages/                  # 功能页
│   ├── workspace.html      # 工作台入口：按角色重定向到下方对应页面
│   ├── workspace-inspector.html   # 巡查人员工作台
│   ├── workspace-manager.html     # 管理人员工作台
│   ├── workspace-enterprise.html  # 企业人员工作台
│   ├── messages.html       # 消息中心：分类、未读、列表
│   ├── mine.html           # 我的：个人信息、统计、设置
│   ├── risk-list.html      # 风险清单：七大领域、搜索、等级筛选
│   ├── risk-detail.html    # 风险详情：5 页签（基本信息/辨识要点/防范措施/工作依据/关联案例）
│   ├── inspection-tasks.html    # 巡查任务列表
│   ├── inspection-execute.html  # 现场巡查执行
│   ├── hidden-danger-report.html # 隐患上报
│   ├── hidden-danger-list.html   # 隐患管理列表
│   ├── hidden-danger-detail.html # 隐患全生命周期详情
│   ├── monitoring.html      # 实时监测
│   ├── warning-center.html  # 预警中心
│   ├── assessment.html      # 评估分析
│   ├── contacts.html        # 通讯录
│   └── search.html          # 全局搜索
├── assets/
│   ├── css/
│   │   ├── tokens.css       # 设计令牌（与 PC 端同源）
│   │   └── base.css         # 移动端基础组件与通用样式
│   └── js/
│       ├── theme.js         # 主题切换（与 PC 端 localStorage 同步）
│       ├── app.js           # 小程序框架：Tab Bar/Nav Bar/Toast/Loading/路由
│       ├── data.js          # 业务数据层（任务、隐患、消息、监测、预警、通讯录）
│       └── risk-data.js     # 风险清单数据（复用 PC 端建筑工地/燃气数据）
└── README.md
```

## 与 PC 端的业务联动

| 移动端功能 | 对应 PC 端功能/数据 |
| --- | --- |
| 风险清单（七大领域） | `pages/risk-list-build.html`、`pages/gas-risk-list-build.html`、`pages/gas-risk-data.js` |
| 巡查任务 / 现场取证 | `pages/insp-task.html`、`pages/gas-risk-task.html` |
| 隐患上报 → 处置 → 验收 | `pages/gas-warning-overview.html`、审核/分派/处置/验收中心 |
| 实时监测 | 物联网监测数据、PC 端监测看板 |
| 预警中心 | PC 端预警中心、消息推送 |
| 评估分析 | `pages/insp-assess.html`、`pages/risk-score.html` |

数据层统一 schema：风险清单字段（主项/分项/分项内容/风险辨识/可能导致事故/风险标识/主要防范措施/工作依据）与 PC 端一致；隐患状态（上报/审核/分派/处置/验收/闭环）与 PC 端流程对齐。

## 新增页面规范

1. 在 `h5/pages/` 下新建 `xxx.html`。
2. `<head>` 引入：
   ```html
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   <link rel="stylesheet" href="../assets/css/tokens.css">
   <link rel="stylesheet" href="../assets/css/base.css">
   ```
3. 结尾引入：
   ```html
   <script src="../assets/js/theme.js"></script>
   <script src="../assets/js/data.js"></script>
   <script src="../assets/js/risk-data.js"></script>
   <script src="../assets/js/app.js"></script>
   ```
4. 外层包 `.phone-shell`；子页使用 `.nav-bar`（顶部返回导航）。
5. 颜色一律使用 `var(--primary)` 等令牌，保证主题切换正常。
6. 跳转统一使用 `App.go('xxx.html')`，返回使用 `App.back()`。

## 顶部固定规范（新增页面必遵守）

为保证新增页面在垂直滚动时**状态栏和导航栏始终固定于顶部**，统一使用 `.top-sticky` 包裹结构，禁止再写 `.phone-notch`。

> **统一导航栏高度约定**：状态栏高度为 `34px`（由 `h5-frame.css` 定义）。导航栏（Hero 区域）统一采用如下 padding，确保各页面顶部高度一致、返回按钮与标题垂直对齐：
>
> ```css
> .page-hero {
>     display: flex;
>     align-items: center;
>     justify-content: center;
>     padding: calc(34px + 16px) 18px 42px;
> }
> .page-hero .ph-back {
>     position: absolute;
>     left: 14px;
>     top: calc(34px + 16px);
>     margin: 0;
>     display: flex;
>     align-items: center;
>     justify-content: center;
>     height: 32px;
> }
> .page-hero .ph-title {
>     position: absolute;
>     left: 50%;
>     top: calc(34px + 16px);
>     transform: translateX(-50%);
>     text-align: center;
>     line-height: 32px;
>     width: 60%;
> }
> ```
> 
> 内容区从 Hero 下方开始，统一设置 `padding-top: 18px`（如 `<div class="content" style="padding-top:18px">`）。返回统一使用 `onclick="App.back()"`，标题居中。

### 基础模板

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>页面标题</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="../assets/css/tokens.css">
<link rel="stylesheet" href="../assets/css/base.css">
<link rel="stylesheet" href="../assets/css/h5-frame.css">
<style>
/* 固定顶部：状态栏 + 导航栏 */
.top-sticky {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 100;
}

/* 状态栏在 sticky 容器内使用相对定位，避免被 h5-frame.css 的 sticky 影响层级 */
.top-sticky .status-bar {
    position: relative;
    z-index: 100;
}

/* 示例：渐变 Hero 导航（蓝底） */
.page-hero {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: calc(34px + 16px) 18px 42px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    color: #fff;
    position: relative;
}

.page-hero .ph-back {
    position: absolute;
    left: 14px;
    top: calc(34px + 16px);
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    cursor: pointer;
}

.page-hero .ph-title {
    position: absolute;
    left: 50%;
    top: calc(34px + 16px);
    transform: translateX(-50%);
    text-align: center;
    line-height: 32px;
    width: 60%;
    font-size: 17px;
    font-weight: 600;
}
</style>
</head>
<body>
<div class="phone-frame">
    <div class="phone-shell">
        <!-- 固定顶部区域：状态栏 + 导航栏 -->
        <div class="top-sticky">
            <div class="status-bar light">
                <span class="sb-time" id="statusTime">9:41</span>
                <span class="sb-icons">
                    <i class="fa-solid fa-signal"></i>
                    <i class="fa-solid fa-wifi" style="margin-left:4px"></i>
                    <i class="fa-solid fa-battery-full" style="margin-left:4px"></i>
                </span>
            </div>

            <div class="page-hero">
                <div class="ph-back" onclick="App.back()">
                    <i class="fa-solid fa-chevron-left"></i>
                </div>
                <div class="ph-title">页面标题</div>
            </div>
        </div>

        <!-- 可滚动内容区 -->
        <div class="content" id="content" style="padding-top:18px">
            <!-- 页面内容 -->
        </div>
    </div>
    <div class="phone-home-indicator"></div>
</div>

<script src="../assets/js/theme.js"></script>
<script src="../assets/js/data.js"></script>
<script src="../assets/js/risk-data.js"></script>
<script src="../assets/js/app.js"></script>
</body>
</html>
```

### 规范要点

1. **必须引入 `h5-frame.css`**：桌面端手机壳、真机端适配、状态栏默认样式均依赖该文件。
2. **顶部用 `.top-sticky` 包裹**：内部依次放 `.status-bar` + 导航/标题元素，确保两者一起固定。
3. **`.status-bar` 在 `.top-sticky` 内用相对定位**：避免与 `h5-frame.css` 中默认 `position: sticky` 冲突。
4. **状态栏文字根据背景设置**：
   - 蓝底/深色 Hero 用 `class="status-bar light"`（白色文字）。
   - 白底/浅色 Hero 用 `class="status-bar"`（深色文字，默认）。
5. **不要写 `.phone-notch`**：所有新页面取消刘海元素，保持与现有统一风格一致。
6. **内容区统一设置 `padding-top: 18px`**：Hero 导航底部无额外间距，内容区从 Hero 下方开始即留白 `18px`。
7. **返回统一使用 `App.back()`**，标题使用绝对定位居中。

### 可选导航样式

根据页面背景，选择以下两种导航模式之一：

- **渐变 Hero 模式**（参考 `h5-rescue-team-detail.html`）：背景为渐变色，标题居中，返回按钮绝对定位左侧。
- **白底简洁模式**（参考 `h5-underpass-list.html`）：背景为白色或浅色，底部带边框，标题居中，返回按钮在左侧。

无论哪种模式，返回按钮统一使用 `onclick="App.back()"`，标题使用 `position: absolute` 或 flex 居中。
