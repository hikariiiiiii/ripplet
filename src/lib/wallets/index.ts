import { XRPLWalletConnect, WalletType as LibWalletType } from 'xrpl-wallet-connect';
import { useWalletStore } from '@/stores/wallet';
import type { WalletType } from '@/types';

// Map our WalletType to library's WalletType enum
const walletTypeMap: Record<WalletType, LibWalletType> = {
  xaman: LibWalletType.Xaman,
  crossmark: LibWalletType.Crossmark,
  gemwallet: LibWalletType.GemWallet,
};

// User-friendly error messages
const errorMessages: Record<string, string> = {
  'Xaman wallet requires a public API key.': 
    'Xaman wallet is not configured. Please contact the administrator.',
  'No wallet selected. Please call selectWallet() first.': 
    'Wallet selection failed. Please try again.',
  'Wallet adapter not implemented.': 
    'This wallet type is not supported yet.',
  'Unsupported wallet type': 
    'This wallet type is not supported.',
};

function getUserFriendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  
  for (const [pattern, friendlyMessage] of Object.entries(errorMessages)) {
    if (message.includes(pattern)) {
      return friendlyMessage;
    }
  }
  
  if (message.includes('not found') || message.includes('not installed')) {
    return 'Wallet extension not found. Please install the wallet extension and refresh the page.';
  }
  
  // Crossmark specific: wallet installed but no address (user hasn't created wallet yet)
  if (message.includes('No address received') || message.includes('sign-in failed')) {
    return 'No address received';
  }
  
  if (message.includes('rejected') || message.includes('cancelled')) {
    return 'Connection request was rejected. Please try again and approve the connection.';
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  return `Failed to connect wallet: ${message}`;
}

// Create wallet connect instance with lazy initialization
let walletConnectInstance: XRPLWalletConnect | null = null;

function getWalletConnect(): XRPLWalletConnect {
  if (!walletConnectInstance) {
    const xamanApiKey = import.meta.env.VITE_XAMM_API_KEY;
    walletConnectInstance = new XRPLWalletConnect({
      xamanApiKey: xamanApiKey || undefined,
    });
  }
  return walletConnectInstance;
}

export async function connectWallet(type: WalletType): Promise<string> {
  const walletConnect = getWalletConnect();
  const libWalletType = walletTypeMap[type];
  
  try {
    walletConnect.selectWallet(libWalletType);
    const result = await walletConnect.signIn();
    return result.address;
  } catch (error) {
    console.error(`Wallet connection error (${type}):`, error);
    throw new Error(getUserFriendlyError(error));
  }
}

export async function signAndSubmitTransaction(
  type: WalletType, 
  transaction: object
): Promise<{ hash: string }> {
  const walletConnect = getWalletConnect();
  const libWalletType = walletTypeMap[type];
  
  try {
    walletConnect.selectWallet(libWalletType);
    const result = await walletConnect.signAndSubmit(transaction);
    return { hash: result.hash };
  } catch (error) {
    console.error(`Transaction signing error (${type}):`, error);
    throw new Error(getUserFriendlyError(error));
  }
}

export async function signTransaction(
  type: WalletType, 
  transaction: object
): Promise<{ signedTx: string; txJson: unknown }> {
  const walletConnect = getWalletConnect();
  const libWalletType = walletTypeMap[type];
  
  try {
    walletConnect.selectWallet(libWalletType);
    const result = await walletConnect.sign(transaction);
    return { signedTx: result.signedTx, txJson: result.txJson };
  } catch (error) {
    console.error(`Transaction signing error (${type}):`, error);
    throw new Error(getUserFriendlyError(error));
  }
}

export async function disconnectWallet(type: WalletType): Promise<void> {
  const walletConnect = getWalletConnect();
  const libWalletType = walletTypeMap[type];
  
  try {
    walletConnect.selectWallet(libWalletType);
    await walletConnect.logout();
  } catch (error) {
    // Logout errors are not critical, just log them
    console.warn(`Wallet logout warning (${type}):`, error);
  }
}

export function useWallet() {
  const store = useWalletStore();

  const connect = async (type: WalletType) => {
    store.setConnecting(true);
    try {
      const address = await connectWallet(type);
      store.setAddress(address);
      store.setWalletType(type);
      store.setConnected(true);
      
      // Try to detect wallet network on connect
      try {
        const walletNetwork = await detectWalletNetwork(type);
        if (walletNetwork) {
          store.setNetwork(walletNetwork as import('@/types').NetworkType);
        }
      } catch (e) {
        console.warn('Could not detect wallet network:', e);
      }
      
      return address;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      store.setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (store.walletType) {
      await disconnectWallet(store.walletType);
    }
    store.disconnect();
  };

  const validateWalletState = async (): Promise<{ valid: boolean; error?: string }> => {
    if (!store.walletType || !store.address) {
      return { valid: false, error: 'No wallet connected' };
    }

    // Check if wallet address has changed
    try {
      const currentAddress = await getWalletAddress(store.walletType);
      if (currentAddress && currentAddress !== store.address) {
        return {
          valid: false,
          error: `Wallet address changed. Please reconnect your wallet.\nExpected: ${store.address.slice(0, 8)}...\nCurrent: ${currentAddress.slice(0, 8)}...`,
        };
      }
    } catch (e) {
      console.warn('Could not verify wallet address:', e);
    }

    // Check if wallet network matches app network
    try {
      const walletNetwork = await detectWalletNetwork(store.walletType);
      if (walletNetwork && walletNetwork !== store.network) {
        const networkNames: Record<string, string> = {
          mainnet: 'Mainnet',
          testnet: 'Testnet',
          devnet: 'Devnet',
        };
        return {
          valid: false,
          error: `Network mismatch!\nApp is set to ${networkNames[store.network]}, but wallet is on ${networkNames[walletNetwork]}.\nPlease switch your wallet to ${networkNames[store.network]} or change the app network.`,
        };
      }
    } catch (e) {
      console.warn('Could not verify wallet network:', e);
    }

    return { valid: true };
  };

  const signAndSubmit = async (transaction: object) => {
    if (!store.walletType) {
      throw new Error('No wallet connected');
    }
    
    // Validate wallet state before signing
    const validation = await validateWalletState();
    if (!validation.valid) {
      throw new Error(validation.error || 'Wallet state validation failed');
    }
    
    return signAndSubmitTransaction(store.walletType, transaction);
  };

  const sign = async (transaction: object) => {
    if (!store.walletType) {
      throw new Error('No wallet connected');
    }
    
    // Validate wallet state before signing
    const validation = await validateWalletState();
    if (!validation.valid) {
      throw new Error(validation.error || 'Wallet state validation failed');
    }
    
    return signTransaction(store.walletType, transaction);
  };

  return {
    address: store.address,
    connected: store.connected,
    walletType: store.walletType,
    connecting: store.connecting,
    network: store.network,
    networkInfo: store.networkInfo,
    connect,
    disconnect,
    signAndSubmit,
    sign,
    validateWalletState,
  };
}

// Helper to detect wallet network
async function detectWalletNetwork(type: WalletType): Promise<string | null> {
  try {
    if (type === 'crossmark' && window.crossmark?.sdk?.getNetwork) {
      const result = await window.crossmark.sdk.getNetwork();
      if (result?.type) {
        return mapNetworkType(result.type);
      }
    }
    if (type === 'gemwallet') {
      // Gemwallet doesn't expose network API directly, skip for now
      return null;
    }
  } catch (e) {





    console.warn('Failed to detect wallet network:', e);
  }
  return null;
}

// Helper to get current wallet address
async function getWalletAddress(type: WalletType): Promise<string | null> {
  try {
    if (type === 'crossmark' && window.crossmark?.sdk?.getAddress) {
      const result = await window.crossmark.sdk.getAddress();
      return result?.address || null;
    }
    if (type === 'gemwallet') {
      // Gemwallet address check would go here
      return null;
    }
  } catch (e) {
    console.warn('Failed to get wallet address:', e);
  }
  return null;
}

function mapNetworkType(walletNetwork: string): string {
  const network = walletNetwork?.toLowerCase() || '';
  if (network.includes('mainnet') || network === 'main') {
    return 'mainnet';
  }
  if (network.includes('testnet') || network === 'test' || network.includes('altnet')) {
    return 'testnet';
  }
  if (network.includes('devnet') || network === 'dev') {
    return 'devnet';
  }
  return 'mainnet';
}

// Add global type declarations
declare global {
  interface Window {
    crossmark?: {
      sdk?: {
        on?: (event: string, callback: (data: unknown) => void) => void;
        off?: (event: string, callback: (data: unknown) => void) => void;
        getNetwork?: () => Promise<{ type: string }>;
        getAddress?: () => Promise<{ address: string }>;
      };
    };
    gemwallet?: {
      on?: (event: string, callback: (data: unknown) => void) => void;
      off?: (event: string, callback: (data: unknown) => void) => void;
      getNetwork?: () => Promise<{ result?: { type: string } }>;
      getAddress?: () => Promise<{ result?: { address: string } }>;
    };
  }
}
