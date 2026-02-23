import type { AccountSet } from 'xrpl'
import type { BaseTransactionParams } from './types'

/**
 * Account Set Flags
 * @see https://xrpl.org/accountset.html#accountset-flags
 *
 * These flags can be set or cleared using SetFlag/ClearFlag fields.
 * Each flag has a numeric value that corresponds to a specific account setting.
 */
export const ACCOUNT_FLAGS = {
  /** Require destination tag on incoming payments (value: 1) */
  asfRequireDestTag: 1,
  /** Require authorization to hold IOUs (value: 2) */
  asfRequireAuth: 2,
  /** Disallow XRP payments from strangers (value: 3) */
  asfDisallowXRP: 3,
  /** Enable rippling on trust lines by default (value: 8) */
  asfDefaultRipple: 8,
} as const

/**
 * Parameters for building an AccountSet transaction
 */
export interface AccountSetParams extends BaseTransactionParams {
  /** Flag to set on the account (use ACCOUNT_FLAGS values) */
  SetFlag?: number
  /** Flag to clear from the account (use ACCOUNT_FLAGS values) */
  ClearFlag?: number
  /** Domain name for the account (will be hex encoded) */
  Domain?: string
  /**
   * Transfer rate for issued currencies in billionths.
   * 0 = no fee, 1000000000 = 0% fee, 2000000000 = 100% fee
   * Range: 0 to 2000000000 (inclusive)
   */
  TransferRate?: number
}

/**
 * Validates TransferRate value
 * @param rate - The transfer rate to validate
 * @returns true if valid, false otherwise
 */
function isValidTransferRate(rate: number): boolean {
  return Number.isInteger(rate) && rate >= 0 && rate <= 2000000000
}

/**
 * Builds an AccountSet transaction
 *
 * AccountSet modifies an account's settings, such as flags, domain, and transfer rate.
 *
 * @param params - The parameters for the AccountSet transaction
 * @returns An AccountSet transaction object
 * @throws Error if TransferRate is out of valid range
 *
 * @example
 * ```typescript
 * // Enable rippling on trust lines
 * const tx = buildAccountSet({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   SetFlag: ACCOUNT_FLAGS.asfDefaultRipple,
 * })
 *
 * // Set domain and transfer rate
 * const tx = buildAccountSet({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   Domain: 'example.com',
 *   TransferRate: 1000000000, // 0% fee
 * })
 * ```
 */
export function buildAccountSet(params: AccountSetParams): AccountSet {
  const {
    Account,
    SetFlag,
    ClearFlag,
    Domain,
    TransferRate,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params

  // Validate TransferRate if provided
  if (TransferRate !== undefined && !isValidTransferRate(TransferRate)) {
    throw new Error(
      'TransferRate must be an integer between 0 and 2000000000 (inclusive)',
    )
  }

  // Validate that SetFlag and ClearFlag are not the same
  if (SetFlag !== undefined && ClearFlag !== undefined && SetFlag === ClearFlag) {
    throw new Error('SetFlag and ClearFlag cannot be the same value')
  }

  const transaction: AccountSet = {
    TransactionType: 'AccountSet',
    Account,
  }

  // Add optional fields
  if (SetFlag !== undefined) {
    transaction.SetFlag = SetFlag
  }

  if (ClearFlag !== undefined) {
    transaction.ClearFlag = ClearFlag
  }

  if (Domain !== undefined) {
    // Hex encode the domain (browser-compatible)
    const encoder = new TextEncoder()
    const bytes = encoder.encode(Domain)
    transaction.Domain = Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  }

  if (TransferRate !== undefined) {
    transaction.TransferRate = TransferRate
  }

  // Add base transaction fields
  if (Fee !== undefined) {
    transaction.Fee = Fee
  }

  if (Sequence !== undefined) {
    transaction.Sequence = Sequence
  }

  if (LastLedgerSequence !== undefined) {
    transaction.LastLedgerSequence = LastLedgerSequence
  }

  if (Memos !== undefined) {
    transaction.Memos = Memos
  }

  if (Signers !== undefined) {
    transaction.Signers = Signers
  }

  if (SigningPubKey !== undefined) {
    transaction.SigningPubKey = SigningPubKey
  }

  if (SourceTag !== undefined) {
    transaction.SourceTag = SourceTag
  }

  if (TxnSignature !== undefined) {
    transaction.TxnSignature = TxnSignature
  }

  return transaction
}
