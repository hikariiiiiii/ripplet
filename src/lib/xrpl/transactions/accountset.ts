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
  /** Disallow use of master key (value: 4) */
  asfDisableMaster: 4,
  /** Track ID of this account's most recent transaction (value: 5) */
  asfAccountTxnID: 5,
  /** Permanently give up the ability to freeze individual trust lines (value: 6) */
  asfNoFreeze: 6,
  /** Freeze all trust lines (value: 7) */
  asfGlobalFreeze: 7,
  /** Enable rippling on trust lines by default (value: 8) */
  asfDefaultRipple: 8,
  /** Block incoming payments from non-authorized accounts (value: 9) */
  asfDepositAuth: 9,
  /** Allow specific NFToken minter (value: 10) */
  asfAuthorizedNFTokenMinter: 10,
  /** Block incoming NFToken offers (value: 12) */
  asfDisallowIncomingNFTokenOffer: 12,
  /** Block incoming checks (value: 13) */
  asfDisallowIncomingCheck: 13,
  /** Block incoming payment channels (value: 14) */
  asfDisallowIncomingPayChan: 14,
  /** Block incoming trust lines (value: 15) */
  asfDisallowIncomingTrustline: 15,
  /** Allow issuer to clawback tokens (value: 16) */
  asfAllowTrustLineClawback: 16,
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
  /**
   * Hash of an email address for this account.
   * 128-bit hex string (32 characters).
   */
  EmailHash?: string
  /**
   * Public key for sending encrypted messages.
   * 33 bytes hex string or empty string to clear.
   */
  MessageKey?: string
  /**
   * Account that is allowed to mint NFTs on this account's behalf.
   * Requires asfAuthorizedNFTokenMinter flag to be set.
   */
  NFTokenMinter?: string
  /**
   * Tick size for this account's offers.
   * 0 = no tick size, otherwise must be between 3 and 15.
   */
  TickSize?: number
}

/**
 * Validates TransferRate value
 * @param rate - The transfer rate to validate
 * @returns true if valid, false otherwise
 */
function isValidTransferRate(rate: number): boolean {
  // Special case: 0 means no fee (special value)
  if (rate === 0) return true
  // Otherwise must be between 1000000000 (0%) and 2000000000 (100%)
  return Number.isInteger(rate) && rate >= 1000000000 && rate <= 2000000000
}

/**
 * Validates TickSize value
 * @param tickSize - The tick size to validate
 * @returns true if valid, false otherwise
 */
function isValidTickSize(tickSize: number): boolean {
  // 0 means no tick size (clear the setting)
  if (tickSize === 0) return true
  // Otherwise must be between 3 and 15
  return Number.isInteger(tickSize) && tickSize >= 3 && tickSize <= 15
}

/**
 * Validates EmailHash format
 * @param emailHash - The email hash to validate
 * @returns true if valid, false otherwise
 */
function isValidEmailHash(emailHash: string): boolean {
  // Must be 128-bit hex string (32 hex characters)
  return /^[0-9A-Fa-f]{32}$/.test(emailHash)
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
    EmailHash,
    MessageKey,
    NFTokenMinter,
    TickSize,
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
      'TransferRate must be 0 or an integer between 1000000000 and 2000000000 (inclusive)',
    )
  }

  // Validate TickSize if provided
  if (TickSize !== undefined && !isValidTickSize(TickSize)) {
    throw new Error('TickSize must be 0 or an integer between 3 and 15 (inclusive)')
  }

  // Validate EmailHash if provided
  if (EmailHash !== undefined && !isValidEmailHash(EmailHash)) {
    throw new Error('EmailHash must be a 128-bit hex string (32 hex characters)')
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

  if (EmailHash !== undefined) {
    transaction.EmailHash = EmailHash.toUpperCase()
  }

  if (MessageKey !== undefined) {
    transaction.MessageKey = MessageKey
  }

  if (NFTokenMinter !== undefined) {
    transaction.NFTokenMinter = NFTokenMinter
  }

  if (TickSize !== undefined) {
    transaction.TickSize = TickSize
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