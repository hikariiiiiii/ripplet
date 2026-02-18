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

  const signAndSubmit = async (transaction: object) => {
    if (!store.walletType) {
      throw new Error('No wallet connected');
    }
    return signAndSubmitTransaction(store.walletType, transaction);
  };

  const sign = async (transaction: object) => {
    if (!store.walletType) {
      throw new Error('No wallet connected');
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
  };
}
