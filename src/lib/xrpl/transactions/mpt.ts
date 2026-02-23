import type {
  MPTokenIssuanceCreate,
  MPTokenIssuanceSet,
  MPTokenIssuanceDestroy,
  MPTokenAuthorize,
} from 'xrpl';
import type { BaseTransactionParams } from './types';

/**
 * MPT Issuance Flags
 * @see https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate
 *
 * These flags control the behavior and properties of MPT issuances.
 */
export const MPT_ISSUANCE_FLAGS = {
  /** Allow holders to transfer the token to each other */
  lsfMPTCanTransfer: 0x00000001,
  /** Require issuer authorization before holders can hold the token */
  lsfMPTRequireAuth: 0x00000002,
  /** Allow issuer to freeze/unfreeze individual holder balances */
  lsfMPTCanLock: 0x00000004,
  /** Allow issuer to claw back tokens from holders */
  lsfMPTCanClawback: 0x00000008,
  /** Allow trading in the DEX (not currently implemented) */
  lsfMPTCanTrade: 0x00000010,
  /** Allow placing tokens in escrow */
  lsfMPTCanEscrow: 0x00000020,
} as const;

/**
 * Parameters for building an MPTokenIssuanceCreate transaction
 */
export interface MPTokenIssuanceCreateParams extends BaseTransactionParams {
  /** Asset scale (decimal places), 0-19 */
  AssetScale?: number;
  /** Maximum quantity that can be issued (0 = unlimited) */
  MaximumAmount?: string;
  /** Transfer fee in basis points (0-500000 = 0%-50%) */
  TransferFee?: number;
  /** Issuer-defined metadata (up to 1024 bytes) */
  MPTokenMetadata?: string;
  /** Flags controlling MPT behavior */
  Flags?: number;
}

/**
 * Parameters for building an MPTokenIssuanceSet transaction
 */
export interface MPTokenIssuanceSetParams extends BaseTransactionParams {
  /** The MPT issuance ID to modify */
  MPTokenIssuanceID: string;
  /** New flags to set (only certain flags can be changed) */
  Flags?: number;
}

/**
 * Parameters for building an MPTokenIssuanceDestroy transaction
 */
export interface MPTokenIssuanceDestroyParams extends BaseTransactionParams {
  /** The MPT issuance ID to destroy */
  MPTokenIssuanceID: string;
}

/**
 * Parameters for building an MPTokenAuthorize transaction
 */
export interface MPTokenAuthorizeParams extends BaseTransactionParams {
  /** The MPT issuance ID to authorize/unauthorize */
  MPTokenIssuanceID: string;
  /** The account to authorize/unauthorize (optional, for issuer use) */
  Holder?: string;
  /** Flags: tfMPTUnauthorize to remove authorization */
  Flags?: number;
}

/**
 * MPT Authorize Flags
 */
export const MPT_AUTHORIZE_FLAGS = {
  /** Remove authorization (unauthorize holder) */
  tfMPTUnauthorize: 0x00000001,
} as const;

/**
 * Validates an MPT issuance ID format
 * MPT issuance IDs are 192-bit numbers represented as 48-character hex strings
 *
 * @param id - The MPT issuance ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidMPTIssuanceID(id: string): boolean {
  return /^[0-9A-Fa-f]{48}$/.test(id);
}

/**
 * Validates asset scale (decimal places)
 * Must be between 0 and 19 inclusive
 *
 * @param scale - The asset scale to validate
 * @returns true if valid, false otherwise
 */
export function isValidAssetScale(scale: number): boolean {
  return Number.isInteger(scale) && scale >= 0 && scale <= 19;
}

/**
 * Validates transfer fee
 * Must be between 0 and 500000 (0% to 50%) in basis points
 *
 * @param fee - The transfer fee to validate
 * @returns true if valid, false otherwise
 */
export function isValidTransferFee(fee: number): boolean {
  return Number.isInteger(fee) && fee >= 0 && fee <= 500000;
}

/**
 * Validates maximum amount
 * Must be a non-negative integer string
 *
 * @param amount - The maximum amount to validate
 * @returns true if valid, false otherwise
 */
export function isValidMaximumAmount(amount: string): boolean {
  const num = BigInt(amount);
  return num >= BigInt(0);
}

/**
 * Validates XRPL address
 *
 * @param address - The address to validate
 * @returns true if valid, false otherwise
 */
export function isValidXRPLAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address);
}

/**
 * Builds an MPTokenIssuanceCreate transaction
 *
 * Creates a new Multi-Purpose Token issuance on the XRPL.
 *
 * @param params - The parameters for the MPTokenIssuanceCreate transaction
 * @returns An MPTokenIssuanceCreate transaction object
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * // Create a basic MPT with 6 decimal places
 * const tx = buildMPTokenIssuanceCreate({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   AssetScale: 6,
 *   Flags: MPT_ISSUANCE_FLAGS.lsfMPTCanTransfer,
 * })
 *
 * // Create an MPT with supply cap and transfer fee
 * const tx = buildMPTokenIssuanceCreate({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   AssetScale: 2,
 *   MaximumAmount: '1000000000', // 10 million tokens
 *   TransferFee: 5000, // 0.5% fee
 *   Flags: MPT_ISSUANCE_FLAGS.lsfMPTCanTransfer | MPT_ISSUANCE_FLAGS.lsfMPTCanClawback,
 * })
 * ```
 */
export function buildMPTokenIssuanceCreate(
  params: MPTokenIssuanceCreateParams
): MPTokenIssuanceCreate {
  const {
    Account,
    AssetScale,
    MaximumAmount,
    TransferFee,
    MPTokenMetadata,
    Flags,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params;

  // Validate AssetScale
  if (AssetScale !== undefined && !isValidAssetScale(AssetScale)) {
    throw new Error('AssetScale must be an integer between 0 and 19');
  }

  // Validate TransferFee
  if (TransferFee !== undefined && !isValidTransferFee(TransferFee)) {
    throw new Error('TransferFee must be an integer between 0 and 500000 (0% to 50%)');
  }

  // Validate MaximumAmount
  if (MaximumAmount !== undefined) {
    try {
      if (!isValidMaximumAmount(MaximumAmount)) {
        throw new Error('Invalid maximum amount');
      }
    } catch {
      throw new Error('MaximumAmount must be a valid non-negative integer string');
    }
  }

  // Validate MPTokenMetadata length
  if (MPTokenMetadata !== undefined && MPTokenMetadata.length > 1024) {
    throw new Error('MPTokenMetadata cannot exceed 1024 bytes');
  }

  const transaction: MPTokenIssuanceCreate = {
    TransactionType: 'MPTokenIssuanceCreate',
    Account,
  };

  // Add optional fields
  if (AssetScale !== undefined) {
    transaction.AssetScale = AssetScale;
  }

  if (MaximumAmount !== undefined) {
    transaction.MaximumAmount = MaximumAmount;
  }

  if (TransferFee !== undefined) {
    transaction.TransferFee = TransferFee;
  }

  if (MPTokenMetadata !== undefined) {
    transaction.MPTokenMetadata = MPTokenMetadata;
  }

  if (Flags !== undefined) {
    transaction.Flags = Flags;
  }

  // Add base transaction fields
  if (Fee !== undefined) {
    transaction.Fee = Fee;
  }

  if (Sequence !== undefined) {
    transaction.Sequence = Sequence;
  }

  if (LastLedgerSequence !== undefined) {
    transaction.LastLedgerSequence = LastLedgerSequence;
  }

  if (Memos !== undefined) {
    transaction.Memos = Memos;
  }

  if (Signers !== undefined) {
    transaction.Signers = Signers;
  }

  if (SigningPubKey !== undefined) {
    transaction.SigningPubKey = SigningPubKey;
  }

  if (SourceTag !== undefined) {
    transaction.SourceTag = SourceTag;
  }

  if (TxnSignature !== undefined) {
    transaction.TxnSignature = TxnSignature;
  }

  return transaction;
}

/**
 * Builds an MPTokenIssuanceSet transaction
 *
 * Modifies the flags of an existing MPT issuance.
 * Note: Only certain flags can be changed after creation.
 *
 * @param params - The parameters for the MPTokenIssuanceSet transaction
 * @returns An MPTokenIssuanceSet transaction object
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * // Enable locking on an MPT issuance
 * const tx = buildMPTokenIssuanceSet({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   MPTokenIssuanceID: '00070C4495F14B0E44F78A264E41713C64B5F89242540EE255534400000000000000',
 *   Flags: MPT_ISSUANCE_FLAGS.lsfMPTCanLock,
 * })
 * ```
 */
export function buildMPTokenIssuanceSet(
  params: MPTokenIssuanceSetParams
): MPTokenIssuanceSet {
  const {
    Account,
    MPTokenIssuanceID,
    Flags,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params;

  // Validate MPTokenIssuanceID
  if (!isValidMPTIssuanceID(MPTokenIssuanceID)) {
    throw new Error('MPTokenIssuanceID must be a 48-character hexadecimal string');
  }

  const transaction: MPTokenIssuanceSet = {
    TransactionType: 'MPTokenIssuanceSet',
    Account,
    MPTokenIssuanceID,
  };

  // Add optional fields
  if (Flags !== undefined) {
    transaction.Flags = Flags;
  }

  // Add base transaction fields
  if (Fee !== undefined) {
    transaction.Fee = Fee;
  }

  if (Sequence !== undefined) {
    transaction.Sequence = Sequence;
  }

  if (LastLedgerSequence !== undefined) {
    transaction.LastLedgerSequence = LastLedgerSequence;
  }

  if (Memos !== undefined) {
    transaction.Memos = Memos;
  }

  if (Signers !== undefined) {
    transaction.Signers = Signers;
  }

  if (SigningPubKey !== undefined) {
    transaction.SigningPubKey = SigningPubKey;
  }

  if (SourceTag !== undefined) {
    transaction.SourceTag = SourceTag;
  }

  if (TxnSignature !== undefined) {
    transaction.TxnSignature = TxnSignature;
  }

  return transaction;
}

/**
 * Builds an MPTokenIssuanceDestroy transaction
 *
 * Destroys an MPT issuance. Can only be done by the issuer when no tokens
 * are held by any accounts (all tokens have been burned).
 *
 * @param params - The parameters for the MPTokenIssuanceDestroy transaction
 * @returns An MPTokenIssuanceDestroy transaction object
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * const tx = buildMPTokenIssuanceDestroy({
 *   Account: 'rN7n3473SaZBCG4dFL83w7a1RXtXtbk2D9',
 *   MPTokenIssuanceID: '00070C4495F14B0E44F78A264E41713C64B5F89242540EE255534400000000000000',
 * })
 * ```
 */
export function buildMPTokenIssuanceDestroy(
  params: MPTokenIssuanceDestroyParams
): MPTokenIssuanceDestroy {
  const {
    Account,
    MPTokenIssuanceID,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params;

  // Validate MPTokenIssuanceID
  if (!isValidMPTIssuanceID(MPTokenIssuanceID)) {
    throw new Error('MPTokenIssuanceID must be a 48-character hexadecimal string');
  }

  const transaction: MPTokenIssuanceDestroy = {
    TransactionType: 'MPTokenIssuanceDestroy',
    Account,
    MPTokenIssuanceID,
  };

  // Add base transaction fields
  if (Fee !== undefined) {
    transaction.Fee = Fee;
  }

  if (Sequence !== undefined) {
    transaction.Sequence = Sequence;
  }

  if (LastLedgerSequence !== undefined) {
    transaction.LastLedgerSequence = LastLedgerSequence;
  }

  if (Memos !== undefined) {
    transaction.Memos = Memos;
  }

  if (Signers !== undefined) {
    transaction.Signers = Signers;
  }

  if (SigningPubKey !== undefined) {
    transaction.SigningPubKey = SigningPubKey;
  }

  if (SourceTag !== undefined) {
    transaction.SourceTag = SourceTag;
  }

  if (TxnSignature !== undefined) {
    transaction.TxnSignature = TxnSignature;
  }

  return transaction;
}

/**
 * Builds an MPTokenAuthorize transaction
 *
 * Authorizes or unauthorizes a holder for an MPT issuance.
 * - Issuers use this to approve/revoke holder permissions
 * - Holders use this to opt-in to holding an MPT
 *
 * @param params - The parameters for the MPTokenAuthorize transaction
 * @returns An MPTokenAuthorize transaction object
 * @throws Error if validation fails
 *
 * @example
 * ```typescript
 * // Holder opts in to hold an MPT
 * const tx = buildMPTokenAuthorize({
 *   Account: 'rHolderAddress...',
 *   MPTokenIssuanceID: '00070C4495F14B0E44F78A264E41713C64B5F89242540EE255534400000000000000',
 * })
 *
 * // Issuer authorizes a specific holder
 * const tx = buildMPTokenAuthorize({
 *   Account: 'rIssuerAddress...',
 *   MPTokenIssuanceID: '00070C4495F14B0E44F78A264E41713C64B5F89242540EE255534400000000000000',
 *   Holder: 'rHolderAddress...',
 * })
 *
 * // Issuer revokes holder authorization
 * const tx = buildMPTokenAuthorize({
 *   Account: 'rIssuerAddress...',
 *   MPTokenIssuanceID: '00070C4495F14B0E44F78A264E41713C64B5F89242540EE255534400000000000000',
 *   Holder: 'rHolderAddress...',
 *   Flags: MPT_AUTHORIZE_FLAGS.tfMPTUnauthorize,
 * })
 * ```
 */
export function buildMPTokenAuthorize(
  params: MPTokenAuthorizeParams
): MPTokenAuthorize {
  const {
    Account,
    MPTokenIssuanceID,
    Holder,
    Flags,
    Fee,
    Sequence,
    LastLedgerSequence,
    Memos,
    Signers,
    SigningPubKey,
    SourceTag,
    TxnSignature,
  } = params;

  // Validate MPTokenIssuanceID
  if (!isValidMPTIssuanceID(MPTokenIssuanceID)) {
    throw new Error('MPTokenIssuanceID must be a 48-character hexadecimal string');
  }

  // Validate Holder address if provided
  if (Holder !== undefined && !isValidXRPLAddress(Holder)) {
    throw new Error('Holder must be a valid XRPL address');
  }

  const transaction: MPTokenAuthorize = {
    TransactionType: 'MPTokenAuthorize',
    Account,
    MPTokenIssuanceID,
  };

  // Add optional fields
  if (Holder !== undefined) {
    transaction.Holder = Holder;
  }

  if (Flags !== undefined) {
    transaction.Flags = Flags;
  }

  // Add base transaction fields
  if (Fee !== undefined) {
    transaction.Fee = Fee;
  }

  if (Sequence !== undefined) {
    transaction.Sequence = Sequence;
  }

  if (LastLedgerSequence !== undefined) {
    transaction.LastLedgerSequence = LastLedgerSequence;
  }

  if (Memos !== undefined) {
    transaction.Memos = Memos;
  }

  if (Signers !== undefined) {
    transaction.Signers = Signers;
  }

  if (SigningPubKey !== undefined) {
    transaction.SigningPubKey = SigningPubKey;
  }

  if (SourceTag !== undefined) {
    transaction.SourceTag = SourceTag;
  }

  if (TxnSignature !== undefined) {
    transaction.TxnSignature = TxnSignature;
  }

  return transaction;
}
