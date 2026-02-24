import { Outlet, useLocation } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col relative overflow-hidden">
            {isHomePage && (
              <div className="absolute inset-0 bg-grid-animated pointer-events-none" />
            )}
            {!isHomePage && (
              <div className="absolute inset-0 bg-grid pointer-events-none" />
            )}

            {isHomePage ? (
              <div className="flex-1 overflow-y-auto scroll-smooth relative z-10">
                <Outlet />
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-6 relative z-10">
                <Outlet />
              </div>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
