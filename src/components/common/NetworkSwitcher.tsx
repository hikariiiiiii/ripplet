import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet';
import { NETWORKS, type NetworkType } from '@/types';
import { cn } from '@/lib/utils';

export function NetworkSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { network, setNetwork } = useWalletStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedNetwork: NetworkType) => {
    setNetwork(selectedNetwork);
    setIsOpen(false);
  };

  const networkStyles: Record<NetworkType, { bg: string; text: string; dot: string }> = {
    mainnet: {
      bg: 'bg-network-mainnet/15',
      text: 'text-network-mainnet',
      dot: 'bg-network-mainnet',
    },
    testnet: {
      bg: 'bg-network-testnet/15',
      text: 'text-network-testnet',
      dot: 'bg-network-testnet',
    },
  };

  const currentStyle = networkStyles[network];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200',
          'border border-current/20 hover:border-current/40',
          currentStyle.bg,
          currentStyle.text
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className={cn('animate-pulse-ring absolute inline-flex h-full w-full rounded-full opacity-75', currentStyle.dot)} />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', currentStyle.dot)} />
        </span>
        <span className="hidden sm:inline text-sm font-medium">{NETWORKS[network].name}</span>
        <span className="sm:hidden text-xs font-medium">
          {network === 'mainnet' ? 'Main' : 'Test'}
        </span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          <div className="p-1">
            {(Object.keys(NETWORKS) as NetworkType[]).map((net) => {
              const style = networkStyles[net];
              return (
                <button
                  key={net}
                  onClick={() => handleSelect(net)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                    network === net
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={cn('w-2 h-2 rounded-full', style.dot)} />
                    <span>{NETWORKS[net].name}</span>
                  </div>
                  {network === net && (
                    <Check className="w-4 h-4 text-xrpl-green" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
