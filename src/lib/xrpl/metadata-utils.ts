/**
 * MPT Metadata Utilities for XLS-89 standard
 *
 * Provides TypeScript types and utility functions for handling MPT metadata
 * as defined in XLS-89 specification.
 *
 * @see https://github.com/XRPLF/XRPL-Standards/tree/master/XLS-0089-mptoken-metadata
 */

import {
  encodeMPTokenMetadata,
  decodeMPTokenMetadata,
} from 'xrpl';

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum byte length for MPT metadata (hex-encoded output)
 */
export const MAX_METADATA_BYTES = 1024;

/**
 * Valid asset classes as per XLS-89
 */
export const ASSET_CLASSES = ['rwa', 'memes', 'wrapped', 'gaming', 'defi', 'other'] as const;
export type AssetClass = typeof ASSET_CLASSES[number];

/**
 * Asset subclasses for each asset class
 * Note: Only 'rwa' requires a subclass
 */
export const ASSET_SUBCLASSES: Record<AssetClass, string[]> = {
  rwa: ['stablecoin', 'commodity', 'real_estate', 'private_credit', 'equity', 'treasury', 'other'],
  memes: [],
  wrapped: [],
  gaming: [],
  defi: [],
  other: [],
};

/**
 * Valid URI categories as per XLS-89
 */
export const URI_CATEGORIES = ['website', 'social', 'docs', 'other'] as const;
export type UriCategory = typeof URI_CATEGORIES[number];

// ============================================================================
// Key Mappings (Long <-> Short)
// ============================================================================

/**
 * Mapping from long key names to short key names (XLS-89 compact format)
 */
const KEY_MAPPINGS: Record<string, string> = {
  ticker: 't',
  name: 'n',
  desc: 'd',
  icon: 'i',
  asset_class: 'ac',
  asset_subclass: 'as',
  issuer_name: 'in',
  uris: 'us',
  additional_info: 'ai',
};

/**
 * Mapping from short key names to long key names
 */
const KEY_MAPPINGS_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_MAPPINGS).map(([long, short]) => [short, long])
);


// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * URI entry in the MPT metadata
 * Used for website links, social media, documentation, etc.
 */
export interface UriEntry {
  /** URI to the resource (hostname/path assumes HTTPS, or full URI like ipfs://) */
  uri: string;
  /** Category of the link */
  category: UriCategory;
  /** Human-readable title for the link */
  title: string;
}

/**
 * URI entry in short key format (XLS-89 encoded)
 */
export interface UriEntryEncoded {
  u?: string;
  c?: string;
  t?: string;
}

/**
 * MPT Metadata with long key names (user-friendly format)
 * All fields are optional to allow incremental form building
 */
export interface MPTMetadata {
  /** Ticker symbol (A-Z, 0-9, max 6 chars recommended) */
  ticker?: string;
  /** Display name of the token */
  name?: string;
  /** Short description of the token */
  desc?: string;
  /** URI to the token icon */
  icon?: string;
  /** Top-level classification: rwa, memes, wrapped, gaming, defi, other */
  asset_class?: AssetClass;
  /** Subcategory (required if asset_class is 'rwa') */
  asset_subclass?: string;
  /** Name of the issuer */
  issuer_name?: string;
  /** Related URIs (website, social, docs, etc.) */
  uris?: UriEntry[];
  /** Freeform additional info (JSON object or string) */
  additional_info?: Record<string, unknown> | string;
}

/**
 * MPT Metadata with short key names (XLS-89 compact format)
 */
export interface MPTMetadataEncoded {
  t?: string;
  n?: string;
  d?: string;
  i?: string;
  ac?: string;
  as?: string;
  in?: string;
  us?: UriEntryEncoded[];
  ai?: Record<string, unknown> | string;
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert a single URI entry from long to short keys
 */
function uriLongToShort(uri: UriEntry): UriEntryEncoded {
  const encoded: UriEntryEncoded = {};
  if (uri.uri) encoded.u = uri.uri;
  if (uri.category) encoded.c = uri.category;
  if (uri.title) encoded.t = uri.title;
  return encoded;
}

/**
 * Convert a single URI entry from short to long keys
 */
function uriShortToLong(uri: UriEntryEncoded): UriEntry {
  return {
    uri: uri.u ?? '',
    category: (uri.c as UriCategory) ?? 'other',
    title: uri.t ?? '',
  };
}

/**
 * Convert metadata from long key format to short key format (XLS-89)
 *
 * @param meta - Metadata with long key names
 * @returns Metadata with short key names
 */
export function longToShortKeys(meta: MPTMetadata): MPTMetadataEncoded {
  const encoded: MPTMetadataEncoded = {};

  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === '') continue;

    const shortKey = KEY_MAPPINGS[key] || key;

    if (key === 'uris' && Array.isArray(value)) {
      encoded[shortKey as 'us'] = value.map(uriLongToShort);
    } else {
      (encoded as Record<string, unknown>)[shortKey] = value;
    }
  }

  return encoded;
}

/**
 * Convert metadata from short key format to long key format
 *
 * @param meta - Metadata with short key names
 * @returns Metadata with long key names
 */
export function shortToLongKeys(meta: MPTMetadataEncoded): MPTMetadata {
  const decoded: MPTMetadata = {};

  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined) continue;

    const longKey = KEY_MAPPINGS_REVERSE[key] || key;

    if (key === 'us' && Array.isArray(value)) {
      decoded.uris = value.map(uriShortToLong);
    } else {
      (decoded as Record<string, unknown>)[longKey] = value;
    }
  }

  return decoded;
}

// ============================================================================
// Encoding/Decoding Functions
// ============================================================================

/**
 * Encode MPT metadata to hex string for on-ledger storage
 *
 * This function:
 * 1. Converts long keys to short keys (compact format)
 * 2. JSON stringifies with sorted keys
 * 3. Converts to hex
 *
 * @param meta - Metadata object with long key names
 * @returns Hex-encoded string (uppercase)
 * @throws Error if encoding fails
 */
export function encodeMetadata(meta: MPTMetadata): string {
  // Convert to short keys first
  const encoded = longToShortKeys(meta);

  // Use xrpl.js encoder (handles stringify + hex conversion)
  // The encoder accepts any object and processes it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return encodeMPTokenMetadata(encoded as any);
}

/**
 * Decode hex-encoded MPT metadata to object
 *
 * @param hex - Hex-encoded metadata string
 * @returns Metadata object with long key names
 * @throws Error if hex is invalid or JSON parsing fails
 */
export function decodeMetadata(hex: string): MPTMetadata {
  const decoded = decodeMPTokenMetadata(hex);
  return decoded as unknown as MPTMetadata;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate metadata size (byte count of hex-encoded output)
 *
 * @param meta - Metadata object to validate
 * @returns Object with validity status and byte count
 */
export function validateMetadataSize(meta: MPTMetadata): { valid: boolean; bytes: number } {
  try {
    const hex = encodeMetadata(meta);
    // Hex string length / 2 = byte count
    const bytes = hex.length / 2;
    return {
      valid: bytes <= MAX_METADATA_BYTES,
      bytes,
    };
  } catch {
    // If encoding fails, return invalid
    return {
      valid: false,
      bytes: 0,
    };
  }
}

/**
 * Check if asset class requires subclass
 *
 * @param assetClass - The asset class to check
 * @returns true if subclass is required
 */
export function requiresSubclass(assetClass?: AssetClass): boolean {
  return assetClass === 'rwa';
}

/**
 * Get valid subclasses for an asset class
 *
 * @param assetClass - The asset class
 * @returns Array of valid subclasses (empty if none required)
 */
export function getSubclasses(assetClass?: AssetClass): string[] {
  if (!assetClass) return [];
  return ASSET_SUBCLASSES[assetClass] ?? [];
}
