import { Xumm } from 'xumm';

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


// Convert Xumm WebSocket URL to use local proxy
function getProxiedWsUrl(wsUrl: string): string {
  // Convert wss://xumm.app/sign/... to ws://localhost:port/xumm-ws/sign/...
  // This routes WebSocket through Vite proxy to avoid CORS issues
  try {
    const url = new URL(wsUrl);
    if (url.host === 'xumm.app') {
      // Use WebSocket URL that will be proxied by Vite
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const proxyPath = `/xumm-ws${url.pathname}${url.search}`;
      console.log('[Xaman WS] Converting URL:', wsUrl, '-> proxy:', `${protocol}//${window.location.host}${proxyPath}`);
      return `${protocol}//${window.location.host}${proxyPath}`;
    }
  } catch (e) {
    console.warn('[Xaman WS] Failed to parse WebSocket URL:', e);
  }
  return wsUrl;
}

// Xaman - Direct API calls via Vite proxy
const XUMM_API_ENDPOINT = '/xumm-api';

export async function createXummPayload(txJson: object): Promise<any> {
  const apiKey = import.meta.env.VITE_XUMM_API_KEY;
  const apiSecret = import.meta.env.VITE_XUMM_API_SECRET;
  
  console.log('[Xaman API] Creating payload...');
  
  if (!apiKey || !apiSecret) {
    throw new Error('Xumm API credentials not configured');
  }
  
  const response = await fetch(`${XUMM_API_ENDPOINT}/payload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
    },
    body: JSON.stringify({ txjson: txJson }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('[Xaman API] Error:', error);
    throw new Error(`Xumm API error: ${error}`);
  }
  
  const data = await response.json();
  console.log('[Xaman API] Payload created:', data);
  return data;
}

export async function getXummPayload(uuid: string): Promise<any> {
  const apiKey = import.meta.env.VITE_XUMM_API_KEY;
  const apiSecret = import.meta.env.VITE_XUMM_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Xumm API credentials not configured');
  }
  
  const response = await fetch(`${XUMM_API_ENDPOINT}/payload/${uuid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Xumm API error: ${error}`);
  }
  
  return response.json();
}

let xummInstance: Xumm | null = null;

export function getXummInstance(): Xumm {
  if (!xummInstance) {
    const apiKey = import.meta.env.VITE_XUMM_API_KEY;
    const apiSecret = import.meta.env.VITE_XUMM_API_SECRET;
    if (!apiKey) {
      throw new Error('VITE_XUMM_API_KEY is not configured');
    }
    if (!apiSecret) {
      throw new Error('VITE_XUMM_API_SECRET is not configured');
    }
    xummInstance = new Xumm(apiKey, apiSecret);
  }
  return xummInstance;
}

async function connectXaman(): Promise<{ account: string; network?: string }> {
  console.log('[Xaman Connect] Starting direct API connection...');
  const apiKey = import.meta.env.VITE_XUMM_API_KEY;
  const apiSecret = import.meta.env.VITE_XUMM_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Xumm API credentials not configured');
  }
  
  // Create SignIn payload for wallet connection
  const response = await fetch(`${XUMM_API_ENDPOINT}/payload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
    },
    body: JSON.stringify({
      options: {
        submit: false,
        expire: 5, // 5 minutes
      },
      txjson: {
        TransactionType: 'SignIn',
      },
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('[Xaman Connect] Error:', error);
    throw new Error(`Failed to create payload: ${error}`);
  }
  
  const payload = await response.json();
  console.log('[Xaman Connect] Payload created:', payload);
  
  if (!payload?.uuid) {
    throw new Error('Failed to create payload');
  }
  
  // Show QR modal using store
  console.log('[Xaman Connect] Showing QR modal...');
  const { useXamanTxStore } = await import('@/stores/xamanTx');
  useXamanTxStore.getState().show(payload.refs.qr_png, payload.next.always);
  
  // Subscribe via WebSocket (use proxy to avoid CORS)
  const wsUrl = getProxiedWsUrl(payload.refs.websocket_status);
  console.log('[Xaman Connect] WebSocket URL:', wsUrl);
  const ws = new WebSocket(wsUrl);
  
  const result = await new Promise<any>((resolve, reject) => {
    // Check for user cancellation - must be defined first
    const cancelCheckInterval = setInterval(() => {
      if (useXamanTxStore.getState().cancelled) {
        clearInterval(cancelCheckInterval);
        clearTimeout(timeout);
        ws.close();
        reject(new Error('cancelled'));
      }
    }, 500);
    
    const timeout = setTimeout(() => {
      clearInterval(cancelCheckInterval);
      ws.close();
      useXamanTxStore.getState().close();
      reject(new Error('Connection timeout'));
    }, 300000); // 5 min timeout
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[Xaman Connect] Event:', data);
        
        // Handle opened event - user scanned the QR
        if (data.opened === true) {
          console.log('[Xaman Connect] User opened the payload');
          useXamanTxStore.getState().setScanned();
        }
        
        // Handle final resolution - use 'in' operator for robust detection
        if (('signed' in data) || data.expired) {
          console.log('[Xaman Connect] Connection resolved:', data.signed !== false ? 'approved' : 'rejected');
          clearInterval(cancelCheckInterval);
          clearTimeout(timeout);
          ws.close();
          useXamanTxStore.getState().close();
          resolve(data);
        }
      } catch (e) {
        console.error('[Xaman Connect] Failed to parse message:', e);
      }
    };
    
    ws.onerror = () => {
      clearInterval(cancelCheckInterval);
      clearTimeout(timeout);
      ws.close();
      useXamanTxStore.getState().close();
      reject(new Error('WebSocket error'));
    };
  });
  console.log('[Xaman Connect] Result:', result);
  
  if (!result?.signed) {
    throw new Error('Connection rejected');
  }
  
  // Fetch full payload result to get the account
  const payloadResult = await fetch(`${XUMM_API_ENDPOINT}/payload/${payload.uuid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
    },
  });
  
  if (!payloadResult.ok) {
    throw new Error('Failed to fetch payload result');
  }
  
  const payloadData = await payloadResult.json();
  console.log('[Xaman Connect] Payload data:', payloadData);
  
  // Get account from response - it might be in different places depending on SignIn vs transaction
  const account = payloadData.response?.account || result.response?.account;
  if (!account) {
    console.error('[Xaman Connect] No account in response. WebSocket result:', result, 'Payload data:', payloadData);
    throw new Error('No address received from Xaman');
  }
  
  // Get network info from response
  // Xumm returns network info in payload.response.environment
  const environment = payloadData.response?.environment;
  let network: string | undefined;
  if (environment) {
    // environment.nodetype could be 'MAINNET', 'TESTNET', 'DEVNET', etc.
    const nodeType = environment.nodetype || environment.name;
    if (nodeType) {
      network = mapNetworkType(nodeType);
      console.log('[Xaman Connect] Detected network:', network, 'from nodeType:', nodeType);
    }
  }
  
  console.log('[Xaman Connect] Connected account:', account, 'network:', network);
  
  // Return both account and network info
  return { account, network };
}

async function signAndSubmitXaman(transaction: object): Promise<{ hash: string }> {
  console.log('[Xaman TX] signAndSubmitXaman called with:', transaction);
  const apiKey = import.meta.env.VITE_XUMM_API_KEY;
  const apiSecret = import.meta.env.VITE_XUMM_API_SECRET;
  
  console.log('[Xaman TX] API credentials:', { hasApiKey: !!apiKey, hasApiSecret: !!apiSecret });
  
  if (!apiKey || !apiSecret) {
    throw new Error('Xumm API credentials not configured');
  }
  
  console.log('[Xaman TX] Creating payload...', { endpoint: XUMM_API_ENDPOINT });
  
  // Create payload
  const response = await fetch(`${XUMM_API_ENDPOINT}/payload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
    },
    body: JSON.stringify({ txjson: transaction }),
  });
  
  console.log('[Xaman TX] Response status:', response.status);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create payload: ${error}`);
  }
  
  const payload = await response.json();
  console.log('[Xaman TX] Payload created:', payload);
  
  if (!payload?.uuid) {
    throw new Error('Failed to create payload');
  }
  
  // Show QR modal using store
  console.log('[Xaman TX] Showing QR modal...');
  const { useXamanTxStore } = await import('@/stores/xamanTx');
  useXamanTxStore.getState().show(payload.refs.qr_png, payload.next.always);
  console.log('[Xaman TX] QR modal shown');
  // Subscribe via WebSocket (use proxy to avoid CORS)
  const wsUrl = getProxiedWsUrl(payload.refs.websocket_status);
  console.log('[Xaman TX] WebSocket URL:', wsUrl);
  const ws = new WebSocket(wsUrl);
  
  const result = await new Promise<any>((resolve, reject) => {
    // Check for user cancellation - must be defined first
    const cancelCheckInterval = setInterval(() => {
      if (useXamanTxStore.getState().cancelled) {
        clearInterval(cancelCheckInterval);
        clearTimeout(timeout);
        ws.close();
        reject(new Error('cancelled'));
      }
    }, 500);
    
    const timeout = setTimeout(() => {
      clearInterval(cancelCheckInterval);
      ws.close();
      useXamanTxStore.getState().close();
      reject(new Error('Transaction timeout'));
    }, 300000); // 5 min timeout
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[Xaman TX] Event:', data);
        
        // Handle opened event - user scanned the QR
        if (data.opened === true) {
          console.log('[Xaman TX] User opened the payload');
          useXamanTxStore.getState().setScanned();
        }
        
        // Handle pre_signed event - user started signing, close modal to show waiting state
        // This is the moment when user confirms the transaction in Xaman app
        if (data.pre_signed === true) {
          console.log('[Xaman TX] User started signing, closing modal');
          useXamanTxStore.getState().close();
        }
        
        // Handle final resolution - use 'in' operator for robust detection
        if (('signed' in data) || ('txid' in data) || data.expired) {
          console.log('[Xaman TX] Transaction resolved:', data.signed !== false ? 'signed' : 'rejected');
          clearInterval(cancelCheckInterval);
          clearTimeout(timeout);
          ws.close();
          resolve(data);
        }
      } catch (e) {
        console.error('[Xaman TX] Failed to parse message:', e);
      }
    };
    
    ws.onerror = () => {
      clearInterval(cancelCheckInterval);
      clearTimeout(timeout);
      ws.close();
      useXamanTxStore.getState().close();
      reject(new Error('WebSocket error'));
    };
  });
  
  console.log('[Xaman TX] Result:', result);
  
  if (!result?.signed) {
    useXamanTxStore.getState().close(); // Close modal on rejection
    throw new Error('Transaction rejected');
  }
  
  // Fetch full payload to get dispatched_result (actual XRPL transaction result)
  // This is required to detect if the transaction failed after signing
  console.log('[Xaman TX] Fetching full payload to check transaction result...');
  const payloadResult = await fetch(`${XUMM_API_ENDPOINT}/payload/${payload.uuid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
    },
  });
  
  if (!payloadResult.ok) {
    throw new Error('Failed to fetch payload result');
  }
  
  const payloadData = await payloadResult.json();
  console.log('[Xaman TX] Full payload data:', payloadData);
  
  // Check if transaction was submitted to the network
  if (!payloadData.response?.dispatched_to_node) {
    throw new Error('Transaction was not submitted to the network');
  }
  
  // Get txid
  const txid = payloadData.response?.txid;
  
  // Check the actual XRPL transaction result
  const dispatchedResult = payloadData.response?.dispatched_result;
  if (!dispatchedResult) {
    throw new Error('Transaction result unknown - please check your wallet');
  }
  
  if (dispatchedResult !== 'tesSUCCESS') {
    // Transaction was signed but failed on the XRPL network
    console.error('[Xaman TX] Transaction failed with code:', dispatchedResult);
    throw new Error(`Transaction failed: ${dispatchedResult}`);
  }
  
  if (!txid) {
    throw new Error('Transaction hash not found');
  }
  
  console.log('[Xaman TX] Transaction successful:', txid);
  return { hash: txid };
}




async function signXaman(transaction: object): Promise<{ signedTx: string; txJson: unknown }> {
  const apiKey = import.meta.env.VITE_XUMM_API_KEY;
  const apiSecret = import.meta.env.VITE_XUMM_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new Error('Xumm API credentials not configured');
  }
  
  console.log('[Xaman Sign] Creating payload...');
  
  // Create payload
  const response = await fetch(`${XUMM_API_ENDPOINT}/payload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
    },
    body: JSON.stringify({ txjson: transaction }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create payload: ${error}`);
  }
  
  const payload = await response.json();
  console.log('[Xaman Sign] Payload created:', payload);
  
  if (!payload?.uuid) {
    throw new Error('Failed to create payload');
  }
  
  // Show QR modal using store
  const { useXamanTxStore } = await import('@/stores/xamanTx');
  useXamanTxStore.getState().show(payload.refs.qr_png, payload.next.always);
  
  // Subscribe via WebSocket (use proxy to avoid CORS)
  const wsUrl = getProxiedWsUrl(payload.refs.websocket_status);
  console.log('[Xaman Sign] WebSocket URL:', wsUrl);
  const ws = new WebSocket(wsUrl);
  
  const result = await new Promise<any>((resolve, reject) => {
    // Check for user cancellation - must be defined first
    const cancelCheckInterval = setInterval(() => {
      if (useXamanTxStore.getState().cancelled) {
        clearInterval(cancelCheckInterval);
        clearTimeout(timeout);
        ws.close();
        reject(new Error('cancelled'));
      }
    }, 500);
    
    const timeout = setTimeout(() => {
      clearInterval(cancelCheckInterval);
      ws.close();
      useXamanTxStore.getState().close();
      reject(new Error('Transaction timeout'));
    }, 300000); // 5 min timeout
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[Xaman Sign] Event:', data);
        
        // Handle opened event - user scanned the QR
        if (data.opened === true) {
          console.log('[Xaman Sign] User opened the payload');
          useXamanTxStore.getState().setScanned();
        }
        
        // Handle final resolution - use 'in' operator for robust detection
        if (('signed' in data) || data.expired) {
          console.log('[Xaman Sign] Transaction resolved:', data.signed !== false ? 'signed' : 'rejected');
          clearInterval(cancelCheckInterval);
          clearTimeout(timeout);
          ws.close();
          useXamanTxStore.getState().close();
          resolve(data);
        }
      } catch (e) {
        console.error('[Xaman Sign] Failed to parse message:', e);
      }
    };
    
    ws.onerror = () => {
      clearInterval(cancelCheckInterval);
      clearTimeout(timeout);
      ws.close();
      useXamanTxStore.getState().close();
      reject(new Error('WebSocket error'));
    };
  });
  
  console.log('[Xaman Sign] Result:', result);
  
  if (!result?.signed) {
    throw new Error('Transaction rejected');
  }
  
  // Get the hex blob from the response
  return { 
    signedTx: result.response?.hex || '', 
    txJson: transaction 
  };
}

async function disconnectXaman(): Promise<void> {
  if (xummInstance) {
    await xummInstance.logout();
  }
}


// Unified API
export async function connectWallet(type: WalletType): Promise<{ address: string; network?: string }> {
  try {
    if (type === 'crossmark') {
      const address = await connectCrossmark();
      return { address };
    }
    if (type === 'gemwallet') {
      const address = await connectGemwallet();
      return { address };
    }
    if (type === 'xaman') {
      const result = await connectXaman();
      return { address: result.account, network: result.network };
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
  console.log('[signAndSubmitTransaction] Called with type:', type);
  try {
    if (type === 'crossmark') {
      return signAndSubmitCrossmark(transaction);
    }
    if (type === 'gemwallet') {
      return signAndSubmitGemwallet(transaction);
    }
    if (type === 'xaman') {
      console.log('[signAndSubmitTransaction] Calling signAndSubmitXaman...');
      return signAndSubmitXaman(transaction);
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
    if (type === 'xaman') {
      return signXaman(transaction);
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
    if (type === 'xaman') {
      await disconnectXaman();
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
      if (store.walletType === 'xaman') {
        // Xaman doesn't have persistent session - use store values
        return {
          address: store.address || null,
          network: store.network || null,
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
      const result = await connectWallet(type);
      store.setAddress(result.address);
      store.setWalletType(type);
      store.setConnected(true);
      
      // Use network from Xaman SignIn response, or detect for other wallets
      let network: string | null | undefined = result.network;
      
      if (!network) {
        // Fallback to detecting network for other wallets
        try {
          if (type === 'crossmark') {
            network = getCrossmarkNetwork();
          } else if (type === 'gemwallet') {
            network = await getGemwalletNetwork();
          }
        } catch (e) {
          console.warn('Could not detect wallet network:', e);
        }
      }
      
      if (network) {
        store.setNetwork(network as NetworkType);
      }
      
      return result.address;
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
    console.log('[signAndSubmit] Starting...', { walletType: store.walletType });
    if (!store.walletType) {
      throw new Error('No wallet connected');
    }
    
    // Check current wallet state
    const { address, network } = await getCurrentWalletState();
    console.log('[signAndSubmit] Wallet state:', { address, network, storeAddress: store.address, storeNetwork: store.network });
    
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
    console.log('[signAndSubmit] isActuallyConnected:', isActuallyConnected);
    if (!isActuallyConnected) {
      try {
        const result = await connectWallet(store.walletType);
        store.setAddress(result.address);
        store.setConnected(true);
      } catch {
        store.disconnect();
        throw new Error('Wallet disconnected. Please reconnect.');
      }
    }
    
    console.log('[signAndSubmit] Calling signAndSubmitTransaction...');
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
        const result = await connectWallet(store.walletType);
        store.setAddress(result.address);
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
