import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet, AlertCircle } from 'lucide-react'
import { TrustSetForm } from '@/components/transaction/TrustSetForm'
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult'
import { useWallet } from '@/lib/wallets'
import { useWalletStore } from '@/stores/wallet'
import type { TransactionResult } from '@/types'
import type { TrustSet as TrustSetTransaction } from 'xrpl'

export default function TrustSet() {
  const { t } = useTranslation()
  const { address, connected, signAndSubmit } = useWallet()
  const network = useWalletStore((state) => state.network)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<TransactionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (transaction: TrustSetTransaction) => {
    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const { hash } = await signAndSubmit(transaction)
      
      setResult({
        hash,
        success: true,
        code: 'tesSUCCESS',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      
      setResult({
        hash: '',
        success: false,
        code: 'UNKNOWN',
        message: errorMessage,
      })
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setResult(null)
    setError(null)
  }

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {t('trustset.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Create or modify trust lines for issued currencies
          </p>
        </div>
        
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <TransactionResultDisplay
            result={result}
            onRetry={handleRetry}
            networkType={network}
          />
        </div>
      </div>
    )
  }

  if (!connected || !address) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            {t('trustset.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            Create or modify trust lines for issued currencies
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full" />
            <div className="relative bg-gradient-to-br from-sky-400 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-sky-500/30">
              <Wallet className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Connect your wallet to create or modify trust lines on the XRPL
          </p>
          
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Wallet connection required to proceed
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {t('trustset.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          Create or modify trust lines for issued currencies
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <TrustSetForm
          account={address}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
