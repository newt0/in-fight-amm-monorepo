# 快速开始指南

## 🚀 运行项目

### 1. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 2. 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

### 3. 访问应用

打开浏览器访问: **http://localhost:3000**

## 📦 项目文件说明

### 核心组件

| 文件 | 说明 |
|------|------|
| `app/page.tsx` | 主页面，整合所有组件 |
| `components/Navbar.tsx` | 顶部导航栏 |
| `components/VideoPlayer.tsx` | 视频播放区域 |
| `components/StreamInfo.tsx` | 直播内容介绍 |
| `components/PredictionMarket.tsx` | 预测市场容器 |
| `components/MarketOverview.tsx` | 奖池和市场预测总览 |
| `components/FighterCard.tsx` | 选手卡片（买卖操作） |
| `components/PriceChart.tsx` | 价格趋势图 |
| `components/MyAccount.tsx` | 我的账户信息 |

### 配置文件

| 文件 | 说明 |
|------|------|
| `tailwind.config.ts` | Tailwind 配置（自定义颜色主题） |
| `tsconfig.json` | TypeScript 配置 |
| `next.config.js` | Next.js 配置 |

## 🎨 设计特点

- ✅ **深色主题**：主背景 #0a0a0a
- ✅ **模块化布局**：区域间用分割线分隔
- ✅ **紧凑设计**：字体偏小，信息密度高
- ✅ **全屏显示**：充分利用屏幕空间
- ✅ **深紫主色**：#7c3aed

## 🎯 已实现功能

### 导航栏
- Logo 和导航菜单
- 连接钱包按钮
- 用户头像

### 左侧区域
- **视频播放器**（上 2/3）
  - 播放控制条
  - LIVE 标识
  - 观看人数显示
- **直播信息**（下 1/3）
  - 赛事标题
  - 选手对阵信息
  - 详细数据统计

### 右侧预测市场（宽度 420px）
- **市场总览**
  - 总奖池金额：125,000 USDC
  - 市场预测占比条：62% vs 38%
  - 实时涨跌显示
  
- **选手 A 卡片（张伟龙）**
  - 当前价格：105 USDC
  - Buy/Sell 模式切换
  - 价格趋势图（1m/5m/实时）
  - 数量选择器
  - 持仓显示：10 Tickets
  - 市值收益计算
  
- **选手 B 卡片（李明强）**
  - 当前价格：82 USDC
  - 相同功能结构
  - 持仓显示：5 Tickets
  
- **我的账户**
  - 余额：2,500 USDC
  - 持仓明细表格
  - 总市值统计

## 📊 Mock 数据

所有数据目前都是模拟数据，可在以下文件中修改：

- `components/PredictionMarket.tsx` 中的 `mockData` 对象

## 🔧 自定义修改

### 修改颜色主题

编辑 `tailwind.config.ts`:

\`\`\`typescript
colors: {
  primary: {
    DEFAULT: '#7c3aed',  // 主色
    dark: '#6d28d9',     // 深色
    light: '#8b5cf6',    // 浅色
  }
}
\`\`\`

### 修改右侧宽度

编辑 `app/page.tsx`:

\`\`\`typescript
<div className="w-[420px] flex-shrink-0">  // 修改这个宽度值
  <PredictionMarket />
</div>
\`\`\`

### 修改字体大小

编辑 `tailwind.config.ts`:

\`\`\`typescript
fontSize: {
  'xs': '0.7rem',    // 超小
  'sm': '0.8rem',    // 小
  'base': '0.875rem', // 基础
}
\`\`\`

## 📝 下一步

1. 运行 `npm run dev` 启动项目
2. 在浏览器中查看效果
3. 根据需要调整样式和数据
4. 准备好后集成真实的后端 API

## ⚠️ 注意事项

- 确保已安装 Node.js 18+ 
- 首次运行需要先 `npm install` 安装依赖
- 端口 3000 需要未被占用

## 🆘 遇到问题？

如果遇到依赖安装问题，尝试：

\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

如果端口被占用，可以修改端口：

\`\`\`bash
PORT=3001 npm run dev
\`\`\`

