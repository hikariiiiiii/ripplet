import { useState } from 'react';
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

interface WalletSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CrossmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#2B71FF" />
      <circle cx="16" cy="16" r="15" fill="url(#crossmark-official)" />
      <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C16 24 16 24 16 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3" fill="white" />
      <defs>
        <linearGradient id="crossmark-official" x1="1" y1="1" x2="31" y2="31" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4D8BFF" />
          <stop offset="1" stopColor="#1A5FFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function GemwalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3L29 12L16 29L3 12L16 3Z" fill="url(#gemwallet-official)" />
      <path d="M16 3L29 12L16 17L3 12L16 3Z" fill="url(#gemwallet-top)" opacity="0.9" />
      <path d="M3 12L16 17L16 29L3 12Z" fill="url(#gemwallet-left)" opacity="0.7" />
      <path d="M29 12L16 17L16 29L29 12Z" fill="url(#gemwallet-right)" opacity="0.5" />
      <circle cx="16" cy="11" r="2" fill="white" opacity="0.6" />
      <defs>
        <linearGradient id="gemwallet-official" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
        <linearGradient id="gemwallet-top" x1="3" y1="3" x2="29" y2="17" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4B5FD" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="gemwallet-left" x1="3" y1="12" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="gemwallet-right" x1="29" y1="12" x2="16" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333EA" />
          <stop offset="1" stopColor="#581C87" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function XamanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#23292F" />
      <path d="M8 12.5L12 8.5L16 12.5L20 8.5L24 12.5L20 16.5L24 20.5L20 24.5L16 20.5L12 24.5L8 20.5L12 16.5L8 12.5Z" fill="white" />
      <rect x="1" y="1" width="30" height="30" rx="7" stroke="#3A4550" strokeWidth="1" />
    </svg>
  );
}

const WALLET_OPTIONS: { 
  type: WalletType; 
  name: string; 
  description: string; 
  Icon: React.ComponentType<{ className?: string }>; 
  installUrl: string;
  comingSoon?: boolean;
}[] = [
  { type: 'crossmark', name: 'Crossmark', description: 'Browser extension wallet', Icon: CrossmarkIcon, installUrl: 'https://crossmark.io/' },
  { type: 'gemwallet', name: 'Gemwallet', description: 'Browser extension wallet', Icon: GemwalletIcon, installUrl: 'https://gemwallet.app/' },
  { type: 'xaman', name: 'Xaman', description: 'Mobile wallet app', Icon: XamanIcon, installUrl: 'https://xaman.app/', comingSoon: true },
];

export function WalletSelectModal({ open, onOpenChange }: WalletSelectModalProps) {
  const { t } = useTranslation();
  const { connect, connecting, walletType } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>('');
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<typeof WALLET_OPTIONS[0] | null>(null);

  const handleConnect = async (wallet: typeof WALLET_OPTIONS[0]) => {
    if (wallet.comingSoon) {
      return;
    }
    
    setError(null);
    setErrorTitle('');
    setSelectedWallet(wallet);
    
    try {
      await connect(wallet.type);
      onOpenChange(false);
      setShowInstallPrompt(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      
      if (message.includes('not found') || message.includes('not installed')) {
        setShowInstallPrompt(true);
        setError(null);
      } else if (message.includes('No address received') || message.includes('sign-in failed')) {
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
                <selectedWallet.Icon className="w-12 h-12" />
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
                    <wallet.Icon className="w-10 h-10" />
                    {connecting && walletType === wallet.type && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                    {wallet.comingSoon && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                        {t('wallet.comingSoon')}
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
