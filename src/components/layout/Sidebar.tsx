import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Coins, 
  Link2, 
  User,
  Layers,
  Box,
  Shield,
  TrendingUp,
  BadgeCheck,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItem {
  to?: string;
  icon: React.ElementType;
  label: string;
  comingSoon?: boolean;
}

interface NavSection {
  title: string;
  titleKey: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    titleKey: 'nav.overview',
    items: [
      { to: '/', icon: Home, label: 'Dashboard' },
    ],
  },
  {
    title: 'XRP',
    titleKey: 'nav.xrp',
    items: [
      { to: '/payment', icon: Coins, label: 'Payment' },
    ],
  },
  {
    title: 'Tokens',
    titleKey: 'nav.tokens',
    items: [
      { to: '/trustset', icon: Link2, label: 'TrustSet' },
      { to: undefined, icon: TrendingUp, label: 'Offers', comingSoon: true },
    ],
  },
  {
    title: 'Account',
    titleKey: 'nav.account',
    items: [
      { to: '/accountset', icon: User, label: 'AccountSet' },
      { to: undefined, icon: Shield, label: 'Security', comingSoon: true },
    ],
  },
  {
    title: 'NFT',
    titleKey: 'nav.nft',
    items: [
      { to: undefined, icon: Layers, label: 'NFT', comingSoon: true },
    ],
  },
  {
    title: 'MPT',
    titleKey: 'nav.mpt',
    items: [
      { to: undefined, icon: Box, label: 'MPT', comingSoon: true },
    ],
  },
  {
    title: 'Credential',
    titleKey: 'nav.credential',
    items: [
      { to: undefined, icon: BadgeCheck, label: 'Credential', comingSoon: true },
    ],
  },
  {
    title: 'DeFi',
    titleKey: 'nav.defi',
    items: [
      { to: undefined, icon: TrendingUp, label: 'AMM', comingSoon: true },
      { to: undefined, icon: Box, label: 'Vault', comingSoon: true },
      { to: undefined, icon: Coins, label: 'Lending', comingSoon: true },
    ],
  },
  {
    title: 'Cross-Chain',
    titleKey: 'nav.crossChain',
    items: [
      { to: undefined, icon: ArrowRightLeft, label: 'Bridge', comingSoon: true },
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
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>{section.title}</span>
              {collapsed.includes(section.title) ? (
                <ChevronRight className="w-3 h-3 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-3 h-3 transition-transform duration-200" />
              )}
            </button>
            {!collapsed.includes(section.title) && (
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => (
                  item.to ? (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'stagger-in group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
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
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.comingSoon && (
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">
                          Soon
                        </span>
                      )}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-mono-address text-muted-foreground">v0.3.0-alpha</span>
        </div>
      </div>
    </aside>
  );
}
