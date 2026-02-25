import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, HelpCircle, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { buildAccountSet, ACCOUNT_FLAGS } from '@/lib/xrpl/transactions/accountset'
import type { AccountSet } from 'xrpl'

interface FlagConfig {
  key: string
  flagValue: number
  labelKey: string
  tooltipKey: string
}

const FLAGS_CONFIG: FlagConfig[] = [
  {
    key: 'defaultRipple',
    flagValue: ACCOUNT_FLAGS.asfDefaultRipple,
    labelKey: 'accountset.flags.defaultRipple',
    tooltipKey: 'accountset.flags.defaultRippleTooltip',
  },
  {
    key: 'requireAuth',
    flagValue: ACCOUNT_FLAGS.asfRequireAuth,
    labelKey: 'accountset.flags.requireAuth',
    tooltipKey: 'accountset.flags.requireAuthTooltip',
  },
  {
    key: 'disallowXRP',
    flagValue: ACCOUNT_FLAGS.asfDisallowXRP,
    labelKey: 'accountset.flags.disallowXRP',
    tooltipKey: 'accountset.flags.disallowXRPTooltip',
  },
  {
    key: 'requireDestTag',
    flagValue: ACCOUNT_FLAGS.asfRequireDestTag,
    labelKey: 'accountset.flags.requireDestTag',
    tooltipKey: 'accountset.flags.requireDestTagTooltip',
  },
]

interface AccountSetFormData {
  flags: {
    defaultRipple: boolean
    requireAuth: boolean
    disallowXRP: boolean
    requireDestTag: boolean
  }
  domain: string
}

interface AccountSetFormProps {
  account: string
  onSubmit: (transaction: AccountSet) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function AccountSetForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: AccountSetFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<AccountSet | null>(null)
  const [formData, setFormData] = useState<AccountSetFormData>({
    flags: {
      defaultRipple: false,
      requireAuth: false,
      disallowXRP: false,
      requireDestTag: false,
    },
    domain: '',
  })

  const handleFlagChange = (flagKey: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      flags: {
        ...prev.flags,
        [flagKey]: value,
      },
    }))
  }

  const handleDomainChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      domain: value,
    }))
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  // Note: AccountSet has no required fields, so we always build when preview is enabled
  useEffect(() => {
    if (!showPreview) return

    try {
      const enabledFlags = FLAGS_CONFIG.filter(
        (config) => formData.flags[config.key as keyof typeof formData.flags]
      )
      const setFlag = enabledFlags.length > 0 ? enabledFlags[0].flagValue : undefined

      const tx = buildAccountSet({
        Account: account,
        SetFlag: setFlag,
        Domain: formData.domain || undefined,
      })
      setTransactionJson(tx)
    } catch {
      // Silent fail on auto-refresh
    }
  }, [formData, showPreview, account])

  const handlePreviewToggle = () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }

    const enabledFlags = FLAGS_CONFIG.filter(
      (config) => formData.flags[config.key as keyof typeof formData.flags]
    )
    const setFlag = enabledFlags.length > 0 ? enabledFlags[0].flagValue : undefined

    const tx = buildAccountSet({
      Account: account,
      SetFlag: setFlag,
      Domain: formData.domain || undefined,
    })
    setTransactionJson(tx)
    setShowPreview(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    const enabledFlags = FLAGS_CONFIG.filter(
      (config) => formData.flags[config.key as keyof typeof formData.flags]
    )

    const setFlag = enabledFlags.length > 0 ? enabledFlags[0].flagValue : undefined

    const transaction = buildAccountSet({
      Account: account,
      SetFlag: setFlag,
      Domain: formData.domain || undefined,
    })

    await onSubmit(transaction)
  }

  return (
    
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('accountset.flagsTitle')}</h3>

          <div className="space-y-4">
            {FLAGS_CONFIG.map((config) => (
              <div
                key={config.key}
                className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4"
              >
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={config.key}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {t(config.labelKey)}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{t(config.tooltipKey)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id={config.key}
                  checked={
                    formData.flags[config.key as keyof typeof formData.flags]
                  }
                  onCheckedChange={(checked) =>
                    handleFlagChange(config.key, checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain">{t('accountset.domain')}</Label>
          <Input
            id="domain"
            type="text"
            placeholder={t('accountset.domainPlaceholder')}
            value={formData.domain}
            onChange={(e) => handleDomainChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t('accountset.domainHint')}
          </p>
        </div>

      {/* JSON Preview */}
      {transactionJson && showPreview && (
        <div className="code-block scanlines">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              Transaction JSON
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(transactionJson, null, 2))}
              className="h-6 text-xs"
            >
              Copy
            </Button>
          </div>
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(transactionJson, null, 2)}
          </pre>
        </div>
      )}


      {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviewToggle}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden sm:inline">{showPreview ? t('common.hide') : t('common.preview')}</span>
          </Button>
          <Button
            disabled={isSubmitting}
            className="flex-1 btn-glow bg-gradient-to-r from-xrpl-green to-xrpl-green-light hover:from-xrpl-green-light hover:to-xrpl-green text-background font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.loading')}
              </>
            ) : isConnected ? (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                {t('common.signAndSend')}
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                {t('wallet.connect')}
              </>
            )}
          </Button>
        </div>
      </form>
    
  )
}
