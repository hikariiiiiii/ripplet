/**
 * XRPL Documentation URLs
 * Transaction Types: https://xrpl.org/docs/references/protocol/transactions/types
 * Concepts: https://xrpl.org/docs/concepts
 */

const XRPL_DOCS_BASE = 'https://xrpl.org/docs';
const TRANSACTIONS_BASE = `${XRPL_DOCS_BASE}/references/protocol/transactions/types`;

/**
 * Get the XRPL documentation URL for a transaction type
 * @param transactionType - The XRPL transaction type (e.g., 'Payment', 'NFTokenMint')
 * @returns The full documentation URL
 */
export function getXRPLTransactionDocUrl(transactionType: string): string {
  return `${TRANSACTIONS_BASE}/${transactionType.toLowerCase()}`;
}

/**
 * XRPL Concept Documentation URLs
 * Verified from https://xrpl.org/docs/concepts
 */
export const XRPL_DOC_CONCEPTS = {
  // Token Categories
  mpt: `${XRPL_DOCS_BASE}/concepts/tokens/fungible-tokens/multi-purpose-tokens`,
  nft: `${XRPL_DOCS_BASE}/concepts/tokens/nfts`,
  iou: `${XRPL_DOCS_BASE}/concepts/tokens/fungible-tokens`,
  iouTrustline: `${XRPL_DOCS_BASE}/concepts/tokens/fungible-tokens/trust-line-tokens`,
  
  // Decentralized Storage
  credential: `${XRPL_DOCS_BASE}/concepts/decentralized-storage/credentials`,
  did: `${XRPL_DOCS_BASE}/concepts/decentralized-storage/decentralized-identifiers`,
  oracle: `${XRPL_DOCS_BASE}/concepts/decentralized-storage/price-oracles`,
  
  // Payment Types
  payment: `${XRPL_DOCS_BASE}/concepts/payment-types`,
  escrow: `${XRPL_DOCS_BASE}/concepts/payment-types/escrow`,
  checks: `${XRPL_DOCS_BASE}/concepts/payment-types/checks`,
  directXrpPayment: `${XRPL_DOCS_BASE}/concepts/payment-types/direct-xrp-payments`,
  crossCurrencyPayment: `${XRPL_DOCS_BASE}/concepts/payment-types/cross-currency-payments`,
  partialPayments: `${XRPL_DOCS_BASE}/concepts/payment-types/partial-payments`,
  paymentChannels: `${XRPL_DOCS_BASE}/concepts/payment-types/payment-channels`,
  
  // Core Concepts
  account: `${XRPL_DOCS_BASE}/concepts/accounts`,
  transaction: `${XRPL_DOCS_BASE}/concepts/transactions`,
  ledger: `${XRPL_DOCS_BASE}/concepts/ledgers`,
  consensus: `${XRPL_DOCS_BASE}/concepts/consensus-protocol`,
  networks: `${XRPL_DOCS_BASE}/concepts/networks-and-servers`,
  
  // DeFi
  dex: `${XRPL_DOCS_BASE}/concepts/tokens/decentralized-exchange`,
  lending: `${XRPL_DOCS_BASE}/concepts/tokens/lending-protocol`,
  vaults: `${XRPL_DOCS_BASE}/concepts/tokens/single-asset-vaults`,
  
  // Cross-chain
  sidechains: `${XRPL_DOCS_BASE}/concepts/xrpl-sidechains`,
} as const;

/**
 * Transaction type to concept page mapping
 */
export const TRANSACTION_TO_CONCEPT: Record<string, keyof typeof XRPL_DOC_CONCEPTS> = {
  // MPT transactions
  MPTokenIssuanceCreate: 'mpt',
  MPTokenIssuanceSet: 'mpt',
  MPTokenIssuanceDestroy: 'mpt',
  MPTokenAuthorize: 'mpt',
  MPTTransfer: 'mpt',
  MPTLock: 'mpt',
  MPTClawback: 'mpt',
  MPTEscrowCreate: 'mpt',
  MPTEscrowFinish: 'mpt',
  MPTEscrowCancel: 'mpt',
  
  // NFT transactions
  NFTokenMint: 'nft',
  NFTokenBurn: 'nft',
  
  // Trust line transactions
  TrustSet: 'iouTrustline',
  
  // Payment transactions
  Payment: 'payment',
  
  // Escrow transactions
  EscrowCreate: 'escrow',
  EscrowFinish: 'escrow',
  EscrowCancel: 'escrow',
  
  // Check transactions
  CheckCreate: 'checks',
  CheckCash: 'checks',
  CheckCancel: 'checks',
  
  // Account transactions
  AccountSet: 'account',
  AccountDelete: 'account',
  
  // Credential transactions
  CredentialCreate: 'credential',
  CredentialAccept: 'credential',
  CredentialDelete: 'credential',
  
  // DEX transactions
  OfferCreate: 'dex',
  OfferCancel: 'dex',
};

/**
 * Get concept documentation URL for a transaction type
 * @param transactionType - The XRPL transaction type
 * @returns The concept documentation URL or undefined if not mapped
 */
export function getTransactionConceptUrl(transactionType: string): string | undefined {
  const conceptKey = TRANSACTION_TO_CONCEPT[transactionType];
  return conceptKey ? XRPL_DOC_CONCEPTS[conceptKey] : undefined;
}

export type ConceptCategory = keyof typeof XRPL_DOC_CONCEPTS;
