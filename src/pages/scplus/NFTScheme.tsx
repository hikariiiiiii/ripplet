import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchemeWizard } from '@/components/scplus/SchemeWizard';
import { NFTokenMintForm } from '@/components/transaction/NFTokenMintForm';
import { NFTokenCreateOfferForm } from '@/components/transaction/NFTokenCreateOfferForm';
import { NFTokenAcceptOfferForm } from '@/components/transaction/NFTokenAcceptOfferForm';
import { NFTokenBurnForm } from '@/components/transaction/NFTokenBurnForm';
import { NetworkMismatchDialog } from '@/components/wallet/NetworkMismatchDialog';
import { WalletSelectModal } from '@/components/wallet/WalletSelectModal';
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult';
import { useWallet } from '@/lib/wallets';
import { useXRPL } from '@/hooks/useXRPL';
import { fetchTransactionResult } from '@/lib/xrpl/transactions/builder';
import type { TransactionSubmitResult } from '@/lib/xrpl/transactions/types';
import type { TransactionResult, WalletMismatchError } from '@/types';
import type { Transaction } from 'xrpl';
import { XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

type ViewState = 'wizard' | 'submitting' | 'result';

export default function NFTScheme() {
  const { t } = useTranslation();
  const { address, connected, signAndSubmit, network } = useWallet();
  const { getClient } = useXRPL();
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
      // Submit transaction via wallet
      const response = await signAndSubmit(transaction);
      
      // Fetch actual transaction result from the ledger
      const client = getClient();
      const txResult: TransactionSubmitResult = await fetchTransactionResult(client, response.hash);
      
      setResult({
        hash: txResult.hash,
        success: txResult.success,
        code: txResult.code,
        message: txResult.message,
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
    { key: 'mint', title: t('scplus.nftScheme.step1') },
    { key: 'createOffer', title: t('scplus.nftScheme.step2') },
    { key: 'acceptOffer', title: t('scplus.nftScheme.step3') },
    { key: 'burn', title: t('scplus.nftScheme.step4') },
  ];

  const renderCurrentStep = () => {
    const account = address || '';
    const isConnected = connected && !!address;

    switch (currentStep) {
      case 0:
        return (
          <NFTokenMintForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      case 1:
        return (
          <NFTokenCreateOfferForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      case 2:
        return (
          <NFTokenAcceptOfferForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      case 3:
        return (
          <NFTokenBurnForm
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
          <div className="glass-card border border-pink-500/20 rounded-2xl p-6 flex-1">
            <div className="flex items-stretch gap-3">
              <div className="flex items-center justify-center px-3 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <Layers className="w-6 h-6 text-pink-400" />
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h1 className="text-2xl font-bold animated-gradient-text">
                  {t('scplus.nftScheme.title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('scplus.nftScheme.subtitle')}
                </p>
              </div>
              <a
                href={XRPL_DOC_CONCEPTS.nft}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors self-start"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('common.learnMore')}</span>
              </a>
            </div>
          </div>
        </div>

        {viewState === 'wizard' && (
          <SchemeWizard
            steps={steps}
            schemeType="nft"
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
