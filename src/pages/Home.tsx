import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Send, Shield, Settings, Wallet, ArrowRight, Zap } from 'lucide-react';
import { useWalletStore } from '@/stores/wallet';
import { Button } from '@/components/ui/button';

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Home() {
  const { t } = useTranslation();
  const { connected, address, networkInfo } = useWalletStore();

  const quickActions = [
    {
      title: t('home.paymentTitle'),
      description: t('home.paymentDescription'),
      icon: Send,
      href: '/payment',
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
    },
    {
      title: t('home.trustSetTitle'),
      description: t('home.trustSetDescription'),
      icon: Shield,
      href: '/trustset',
      gradient: 'from-violet-500/20 to-purple-500/20',
      iconBg: 'bg-violet-500/20',
      iconColor: 'text-violet-400',
      border: 'border-violet-500/20 hover:border-violet-500/40',
    },
    {
      title: t('home.accountSetTitle'),
      description: t('home.accountSetDescription'),
      icon: Settings,
      href: '/accountset',
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      border: 'border-amber-500/20 hover:border-amber-500/40',
    },
  ];

  if (!connected) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/25">
              <Zap className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            {t('home.welcome')}
          </h1>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            {t('home.welcomeDescription')}
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
          >
            <Wallet className="w-5 h-5 mr-2" />
            {t('wallet.connect')}
          </Button>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <div className={`w-2 h-2 rounded-full ${networkInfo.type === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>{networkInfo.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">{t('home.connectedAs')}</p>
                  <p className="text-lg font-mono text-white tracking-wide">
                    {address && truncateAddress(address)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50">
                <div className={`w-2 h-2 rounded-full animate-pulse ${networkInfo.type === 'mainnet' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm text-slate-300">{networkInfo.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span>{t('home.quickActions')}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  to={action.href}
                  className={`group relative bg-gradient-to-br ${action.gradient} backdrop-blur-sm border ${action.border} rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${action.iconColor}`} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
