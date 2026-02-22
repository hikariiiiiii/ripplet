import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className={`flex-1 overflow-auto relative ${isHomePage ? 'bg-animated-gradient bg-grid bg-floating-orbs' : 'bg-grid'}`}>
          <div className="min-h-full p-6 relative z-10">
              <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
