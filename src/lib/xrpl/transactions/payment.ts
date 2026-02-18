import type { Payment } from 'xrpl'
import { isValidClassicAddress } from 'xrpl'
import { createMemo } from './builder'

export type XRPAmount = string

export interface IOUAmount {
  currency: string
  issuer: string
  value: string
}

export type Amount = XRPAmount | IOUAmount

export interface PaymentMemo {
  data: string
  type?: string
  format?: string
}

export interface PaymentParams {
  Account: string
  Destination: string
  Amount: Amount
  DestinationTag?: number
  Memos?: PaymentMemo[]
  InvoiceID?: string
  Fee?: string
  Sequence?: number
  LastLedgerSequence?: number
  SourceTag?: number
}

export interface PaymentValidationError {
  field: string
  message: string
}

export function isValidXRPLAddress(address: string): boolean {
  return isValidClassicAddress(address)
}

export function isValidXRPAmount(amount: string): boolean {
  const dropsRegex = /^\d+$/
  if (!dropsRegex.test(amount)) {
    return false
  }
  const drops = BigInt(amount)
  return drops > 0n
}

export function isValidIOUAmount(amount: IOUAmount): boolean {
  if (!amount.currency || typeof amount.currency !== 'string') {
    return false
  }
  if (!amount.issuer || !isValidXRPLAddress(amount.issuer)) {
    return false
  }
  if (!amount.value || typeof amount.value !== 'string') {
    return false
  }
  const value = parseFloat(amount.value)
  return !isNaN(value) && value > 0
}

export function validatePaymentParams(params: PaymentParams): PaymentValidationError[] {
  const errors: PaymentValidationError[] = []

  if (!params.Account) {
    errors.push({ field: 'Account', message: 'Account is required' })
  } else if (!isValidXRPLAddress(params.Account)) {
    errors.push({ field: 'Account', message: 'Invalid Account address format' })
  }

  if (!params.Destination) {
    errors.push({ field: 'Destination', message: 'Destination is required' })
  } else if (!isValidXRPLAddress(params.Destination)) {
    errors.push({ field: 'Destination', message: 'Invalid Destination address format' })
  }

  if (!params.Amount) {
    errors.push({ field: 'Amount', message: 'Amount is required' })
  } else if (typeof params.Amount === 'string') {
    if (!isValidXRPAmount(params.Amount)) {
      errors.push({ field: 'Amount', message: 'Invalid XRP amount - must be a positive integer in drops' })
    }
  } else {
    if (!isValidIOUAmount(params.Amount)) {
      errors.push({ field: 'Amount', message: 'Invalid IOU amount - must have valid currency, issuer, and positive value' })
    }
  }

  if (params.DestinationTag !== undefined) {
    if (typeof params.DestinationTag !== 'number' || !Number.isInteger(params.DestinationTag)) {
      errors.push({ field: 'DestinationTag', message: 'DestinationTag must be an integer' })
    } else if (params.DestinationTag < 0 || params.DestinationTag > 4294967295) {
      errors.push({ field: 'DestinationTag', message: 'DestinationTag must be between 0 and 4294967295' })
    }
  }

  if (params.InvoiceID !== undefined) {
    const hexRegex = /^[0-9A-Fa-f]{64}$/
    if (!hexRegex.test(params.InvoiceID)) {
      errors.push({ field: 'InvoiceID', message: 'InvoiceID must be a 64-character hex string' })
    }
  }

  return errors
}

export function xrpToDrops(xrp: string | number): string {
  const xrpNum = typeof xrp === 'string' ? parseFloat(xrp) : xrp
  if (isNaN(xrpNum) || xrpNum < 0) {
    throw new Error('Invalid XRP amount')
  }
  const xrpStr = xrpNum.toString()
  const decimalIndex = xrpStr.indexOf('.')
  if (decimalIndex !== -1 && xrpStr.length - decimalIndex - 1 > 6) {
    throw new Error('XRP amount cannot have more than 6 decimal places')
  }
  const drops = Math.round(xrpNum * 1_000_000)
  return drops.toString()
}

export function dropsToXrp(drops: string | number): string {
  const dropsNum = typeof drops === 'string' ? parseInt(drops, 10) : drops
  if (isNaN(dropsNum) || dropsNum < 0) {
    throw new Error('Invalid drops amount')
  }
  const xrp = dropsNum / 1_000_000
  return xrp.toString()
}

export function buildPayment(params: PaymentParams): Payment {
  const errors = validatePaymentParams(params)
  if (errors.length > 0) {
    const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join('; ')
    throw new Error(`Payment validation failed: ${errorMessages}`)
  }

  const transaction: Payment = {
    TransactionType: 'Payment',
    Account: params.Account,
    Destination: params.Destination,
    Amount: params.Amount,
  }

  if (params.DestinationTag !== undefined) {
    transaction.DestinationTag = params.DestinationTag
  }

  if (params.InvoiceID !== undefined) {
    transaction.InvoiceID = params.InvoiceID
  }

  if (params.Fee !== undefined) {
    transaction.Fee = params.Fee
  }

  if (params.Sequence !== undefined) {
    transaction.Sequence = params.Sequence
  }

  if (params.LastLedgerSequence !== undefined) {
    transaction.LastLedgerSequence = params.LastLedgerSequence
  }

  if (params.SourceTag !== undefined) {
    transaction.SourceTag = params.SourceTag
  }

  if (params.Memos && params.Memos.length > 0) {
    transaction.Memos = params.Memos.map(memo => createMemo(memo.data, memo.type, memo.format))
  }

  return transaction
}
