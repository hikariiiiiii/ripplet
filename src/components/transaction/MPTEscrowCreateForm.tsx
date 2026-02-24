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
import { buildMPTEscrowCreate } from '@/lib/xrpl/transactions/escrow'
import { isValidXRPLAddress } from '@/lib/xrpl/transactions/payment'
import type { EscrowCreate } from 'xrpl'

interface MPTEscrowCreateFormData {
  destination: string
  destinationTag: string
  mptIssuanceId: string
  amount: string
  finishAfter: string
  cancelAfter: string
  condition: string
}

interface MPTEscrowCreateFormProps {
  account: string
  onSubmit: (transaction: EscrowCreate) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function MPTEscrowCreateForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTEscrowCreateFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [transactionJson, setTransactionJson] = useState<EscrowCreate | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<MPTEscrowCreateFormData>({
    defaultValues: {
      destination: '',
      destinationTag: '',
      mptIssuanceId: '',
      amount: '',
      finishAfter: '',
      cancelAfter: '',
      condition: '',
    },
  })

  const watchedFields = watch()

  // Auto-refresh Transaction JSON when form changes and preview is open
  useEffect(() => {
    if (!showPreview) return

    const validateAndBuild = async () => {
      const isValid = await trigger(['destination', 'mptIssuanceId', 'amount'])
      if (!isValid) return

      try {
        const finishAfterValue = watchedFields.finishAfter
          ? parseInt(watchedFields.finishAfter, 10)
          : undefined
        const cancelAfterValue = watchedFields.cancelAfter
          ? parseInt(watchedFields.cancelAfter, 10)
          : undefined

        if (finishAfterValue !== undefined && cancelAfterValue !== undefined) {
          if (finishAfterValue >= cancelAfterValue) return
        }

        const tx = buildMPTEscrowCreate({
          Account: account,
          Destination: watchedFields.destination,
          Amount: {
            mpt_issuance_id: watchedFields.mptIssuanceId,
            value: watchedFields.amount,
          },
          DestinationTag: watchedFields.destinationTag
            ? parseInt(watchedFields.destinationTag, 10)
            : undefined,
          FinishAfter: finishAfterValue,
          CancelAfter: cancelAfterValue,
          Condition: watchedFields.condition || undefined,
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

    const isValid = await trigger(['destination', 'mptIssuanceId', 'amount'])
    if (!isValid) return

    setBuildError(null)

    try {
      const finishAfterValue = watchedFields.finishAfter
        ? parseInt(watchedFields.finishAfter, 10)
        : undefined
      const cancelAfterValue = watchedFields.cancelAfter
        ? parseInt(watchedFields.cancelAfter, 10)
        : undefined

      // Validate finishAfter < cancelAfter if both provided
      if (finishAfterValue !== undefined && cancelAfterValue !== undefined) {
        if (finishAfterValue >= cancelAfterValue) {
          setBuildError(t('mpt.escrowCreate.finishAfterInvalid'))
          return
        }
      }

      const tx = buildMPTEscrowCreate({
        Account: account,
        Destination: watchedFields.destination,
        Amount: {
          mpt_issuance_id: watchedFields.mptIssuanceId,
          value: watchedFields.amount,
        },
        DestinationTag: watchedFields.destinationTag
          ? parseInt(watchedFields.destinationTag, 10)
          : undefined,
        FinishAfter: finishAfterValue,
        CancelAfter: cancelAfterValue,
        Condition: watchedFields.condition || undefined,
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction'
      setBuildError(errorMsg)
    }
  }

  const onFormSubmit = async (data: MPTEscrowCreateFormData) => {
    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    setBuildError(null)

    try {
      const finishAfterValue = data.finishAfter
        ? parseInt(data.finishAfter, 10)
        : undefined
      const cancelAfterValue = data.cancelAfter
        ? parseInt(data.cancelAfter, 10)
        : undefined

      // Validate finishAfter < cancelAfter if both provided
      if (finishAfterValue !== undefined && cancelAfterValue !== undefined) {
        if (finishAfterValue >= cancelAfterValue) {
          setBuildError(t('mpt.escrowCreate.finishAfterInvalid'))
          return
        }
      }

      const transaction = buildMPTEscrowCreate({
        Account: account,
        Destination: data.destination,
        Amount: {
          mpt_issuance_id: data.mptIssuanceId,
          value: data.amount,
        },
        DestinationTag: data.destinationTag
          ? parseInt(data.destinationTag, 10)
          : undefined,
        FinishAfter: finishAfterValue,
        CancelAfter: cancelAfterValue,
        Condition: data.condition || undefined,
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
        <Label htmlFor="destination">{t('mpt.escrowCreate.destination')}</Label>
        <Input
          id="destination"
          type="text"
          placeholder="r..."
          className={`font-mono-address text-sm ${errors.destination ? 'border-destructive' : ''}`}
          {...register('destination', {
            required: t('mpt.escrowCreate.destinationRequired'),
            validate: (value: string) => {
              if (!isValidXRPLAddress(value)) {
                return t('mpt.escrowCreate.destinationInvalid')
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
        <div className="flex items-center gap-2">
          <Label htmlFor="mptIssuanceId">{t('mpt.escrowCreate.mptIssuanceId')}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>48-character hex string identifying the MPT issuance</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="mptIssuanceId"
          type="text"
          placeholder="00070C4495F14B0E44F78A264E41713C64B5F89242540EE255534400000000000000"
          className={`font-mono text-sm ${errors.mptIssuanceId ? 'border-destructive' : ''}`}
          {...register('mptIssuanceId', {
            required: t('mpt.escrowCreate.mptIssuanceIdRequired'),
            validate: (value: string) => {
              if (value.length !== 48 || !/^[0-9A-Fa-f]+$/.test(value)) {
                return t('mpt.escrowCreate.mptIssuanceIdInvalid')
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
        <Label htmlFor="amount">{t('mpt.escrowCreate.amount')}</Label>
        <Input
          id="amount"
          type="text"
          placeholder="0.00"
          className={`${errors.amount ? 'border-destructive' : ''}`}
          {...register('amount', {
            required: t('mpt.escrowCreate.amountRequired'),
            validate: (value: string) => {
              const num = parseFloat(value)
              if (isNaN(num) || num <= 0) {
                return t('mpt.escrowCreate.amountInvalid')
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="finishAfter">{t('mpt.escrowCreate.finishAfter')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('mpt.escrowCreate.finishAfterHint')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="finishAfter"
            type="number"
            placeholder={t('mpt.escrowCreate.finishAfterPlaceholder')}
            className={errors.finishAfter ? 'border-destructive' : ''}
            {...register('finishAfter', {
              validate: (value: string) => {
                if (!value) return true
                const num = parseInt(value, 10)
                if (isNaN(num) || num < 0) {
                  return t('mpt.escrowCreate.ledgerIndexInvalid')
                }
                return true
              },
            })}
          />
          {errors.finishAfter && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.finishAfter.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="cancelAfter">{t('mpt.escrowCreate.cancelAfter')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('mpt.escrowCreate.cancelAfterHint')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="cancelAfter"
            type="number"
            placeholder={t('mpt.escrowCreate.cancelAfterPlaceholder')}
            className={errors.cancelAfter ? 'border-destructive' : ''}
            {...register('cancelAfter', {
              validate: (value: string) => {
                if (!value) return true
                const num = parseInt(value, 10)
                if (isNaN(num) || num < 0) {
                  return t('mpt.escrowCreate.ledgerIndexInvalid')
                }
                return true
              },
            })}
          />
          {errors.cancelAfter && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.cancelAfter.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="condition">{t('mpt.escrowCreate.condition')}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{t('mpt.escrowCreate.conditionHint')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="condition"
          type="text"
          placeholder={t('mpt.escrowCreate.conditionPlaceholder')}
          className={`font-mono text-sm ${errors.condition ? 'border-destructive' : ''}`}
          {...register('condition')}
        />
        {errors.condition && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.condition.message}
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
        <span>{t('common.advancedOptions')}</span>
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 pl-4 border-l-2 border-border/50 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="destinationTag">{t('mpt.escrowCreate.destinationTag')}</Label>
            <Input
              id="destinationTag"
              type="number"
              placeholder={t('mpt.escrowCreate.destinationTagPlaceholder')}
              className={errors.destinationTag ? 'border-destructive' : ''}
              {...register('destinationTag', {
                validate: (value: string) => {
                  if (!value) return true
                  const num = parseInt(value, 10)
                  if (isNaN(num) || num < 0 || num > 4294967295) {
                    return t('mpt.escrowCreate.destinationTagInvalid')
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
              {t('mpt.escrowCreate.destinationTagHint')}
            </p>
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
              {t('common.transactionJson')}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(transactionJson, null, 2))}
              className="h-6 text-xs"
            >
              {t('common.copy')}
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
