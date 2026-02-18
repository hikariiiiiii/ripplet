import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet, AlertCircle } from 'lucide-react'
import { AccountSetForm } from '@/components/transaction/AccountSetForm'
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult'
import { useWallet } from '@/lib/wallets'
import { useWalletStore } from '@/stores/wallet'
import type { TransactionResult } from '@/types'
import type { AccountSet } from 'xrpl'

type PageState = 'form' | 'submitting' | 'result'

export default function AccountSetPage() {
  const { t } = useTranslation()
  const { address, connected, signAndSubmit } = useWallet()
  const network = useWalletStore((state) => state.network)
  
  const [pageState, setPageState] = useState<PageState>('form')
  const [result, setResult] = useState<TransactionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (transaction: AccountSet) => {
    setError(null)
    setPageState('submitting')
    setResult(null)

    try {
      const response = await signAndSubmit(transaction)
      
      setResult({
        hash: response.hash,
        success: true,
        code: 'tesSUCCESS',
      })
      setPageState('result')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      
      setResult({
        hash: '',
        success: false,
        code: 'UNKNOWN',
        message: errorMessage,
      })
      setPageState('result')
    }
  }

  const handleRetry = () => {
    setPageState('form')
    setResult(null)
    setError(null)
  }

  if (!connected || !address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center p-8 space-y-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-blue-400 to-indigo-600 p-4 rounded-full shadow-lg shadow-blue-500/30">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">{t('wallet.connect')}</h2>
              <p className="text-sm text-muted-foreground">
                Connect your wallet to modify account settings
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (pageState === 'result' && result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
            <TransactionResultDisplay
              result={result}
              onRetry={handleRetry}
              networkType={network}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('accountset.title')}</h1>
          <p className="text-sm text-muted-foreground">
            Configure your XRPL account settings and flags
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
          <AccountSetForm
            account={address}
            onSubmit={handleSubmit}
            isSubmitting={pageState === 'submitting'}
          />
        </div>
      </div>
    </div>
  )
}
