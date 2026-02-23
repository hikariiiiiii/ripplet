import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Loader2 } from 'lucide-react'
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
}

export function AccountDeleteForm({
  account,
  onSubmit,
  isSubmitting = false,
}: AccountDeleteFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<AccountDeleteFormData>({
    destination: '',
    destinationTag: '',
    confirmDelete: false,
  })
  const [errors, setErrors] = useState<AccountDeleteFormErrors>({})

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-4 rounded-lg border border-destructive/30 bg-destructive/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-destructive">
              {t('accountdelete.warningTitle')}
            </p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
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

      <Button
        type="submit"
        disabled={isSubmitting}
        variant="destructive"
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('common.loading')}
          </>
        ) : (
          t('accountdelete.deleteAccount')
        )}
      </Button>
    </form>
  )
}
