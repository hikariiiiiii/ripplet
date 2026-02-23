import type { CredentialCreate, CredentialAccept, CredentialDelete } from 'xrpl'
import type { BaseTransactionParams } from './types'

/**
 * Parameters for building a CredentialCreate transaction
 *
 * CredentialCreate creates a credential that attests to something about a specific account.
 * The issuer creates a credential for a subject account.
 *
 * @see https://xrpl.org/credentialcreate.html
 */
export interface CredentialCreateParams extends BaseTransactionParams {
  /** The subject of the credential (the account being attested about) */
  Subject: string
  /** The type of credential (will be hex encoded if not already hex) */
  CredentialType: string
  /** Optional expiration time in Ripple epoch time (seconds since 2000-01-01) */
  Expiration?: number
  /** Optional URI for additional information about the credential */
  URI?: string
}

/**
 * Parameters for building a CredentialAccept transaction
 *
 * CredentialAccept is used by the subject to accept a credential that was created for them.
 *
 * @see https://xrpl.org/credentialaccept.html
 */
export interface CredentialAcceptParams extends BaseTransactionParams {
  /** The issuer of the credential */
  Issuer: string
  /** The type of credential to accept */
  CredentialType: string
}

/**
 * Parameters for building a CredentialDelete transaction
 *
 * CredentialDelete removes a credential from the ledger.
 * - If the issuer is deleting, specify Subject
 * - If the subject is deleting, specify Issuer
 *
 * @see https://xrpl.org/credentialdelete.html
 */
export interface CredentialDeleteParams extends BaseTransactionParams {
  /** The type of credential to delete */
  CredentialType: string
  /** The subject of the credential (required if Account is the issuer) */
  Subject?: string
  /** The issuer of the credential (required if Account is the subject) */
  Issuer?: string
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
export function isValidCredentialAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

/**
 * Checks if a string is already hex encoded
 *
 * @param str - The string to check
 * @returns true if the string is hex encoded
 */
function isHexString(str: string): boolean {
  return /^[0-9A-Fa-f]+$/.test(str) && str.length % 2 === 0
}

/**
 * Converts a string to hex encoding if not already hex
 *
 * @param str - The string to convert
 * @returns The hex encoded string
 */
export function toHex(str: string): string {
  if (isHexString(str)) {
    return str.toUpperCase()
  }
  // Browser-compatible hex encoding using TextEncoder
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

/**
 * Validates CredentialCreate parameters
 *
 * @param params - The parameters to validate
 * @returns An object with valid flag and any errors
 */
export function validateCredentialCreateParams(params: CredentialCreateParams): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!params.Account) {
    errors.push('Account is required')
  } else if (!isValidCredentialAddress(params.Account)) {
    errors.push('Invalid Account address format')
  }

  if (!params.Subject) {
    errors.push('Subject is required')
  } else if (!isValidCredentialAddress(params.Subject)) {
    errors.push('Invalid Subject address format')
  }

  if (!params.CredentialType) {
    errors.push('CredentialType is required')
  }

  if (params.Account && params.Subject && params.Account === params.Subject) {
    errors.push('Account and Subject cannot be the same')
  }

  if (params.Expiration !== undefined && params.Expiration < 0) {
    errors.push('Expiration must be a positive number')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validates CredentialAccept parameters
 *
 * @param params - The parameters to validate
 * @returns An object with valid flag and any errors
 */
export function validateCredentialAcceptParams(params: CredentialAcceptParams): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!params.Account) {
    errors.push('Account is required')
  } else if (!isValidCredentialAddress(params.Account)) {
    errors.push('Invalid Account address format')
  }

  if (!params.Issuer) {
    errors.push('Issuer is required')
  } else if (!isValidCredentialAddress(params.Issuer)) {
    errors.push('Invalid Issuer address format')
  }

  if (!params.CredentialType) {
    errors.push('CredentialType is required')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Validates CredentialDelete parameters
 *
 * @param params - The parameters to validate
 * @returns An object with valid flag and any errors
 */
export function validateCredentialDeleteParams(params: CredentialDeleteParams): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!params.Account) {
    errors.push('Account is required')
  } else if (!isValidCredentialAddress(params.Account)) {
    errors.push('Invalid Account address format')
  }

  if (!params.CredentialType) {
    errors.push('CredentialType is required')
  }

  // Either Subject or Issuer must be provided (but not both can be omitted)
  if (!params.Subject && !params.Issuer) {
    errors.push('Either Subject or Issuer must be provided')
  }

  // Both cannot be provided
  if (params.Subject && params.Issuer) {
    errors.push('Only one of Subject or Issuer can be provided, not both')
  }

  if (params.Subject && !isValidCredentialAddress(params.Subject)) {
    errors.push('Invalid Subject address format')
  }

  if (params.Issuer && !isValidCredentialAddress(params.Issuer)) {
    errors.push('Invalid Issuer address format')
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Builds a CredentialCreate transaction
 *
 * Creates a credential that attests to something about a subject account.
 * The Account (issuer) creates a credential for the Subject.
 *
 * @param params - The CredentialCreate transaction parameters
 * @returns A CredentialCreate transaction object
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * const tx = buildCredentialCreate({
 *   Account: 'rIssuer123...', // The issuer
 *   Subject: 'rSubject456...', // The subject
 *   CredentialType: 'KYC', // Will be hex encoded
 * })
 * ```
 */
export function buildCredentialCreate(params: CredentialCreateParams): CredentialCreate {
  const validation = validateCredentialCreateParams(params)
  if (!validation.valid) {
    throw new Error(`Invalid CredentialCreate parameters: ${validation.errors.join(', ')}`)
  }

  const transaction: CredentialCreate = {
    TransactionType: 'CredentialCreate',
    Account: params.Account,
    Subject: params.Subject,
    CredentialType: toHex(params.CredentialType),
  }

  if (params.Expiration !== undefined) {
    transaction.Expiration = params.Expiration
  }

  if (params.URI !== undefined) {
    transaction.URI = params.URI
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

/**
 * Builds a CredentialAccept transaction
 *
 * Used by the subject to accept a credential that was created for them.
 *
 * @param params - The CredentialAccept transaction parameters
 * @returns A CredentialAccept transaction object
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * const tx = buildCredentialAccept({
 *   Account: 'rSubject456...', // The subject accepting
 *   Issuer: 'rIssuer123...', // The issuer
 *   CredentialType: 'KYC',
 * })
 * ```
 */
export function buildCredentialAccept(params: CredentialAcceptParams): CredentialAccept {
  const validation = validateCredentialAcceptParams(params)
  if (!validation.valid) {
    throw new Error(`Invalid CredentialAccept parameters: ${validation.errors.join(', ')}`)
  }

  const transaction: CredentialAccept = {
    TransactionType: 'CredentialAccept',
    Account: params.Account,
    Issuer: params.Issuer,
    CredentialType: toHex(params.CredentialType),
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

/**
 * Builds a CredentialDelete transaction
 *
 * Removes a credential from the ledger.
 * - If Account is the issuer, provide Subject
 * - If Account is the subject, provide Issuer
 *
 * @param params - The CredentialDelete transaction parameters
 * @returns A CredentialDelete transaction object
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * // Issuer deleting a credential
 * const tx = buildCredentialDelete({
 *   Account: 'rIssuer123...',
 *   CredentialType: 'KYC',
 *   Subject: 'rSubject456...',
 * })
 *
 * // Subject deleting their credential
 * const tx = buildCredentialDelete({
 *   Account: 'rSubject456...',
 *   CredentialType: 'KYC',
 *   Issuer: 'rIssuer123...',
 * })
 * ```
 */
export function buildCredentialDelete(params: CredentialDeleteParams): CredentialDelete {
  const validation = validateCredentialDeleteParams(params)
  if (!validation.valid) {
    throw new Error(`Invalid CredentialDelete parameters: ${validation.errors.join(', ')}`)
  }

  const transaction: CredentialDelete = {
    TransactionType: 'CredentialDelete',
    Account: params.Account,
    CredentialType: toHex(params.CredentialType),
  }

  if (params.Subject !== undefined) {
    transaction.Subject = params.Subject
  }

  if (params.Issuer !== undefined) {
    transaction.Issuer = params.Issuer
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
