import type { NFTokenMint, NFTokenBurn, NFTokenCreateOffer, NFTokenAcceptOffer, NFTokenCancelOffer } from 'xrpl'
import type { BaseTransactionParams } from './types'

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export const NFT_FLAGS = {
  tfBurnable: 0x00000001,
  tfOnlyXRP: 0x00000002,
  tfTrustLine: 0x00000004,
  tfTransferable: 0x00000008,
}

export interface NFTokenMintParams extends BaseTransactionParams {
  NFTokenTaxon: number
  URI?: string
  Flags?: number
  TransferFee?: number
  Issuer?: string
}

export function buildNFTokenMint(params: NFTokenMintParams): NFTokenMint {
  const {
    Account,
    NFTokenTaxon,
    URI,
    Flags,
    TransferFee,
    Issuer,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!Number.isInteger(NFTokenTaxon)) {
    throw new Error('NFTokenTaxon must be an integer')
  }

  if (Issuer && !isValidAddress(Issuer)) {
    throw new Error('Invalid issuer address format')
  }

  if (TransferFee !== undefined && (TransferFee < 0 || TransferFee > 50000)) {
    throw new Error('TransferFee must be between 0 and 50000 (0% to 50%)')
  }

  const transaction: NFTokenMint = {
    TransactionType: 'NFTokenMint',
    Account,
    NFTokenTaxon,
  }

  if (URI !== undefined) transaction.URI = URI
  if (Flags !== undefined) transaction.Flags = Flags
  if (TransferFee !== undefined) transaction.TransferFee = TransferFee
  if (Issuer !== undefined) transaction.Issuer = Issuer
  if (Fee !== undefined) transaction.Fee = Fee
  if (Sequence !== undefined) transaction.Sequence = Sequence
  if (LastLedgerSequence !== undefined) transaction.LastLedgerSequence = LastLedgerSequence
  if (Memos !== undefined) transaction.Memos = Memos
  if (Signers !== undefined) transaction.Signers = Signers
  if (SigningPubKey !== undefined) transaction.SigningPubKey = SigningPubKey
  if (SourceTag !== undefined) transaction.SourceTag = SourceTag
  if (TxnSignature !== undefined) transaction.TxnSignature = TxnSignature

  return transaction
}

export interface NFTokenBurnParams extends BaseTransactionParams {
  NFTokenID: string
  Owner?: string
}

export function buildNFTokenBurn(params: NFTokenBurnParams): NFTokenBurn {
  const {
    Account,
    NFTokenID,
    Owner,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!NFTokenID || NFTokenID.length === 0) {
    throw new Error('NFTokenID is required')
  }

  if (Owner && !isValidAddress(Owner)) {
    throw new Error('Invalid owner address format')
  }

  const transaction: NFTokenBurn = {
    TransactionType: 'NFTokenBurn',
    Account,
    NFTokenID,
  }

  if (Owner !== undefined) transaction.Owner = Owner
  if (Fee !== undefined) transaction.Fee = Fee
  if (Sequence !== undefined) transaction.Sequence = Sequence
  if (LastLedgerSequence !== undefined) transaction.LastLedgerSequence = LastLedgerSequence
  if (Memos !== undefined) transaction.Memos = Memos
  if (Signers !== undefined) transaction.Signers = Signers
  if (SigningPubKey !== undefined) transaction.SigningPubKey = SigningPubKey
  if (SourceTag !== undefined) transaction.SourceTag = SourceTag
  if (TxnSignature !== undefined) transaction.TxnSignature = TxnSignature

  return transaction
}

export interface NFTokenCreateOfferParams extends BaseTransactionParams {
  NFTokenID: string
  Amount: string | { currency: string; issuer: string; value: string }
  Destination?: string
  Expiration?: number
  Owner?: string
  Flags?: number
}

export function buildNFTokenCreateOffer(params: NFTokenCreateOfferParams): NFTokenCreateOffer {
  const {
    Account,
    NFTokenID,
    Amount,
    Destination,
    Expiration,
    Owner,
    Flags,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!NFTokenID || NFTokenID.length === 0) {
    throw new Error('NFTokenID is required')
  }

  if (Destination && !isValidAddress(Destination)) {
    throw new Error('Invalid destination address format')
  }

  if (Owner && !isValidAddress(Owner)) {
    throw new Error('Invalid owner address format')
  }

  const transaction: NFTokenCreateOffer = {
    TransactionType: 'NFTokenCreateOffer',
    Account,
    NFTokenID,
    Amount,
  }
  if (Destination !== undefined) transaction.Destination = Destination
  if (Expiration !== undefined) transaction.Expiration = Expiration
  if (Owner !== undefined) transaction.Owner = Owner
  if (Flags !== undefined) transaction.Flags = Flags
  if (Fee !== undefined) transaction.Fee = Fee
  if (Sequence !== undefined) transaction.Sequence = Sequence
  if (LastLedgerSequence !== undefined) transaction.LastLedgerSequence = LastLedgerSequence
  if (Memos !== undefined) transaction.Memos = Memos
  if (Signers !== undefined) transaction.Signers = Signers
  if (SigningPubKey !== undefined) transaction.SigningPubKey = SigningPubKey
  if (SourceTag !== undefined) transaction.SourceTag = SourceTag
  if (TxnSignature !== undefined) transaction.TxnSignature = TxnSignature

  return transaction
}

export interface NFTokenAcceptOfferParams extends BaseTransactionParams {
  NFTokenSellOffer?: string
  NFTokenBuyOffer?: string
  NFTokenBrokerFee?: string | { currency: string; issuer: string; value: string }
}

export function buildNFTokenAcceptOffer(params: NFTokenAcceptOfferParams): NFTokenAcceptOffer {
  const {
    Account,
    NFTokenSellOffer,
    NFTokenBuyOffer,
    NFTokenBrokerFee,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!NFTokenSellOffer && !NFTokenBuyOffer) {
    throw new Error('Either NFTokenSellOffer or NFTokenBuyOffer is required')
  }

  const transaction: NFTokenAcceptOffer = {
    TransactionType: 'NFTokenAcceptOffer',
    Account,
  }

  if (NFTokenSellOffer !== undefined) transaction.NFTokenSellOffer = NFTokenSellOffer
  if (NFTokenBuyOffer !== undefined) transaction.NFTokenBuyOffer = NFTokenBuyOffer
  if (NFTokenBrokerFee !== undefined) transaction.NFTokenBrokerFee = NFTokenBrokerFee
  if (Fee !== undefined) transaction.Fee = Fee
  if (Sequence !== undefined) transaction.Sequence = Sequence
  if (LastLedgerSequence !== undefined) transaction.LastLedgerSequence = LastLedgerSequence
  if (Memos !== undefined) transaction.Memos = Memos
  if (Signers !== undefined) transaction.Signers = Signers
  if (SigningPubKey !== undefined) transaction.SigningPubKey = SigningPubKey
  if (SourceTag !== undefined) transaction.SourceTag = SourceTag
  if (TxnSignature !== undefined) transaction.TxnSignature = TxnSignature

  return transaction
}

export interface NFTokenCancelOfferParams extends BaseTransactionParams {
  NFTokenOffers: string[]
}

export function buildNFTokenCancelOffer(params: NFTokenCancelOfferParams): NFTokenCancelOffer {
  const {
    Account,
    NFTokenOffers,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!NFTokenOffers || NFTokenOffers.length === 0) {
    throw new Error('At least one NFTokenOffer is required')
  }

  const transaction: NFTokenCancelOffer = {
    TransactionType: 'NFTokenCancelOffer',
    Account,
    NFTokenOffers,
  }

  if (Fee !== undefined) transaction.Fee = Fee
  if (Sequence !== undefined) transaction.Sequence = Sequence
  if (LastLedgerSequence !== undefined) transaction.LastLedgerSequence = LastLedgerSequence
  if (Memos !== undefined) transaction.Memos = Memos
  if (Signers !== undefined) transaction.Signers = Signers
  if (SigningPubKey !== undefined) transaction.SigningPubKey = SigningPubKey
  if (SourceTag !== undefined) transaction.SourceTag = SourceTag
  if (TxnSignature !== undefined) transaction.TxnSignature = TxnSignature

  return transaction
}
