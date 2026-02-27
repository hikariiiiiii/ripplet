import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, HelpCircle, Loader2, Wallet, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { buildAccountSet, ACCOUNT_FLAGS } from '@/lib/xrpl/transactions/accountset'
import type { AccountSet } from 'xrpl'

// Flag state type: 'unchanged' | 'set' | 'clear'
type FlagState = 'unchanged' | 'set' | 'clear'

// Flag configuration
interface FlagConfig {
  key: string
  flagValue: number
  labelKey: string
  tooltipKey: string
  irreversible?: boolean
}

// Flag group configuration
interface FlagGroupConfig {
  groupKey: string
  flags: FlagConfig[]
}

// All 15 flags organized into 6 groups
const FLAG_GROUPS: FlagGroupConfig[] = [
  {
    groupKey: 'accountset.flagGroups.basic',
    flags: [
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
        key: 'requireDestTag',
        flagValue: ACCOUNT_FLAGS.asfRequireDestTag,
        labelKey: 'accountset.flags.requireDestTag',
        tooltipKey: 'accountset.flags.requireDestTagTooltip',
      },
      {
        key: 'disallowXRP',
        flagValue: ACCOUNT_FLAGS.asfDisallowXRP,
        labelKey: 'accountset.flags.disallowXRP',
        tooltipKey: 'accountset.flags.disallowXRPTooltip',
      },
    ],
  },
  {
    groupKey: 'accountset.flagGroups.security',
    flags: [
      {
        key: 'disableMaster',
        flagValue: ACCOUNT_FLAGS.asfDisableMaster,
        labelKey: 'accountset.flags.disableMaster',
        tooltipKey: 'accountset.flags.disableMasterTooltip',
      },
      {
        key: 'accountTxnID',
        flagValue: ACCOUNT_FLAGS.asfAccountTxnID,
        labelKey: 'accountset.flags.accountTxnID',
        tooltipKey: 'accountset.flags.accountTxnIDTooltip',
      },
      {
        key: 'depositAuth',
        flagValue: ACCOUNT_FLAGS.asfDepositAuth,
        labelKey: 'accountset.flags.depositAuth',
        tooltipKey: 'accountset.flags.depositAuthTooltip',
      },
    ],
  },
  {
    groupKey: 'accountset.flagGroups.irreversible',
    flags: [
      {
        key: 'noFreeze',
        flagValue: ACCOUNT_FLAGS.asfNoFreeze,
        labelKey: 'accountset.flags.noFreeze',
        tooltipKey: 'accountset.flags.noFreezeTooltip',
        irreversible: true,
      },
      {
        key: 'allowTrustLineClawback',
        flagValue: ACCOUNT_FLAGS.asfAllowTrustLineClawback,
        labelKey: 'accountset.flags.allowTrustLineClawback',
        tooltipKey: 'accountset.flags.allowTrustLineClawbackTooltip',
        irreversible: true,
      },
    ],
  },
  {
    groupKey: 'accountset.flagGroups.globalControl',
    flags: [
      {
        key: 'globalFreeze',
        flagValue: ACCOUNT_FLAGS.asfGlobalFreeze,
        labelKey: 'accountset.flags.globalFreeze',
        tooltipKey: 'accountset.flags.globalFreezeTooltip',
      },
    ],
  },
  {
    groupKey: 'accountset.flagGroups.nft',
    flags: [
      {
        key: 'authorizedNFTokenMinter',
        flagValue: ACCOUNT_FLAGS.asfAuthorizedNFTokenMinter,
        labelKey: 'accountset.flags.authorizedNFTokenMinter',
        tooltipKey: 'accountset.flags.authorizedNFTokenMinterTooltip',
      },
    ],
  },
  {
    groupKey: 'accountset.flagGroups.disallowIncoming',
    flags: [
      {
        key: 'disallowIncomingNFTokenOffer',
        flagValue: ACCOUNT_FLAGS.asfDisallowIncomingNFTokenOffer,
        labelKey: 'accountset.flags.disallowIncomingNFTokenOffer',
        tooltipKey: 'accountset.flags.disallowIncomingNFTokenOfferTooltip',
      },
      {
        key: 'disallowIncomingCheck',
        flagValue: ACCOUNT_FLAGS.asfDisallowIncomingCheck,
        labelKey: 'accountset.flags.disallowIncomingCheck',
        tooltipKey: 'accountset.flags.disallowIncomingCheckTooltip',
      },
      {
        key: 'disallowIncomingPayChan',
        flagValue: ACCOUNT_FLAGS.asfDisallowIncomingPayChan,
        labelKey: 'accountset.flags.disallowIncomingPayChan',
        tooltipKey: 'accountset.flags.disallowIncomingPayChanTooltip',
      },
      {
        key: 'disallowIncomingTrustline',
        flagValue: ACCOUNT_FLAGS.asfDisallowIncomingTrustline,
        labelKey: 'accountset.flags.disallowIncomingTrustline',
        tooltipKey: 'accountset.flags.disallowIncomingTrustlineTooltip',
      },
    ],
  },
]

// Flatten all flags for easy lookup
const ALL_FLAGS = FLAG_GROUPS.flatMap((g) => g.flags)

// Create initial flag states
const createInitialFlagStates = (): Record<string, FlagState> => {
  const states: Record<string, FlagState> = {}
  ALL_FLAGS.forEach((flag) => {
    states[flag.key] = 'unchanged'
  })
  return states
}

interface AccountSetFormData {
  flags: Record<string, FlagState>
  domain: string
  transferRate: string
  emailHash: string
  messageKey: string
  nftokenMinter: string
  tickSize: string
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
    flags: createInitialFlagStates(),
    domain: '',
    transferRate: '',
    emailHash: '',
    messageKey: '',
    nftokenMinter: '',
    tickSize: '',
  })

  // Handle flag change - XRPL only allows ONE set or clear at a time
  const handleFlagChange = (flagKey: string, newState: FlagState) => {
    setFormData((prev) => {
      // If selecting 'set' or 'clear', reset all other flags to 'unchanged'
      if (newState !== 'unchanged') {
        const resetFlags = createInitialFlagStates()
        resetFlags[flagKey] = newState
        return { ...prev, flags: resetFlags }
      }
      // If selecting 'unchanged', just update this flag
      return {
        ...prev,
        flags: { ...prev.flags, [flagKey]: 'unchanged' },
      }
    })
  }

  // Handle field changes
  const handleFieldChange = (field: keyof AccountSetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Build transaction from form data
  const buildTransactionFromForm = (): AccountSet => {
    // Find the flag that has a non-unchanged state
    let setFlag: number | undefined
    let clearFlag: number | undefined

    for (const flag of ALL_FLAGS) {
      const state = formData.flags[flag.key]
      if (state === 'set') {
        setFlag = flag.flagValue
        break
      } else if (state === 'clear') {
        clearFlag = flag.flagValue
        break
      }
    }

    // Parse TransferRate (0 or 1000000000-2000000000)
    let transferRate: number | undefined
    if (formData.transferRate) {
      const parsed = parseInt(formData.transferRate, 10)
      if (!isNaN(parsed)) {
        transferRate = parsed
      }
    }

    // Parse TickSize (0 or 3-15)
    let tickSize: number | undefined
    if (formData.tickSize) {
      const parsed = parseInt(formData.tickSize, 10)
      if (!isNaN(parsed)) {
        tickSize = parsed
      }
    }

    return buildAccountSet({
      Account: account,
      SetFlag: setFlag,
      ClearFlag: clearFlag,
      Domain: formData.domain || undefined,
      TransferRate: transferRate,
      EmailHash: formData.emailHash || undefined,
      MessageKey: formData.messageKey || undefined,
      NFTokenMinter: formData.nftokenMinter || undefined,
      TickSize: tickSize,
    })
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    try {
      const tx = buildTransactionFromForm()
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

    try {
      const tx = buildTransactionFromForm()
      setTransactionJson(tx)
      setShowPreview(true)
    } catch (err) {
      console.error('Failed to build transaction:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    try {
      const transaction = buildTransactionFromForm()
      await onSubmit(transaction)
    } catch (err) {
      console.error('Failed to submit transaction:', err)
    }
  }

  // Render a single flag row with three-state radio buttons
  const renderFlagRow = (flag: FlagConfig) => {
    const currentState = formData.flags[flag.key]

    return (
      <div
        key={flag.key}
        className={`flex items-center justify-between rounded-lg border p-4 ${
          flag.irreversible
            ? 'border-red-500/30 bg-red-500/5'
            : 'border-border bg-card/50'
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <Label className="cursor-pointer text-sm font-medium">
            {t(flag.labelKey)}
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{t(flag.tooltipKey)}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <RadioGroup
          value={currentState}
          onValueChange={(value) => handleFlagChange(flag.key, value as FlagState)}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="unchanged" id={`${flag.key}-unchanged`} />
            <Label htmlFor={`${flag.key}-unchanged`} className="text-xs cursor-pointer">
              {t('accountset.flagState.unchanged')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="set" id={`${flag.key}-set`} />
            <Label htmlFor={`${flag.key}-set`} className="text-xs cursor-pointer text-green-500">
              {t('accountset.flagState.set')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="clear" id={`${flag.key}-clear`} />
            <Label htmlFor={`${flag.key}-clear`} className="text-xs cursor-pointer text-amber-500">
              {t('accountset.flagState.clear')}
            </Label>
          </div>
        </RadioGroup>
      </div>
    )
  }

  // Render a flag group
  const renderFlagGroup = (group: FlagGroupConfig) => {
    const hasIrreversible = group.flags.some((f) => f.irreversible)

    return (
      <div key={group.groupKey} className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">
          {t(group.groupKey)}
        </h4>
        <div className="space-y-2">
          {group.flags.map(renderFlagRow)}
        </div>
        {/* Irreversible warning box */}
        {hasIrreversible && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {t('accountset.irreversibleWarning')}
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                  {t('accountset.irreversibleWarningDesc')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Flags Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('accountset.flagsTitle')}</h3>
        <p className="text-xs text-muted-foreground">
          {t('accountset.flagsHint')}
        </p>
        <div className="space-y-6">
          {FLAG_GROUPS.map(renderFlagGroup)}
        </div>
      </div>

      {/* Fields Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('accountset.fieldsTitle')}</h3>

        {/* Domain */}
        <div className="space-y-2">
          <Label htmlFor="domain">{t('accountset.domain')}</Label>
          <Input
            id="domain"
            type="text"
            placeholder={t('accountset.domainPlaceholder')}
            value={formData.domain}
            onChange={(e) => handleFieldChange('domain', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t('accountset.domainHint')}
          </p>
        </div>

        {/* TransferRate */}
        <div className="space-y-2">
          <Label htmlFor="transferRate">{t('accountset.transferRate')}</Label>
          <Input
            id="transferRate"
            type="number"
            placeholder={t('accountset.transferRatePlaceholder')}
            value={formData.transferRate}
            onChange={(e) => handleFieldChange('transferRate', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t('accountset.transferRateHint')}
          </p>
        </div>

        {/* EmailHash */}
        <div className="space-y-2">
          <Label htmlFor="emailHash">{t('accountset.emailHash')}</Label>
          <Input
            id="emailHash"
            type="text"
            placeholder={t('accountset.emailHashPlaceholder')}
            value={formData.emailHash}
            onChange={(e) => handleFieldChange('emailHash', e.target.value)}
            maxLength={32}
          />
          <p className="text-xs text-muted-foreground">
            {t('accountset.emailHashHint')}
          </p>
        </div>

        {/* MessageKey */}
        <div className="space-y-2">
          <Label htmlFor="messageKey">{t('accountset.messageKey')}</Label>
          <Input
            id="messageKey"
            type="text"
            placeholder={t('accountset.messageKeyPlaceholder')}
            value={formData.messageKey}
            onChange={(e) => handleFieldChange('messageKey', e.target.value)}
            maxLength={66}
          />
          <p className="text-xs text-muted-foreground">
            {t('accountset.messageKeyHint')}
          </p>
        </div>

        {/* NFTokenMinter */}
        <div className="space-y-2">
          <Label htmlFor="nftokenMinter">{t('accountset.nftokenMinter')}</Label>
          <Input
            id="nftokenMinter"
            type="text"
            placeholder={t('accountset.nftokenMinterPlaceholder')}
            value={formData.nftokenMinter}
            onChange={(e) => handleFieldChange('nftokenMinter', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t('accountset.nftokenMinterHint')}
          </p>
        </div>

        {/* TickSize */}
        <div className="space-y-2">
          <Label htmlFor="tickSize">{t('accountset.tickSize')}</Label>
          <Input
            id="tickSize"
            type="number"
            placeholder={t('accountset.tickSizePlaceholder')}
            value={formData.tickSize}
            onChange={(e) => handleFieldChange('tickSize', e.target.value)}
            min={0}
            max={15}
          />
          <p className="text-xs text-muted-foreground">
            {t('accountset.tickSizeHint')}
          </p>
        </div>
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
          type="submit"
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
