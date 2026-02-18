import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HelpCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
}

export function AccountSetForm({
  account,
  onSubmit,
  isSubmitting = false,
}: AccountSetFormProps) {
  const { t } = useTranslation()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('accountset.flags')}</h3>

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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            t('common.submit')
          )}
        </Button>
      </form>
    </TooltipProvider>
  )
}
