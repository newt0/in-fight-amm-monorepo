# Interactive Prediction Market System

## 系统概述

已成功实现完整的动态交互预测市场系统，支持实时买卖交易、价格波动模拟和数据联动更新。

## 核心功能

### 1. 实时交易系统

#### 买入（Buy）功能
- 点击 "Buy" 按钮选择买入模式
- 使用 +/- 按钮或直接输入调整购买数量
- 系统自动计算总价格
- 点击 "Confirm Buy" 执行交易：
  - ✅ 检查余额是否充足
  - ✅ 扣除用户余额
  - ✅ 增加持仓数量
  - ✅ 更新平均成本
  - ✅ 增加总奖池
  - ✅ 价格上涨（每张票+0.5%）
  - ✅ 更新价格图表
  - ✅ 添加订单历史记录

#### 卖出（Sell）功能
- 点击 "Sell" 按钮选择卖出模式
- 调整卖出数量
- 系统自动计算总收益
- 点击 "Confirm Sell" 执行交易：
  - ✅ 检查持仓是否充足
  - ✅ 增加用户余额
  - ✅ 减少持仓数量
  - ✅ 减少总奖池
  - ✅ 价格下降（每张票-0.5%）
  - ✅ 更新价格图表
  - ✅ 添加订单历史记录

#### 一键卖出所有持仓
- 点击 "Sell All Holdings" 按钮
- 自动卖出所有选手的持仓
- 批量更新所有相关数据

### 2. 价格动态系统

#### 交易驱动的价格变化
- **买入影响**：每购买1张票，价格上涨0.5%
- **卖出影响**：每卖出1张票，价格下降0.5%
- 价格变化立即反映在图表上

#### 自动价格波动
- 每1秒自动执行一次价格波动
- 波动幅度：±0.05%（随机）
- 模拟真实市场的价格变动
- Fighter A 和 Fighter B 价格反向波动

### 3. 市场数据联动

#### 实时更新的数据
1. **总奖池（Total Prize Pool）**
   - 买入：增加交易金额
   - 卖出：减少交易金额

2. **市场份额（Market Percentage）**
   - 根据双方价格和持仓量动态计算
   - 自动保持 100% 平衡

3. **用户余额（Balance）**
   - 买入：扣除资金
   - 卖出：增加资金
   - 实时显示可用余额

4. **持仓信息（Holdings）**
   - 显示每个选手的持仓数量
   - 显示当前市场价值
   - 显示盈亏百分比
   - 无持仓时显示提示信息

5. **价格图表（Price Chart）**
   - 保持最近20个数据点
   - 每次交易添加新数据点
   - 每30秒自动更新
   - 末端有脉冲动画

6. **订单历史（Order History）**
   - 记录最近10笔交易
   - 显示交易类型、选手、数量、价格、总额、时间
   - 支持折叠/展开
   - 新订单显示 "Just now"

### 4. 交互优化

#### 按钮状态管理
- Buy/Sell 按钮根据模式高亮显示
- 余额不足时禁用买入按钮
- 持仓不足时禁用卖出按钮
- 禁用状态显示灰色并阻止点击

#### 用户反馈
- 余额不足时显示 alert 提示
- 持仓不足时显示 alert 提示
- 交易成功后重置数量为 1
- 实时显示可用余额/可卖出数量

#### 数据精度
- 所有数字统一保留2位小数
- 价格、余额、总额：2位小数
- 百分比：2位小数
- 自动四舍五入

## 数据结构

### Fighter Data
```typescript
{
  name: string           // 选手名称
  percentage: number     // 市场份额（百分比）
  change: number         // 市场份额变化
  price: number          // 当前价格
  priceChange: number    // 价格变化百分比
  color: string          // 图表颜色
  chartData: [           // 价格历史数据
    { time: number, price: number }
  ]
}
```

### Holding Data
```typescript
{
  tickets: number        // 持仓数量
  avgPrice: number       // 平均成本
}
```

### Order Data
```typescript
{
  id: string            // 订单ID
  type: 'buy' | 'sell'  // 交易类型
  fighter: string       // 选手名称
  tickets: number       // 数量
  price: number         // 价格
  total: number         // 总额
  time: string          // 时间
}
```

## 状态管理

### 主要状态（PredictionMarket.tsx）
- `balance`: 用户余额
- `totalPool`: 总奖池
- `fighterA/fighterB`: 选手A/B的完整数据
- `holdingA/holdingB`: 选手A/B的持仓信息
- `orderHistory`: 订单历史数组

### 组件通信
- `PredictionMarket` → `FighterCard`: 传递 `onTransaction` 回调
- `PredictionMarket` → `MyAccount`: 传递 `onSellAll` 回调
- 所有状态集中管理，单向数据流

## 价格计算逻辑

### 市场份额计算
```typescript
totalValue = fighterA.price * tickets + fighterB.price * tickets
percentageA = (fighterA.price * tickets / totalValue) * 100
percentageB = 100 - percentageA
```

### 价格影响计算
```typescript
// 买入
priceImpact = 1 + (quantity * 0.005)  // +0.5% per ticket
newPrice = currentPrice * priceImpact

// 卖出
priceImpact = 1 - (quantity * 0.005)  // -0.5% per ticket
newPrice = currentPrice * priceImpact
```

### 平均成本计算
```typescript
newAvgPrice = (oldAvgPrice * oldTickets + totalCost) / (oldTickets + newTickets)
```

## 模拟数据参数

### 初始值
- 用户余额: 2,500 USDC
- 总奖池: 125,000 USDC
- Fighter A 价格: 100 USDC
- Fighter B 价格: 100 USDC
- 市场份额: 50% vs 50%
- Fighter A 持仓: 0 张（无持仓）
- Fighter B 持仓: 0 张（无持仓）
- 订单历史: 空（无历史记录）

### 波动参数
- 自动波动间隔: 1秒
- 波动幅度: ±0.05%
- 价格影响: ±0.5% per ticket
- 图表数据点: 20个

## 使用说明

### 基本操作流程

1. **查看市场信息**
   - 顶部查看总奖池和市场预测
   - 查看双方选手的价格和涨跌幅

2. **购买票据**
   - 选择想要购买的选手卡片
   - 点击 "Buy" 按钮
   - 调整购买数量
   - 确认余额充足
   - 点击 "Confirm Buy"

3. **卖出票据**
   - 选择想要卖出的选手卡片
   - 点击 "Sell" 按钮
   - 调整卖出数量
   - 确认持仓充足
   - 点击 "Confirm Sell"

4. **查看持仓**
   - 滚动到 "My Account" 部分
   - 查看每个选手的持仓和市值
   - 查看总市值和盈亏

5. **查看历史**
   - 点击 "Order History" 展开
   - 查看最近10笔交易记录

6. **一键清仓**
   - 点击 "Sell All Holdings"
   - 自动卖出所有持仓

## 技术亮点

1. ✅ **完整的状态管理**: 使用 React Hooks 管理复杂状态
2. ✅ **实时数据联动**: 所有组件数据自动同步更新
3. ✅ **价格模拟算法**: 基于供需关系的价格变化模型
4. ✅ **用户体验优化**: 按钮禁用、错误提示、自动重置
5. ✅ **性能优化**: useEffect 依赖管理，避免不必要的渲染
6. ✅ **数据持久化准备**: 结构化数据便于后续接入后端API
7. ✅ **类型安全**: 完整的 TypeScript 类型定义

## 未来扩展方向

- [ ] 添加价格限制（最低/最高价）
- [ ] 实现更复杂的价格模型（AMM算法）
- [ ] 添加交易手续费机制
- [ ] 实现交易确认对话框
- [ ] 添加交易动画效果
- [ ] 接入真实区块链智能合约
- [ ] 添加 WebSocket 实时同步
- [ ] 实现交易通知系统
- [ ] 添加高级图表功能（缩放、指标）
- [ ] 实现订单撤销功能

## 测试建议

### 功能测试
1. 测试买入不同数量的票据，观察价格变化
2. 测试卖出操作，验证余额和持仓更新
3. 测试余额不足时的错误提示
4. 测试持仓不足时的错误提示
5. 测试一键卖出所有持仓功能
6. 等待30秒观察自动价格波动
7. 连续交易观察价格图表更新
8. 查看订单历史记录的更新

### 边界测试
1. 余额为0时尝试买入
2. 持仓为0时尝试卖出
3. 输入极大数量测试
4. 快速连续点击测试
5. 同时买入双方选手测试市场份额计算

## 总结

已成功实现完整的动态交互预测市场系统，所有功能正常运行，数据流转顺畅，用户体验良好。系统架构清晰，便于后续扩展和维护。

