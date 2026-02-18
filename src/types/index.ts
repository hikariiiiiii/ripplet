export type NetworkType = 'mainnet' | 'testnet'

export interface Network {
  name: string
  type: NetworkType
  wsUrl: string
  apiUrl: string
}

export const NETWORKS: Record<NetworkType, Network> = {
  mainnet: {
    name: 'XRPL Mainnet',
    type: 'mainnet',
    wsUrl: 'wss://xrplcluster.com',
    apiUrl: 'https://xrplcluster.com',
  },
  testnet: {
    name: 'XRPL Testnet',
    type: 'testnet',
    wsUrl: 'wss://s.altnet.rippletest.net:51233',
    apiUrl: 'https://s.altnet.rippletest.net:51234',
  },
}

export interface WalletInfo {
  address: string
  connected: boolean
  walletType: WalletType
}

export type WalletType = 'xaman' | 'crossmark' | 'gemwallet'

export interface TransactionResult {
  hash: string
  success: boolean
  code: string
  message?: string
}
