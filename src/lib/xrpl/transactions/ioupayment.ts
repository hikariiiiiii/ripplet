import type { Payment } from 'xrpl'
import { isValidClassicAddress } from 'xrpl'
import { createMemo } from './builder'

export interface IOUAmount {
  currency: string
  issuer: string
  value: string
}

export interface IOUPaymentParams {
  Account: string
  Destination: string
  Amount: IOUAmount
  DestinationTag?: number
  Memos?: { data: string }[]
}

export function buildIOUPayment(params: IOUAmount & {
  Account: string
  Destination: string
  DestinationTag?: number
  Memos?: { data: string }[]
}): Payment {
  const { currency, issuer, value, Account, Destination, DestinationTag, Memos } = params

  // Validation
  if (!Account || !isValidClassicAddress(Account)) {
    throw new Error('Invalid Account address')
  }
  if (!Destination || !isValidClassicAddress(Destination)) {
    throw new Error('Invalid Destination address')
  }
  if (!currency || currency.length < 3 || currency.length > 40) {
    throw new Error('Invalid currency code')
  }
  if (!issuer || !isValidClassicAddress(issuer)) {
    throw new Error('Invalid Issuer address')
  }
  if (!value || parseFloat(value) <= 0) {
    throw new Error('Amount must be a positive number')
  }

  const transaction: Payment = {
    TransactionType: 'Payment',
    Account,
    Destination,
    Amount: {
      currency: currency.toUpperCase(),
      issuer,
      value,
    },
  }

  if (DestinationTag !== undefined) {
    transaction.DestinationTag = DestinationTag
  }

  if (Memos && Memos.length > 0) {
    transaction.Memos = Memos.map(memo => createMemo(memo.data))
  }

  return transaction
}
