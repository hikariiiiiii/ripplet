import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { AlertCircle, Loader2, Eye, EyeOff, Wallet, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildMPTTransfer, isValidMPTIssuanceID } from '@/lib/xrpl/transactions/mpt'
import { isValidXRPLAddress } from '@/lib/xrpl/transactions/payment'
import type { Payment } from 'xrpl'

interface MPTTransferFormData {
  destination: string
  destinationTag: string
  mptIssuanceId: string
  amount: string
  memo: string
}

interface MPTTransferFormProps {
  account: string
  onSubmit: (transaction: Payment) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function MPTTransferForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTTransferFormProps) {
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
    setFocus,
    formState: { errors },
  } = useForm<MPTTransferFormData>({
    defaultValues: {
      destination: '',
      destinationTag: '',
      mptIssuanceId: '',
      amount: '',
      memo: '',
    },
  })

  const destination = watch('destination')
  const mptIssuanceId = watch('mptIssuanceId')
  const amount = watch('amount')
  const destinationTag = watch('destinationTag')
  const memo = watch('memo')

  // Auto-refresh Transaction JSON when form changes and preview is open
  useEffect(() => {
    if (!showPreview) return

    const validateAndBuild = async () => {
      const isValid = await trigger(['destination', 'mptIssuanceId', 'amount'])
      if (!isValid) return

      try {
        const tx = buildMPTTransfer({
          Account: account,
          Destination: destination,
          Amount: {
            mpt_issuance_id: mptIssuanceId,
            value: amount,
          },
          DestinationTag: destinationTag ? parseInt(destinationTag, 10) : undefined,
          Memos: memo
            ? [{ Memo: { MemoData: memo } }]
            : undefined,
        })
        setTransactionJson(tx)
      } catch {
        // Silent fail on auto-refresh
      }
    }

    validateAndBuild()
  }, [destination, mptIssuanceId, amount, destinationTag, memo, showPreview, account, trigger])

  const handlePreviewToggle = async () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }

    const fieldsToValidate = ['destination', 'mptIssuanceId', 'amount'] as const
    const isValid = await trigger(fieldsToValidate)
    if (!isValid) {
      // Focus on the first field with an error
      for (const field of fieldsToValidate) {
        if (errors[field]) {
          setFocus(field)
          break
        }
      }
      return
    }

    setBuildError(null)

    try {
      const tx = buildMPTTransfer({
        Account: account,
        Destination: destination,
        Amount: {
          mpt_issuance_id: mptIssuanceId,
          value: amount,
        },
        DestinationTag: destinationTag ? parseInt(destinationTag, 10) : undefined,
        Memos: memo
          ? [{ Memo: { MemoData: memo } }]
          : undefined,
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction'
      setBuildError(errorMsg)
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

  const onFormSubmit = async (data: MPTTransferFormData) => {
    setBuildError(null);

    try {
      const transaction = buildMPTTransfer({
        Account: account,
        Destination: data.destination,
        Amount: {
          mpt_issuance_id: data.mptIssuanceId,
          value: data.amount,
        },
        DestinationTag: data.destinationTag ? parseInt(data.destinationTag, 10) : undefined,
        Memos: data.memo
          ? [{ Memo: { MemoData: data.memo } }]
          : undefined,
      });
      await onSubmit(transaction);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction';
      setBuildError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="destination">{t('mptTransfer.destination')}</Label>
        <Input
          id="destination"
          type="text"
          placeholder="r..."
          className={`font-mono-address text-sm ${errors.destination ? 'border-destructive' : ''}`}
          {...register('destination', {
            required: t('mptTransfer.destinationRequired'),
            validate: (value: string) => {
              if (!isValidXRPLAddress(value)) {
                return t('mptTransfer.destinationInvalid')
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

      <div className="space-y-2">
        <Label htmlFor="mptIssuanceId">{t('mptTransfer.mptIssuanceId')}</Label>
        <Input
          id="mptIssuanceId"
          type="text"
          placeholder="0000..."
          className={`font-mono text-sm ${errors.mptIssuanceId ? 'border-destructive' : ''}`}
          {...register('mptIssuanceId', {
            required: t('mptTransfer.mptIssuanceIdRequired'),
            validate: (value: string) => {
              if (!isValidMPTIssuanceID(value)) {
                return t('mptTransfer.mptIssuanceIdInvalid')
              }
              return true
            },
          })}
        />
        {errors.mptIssuanceId && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.mptIssuanceId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t('mptTransfer.amount')}</Label>
        <Input
          id="amount"
          type="text"
          placeholder="0"
          className={`${errors.amount ? 'border-destructive' : ''}`}
          {...register('amount', {
            required: t('mptTransfer.amountRequired'),
            validate: (value: string) => {
              const num = parseFloat(value)
              if (isNaN(num) || num <= 0) {
                return t('mptTransfer.amountInvalid')
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
        <p className="text-xs text-muted-foreground">
          {t('mpt.amountPrecisionHint')}
        </p>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        <span>{t('common.advancedOptions')}</span>
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 pl-4 border-l-2 border-border/50 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="destinationTag">{t('mptTransfer.destinationTag')}</Label>
            <Input
              id="destinationTag"
              type="number"
              placeholder={t('mptTransfer.destinationTagPlaceholder')}
              className={errors.destinationTag ? 'border-destructive' : ''}
              {...register('destinationTag', {
                validate: (value: string) => {
                  if (!value) return true
                  const num = parseInt(value, 10)
                  if (isNaN(num) || num < 0 || num > 4294967295) {
                    return t('mptTransfer.destinationTagInvalid')
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="memo">{t('mptTransfer.memo')}</Label>
            <Input
              id="memo"
              type="text"
              placeholder={t('mptTransfer.memoPlaceholder')}
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
