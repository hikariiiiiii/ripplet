import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { AlertCircle, Loader2, Eye, EyeOff, Wallet, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { buildIOUPayment } from '@/lib/xrpl/transactions/ioupayment'
import { isValidXRPLAddress } from '@/lib/xrpl/transactions/payment'
import type { Payment } from 'xrpl'

interface IOUPaymentFormData {
  destination: string
  currency: string
  issuer: string
  amount: string
  destinationTag: string
  memo: string
}

interface IOUPaymentFormProps {
  account: string
  onSubmit: (transaction: Payment) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function IOUPaymentForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: IOUPaymentFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [transactionJson, setTransactionJson] = useState<Payment | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<IOUPaymentFormData>({
    defaultValues: {
      destination: '',
      currency: '',
      issuer: '',
      amount: '',
      destinationTag: '',
      memo: '',
    },
  })

  const watchedFields = watch()

  // Auto-refresh Transaction JSON when form changes and preview is open
  useEffect(() => {
    if (!showPreview) return

    const validateAndBuild = async () => {
      const isValid = await trigger(['destination', 'currency', 'issuer', 'amount'])
      if (!isValid) return

      try {
        const tx = buildIOUPayment({
          Account: account,
          Destination: watchedFields.destination,
          currency: watchedFields.currency,
          issuer: watchedFields.issuer,
          value: watchedFields.amount,
          DestinationTag: watchedFields.destinationTag
            ? parseInt(watchedFields.destinationTag, 10)
            : undefined,
          Memos: watchedFields.memo ? [{ data: watchedFields.memo }] : undefined,
        })
        setTransactionJson(tx)
      } catch {
        // Silent fail on auto-refresh
      }
    }

    validateAndBuild()
  }, [watchedFields, showPreview, account, trigger])

  const handlePreviewToggle = async () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }

    const isValid = await trigger(['destination', 'currency', 'issuer', 'amount'])
    if (!isValid) return

    setBuildError(null)

    try {
      const tx = buildIOUPayment({
        Account: account,
        Destination: watchedFields.destination,
        currency: watchedFields.currency,
        issuer: watchedFields.issuer,
        value: watchedFields.amount,
        DestinationTag: watchedFields.destinationTag
          ? parseInt(watchedFields.destinationTag, 10)
          : undefined,
        Memos: watchedFields.memo ? [{ data: watchedFields.memo }] : undefined,
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction'
      setBuildError(errorMsg)
    }
  }

  const onFormSubmit = async (data: IOUPaymentFormData) => {
    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    setBuildError(null)

    try {
      const transaction = buildIOUPayment({
        Account: account,
        Destination: data.destination,
        currency: data.currency,
        issuer: data.issuer,
        value: data.amount,
        DestinationTag: data.destinationTag
          ? parseInt(data.destinationTag, 10)
          : undefined,
        Memos: data.memo ? [{ data: data.memo }] : undefined,
      })
      await onSubmit(transaction)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction'
      setBuildError(errorMsg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="destination">{t('ioudPayment.destination')}</Label>
        <Input
          id="destination"
          type="text"
          placeholder="r..."
          className={`font-mono-address text-sm ${errors.destination ? 'border-destructive' : ''}`}
          {...register('destination', {
            required: t('ioudPayment.destinationRequired'),
            validate: (value: string) => {
              if (!isValidXRPLAddress(value)) {
                return t('ioudPayment.destinationInvalid')
              }
              return true
            },
          })}
        />
        {errors.destination && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.destination.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="currency">{t('ioudPayment.currency')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>3-40 character token symbol (e.g., USD, BTC, XRP)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="currency"
            type="text"
            placeholder="Currency code (e.g., USD)"
            className={`uppercase ${errors.currency ? 'border-destructive' : ''}`}
            {...register('currency', {
              required: t('ioudPayment.currencyRequired'),
              validate: (value: string) => {
                if (value.length < 3 || value.length > 40) {
                  return t('ioudPayment.currencyInvalid')
                }
                return true
              },
            })}
          />
          {errors.currency && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.currency.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="issuer">{t('ioudPayment.issuer')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('ioudPayment.issuerHint')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="issuer"
            type="text"
            placeholder="r..."
            className={`font-mono-address text-sm ${errors.issuer ? 'border-destructive' : ''}`}
            {...register('issuer', {
              required: t('ioudPayment.issuerRequired'),
              validate: (value: string) => {
                if (!isValidXRPLAddress(value)) {
                  return t('ioudPayment.issuerInvalid')
                }
                return true
              },
            })}
          />
          {errors.issuer && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.issuer.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t('ioudPayment.amount')}</Label>
        <Input
          id="amount"
          type="text"
          placeholder="0.00"
          className={`${errors.amount ? 'border-destructive' : ''}`}
          {...register('amount', {
            required: t('ioudPayment.amountRequired'),
            validate: (value: string) => {
              const num = parseFloat(value)
              if (isNaN(num) || num <= 0) {
                return t('ioudPayment.amountInvalid')
              }
              return true
            },
          })}
        />
        {errors.amount && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        <span>Advanced Options</span>
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 pl-4 border-l-2 border-border/50 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="destinationTag">{t('ioudPayment.destinationTag')}</Label>
            <Input
              id="destinationTag"
              type="number"
              placeholder={t('ioudPayment.destinationTagPlaceholder')}
              className={errors.destinationTag ? 'border-destructive' : ''}
              {...register('destinationTag', {
                validate: (value: string) => {
                  if (!value) return true
                  const num = parseInt(value, 10)
                  if (isNaN(num) || num < 0 || num > 4294967295) {
                    return t('ioudPayment.destinationTagInvalid')
                  }
                  return true
                },
              })}
            />
            {errors.destinationTag && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.destinationTag.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t('ioudPayment.destinationTagHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">{t('ioudPayment.memo')}</Label>
            <Input
              id="memo"
              type="text"
              placeholder={t('ioudPayment.memoPlaceholder')}
              className={errors.memo ? 'border-destructive' : ''}
              {...register('memo')}
            />
          </div>
        </div>
      )}

      {buildError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">
              {buildError}
            </p>
          </div>
        </div>
      )}

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

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handlePreviewToggle}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
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
              Sign & Send
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
