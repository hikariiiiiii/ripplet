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
 * Commodity token template
 * Asset class: rwa, Subclass: commodity
 */
export const COMMODITY_TEMPLATE: MetadataTemplate = {
  id: 'commodity',
  name: 'Commodity Token',
  data: {
    t: 'GLD',
    n: 'Gold Token',
    d: 'Tokenized gold, each token backed by 1 gram of physical gold',
    i: 'https://example.com/icons/gold.png',
    ac: 'rwa',
    as: 'commodity',
    in: 'Commodity Vault Partners',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Official Website' },
      { u: 'https://example.com/vault', c: 'transparency', t: 'Vault Audit' },
      { u: 'https://example.com/storage', c: 'documentation', t: 'Storage Details' },
    ],
    ai: {
      commodityType: 'gold',
      weightPerToken: 1,
      weightUnit: 'gram',
      storageLocation: 'Switzerland',
      purity: 0.9999,
    },
  },
};

/**
 * Private Credit token template
 * Asset class: rwa, Subclass: private_credit
 */
export const PRIVATE_CREDIT_TEMPLATE: MetadataTemplate = {
  id: 'private_credit',
  name: 'Private Credit',
  data: {
    t: 'CRED',
    n: 'Credit Instrument Token',
    d: 'Tokenized private credit instrument, diversified loan portfolio',
    i: 'https://example.com/icons/credit.png',
    ac: 'rwa',
    as: 'private_credit',
    in: 'Credit Tokenization Fund',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Official Website' },
      { u: 'https://example.com/portfolio', c: 'transparency', t: 'Portfolio Report' },
      { u: 'https://example.com/risk', c: 'analytics', t: 'Risk Assessment' },
    ],
    ai: {
      instrumentType: 'loan_portfolio',
      averageMaturity: 365,
      expectedApy: 0.085,
      diversificationScore: 0.85,
      creditRating: 'BBB+',
    },
  },
};

/**
 * Equity token template
 * Asset class: rwa, Subclass: equity
 */
export const EQUITY_TEMPLATE: MetadataTemplate = {
  id: 'equity',
  name: 'Equity Token',
  data: {
    t: 'STOK',
    n: 'Tokenized Equity',
    d: 'Tokenized shares representing fractional equity ownership',
    i: 'https://example.com/icons/stock.png',
    ac: 'rwa',
    as: 'equity',
    in: 'Equity Token Platform',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Official Website' },
      { u: 'https://example.com/prospectus', c: 'legal', t: 'Offering Prospectus' },
      { u: 'https://example.com/voting', c: 'governance', t: 'Voting Portal' },
    ],
    ai: {
      entityType: 'corporation',
      jurisdiction: 'Delaware, USA',
      shareClass: 'common',
      votingRights: true,
      dividendEligible: true,
    },
  },
};

/**
 * Generic RWA template
 * Asset class: rwa, Subclass: other
 */
export const RWA_OTHER_TEMPLATE: MetadataTemplate = {
  id: 'rwa_other',
  name: 'RWA - Other',
  data: {
    t: 'RWA',
    n: 'Real World Asset',
    d: 'Tokenized real world asset, backed by physical or financial assets',
    i: 'https://example.com/icons/rwa.png',
    ac: 'rwa',
    as: 'other',
    in: 'RWA Tokenization Services',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Official Website' },
      { u: 'https://example.com/disclosure', c: 'legal', t: 'Asset Disclosure' },
      { u: 'https://example.com/audit', c: 'audit', t: 'Third-Party Audit' },
    ],
    ai: {
      assetType: 'mixed',
      custodian: 'Licensed Custodian LLC',
      jurisdiction: 'Multi-jurisdiction',
      regulatoryCompliance: true,
    },
  },
};

/**
 * Meme token template
 * Asset class: memes
 */
export const MEMES_TEMPLATE: MetadataTemplate = {
  id: 'memes',
  name: 'Meme Token',
  data: {
    t: 'DOGE',
    n: 'Doge Meme Token',
    d: 'Community-driven meme token on XRPL, for fun and community',
    i: 'https://example.com/icons/doge.png',
    ac: 'memes',
    in: 'Community DAO',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Community Website' },
      { u: 'https://example.com/community', c: 'social', t: 'Community Hub' },
      { u: 'https://example.com/memes', c: 'media', t: 'Meme Gallery' },
    ],
    ai: {
      communitySize: 50000,
      launchDate: '2024-01-01',
      fairLaunch: true,
      maxSupply: 1000000000000,
    },
  },
};

/**
 * Generic/Other token template
 * Asset class: other
 */
export const OTHER_TEMPLATE: MetadataTemplate = {
  id: 'other',
  name: 'Other Token',
  data: {
    t: 'TKN',
    n: 'Generic Token',
    d: 'Multi-purpose token on XRPL',
    i: 'https://example.com/icons/token.png',
    ac: 'other',
    in: 'Token Issuer',
    us: [
      { u: 'https://example.com', c: 'website', t: 'Official Website' },
      { u: 'https://example.com/docs', c: 'documentation', t: 'Documentation' },
    ],
    ai: {
      utilityType: 'multi-purpose',
      transferable: true,
      burnable: true,
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
  // RWA templates (by subclass)
  STABLECOIN_TEMPLATE,
  COMMODITY_TEMPLATE,
  REAL_ESTATE_TEMPLATE,
  PRIVATE_CREDIT_TEMPLATE,
  EQUITY_TEMPLATE,
  TREASURY_TEMPLATE,
  RWA_OTHER_TEMPLATE,
  // Other asset classes
  MEMES_TEMPLATE,
  WRAPPED_TEMPLATE,
  GAMING_TEMPLATE,
  DEFI_TEMPLATE,
  OTHER_TEMPLATE,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): MetadataTemplate | undefined {
  return METADATA_TEMPLATES.find(t => t.id === id);
}
