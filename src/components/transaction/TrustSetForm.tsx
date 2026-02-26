import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Eye, EyeOff, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  buildTrustSet,
  isValidCurrency,
  isValidXRPLAddress,
} from '@/lib/xrpl/transactions/trustset'
import type { TrustSet } from 'xrpl'

interface TrustSetFormData {
  currency: string
  issuer: string
  limit: string
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

  const {
    register,
    handleSubmit,
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
        const tx = buildTrustSet({
          Account: account,
          LimitAmount: {
            currency: currency.toUpperCase(),
            issuer: issuer,
            value: limit,
          },
        })
        setTransactionJson(tx)
        setBuildError(null)
      } catch {
        // Silent fail on auto-refresh
      }
    }

    validateAndBuild()
  }, [currency, issuer, limit, showPreview, account, trigger])

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
      const tx = buildTrustSet({
        Account: account,
        LimitAmount: {
          currency: currency.toUpperCase(),
          issuer: issuer,
          value: limit,
        },
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction'
      setBuildError(errorMsg)
      setTransactionJson(null)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Connection check FIRST (no validation)
    if (!isConnected && onConnectWallet) {
      onConnectWallet();
      return;
    }

    // 2. Form validation SECOND - use react-hook-form's handleSubmit
    handleSubmit(onFormSubmit)();
  };

  const onFormSubmit = async (data: TrustSetFormData) => {
    // Check if issuer is same as account
    if (data.issuer === account) {
      setBuildError('Cannot create a trust line to yourself (issuer cannot be the same as Account)');
      return;
    }
    setBuildError(null);

    const transaction = buildTrustSet({
      Account: account,
      LimitAmount: {
        currency: data.currency.toUpperCase(),
        issuer: data.issuer,
        value: data.limit,
      },
    });

    await onSubmit(transaction);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
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
        <p className="text-xs text-muted-foreground">
          {t('trustset.currencyHint')}
        </p>
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
        <p className="text-xs text-muted-foreground">
          {t('trustset.issuerHint')}
        </p>
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
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t('trustset.limitZeroInfo')}
          </p>
        </div>
      </div>

      {/* Build Error */}
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
