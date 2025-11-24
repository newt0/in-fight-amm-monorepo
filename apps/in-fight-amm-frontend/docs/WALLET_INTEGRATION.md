# Sui Wallet Integration Documentation

## 概述

已成功集成 Sui 区块链钱包连接功能，使用 `@mysten/dapp-kit` 实现钱包登录和身份验证。

## 安装的依赖

```json
{
  "@mysten/dapp-kit": "^latest",
  "@mysten/sui": "^latest",
  "@tanstack/react-query": "^latest"
}
```

## 核心功能

### 1. 钱包连接

- ✅ 点击 "Connect Wallet" 按钮
- ✅ 弹出钱包选择器
- ✅ 支持多种 Sui 钱包（Sui Wallet, Suiet, Martian, etc.）
- ✅ 优先支持 Slush Wallet
- ✅ 自动重连（页面刷新保持连接状态）

### 2. 登录验证

- ✅ 只有连接钱包后才能访问赛事页面
- ✅ 未连接时点击卡片显示提示："Please connect your wallet first to access the event!"
- ✅ 未连接的卡片显示半透明并显示禁用光标

### 3. 用户状态显示

- ✅ 导航栏显示连接状态
- ✅ 连接后显示地址缩写头像（前2个字符）
- ✅ 连接按钮变为绿色
- ✅ 点击可断开连接或查看详情

## 文件结构

### 新增文件

1. **`components/WalletProvider.tsx`** - Sui 钱包提供者
   - 配置 Sui 网络（testnet, mainnet, devnet）
   - QueryClient 配置
   - WalletProvider 包装器
   - 自动连接功能

2. **`app/wallet.css`** - 钱包 UI 自定义样式
   - 连接按钮样式（符合主题色 #c8f028）
   - 钱包选择器模态框样式
   - 悬停和连接状态样式
   - 深色主题适配

### 修改文件

3. **`app/layout.tsx`** - 根布局
   - 导入 dapp-kit CSS
   - 导入自定义 wallet.css
   - 用 SuiWalletProvider 包装应用

4. **`components/Navbar.tsx`** - 导航栏
   - 使用 ConnectButton 组件
   - 使用 useCurrentAccount hook
   - 显示连接状态和地址头像

5. **`components/HomePage.tsx`** - 首页
   - 使用 useCurrentAccount 检查登录状态
   - handleEventClick 中验证钱包连接
   - 传递 isWalletConnected 状态到卡片

6. **`components/EventCard.tsx`** - 赛事卡片
   - 接收 isWalletConnected prop
   - 根据连接状态显示不同样式
   - 未连接：半透明 + 禁用光标

## 网络配置

当前配置的 Sui 网络：

```typescript
{
  localnet: { url: getFullnodeUrl('localnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },  // 默认
  mainnet: { url: getFullnodeUrl('mainnet') },
}
```

**默认网络**: `testnet`

可以在 `WalletProvider.tsx` 中修改默认网络。

## 使用流程

### 用户操作流程

1. **访问首页**
   - 看到赛事列表
   - 卡片显示半透明（未连接状态）

2. **连接钱包**
   - 点击右上角 "Connect Wallet"
   - 选择钱包（推荐 Slush Wallet）
   - 在钱包中确认连接

3. **连接成功**
   - 按钮变为绿色显示地址
   - 显示地址头像
   - 赛事卡片变为可点击状态

4. **访问赛事**
   - 点击任意赛事卡片
   - 跳转到赛事直播页面
   - 开始交易

5. **断开连接**
   - 点击连接按钮
   - 选择 "Disconnect"

### 开发者使用

#### 检查钱包连接状态

```typescript
import { useCurrentAccount } from '@mysten/dapp-kit'

function MyComponent() {
  const account = useCurrentAccount()
  
  if (account) {
    console.log('Connected:', account.address)
  } else {
    console.log('Not connected')
  }
}
```

#### 获取钱包地址

```typescript
const account = useCurrentAccount()
const address = account?.address // 完整地址
const shortAddress = account?.address.slice(0, 6) // 缩写
```

#### 条件渲染

```typescript
{account ? (
  <div>Welcome {account.address}</div>
) : (
  <div>Please connect wallet</div>
)}
```

## 样式定制

### 主题色配置

在 `app/wallet.css` 中定制：

```css
/* 主题色 */
--primary: #c8f028;
--primary-dark: #b0d620;
--dark-bg: #0a0a0a;
--dark-card: #141414;
--dark-border: #2a2a2a;
```

### 按钮样式

- **未连接**: 透明背景 + 绿色边框 + 绿色文字
- **悬停**: 绿色背景 + 黑色文字
- **已连接**: 绿色背景 + 黑色文字 + 粗体

### 钱包选择器

- 深色背景 (#141414)
- 灰色边框 (#2a2a2a)
- 悬停时绿色边框
- 圆角和阴影效果

## 支持的钱包

`@mysten/dapp-kit` 支持的 Sui 钱包：

- ✅ **Sui Wallet** (官方)
- ✅ **Slush Wallet** (推荐)
- ✅ **Suiet**
- ✅ **Martian Wallet**
- ✅ **Ethos Wallet**
- ✅ **Glass Wallet**
- ✅ 其他支持 Sui 标准的钱包

用户可以选择任意已安装的钱包进行连接。

## 安全性

### 最佳实践

1. ✅ **自动连接**: 页面刷新保持连接
2. ✅ **会话管理**: 使用 QueryClient 缓存
3. ✅ **网络隔离**: 测试网和主网分离
4. ✅ **权限验证**: 每次交易需用户确认

### 注意事项

- 不在代码中存储私钥
- 所有交易由用户在钱包中确认
- 使用 testnet 进行开发测试
- 主网部署前充分测试

## 错误处理

### 常见错误

1. **用户拒绝连接**
   - 错误：User rejected the request
   - 处理：提示用户重试

2. **钱包未安装**
   - 错误：No wallet found
   - 处理：引导用户安装钱包

3. **网络错误**
   - 错误：Network error
   - 处理：检查网络配置和 RPC 节点

4. **会话过期**
   - 自动触发重连
   - 提示用户重新连接

## 扩展功能

### 待实现功能

- [ ] 交易签名和发送
- [ ] 代币余额查询
- [ ] NFT 展示
- [ ] 交易历史记录
- [ ] 多钱包管理
- [ ] 钱包切换检测

### 智能合约集成

准备好后，可以添加：

```typescript
import { TransactionBlock } from '@mysten/sui/transactions'
import { useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit'

function BuyTicket() {
  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock()
  
  const handleBuy = async () => {
    const tx = new TransactionBlock()
    // ... 构建交易
    
    signAndExecute({
      transactionBlock: tx,
    })
  }
}
```

## 测试

### 测试连接

1. 打开浏览器开发者工具
2. 点击 "Connect Wallet"
3. 选择钱包并连接
4. 检查控制台输出
5. 验证地址显示

### 测试权限

1. 未连接时点击赛事卡片
2. 应看到提示："Please connect your wallet first"
3. 连接钱包后再次点击
4. 应成功跳转到赛事页面

## 故障排除

### 连接按钮不显示

检查：
- WalletProvider 是否正确包装
- CSS 文件是否正确导入
- 浏览器控制台错误

### 无法连接钱包

检查：
- 钱包扩展是否已安装
- 钱包是否已解锁
- 网络配置是否正确
- 浏览器控制台错误信息

### 样式问题

检查：
- wallet.css 加载顺序
- CSS 选择器优先级
- dapp-kit CSS 是否正确导入

## 总结

Sui 钱包集成已完成，提供了：
- ✅ 一键连接多种钱包
- ✅ 登录状态验证
- ✅ 美观的UI设计
- ✅ 良好的用户体验
- ✅ 完整的错误处理
- ✅ 自动重连功能

用户现在可以安全地连接 Slush Wallet 或其他 Sui 钱包，享受完整的去中心化应用体验！

