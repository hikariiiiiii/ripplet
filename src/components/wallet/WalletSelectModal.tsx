import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Wallet, ChevronDown, Loader2, AlertTriangle, ExternalLink, Download, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/wallets';
import type { WalletType } from '@/types';
import { cn } from '@/lib/utils';
import sdk from '@crossmarkio/sdk';
import { isInstalled as gemIsInstalled } from '@gemwallet/api';

interface WalletSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WalletIconProps {
  className?: string;
  src: string;
  alt: string;
  rounded?: boolean;
}

function WalletIcon({ className, src, alt, rounded }: WalletIconProps) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={cn(
        "object-contain",
        rounded && "rounded-xl",
        className
      )}
    />
  );
}

const WALLET_OPTIONS: { 
  type: WalletType; 
  name: string; 
  description: string; 
  iconSrc: string;
  installUrl: string;
  comingSoon?: boolean;
  iconRounded?: boolean;
}[] = [
  { 
    type: 'crossmark', 
    name: 'Crossmark', 
    description: 'Browser extension wallet', 
    iconSrc: '/crossmark.png', 
    installUrl: 'https://crossmark.io/'
  },
  { 
    type: 'gemwallet', 
    name: 'Gemwallet', 
    description: 'Browser extension wallet', 
    iconSrc: '/gemwallet.svg', 
    installUrl: 'https://gemwallet.app/'
  },
  { 
    type: 'xaman', 
    name: 'Xaman', 
    description: 'Mobile wallet app', 
    iconSrc: '/xaman.webp', 
    installUrl: 'https://xaman.app/', 
    comingSoon: true,
    iconRounded: true
  },
];

export function WalletSelectModal({ open, onOpenChange }: WalletSelectModalProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { connect, connecting, walletType, setConnecting } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<typeof WALLET_OPTIONS[0] | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setErrorTitle('');
      setShowInstallPrompt(false);
      setSelectedWallet(null);
      if (connecting) {
        setConnecting(false);
      }
    }
  }, [open, connecting, setConnecting]);

  const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      )
    ]);
  };
  const handleConnect = async (wallet: typeof WALLET_OPTIONS[0]) => {
    if (wallet.comingSoon) {
      return;
    }
    setError(null);
    setErrorTitle('');
    setSelectedWallet(wallet);
    let isInstalled = false;
    if (wallet.type === 'crossmark') {
      try {
        isInstalled = await withTimeout(
          (sdk as any).async?.detect?.(3000) ?? Promise.resolve(false),
          4000
        );
      } catch {
        isInstalled = false;
      }
    } else if (wallet.type === 'gemwallet') {
      try {
        const result = await withTimeout(gemIsInstalled(), 3000);
        isInstalled = result?.result?.isInstalled === true;
      } catch {
        isInstalled = false;
      }
    }
    if (!isInstalled) {
      setShowInstallPrompt(true);
      return;
    }
    
    try {
      await connect(wallet.type);
      onOpenChange(false);
      setShowInstallPrompt(false);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      if (message.includes('No address received') || message.includes('sign-in failed')) {
        setErrorTitle(t('wallet.noAddressReceived'));
        setError(t('wallet.noAddressReceivedDescription', { wallet: wallet.name }));
        setShowInstallPrompt(false);
      } else if (message.includes('rejected') || message.includes('cancelled')) {
        setErrorTitle(t('wallet.connectionRejected'));
        setError(t('wallet.connectionRejectedDescription'));
        setShowInstallPrompt(false);
      } else {
        setErrorTitle(t('wallet.connectionFailed'));
        setError(message);
        setShowInstallPrompt(false);
      }
    }
  };

  const handleBack = () => {
    setShowInstallPrompt(false);
    setSelectedWallet(null);
    setError(null);
    setErrorTitle('');
  };

  const handleRetry = () => {
    if (selectedWallet) {
      handleConnect(selectedWallet);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        {showInstallPrompt && selectedWallet ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                {t('wallet.notInstalled')}
              </DialogTitle>
              <DialogDescription>
                {t('wallet.notInstalledDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50 mb-4">
                <WalletIcon 
                  src={selectedWallet.iconSrc} 
                  alt={selectedWallet.name}
                  className="w-12 h-12"
                  rounded={selectedWallet.iconRounded}
                />
                <div className="flex-1">
                  <p className="font-semibold">{selectedWallet.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedWallet.description}</p>
                </div>
              </div>

              <a
                href={selectedWallet.installUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary text-background font-semibold hover:bg-primary-400 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('common.download', { defaultValue: 'Download' })} {selectedWallet.name}
              </a>

              <p className="text-xs text-muted-foreground text-center mt-4">
                {t('wallet.installPrompt')}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                {t('common.back', { defaultValue: 'Back' })}
              </Button>
              <Button
                variant="default"
                onClick={handleRetry}
                className="flex-1"
              >
                {t('common.tryAgain')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                {t('wallet.connect')}
              </DialogTitle>
              <DialogDescription>{t('wallet.connectDescription')}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 pt-4">
              {WALLET_OPTIONS.map((wallet) => (
                <button
                  key={wallet.type}
                  onClick={() => handleConnect(wallet)}
                  disabled={connecting || wallet.comingSoon}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl',
                    'bg-secondary/50 hover:bg-secondary/70',
                    'border border-border/50 hover:border-primary/30',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'group text-left relative',
                    wallet.comingSoon && 'opacity-75'
                  )}
                >
                  <div className="relative">
                    <WalletIcon 
                      src={wallet.iconSrc} 
                      alt={wallet.name}
                      className="w-10 h-10"
                      rounded={wallet.iconRounded}
                    />
                    {connecting && walletType === wallet.type && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-semibold transition-colors",
                        !wallet.comingSoon && "group-hover:text-primary"
                      )}>
                        {wallet.name}
                      </p>
                      {wallet.comingSoon && (
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {wallet.comingSoon ? t('wallet.comingSoonDescription') : wallet.description}
                    </p>
                  </div>
                  {!wallet.comingSoon && (
                    <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-hover:text-primary transition-colors" />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive font-medium mb-1">
                      {errorTitle || t('wallet.connectionFailed')}
                    </p>
                    <p className="text-xs text-destructive/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {connecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{t('wallet.connecting')}</p>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
