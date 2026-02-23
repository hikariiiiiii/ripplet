import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Tags } from 'lucide-react'
import { NFTokenCreateOfferForm } from '@/components/transaction/NFTokenCreateOfferForm'
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult'
import { NetworkMismatchDialog } from '@/components/wallet/NetworkMismatchDialog'
import { useWallet } from '@/lib/wallets'
import { useWalletStore } from '@/stores/wallet'
import { WalletConnectPrompt } from '@/components/wallet/WalletConnectPrompt'
import type { TransactionResult, WalletMismatchError } from '@/types'
import type { NFTokenCreateOffer } from 'xrpl'

type PageState = 'form' | 'submitting' | 'result'

export default function NFTokenCreateOfferPage() {
  const { t } = useTranslation()
  const { address, connected, signAndSubmit } = useWallet()
  const network = useWalletStore((state) => state.network)
  
  const [pageState, setPageState] = useState<PageState>('form')
  const [result, setResult] = useState<TransactionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showMismatchDialog, setShowMismatchDialog] = useState(false)
  const [mismatchError, setMismatchError] = useState<WalletMismatchError | null>(null)

  const handleSubmit = async (transaction: NFTokenCreateOffer) => {
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
        description="Connect your wallet to create an NFT offer"
        accentColor="purple"
      />
    )
  }

  if (pageState === 'result' && result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
              <Tags className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-2xl font-bold animated-gradient-text">
                Create NFT Offer
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create a buy or sell offer for an NFT
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
          <div className="p-2 rounded-lg bg-neon-purple/10 border border-neon-purple/20">
            <Tags className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h1 className="text-2xl font-bold animated-gradient-text">
              Create NFT Offer
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Create a buy or sell offer for an NFT
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
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />
          <NFTokenCreateOfferForm
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
