/**
 * MPT Metadata Templates following XLS-89 specification
 * @see https://github.com/XRPLF/XRPL-Standards/tree/master/XLS-0089d-multi-purpose-tokens
 */

/**
 * URI structure for MPT metadata
 */
export interface MetadataUri {
  u: string;  // URI
  c: string;  // Category (e.g., "website", "whitepaper", "explorer")
  t: string;  // Type/description
}

/**
 * Metadata template following XLS-89 compressed key format
 * Keys are abbreviated to stay within 1024 byte limit when hex-encoded
 */
export interface MetadataTemplate {
  id: string;
  name: string;  // Display name for template selection
  data: {
    t: string;   // ticker (required)
    n: string;   // name (required)
    d?: string;  // description (optional)
    i: string;   // icon URL (required)
    ac: string;  // asset_class (required)
    as?: string; // asset_subclass (only for rwa)
    in: string;  // issuer_name (required)
    us?: MetadataUri[];  // uris (optional)
    ai?: Record<string, unknown>;  // additional_info (optional)
  };
}

/**
 * USD Stablecoin template
 * Asset class: rwa, Subclass: stablecoin
 */
export const STABLECOIN_TEMPLATE: MetadataTemplate = {
  id: 'stablecoin',
  name: 'USD Stablecoin',
  data: {
    t: 'USDX',
    n: 'USD Stablecoin',
    d: 'A fully-backed USD stablecoin on XRPL',
    i: 'https://example.com/icons/usdx.png',
    ac: 'rwa',
    as: 'stablecoin',
    in: 'Example Issuer Inc.',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Official Website' },
      { u: 'https://example.com/reserves', c: 'transparency', t: 'Reserve Report' },
      { u: 'https://example.com/audit', c: 'audit', t: 'Monthly Audit' },
    ],
    ai: {
      backing: 'fiat',
      peg: 'USD',
      reserveRatio: 1.0,
      audited: true,
    },
  },
};

/**
 * US Treasury Bill token template
 * Asset class: rwa, Subclass: treasury
 */
export const TREASURY_TEMPLATE: MetadataTemplate = {
  id: 'treasury',
  name: 'Treasury Bill',
  data: {
    t: 'TBILL',
    n: 'US Treasury Bill Token',
    d: 'Tokenized US Treasury Bills, 3-month maturity',
    i: 'https://example.com/icons/tbill.png',
    ac: 'rwa',
    as: 'treasury',
    in: 'Treasury Token Solutions',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Official Website' },
      { u: 'https://example.com/prospectus', c: 'legal', t: 'Prospectus' },
      { u: 'https://example.com/yield', c: 'analytics', t: 'Yield Calculator' },
    ],
    ai: {
      maturityDays: 90,
      apy: 0.0525,
      cusip: 'US912828XYZ12',
      custodian: 'Bank of Example',
    },
  },
};

/**
 * Real Estate token template
 * Asset class: rwa, Subclass: real_estate
 */
export const REAL_ESTATE_TEMPLATE: MetadataTemplate = {
  id: 'real_estate',
  name: 'Real Estate',
  data: {
    t: 'PROP',
    n: 'Property Token',
    d: 'Fractional ownership in commercial real estate',
    i: 'https://example.com/icons/property.png',
    ac: 'rwa',
    as: 'real_estate',
    in: 'Real Estate Tokenization LLC',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Official Website' },
      { u: 'https://example.com/appraisal', c: 'valuation', t: 'Property Appraisal' },
      { u: 'https://example.com/legal', c: 'legal', t: 'Legal Documents' },
    ],
    ai: {
      propertyType: 'commercial',
      location: 'New York, NY',
      totalValue: 10000000,
      tokenCount: 100000,
      occupancyRate: 0.92,
    },
  },
};

/**
 * Wrapped/bridged asset template
 * Asset class: wrapped
 */
export const WRAPPED_TEMPLATE: MetadataTemplate = {
  id: 'wrapped',
  name: 'Wrapped Asset',
  data: {
    t: 'WETH',
    n: 'Wrapped Ether',
    d: 'Wrapped Ethereum on XRPL, 1:1 backed',
    i: 'https://example.com/icons/weth.png',
    ac: 'wrapped',
    in: 'XRPL Bridge Protocol',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Bridge Website' },
      { u: 'https://etherscan.io', c: 'explorer', t: 'Ethereum Explorer' },
      { u: 'https://example.com/proof', c: 'transparency', t: 'Proof of Reserves' },
    ],
    ai: {
      sourceChain: 'ethereum',
      sourceContract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      bridgeType: 'custodial',
      verified: true,
    },
  },
};

/**
 * Gaming/in-game currency template
 * Asset class: gaming
 */
export const GAMING_TEMPLATE: MetadataTemplate = {
  id: 'gaming',
  name: 'Gaming Token',
  data: {
    t: 'GEM',
    n: 'Game Gems',
    d: 'In-game currency for ExampleGame universe',
    i: 'https://example.com/icons/gem.png',
    ac: 'gaming',
    in: 'ExampleGame Studios',
    us: [
      { u: 'https://example.game', c: 'website', t: 'Game Website' },
      { u: 'https://example.game/marketplace', c: 'marketplace', t: 'In-Game Marketplace' },
      { u: 'https://example.game/docs', c: 'documentation', t: 'Developer Docs' },
    ],
    ai: {
      gameTitle: 'ExampleGame',
      platform: ['web', 'mobile', 'desktop'],
      exchangeable: true,
      maxSupply: 1000000000,
    },
  },
};

/**
 * DeFi governance token template
 * Asset class: defi
 */
export const DEFI_TEMPLATE: MetadataTemplate = {
  id: 'defi',
  name: 'DeFi Governance',
  data: {
    t: 'GOV',
    n: 'Governance Token',
    d: 'Governance token for ExampleDeFi protocol',
    i: 'https://example.com/icons/gov.png',
    ac: 'defi',
    in: 'ExampleDeFi DAO',
    us: [
      { u: 'https://example.defi', c: 'website', t: 'Protocol Website' },
      { u: 'https://example.defi/governance', c: 'governance', t: 'Governance Portal' },
      { u: 'https://example.defi/whitepaper', c: 'whitepaper', t: 'Whitepaper' },
    ],
    ai: {
      protocolType: 'dex',
      votingPeriod: 7,
      quorum: 0.1,
      treasuryAddress: 'rExampleTreasuryAddress',
    },
  },
};

/**
 * All available templates
 */
export const METADATA_TEMPLATES: MetadataTemplate[] = [
  STABLECOIN_TEMPLATE,
  TREASURY_TEMPLATE,
  REAL_ESTATE_TEMPLATE,
  WRAPPED_TEMPLATE,
  GAMING_TEMPLATE,
  DEFI_TEMPLATE,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): MetadataTemplate | undefined {
  return METADATA_TEMPLATES.find(t => t.id === id);
}
