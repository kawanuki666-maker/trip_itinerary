# 行程管理系统 · 项目状态

> 最后更新：2026-06-03

---

## 项目概述

- **项目名称**：行程管理系统
- **当前实例**：晋北8日游（2026.6.13-6.20）
- **项目路径**：`c:\Users\siyiju\Documents\JU\行程管理`

---

## 开发阶段

| 阶段 | 内容 | 状态 |
|------|------|------|
| **P0** | 数据基础设施 | ✅ 已完成 |
| **P1** | 核心管理功能 | ✅ 已完成 |
| **P2** | UI/UX 优化 | ✅ 已完成 |

---

## P0 阶段（已完成 ✅）

- [x] 创建 `data/` 目录结构
- [x] 创建 `data/itinerary.json` 统一数据源
- [x] 修改 `index.html` 从 JSON 读取数据
- [x] 创建 `admin-light.html` 管理后台（亮色版）
- [x] 实现 GitHub Token 验证功能
- [x] file:// 协议兼容处理

---

## P1 阶段（已完成 ✅）

- [x] 景点库管理（增删改查、照片上传、评分点评）
- [x] 每日行程编辑（景点选择、拖拽排序、住宿管理）
- [x] 基础信息管理（行程标题、日期等）
- [x] 预约提醒管理（勾选景点+填写详情）
- [x] 平台管理（购票平台增删改）

---

## P2 阶段（已完成 ✅）

- [x] 数据结构优化：`dates` → `startDate/endDate`
- [x] 动态日期计算：移除 `days.date`、`days.weekday`、`reservations.dueDate`
- [x] 路线城市提取：二级城市名称提取
- [x] 数据结构重构：`days` 从全局移到每个行程内部
- [x] 多行程数据隔离：每个行程独立存储自己的 `days`、`platforms`、`reservations`
- [x] 数据迁移逻辑：旧数据自动迁移到新结构
- [x] 新建行程流程：不立即保存 localStorage，点击保存才真正持久化
- [x] UI/UX 细节优化
- [ ] GitHub Actions 配置（自动发布）
- [ ] 图片管理界面

---

## 当前完成进度

### 核心功能

| 功能 | 文件 | 状态 |
|------|------|------|
| 前台展示页 | `index.html` | ✅ 完成 |
| 管理后台 | `admin-light.html` | ✅ 完成 |
| 统一数据源 | `data/itinerary.json` | ✅ 完成 |

---

## 近期完成的优化（2026-06-03）

### 数据结构与数据流优化

1. **多行程数据隔离**
   - `days`、`platforms`、`reservations` 从全局移到每个行程内部
   - 新增辅助函数：`getCurrentTripDays()`、`setCurrentTripDays()`、`getCurrentTripReservations()` 等
   - 解决多行程切换时数据混淆问题

2. **新建流程优化**
   - 新建行程时不立即写入 localStorage，仅创建内存对象
   - 点击「保存修改」按钮才真正持久化
   - 点击「返回行程列表」时，未保存的新建行程自动删除

### UI/UX 细节优化

3. **表单验证完善**
   - 行程基本信息：`tripTitle` 必填校验
   - 每日行程：新增/编辑时增加天数重复检查
   - 预约提醒：新增时增加景点重复检查
   - 景点库：保持原有必填校验

4. **Placeholder 清理**
   - 删除多个模块的占位符文字：`tripTitle`、`tripSubtitle`、`tripCoverImage`、`tripDescription`、`dayModalTitleInput`、`dayModalTheme`、`dayModalTransport`、`dayModalNote`、`platformModalName`、`platformModalUse`、`reservationModalPlatform`、`reservationModalAdvance`、`spotModalName`、`spotModalBrief`、`spotModalTicket`、`spotModalDescription`、`hotelModalName`、`hotelModalAddress`、`hotelModalPhone`、`hotelModalNotes`
   - 保留：`dayModalWeekday`、`reservationModalDueDate`（自动计算提示）、`dayHotelSearch`（搜索提示）

5. **图片上传体验优化**
   - 封面图上传 UI 统一为拖拽式上传区（与景点照片一致）
   - 封面图存储机制改为内存变量 `currentCoverImage`（与景点照片 `currentPhotos` 一致）
   - 景点照片上传限制：从 9 张减少到 3 张
   - 保留隐藏的 file input 用于手机端选择

6. **每日行程新增逻辑优化**
   - 默认天数从「数组长度+1」改为「查找最小空缺」
   - 例如已有 [1,3,4,5]，新增默认是第 2 天（而不是第 6 天）
   - 保存时增加天数重复检查，提示「第X天已存在！」
   - 超过计划天数时提示确认，确认后自动延长结束日期

7. **住宿选择逻辑优化**
   - 点击才显示酒店列表（而不是鼠标移入就显示）
   - 选中酒店后清空搜索词（避免文字重叠）
   - 保存时去掉 `accommodation.photo` 字段（避免冗余）
   - index.html 酒店详情弹窗相应去掉照片展示

8. **行程卡片布局优化**
   - 副标题为空时保持固定高度（`min-height: 38.4px`）
   - 所有行程卡片高度对齐

### 管理后台字段规范

| 模块 | 字段 | 类型 | 必填 | 存储 |
|------|------|------|------|------|
| **行程基本信息** | `title` | text | ✅ | string |
| | `startDate` | date | ❌ | string (YYYY-MM-DD) |
| | `endDate` | date | ❌ | string (YYYY-MM-DD) |
| | `subtitle` | text | ❌ | string |
| | `coverImage` | hidden | ❌ | string (Base64) |
| | `description` | textarea | ❌ | string |
| **每日行程** | `day` | number | ✅ | number |
| | `date` | text | - | 自动计算 |
| | `weekday` | text | - | 自动计算 |
| | `title` | text | ❌ | string |
| | `theme` | text | ❌ | string |
| | `spotIds` | array | ❌ | string[] (景点 ID) |
| | `accommodation` | object | ❌ | {hotelId, name, location} |
| | `transport` | text | ❌ | string |
| | `note` | textarea | ❌ | string / null |
| **购票平台** | `name` | text | ✅ | string |
| | `use` | text | ❌ | string |
| **预约提醒** | `spotId` | select | ✅ | string |
| | `platform` | text | ❌ | string |
| | `advance` | text | ❌ | string |
| | `dueDate` | text | - | 自动计算 |
| **景点库** | `name` | text | ✅ | string |
| | `city` | select | ❌ | string (省-市-区) |
| | `brief` | text | ❌ | string |
| | `hoursStart` / `hoursEnd` | time | ❌ | string (HH:MM) |
| | `ticket` | text | ❌ | string |
| | `needReservation` | checkbox | ❌ | boolean |
| | `description` | textarea | ❌ | string |
| | `photos` | file | ❌ | string[] (最多 3 张) |
| | `rating` | 星级 | ❌ | number (1-5) |
| | `review` | textarea | ❌ | string |
| **酒店库** | `name` | text | ✅ | string |
| | `location` | select | ❌ | string (省-市-区) |
| | `address` | text | ❌ | string |
| | `phone` | text | ❌ | string |
| | `checkInTime` / `checkOutTime` | time | ❌ | string (HH:MM) |
| | `notes` | textarea | ❌ | string |

---

## 关键数据结构

### trips（行程）

```json
{
  "id": "jinbei_2026",
  "title": "晋北八日",
  "startDate": "2026-06-13",
  "endDate": "2026-06-20",
  "subtitle": "穿越千年的建筑艺术巡礼",
  "description": "...",
  "coverImage": "hero/hero_04.jpg",
  "platforms": [...],
  "reservations": [...]
}
```

### spots（景点库）

```json
{
  "id": "spot_1",
  "name": "景点名称",
  "city": "山西省 - 大同市 - 平城区",
  "brief": "简介",
  "hours": "开放时间",
  "ticket": "门票",
  "needReservation": false,
  "description": "详细介绍",
  "photos": [],
  "review": "我的点评",
  "rating": 4.5
}
```

### days（每日行程）

```json
{
  "day": 1,
  "title": "行程标题",
  "theme": "主题",
  "spotIds": ["spot_1", "spot_2"],
  "accommodation": {
    "hotelId": "hotel_1",
    "name": "酒店名称",
    "location": "酒店位置"
  },
  "transport": "交通信息",
  "note": "行程备注"
}
```

> **注意**：`date`、`weekday`、`accommodation.photo` 字段已移除，通过 `startDate` 动态计算日期和星期，照片从酒店库获取

### reservations（预约提醒）

```json
{
  "id": "r1",
  "spotId": "spot_5",
  "platform": "预约平台",
  "advance": "7"
}
```

> **注意**：`dueDate` 字段已移除，通过景点所在日期和 `advance` 动态计算

---

## 动态计算函数

### 日期计算（index.html）

| 函数 | 用途 |
|------|------|
| `calculateDayDate(dayNumber)` | 根据 `startDate` 计算第 N 天的日期 |
| `getWeekday(dateStr)` | 根据日期获取中文星期 |
| `calculateDueDate(spotId, advanceText)` | 计算预约截止日期 |
| `computeRouteData()` | 计算行程路线（含二级城市提取） |

### 日期计算（admin-light.html）

| 函数 | 用途 |
|------|------|
| `calculateDayDate(dayNumber)` | 同上 |
| `getWeekdayString(dateStr)` | 同上 |
| `getSpotTripDay(spotId)` | 获取景点所在天数（含动态日期） |
| `calculateDueDate(spotId, advanceText)` | 同上 |

---

## 技术架构

### 数据流

```
data/itinerary.json
       ↓
  读取/加载
       ↓
  localStorage 缓存
       ↓
  运行时数据（appData / trip / itinerary）
       ↓
  动态计算函数 → 渲染展示
```

### 单一数据源原则

- `trip.startDate` / `trip.endDate` 是唯一日期数据源
- 所有日期（`days[].date`、`days[].weekday`、`reservations[].dueDate`）动态计算
- 修改行程日期后，所有相关显示自动更新

### GitHub Token 配置

- 权限：只需 `repo` 权限
- 存储：sessionStorage（关闭浏览器清除）
- 用途：通过 GitHub API 提交数据更新

### 纯前端 CMS 架构

```
Admin 后台编辑
    ↓
data/itinerary.json 更新
    ↓
GitHub API 提交到私有分支
    ↓
GitHub Actions 自动同步到公开分支
    ↓
GitHub Pages 托管 → index.html 读取
```

---

## 文件结构

```
行程管理/
├── index.html              # 前台展示页（深色主题）
├── admin-light.html        # 管理后台（亮色主题）
├── data/
│   └── itinerary.json      # 统一数据源
├── hero/                   # Hero 图片资源
│   ├── hero_01.jpg
│   ├── hero_02.jpg
│   ├── hero_03.jpg
│   └── hero_04.jpg
├── docs/                   # 设计文档
│   └── superpowers/specs/
│       └── 2026-05-21-cms-admin-design.md
└── PROJECT_STATUS.md       # 本文档
```

---

## UI/UX 设计系统

### 色彩变量

#### index.html（深色主题）

| 变量 | 值 | 用途 |
|------|---|------|
| `--bg` | `#0f0e0c` | 背景色 |
| `--surface` | `#1a1815` | 卡片背景 |
| `--accent` | `#c4a882` | 主色调（金色） |
| `--text` | `#e8e0d8` | 主文字 |
| `--text-dim` | `#5a5248` | 次要文字 |

#### admin-light.html（亮色主题）

| 变量 | 值 | 用途 |
|------|---|------|
| `--bg` | `#fafafa` | 背景色 |
| `--surface` | `#ffffff` | 卡片背景 |
| `--accent` | `#c4a882` | 主色调（金色） |
| `--text` | `#1a1a1a` | 主文字 |
| `--text-dim` | `#999999` | 次要文字 |

### 字体系统

| 用途 | 字体 |
|------|------|
| 标题/Logo | Noto Serif SC |
| 正文 | Noto Sans SC |
| 英文装饰 | Playfair Display |

---

## 近期修改记录

### 2026-06-03

- [x] **数据结构重构**：`days`、`platforms`、`reservations` 从全局移到每个行程内部
- [x] **多行程数据隔离**：解决多行程切换时数据混淆问题
- [x] **新建流程优化**：新建行程不立即保存 localStorage，点击保存才真正持久化
- [x] **表单验证完善**：
  - 行程基本信息：`tripTitle` 必填校验
  - 每日行程：新增时增加天数重复检查
  - 预约提醒：新增时增加景点重复检查
- [x] **Placeholder 清理**：删除多个模块的占位符文字，保留必要提示
- [x] **图片上传体验优化**：
  - 封面图上传 UI 统一为拖拽式上传区
  - 封面图存储机制改为内存变量 `currentCoverImage`
  - 景点照片上传限制：从 9 张减少到 3 张
- [x] **每日行程新增逻辑优化**：默认天数改为查找最小空缺（如缺第 2 天则默认第 2 天）
- [x] **住宿选择逻辑优化**：点击才显示酒店列表，选中后清空搜索词，去掉 `accommodation.photo` 字段
- [x] **行程卡片布局优化**：副标题为空时保持固定高度，所有卡片对齐

### 2026-06-01

- [x] `dates` 字段改为 `startDate` + `endDate`
- [x] 删除 `days.date`、`days.weekday`，改为动态计算
- [x] 删除 `reservations.dueDate`，改为动态计算
- [x] 删除 `updateDaysDates()` 函数
- [x] `computeRouteData()` 增加二级城市提取
- [x] `computeStats()` 同步使用二级城市统计
- [x] `switchTripTab()` 切换到预约标签时刷新列表
- [x] 行程路线标题下方分割线移除

---

## 待办事项

### 立即可做

1. ✅ UI/UX 细节优化
2. ⏳ GitHub Actions 配置

### 后续开发

1. 图片管理界面
2. 数据导出功能

---

## 相关文档

- 设计文档：`docs/superpowers/specs/2026-05-21-cms-admin-design.md`
- 行程数据：`data/itinerary.json`
