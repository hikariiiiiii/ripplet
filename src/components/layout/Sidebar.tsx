import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  ChevronRight,
  ExternalLink,
  Globe,
  Droplets,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';

interface NavItem {
  to?: string;
  icon: React.ElementType;
  labelKey: string;
  comingSoon?: boolean;
  external?: boolean;
  href?: string;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    titleKey: 'nav.overview',
    items: [
      { to: '/', icon: Home, labelKey: 'nav.dashboard' },
    ],
  },
  {
    titleKey: 'nav.account',
    items: [
      { to: '/account/accountset', icon: User, labelKey: 'nav.accountSet' },
      { to: undefined, icon: Shield, labelKey: 'nav.security', comingSoon: true },
    ],
  },
  {
    titleKey: 'nav.xrp',
    items: [
      { to: '/xrp/payment', icon: Coins, labelKey: 'nav.payment' },
    ],
  },
  {
    titleKey: 'nav.iou',
    items: [
      { to: '/iou/trustset', icon: Link2, labelKey: 'nav.trustSet' },
      { to: '/iou/accountset', icon: User, labelKey: 'nav.accountSetIssuer' },
      { to: undefined, icon: TrendingUp, labelKey: 'nav.offers', comingSoon: true },
    ],
  },
  {
    titleKey: 'nav.mpt',
    items: [
      { to: undefined, icon: Box, labelKey: 'nav.mpt', comingSoon: true },
    ],
  },
  {
    titleKey: 'nav.nft',
    items: [
      { to: undefined, icon: Layers, labelKey: 'nav.nft', comingSoon: true },
    ],
  },
  {
    titleKey: 'nav.credential',
    items: [
      { to: undefined, icon: BadgeCheck, labelKey: 'nav.credential', comingSoon: true },
    ],
  },
  {
    titleKey: 'nav.defi',
    items: [
      { to: undefined, icon: TrendingUp, labelKey: 'nav.amm', comingSoon: true },
      { to: undefined, icon: Box, labelKey: 'nav.vault', comingSoon: true },
      { to: undefined, icon: Coins, labelKey: 'nav.lending', comingSoon: true },
    ],
  },
  {
    titleKey: 'nav.crossChain',
    items: [
      { to: undefined, icon: ArrowRightLeft, labelKey: 'nav.bridge', comingSoon: true },
    ],
  },
];

const officialResources: NavSection = {
  titleKey: 'nav.officialResources',
  items: [
    { icon: Globe, labelKey: 'nav.explorer', external: true, href: 'https://livenet.xrpl.org' },
    { icon: Droplets, labelKey: 'nav.faucet', external: true, href: 'https://xrpl.org/xrp-testnet-faucet.html' },
    { icon: BookOpen, labelKey: 'nav.docs', external: true, href: 'https://xrpl.org/docs.html' },
  ],
};

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  
  const defaultCollapsed = useMemo(() => {
    const expanded: string[] = [t('nav.overview')];
    
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.to && location.pathname === item.to) {
          const sectionTitle = t(section.titleKey);
          if (!expanded.includes(sectionTitle)) {
            expanded.push(sectionTitle);
          }
        }
      }
    }
    
    return navSections
      .map(s => t(s.titleKey))
      .filter(title => !expanded.includes(title));
  }, [location.pathname, t]);
  
  const [collapsed, setCollapsed] = useState<string[]>(defaultCollapsed);

  const toggleSection = (title: string) => {
    setCollapsed(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isSectionCollapsed = (title: string) => collapsed.includes(title);

  return (
    <aside className="w-64 glass-card border-r border-border/50 flex flex-col shrink-0">
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden min-h-0">
        {navSections.map((section) => {
          const sectionTitle = t(section.titleKey);
          return (
            <div key={section.titleKey} className="space-y-1">
              <button
                onClick={() => toggleSection(sectionTitle)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <span>{sectionTitle}</span>
                {isSectionCollapsed(sectionTitle) ? (
                  <ChevronRight className="w-3 h-3 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-3 h-3 transition-transform duration-200" />
                )}
              </button>
              {!isSectionCollapsed(sectionTitle) && (
                <div className="space-y-0.5 mt-1 pl-3">
                  {section.items.map((item, index) => (
                    item.to ? (
                      <NavLink
                        key={`${item.to}-${index}`}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'stagger-in group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
                          )
                        }
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{t(item.labelKey)}</span>
                      </NavLink>
                    ) : (
                      <button
                        key={`${item.labelKey}-${index}`}
                        disabled
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{t(item.labelKey)}</span>
                        {item.comingSoon && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-medium">
                            {t('nav.soon')}
                          </span>
                        )}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        <div className="space-y-1 pt-4 border-t border-border/30">
          <button
            onClick={() => toggleSection(t(officialResources.titleKey))}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span>{t(officialResources.titleKey)}</span>
            {isSectionCollapsed(t(officialResources.titleKey)) ? (
              <ChevronRight className="w-3 h-3 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-3 h-3 transition-transform duration-200" />
            )}
          </button>
          {!isSectionCollapsed(t(officialResources.titleKey)) && (
            <div className="space-y-0.5 mt-1 pl-3">
              {officialResources.items.map((item, index) => (
                <a
                  key={`${item.labelKey}-${index}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{t(item.labelKey)}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-mono-address text-muted-foreground">v0.3.0-alpha</span>
        </div>
      </div>
    </aside>
  );
}
