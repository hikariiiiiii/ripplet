import { useWalletStore } from '@/stores/wallet';
import type { WalletType, NetworkType } from '@/types';
import { WalletMismatchError } from '@/types';
import { checkWalletConnection } from '@/hooks/useWalletEvents';
import sdk from '@crossmarkio/sdk';
import { 
  isInstalled as gemIsInstalled,
  getAddress as gemGetAddress,
  getNetwork as gemGetNetwork,
  signTransaction as gemSignTransaction,
  submitTransaction as gemSubmitTransaction
} from '@gemwallet/api';

const errorMessages: Record<string, string> = {
  'not installed': 'Wallet extension not found. Please install the wallet extension.',
  'not found': 'Wallet extension not found. Please install the wallet extension.',
  'rejected': 'Connection request was rejected. Please try again.',
  'cancelled': 'Connection request was cancelled.',
  'public key': 'Wallet not ready. Please open Crossmark extension and ensure you have an account.',
  'locked': 'Wallet is locked. Please unlock Crossmark and try again.',
  'no account': 'No wallet account found. Please create or import an account in Crossmark.',
  'no address': 'No address received from wallet. Please try again.',
};

function getUserFriendlyError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  
  for (const [pattern, friendlyMessage] of Object.entries(errorMessages)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }
  
  return `Failed to connect wallet: ${message}`;
}

function mapNetworkType(walletNetwork: string): NetworkType {
  const network = walletNetwork?.toLowerCase() || '';
  if (network.includes('mainnet') || network === 'main') return 'mainnet';
  if (network.includes('testnet') || network === 'test') return 'testnet';
  if (network.includes('devnet') || network === 'dev') return 'devnet';
  return 'mainnet';
}

// Crossmark
async function connectCrossmark(): Promise<string> {
  const crossmarkSDK = sdk as any;
  
  // Check if extension is installed
  if (!crossmarkSDK?.sync?.isInstalled?.()) {
    throw new Error('Crossmark extension is not installed');
  }
  
  // Check if wallet is locked
  try {
    const lockResult = await crossmarkSDK.async?.isLockedAndWait?.();
    if (lockResult?.response?.data?.locked === true) {
      throw new Error('locked');
    }
  } catch (e: any) {
    if (e?.message === 'locked') {
      throw e;
    }
    console.warn('Lock check failed:', e);
  }
  
  // If there's an existing valid session, use it
  const existingSession = crossmarkSDK?.session;
  if (existingSession?.address && existingSession?.isOpen) {
    return existingSession.address;
  }
  
  // Attempt sign-in
  try {
    const { response } = await sdk.methods.signInAndWait();
    
    if (!response?.data?.address) {
      throw new Error('no address');
    }
    
    return response.data.address;
  } catch (error: any) {
    const errorMsg = error?.message || '';
    
    if (errorMsg.includes('public key')) {
      throw new Error('public key');
    }
    if (errorMsg.includes('rejected') || errorMsg.includes('cancelled')) {
      throw new Error('rejected');
    }
    if (errorMsg.includes('locked')) {
      throw new Error('locked');
    }
    
    throw error;
  }
}

async function signAndSubmitCrossmark(transaction: object): Promise<{ hash: string }> {
  const crossmarkSDK = sdk as any;
  const address = crossmarkSDK?.session?.address;
  
  if (!address) {
    throw new Error('Not signed in to Crossmark');
  }
  
  const tx = { ...transaction, Account: address };
  const { response } = await sdk.methods.signAndSubmitAndWait(tx);
  
  const txResult = response?.data?.resp as any;
  const hash = txResult?.result?.hash || txResult?.hash;
  
  if (!hash) {
    throw new Error('Transaction failed or was rejected');
  }
  
  return { hash };
}

async function signCrossmark(transaction: object): Promise<{ signedTx: string; txJson: unknown }> {
  const crossmarkSDK = sdk as any;
  const address = crossmarkSDK?.session?.address;
  
  if (!address) {
    throw new Error('Not signed in to Crossmark');
  }
  
  const tx = { ...transaction, Account: address };
  const { response } = await sdk.methods.signAndWait(tx);
  
  if (!response?.data?.txBlob) {
    throw new Error('Signing failed or was rejected');
  }
  
  return { signedTx: response.data.txBlob, txJson: tx };
}

function getCrossmarkNetwork(): string | null {
  const crossmarkSDK = sdk as any;
  const networkType = crossmarkSDK?.session?.network?.type;
  return networkType ? mapNetworkType(networkType) : null;
}

// Gemwallet
async function connectGemwallet(): Promise<string> {
  const installed = await gemIsInstalled();
  
  if (!installed?.result?.isInstalled) {
    throw new Error('Gemwallet extension is not installed');
  }
  
  const response = await gemGetAddress();
  
  if (response?.type !== 'response' || !response.result?.address) {
    throw new Error('No address received from Gemwallet');
  }
  
  return response.result.address;
}

async function signAndSubmitGemwallet(transaction: object): Promise<{ hash: string }> {
  const response = await gemSubmitTransaction({ transaction: transaction as any });
  
  if (response?.type === 'reject') {
    throw new Error('rejected');
  }
  
  if (response?.type !== 'response') {
    throw new Error('Transaction failed');
  }
  
  if (!response.result?.hash) {
    throw new Error('No transaction hash returned');
  }
  
  return { hash: response.result.hash };
}

async function signGemwallet(transaction: object): Promise<{ signedTx: string; txJson: unknown }> {
  const response = await gemSignTransaction({ transaction: transaction as any });
  
  if (response?.type === 'reject') {
    throw new Error('rejected');
  }
  
  if (response?.type !== 'response') {
    throw new Error('Signing failed');
  }
  
  if (!response.result?.signature) {
    throw new Error('No signature returned');
  }
  
  return { signedTx: response.result.signature, txJson: transaction };
}

async function getGemwalletNetwork(): Promise<string | null> {
  try {
    const response = await gemGetNetwork();
    if (response?.type === 'response' && response.result?.network) {
      return mapNetworkType(response.result.network);
    }
  } catch (e) {
    console.warn('Failed to get Gemwallet network:', e);
  }
  return null;
}

// Unified API
export async function connectWallet(type: WalletType): Promise<string> {
  try {
    if (type === 'crossmark') {
      return connectCrossmark();
    }
    if (type === 'gemwallet') {
      return connectGemwallet();
    }
    throw new Error(`Unsupported wallet type: ${type}`);
  } catch (error) {
    console.error(`Wallet connection error (${type}):`, error);
    throw new Error(getUserFriendlyError(error));
  }
}

export async function signAndSubmitTransaction(
  type: WalletType, 
  transaction: object
): Promise<{ hash: string }> {
  try {
    if (type === 'crossmark') {
      return signAndSubmitCrossmark(transaction);
    }
    if (type === 'gemwallet') {
      return signAndSubmitGemwallet(transaction);
    }
    throw new Error(`Unsupported wallet type: ${type}`);
  } catch (error) {
    console.error(`Transaction error (${type}):`, error);
    throw new Error(getUserFriendlyError(error));
  }
}

export async function signTransaction(
  type: WalletType, 
  transaction: object
): Promise<{ signedTx: string; txJson: unknown }> {
  try {
    if (type === 'crossmark') {
      return signCrossmark(transaction);
    }
    if (type === 'gemwallet') {
      return signGemwallet(transaction);
    }
    throw new Error(`Unsupported wallet type: ${type}`);
  } catch (error) {
    console.error(`Signing error (${type}):`, error);
    throw new Error(getUserFriendlyError(error));
  }
}

export async function disconnectWallet(type: WalletType): Promise<void> {
  try {
    if (type === 'crossmark') {
      const crossmarkSDK = sdk as any;
      if (crossmarkSDK?.methods?.signOut) {
        await crossmarkSDK.methods.signOut();
      }
    }
  } catch (e) {
    console.warn(`Disconnect warning (${type}):`, e);
  }
}

export function useWallet() {
  const store = useWalletStore();

  const getCurrentWalletState = async (): Promise<{ address: string | null; network: string | null }> => {
    if (!store.walletType) return { address: null, network: null };
    
    try {
      if (store.walletType === 'crossmark') {
        const crossmarkSDK = sdk as any;
        const session = crossmarkSDK?.session;
        return {
          address: session?.address || null,
          network: session?.network?.type 
            ? mapNetworkType(session.network.type) 
            : null,
        };
      }
      if (store.walletType === 'gemwallet') {
        const { getAddress, getNetwork } = await import('@gemwallet/api');
        const [addrRes, netRes] = await Promise.all([
          getAddress(),
          getNetwork(),
        ]);
        return {
          address: addrRes?.result?.address || null,
          network: netRes?.result?.network 
            ? mapNetworkType(netRes.result.network) 
            : null,
        };
      }
    } catch (e) {
      console.warn('Failed to get current wallet state:', e);
    }
    return { address: null, network: null };
  };

  const connect = async (type: WalletType) => {
    store.setConnecting(true);
    try {
      const address = await connectWallet(type);
      store.setAddress(address);
      store.setWalletType(type);
      store.setConnected(true);
      
      try {
        let network: string | null = null;
        if (type === 'crossmark') {
          network = getCrossmarkNetwork();
        } else if (type === 'gemwallet') {
          network = await getGemwalletNetwork();
        }
        if (network) {
          store.setNetwork(network as NetworkType);
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

  const signAndSubmit = async (transaction: object) => {
    if (!store.walletType) {
      throw new Error('No wallet connected');
    }
    
    // Check current wallet state
    const { address, network } = await getCurrentWalletState();
    
    // Check if address matches
    if (address && address !== store.address) {
      throw new WalletMismatchError(
        'Account mismatch',
        'account',
        address,
        store.address || undefined
      );
    }
    
    // Check if network matches
    if (network && network !== store.network) {
      throw new WalletMismatchError(
        'Network mismatch',
        'network',
        network,
        store.network
      );
    }
    
    const isActuallyConnected = await checkWalletConnection(store.walletType);
    if (!isActuallyConnected) {
      try {
        const newAddress = await connectWallet(store.walletType);
        store.setAddress(newAddress);
        store.setConnected(true);
      } catch {
        store.disconnect();
        throw new Error('Wallet disconnected. Please reconnect.');
      }
    }
    
    return signAndSubmitTransaction(store.walletType, transaction);
  };

  const sign = async (transaction: object) => {
    if (!store.walletType) {
      throw new Error('No wallet connected');
    }
    
    // Check current wallet state
    const { address, network } = await getCurrentWalletState();
    
    // Check if address matches
    if (address && address !== store.address) {
      throw new WalletMismatchError(
        'Account mismatch',
        'account',
        address,
        store.address || undefined
      );
    }
    
    // Check if network matches
    if (network && network !== store.network) {
      throw new WalletMismatchError(
        'Network mismatch',
        'network',
        network,
        store.network
      );
    }
    
    const isActuallyConnected = await checkWalletConnection(store.walletType);
    if (!isActuallyConnected) {
      try {
        const newAddress = await connectWallet(store.walletType);
        store.setAddress(newAddress);
        store.setConnected(true);
      } catch {
        store.disconnect();
        throw new Error('Wallet disconnected. Please reconnect.');
      }
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
    setConnecting: store.setConnecting,
  };
}
