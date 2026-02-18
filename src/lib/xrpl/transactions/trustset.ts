import type { TrustSet } from 'xrpl'
import type { BaseTransactionParams } from './types'

/**
 * Parameters for building a TrustSet transaction
 * 
 * TrustSet creates or modifies a trust line, which allows an account to hold
 * IOUs (issued currencies) from another account.
 * 
 * Special case: Setting LimitAmount.value to "0" will delete the trust line
 * (if the balance is also 0).
 * 
 * @see https://xrpl.org/trustset.html
 */
export interface TrustSetParams extends BaseTransactionParams {
  /** 
   * The trust line to create or modify
   * - currency: 3-letter ISO currency code (e.g., "USD") or 40-character hex
   * - issuer: The account that issues the currency
   * - value: The maximum amount of the currency to hold (set to "0" to delete)
   */
  LimitAmount: {
    currency: string
    issuer: string
    value: string
  }
  /** 
   * Incoming quality of the trust line (0-4294967295)
   * Higher values mean the holder values incoming funds less
   */
  QualityIn?: number
  /** 
   * Outgoing quality of the trust line (0-4294967295)
   * Higher values mean the holder values outgoing funds less
   */
  QualityOut?: number
}

/**
 * Validation result for TrustSet parameters
 */
export interface TrustSetValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validates a currency code
 * - Standard: 3-letter ISO code (e.g., "USD", "EUR")
 * - Custom: 40-character hexadecimal string
 * 
 * @param currency - The currency code to validate
 * @returns true if valid, false otherwise
 */
export function isValidCurrency(currency: string): boolean {
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
 * Validates an XRPL account address
 * - Must start with 'r' (classic address)
 * - Must be 25-35 characters long
 * - Must contain only base58 characters
 * 
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
export function isValidXRPLAddress(address: string): boolean {
  // Classic address starts with 'r' and is 25-35 characters
  // Uses base58 alphabet: 123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

/**
 * Validates a numeric string for limit amount
 * - Must be a valid number
 * - Must be >= 0
 * 
 * @param value - The value string to validate
 * @returns true if valid, false otherwise
 */
export function isValidLimitValue(value: string): boolean {
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0
}

/**
 * Validates TrustSet transaction parameters
 * 
 * @param params - The TrustSet parameters to validate
 * @returns Validation result with any errors found
 */
export function validateTrustSetParams(params: TrustSetParams): TrustSetValidationResult {
  const errors: string[] = []

  // Validate Account
  if (!params.Account) {
    errors.push('Account is required')
  } else if (!isValidXRPLAddress(params.Account)) {
    errors.push('Invalid Account address format')
  }

  // Validate LimitAmount
  if (!params.LimitAmount) {
    errors.push('LimitAmount is required')
  } else {
    // Validate currency
    if (!params.LimitAmount.currency) {
      errors.push('LimitAmount.currency is required')
    } else if (!isValidCurrency(params.LimitAmount.currency)) {
      errors.push(
        'LimitAmount.currency must be a 3-letter ISO code (e.g., "USD") or 40-character hex string'
      )
    }

    // Validate issuer
    if (!params.LimitAmount.issuer) {
      errors.push('LimitAmount.issuer is required')
    } else if (!isValidXRPLAddress(params.LimitAmount.issuer)) {
      errors.push('LimitAmount.issuer must be a valid XRPL address')
    }

    // Validate value (limit)
    if (!params.LimitAmount.value) {
      errors.push('LimitAmount.value is required')
    } else if (!isValidLimitValue(params.LimitAmount.value)) {
      errors.push('LimitAmount.value must be a valid number >= 0')
    }
  }

  // Validate QualityIn (optional)
  if (params.QualityIn !== undefined) {
    if (typeof params.QualityIn !== 'number' || params.QualityIn < 0 || params.QualityIn > 4294967295) {
      errors.push('QualityIn must be a number between 0 and 4294967295')
    }
  }

  // Validate QualityOut (optional)
  if (params.QualityOut !== undefined) {
    if (typeof params.QualityOut !== 'number' || params.QualityOut < 0 || params.QualityOut > 4294967295) {
      errors.push('QualityOut must be a number between 0 and 4294967295')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Builds a TrustSet transaction
 * 
 * Creates or modifies a trust line for holding issued currencies (IOUs).
 * 
 * Important notes:
 * - Setting LimitAmount.value to "0" will DELETE the trust line (if balance is 0)
 * - The issuer cannot be the same as the Account (cannot create trust line to self)
 * - QualityIn and QualityOut are optional and affect how the account values the currency
 * 
 * @param params - The TrustSet transaction parameters
 * @returns A TrustSet transaction object ready for signing and submission
 * @throws Error if validation fails
 * 
 * @example
 * // Create a trust line for 1000 USD issued by an issuer
 * const tx = buildTrustSet({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   LimitAmount: {
 *     currency: 'USD',
 *     issuer: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
 *     value: '1000'
 *   }
 * })
 * 
 * @example
 * // Delete a trust line by setting limit to 0
 * const tx = buildTrustSet({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   LimitAmount: {
 *     currency: 'USD',
 *     issuer: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
 *     value: '0'
 *   }
 * })
 */
export function buildTrustSet(params: TrustSetParams): TrustSet {
  // Validate parameters
  const validation = validateTrustSetParams(params)
  if (!validation.valid) {
    throw new Error(`Invalid TrustSet parameters: ${validation.errors.join(', ')}`)
  }

  // Check that issuer is not the same as account
  if (params.LimitAmount.issuer === params.Account) {
    throw new Error('Cannot create a trust line to yourself (issuer cannot be the same as Account)')
  }

  // Build the transaction
  const transaction: TrustSet = {
    TransactionType: 'TrustSet',
    Account: params.Account,
    LimitAmount: {
      currency: params.LimitAmount.currency,
      issuer: params.LimitAmount.issuer,
      value: params.LimitAmount.value,
    },
  }

  // Add optional fields
  if (params.QualityIn !== undefined) {
    transaction.QualityIn = params.QualityIn
  }

  if (params.QualityOut !== undefined) {
    transaction.QualityOut = params.QualityOut
  }

  // Add optional base transaction fields
  if (params.Fee !== undefined) {
    transaction.Fee = params.Fee
  }

  if (params.Sequence !== undefined) {
    transaction.Sequence = params.Sequence
  }

  if (params.LastLedgerSequence !== undefined) {
    transaction.LastLedgerSequence = params.LastLedgerSequence
  }

  if (params.Memos !== undefined) {
    transaction.Memos = params.Memos
  }

  if (params.SourceTag !== undefined) {
    transaction.SourceTag = params.SourceTag
  }

  return transaction
}
