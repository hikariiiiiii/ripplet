import type { TrustSet } from 'xrpl'
import type { BaseTransactionParams } from './types'

/**
 * TrustSet transaction flags
 * @see https://xrpl.org/trustset.html#trustset-flags
 */
export const TRUST_SET_FLAGS = {
  /** Authorize the other party to hold currency issued by this account (one-way, cannot be revoked) */
  tfSetfAuth: 0x00010000,        // 65536
  /** Enable NoRipple flag on the trust line */
  tfSetNoRipple: 0x00020000,     // 131072
  /** Disable NoRipple flag on the trust line */
  tfClearNoRipple: 0x00040000,   // 262144
  /** Enable Freeze flag on the trust line (issuer only) */
  tfSetFreeze: 0x00100000,       // 1048576
  /** Disable Freeze flag on the trust line (issuer only) */
  tfClearFreeze: 0x00200000,     // 2097152
  /** Enable DeepFreeze flag on the trust line (issuer only, requires Freeze first) */
  tfSetDeepFreeze: 0x00400000,   // 4194304
  /** Disable DeepFreeze flag on the trust line (issuer only) */
  tfClearDeepFreeze: 0x00800000, // 8388608
} as const

/** Type for TRUST_SET_FLAGS keys */
export type TrustSetFlagKey = keyof typeof TRUST_SET_FLAGS


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
  /** 
   * Optional flags for the trust line
   * Combine multiple flags using bitwise OR (e.g., TRUST_SET_FLAGS.tfSetNoRipple | TRUST_SET_FLAGS.tfSetFreeze)
   * Note: tfSetNoRipple and tfClearNoRipple are mutually exclusive
   * Note: tfSetFreeze and tfClearFreeze are mutually exclusive
   * Note: tfSetDeepFreeze and tfClearDeepFreeze are mutually exclusive
   */
  Flags?: number
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

  // Validate Flags (optional)
  if (params.Flags !== undefined) {
    if (typeof params.Flags !== 'number' || params.Flags < 0) {
      errors.push('Flags must be a non-negative number')
    } else {
      // Check for mutually exclusive flag pairs
      const hasSetNoRipple = (params.Flags & TRUST_SET_FLAGS.tfSetNoRipple) !== 0
      const hasClearNoRipple = (params.Flags & TRUST_SET_FLAGS.tfClearNoRipple) !== 0
      const hasSetFreeze = (params.Flags & TRUST_SET_FLAGS.tfSetFreeze) !== 0
      const hasClearFreeze = (params.Flags & TRUST_SET_FLAGS.tfClearFreeze) !== 0
      const hasSetDeepFreeze = (params.Flags & TRUST_SET_FLAGS.tfSetDeepFreeze) !== 0
      const hasClearDeepFreeze = (params.Flags & TRUST_SET_FLAGS.tfClearDeepFreeze) !== 0

      if (hasSetNoRipple && hasClearNoRipple) {
        errors.push('tfSetNoRipple and tfClearNoRipple are mutually exclusive')
      }
      if (hasSetFreeze && hasClearFreeze) {
        errors.push('tfSetFreeze and tfClearFreeze are mutually exclusive')
      }
      if (hasSetDeepFreeze && hasClearDeepFreeze) {
        errors.push('tfSetDeepFreeze and tfClearDeepFreeze are mutually exclusive')
      }
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
  }
})

@example
// Create a trust line with NoRipple enabled
const tx = buildTrustSet({
  Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
  LimitAmount: {
    currency: 'USD',
    issuer: 'rG1QQv2nh2gr7RCZ1P8YYcBUKCCN633jCn',
    value: '1000'
  },
  Flags: TRUST_SET_FLAGS.tfSetNoRipple
})
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

  // Add Flags (optional)
  if (params.Flags !== undefined) {
    transaction.Flags = params.Flags
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
