import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, ChevronDown, Loader2, AlertTriangle, ExternalLink, Download } from 'lucide-react';
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
      <circle cx="16" cy="16" r="14" fill="url(#crossmark-gradient-modal)" />
      <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3" fill="white" />
      <defs><linearGradient id="crossmark-gradient-modal" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#3B82F6" /><stop offset="1" stopColor="#1D4ED8" /></linearGradient></defs>
    </svg>
  );
}

function GemwalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L28 12L16 28L4 12L16 4Z" fill="url(#gemwallet-gradient-modal)" />
      <path d="M16 4L28 12L16 16L4 12L16 4Z" fill="url(#gemwallet-top-modal)" opacity="0.8" />
      <path d="M4 12L16 16L16 28L4 12Z" fill="url(#gemwallet-left-modal)" opacity="0.6" />
      <path d="M28 12L16 16L16 28L28 12Z" fill="url(#gemwallet-right-modal)" opacity="0.4" />
      <defs>
        <linearGradient id="gemwallet-gradient-modal" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#A855F7" /><stop offset="1" stopColor="#7C3AED" /></linearGradient>
        <linearGradient id="gemwallet-top-modal" x1="4" y1="4" x2="28" y2="16" gradientUnits="userSpaceOnUse"><stop stopColor="#E879F9" /><stop offset="1" stopColor="#A855F7" /></linearGradient>
        <linearGradient id="gemwallet-left-modal" x1="4" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#7C3AED" /><stop offset="1" stopColor="#5B21B6" /></linearGradient>
        <linearGradient id="gemwallet-right-modal" x1="28" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#9333EA" /><stop offset="1" stopColor="#581C87" /></linearGradient>
      </defs>
    </svg>
  );
}

function XamanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#xaman-gradient-modal)" />
      <path d="M8 12L12 8L16 12L20 8L24 12L20 16L24 20L20 24L16 20L12 24L8 20L12 16L8 12Z" fill="white" />
      <defs><linearGradient id="xaman-gradient-modal" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#23292F" /><stop offset="1" stopColor="#14181C" /></linearGradient></defs>
    </svg>
  );
}

const WALLET_OPTIONS: { type: WalletType; name: string; description: string; Icon: React.ComponentType<{ className?: string }>; installUrl: string }[] = [
  { type: 'crossmark', name: 'Crossmark', description: 'Browser extension wallet', Icon: CrossmarkIcon, installUrl: 'https://crossmark.io/' },
  { type: 'gemwallet', name: 'Gemwallet', description: 'Browser extension wallet', Icon: GemwalletIcon, installUrl: 'https://gemwallet.app/' },
  { type: 'xaman', name: 'Xaman', description: 'Mobile wallet app', Icon: XamanIcon, installUrl: 'https://xaman.app/' },
];

export function WalletSelectModal({ open, onOpenChange }: WalletSelectModalProps) {
  const { t } = useTranslation();
  const { connect, connecting, walletType } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<typeof WALLET_OPTIONS[0] | null>(null);

  const handleConnect = async (wallet: typeof WALLET_OPTIONS[0]) => {
    setError(null);
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
      } else {
        setError(message);
        setShowInstallPrompt(false);
      }
    }
  };

  const handleBack = () => {
    setShowInstallPrompt(false);
    setSelectedWallet(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        {showInstallPrompt && selectedWallet ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Install {selectedWallet.name}
              </DialogTitle>
              <DialogDescription>
                {selectedWallet.name} is not detected on your browser. Please install it to continue.
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
                Download {selectedWallet.name}
              </a>

              <p className="text-xs text-muted-foreground text-center mt-4">
                After installing, refresh the page and try connecting again.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
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
                  disabled={connecting}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl',
                    'bg-secondary/50 hover:bg-secondary/70',
                    'border border-border/50 hover:border-primary/30',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'group text-left'
                  )}
                >
                  <div className="relative">
                    <wallet.Icon className="w-10 h-10" />
                    {connecting && walletType === wallet.type && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold group-hover:text-primary transition-colors">
                      {wallet.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {wallet.description}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive font-medium mb-1">{t('wallet.connectionFailed')}</p>
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
