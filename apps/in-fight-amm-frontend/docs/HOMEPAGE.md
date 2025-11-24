# Homepage Documentation

## 概述

全新的首页设计，展示所有赛事并支持按类别筛选。用户可以浏览正在直播和即将进行的格斗赛事。

## 页面结构

### 1. Hero Section - 直播赛事横幅

**位置**: 页面顶部
**高度**: 400px
**功能**:
- 展示当前正在直播的赛事
- 大型横幅图片背景（从 `public/event-poster-1.jpg` 加载）
- 渐变遮罩层确保文字可读性
- 实时脉冲动画的 "LIVE NOW" 徽章

**显示信息**:
- 赛事标题（大字体）
- 日期和时间
- 场地位置
- 赛事类别徽章
- 奖池金额
- "Watch Live & Trade" 行动按钮

**交互**:
- 点击 "Watch Live & Trade" 按钮跳转到 `/event` 直播页面
- 悬停效果和过渡动画

### 2. Filter Bar - 分类筛选栏

**位置**: Hero Section 下方
**功能**: 按赛事类别筛选

**筛选选项**:
1. **Live Now** (红色徽章) - 显示所有正在直播的赛事
2. **分隔线** (`|`)
3. **Boxing** - 拳击赛事
4. **Kickboxing** - 踢拳赛事
5. **Muaythai** - 泰拳赛事
6. **MMA** - 综合格斗赛事

**样式**:
- 当前选中：`Live Now` 为红色背景，其他类别为绿色（primary）背景
- 未选中：灰色文字，悬停时变白
- 圆角按钮设计
- 平滑过渡动画

### 3. Events Grid - 赛事卡片网格

**布局**:
- 响应式网格布局
- 移动端: 1列
- 平板: 2列
- 桌面: 3列
- 卡片间距: 24px

**空状态**:
- 当筛选类别无赛事时显示
- 🥊 表情图标
- "No events found in this category" 提示文字
- "Check back later for upcoming matches" 辅助文字

## EventCard 组件

### 卡片结构

**海报区域** (高度: 192px):
- 赛事海报图片（16:9 横向比例）
- 悬停时图片放大效果（scale 1.05）
- 如果图片加载失败，显示带拳击手套 emoji 的占位符

**徽章覆盖层**:
- **LIVE 徽章**: 右上角，红色背景，白色脉冲圆点
- **类别徽章**: 左下角，黑色半透明背景

**信息区域** (padding: 16px):
1. **赛事标题**
   - 粗体，白色
   - 最多显示2行，超出显示省略号
   - 悬停时变为主题色

2. **对战选手信息**
   - 左右对称布局
   - 选手姓名（白色）+ 战绩（灰色）
   - 中间 "VS" 分隔

3. **元信息栏**
   - 日期时间（左侧，带日历图标）
   - 奖池金额（右侧，主题色高亮）

### 交互效果

- **整卡悬停**: 边框从灰色变为主题色
- **点击卡片**: 跳转到 `/event` 赛事直播页面
- **图片悬停**: 图片放大动画
- **标题悬停**: 文字变为主题色
- **光标**: 整卡显示 pointer 光标

## Mock 数据结构

```typescript
interface Event {
  id: number                    // 赛事ID
  title: string                 // 赛事标题
  date: string                  // 日期（如 "Nov 20, 2025"）
  time: string                  // 时间（如 "21:00"）
  location: string              // 地点
  category: string              // 类别: 'Boxing' | 'Kickboxing' | 'Muaythai' | 'MMA'
  isLive: boolean              // 是否正在直播
  poster: string               // 海报图片路径
  prizePool: number            // 奖池金额（USDC）
  fighters: {
    a: { name: string; record: string }  // 选手A信息
    b: { name: string; record: string }  // 选手B信息
  }
}
```

### 当前Mock数据

1. **UFC 300** (MMA, LIVE)
   - Mike "Dragon" (20-3-0) vs John "Thunder" (18-5-0)
   - $125,000 奖池

2. **Boxing Championship** (Boxing)
   - Carlos Rodriguez (28-2-0) vs Mike Johnson (24-3-0)
   - $85,000 奖池

3. **Kickboxing Grand Prix** (Kickboxing)
   - Anderson Silva (32-5-0) vs Ivan Petrov (29-4-0)
   - $95,000 奖池

4. **Muay Thai Championship** (Muaythai)
   - Saenchai (45-8-1) vs Buakaw (42-10-2)
   - $72,000 奖池

5. **ONE Championship** (MMA)
   - Zhang (22-4-0) vs Lee (25-3-0)
   - $110,000 奖池

## 路由结构

```
/ (根路径)
├─ app/page.tsx          → 首页（HomePage组件）
└─ app/event/page.tsx    → 赛事直播页面（原有功能）
```

### 导航流程

1. **首页 → 直播页**
   - 点击 Hero Banner 的 "Watch Live & Trade" 按钮
   - 点击任何赛事卡片
   - 导航栏点击 "Live Event"

2. **直播页 → 首页**
   - 导航栏点击 "Home"
   - 导航栏点击 Logo

## 导航栏更新

**新增导航链接**:
- **Home**: 跳转到首页 `/`
- **Live Event**: 跳转到直播页 `/event`

**当前页面高亮**:
- 使用 `usePathname()` 检测当前路由
- 当前页面的导航链接显示为主题色并加粗

## 文件清单

### 新增文件

1. **`components/HomePage.tsx`** - 首页主组件
   - Hero Section
   - Filter Bar
   - Events Grid
   - Mock数据管理

2. **`components/EventCard.tsx`** - 可复用的赛事卡片组件
   - 海报展示
   - 赛事信息
   - 交互效果

3. **`app/event/page.tsx`** - 赛事直播页面
   - 迁移原 `app/page.tsx` 的内容
   - 保留所有直播和交易功能

4. **`public/POSTER_README.md`** - 海报图片使用指南
   - 图片命名规范
   - 尺寸要求
   - 使用说明

### 修改文件

1. **`app/page.tsx`** - 主页路由
   - 改为显示 HomePage 组件

2. **`components/Navbar.tsx`** - 导航栏
   - 添加 Next.js Link 组件
   - 添加 Home 和 Live Event 链接
   - 当前页面高亮显示

## 图片资源需求

### 必需的图片文件

在 `/public` 文件夹中添加以下图片：

```
public/
├── event-poster-1.jpg    # UFC 300 (LIVE)
├── event-poster-2.jpg    # Boxing Championship
├── event-poster-3.jpg    # Kickboxing Grand Prix
├── event-poster-4.jpg    # Muay Thai Championship
└── event-poster-5.jpg    # ONE Championship
```

### 图片规格建议

**Hero Banner (event-poster-1.jpg)**:
- 尺寸: 1920x1080px 或更高
- 比例: 16:9
- 质量: 高清，因为会作为大背景显示
- 要求: 视觉冲击力强，适合作为英雄横幅

**Event Cards (其余图片)**:
- 尺寸: 1200x675px 或更高
- 比例: 16:9 或 3:2
- 质量: 良好即可
- 要求: 清晰展示赛事主题

**通用要求**:
- 格式: JPG 或 PNG
- 大小: < 1MB
- 横向/风景方向
- 主体清晰可见

## 技术特性

### React 功能

- ✅ `useState` 管理筛选状态
- ✅ `useRouter` 处理页面跳转
- ✅ `usePathname` 检测当前路由
- ✅ 条件渲染（筛选逻辑）
- ✅ 列表渲染（map遍历）
- ✅ 事件处理（点击、悬停）

### Next.js 功能

- ✅ App Router
- ✅ Client Components (`'use client'`)
- ✅ Next.js Link (客户端路由)
- ✅ 动态路由导航
- ✅ 路径检测

### Tailwind CSS

- ✅ 响应式网格布局
- ✅ 渐变和遮罩效果
- ✅ 悬停和过渡动画
- ✅ 条件类名切换
- ✅ 自定义主题色

### 用户体验

- ✅ 图片加载失败优雅降级
- ✅ 空状态提示
- ✅ 实时动画效果（LIVE 脉冲）
- ✅ 流畅的页面过渡
- ✅ 清晰的视觉层级
- ✅ 响应式设计

## 使用示例

### 筛选赛事

```typescript
// 用户操作流程
1. 页面加载 → 默认显示 "Live Now" 筛选
2. 点击 "Boxing" → 只显示拳击赛事
3. 点击 "MMA" → 只显示 MMA 赛事
4. 点击 "Live Now" → 返回显示直播赛事
```

### 查看赛事

```typescript
// 查看直播赛事
1. 访问首页 → 看到 Hero Banner
2. 点击 "Watch Live & Trade" → 跳转到直播页
3. 开始交易和观看

// 查看其他赛事
1. 使用筛选栏找到感兴趣的类别
2. 浏览赛事卡片
3. 点击任意卡片 → 跳转到赛事页面
```

## 扩展建议

### 功能增强

- [ ] 添加搜索功能
- [ ] 实现分页或无限滚动
- [ ] 添加收藏功能
- [ ] 赛事倒计时显示
- [ ] 多个筛选条件组合
- [ ] 排序功能（按时间、奖池等）

### 数据集成

- [ ] 从API获取真实赛事数据
- [ ] 实时更新直播状态
- [ ] 动态奖池数据
- [ ] 用户个性化推荐

### UI优化

- [ ] 骨架屏加载状态
- [ ] 图片懒加载
- [ ] 更多动画效果
- [ ] 暗黑/明亮主题切换
- [ ] 移动端优化

## 总结

首页成功实现了赛事展示和筛选功能，为用户提供了清晰的导航体验。通过可复用的组件设计和结构化的数据管理，系统易于扩展和维护。

