import { create } from 'zustand'
import type { WalletType, NetworkType, Network } from '@/types'
import { NETWORKS } from '@/types'

interface WalletState {
  address: string | null
  connected: boolean
  walletType: WalletType | null
  network: NetworkType
  networkInfo: Network
  connecting: boolean
  
  setAddress: (address: string | null) => void
  setConnected: (connected: boolean) => void
  setWalletType: (type: WalletType | null) => void
  setNetwork: (network: NetworkType) => void
  setConnecting: (connecting: boolean) => void
  disconnect: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  connected: false,
  walletType: null,
  network: 'mainnet',
  networkInfo: NETWORKS.mainnet,
  connecting: false,
  
  setAddress: (address) => set({ address }),
  setConnected: (connected) => set({ connected }),
  setWalletType: (walletType) => set({ walletType }),
  setNetwork: (network) => set({ network, networkInfo: NETWORKS[network] }),
  setConnecting: (connecting) => set({ connecting }),
  disconnect: () => set({
    address: null,
    connected: false,
    walletType: null,
  }),
}))
