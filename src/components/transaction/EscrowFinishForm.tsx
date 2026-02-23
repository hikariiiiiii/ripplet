import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildEscrowFinish } from '@/lib/xrpl/transactions/escrow'
import type { EscrowFinish } from 'xrpl'

interface EscrowFinishFormData {
  owner: string
  offerSequence: string
  condition: string
  fulfillment: string
}

interface EscrowFinishFormErrors {
  owner?: string
  offerSequence?: string
}

interface EscrowFinishFormProps {
  account: string
  onSubmit: (transaction: EscrowFinish) => void | Promise<void>
  isSubmitting?: boolean
}

export function EscrowFinishForm({
  account,
  onSubmit,
  isSubmitting = false,
}: EscrowFinishFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<EscrowFinishFormData>({
    owner: '',
    offerSequence: '',
    condition: '',
    fulfillment: '',
  })
  const [errors, setErrors] = useState<EscrowFinishFormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: EscrowFinishFormErrors = {}

    if (!formData.owner.trim()) {
      newErrors.owner = t('escrow.ownerRequired')
    } else if (!/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(formData.owner)) {
      newErrors.owner = t('escrow.ownerInvalid')
    }

    if (!formData.offerSequence.trim()) {
      newErrors.offerSequence = t('escrow.offerSequenceRequired')
    } else {
      const seq = parseInt(formData.offerSequence, 10)
      if (isNaN(seq) || seq < 0) {
        newErrors.offerSequence = t('escrow.offerSequenceInvalid')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const transaction = buildEscrowFinish({
      Account: account,
      Owner: formData.owner,
      OfferSequence: parseInt(formData.offerSequence, 10),
      Condition: formData.condition || undefined,
      Fulfillment: formData.fulfillment || undefined,
    })

    await onSubmit(transaction)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="owner">{t('escrow.owner')}</Label>
        <Input
          id="owner"
          type="text"
          placeholder={t('escrow.ownerPlaceholder')}
          value={formData.owner}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, owner: e.target.value }))
          }
          className={errors.owner ? 'border-destructive' : ''}
        />
        {errors.owner && (
          <p className="text-sm text-destructive">{errors.owner}</p>
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
          placeholder="0"
          value={formData.offerSequence}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, offerSequence: e.target.value }))
          }
          className={errors.offerSequence ? 'border-destructive' : ''}
        />
        {errors.offerSequence && (
          <p className="text-sm text-destructive">{errors.offerSequence}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('escrow.offerSequenceHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">{t('escrow.condition')}</Label>
        <Input
          id="condition"
          type="text"
          placeholder={t('escrow.conditionPlaceholder')}
          value={formData.condition}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, condition: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          {t('escrow.conditionFinishHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fulfillment">{t('escrow.fulfillment')}</Label>
        <Input
          id="fulfillment"
          type="text"
          placeholder={t('escrow.fulfillmentPlaceholder')}
          value={formData.fulfillment}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fulfillment: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          {t('escrow.fulfillmentHint')}
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('common.loading')}
          </>
        ) : (
          t('escrow.finishEscrow')
        )}
      </Button>
    </form>
  )
}
