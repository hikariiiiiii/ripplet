# High Priority Transaction Types Implementation Plan (Updated)

## TL;DR

> **Quick Summary**: 基于官方文档，实现高优先级交易类型（包含 Escrow 功能）
> 
> **Total Types**: 17 个新类型
> 
> **Estimated Effort**: High

---

## Target Menu Structure

```
📁 Overview
   └── Dashboard ✅

📁 Account
   ├── AccountSet ✅
   └── AccountDelete 🆕

📁 XRP
   ├── Payment ✅
   └── Escrow 🆕
       ├── EscrowCreate
       ├── EscrowFinish
       └── EscrowCancel

📁 IOU
   ├── TrustSet ✅
   ├── AccountSet (Issuer) ✅
   ├── Payment (IOU) 🆕
   ├── Offers 🆕
   │   ├── OfferCreate
   │   └── OfferCancel
   └── Escrow 🆕
       ├── EscrowCreate
       ├── EscrowFinish
       └── EscrowCancel

📁 NFT
   ├── NFTokenMint 🆕
   ├── NFTokenBurn 🆕
   └── NFTokenTransfer 🆕

📁 MPT
   ├── MPTokenIssuanceCreate 🆕
   ├── MPTokenAuthorize 🆕
   └── Escrow 🆕
       ├── EscrowCreate
       ├── EscrowFinish
       └── EscrowCancel

📁 Credential
   ├── CredentialCreate 🆕
   └── CredentialAccept 🆕
```

---

## Implementation Plan

### Phase 1: Account (1 type)

| # | Type | Description | Route |
|---|------|-------------|-------|
| 1.1 | **AccountDelete** | 删除账户 | `/account/accountdelete` |

**Fields**:
- Destination (required) - 接收剩余 XRP 的账户
- DestinationTag (optional)

---

### Phase 2: XRP (3 types - Escrow)

| # | Type | Description | Route |
|---|------|-------------|-------|
| 2.1 | **EscrowCreate** | 创建 XRP 托管 | `/xrp/escrow/create` |
| 2.2 | **EscrowFinish** | 完成 XRP 托管 | `/xrp/escrow/finish` |
| 2.3 | **EscrowCancel** | 取消 XRP 托管 | `/xrp/escrow/cancel` |

**EscrowCreate Fields**:
- Destination (required)
- Amount (required - XRP amount in drops)
- FinishAfter (optional - unix timestamp)
- CancelAfter (optional - unix timestamp)
- Condition (optional - SHA-256 hash)
- DestinationTag (optional)

**EscrowFinish Fields**:
- Owner (required - escrow creator)
- OfferSequence (required - escrow sequence)
- Condition (optional)
- Fulfillment (optional)

**EscrowCancel Fields**:
- Owner (required - escrow creator)
- OfferSequence (required - escrow sequence)

---

### Phase 3: IOU (6 types)

#### 3.1 Payment (IOU)
| Type | Description | Route |
|------|-------------|-------|
| **Payment (IOU)** | IOU 支付 | `/iou/payment` |

**Fields**:
- Destination (required)
- Amount (required: currency, issuer, value)
- DestinationTag (optional)
- SendMax (optional)
- Memos (optional)

#### 3.2 Offers (2 types)
| Type | Description | Route |
|------|-------------|-------|
| **OfferCreate** | 创建挂单 | `/iou/offercreate` |
| **OfferCancel** | 取消挂单 | `/iou/offercancel` |

**OfferCreate Fields**:
- TakerGets (required) - 卖出的货币
- TakerPays (required) - 买入的货币
- Expiration (optional)
- Memos (optional)

**OfferCancel Fields**:
- OfferSequence (required)

#### 3.3 Escrow (3 types)
| Type | Description | Route |
|------|-------------|-------|
| **EscrowCreate** | 创建 IOU 托管 | `/iou/escrow/create` |
| **EscrowFinish** | 完成 IOU 托管 | `/iou/escrow/finish` |
| **EscrowCancel** | 取消 IOU 托管 | `/iou/escrow/cancel` |

**Note**: IOU Escrow 需要 CancelAfter（强制），且 issuer 需启用 "Allow Trust Line Locking"

---

### Phase 4: NFT (3 types)

| # | Type | Description | Route |
|---|------|-------------|-------|
| 4.1 | **NFTokenMint** | 铸造 NFT | `/nft/mint` |
| 4.2 | **NFTokenBurn** | 销毁 NFT | `/nft/burn` |
| 4.3 | **NFTokenTransfer** | 转移 NFT | `/nft/transfer` |

**NFTokenMint Fields**:
- NFTokenTaxon (required)
- URI (optional)
- TransferFee (optional, 0-50000)
- Issuer (optional)

**NFTokenBurn Fields**:
- NFTokenID (required)
- Owner (optional)

**NFTokenTransfer Fields** (组合: CreateOffer + AcceptOffer):
- NFTokenID (required)
- Destination (required)

**Note**: NFT 不支持 Escrow

---

### Phase 5: MPT (5 types)

#### 5.1 Basic Operations (2 types)
| Type | Description | Route |
|------|-------------|-------|
| **MPTokenIssuanceCreate** | 创建 MPT 发行 | `/mpt/create` |
| **MPTokenAuthorize** | 授权/转让 MPT | `/mpt/authorize` |

**MPTokenIssuanceCreate Fields**:
- AssetScale (required)
- MaximumAmount (optional)
- TransferFee (optional)
- MPTokenMetadata (optional)
- Flags (optional: tfMPTCanLock, tfMPTCanEscrow, tfMPTCanTransfer, etc.)

**MPTokenAuthorize Fields**:
- MPTokenIssuanceID (required)
- Holder (optional)
- Flags (optional: tfMPTUnauthorize)

#### 5.2 Escrow (3 types)
| Type | Description | Route |
|------|-------------|-------|
| **EscrowCreate** | 创建 MPT 托管 | `/mpt/escrow/create` |
| **EscrowFinish** | 完成 MPT 托管 | `/mpt/escrow/finish` |
| **EscrowCancel** | 取消 MPT 托管 | `/mpt/escrow/cancel` |

**Note**: MPT Escrow 需要：
- MPT 需启用 `tfMPTCanEscrow` + `tfMPTCanTransfer` 标志
- CancelAfter（强制）

---

### Phase 6: Credential (2 types)

| # | Type | Description | Route |
|---|------|-------------|-------|
| 6.1 | **CredentialCreate** | 创建凭证 | `/credential/create` |
| 6.2 | **CredentialAccept** | 接受凭证 | `/credential/accept` |

**CredentialCreate Fields**:
- CredentialType (required)
- URI (optional)

**CredentialAccept Fields**:
- CredentialType (required)
- Issuer (required)

---

## Summary

| Phase | Category | Types | Priority |
|-------|----------|-------|----------|
| 1 | Account | 1 | 🔴 High |
| 2 | XRP (Escrow) | 3 | 🔴 High |
| 3 | IOU | 6 | 🔴 High |
| 4 | NFT | 3 | 🔴 High |
| 5 | MPT | 5 | 🟡 Medium |
| 6 | Credential | 2 | 🟡 Medium |
| **Total** | | **17** | |

---

## Implementation Order

1. **Phase 1**: AccountDelete (1 type)
2. **Phase 2**: XRP Escrow (3 types)
3. **Phase 3**: IOU Payment + Offers + Escrow (6 types)
4. **Phase 4**: NFT (3 types)
5. **Phase 5**: MPT + Escrow (5 types)
6. **Phase 6**: Credential (2 types)

---

## Official Documentation

### MPT
- https://xrpl.org/docs/concepts/tokens/fungible-tokens/multi-purpose-tokens
- https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate
- https://xrpl.org/docs/references/protocol/transactions/types/mptokenauthorize

### Escrow
- https://xrpl.org/docs/concepts/payment-types/escrow
- https://xrpl.org/docs/references/protocol/transactions/types/escrowcreate
- https://xrpl.org/docs/references/protocol/transactions/types/escrowfinish
- https://xrpl.org/docs/references/protocol/transactions/types/escrowcancel

---

## Next Step

开始实现 **Phase 1: AccountDelete**?
