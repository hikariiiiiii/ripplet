import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { NetworkSwitcher } from '@/components/common/NetworkSwitcher';
import { LanguageToggle } from '@/components/common/LanguageToggle';

export function Header() {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700/50 flex items-center px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="text-xl font-semibold text-white tracking-tight">Ripplet</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <NetworkSwitcher />

        <LanguageToggle />

        <Button
          variant="outline"
          size="sm"
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 gap-2"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </Button>
      </div>
    </header>
  );
}
