import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { AlertCircle, Loader2, Eye, EyeOff, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { buildMPTLock, isValidMPTIssuanceID, MPT_LOCK_FLAGS } from '@/lib/xrpl/transactions/mpt'
import { isValidXRPLAddress } from '@/lib/xrpl/transactions/payment'
import type { MPTokenAuthorize } from 'xrpl'

interface MPTLockFormData {
  holder: string
  mptIssuanceId: string
  lockedAmount: string
  action: 'lock' | 'unlock'
}

interface MPTLockFormProps {
  account: string
  onSubmit: (transaction: MPTokenAuthorize) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function MPTLockForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTLockFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<MPTokenAuthorize | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<MPTLockFormData>({
    defaultValues: {
      holder: '',
      mptIssuanceId: '',
      lockedAmount: '',
      action: 'lock',
    },
  })

  const watchedFields = watch()

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return;

    const validateAndBuild = async () => {
      const isValid = await trigger(['holder', 'mptIssuanceId']);
      if (!isValid) return;

      try {
        const flags = watchedFields.action === 'lock' 
          ? MPT_LOCK_FLAGS.tfMPTLock 
          : MPT_LOCK_FLAGS.tfMPTUnlock;
        
        const tx = buildMPTLock({
          Account: account,
          Holder: watchedFields.holder,
          MPTokenIssuanceID: watchedFields.mptIssuanceId,
          LockedAmount: watchedFields.lockedAmount || undefined,
          Flags: flags,
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

    const isValid = await trigger(['holder', 'mptIssuanceId'])
    if (!isValid) return

    setBuildError(null)

    try {
      const flags = watchedFields.action === 'lock' 
        ? MPT_LOCK_FLAGS.tfMPTLock 
        : MPT_LOCK_FLAGS.tfMPTUnlock
      
      const tx = buildMPTLock({
        Account: account,
        Holder: watchedFields.holder,
        MPTokenIssuanceID: watchedFields.mptIssuanceId,
        LockedAmount: watchedFields.lockedAmount || undefined,
        Flags: flags,
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

  const onFormSubmit = async (data: MPTLockFormData) => {
    setBuildError(null);

    try {
      const flags = data.action === 'lock'
        ? MPT_LOCK_FLAGS.tfMPTLock
        : MPT_LOCK_FLAGS.tfMPTUnlock;

      const transaction = buildMPTLock({
        Account: account,
        Holder: data.holder,
        MPTokenIssuanceID: data.mptIssuanceId,
        LockedAmount: data.lockedAmount || undefined,
        Flags: flags,
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
        <Label htmlFor="holder">{t('mptLock.holder')}</Label>
        <Input
          id="holder"
          type="text"
          placeholder="r..."
          className={`font-mono-address text-sm ${errors.holder ? 'border-destructive' : ''}`}
          {...register('holder', {
            required: t('mptLock.holderRequired'),
            validate: (value: string) => {
              if (!isValidXRPLAddress(value)) {
                return t('mptLock.holderInvalid')
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
        <Label htmlFor="mptIssuanceId">{t('mptLock.mptIssuanceId')}</Label>
        <Input
          id="mptIssuanceId"
          type="text"
          placeholder="0000..."
          className={`font-mono text-sm ${errors.mptIssuanceId ? 'border-destructive' : ''}`}
          {...register('mptIssuanceId', {
            required: t('mptLock.mptIssuanceIdRequired'),
            validate: (value: string) => {
              if (!isValidMPTIssuanceID(value)) {
                return t('mptLock.mptIssuanceIdInvalid')
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
        <Label htmlFor="lockedAmount">{t('mptLock.lockedAmount')}</Label>
        <Input
          id="lockedAmount"
          type="text"
          placeholder={t('mptLock.lockedAmountPlaceholder')}
          className={errors.lockedAmount ? 'border-destructive' : ''}
          {...register('lockedAmount', {
            validate: (value: string) => {
              if (!value) return true
              const num = parseFloat(value)
              if (isNaN(num) || num <= 0) {
                return t('mptLock.lockedAmountInvalid')
              }
              return true
            },
          })}
        />
        {errors.lockedAmount && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.lockedAmount.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t('mptLock.action')}</Label>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${watchedFields.action === 'lock' ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('mptLock.actionLock')}
            </span>
            <Switch
              checked={watchedFields.action === 'unlock'}
              onCheckedChange={(checked) => setValue('action', checked ? 'unlock' : 'lock')}
            />
            <span className={`text-sm ${watchedFields.action === 'unlock' ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('mptLock.actionUnlock')}
            </span>
          </div>
        </div>
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
