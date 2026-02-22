import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Send, 
  Link2, 
  Settings,
  FileCheck,
  Database,
  Coins,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  to?: string;
  icon: React.ElementType;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { to: '/', icon: Home, label: 'Dashboard' },
    ],
  },
  {
    title: 'Transactions',
    items: [
      { to: '/payment', icon: Send, label: 'Payment' },
      { to: '/trustset', icon: Link2, label: 'TrustSet' },
      { to: '/accountset', icon: Settings, label: 'AccountSet' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { to: '/nft', icon: Layers, label: 'NFT' },
      { to: '/mpt', icon: Coins, label: 'MPT' },
      { to: '/credential', icon: FileCheck, label: 'Credential' },
      { to: '/vault', icon: Database, label: 'Vault' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setCollapsed(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="w-64 glass-card border-r border-border/50 shrink-0 flex flex-col">
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>{section.title}</span>
              {collapsed.includes(section.title) ? (
                <ChevronRight className="w-3 h-3 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-3 h-3 transition-transform duration-200" />
              )}
            </button>
            {!collapsed.includes(section.title) && (
              <div className="space-y-1 mt-2">
                {section.items.map((item) => (
                  item.to ? (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'stagger-in group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                        )
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ) : (
                    <button
                      key={item.label}
                      disabled
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">
                        Soon
                      </span>
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
          <span className="font-mono-address text-muted-foreground">v0.2.0-alpha</span>
        </div>
      </div>
    </aside>
  );
}
