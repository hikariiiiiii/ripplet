import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, ArrowLeft, AlertCircle, Trash2, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchemeWizard } from '@/components/scplus/SchemeWizard';
import { CredentialCreateForm } from '@/components/transaction/CredentialCreateForm';
import { CredentialDeleteForm } from '@/components/transaction/CredentialDeleteForm';
import { NetworkMismatchDialog } from '@/components/wallet/NetworkMismatchDialog';
import { WalletSelectModal } from '@/components/wallet/WalletSelectModal';
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult';
import { useWallet } from '@/lib/wallets';
import type { TransactionResult, WalletMismatchError } from '@/types';
import type { Transaction } from 'xrpl';
import { XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

type ViewState = 'wizard' | 'submitting' | 'result';

export default function CredentialsScheme() {
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
    { key: 'issue', title: t('scplus.credentialsScheme.step1') },
    { key: 'transfer', title: t('scplus.credentialsScheme.step2') },
    { key: 'delete', title: t('scplus.credentialsScheme.step3') },
  ];

  const renderCurrentStep = () => {
    const account = address || '';
    const isConnected = connected && !!address;

    switch (currentStep) {
      case 0:
        return (
          <CredentialCreateForm
            account={account}
            onSubmit={(tx) => handleSubmit(tx)}
            isSubmitting={viewState === 'submitting'}
            isConnected={isConnected}
            onConnectWallet={handleConnectWallet}
          />
        );
      case 1:
        return (
          <div className="space-y-6">
            {/* Transfer note - requires two transactions */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {t('scplus.credentialsScheme.transferNoteTitle')}
                  </p>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                    {t('scplus.credentialsScheme.transferNoteDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* First: Delete old credential */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t('scplus.credentialsScheme.step2a')}
                </h3>
              </div>
              <CredentialDeleteForm
                account={account}
                onSubmit={(tx) => handleSubmit(tx)}
                isSubmitting={viewState === 'submitting'}
                isConnected={isConnected}
                onConnectWallet={handleConnectWallet}
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-border/50" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-xs font-medium">{t('common.then')}</span>
              </div>
              <div className="flex-1 h-px bg-border/50" />
            </div>

            {/* Second: Create new credential */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-semibold text-foreground">
                  {t('scplus.credentialsScheme.step2b')}
                </h3>
              </div>
              <CredentialCreateForm
                account={account}
                onSubmit={(tx) => handleSubmit(tx)}
                isSubmitting={viewState === 'submitting'}
                isConnected={isConnected}
                onConnectWallet={handleConnectWallet}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <CredentialDeleteForm
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
          <div className="glass-card border border-amber-500/20 rounded-2xl p-6 flex-1">
            <div className="flex items-stretch gap-3">
              <div className="flex items-center justify-center px-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <BadgeCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h1 className="text-2xl font-bold animated-gradient-text">
                  {t('scplus.credentialsScheme.title')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('scplus.credentialsScheme.subtitle')}
                </p>
              </div>
              <a
                href={XRPL_DOC_CONCEPTS.credential}
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
            schemeType="credentials"
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
