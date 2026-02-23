import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HelpCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { buildEscrowCreate } from '@/lib/xrpl/transactions/escrow'
import type { EscrowCreate } from 'xrpl'

interface EscrowCreateFormData {
  destination: string
  destinationTag: string
  amount: string
  finishAfter: string
  cancelAfter: string
  condition: string
}

interface EscrowCreateFormErrors {
  destination?: string
  destinationTag?: string
  amount?: string
  finishAfter?: string
  cancelAfter?: string
}

interface EscrowCreateFormProps {
  account: string
  onSubmit: (transaction: EscrowCreate) => void | Promise<void>
  isSubmitting?: boolean
}

export function EscrowCreateForm({
  account,
  onSubmit,
  isSubmitting = false,
}: EscrowCreateFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<EscrowCreateFormData>({
    destination: '',
    destinationTag: '',
    amount: '',
    finishAfter: '',
    cancelAfter: '',
    condition: '',
  })
  const [errors, setErrors] = useState<EscrowCreateFormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: EscrowCreateFormErrors = {}

    if (!formData.destination.trim()) {
      newErrors.destination = t('escrow.destinationRequired')
    } else if (!/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(formData.destination)) {
      newErrors.destination = t('escrow.destinationInvalid')
    }

    if (formData.destinationTag) {
      const tag = parseInt(formData.destinationTag, 10)
      if (isNaN(tag) || tag < 0 || tag > 4294967295) {
        newErrors.destinationTag = t('escrow.destinationTagInvalid')
      }
    }

    if (!formData.amount.trim()) {
      newErrors.amount = t('escrow.amountRequired')
    } else {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = t('escrow.amountInvalid')
      }
    }

    if (formData.finishAfter && formData.cancelAfter) {
      const finish = parseInt(formData.finishAfter, 10)
      const cancel = parseInt(formData.cancelAfter, 10)
      if (!isNaN(finish) && !isNaN(cancel) && finish >= cancel) {
        newErrors.finishAfter = t('escrow.finishAfterInvalid')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const amountDrops = (parseFloat(formData.amount) * 1000000).toString()
    const finishAfter = formData.finishAfter
      ? parseInt(formData.finishAfter, 10)
      : undefined
    const cancelAfter = formData.cancelAfter
      ? parseInt(formData.cancelAfter, 10)
      : undefined
    const destinationTag = formData.destinationTag
      ? parseInt(formData.destinationTag, 10)
      : undefined

    const transaction = buildEscrowCreate({
      Account: account,
      Destination: formData.destination,
      Amount: amountDrops,
      FinishAfter: finishAfter,
      CancelAfter: cancelAfter,
      Condition: formData.condition || undefined,
      DestinationTag: destinationTag,
    })

    await onSubmit(transaction)
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="destination">{t('escrow.destination')}</Label>
          <Input
            id="destination"
            type="text"
            placeholder={t('escrow.destinationPlaceholder')}
            value={formData.destination}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, destination: e.target.value }))
            }
            className={errors.destination ? 'border-destructive' : ''}
          />
          {errors.destination && (
            <p className="text-sm text-destructive">{errors.destination}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="destinationTag">{t('escrow.destinationTag')}</Label>
          <Input
            id="destinationTag"
            type="text"
            placeholder={t('escrow.destinationTagPlaceholder')}
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
            {t('escrow.destinationTagHint')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">{t('escrow.amount')}</Label>
          <Input
            id="amount"
            type="number"
            step="0.000001"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: e.target.value }))
            }
            className={errors.amount ? 'border-destructive' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="finishAfter">{t('escrow.finishAfter')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('escrow.finishAfterHint')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="finishAfter"
            type="number"
            placeholder={t('escrow.finishAfterPlaceholder')}
            value={formData.finishAfter}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, finishAfter: e.target.value }))
            }
            className={errors.finishAfter ? 'border-destructive' : ''}
          />
          {errors.finishAfter && (
            <p className="text-sm text-destructive">{errors.finishAfter}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="cancelAfter">{t('escrow.cancelAfter')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('escrow.cancelAfterHint')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="cancelAfter"
            type="number"
            placeholder={t('escrow.cancelAfterPlaceholder')}
            value={formData.cancelAfter}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cancelAfter: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="condition">{t('escrow.condition')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
            value={formData.condition}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, condition: e.target.value }))
            }
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            t('escrow.createEscrow')
          )}
        </Button>
      </form>
    </TooltipProvider>
  )
}
