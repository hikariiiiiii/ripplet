import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Send, 
  Shield, 
  Settings, 
  Wallet, 
  ArrowRight, 
  Layers,
  Coins,
  FileCheck,
  Database,
  Activity,
  Copy,
  Check,
  Terminal,
  Globe,
  ChevronRight,
  Sparkles
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

export default function Home() {
  const { t } = useTranslation();
  const { connected, address, networkInfo } = useWalletStore();
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
      href: '/payment',
      iconColor: 'text-accent',
    },
    {
      title: t('home.trustSetTitle'),
      description: t('home.trustSetDescription'),
      icon: Shield,
      href: '/trustset',
      iconColor: 'text-neon-cyan',
    },
    {
      title: t('home.accountSetTitle'),
      description: t('home.accountSetDescription'),
      icon: Settings,
      href: '/accountset',
      iconColor: 'text-neon-purple',
    },
  ];

  const comingSoonFeatures = [
    { title: 'NFT', icon: Layers, description: 'Non-Fungible Tokens' },
    { title: 'MPT', icon: Coins, description: 'Multi-Purpose Tokens' },
    { title: 'Credential', icon: FileCheck, description: 'Identity Verification' },
    { title: 'Vault', icon: Database, description: 'Secure Storage' },
  ];

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-animated-gradient bg-grid relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 bg-floating-orbs pointer-events-none" />
        
        <div className="max-w-md w-full text-center space-y-8 relative z-10">
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

          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-muted-foreground">{networkInfo.name}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">67+ Transaction Types</span>
            </div>
          </div>

          <WalletSelectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
        </div>
        </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-auto bg-animated-gradient bg-grid relative">
      {/* Background orbs */}
      <div className="absolute inset-0 bg-floating-orbs pointer-events-none" />
      
      <div 
        ref={cardRef}
        className="glass-card rounded-xl p-5 relative z-10"
        style={{ '--mouse-x': `${mousePosition.x}%`, '--mouse-y': `${mousePosition.y}%` } as React.CSSProperties}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-neon-blue flex items-center justify-center">
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
                    <Check className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/50">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{networkInfo.name}</span>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              to={action.href}
              className="feature-card p-5 group"
              style={{ animationDelay: `${(index + 1) * 100}ms` } as React.CSSProperties}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${action.iconColor}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
                
                <h3 className="text-lg font-semibold mb-1 group-hover:text-accent transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
                
                <div className="mt-4 pt-3 border-t border-border/30 flex items-center gap-2 text-xs text-muted-foreground">
                  <Terminal className="w-3 h-3 text-accent" />
                  <span className="font-mono-address">Build & Sign</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">Coming Soon</h3>
          </div>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50">
            Q2 2026
          </span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {comingSoonFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-accent/30 transition-colors"
              >
                <Icon className="w-5 h-5 text-muted-foreground mb-2" />
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-accent" />
          <span className="text-xs font-mono-address text-muted-foreground uppercase tracking-wider">Terminal</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        
        <div className="code-block">
          <div className="space-y-1">
            <div>
              <span className="code-key">status</span>
              <span className="text-muted-foreground">: </span>
              <span className="code-string">"connected"</span>
            </div>
            <div>
              <span className="code-key">network</span>
              <span className="text-muted-foreground">: </span>
              <span className="code-string">"{networkInfo.type}"</span>
            </div>
            <div>
              <span className="code-key">address</span>
              <span className="text-muted-foreground">: </span>
              <span className="code-string">"{address?.slice(0, 20)}..."</span>
            </div>
            <div>
              <span className="code-key">ready</span>
              <span className="text-muted-foreground">: </span>
              <span className="code-boolean">true</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
