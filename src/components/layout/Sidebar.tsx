import { NavLink } from 'react-router-dom';
import { Home, Send, Link2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/payment', icon: Send, label: 'Payment' },
  { to: '/trustset', icon: Link2, label: 'TrustSet' },
  { to: '/accountset', icon: Settings, label: 'AccountSet' },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-700/50 shrink-0">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
