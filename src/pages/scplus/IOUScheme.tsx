import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchemeWizard } from '@/components/scplus/SchemeWizard';
import { TrustSetForm } from '@/components/transaction/TrustSetForm';
import { IOUPaymentForm } from '@/components/transaction/IOUPaymentForm';
import { AccountSetForm } from '@/components/transaction/AccountSetForm';
import { NetworkMismatchDialog } from '@/components/wallet/NetworkMismatchDialog';
import { WalletSelectModal } from '@/components/wallet/WalletSelectModal';
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult';
import { useWallet } from '@/lib/wallets';
import type { TransactionResult, WalletMismatchError } from '@/types';
import type { Transaction } from 'xrpl';

type ViewState = 'wizard' | 'submitting' | 'result';

export default function IOUScheme() {
  const { t } = useTranslation();
  const { address, connected, signAndSubmit, network } = useWallet();
  const [currentStep, setCurrentStep] = useState(0);
  const [viewState, setViewState] = useState<ViewState>('wizard');
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [showMismatchDialog, setShowMismatchDialog] = useState(false);
  const [mismatchError, setMismatchError] = useState<WalletMismatchError | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const handleSubmit = async (transaction: Transaction) => {
    if (!connected || !address) {
      setShowWalletModal(true);
      return;
    }

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
      if (err instanceof Error && err.name === 'WalletMismatchError') {
        setMismatchError(err as WalletMismatchError);
        setShowMismatchDialog(true);
        setViewState('wizard');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setResult({
          hash: '',
          success: false,
          code: 'FAILED',
          message: errorMessage,
        });
        setViewState('result');
      }
    }
  };

  const handleRetry = () => {
    setViewState('wizard');
    setResult(null);
  };

  const handleBack = () => {
    setViewState('wizard');
    setResult(null);
  };

  const handleComplete = () => {
    setCurrentStep(0);
  };

  const steps = [
    { key: 'accountset', title: t('scplus.iouScheme.step0') },
    { key: 'trustline', title: t('scplus.iouScheme.step1') },
    { key: 'issue', title: t('scplus.iouScheme.step2') },
    { key: 'transfer', title: t('scplus.iouScheme.step3') },
    { key: 'redeem', title: t('scplus.iouScheme.step4') },
  ];

  const renderCurrentStep = () => {
    const account = address || '';
    const isConnected = connected && !!address;

    switch (currentStep) {
      case 0:
        return (
          <AccountSetForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      case 1:
        return (
          <TrustSetForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      case 2:
        return (
          <IOUPaymentForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      case 3:
        return (
          <IOUPaymentForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      case 4:
        return (
          <IOUPaymentForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
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
          <div className="glass-card border border-blue-500/20 rounded-2xl p-6 flex-1">
            <div className="flex items-stretch gap-3">
              <div className="flex items-center justify-center px-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <Link2 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold animated-gradient-text">
                  {t('scplus.iouScheme.title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('scplus.iouScheme.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {viewState === 'wizard' && (
          <SchemeWizard
            steps={steps}
            schemeType="iou"
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onComplete={handleComplete}
          >
            {renderCurrentStep()}
          </SchemeWizard>
        )}

        {viewState === 'submitting' && (
          <div className="glass-card border border-border/50 rounded-2xl overflow-hidden">
            <TransactionResultDisplay result={null} />
          </div>
        )}

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

      <NetworkMismatchDialog
        open={showMismatchDialog}
        onOpenChange={setShowMismatchDialog}
        error={mismatchError}
      />

      <WalletSelectModal
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
      />
    </div>
  );
}
