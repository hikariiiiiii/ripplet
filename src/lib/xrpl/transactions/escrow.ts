import type { EscrowCreate, EscrowFinish, EscrowCancel } from 'xrpl'
import type { BaseTransactionParams } from './types'
import { createMemo } from './builder'

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

function isValidXRPAmount(amount: string): boolean {
  const num = BigInt(amount)
  return num > 0n
}

export interface EscrowCreateParams extends BaseTransactionParams {
  Destination: string
  Amount: string
  FinishAfter?: number
  CancelAfter?: number
  Condition?: string
  DestinationTag?: number
}

export function buildEscrowCreate(params: EscrowCreateParams): EscrowCreate {
  const {
    Account,
    Destination,
    Amount,
    FinishAfter,
    CancelAfter,
    Condition,
    DestinationTag,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!isValidAddress(Destination)) {
    throw new Error('Invalid destination address format')
  }

  if (!isValidXRPAmount(Amount)) {
    throw new Error('Amount must be greater than 0')
  }

  if (FinishAfter !== undefined && CancelAfter !== undefined) {
    if (FinishAfter >= CancelAfter) {
      throw new Error('FinishAfter must be less than CancelAfter')
    }
  }

  const transaction: EscrowCreate = {
    TransactionType: 'EscrowCreate',
    Account,
    Destination,
    Amount,
  }

  if (FinishAfter !== undefined) {
    transaction.FinishAfter = FinishAfter
  }

  if (CancelAfter !== undefined) {
    transaction.CancelAfter = CancelAfter
  }

  if (Condition !== undefined) {
    transaction.Condition = Condition
  }

  if (DestinationTag !== undefined) {
    if (!Number.isInteger(DestinationTag) || DestinationTag < 0 || DestinationTag > 4294967295) {
      throw new Error('DestinationTag must be an integer between 0 and 4294967295')
    }
    transaction.DestinationTag = DestinationTag
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

export interface EscrowFinishParams extends BaseTransactionParams {
  Owner: string
  OfferSequence: number
  Condition?: string
  Fulfillment?: string
}

export function buildEscrowFinish(params: EscrowFinishParams): EscrowFinish {
  const {
    Account,
    Owner,
    OfferSequence,
    Condition,
    Fulfillment,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!isValidAddress(Owner)) {
    throw new Error('Invalid owner address format')
  }

  if (!Number.isInteger(OfferSequence) || OfferSequence < 0) {
    throw new Error('OfferSequence must be a non-negative integer')
  }

  const transaction: EscrowFinish = {
    TransactionType: 'EscrowFinish',
    Account,
    Owner,
    OfferSequence,
  }

  if (Condition !== undefined) transaction.Condition = Condition
  if (Fulfillment !== undefined) transaction.Fulfillment = Fulfillment
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

export interface EscrowCancelParams extends BaseTransactionParams {
  Owner: string
  OfferSequence: number
}

export function buildEscrowCancel(params: EscrowCancelParams): EscrowCancel {
  const {
    Account,
    Owner,
    OfferSequence,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!isValidAddress(Owner)) {
    throw new Error('Invalid owner address format')
  }

  if (!Number.isInteger(OfferSequence) || OfferSequence < 0) {
    throw new Error('OfferSequence must be a non-negative integer')
  }

  const transaction: EscrowCancel = {
    TransactionType: 'EscrowCancel',
    Account,
    Owner,
    OfferSequence,
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



export interface IOUAmount {
  currency: string
  issuer: string
  value: string
}

export interface IOUEscrowCreateParams {
  Account: string
  Destination: string
  Amount: IOUAmount
  FinishAfter?: number
  CancelAfter?: number
  Condition?: string
  DestinationTag?: number
  Memos?: { data: string }[]
  Fee?: string
  Sequence?: number
  LastLedgerSequence?: number
  Signers?: BaseTransactionParams['Signers']
  SigningPubKey?: string
  SourceTag?: number
  TxnSignature?: string
}

export function buildIOUEscrowCreate(params: IOUEscrowCreateParams): EscrowCreate {
  const {
    Account,
    Destination,
    Amount,
    FinishAfter,
    CancelAfter,
    Condition,
    DestinationTag,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  if (!isValidAddress(Destination)) {
    throw new Error('Invalid destination address format')
  }
  if (!Amount.currency || Amount.currency.length < 3 || Amount.currency.length > 40) {
    throw new Error('Invalid currency code')
  }
  if (!Amount.issuer || !isValidAddress(Amount.issuer)) {
    throw new Error('Invalid issuer address')
  }
  if (!Amount.value || parseFloat(Amount.value) <= 0) {
    throw new Error('Amount must be greater than 0')
  }

  if (FinishAfter !== undefined && CancelAfter !== undefined) {
    if (FinishAfter >= CancelAfter) {
      throw new Error('FinishAfter must be less than CancelAfter')
    }
  }

  const transaction: EscrowCreate = {
    TransactionType: 'EscrowCreate',
    Account,
    Destination,
    Amount: {
      currency: Amount.currency.toUpperCase(),
      issuer: Amount.issuer,
      value: Amount.value,
    },
  }

  if (FinishAfter !== undefined) {
    transaction.FinishAfter = FinishAfter
  }

  if (CancelAfter !== undefined) {
    transaction.CancelAfter = CancelAfter
  }

  if (Condition !== undefined) {
    transaction.Condition = Condition
  }

  if (DestinationTag !== undefined) {
    if (!Number.isInteger(DestinationTag) || DestinationTag < 0 || DestinationTag > 4294967295) {
      throw new Error('DestinationTag must be an integer between 0 and 4294967295')
    }
    transaction.DestinationTag = DestinationTag
  }

  if (Fee !== undefined) transaction.Fee = Fee
  if (Sequence !== undefined) transaction.Sequence = Sequence
  if (LastLedgerSequence !== undefined) transaction.LastLedgerSequence = LastLedgerSequence
  if (Memos !== undefined) transaction.Memos = Memos.map(memo => createMemo(memo.data))
  if (Signers !== undefined) transaction.Signers = Signers
  if (SigningPubKey !== undefined) transaction.SigningPubKey = SigningPubKey
  if (SourceTag !== undefined) transaction.SourceTag = SourceTag
  if (TxnSignature !== undefined) transaction.TxnSignature = TxnSignature

  return transaction
}


export { buildEscrowFinish as buildIOUEscrowFinish }
