import type { AccountDelete } from 'xrpl'
import type { BaseTransactionParams } from './types'

/**
 * Parameters for building an AccountDelete transaction
 */
export interface AccountDeleteParams extends BaseTransactionParams {
  /** The destination account to receive the remaining XRP balance */
  Destination: string
  /** Destination tag to identify the reason for the transfer */
  DestinationTag?: number
}

/**
 * Validates an XRPL account address format
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
function isValidAddress(address: string): boolean {
  // XRPL addresses start with 'r' and are 25-35 characters long
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

/**
 * Builds an AccountDelete transaction
 *
 * AccountDelete deletes an account and transfers any remaining XRP to a destination account.
 *
 * WARNING: This transaction can only be executed if:
 * - The account has no trust lines (except those holding zero balance)
 * - The account has no objects (tickets, payment channels, escrows, etc.)
 * - The account sequence number is at least 256 less than the current ledger sequence
 *   OR the account's owner count is zero
 *
 * @param params - The parameters for the AccountDelete transaction
 * @returns An AccountDelete transaction object
 * @throws Error if Destination is invalid
 *
 * @see https://xrpl.org/accountdelete.html
 *
 * @example
 * ```typescript
 * const tx = buildAccountDelete({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
 * })
 * ```
 */
export function buildAccountDelete(params: AccountDeleteParams): AccountDelete {
  const {
    Account,
    Destination,
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

  // Validate Destination address
  if (!isValidAddress(Destination)) {
    throw new Error('Invalid destination address format')
  }

  // Validate DestinationTag if provided
  if (DestinationTag !== undefined) {
    if (!Number.isInteger(DestinationTag) || DestinationTag < 0 || DestinationTag > 4294967295) {
      throw new Error('DestinationTag must be an integer between 0 and 4294967295')
    }
  }

  const transaction: AccountDelete = {
    TransactionType: 'AccountDelete',
    Account,
    Destination,
  }

  // Add optional fields
  if (DestinationTag !== undefined) {
    transaction.DestinationTag = DestinationTag
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
