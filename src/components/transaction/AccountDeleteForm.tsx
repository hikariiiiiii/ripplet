import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Eye, EyeOff, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { buildAccountDelete } from '@/lib/xrpl/transactions/accountdelete'
import type { AccountDelete } from 'xrpl'

interface AccountDeleteFormData {
  destination: string
  destinationTag: string
  confirmDelete: boolean
}

interface AccountDeleteFormErrors {
  destination?: string
  destinationTag?: string
  confirmDelete?: string
}


interface AccountDeleteFormProps {
  account: string
  onSubmit: (transaction: AccountDelete) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function AccountDeleteForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: AccountDeleteFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<AccountDeleteFormData>({
    destination: '',
    destinationTag: '',
    confirmDelete: false,
  })
  const [errors, setErrors] = useState<AccountDeleteFormErrors>({})
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<AccountDelete | null>(null)

  const validateForm = (): boolean => {
    const newErrors: AccountDeleteFormErrors = {}

    if (!formData.destination.trim()) {
      newErrors.destination = t('accountdelete.destinationRequired')
    } else if (!/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(formData.destination)) {
      newErrors.destination = t('accountdelete.destinationInvalid')
    }

    if (formData.destinationTag) {
      const tag = parseInt(formData.destinationTag, 10)
      if (isNaN(tag) || tag < 0 || tag > 4294967295) {
        newErrors.destinationTag = t('accountdelete.destinationTagInvalid')
      }
    }

    if (!formData.confirmDelete) {
      newErrors.confirmDelete = t('accountdelete.confirmRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    if (!validateForm()) return

    try {
      const destinationTag = formData.destinationTag
        ? parseInt(formData.destinationTag, 10)
        : undefined
      const tx = buildAccountDelete({
        Account: account,
        Destination: formData.destination,
        DestinationTag: destinationTag,
      })
      setTransactionJson(tx)
    } catch {
      // Silent fail on auto-refresh
    }
  }, [formData, showPreview, account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    if (!validateForm()) {
      return
    }

    const destinationTag = formData.destinationTag
      ? parseInt(formData.destinationTag, 10)
      : undefined

    const transaction = buildAccountDelete({
      Account: account,
      Destination: formData.destination,
      DestinationTag: destinationTag,
    })

    await onSubmit(transaction)
  }

  const handlePreviewToggle = () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }
    if (!formData.destination.trim()) return

    try {
      const destinationTag = formData.destinationTag
        ? parseInt(formData.destinationTag, 10)
        : undefined
      const tx = buildAccountDelete({
        Account: account,
        Destination: formData.destination,
        DestinationTag: destinationTag,
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch {
      setTransactionJson(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {t('accountdelete.warningTitle')}
            </p>
            <ul className="text-sm text-amber-600/80 dark:text-amber-400/80 space-y-1 list-disc list-inside">
              <li>{t('accountdelete.warning1')}</li>
              <li>{t('accountdelete.warning2')}</li>
              <li>{t('accountdelete.warning3')}</li>
              <li>{t('accountdelete.warning4')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">{t('accountdelete.destination')}</Label>
        <Input
          id="destination"
          type="text"
          placeholder={t('accountdelete.destinationPlaceholder')}
          value={formData.destination}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, destination: e.target.value }))
          }
          className={errors.destination ? 'border-destructive' : ''}
        />
        {errors.destination && (
          <p className="text-sm text-destructive">{errors.destination}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('accountdelete.destinationHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destinationTag">
          {t('accountdelete.destinationTag')}
        </Label>
        <Input
          id="destinationTag"
          type="text"
          placeholder={t('accountdelete.destinationTagPlaceholder')}
          value={formData.destinationTag}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, destinationTag: e.target.value }))
          }
          className={errors.destinationTag ? 'border-destructive' : ''}
        />
        {errors.destinationTag && (
          <p className="text-sm text-destructive">{errors.destinationTag}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('accountdelete.destinationTagHint')}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4">
        <div className="space-y-0.5">
          <Label htmlFor="confirm" className="cursor-pointer">
            {t('accountdelete.confirmLabel')}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t('accountdelete.confirmHint')}
          </p>
          {errors.confirmDelete && (
            <p className="text-sm text-destructive">{errors.confirmDelete}</p>
          )}
        </div>
        <Switch
          id="confirm"
          checked={formData.confirmDelete}
          onCheckedChange={(checked: boolean) =>
            setFormData((prev) => ({ ...prev, confirmDelete: checked }))
          }
        />
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
