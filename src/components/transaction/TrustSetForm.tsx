import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AlertCircle, AlertTriangle, ChevronRight, Eye, EyeOff, HelpCircle, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  buildTrustSet,
  isValidCurrency,
  isValidXRPLAddress,
  TRUST_SET_FLAGS,
} from '@/lib/xrpl/transactions/trustset'
import { cn } from '@/lib/utils'
import type { TrustSet } from 'xrpl'

interface TrustSetFormData {
  currency: string
  issuer: string
  limit: string
}

interface TrustSetFlags {
  setAuth: boolean
  setNoRipple: boolean
  clearNoRipple: boolean
  setFreeze: boolean
  clearFreeze: boolean
  setDeepFreeze: boolean
  clearDeepFreeze: boolean
}

interface TrustSetFormProps {
  account: string
  onSubmit: (transaction: TrustSet) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function TrustSetForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: TrustSetFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<TrustSet | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [qualityIn, setQualityIn] = useState('')
  const [qualityOut, setQualityOut] = useState('')

  const [flags, setFlags] = useState<TrustSetFlags>({
    setAuth: false,
    setNoRipple: false,
    clearNoRipple: false,
    setFreeze: false,
    clearFreeze: false,
    setDeepFreeze: false,
    clearDeepFreeze: false,
  })

  const {
    register,
    watch,
    trigger,
    formState: { errors },
  } = useForm<TrustSetFormData>({
    defaultValues: {
      currency: '',
      issuer: '',
      limit: '',
    },
  })

  const currency = watch('currency')
  const issuer = watch('issuer')
  const limit = watch('limit')

  // Handle flag changes with smart mutual exclusion
  const handleFlagChange = (flagKey: keyof TrustSetFlags, checked: boolean) => {
    setFlags((prev) => {
      const newFlags = { ...prev, [flagKey]: checked }

      // Smart mutual exclusion for NoRipple
      if (flagKey === 'setNoRipple' && checked) {
        newFlags.clearNoRipple = false
      } else if (flagKey === 'clearNoRipple' && checked) {
        newFlags.setNoRipple = false
      }

      // Smart mutual exclusion for Freeze
      if (flagKey === 'setFreeze' && checked) {
        newFlags.clearFreeze = false
      } else if (flagKey === 'clearFreeze' && checked) {
        newFlags.setFreeze = false
      }

      // Smart mutual exclusion for DeepFreeze
      if (flagKey === 'setDeepFreeze' && checked) {
        newFlags.clearDeepFreeze = false
      } else if (flagKey === 'clearDeepFreeze' && checked) {
        newFlags.setDeepFreeze = false
      }

      return newFlags
    })
  }

  // Combine flags using bitwise OR
  const calculateFlagsValue = (): number => {
    let flagsValue = 0
    if (flags.setAuth) flagsValue |= TRUST_SET_FLAGS.tfSetfAuth
    if (flags.setNoRipple) flagsValue |= TRUST_SET_FLAGS.tfSetNoRipple
    if (flags.clearNoRipple) flagsValue |= TRUST_SET_FLAGS.tfClearNoRipple
    if (flags.setFreeze) flagsValue |= TRUST_SET_FLAGS.tfSetFreeze
    if (flags.clearFreeze) flagsValue |= TRUST_SET_FLAGS.tfClearFreeze
    if (flags.setDeepFreeze) flagsValue |= TRUST_SET_FLAGS.tfSetDeepFreeze
    if (flags.clearDeepFreeze) flagsValue |= TRUST_SET_FLAGS.tfClearDeepFreeze
    return flagsValue
  }

  // Check if any freeze-related flag is set (for warning box)
  const hasFreezeFlags = flags.setFreeze || flags.clearFreeze || flags.setDeepFreeze || flags.clearDeepFreeze

  // Build transaction object
  const buildTransaction = () => {
    const flagsValue = calculateFlagsValue()
    const parsedQualityIn = qualityIn ? parseInt(qualityIn, 10) : undefined
    const parsedQualityOut = qualityOut ? parseInt(qualityOut, 10) : undefined

    return buildTrustSet({
      Account: account,
      LimitAmount: {
        currency: currency.toUpperCase(),
        issuer: issuer,
        value: limit,
      },
      Flags: flagsValue || undefined,
      QualityIn: parsedQualityIn,
      QualityOut: parsedQualityOut,
    })
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    const validateAndBuild = async () => {
      const isValid = await trigger(['currency', 'issuer', 'limit'])
      if (!isValid) return

      // Check if issuer is same as account
      if (issuer === account) {
        return
      }

      try {
        const tx = buildTransaction()
        setTransactionJson(tx)
        setBuildError(null)
      } catch {
        // Silent fail on auto-refresh
      }
    }

    validateAndBuild()
  }, [currency, issuer, limit, flags, qualityIn, qualityOut, showPreview, account, trigger])

  const handlePreviewToggle = async () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }

    // Validate required fields
    const isValid = await trigger(['currency', 'issuer', 'limit'])
    if (!isValid) return

    // Double check fields have values
    if (!currency || !issuer || !limit) {
      return
    }

    // Check if issuer is same as account
    if (issuer === account) {
      setBuildError('Cannot create a trust line to yourself (issuer cannot be the same as Account)')
      return
    }
    setBuildError(null)

    try {
      const tx = buildTransaction()
      setTransactionJson(tx)
      setShowPreview(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction'
      setBuildError(errorMsg)
      setTransactionJson(null)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Connection check FIRST (no validation)
    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    // 2. Form validation SECOND
    const isValid = await trigger(['currency', 'issuer', 'limit'])
    if (!isValid) return

    // Check if issuer is same as account
    if (issuer === account) {
      setBuildError('Cannot create a trust line to yourself (issuer cannot be the same as Account)')
      return
    }
    setBuildError(null)

    try {
      const transaction = buildTransaction()
      await onSubmit(transaction)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction'
      setBuildError(errorMsg)
    }
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Trust Line Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t('trustset.trustLine')}
        </h3>

        <div className="space-y-2">
          <Label htmlFor="currency">{t('trustset.currency')}</Label>
          <Input
            id="currency"
            type="text"
            placeholder="Currency code"
            maxLength={40}
            {...register('currency', {
              required: t('trustset.currencyRequired'),
              validate: (value: string) => {
                const upperValue = value.toUpperCase()
                if (!isValidCurrency(upperValue)) {
                  return t('trustset.currencyInvalid')
                }
                return true
              },
            })}
            className={errors.currency ? 'border-destructive' : ''}
          />
          {errors.currency && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.currency.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t('trustset.currencyHint')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuer">{t('trustset.issuer')}</Label>
          <Input
            id="issuer"
            type="text"
            placeholder="r..."
            {...register('issuer', {
              required: t('trustset.issuerRequired'),
              validate: (value: string) => {
                if (!isValidXRPLAddress(value)) {
                  return t('trustset.issuerInvalid')
                }
                return true
              },
            })}
            className={errors.issuer ? 'border-destructive' : ''}
          />
          {errors.issuer && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.issuer.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{t('trustset.issuerHint')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="limit">{t('trustset.limit')}</Label>
          <Input
            id="limit"
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            {...register('limit', {
              required: t('trustset.limitRequired'),
              validate: (value: string) => {
                const num = parseFloat(value)
                if (isNaN(num) || num < 0) {
                  return t('trustset.limitInvalid')
                }
                return true
              },
            })}
            className={errors.limit ? 'border-destructive' : ''}
          />
          {errors.limit && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.limit.message}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-600 dark:text-amber-400">{t('trustset.limitZeroInfo')}</p>
          </div>
        </div>
      </div>

      {/* Flags Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t('trustset.flagsTitle')}
        </h3>

        {/* Authorize Holding - single checkbox with title */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm">{t('trustset.flags.authorizeHolding')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('trustset.flags.authorizeHoldingTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-6 pl-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="setAuth"
                checked={flags.setAuth}
                onCheckedChange={(checked) => handleFlagChange('setAuth', checked === true)}
              />
              <Label htmlFor="setAuth" className="cursor-pointer text-sm font-normal">
                {t('trustset.flags.setAuth')}
              </Label>
            </div>
          </div>
        </div>
        {/* NoRipple - set/clear pair */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm">{t('trustset.flags.noRipple')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('trustset.flags.noRippleTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-6 pl-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="setNoRipple"
                checked={flags.setNoRipple}
                onCheckedChange={(checked) => handleFlagChange('setNoRipple', checked === true)}
              />
              <Label htmlFor="setNoRipple" className="cursor-pointer text-sm font-normal">
                {t('trustset.flags.setNoRipple')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="clearNoRipple"
                checked={flags.clearNoRipple}
                onCheckedChange={(checked) => handleFlagChange('clearNoRipple', checked === true)}
              />
              <Label htmlFor="clearNoRipple" className="cursor-pointer text-sm font-normal">
                {t('trustset.flags.clearNoRipple')}
              </Label>
            </div>
          </div>
        </div>
        {/* Freeze - set/clear pair */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm">{t('trustset.flags.freeze')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('trustset.flags.freezeTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-6 pl-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="setFreeze"
                checked={flags.setFreeze}
                onCheckedChange={(checked) => handleFlagChange('setFreeze', checked === true)}
              />
              <Label htmlFor="setFreeze" className="cursor-pointer text-sm font-normal">
                {t('trustset.flags.setFreeze')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="clearFreeze"
                checked={flags.clearFreeze}
                onCheckedChange={(checked) => handleFlagChange('clearFreeze', checked === true)}
              />
              <Label htmlFor="clearFreeze" className="cursor-pointer text-sm font-normal">
                {t('trustset.flags.clearFreeze')}
              </Label>
            </div>
          </div>
        </div>
        {/* DeepFreeze - set/clear pair */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm">{t('trustset.flags.deepFreeze')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('trustset.flags.deepFreezeTooltip')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-6 pl-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="setDeepFreeze"
                checked={flags.setDeepFreeze}
                onCheckedChange={(checked) => handleFlagChange('setDeepFreeze', checked === true)}
              />
              <Label htmlFor="setDeepFreeze" className="cursor-pointer text-sm font-normal">
                {t('trustset.flags.setDeepFreeze')}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="clearDeepFreeze"
                checked={flags.clearDeepFreeze}
                onCheckedChange={(checked) => handleFlagChange('clearDeepFreeze', checked === true)}
              />
              <Label htmlFor="clearDeepFreeze" className="cursor-pointer text-sm font-normal">
                {t('trustset.flags.clearDeepFreeze')}
              </Label>
            </div>
          </div>
        </div>
        {/* Freeze Warning Box */}
        {hasFreezeFlags && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {t('trustset.freezeWarningTitle')}
                </p>
                <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                  {t('trustset.freezeWarning')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Options - Collapsible */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
          <ChevronRight
            className={cn('h-4 w-4 transition-transform duration-200', showAdvanced && 'rotate-90')}
          />
          {t('trustset.advancedOptions')}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="qualityIn">{t('trustset.qualityIn')}</Label>
            <Input
              id="qualityIn"
              type="number"
              min="0"
              max="4294967295"
              placeholder="0 - 4294967295"
              value={qualityIn}
              onChange={(e) => setQualityIn(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t('trustset.qualityInHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualityOut">{t('trustset.qualityOut')}</Label>
            <Input
              id="qualityOut"
              type="number"
              min="0"
              max="4294967295"
              placeholder="0 - 4294967295"
              value={qualityOut}
              onChange={(e) => setQualityOut(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t('trustset.qualityOutHint')}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Build Error */}
      {buildError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{buildError}</p>
          </div>
        </div>
      )}

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
          <pre className="text-xs overflow-x-auto">{JSON.stringify(transactionJson, null, 2)}</pre>
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
