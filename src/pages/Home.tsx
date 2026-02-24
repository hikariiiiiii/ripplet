import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Send, 
  Wallet, 
  Copy,
  Check,
  Globe,
  Coins,
  Link2,
  Box,
  Layers,
  BadgeCheck,
  Lock,
  Settings,
  User,
  Trash2,
  UserCheck,
  Flame,
  Tags,
  CheckCircle,
  XCircle,
  PlusCircle,
  Undo2,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useWalletStore } from '@/stores/wallet';
import { Button } from '@/components/ui/button';
import { RippletLogo } from '@/components/common/RippletLogo';
import { useState, useEffect, useRef } from 'react';
import { WalletSelectModal } from '@/components/wallet/WalletSelectModal';

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface FeatureItem {
  to: string;
  icon: React.ElementType;
  labelKey: string;
}

interface CategoryCard {
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  features: FeatureItem[];
}

export default function Home() {
  const { t } = useTranslation();
  const { connected, address, networkInfo, disconnect } = useWalletStore();
  const [copied, setCopied] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const quickActions = [
    {
      title: t('home.paymentTitle'),
      description: t('home.paymentDescription'),
      icon: Send,
      href: '/xrp/payment',
      iconColor: 'text-xrpl-green',
      bgColor: 'bg-xrpl-green/10',
    },
    {
      title: t('home.trustSetTitle'),
      description: t('home.trustSetDescription'),
      icon: Link2,
      href: '/iou/trustset',
      iconColor: 'text-neon-cyan',
      bgColor: 'bg-neon-cyan/10',
    },
    {
      title: t('nav.mptTransfer'),
      description: t('mptTransfer.subtitle'),
      icon: Send,
      href: '/mpt/transfer',
      iconColor: 'text-neon-purple',
      bgColor: 'bg-neon-purple/10',
    },
    {
      title: t('nav.nftMint'),
      description: t('nftMint.title'),
      icon: Layers,
      href: '/nft/mint',
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
  ];

  const categories: CategoryCard[] = [
    {
      titleKey: 'home.categoryXRP',
      descKey: 'home.categoryXRPDesc',
      icon: Coins,
      color: 'text-xrpl-green',
      bgColor: 'bg-xrpl-green/10',
      features: [
        { to: '/xrp/payment', icon: Send, labelKey: 'nav.payment' },
        { to: '/xrp/escrow/create', icon: Lock, labelKey: 'nav.escrowCreate' },
        { to: '/xrp/escrow/finish', icon: CheckCircle, labelKey: 'nav.escrowFinish' },
        { to: '/xrp/escrow/cancel', icon: XCircle, labelKey: 'nav.escrowCancel' },
      ],
    },
    {
      titleKey: 'home.categoryIOU',
      descKey: 'home.categoryIOUDesc',
      icon: Link2,
      color: 'text-neon-cyan',
      bgColor: 'bg-neon-cyan/10',
      features: [
        { to: '/iou/trustset', icon: Link2, labelKey: 'nav.trustSet' },
        { to: '/iou/payment', icon: Coins, labelKey: 'nav.iouPayment' },
        { to: '/iou/escrow/create', icon: Lock, labelKey: 'nav.iouEscrowCreate' },
        { to: '/iou/escrow/finish', icon: CheckCircle, labelKey: 'nav.iouEscrowFinish' },
        { to: '/iou/escrow/cancel', icon: XCircle, labelKey: 'nav.iouEscrowCancel' },
        { to: '/iou/offercreate', icon: PlusCircle, labelKey: 'nav.offerCreate' },
        { to: '/iou/offercancel', icon: XCircle, labelKey: 'nav.offerCancel' },
      ],
    },
    {
      titleKey: 'home.categoryMPT',
      descKey: 'home.categoryMPTDesc',
      icon: Box,
      color: 'text-neon-purple',
      bgColor: 'bg-neon-purple/10',
      features: [
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
      titleKey: 'home.categoryNFT',
      descKey: 'home.categoryNFTDesc',
      icon: Layers,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      features: [
        { to: '/nft/mint', icon: Layers, labelKey: 'nav.nftMint' },
        { to: '/nft/burn', icon: Flame, labelKey: 'nav.nftBurn' },
        { to: '/nft/createoffer', icon: Tags, labelKey: 'nav.nftCreateOffer' },
        { to: '/nft/acceptoffer', icon: CheckCircle, labelKey: 'nav.nftAcceptOffer' },
        { to: '/nft/offercancel', icon: XCircle, labelKey: 'nav.nftCancelOffer' },
      ],
    },
    {
      titleKey: 'home.categoryCredential',
      descKey: 'home.categoryCredentialDesc',
      icon: BadgeCheck,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      features: [
        { to: '/credential/create', icon: BadgeCheck, labelKey: 'nav.credentialCreate' },
        { to: '/credential/accept', icon: CheckCircle, labelKey: 'nav.credentialAccept' },
        { to: '/credential/delete', icon: Trash2, labelKey: 'nav.credentialDelete' },
      ],
    },
  ];

  const accountFeatures = [
    { to: '/account/accountset', icon: Settings, labelKey: 'nav.accountSet' },
    { to: '/account/accountdelete', icon: Trash2, labelKey: 'nav.accountDelete' },
  ];

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-400/20 flex items-center justify-center shadow-lg border border-primary/30">
              <RippletLogo size={48} />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              {t('home.welcome')}
            </h1>
            <p className="text-muted-foreground">
              {t('home.welcomeDescription')}
            </p>
          </div>

          <Button
            size="lg"
            className="btn-primary text-background font-semibold px-8 py-6"
            onClick={() => setShowWalletModal(true)}
          >
            <Wallet className="w-5 h-5 mr-2" />
            {t('wallet.connect')}
          </Button>

          <WalletSelectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div 
        ref={cardRef}
        className="glass-card rounded-xl p-5 relative z-10"
        style={{ '--mouse-x': `${mousePosition.x}%`, '--mouse-y': `${mousePosition.y}%` } as React.CSSProperties}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-xrpl-green to-neon-blue flex items-center justify-center">
              <Wallet className="w-7 h-7 text-background" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {t('home.connectedAs')}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono-address text-lg text-foreground">
                  {address && truncateAddress(address)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-xrpl-green" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{networkInfo.name}</span>
              <div className="w-2 h-2 rounded-full bg-xrpl-green animate-pulse" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('wallet.disconnect')}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t('home.quickActions')}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                to={action.href}
                className="feature-card p-4 group"
                style={{ animationDelay: `${(index + 1) * 50}ms` } as React.CSSProperties}
              >
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <h3 className="font-medium text-sm group-hover:text-xrpl-green transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{t('home.features')}</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((category, catIndex) => {
            const CatIcon = category.icon;
            return (
              <div
                key={category.titleKey}
                className="glass-card rounded-xl p-4"
                style={{ animationDelay: `${(catIndex + 1) * 100}ms` } as React.CSSProperties}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${category.bgColor} flex items-center justify-center`}>
                    <CatIcon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t(category.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground">{t(category.descKey)}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50">
                    {category.features.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {category.features.map((feature) => {
                    const FeatureIcon = feature.icon;
                    return (
                      <Link
                        key={feature.to}
                        to={feature.to}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        <FeatureIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                          {t(feature.labelKey)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('nav.account')}</h3>
            <p className="text-xs text-muted-foreground">{t('accountset.subtitle')}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {accountFeatures.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
              <Link
                key={feature.to}
                to={feature.to}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
              >
                <FeatureIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {t(feature.labelKey)}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-xrpl-green group-hover:translate-x-0.5 transition-all ml-1" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
