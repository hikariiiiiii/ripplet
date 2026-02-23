import type { OfferCreate, OfferCancel } from 'xrpl'
import type { BaseTransactionParams } from './types'

/**
 * Validates an XRPL account address format
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
export function isValidOfferAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

/**
 * Validates a currency code
 * - Standard: 3-letter ISO code (e.g., "USD", "EUR")
 * - Custom: 40-character hexadecimal string
 * 
 * @param currency - The currency code to validate
 * @returns true if valid, false otherwise
 */
export function isValidOfferCurrency(currency: string): boolean {
  // Standard 3-letter ISO currency code
  if (/^[A-Z]{3}$/.test(currency)) {
    return true
  }
  
  // Custom currency: 40-character hex string
  if (/^[0-9A-Fa-f]{40}$/.test(currency)) {
    return true
  }
  
  return false
}

/**
 * Amount type for offers - can be XRP (string in drops) or IOU object
 */
export type OfferAmount = string | { currency: string; issuer: string; value: string }

/**
 * Parameters for building an OfferCreate transaction
 * 
 * OfferCreate creates a new offer to exchange currency.
 * It can create a buy or sell offer for XRP or IOUs.
 * 
 * @see https://xrpl.org/offercreate.html
 */
export interface OfferCreateParams extends BaseTransactionParams {
  /**
   * The amount the account is willing to receive.
   * For XRP: string in drops (e.g., "1000000" for 1 XRP)
   * For IOU: { currency, issuer, value }
   */
  TakerGets: OfferAmount
  /**
   * The amount the account is willing to pay.
   * For XRP: string in drops
   * For IOU: { currency, issuer, value }
   */
  TakerPays: OfferAmount
  /**
   * Time after which the offer is no longer valid (ledger index)
   */
  Expiration?: number
  /**
   * Sequence number of the offer to replace (for updating an existing offer)
   */
  OfferSequence?: number
}

/**
 * Validates OfferCreate parameters
 * 
 * @param params - The OfferCreate parameters to validate
 * @returns Array of error messages, empty if valid
 */
export function validateOfferCreateParams(params: OfferCreateParams): string[] {
  const errors: string[] = []

  if (!params.Account) {
    errors.push('Account is required')
  } else if (!isValidOfferAddress(params.Account)) {
    errors.push('Invalid Account address format')
  }

  // Validate TakerGets
  if (!params.TakerGets) {
    errors.push('TakerGets is required')
  } else if (typeof params.TakerGets !== 'string') {
    if (!params.TakerGets.currency || !isValidOfferCurrency(params.TakerGets.currency)) {
      errors.push('TakerGets.currency must be a valid 3-letter ISO code or 40-character hex')
    }
    if (!params.TakerGets.issuer || !isValidOfferAddress(params.TakerGets.issuer)) {
      errors.push('TakerGets.issuer must be a valid XRPL address')
    }
    if (!params.TakerGets.value) {
      errors.push('TakerGets.value is required')
    } else {
      const value = parseFloat(params.TakerGets.value)
      if (isNaN(value) || value <= 0) {
        errors.push('TakerGets.value must be a positive number')
      }
    }
  } else {
    // XRP amount validation (should be positive integer in drops)
    const drops = parseInt(params.TakerGets, 10)
    if (isNaN(drops) || drops <= 0) {
      errors.push('TakerGets XRP amount must be a positive integer in drops')
    }
  }

  // Validate TakerPays
  if (!params.TakerPays) {
    errors.push('TakerPays is required')
  } else if (typeof params.TakerPays !== 'string') {
    if (!params.TakerPays.currency || !isValidOfferCurrency(params.TakerPays.currency)) {
      errors.push('TakerPays.currency must be a valid 3-letter ISO code or 40-character hex')
    }
    if (!params.TakerPays.issuer || !isValidOfferAddress(params.TakerPays.issuer)) {
      errors.push('TakerPays.issuer must be a valid XRPL address')
    }
    if (!params.TakerPays.value) {
      errors.push('TakerPays.value is required')
    } else {
      const value = parseFloat(params.TakerPays.value)
      if (isNaN(value) || value <= 0) {
        errors.push('TakerPays.value must be a positive number')
      }
    }
  } else {
    // XRP amount validation
    const drops = parseInt(params.TakerPays, 10)
    if (isNaN(drops) || drops <= 0) {
      errors.push('TakerPays XRP amount must be a positive integer in drops')
    }
  }

  // Validate Expiration if provided
  if (params.Expiration !== undefined) {
    if (!Number.isInteger(params.Expiration) || params.Expiration < 0) {
      errors.push('Expiration must be a non-negative integer (ledger index)')
    }
  }

  // Validate OfferSequence if provided
  if (params.OfferSequence !== undefined) {
    if (!Number.isInteger(params.OfferSequence) || params.OfferSequence < 0) {
      errors.push('OfferSequence must be a non-negative integer')
    }
  }

  return errors
}

/**
 * Builds an OfferCreate transaction
 * 
 * Creates an offer to exchange currency on the XRPL decentralized exchange.
 * The offer can be for buying or selling XRP or IOUs.
 * 
 * @param params - The OfferCreate transaction parameters
 * @returns An OfferCreate transaction object
 * @throws Error if validation fails
 * 
 * @example
 * // Create an offer to sell 100 USD for XRP
 * const tx = buildOfferCreate({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   TakerGets: { currency: 'USD', issuer: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn', value: '100' },
 *   TakerPays: '100000000', // 100 XRP in drops
 * })
 * 
 * @example
 * // Create an offer to buy USD with XRP
 * const tx = buildOfferCreate({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   TakerGets: '100000000', // 100 XRP in drops
 *   TakerPays: { currency: 'USD', issuer: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn', value: '100' },
 * })
 */
export function buildOfferCreate(params: OfferCreateParams): OfferCreate {
  const errors = validateOfferCreateParams(params)
  if (errors.length > 0) {
    throw new Error(`Invalid OfferCreate parameters: ${errors.join('; ')}`)
  }

  const {
    Account,
    TakerGets,
    TakerPays,
    Expiration,
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

  const transaction: OfferCreate = {
    TransactionType: 'OfferCreate',
    Account,
    TakerGets,
    TakerPays,
  }

  if (Expiration !== undefined) transaction.Expiration = Expiration
  if (OfferSequence !== undefined) transaction.OfferSequence = OfferSequence
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

/**
 * Parameters for building an OfferCancel transaction
 * 
 * OfferCancel cancels an existing offer created by the account.
 * 
 * @see https://xrpl.org/offercancel.html
 */
export interface OfferCancelParams extends BaseTransactionParams {
  /**
   * The sequence number of the offer to cancel
   */
  OfferSequence: number
}

/**
 * Validates OfferCancel parameters
 * 
 * @param params - The OfferCancel parameters to validate
 * @returns Array of error messages, empty if valid
 */
export function validateOfferCancelParams(params: OfferCancelParams): string[] {
  const errors: string[] = []

  if (!params.Account) {
    errors.push('Account is required')
  } else if (!isValidOfferAddress(params.Account)) {
    errors.push('Invalid Account address format')
  }

  if (params.OfferSequence === undefined) {
    errors.push('OfferSequence is required')
  } else if (!Number.isInteger(params.OfferSequence) || params.OfferSequence < 0) {
    errors.push('OfferSequence must be a non-negative integer')
  }

  return errors
}

/**
 * Builds an OfferCancel transaction
 * 
 * Cancels an existing offer on the XRPL decentralized exchange.
 * 
 * @param params - The OfferCancel transaction parameters
 * @returns An OfferCancel transaction object
 * @throws Error if validation fails
 * 
 * @example
 * const tx = buildOfferCancel({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   OfferSequence: 12345,
 * })
 */
export function buildOfferCancel(params: OfferCancelParams): OfferCancel {
  const errors = validateOfferCancelParams(params)
  if (errors.length > 0) {
    throw new Error(`Invalid OfferCancel parameters: ${errors.join('; ')}`)
  }

  const {
    Account,
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

  const transaction: OfferCancel = {
    TransactionType: 'OfferCancel',
    Account,
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
