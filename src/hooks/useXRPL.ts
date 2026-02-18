import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from 'xrpl'
import { useWalletStore } from '@/stores/wallet'

export interface UseXRPLReturn {
  client: Client | null
  getClient: () => Client
  connecting: boolean
  connected: boolean
  error: Error | null
  reconnect: () => Promise<void>
}

export function useXRPL(): UseXRPLReturn {
  const clientRef = useRef<Client | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const networkInfo = useWalletStore((state) => state.networkInfo)

  const disconnectClient = useCallback(async () => {
    if (clientRef.current?.isConnected()) {
      try {
        await clientRef.current.disconnect()
      } catch {
        // Ignore disconnect errors
      }
    }
    clientRef.current = null
  }, [])

  const connectClient = useCallback(async () => {
    // Disconnect existing client first
    await disconnectClient()
    
    setConnecting(true)
    setError(null)
    setConnected(false)
    
    try {
      const client = new Client(networkInfo.wsUrl)
      await client.connect()
      clientRef.current = client
      setConnected(true)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to XRPL')
      setError(error)
      setConnected(false)
      clientRef.current = null
    } finally {
      setConnecting(false)
    }
  }, [networkInfo.wsUrl, disconnectClient])

  // Connect on mount and reconnect on network change
  useEffect(() => {
    connectClient()
    
    return () => {
      disconnectClient()
    }
  }, [connectClient, disconnectClient])

  const getClient = useCallback((): Client => {
    if (!clientRef.current?.isConnected()) {
      throw new Error('XRPL client not connected')
    }
    return clientRef.current
  }, [])

  const reconnect = useCallback(async () => {
    await connectClient()
  }, [connectClient])

  return {
    client: clientRef.current,
    getClient,
    connecting,
    connected,
    error,
    reconnect,
  }
}
