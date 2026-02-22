import { useTranslation } from 'react-i18next';
import { Wallet, Sparkles, ChevronDown, Loader2, AlertTriangle, ExternalLink, Download, Clock } from 'lucide-react';
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
      setShowWalletModal(false);
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
    <>
      <div className="flex-1 flex items-center justify-center p-6 relative">
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
    </>
  );
}
