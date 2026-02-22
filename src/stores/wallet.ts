import { create } from 'zustand';
import type { WalletType, NetworkType, Network } from '@/types';
import { NETWORKS } from '@/types';

const WALLET_STORAGE_KEY = 'ripplet-wallet-state';

interface WalletState {
  address: string | null;
  connected: boolean;
  walletType: WalletType | null;
  network: NetworkType;
  networkInfo: Network;
  connecting: boolean;
  
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setWalletType: (type: WalletType | null) => void;
  setNetwork: (network: NetworkType) => void;
  setConnecting: (connecting: boolean) => void;
  disconnect: () => void;
}

interface WalletPersist {
  address: string | null;
  walletType: WalletType | null;
  network: NetworkType;
}

function loadPersistedState(): WalletPersist {
  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load wallet state:', error);
  }
  return {
    address: null,
    walletType: null,
    network: 'mainnet',
  };
}

function savePersistedState(state: WalletPersist): void {
  try {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save wallet state:', error);
  }
}

function clearPersistedState(): void {
  try {
    localStorage.removeItem(WALLET_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear wallet state:', error);
  }
}

const persistedState = loadPersistedState();

export const useWalletStore = create<WalletState>((set, get) => ({
  address: persistedState.address,
  connected: !!persistedState.address,
  walletType: persistedState.walletType,
  network: persistedState.network,
  networkInfo: NETWORKS[persistedState.network] || NETWORKS.mainnet,
  connecting: false,
  
  setAddress: (address: string | null) => {
    set({ address });
    if (address) {
      savePersistedState({
        address,
        walletType: get().walletType,
        network: get().network,
      });
    }
  },
  
  setConnected: (connected: boolean) => set({ connected }),
  
  setWalletType: (walletType: WalletType | null) => {
    set({ walletType });
    savePersistedState({
      address: get().address,
      walletType,
      network: get().network,
    });
  },
  
  setNetwork: (network: NetworkType) => {
    set({ network, networkInfo: NETWORKS[network] });
    savePersistedState({
      address: get().address,
      walletType: get().walletType,
      network,
    });
  },
  
  setConnecting: (connecting: boolean) => set({ connecting }),
  
  disconnect: () => {
    set({
      address: null,
      connected: false,
      walletType: null,
    });
    clearPersistedState();
  },
}));
