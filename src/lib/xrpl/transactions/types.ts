import type {
  Payment,
  TrustSet,
  AccountSet,
  Transaction,
  AccountDelete,
  SetRegularKey,
  SignerListSet,
  OfferCreate,
  OfferCancel,
  NFTokenMint,
  NFTokenBurn,
} from 'xrpl'

/**
 * XRPL Transaction Error Code Categories
 * @see https://xrpl.org/transaction-results.html
 */
export enum XRPLErrorCode {
  // Success
  SUCCESS = 'tesSUCCESS',

  // tel - Local errors (transaction failed locally before reaching ledger)
  TEL_CAN_NOT_QUEUE = 'telCAN_NOT_QUEUE',
  TEL_CAN_NOT_QUEUE_BALANCE = 'telCAN_NOT_QUEUE_BALANCE',
  TEL_CAN_NOT_QUEUE_FEE = 'telCAN_NOT_QUEUE_FEE',
  TEL_CAN_NOT_QUEUE_FULL = 'telCAN_NOT_QUEUE_FULL',
  TEL_FAILED_PROCESSING = 'telFAILED_PROCESSING',
  TEL_INSUF_FEE_P = 'telINSUF_FEE_P',
  TEL_NO_DST = 'telNO_DST',
  TEL_DST_IS_SRC = 'telDST_IS_SRC',

  // ter - Remote errors (transaction failed on ledger, retry may succeed)
  TER_RETRY = 'terRETRY',
  TER_FUNDS_SPENT = 'terFUNDS_SPENT',
  TER_INSUF_FEE_B = 'terINSUF_FEE_B',
  TER_INSUF_FEE_V = 'terINSUF_FEE_V',
  TER_LAST = 'terLAST',
  TER_NO_ACCOUNT = 'terNO_ACCOUNT',
  TER_NO_AUTH = 'terNO_AUTH',
  TER_NO_LINE = 'terNO_LINE',
  TER_OWNERS = 'terOWNERS',
  TER_PRE_SEQ = 'terPRE_SEQ',
  TER_PRE_TICK = 'terPRE_TICK',
  TER_Q_NO = 'terQ_NO',

  // tef - Fatal errors (transaction permanently failed)
  TEF_ALREADY = 'tefALREADY',
  TEF_BAD_ADD_AUTH = 'tefBAD_ADD_AUTH',
  TEF_BAD_AUTH = 'tefBAD_AUTH',
  TEF_BAD_AUTH_MASTER = 'tefBAD_AUTH_MASTER',
  TEF_BAD_LEDGER = 'tefBAD_LEDGER',
  TEF_BAD_QUORUM = 'tefBAD_QUORUM',
  TEF_BAD_SIGNATURE = 'tefBAD_SIGNATURE',
  TEF_CREATED = 'tefCREATED',
  TEF_EXCEPTION = 'tefEXCEPTION',
  TEF_FAILURE = 'tefFAILURE',
  TEF_INTERNAL = 'tefINTERNAL',
  TEF_INV_SIGNER = 'tefINV_SIGNER',
  TEF_MASTER_DISABLED = 'tefMASTER_DISABLED',
  TEF_MAX_LEDGER = 'tefMAX_LEDGER',
  TEF_NOT_MULTI_SIGNING = 'tefNOT_MULTI_SIGNING',
  TEF_PAST_SEQ = 'tefPAST_SEQ',
  TEF_TOO_BIG = 'tefTOO_BIG',
  TEF_WRONG_PRIOR = 'tefWRONG_PRIOR',
}

/**
 * Error category for transaction results
 */
export enum TransactionErrorCategory {
  SUCCESS = 'success',
  LOCAL_ERROR = 'local',      // tel codes - failed locally
  REMOTE_ERROR = 'remote',    // ter codes - failed on ledger, may retry
  FATAL_ERROR = 'fatal',      // tef codes - permanently failed
  UNKNOWN = 'unknown',
}

/**
 * Base parameters common to all XRPL transactions
 */
export interface BaseTransactionParams {
  /** The account sending the transaction */
  Account: string
  /** Transaction fee in drops (optional - will be autofilled if not provided) */
  Fee?: string
  /** Account sequence number (optional - will be autofilled if not provided) */
  Sequence?: number
  /** Last ledger sequence this transaction can appear in (optional - will be autofilled) */
  LastLedgerSequence?: number
  /** Array of memo objects */
  Memos?: Array<{
    Memo: {
      MemoType?: string
      MemoData?: string
      MemoFormat?: string
    }
  }>
  /** Array of signers for multi-signature transactions */
  Signers?: Array<{
    Signer: {
      Account: string
      SigningPubKey: string
      TxnSignature: string
    }
  }>
  /** Public key for signing */
  SigningPubKey?: string
  /** Source tag for the sender */
  SourceTag?: number
  /** Transaction signature */
  TxnSignature?: string
}

/**
 * Result of a transaction submission
 */
export interface TransactionSubmitResult {
  /** Transaction hash */
  hash: string
  /** Whether the transaction succeeded */
  success: boolean
  /** Result code (e.g., 'tesSUCCESS', 'tecUNFUNDED') */
  code: string
  /** Human-readable result message */
  message: string
  /** Error category */
  category: TransactionErrorCategory
  /** Ledger index where transaction was included */
  ledgerIndex?: number
  /** Raw result from XRPL */
  rawResult?: unknown
}

/**
 * Parameters for prepareTransaction function
 */
export interface PrepareTransactionParams {
  /** The transaction to prepare */
  transaction: Transaction
  /** Whether to autofill missing fields */
  autofill?: boolean
}

/**
 * Parameters for submitTransaction function
 */
export interface SubmitTransactionParams {
  /** The prepared transaction */
  transaction: Transaction
  /** Wallet to sign with (if not already signed) */
  wallet?: {
    sign: (tx: Transaction) => Transaction
    address: string
  }
  /** Whether to fail hard (don't retry on local errors) */
  failHard?: boolean
}

// Re-export transaction types from xrpl package
export type {
  Payment,
  TrustSet,
  AccountSet,
  Transaction,
  AccountDelete,
  SetRegularKey,
  SignerListSet,
  OfferCreate,
  OfferCancel,
  NFTokenMint,
  NFTokenBurn,
}

/**
 * Helper function to categorize error codes
 */
export function categorizeErrorCode(code: string): TransactionErrorCategory {
  if (code === XRPLErrorCode.SUCCESS) {
    return TransactionErrorCategory.SUCCESS
  }

  if (code.startsWith('tel')) {
    return TransactionErrorCategory.LOCAL_ERROR
  }

  if (code.startsWith('ter')) {
    return TransactionErrorCategory.REMOTE_ERROR
  }

  if (code.startsWith('tef')) {
    return TransactionErrorCategory.FATAL_ERROR
  }

  // tec codes are claim errors - they succeeded in processing but failed
  if (code.startsWith('tec')) {
    return TransactionErrorCategory.REMOTE_ERROR
  }

  return TransactionErrorCategory.UNKNOWN
}

/**
 * Helper function to check if error is retryable
 */
export function isRetryableError(code: string): boolean {
  const category = categorizeErrorCode(code)
  return category === TransactionErrorCategory.REMOTE_ERROR
}

/**
 * Helper function to check if error is fatal
 */
export function isFatalError(code: string): boolean {
  const category = categorizeErrorCode(code)
  return category === TransactionErrorCategory.FATAL_ERROR
}
