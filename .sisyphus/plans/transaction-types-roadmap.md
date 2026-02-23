# High Priority Transaction Types Implementation Plan

## TL;DR

> **Quick Summary**: 按优先级实现高优先级上链类型，每个类型开发完整的子菜单功能
> 
> **Progress**: 3/29 高优先级已完成 (10.3%)
> 
> **Estimated Effort**: High

---

## Current Status

| Category | Types | Done | Remaining |
|----------|-------|------|-----------|
| **1. Account** | 5 | 1 (AccountSet) | 4 |
| **2. Payment** | 8 | 1 (Payment) | 7 |
| **3. Token/IOU** | 4 | 1 (TrustSet) | 3 |
| **4. NFT** | 6 | 0 | 6 |
| **5. MPT** | 4 | 0 | 4 |
| **6. Credential** | 3 | 0 | 3 |
| **Total** | **29** | **3** | **26** |

---

## Implementation Order (By Category)

### Phase 1: Account (4 remaining)

| # | Type | Description | Priority |
|---|------|-------------|----------|
| 1.1 | **AccountDelete** | 删除账户 | High |
| 1.2 | **SetRegularKey** | 设置常规密钥 | High |
| 1.3 | **SignerListSet** | 多签设置 | High |
| 1.4 | **TicketCreate** | 创建票据 | Medium |

### Phase 2: Payment (7 remaining)

| # | Type | Description | Priority |
|---|------|-------------|----------|
| 2.1 | **CheckCreate** | 创建支票 | High |
| 2.2 | **CheckCash** | 兑现支票 | High |
| 2.3 | **CheckCancel** | 取消支票 | High |
| 2.4 | **DepositPreauth** | 预授权存款 | Medium |
| 2.5 | **PaymentChannelCreate** | 创建支付通道 | Medium |
| 2.6 | **PaymentChannelFund** | 支付通道充值 | Medium |
| 2.7 | **PaymentChannelClaim** | 支付通道索赔 | Medium |

### Phase 3: Token/IOU (3 remaining)

| # | Type | Description | Priority |
|---|------|-------------|----------|
| 3.1 | **OfferCreate** | 创建挂单 (DEX) | High |
| 3.2 | **OfferCancel** | 取消挂单 | High |
| 3.3 | **Clawback** | 回收代币 | Medium |

### Phase 4: NFT (6 types)

| # | Type | Description | Priority |
|---|------|-------------|----------|
| 4.1 | **NFTokenMint** | 铸造 NFT | High |
| 4.2 | **NFTokenBurn** | 销毁 NFT | High |
| 4.3 | **NFTokenCreateOffer** | 创建 NFT 挂单 | High |
| 4.4 | **NFTokenAcceptOffer** | 接受 NFT 报价 | High |
| 4.5 | **NFTokenCancelOffer** | 取消 NFT 报价 | Medium |
| 4.6 | **NFTokenModify** | 修改 NFT | Low |

### Phase 5: MPT (4 types)

| # | Type | Description | Priority |
|---|------|-------------|----------|
| 5.1 | **MPTokenIssuanceCreate** | 创建 MPT 发行 | Medium |
| 5.2 | **MPTokenIssuanceSet** | 设置 MPT 发行 | Medium |
| 5.3 | **MPTokenIssuanceDestroy** | 销毁 MPT 发行 | Medium |
| 5.4 | **MPTokenAuthorize** | 授权 MPT | Medium |

### Phase 6: Credential (3 types)

| # | Type | Description | Priority |
|---|------|-------------|----------|
| 6.1 | **CredentialCreate** | 创建凭证 | Medium |
| 6.2 | **CredentialAccept** | 接受凭证 | Medium |
| 6.3 | **CredentialDelete** | 删除凭证 | Medium |

---

## Each Type Implementation Template

每个交易类型需要实现以下组件：

### 1. Transaction Builder (`src/lib/xrpl/transactions/{type}.ts`)
```typescript
// build{Type}() - 构建交易
// validate{Type}() - 验证参数
// {Type}Transaction 类型定义
```

### 2. Form Component (`src/components/transaction/{Type}Form.tsx`)
```typescript
// 表单字段
// 验证逻辑
// 提交处理
```

### 3. Page Component (`src/pages/{Type}.tsx`)
```typescript
// 页面布局
// 表单集成
// 结果显示
```

### 4. Route Registration (`src/App.tsx`)
```typescript
<Route path="{category}/{type}" element={<{Type} />} />
```

### 5. Sidebar Navigation (`src/components/layout/Sidebar.tsx`)
```typescript
// 添加导航项
// i18n 标签
```

### 6. i18n Translations
```json
// en.json / zh.json
// 表单标签、提示、错误消息
```

---

## Next Steps

### 立即开始：Phase 1 - Account 类型

1. **AccountDelete** - 删除账户
2. **SetRegularKey** - 设置常规密钥
3. **SignerListSet** - 多签设置
4. **TicketCreate** - 创建票据

是否开始实现 Phase 1?
