import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { AlertCircle, Loader2, Eye, EyeOff, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { buildEscrowFinish } from '@/lib/xrpl/transactions/escrow'
import { isValidXRPLAddress } from '@/lib/xrpl/transactions/payment'
import type { EscrowFinish } from 'xrpl'

interface MPTEscrowFinishFormData {
  owner: string
  offerSequence: string
  condition: string
  fulfillment: string
}

interface MPTEscrowFinishFormProps {
  account: string
  onSubmit: (transaction: EscrowFinish) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function MPTEscrowFinishForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTEscrowFinishFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<EscrowFinish | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<MPTEscrowFinishFormData>({
    defaultValues: {
      owner: '',
      offerSequence: '',
      condition: '',
      fulfillment: '',
    },
  })

  const watchedFields = watch()

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    const validateAndBuild = async () => {
      const isValid = await trigger(['owner', 'offerSequence'])
      if (!isValid) return

      try {
        const tx = buildEscrowFinish({
          Account: account,
          Owner: watchedFields.owner,
          OfferSequence: parseInt(watchedFields.offerSequence, 10),
          Condition: watchedFields.condition || undefined,
          Fulfillment: watchedFields.fulfillment || undefined,
        })
        setTransactionJson(tx)
        setBuildError(null)
      } catch {
        // Silent fail on auto-refresh
      }
    }

    validateAndBuild()
  }, [watchedFields.owner, watchedFields.offerSequence, watchedFields.condition, watchedFields.fulfillment, showPreview, account, trigger])

  const handlePreviewToggle = async () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }

    const isValid = await trigger(['owner', 'offerSequence'])
    if (!isValid) return

    setBuildError(null)

    try {
      const tx = buildEscrowFinish({
        Account: account,
        Owner: watchedFields.owner,
        OfferSequence: parseInt(watchedFields.offerSequence, 10),
        Condition: watchedFields.condition || undefined,
        Fulfillment: watchedFields.fulfillment || undefined,
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction'
      setBuildError(errorMsg)
    }
  }

  const onFormSubmit = async (data: MPTEscrowFinishFormData) => {
    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    setBuildError(null)

    try {
      const transaction = buildEscrowFinish({
        Account: account,
        Owner: data.owner,
        OfferSequence: parseInt(data.offerSequence, 10),
        Condition: data.condition || undefined,
        Fulfillment: data.fulfillment || undefined,
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
        <Label htmlFor="owner">{t('escrow.owner')}</Label>
        <Input
          id="owner"
          type="text"
          placeholder="r..."
          className={`font-mono-address text-sm ${errors.owner ? 'border-destructive' : ''}`}
          {...register('owner', {
            required: t('escrow.ownerRequired'),
            validate: (value: string) => {
              if (!isValidXRPLAddress(value)) {
                return t('escrow.ownerInvalid')
              }
              return true
            },
          })}
        />
        {errors.owner && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.owner.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('escrow.ownerHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="offerSequence">{t('escrow.offerSequence')}</Label>
        <Input
          id="offerSequence"
          type="number"
          placeholder={t('escrow.offerSequencePlaceholder')}
          className={errors.offerSequence ? 'border-destructive' : ''}
          {...register('offerSequence', {
            required: t('escrow.offerSequenceRequired'),
            validate: (value: string) => {
              const num = parseInt(value, 10)
              if (isNaN(num) || num < 0) {
                return t('escrow.offerSequenceInvalid')
              }
              return true
            },
          })}
        />
        {errors.offerSequence && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.offerSequence.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('escrow.offerSequenceHint')}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="condition">{t('escrow.condition')}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{t('escrow.conditionHint')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="condition"
          type="text"
          placeholder={t('escrow.conditionPlaceholder')}
          {...register('condition')}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="fulfillment">{t('escrow.fulfillment')}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertCircle className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{t('escrow.fulfillmentHint')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          id="fulfillment"
          type="text"
          placeholder={t('escrow.fulfillmentPlaceholder')}
          {...register('fulfillment')}
        />
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
