import { Outlet, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useXamanTxStore } from '@/stores/xamanTx';
import { XamanQrModal } from '@/components/wallet/XamanQrModal';

export function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { isOpen, qrUrl, payloadUrl, scanned, cancel } = useXamanTxStore();
  
  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className={`flex-1 flex flex-col overflow-hidden relative ${isHomePage ? 'bg-animated-gradient bg-grid bg-floating-orbs' : 'bg-grid'}`}>
            {isHomePage ? (
              <Outlet />
            ) : (
              <div className="flex-1 overflow-auto p-6 relative z-10">
                <Outlet />
              </div>
            )}
          </main>
        </div>
        <XamanQrModal
          isOpen={isOpen}
          qrUrl={qrUrl}
          payloadUrl={payloadUrl}
          scanned={scanned}
          onClose={cancel}
        />
      </div>
    </TooltipProvider>
  );
}
