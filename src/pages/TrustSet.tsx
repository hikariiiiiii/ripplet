import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Link2 } from 'lucide-react'
import { TrustSetForm } from '@/components/transaction/TrustSetForm'
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult'
import { useWallet } from '@/lib/wallets'
import { useWalletStore } from '@/stores/wallet'
import { WalletConnectPrompt } from '@/components/wallet/WalletConnectPrompt'
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
              <Link2 className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-2xl font-bold animated-gradient-text">
                {t('trustset.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create or modify trust lines for issued currencies
              </p>
            </div>
          </div>

          <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
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

  if (!connected || !address) {
    return (
      <WalletConnectPrompt 
        title="Connect Your Wallet"
        description="Connect your wallet to create or modify trust lines on the XRPL"
        accentColor="purple"
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
            <Link2 className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold animated-gradient-text">
              {t('trustset.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create or modify trust lines for issued currencies
            </p>
          </div>
        </div>


        {error && (
          <div className="glass-card p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}


        <div className="glass-card border border-border/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />
          <TrustSetForm
            account={address}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  )
}
