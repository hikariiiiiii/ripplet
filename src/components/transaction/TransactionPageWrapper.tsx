import { useState, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useWallet } from '@/lib/wallets';
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
  children,
}: TransactionPageWrapperProps) {
  const { address, connected, signAndSubmit, network } = useWallet();
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
        setViewState('form');
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
            <div className={`p-2 rounded-lg ${iconBgColor} border ${borderColor}`}>
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold animated-gradient-text">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
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
