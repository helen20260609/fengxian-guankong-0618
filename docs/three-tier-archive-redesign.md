# 三层档案 + 任务索引 + 留痕 改造设计

> 日期：2026-10-19
> 依据：标书三层档案定义（房屋级/风险级/鉴定级）+ 用户"任务独立仓+档案索引"决策
> 范围：农村自建房风险档案（`rural-house-arch-draft`）+ 排查任务（农房回头看/常态化监测/后续新任务）

---

## 一、标书三层档案映射

| 标书层级 | 落地位置 | 说明 |
|---|---|---|
| **房屋级档案** | `rural-house-arch-draft` 根级 | 汇总基础信息（overview/homestead/structure/usage）+ 所有风险记录索引 |
| **风险级档案** | `hazardRecords[]` 隐患主档 | 一条隐患一个完整生命周期（出生→管控→整治→销号） |
| **鉴定级档案** | `hazardDynamics[]` 中 `actionType:'鉴定'` 的动态记录 | 历次鉴定详细数据+结论，按时间排序 |

---

## 二、任务独立仓 + 档案索引

### 2.1 排查任务独立存储

| 任务 | 存储文件 | 状态 |
|---|---|---|
| 农房回头看 | `data/farm-review-records.json` | 现有 |
| 常态化监测 | `data/review-2026-records.json` | 现有 |
| 后续新任务 | `data/{taskKey}-records.json` | 每年新建 |

**任务记录通用字段**（新任务必须遵守）：
```js
{
  houseNo: 'NF-2025-00002',      // 关联房屋
  status: 'draft|submitted|rectified',
  submitTime: '2026-10-19 10:00',
  hazardLevel: '未发现|一般|严重',
  answers: { ... },               // 排查表单答案
  // ... 任务特有字段
}
```

### 2.2 档案内只存索引（taskFlows[]）

**位置**：`hazardRecords[i].taskFlows[]`（隐患维度，非房屋维度）

```js
// hazardRecords[i] 新增字段
taskFlows: [
  {
    taskType: 'farm-review',       // 任务类型 key
    taskName: '农房回头看',         // 任务显示名
    recordId: 'FR-xxx',            // 任务记录 ID（去任务库捞完整数据）
    round: 1,                      // 该隐患在本任务中第几次被排查
    joinedAt: '2026-10-19 10:00',  // 本次排查时间
    result: '一般隐患',            // 本次排查结论
    action: '登记|复查',           // 本次动作：登记新隐患 or 复查既有
  }
]
```

**为什么不嵌进档案**：
- 10-13 rounds[] 教训：内存污染、快照合并灾难
- 档案保持轻量，统计时按索引去任务库 JOIN

---

## 三、静态数据留痕（changeLog[]）

### 3.1 留痕范围

| 区块 | 字段 | 是否留痕 |
|---|---|---|
| overview | 房屋概况（层数/面积/用途/建造年份等） | ✅ |
| homestead | 宅基地信息 | ✅ |
| structure | 结构信息 | ✅ |
| usage | 使用情况 | ✅ |
| photos | 现场照片 | ❌（数组太大，只记张数变化） |
| 其他 | 动态数据（hazardRecords 等） | ❌（动态数据本身有时序） |

### 3.2 changeLog[] 结构

**位置**：`rec.changeLog[]`（房屋根级，与 hazardRecords 平级）

```js
changeLog: [
  {
    id: 'CHG-001',
    fieldPath: 'overview.floors',     // 字段路径（点分隔）
    fieldLabel: '房屋层数',            // 显示名
    oldValue: '2',                    // 改前值
    newValue: '3',                    // 改后值
    changedAt: '2026-10-19 10:00',
    changedBy: '周敏',
    source: 'manual|import|task',    // 修改来源：手动/导入/任务触发
    sourceId: '',                     // 来源记录 ID（如任务记录 ID）
  }
]
```

### 3.3 留痕触发点

| 触发场景 | 实现方式 |
|---|---|
| 详情页手动编辑保存 | `saveCurrentHouseArch` 前 diff overview/homestead/structure/usage |
| 排查任务入档更新 | `archiveOne` / `syncRectifyRecordToHouse` 内 diff |
| 批量导入 | 导入函数内 diff |

---

## 四、入档关联逻辑改造

### 4.1 现状

`archiveOne`（farm-review.html）只做：
- 更新档案根级基础字段（overview/riskInfo 等）
- 写 `reviewSource`/`reviewTime`/`reviewInspector`

**没有**：关联隐患、写 taskFlows 索引、留痕。

### 4.2 改造后

`archiveOne` 增加：

```
1. 静态字段 diff → 写 changeLog[]
2. 根据 hazardLevel 决定：
   - 未发现 → 不生成隐患，只更新档案基础字段
   - 一般/严重 → 生成/更新 hazardRecords + hazardDynamics（登记/复查）
3. 写 taskFlows[] 索引到关联的 hazardRecords
```

### 4.3 隐患生成/复用规则

```
if 同部位+同类型+未销号隐患已存在:
  → 追加 hazardDynamics（actionType:'复查'）
  → taskFlows 索引 action='复查'
else:
  → 新建 hazardRecords + hazardDynamics（actionType:'登记'）
  → taskFlows 索引 action='登记'
```

---

## 五、统计分析维度

| 维度 | 数据源 | 查询方式 |
|---|---|---|
| 某房屋全部风险 | `hazardRecords[]` | 直接读 |
| 某隐患完整生命周期 | `hazardDynamics[]` 按时间排序 | 直接读 |
| 某隐患参加过哪些任务 | `hazardRecords[].taskFlows[]` | 直接读索引 |
| 某任务覆盖多少房屋 | 任务库 + `taskFlows[]` 反查 | 任务库遍历 + 索引匹配 |
| 历次鉴定结论 | `hazardDynamics[]` 过滤 `actionType:'鉴定'` | 直接读 |
| 静态字段变更历史 | `changeLog[]` | 直接读 |

---

## 六、实施步骤

| 步骤 | 内容 | 文件 |
|---|---|---|
| 1 | 数据层：changeLog[] 留痕机制 | `js/house-arch-data.js` |
| 2 | 数据层：hazardRecords 加 taskFlows[] | `pages/house-arch-detail-rural.html` 迁移函数 |
| 3 | 入档逻辑：archiveOne 关联隐患+写索引 | `pages/farm-review.html` |
| 4 | 详情页：展示 taskFlows + changeLog | `pages/house-arch-detail-rural.html` |
| 5 | 统计分析：按任务/房屋/隐患维度汇总 | 后续单独做 |
| 6 | 浏览器验证完整链路 | - |

---

## 七、边界与约束

- **不动**：`h5/pages/farm-review-inspect.html`、`h5/pages/review-2026-inspect.html`（H5 排查页）
- **不动**：`inspectionRecords[]` / `patrolRecords[]` 现有结构（只加 `linkedHazardIds`）
- **不复活**：rounds[] 旧机制（2026-10-13 已拆除）
- **兼容**：旧档案无 `changeLog`/`taskFlows` 字段时自动初始化为空数组
