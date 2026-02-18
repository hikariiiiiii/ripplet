import { useState, useRef, useEffect } from 'react';
import { Network, ChevronDown, Check } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet';
import { NETWORKS, type NetworkType } from '@/types';

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

  const getBadgeColor = (net: NetworkType) => {
    return net === 'mainnet' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <Network className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">{NETWORKS[network].name}</span>
        <span 
          className={`sm:hidden text-xs px-2 py-0.5 rounded border ${getBadgeColor(network)}`}
        >
          {network === 'mainnet' ? 'Main' : 'Test'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {(Object.keys(NETWORKS) as NetworkType[]).map((net) => (
              <button
                key={net}
                onClick={() => handleSelect(net)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors ${
                  network === net ? 'text-white' : 'text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className={`w-2 h-2 rounded-full ${net === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'}`}
                  />
                  <span>{NETWORKS[net].name}</span>
                </div>
                {network === net && (
                  <Check className="w-4 h-4 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
