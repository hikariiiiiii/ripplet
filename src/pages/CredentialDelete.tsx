import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, BadgeCheck } from 'lucide-react'
import { CredentialDeleteForm } from '@/components/transaction/CredentialDeleteForm'
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult'
import { NetworkMismatchDialog } from '@/components/wallet/NetworkMismatchDialog'
import { useWallet } from '@/lib/wallets'
import { useWalletStore } from '@/stores/wallet'
import { WalletConnectPrompt } from '@/components/wallet/WalletConnectPrompt'
import type { TransactionResult, WalletMismatchError } from '@/types'
import type { CredentialDelete } from 'xrpl'

type PageState = 'form' | 'submitting' | 'result'

export default function CredentialDeletePage() {
  const { t } = useTranslation()
  const { address, connected, signAndSubmit } = useWallet()
  const network = useWalletStore((state) => state.network)
  
  const [pageState, setPageState] = useState<PageState>('form')
  const [result, setResult] = useState<TransactionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMismatchDialog, setShowMismatchDialog] = useState(false)
  const [mismatchError, setMismatchError] = useState<WalletMismatchError | null>(null)

  const handleSubmit = async (transaction: CredentialDelete) => {
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
      if (err instanceof Error && err.name === 'WalletMismatchError') {
        setMismatchError(err as WalletMismatchError)
        setShowMismatchDialog(true)
        setPageState('form')
      } else {
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
  }

  const handleRetry = () => {
    setPageState('form')
    setResult(null)
    setError(null)
  }

  if (!connected || !address) {
    return (
      <WalletConnectPrompt 
        title={t('wallet.connect')}
        description="Connect your wallet to delete credentials"
        accentColor="blue"
      />
    )
  }

  if (pageState === 'result' && result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
              <BadgeCheck className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold animated-gradient-text">
                Delete Credential
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Remove a credential from the ledger
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/20">
            <BadgeCheck className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold animated-gradient-text">
              Delete Credential
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Remove a credential from the ledger
            </p>
          </div>
        </div>


        {error && (
          <div className="glass-card p-4 rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}


        <div className="glass-card border border-border/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />
          <CredentialDeleteForm
            account={address}
            onSubmit={handleSubmit}
            isSubmitting={pageState === 'submitting'}
          />
        </div>
      </div>

      <NetworkMismatchDialog
        open={showMismatchDialog}
        onOpenChange={setShowMismatchDialog}
        error={mismatchError}
      />
    </div>
  )
}
