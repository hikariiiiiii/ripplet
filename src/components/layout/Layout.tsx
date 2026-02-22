import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-grid">
          <div className="min-h-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
