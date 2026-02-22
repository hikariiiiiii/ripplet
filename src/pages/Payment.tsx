import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send } from 'lucide-react';
import { PaymentForm } from '@/components/transaction/PaymentForm';
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult';
import { useWallet } from '@/lib/wallets';
import { Button } from '@/components/ui/button';
import { WalletConnectPrompt } from '@/components/wallet/WalletConnectPrompt';
import type { Payment } from 'xrpl';
import type { TransactionResult } from '@/types';

type ViewState = 'form' | 'submitting' | 'result';

export default function PaymentPage() {
  const { t } = useTranslation();
  const { address, connected, signAndSubmit, network } = useWallet();
  const [viewState, setViewState] = useState<ViewState>('form');
  const [result, setResult] = useState<TransactionResult | null>(null);

  const handleSubmit = async (transaction: Payment) => {
    setViewState('submitting');
    setResult(null);

    try {
      const response = await signAndSubmit(transaction);
      setResult({
        hash: response.hash,
        success: true,
        code: 'tesSUCCESS',
      });
      setViewState('result');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setResult({
        hash: '',
        success: false,
        code: 'FAILED',
        message: errorMessage,
      });
      setViewState('result');
    }
  };

  const handleRetry = () => {
    setViewState('form');
    setResult(null);
  };

  const handleBack = () => {
    setViewState('form');
    setResult(null);
  };

  if (!connected || !address) {
    return (
      <WalletConnectPrompt 
        title={t('payment.connectWalletTitle')}
        description={t('payment.connectWalletDescription')}
        accentColor="green"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          {viewState === 'result' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-xrpl-green/10 border border-xrpl-green/20">
              <Send className="w-5 h-5 text-xrpl-green" />
            </div>
            <div>
              <h1 className="text-2xl font-bold animated-gradient-text">
                {t('payment.title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('payment.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Form State */}
        {viewState === 'form' && (
          <div className="glass-card border border-border/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-xrpl-green/50 to-transparent" />
            <PaymentForm
              account={address}
              onSubmit={handleSubmit}
              isSubmitting={false}
            />
          </div>
        )}

        {/* Submitting State */}
        {viewState === 'submitting' && (
          <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
            <TransactionResultDisplay result={null} />
          </div>
        )}

        {/* Result State */}
        {viewState === 'result' && result && (
          <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
            <TransactionResultDisplay
              result={result}
              onRetry={handleRetry}
              networkType={network}
            />
          </div>
        )}
      </div>
    </div>
  );
}
