import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Coins, 
  Link2, 
  User,
  Trash2,
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
  BookOpen,
  Lock,
  CheckCircle,
  Settings,
  UserCheck,
  PlusCircle,
  XCircle,
  Flame,
  Tags,
  Send,
  Undo2,
  Table
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

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
      { to: '/account/accountdelete', icon: Trash2, labelKey: 'nav.accountDelete' },
      { to: undefined, icon: Shield, labelKey: 'nav.security', comingSoon: true },
    ],
  },
  {
    titleKey: 'nav.xrp',
    items: [
      { to: '/xrp/payment', icon: Coins, labelKey: 'nav.payment' },
      { to: '/xrp/escrow/create', icon: Lock, labelKey: 'nav.escrowCreate' },
      { to: '/xrp/escrow/finish', icon: CheckCircle, labelKey: 'nav.escrowFinish' },
      { to: '/xrp/escrow/cancel', icon: XCircle, labelKey: 'nav.escrowCancel' },
    ],
  },
  {
    titleKey: 'nav.iou',
    items: [
      { to: '/iou/trustset', icon: Link2, labelKey: 'nav.trustSet' },
      { to: '/iou/payment', icon: Coins, labelKey: 'nav.iouPayment' },
      { to: '/iou/accountset', icon: User, labelKey: 'nav.accountSetIssuer' },
      { to: '/iou/escrow/create', icon: Lock, labelKey: 'nav.iouEscrowCreate' },
      { to: '/iou/escrow/finish', icon: CheckCircle, labelKey: 'nav.iouEscrowFinish' },
      { to: '/iou/escrow/cancel', icon: XCircle, labelKey: 'nav.iouEscrowCancel' },
      { to: '/iou/offercreate', icon: PlusCircle, labelKey: 'nav.offerCreate' },
      { to: '/iou/offercancel', icon: XCircle, labelKey: 'nav.offerCancel' },
    ],
  },
  {
    titleKey: 'nav.mpt',
    items: [
      { to: '/mpt/create', icon: Box, labelKey: 'nav.mptCreate' },
      { to: '/mpt/set', icon: Settings, labelKey: 'nav.mptSet' },
      { to: '/mpt/destroy', icon: Trash2, labelKey: 'nav.mptDestroy' },
      { to: '/mpt/authorize', icon: UserCheck, labelKey: 'nav.mptAuthorize' },
      { to: '/mpt/transfer', icon: Send, labelKey: 'nav.mptTransfer' },
      { to: '/mpt/escrow/create', icon: Lock, labelKey: 'nav.mptEscrowCreate' },
      { to: '/mpt/escrow/finish', icon: CheckCircle, labelKey: 'nav.mptEscrowFinish' },
      { to: '/mpt/escrow/cancel', icon: XCircle, labelKey: 'nav.mptEscrowCancel' },
      { to: '/mpt/lock', icon: Lock, labelKey: 'nav.mptLock' },
      { to: '/mpt/clawback', icon: Undo2, labelKey: 'nav.mptClawback' },
    ],
  },
  {
    titleKey: 'nav.nft',
    items: [
      { to: '/nft/mint', icon: Layers, labelKey: 'nav.nftMint' },
      { to: '/nft/burn', icon: Flame, labelKey: 'nav.nftBurn' },
      { to: '/nft/createoffer', icon: Tags, labelKey: 'nav.nftCreateOffer' },
      { to: '/nft/acceptoffer', icon: CheckCircle, labelKey: 'nav.nftAcceptOffer' },
      { to: '/nft/offercancel', icon: XCircle, labelKey: 'nav.nftCancelOffer' },
    ],
  },
  {
    titleKey: 'nav.credential',
    items: [
      { to: '/credential/create', icon: BadgeCheck, labelKey: 'nav.credentialCreate' },
      { to: '/credential/accept', icon: CheckCircle, labelKey: 'nav.credentialAccept' },
      { to: '/credential/delete', icon: Trash2, labelKey: 'nav.credentialDelete' },
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

const scplusResources: NavSection = {
  titleKey: 'scplus.title',
  items: [
    { to: '/scplus/overview', icon: Table, labelKey: 'scplus.overview' },
    { to: '/scplus/mpt', icon: Box, labelKey: 'scplus.mpt' },
    { to: '/scplus/iou', icon: Link2, labelKey: 'scplus.iou' },
    { to: '/scplus/nft', icon: Layers, labelKey: 'scplus.nft' },
    { to: '/scplus/credentials', icon: BadgeCheck, labelKey: 'scplus.credentials' },
  ],
};

const xrplResources: NavSection = {
  titleKey: 'nav.xrplResources',
  items: [
    { icon: Globe, labelKey: 'nav.explorer', external: true, href: 'https://livenet.xrpl.org' },
    { icon: Droplets, labelKey: 'nav.faucet', external: true, href: 'https://xrpl.org/xrp-testnet-faucet.html' },
    { icon: BookOpen, labelKey: 'nav.docs', external: true, href: 'https://xrpl.org/docs.html' },
  ],
};

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Use titleKey (stable) instead of translated title (changes on language switch)
  const defaultExpandedKeys: string[] = ['nav.overview', 'scplus.title']; // SC+ Labs default expanded
  
  // Find current section based on pathname
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.to && location.pathname === item.to) {
        if (!defaultExpandedKeys.includes(section.titleKey)) {
          defaultExpandedKeys.push(section.titleKey);
        }
      }
    }
  }
  
  const allKeys = navSections.map(s => s.titleKey);
  const defaultCollapsed = allKeys.filter(key => !defaultExpandedKeys.includes(key));
  
  const [collapsedKeys, setCollapsedKeys] = useState<string[]>(defaultCollapsed);

  // Sync collapsed state when pathname changes (but preserve user's manual toggles)
  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== prevPathname.current) {
      prevPathname.current = location.pathname;
      // Recalculate default collapsed, but keep user's toggles
    }
  }, [location.pathname]);

  const toggleSection = (titleKey: string) => {
    setCollapsedKeys(prev => 
      prev.includes(titleKey) 
        ? prev.filter(k => k !== titleKey)
        : [...prev, titleKey]
    );
  };

  const isSectionCollapsed = (titleKey: string) => collapsedKeys.includes(titleKey);

  return (
    <aside className="w-64 glass-card border-r border-border/50 flex flex-col shrink-0">
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto overflow-x-hidden min-h-0">
        {navSections.map((section) => {
          return (
            <div key={section.titleKey} className="space-y-1">
              <button
                onClick={() => toggleSection(section.titleKey)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <span>{t(section.titleKey)}</span>
                {isSectionCollapsed(section.titleKey) ? (
                  <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                )}
              </button>
              {!isSectionCollapsed(section.titleKey) && (
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
        
        {/* SC+ Labs Section */}
        <div className="space-y-1 pt-4 border-t border-border/30">
          <button
            onClick={() => toggleSection(scplusResources.titleKey)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span>{t(scplusResources.titleKey)}</span>
            {isSectionCollapsed(scplusResources.titleKey) ? (
              <ChevronRight className="w-4 h-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            )}
          </button>
          {!isSectionCollapsed(scplusResources.titleKey) && (
            <div className="space-y-0.5 mt-1 pl-3">
              {scplusResources.items.map((item, index) => (
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
                ) : null
              ))}
            </div>
          )}
        </div>
        
        {/* XRPL Resources Section */}
        <div className="space-y-1 pt-4 border-t border-border/30">
          <button
            onClick={() => toggleSection(xrplResources.titleKey)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span>{t(xrplResources.titleKey)}</span>
            {isSectionCollapsed(xrplResources.titleKey) ? (
              <ChevronRight className="w-4 h-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 transition-transform duration-200" />
            )}
          </button>
          {!isSectionCollapsed(xrplResources.titleKey) && (
            <div className="space-y-0.5 mt-1 pl-3">
              {xrplResources.items.map((item, index) => (
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
