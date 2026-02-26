import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Wallet, ChevronDown, Copy, Check, LogOut, Loader2, Zap, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useWallet } from '@/lib/wallets'
import { useWalletStore } from '@/stores/wallet'
import type { WalletType } from '@/types'
import { cn } from '@/lib/utils'


function CrossmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="url(#crossmark-gradient)" />
      <path
        d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3" fill="white" />
      <defs>
        <linearGradient id="crossmark-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function GemwalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 4L28 12L16 28L4 12L16 4Z"
        fill="url(#gemwallet-gradient)"
      />
      <path
        d="M16 4L28 12L16 16L4 12L16 4Z"
        fill="url(#gemwallet-top)"
        opacity="0.8"
      />
      <path
        d="M4 12L16 16L16 28L4 12Z"
        fill="url(#gemwallet-left)"
        opacity="0.6"
      />
      <path
        d="M28 12L16 16L16 28L28 12Z"
        fill="url(#gemwallet-right)"
        opacity="0.4"
      />
      <defs>
        <linearGradient id="gemwallet-gradient" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="gemwallet-top" x1="4" y1="4" x2="28" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E879F9" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="gemwallet-left" x1="4" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7C3AED" />
          <stop offset="1" stopColor="#5B21B6" />
        </linearGradient>
        <linearGradient id="gemwallet-right" x1="28" y1="12" x2="16" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333EA" />
          <stop offset="1" stopColor="#581C87" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function XamanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#xaman-gradient)" />
      <path
        d="M8 12L12 8L16 12L20 8L24 12L20 16L24 20L20 24L16 20L12 24L8 20L12 16L8 12Z"
        fill="white"
      />
      <defs>
        <linearGradient id="xaman-gradient" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#23292F" />
          <stop offset="1" stopColor="#14181C" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const WALLET_OPTIONS: { type: WalletType; name: string; description: string; Icon: React.ComponentType<{ className?: string }>; installUrl?: string }[] = [
  {
    type: 'crossmark',
    name: 'Crossmark',
    description: 'Browser extension wallet',
    Icon: CrossmarkIcon,
    installUrl: 'https://crossmark.io/',
  },
  {
    type: 'gemwallet',
    name: 'Gemwallet',
    description: 'Browser extension wallet',
    Icon: GemwalletIcon,
    installUrl: 'https://gemwallet.app/',
  },
  {
    type: 'xaman',
    name: 'Xaman',
    description: 'Mobile wallet app',
    Icon: XamanIcon,
    installUrl: 'https://xaman.app/',
  },
]

export function WalletConnect() {
  const { t } = useTranslation()
  const { address, connected, connecting, walletType, connect, disconnect } = useWallet()
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async (type: WalletType) => {
    setError(null)
    
    try {
      await connect(type)
      setModalOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('wallet.connectionFailed')
      setError(message)
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    setModalOpen(false)
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  const selectedWallet = WALLET_OPTIONS.find((w) => w.type === walletType)

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setModalOpen(true)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-secondary/50',
            'border border-border/50',
            'hover:border-accent/30 transition-all duration-200',
            'group'
          )}
        >
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          {selectedWallet && <selectedWallet.Icon className="w-5 h-5" />}
          <span className="font-mono text-sm text-foreground">{formatAddress(address)}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                {t('wallet.connected')}
              </DialogTitle>
              <DialogDescription>
                {t('walletConnect.connectedDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              {selectedWallet && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <selectedWallet.Icon className="w-8 h-8" />
                  <div>
                    <p className="font-medium">{selectedWallet.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedWallet.description}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('walletConnect.address')}
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 rounded-lg bg-secondary/50 font-mono text-xs break-all">
                    {address}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyAddress}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-accent" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-accent animate-in fade-in slide-in-from-top-1">
                    {t('walletConnect.copiedToClipboard')}
                  </p>
                )}
              </div>

              <Button
                variant="destructive"
                className="w-full gap-2"
                onClick={handleDisconnect}
              >
                <LogOut className="w-4 h-4" />
                {t('wallet.disconnect')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Wallet className="w-4 h-4" />
          {t('wallet.connect')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle>{t('walletConnect.connectYourWallet')}</DialogTitle>
          <DialogDescription>
            {t('wallet.connectDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-4">
          {WALLET_OPTIONS.map((wallet) => (
            <button
              key={wallet.type}
              onClick={() => handleConnect(wallet.type)}
              disabled={connecting}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl',
                'bg-secondary/50 hover:bg-secondary/70',
                'border border-border/50 hover:border-accent/30',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'group text-left'
              )}
            >
              <div className="relative">
                <wallet.Icon className="w-10 h-10" />
                {connecting && walletType === wallet.type && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold group-hover:text-accent transition-colors">
                  {wallet.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {wallet.description}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 group-hover:text-accent transition-colors" />
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-destructive font-medium mb-1">{t('wallet.connectionFailed')}</p>
                <p className="text-xs text-destructive/80">{error}</p>
              </div>
            </div>
            {(error.includes('not found') || error.includes('not installed')) && (
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-xs text-muted-foreground mb-2">{t('walletConnect.installPrompt')}</p>
                <div className="flex flex-wrap gap-2">
                  {WALLET_OPTIONS.filter(w => w.installUrl).map(wallet => (
                    <a
                      key={wallet.type}
                      href={wallet.installUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
                    >
                      {wallet.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-sm text-muted-foreground">{t('wallet.connecting')}</p>
            </div>
          </div>
        )}
      </DialogContent>
  </Dialog>
  );
}

export function NetworkSwitch() {
  const { t } = useTranslation()
  const network = useWalletStore((state) => state.network)
  const setNetwork = useWalletStore((state) => state.setNetwork)

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50">
      <Zap className="w-4 h-4 text-amber-400" />
      <select
        value={network}
        onChange={(e) => setNetwork(e.target.value as 'mainnet' | 'testnet')}
        className="bg-transparent border-0 text-sm focus:ring-0 focus:outline-none cursor-pointer"
      >
        <option value="mainnet">{t('network.mainnet')}</option>
        <option value="testnet">{t('network.testnet')}</option>
      </select>
    </div>
  )
}
