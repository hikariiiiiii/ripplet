import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, ArrowLeft } from 'lucide-react';
import { PaymentForm } from '@/components/transaction/PaymentForm';
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult';
import { useWallet } from '@/lib/wallets';
import { Button } from '@/components/ui/button';
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center p-12 space-y-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-sky-400 to-sky-600 p-4 rounded-full shadow-lg shadow-sky-500/30">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-slate-200">
                {t('payment.connectWalletTitle')}
              </h2>
              <p className="text-sm text-slate-400">
                {t('payment.connectWalletDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4">
          {viewState === 'result' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {t('payment.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('payment.subtitle')}
            </p>
          </div>
        </div>

        {viewState === 'form' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <PaymentForm
              account={address}
              onSubmit={handleSubmit}
              isSubmitting={false}
            />
          </div>
        )}

        {viewState === 'submitting' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl">
            <TransactionResultDisplay result={null} />
          </div>
        )}

        {viewState === 'result' && result && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl">
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
