import type { Client, SubmittableTransaction, TxResponse } from 'xrpl'
import { type TransactionSubmitResult, categorizeErrorCode } from './types'

export async function prepareTransaction(
  client: Client,
  transaction: SubmittableTransaction,
): Promise<SubmittableTransaction> {
  if (!client.isConnected()) {
    throw new Error('XRPL client is not connected')
  }

  const prepared = await client.autofill(transaction)
  return prepared
}

export async function submitTransaction(
  client: Client,
  transaction: SubmittableTransaction,
  wallet?: {
    sign: (tx: SubmittableTransaction) => SubmittableTransaction
    address: string
  },
  options?: {
    failHard?: boolean
  },
): Promise<TransactionSubmitResult> {
  if (!client.isConnected()) {
    throw new Error('XRPL client is not connected')
  }

  let txToSubmit = transaction

  if (wallet && !transaction.TxnSignature) {
    txToSubmit = wallet.sign(transaction)
  }

  const result = await client.submitAndWait(txToSubmit, {
    failHard: options?.failHard ?? false,
  })

  return handleTransactionResult(result)
}

export function handleTransactionResult(
  result: TxResponse<SubmittableTransaction>,
): TransactionSubmitResult {
  const hash = result.result.hash
  const meta = result.result.meta
  const ledgerIndex = result.result.ledger_index

  let code = 'unknown'
  if (meta && typeof meta === 'object' && 'TransactionResult' in meta) {
    code = meta.TransactionResult
  }

  const category = categorizeErrorCode(code)
  const success = code === 'tesSUCCESS'
  const message = getTransactionResultMessage(code)

  return {
    hash,
    success,
    code,
    message,
    category,
    ledgerIndex,
    rawResult: result,
  }
}

function getTransactionResultMessage(code: string): string {
  const messages: Record<string, string> = {
    tesSUCCESS: 'Transaction succeeded',

    // tel codes - Local errors
    telCAN_NOT_QUEUE: 'Transaction cannot be queued',
    telCAN_NOT_QUEUE_BALANCE: 'Insufficient balance to queue transaction',
    telCAN_NOT_QUEUE_FEE: 'Insufficient fee to queue transaction',
    telCAN_NOT_QUEUE_FULL: 'Transaction queue is full',
    telFAILED_PROCESSING: 'Transaction failed during processing',
    telINSUF_FEE_P: 'Insufficient fee provided',
    telNO_DST: 'Destination account does not exist',
    telDST_IS_SRC: 'Destination is the same as source',

    // ter codes - Remote errors (retryable)
    terRETRY: 'Transaction failed, please retry',
    terFUNDS_SPENT: 'Funds already spent',
    terINSUF_FEE_B: 'Insufficient fee balance',
    terINSUF_FEE_V: 'Insufficient fee for vault',
    terLAST: 'Last ledger sequence passed',
    terNO_ACCOUNT: 'Account does not exist',
    terNO_AUTH: 'Not authorized',
    terNO_LINE: 'No trust line exists',
    terOWNERS: 'Account has owners',
    terPRE_SEQ: 'Sequence number too high',
    terPRE_TICK: 'Ticket not found',
    terQ_NO: 'Not in queue',

    // tef codes - Fatal errors
    tefALREADY: 'Transaction already applied',
    tefBAD_ADD_AUTH: 'Invalid additional authorization',
    tefBAD_AUTH: 'Invalid authorization',
    tefBAD_AUTH_MASTER: 'Invalid master key authorization',
    tefBAD_LEDGER: 'Invalid ledger',
    tefBAD_QUORUM: 'Invalid quorum',
    tefBAD_SIGNATURE: 'Invalid signature',
    tefCREATED: 'Account already created',
    tefEXCEPTION: 'Transaction processing exception',
    tefFAILURE: 'Transaction failed',
    tefINTERNAL: 'Internal error',
    tefINV_SIGNER: 'Invalid signer',
    tefMASTER_DISABLED: 'Master key is disabled',
    tefMAX_LEDGER: 'Last ledger sequence exceeded',
    tefNOT_MULTI_SIGNING: 'Not configured for multi-signing',
    tefPAST_SEQ: 'Sequence number already used',
    tefTOO_BIG: 'Transaction too large',
    tefWRONG_PRIOR: 'Wrong prior transaction',

    // Common tec codes
    tecCLAIM: 'Transaction claimed but failed',
    tecPATH_DRY: 'Path does not have enough liquidity',
    tecUNFUNDED: 'Insufficient funds',
    tecUNFUNDED_PAYMENT: 'Insufficient funds for payment',
    tecNO_LINE_INSUF_RESERVE: 'No trust line, insufficient reserve',
    tecNO_LINE_REDUNDANT: 'Trust line already exists',
    tecNO_ISSUER: 'Issuer account does not exist',
    tecNO_AUTH: 'Not authorized to hold asset',
    tecNO_REGULAR_KEY: 'No regular key set',
    tecOWNERS: 'Account has owners',
    tecSUCCESS: 'Transaction succeeded (with claim)',
  }

  return messages[code] ?? `Transaction result: ${code}`
}

export function validateTransaction(transaction: SubmittableTransaction): string[] {
  const errors: string[] = []

  if (!transaction.TransactionType) {
    errors.push('TransactionType is required')
  }

  if (!transaction.Account) {
    errors.push('Account is required')
  }

  return errors
}

export function createMemo(
  data: string,
  type?: string,
  format?: string,
): { Memo: { MemoData?: string; MemoType?: string; MemoFormat?: string } } {
  const memo: { Memo: { MemoData?: string; MemoType?: string; MemoFormat?: string } } = {
    Memo: {
      MemoData: Buffer.from(data).toString('hex'),
    },
  }

  if (type) {
    memo.Memo.MemoType = Buffer.from(type).toString('hex')
  }

  if (format) {
    memo.Memo.MemoFormat = Buffer.from(format).toString('hex')
  }

  return memo
}
