import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { AlertCircle, Loader2, Eye, EyeOff, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildMPTClawback, isValidMPTIssuanceID, type MPTAmount } from '@/lib/xrpl/transactions/mpt'
import { isValidXRPLAddress } from '@/lib/xrpl/transactions/payment'
import type { Clawback } from 'xrpl'

interface MPTClawbackFormData {
  holder: string
  mptIssuanceId: string
  amount: string
}

interface MPTClawbackFormProps {
  account: string
  onSubmit: (transaction: Clawback) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function MPTClawbackForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTClawbackFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<Clawback | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<MPTClawbackFormData>({
    defaultValues: {
      holder: '',
      mptIssuanceId: '',
      amount: '',
    },
  })

  const watchedFields = watch()

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return;

    const validateAndBuild = async () => {
      const isValid = await trigger(['holder', 'mptIssuanceId', 'amount']);
      if (!isValid) return;

      try {
        const amount: MPTAmount = {
          mpt_issuance_id: watchedFields.mptIssuanceId,
          value: watchedFields.amount,
        };
        
        const tx = buildMPTClawback({
          Account: account,
          Holder: watchedFields.holder,
          Amount: amount,
        });
        setTransactionJson(tx);
      } catch {
        // Silent fail on auto-refresh
      }
    };

    validateAndBuild();
  }, [watchedFields, showPreview, account, trigger]);

  const handlePreviewToggle = async () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }

    const isValid = await trigger(['holder', 'mptIssuanceId', 'amount'])
    if (!isValid) return

    setBuildError(null)

    try {
      const amount: MPTAmount = {
        mpt_issuance_id: watchedFields.mptIssuanceId,
        value: watchedFields.amount,
      }
      
      const tx = buildMPTClawback({
        Account: account,
        Holder: watchedFields.holder,
        Amount: amount,
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

  const onFormSubmit = async (data: MPTClawbackFormData) => {
    setBuildError(null);

    try {
      const amount: MPTAmount = {
        mpt_issuance_id: data.mptIssuanceId,
        value: data.amount,
      };

      const transaction = buildMPTClawback({
        Account: account,
        Holder: data.holder,
        Amount: amount,
      });
      await onSubmit(transaction);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction';
      setBuildError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {t('mptClawback.warningTitle')}
            </p>
            <ul className="text-sm text-amber-600/80 dark:text-amber-400/80 space-y-1 list-disc list-inside">
              <li>Clawback requires the MPT issuance to have clawback enabled</li>
              <li>Tokens will be returned to the issuer</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="holder">{t('mptClawback.holder')}</Label>
        <Input
          id="holder"
          type="text"
          placeholder="r..."
          className={`font-mono-address text-sm ${errors.holder ? 'border-destructive' : ''}`}
          {...register('holder', {
            required: t('mptClawback.holderRequired'),
            validate: (value: string) => {
              if (!isValidXRPLAddress(value)) {
                return t('mptClawback.holderInvalid')
              }
              return true
            },
          })}
        />
        {errors.holder && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.holder.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="mptIssuanceId">{t('mptClawback.mptIssuanceId')}</Label>
        <Input
          id="mptIssuanceId"
          type="text"
          placeholder="0000..."
          className={`font-mono text-sm ${errors.mptIssuanceId ? 'border-destructive' : ''}`}
          {...register('mptIssuanceId', {
            required: t('mptClawback.mptIssuanceIdRequired'),
            validate: (value: string) => {
              if (!isValidMPTIssuanceID(value)) {
                return t('mptClawback.mptIssuanceIdInvalid')
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
        <Label htmlFor="amount">{t('mptClawback.amount')}</Label>
        <Input
          id="amount"
          type="text"
          placeholder="0.00"
          className={`${errors.amount ? 'border-destructive' : ''}`}
          {...register('amount', {
            required: t('mptClawback.amountRequired'),
            validate: (value: string) => {
              const num = parseFloat(value)
              if (isNaN(num) || num <= 0) {
                return t('mptClawback.amountInvalid')
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
