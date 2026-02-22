import { Wallet, Copy, Check, LogOut } from 'lucide-react';
import { NetworkSwitcher } from '@/components/common/NetworkSwitcher';
import { LanguageToggle } from '@/components/common/LanguageToggle';
import { useWalletStore } from '@/stores/wallet';
import { useState } from 'react';
import { RippletLogo } from '@/components/common/RippletLogo';
import { cn } from '@/lib/utils';
import { WalletSelectModal } from '@/components/wallet/WalletSelectModal';

export function Header() {
  const { address, connected, disconnect } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDisconnect(false);
  };

  return (
    <>
      <header className="h-16 glass-card-intense border-b border-border/50 flex items-center px-6 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <RippletLogo />
          <div>
            <span className="text-xl font-display font-bold text-gradient-animated">Ripplet</span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <NetworkSwitcher />
          <LanguageToggle />

          {connected && address ? (
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card border border-primary/20 hover:border-primary/40 transition-colors relative"
              onMouseEnter={() => setShowDisconnect(true)}
              onMouseLeave={() => setShowDisconnect(false)}
            >
              <div className="w-2 h-2 rounded-full bg-primary status-pulse" />
              <span className="font-mono-address text-base text-primary">{truncateAddress(address)}</span>
              <button
                onClick={copyAddress}
                className="p-1.5 rounded-md hover:bg-primary/10 transition-all group"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary transition-all" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
              
              <button
                onClick={handleDisconnect}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  showDisconnect 
                    ? "opacity-100 hover:bg-destructive/20" 
                    : "opacity-0 pointer-events-none"
                )}
                title="Disconnect wallet"
              >
                <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowWalletModal(true)}
              className="btn-primary text-background font-semibold px-4 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </header>

      <WalletSelectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </>
  );
}
