import { useTranslation } from 'react-i18next';
import { Wallet, Sparkles, ChevronDown, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet';
import { useWallet } from '@/lib/wallets';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState } from 'react';
import type { WalletType } from '@/types';
import { cn } from '@/lib/utils';

interface WalletConnectPromptProps {
  title?: string;
  description?: string;
  accentColor?: 'green' | 'blue' | 'purple';
}

const accentColors = {
  green: {
    bg: 'from-primary/5',
    icon: 'from-primary to-primary-400',
    glow: 'bg-primary/20',
  },
  blue: {
    bg: 'from-neon-blue/5',
    icon: 'from-neon-blue to-neon-cyan',
    glow: 'bg-neon-blue/20',
  },
  purple: {
    bg: 'from-neon-purple/5',
    icon: 'from-neon-purple to-neon-blue',
    glow: 'bg-neon-purple/20',
  },
};

function CrossmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="url(#crossmark-gradient-prompt)" />
      <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="3" fill="white" />
      <defs><linearGradient id="crossmark-gradient-prompt" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#3B82F6" /><stop offset="1" stopColor="#1D4ED8" /></linearGradient></defs>
    </svg>
  );
}

function GemwalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L28 12L16 28L4 12L16 4Z" fill="url(#gemwallet-gradient-prompt)" />
      <path d="M16 4L28 12L16 16L4 12L16 4Z" fill="url(#gemwallet-top-prompt)" opacity="0.8" />
      <path d="M4 12L16 16L16 28L4 12Z" fill="url(#gemwallet-left-prompt)" opacity="0.6" />
      <path d="M28 12L16 16L16 28L28 12Z" fill="url(#gemwallet-right-prompt)" opacity="0.4" />
      <defs>
        <linearGradient id="gemwallet-gradient-prompt" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#A855F7" /><stop offset="1" stopColor="#7C3AED" /></linearGradient>
        <linearGradient id="gemwallet-top-prompt" x1="4" y1="4" x2="28" y2="16" gradientUnits="userSpaceOnUse"><stop stopColor="#E879F9" /><stop offset="1" stopColor="#A855F7" /></linearGradient>
        <linearGradient id="gemwallet-left-prompt" x1="4" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#7C3AED" /><stop offset="1" stopColor="#5B21B6" /></linearGradient>
        <linearGradient id="gemwallet-right-prompt" x1="28" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse"><stop stopColor="#9333EA" /><stop offset="1" stopColor="#581C87" /></linearGradient>
      </defs>
    </svg>
  );
}

function XamanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#xaman-gradient-prompt)" />
      <path d="M8 12L12 8L16 12L20 8L24 12L20 16L24 20L20 24L16 20L12 24L8 20L12 16L8 12Z" fill="white" />
      <defs><linearGradient id="xaman-gradient-prompt" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#23292F" /><stop offset="1" stopColor="#14181C" /></linearGradient></defs>
    </svg>
  );
}

const WALLET_OPTIONS: { type: WalletType; name: string; description: string; Icon: React.ComponentType<{ className?: string }>; installUrl?: string }[] = [
  { type: 'crossmark', name: 'Crossmark', description: 'Browser extension wallet', Icon: CrossmarkIcon, installUrl: 'https://crossmark.io/' },
  { type: 'gemwallet', name: 'Gemwallet', description: 'Browser extension wallet', Icon: GemwalletIcon, installUrl: 'https://gemwallet.app/' },
  { type: 'xaman', name: 'Xaman', description: 'Mobile wallet app', Icon: XamanIcon, installUrl: 'https://xaman.app/' },
];

export function WalletConnectPrompt({ 
  title, 
  description,
  accentColor = 'green'
}: WalletConnectPromptProps) {
  const { t } = useTranslation();
  const { networkInfo } = useWalletStore();
  const { connect, connecting, walletType } = useWallet();
  const colors = accentColors[accentColor];
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (type: WalletType) => {
    setError(null);
    try {
      await connect(type);
      setShowWalletModal(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
    }
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-6 bg-animated-gradient bg-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-floating-orbs pointer-events-none" />
        
        <div className="max-w-md w-full relative z-10">
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} via-transparent to-transparent opacity-50`} />
            
            <div className="relative">
              <div className={`absolute inset-0 ${colors.glow} blur-2xl rounded-full animate-pulse`} />
              <div className={`relative bg-gradient-to-br ${colors.icon} p-4 rounded-full shadow-lg`}>
                <Wallet className="w-8 h-8 text-background" />
              </div>
            </div>
            
            <div className="text-center space-y-2 relative z-10">
              <h2 className="text-xl font-semibold text-foreground">
                {title || t('wallet.connect')}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                {description || t('wallet.connectDescription')}
              </p>
            </div>

            <Button
              size="lg"
              className="btn-primary text-background font-semibold px-8 py-6 relative z-10"
              onClick={() => setShowWalletModal(true)}
            >
              <Wallet className="w-5 h-5 mr-2" />
              {t('wallet.connect')}
            </Button>

            <div className="flex items-center justify-center gap-4 text-sm relative z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground">{networkInfo.name}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">XRPL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle>{t('wallet.connect')}</DialogTitle>
            <DialogDescription>{t('wallet.connectDescription')}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-4">
            {WALLET_OPTIONS.map((wallet) => (
              <button
                key={wallet.type}
                onClick={() => handleConnect(wallet.type)}
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
              {(error.includes('not found') || error.includes('not installed')) && (
                <div className="mt-3 pt-3 border-t border-destructive/20">
                  <p className="text-xs text-muted-foreground mb-2">{t('wallet.installExtension')}</p>
                  <div className="flex flex-wrap gap-2">
                    {WALLET_OPTIONS.filter(w => w.installUrl).map(wallet => (
                      <a
                        key={wallet.type}
                        href={wallet.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
                      >
                        {wallet.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
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
        </DialogContent>
      </Dialog>
    </>
  );
}
