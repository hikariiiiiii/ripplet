import { useState, ReactNode } from 'react';
import { ArrowLeft, ExternalLink, BookOpen, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useWallet } from '@/lib/wallets';
import { useXRPL } from '@/hooks/useXRPL';
import { fetchTransactionResult } from '@/lib/xrpl/transactions/builder';
import type { TransactionSubmitResult } from '@/lib/xrpl/transactions/types';

import { Button } from '@/components/ui/button';
import { NetworkMismatchDialog } from '@/components/wallet/NetworkMismatchDialog';
import { WalletSelectModal } from '@/components/wallet/WalletSelectModal';
import { TransactionResultDisplay } from '@/components/transaction/TransactionResult';
import type { TransactionResult, WalletMismatchError } from '@/types';
import type { Transaction } from 'xrpl';
type ViewState = 'form' | 'submitting' | 'result';

interface TransactionPageWrapperProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  iconBgColor?: string;
  borderColor?: string;
  docUrl?: string;
  conceptUrl?: string;
  children: (props: {
    address: string;
    onSubmit: (transaction: Transaction) => void | Promise<void>;
    isSubmitting: boolean;
    isConnected: boolean;
    onConnectWallet: () => void;
  }) => ReactNode;
}

export function TransactionPageWrapper({
  title,
  subtitle,
  icon,
  iconBgColor = 'bg-xrpl-green/10',
  borderColor = 'border-xrpl-green/20',
  docUrl,
  conceptUrl,
  children,
}: TransactionPageWrapperProps) {
  const { t } = useTranslation();
  const { address, connected, signAndSubmit, network } = useWallet();
  const { getClient, reconnect } = useXRPL();
  const [viewState, setViewState] = useState<ViewState>('form');
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
      // Reconnect XRPL client if disconnected (can happen during long Xaman signing waits)
      let client;
      try {
        client = getClient();
      } catch {
        console.log('[TransactionPageWrapper] XRPL client disconnected, reconnecting...');
        await reconnect();
        client = getClient();
      }
      
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
        setViewState('form');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        
        // If user cancelled, return to form instead of showing error
        if (errorMessage === 'cancelled') {
          setViewState('form');
          return;
        }
        
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
    setViewState('form');
    setResult(null);
  };

  const handleBack = () => {
    setViewState('form');
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex flex-col gap-2">
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
            <div className="flex items-stretch gap-3">
              <div className={`flex items-center justify-center px-2.5 rounded-lg ${iconBgColor} border ${borderColor}`}>
                {icon}
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-bold animated-gradient-text leading-6">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground leading-5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          {(docUrl || conceptUrl) && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-1">
              {docUrl && (
                <a
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('transaction.apiDocs')}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              )}
              {conceptUrl && (
                <a
                  href={conceptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{t('transaction.conceptDocs')}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              )}
            </div>
          )}
        </div>

        <div
          key={address || 'no-wallet'}
          className="glass-card border border-border/50 rounded-2xl p-6 relative"
          hidden={viewState !== 'form'}
        >
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${borderColor.replace('border-', 'via-')} to-transparent`} />
          {children({
            address: address || '',
            onSubmit: handleSubmit,
            isSubmitting: viewState === 'submitting',
            isConnected: connected && !!address,
            onConnectWallet: handleConnectWallet,
          })}
        </div>

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
