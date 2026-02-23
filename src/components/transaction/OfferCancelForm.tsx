import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  buildOfferCancel,
} from '@/lib/xrpl/transactions/offers'
import type { OfferCancel } from 'xrpl'

interface OfferCancelFormData {
  offerSequence: string
}

interface OfferCancelFormProps {
  account: string
  onSubmit: (transaction: OfferCancel) => void | Promise<void>
  isSubmitting?: boolean
}

export function OfferCancelForm({
  account,
  onSubmit,
  isSubmitting = false,
}: OfferCancelFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<OfferCancelFormData>({
    offerSequence: '',
  })
  const [errors, setErrors] = useState<Partial<OfferCancelFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<OfferCancelFormData> = {}

    if (!formData.offerSequence) {
      newErrors.offerSequence = 'Offer sequence is required'
    } else {
      const seq = parseInt(formData.offerSequence, 10)
      if (isNaN(seq) || seq < 0) {
        newErrors.offerSequence = 'Offer sequence must be a non-negative integer'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const transaction = buildOfferCancel({
      Account: account,
      OfferSequence: parseInt(formData.offerSequence, 10),
    })

    await onSubmit(transaction)
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="offerSequence">Offer Sequence</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The sequence number of the OfferCreate transaction that created the offer you want to cancel</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.offerSequence && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.offerSequence}
              </span>
            )}
          </div>
          <Input
            id="offerSequence"
            type="number"
            placeholder="e.g., 12345"
            className={`text-sm ${errors.offerSequence ? 'border-destructive' : ''}`}
            value={formData.offerSequence}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, offerSequence: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            You can find the sequence number in your account's offer list or transaction history
          </p>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            t('common.submit')
          )}
        </Button>
      </form>
    </TooltipProvider>
  )
}
