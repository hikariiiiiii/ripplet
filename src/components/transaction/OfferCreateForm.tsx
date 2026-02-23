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
  buildOfferCreate,
} from '@/lib/xrpl/transactions/offers'
import type { OfferCreate } from 'xrpl'

interface OfferCreateFormData {
  takerGetsAmount: string
  takerGetsCurrency: string
  takerGetsIssuer: string
  takerPaysAmount: string
  takerPaysCurrency: string
  takerPaysIssuer: string
  expiration: string
  offerSequence: string
}

interface OfferCreateFormProps {
  account: string
  onSubmit: (transaction: OfferCreate) => void | Promise<void>
  isSubmitting?: boolean
}

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export function OfferCreateForm({
  account,
  onSubmit,
  isSubmitting = false,
}: OfferCreateFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<OfferCreateFormData>({
    takerGetsAmount: '',
    takerGetsCurrency: 'XRP',
    takerGetsIssuer: '',
    takerPaysAmount: '',
    takerPaysCurrency: 'XRP',
    takerPaysIssuer: '',
    expiration: '',
    offerSequence: '',
  })
  const [errors, setErrors] = useState<Partial<OfferCreateFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<OfferCreateFormData> = {}

    if (!formData.takerGetsAmount) {
      newErrors.takerGetsAmount = 'Amount is required'
    } else if (parseFloat(formData.takerGetsAmount) <= 0) {
      newErrors.takerGetsAmount = 'Amount must be greater than 0'
    }

    if (formData.takerGetsCurrency !== 'XRP') {
      if (!formData.takerGetsIssuer) {
        newErrors.takerGetsIssuer = 'Issuer is required for non-XRP currency'
      } else if (!isValidAddress(formData.takerGetsIssuer)) {
        newErrors.takerGetsIssuer = 'Invalid issuer address format'
      }
    }

    if (!formData.takerPaysAmount) {
      newErrors.takerPaysAmount = 'Amount is required'
    } else if (parseFloat(formData.takerPaysAmount) <= 0) {
      newErrors.takerPaysAmount = 'Amount must be greater than 0'
    }

    if (formData.takerPaysCurrency !== 'XRP') {
      if (!formData.takerPaysIssuer) {
        newErrors.takerPaysIssuer = 'Issuer is required for non-XRP currency'
      } else if (!isValidAddress(formData.takerPaysIssuer)) {
        newErrors.takerPaysIssuer = 'Invalid issuer address format'
      }
    }

    if (formData.expiration) {
      const exp = parseInt(formData.expiration, 10)
      if (isNaN(exp) || exp < 0) {
        newErrors.expiration = 'Expiration must be a positive number'
      }
    }

    if (formData.offerSequence) {
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

    const takerGets = formData.takerGetsCurrency === 'XRP'
      ? formData.takerGetsAmount
      : {
          currency: formData.takerGetsCurrency,
          issuer: formData.takerGetsIssuer,
          value: formData.takerGetsAmount,
        }

    const takerPays = formData.takerPaysCurrency === 'XRP'
      ? formData.takerPaysAmount
      : {
          currency: formData.takerPaysCurrency,
          issuer: formData.takerPaysIssuer,
          value: formData.takerPaysAmount,
        }

    const transaction = buildOfferCreate({
      Account: account,
      TakerGets: takerGets,
      TakerPays: takerPays,
      Expiration: formData.expiration ? parseInt(formData.expiration, 10) : undefined,
      OfferSequence: formData.offerSequence ? parseInt(formData.offerSequence, 10) : undefined,
    })

    await onSubmit(transaction)
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">You Offer (Taker Gets)</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="takerGetsAmount">Amount</Label>
              {errors.takerGetsAmount && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.takerGetsAmount}
                </span>
              )}
            </div>
            <Input
              id="takerGetsAmount"
              type="number"
              step="any"
              placeholder="0.00"
              className={`text-sm ${errors.takerGetsAmount ? 'border-destructive' : ''}`}
              value={formData.takerGetsAmount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, takerGetsAmount: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="takerGetsCurrency">Currency</Label>
            <Input
              id="takerGetsCurrency"
              type="text"
              placeholder="XRP or currency code"
              className="text-sm"
              value={formData.takerGetsCurrency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, takerGetsCurrency: e.target.value.toUpperCase() }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Use "XRP" for XRP, or 3-letter currency code for IOU
            </p>
          </div>

          {formData.takerGetsCurrency !== 'XRP' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="takerGetsIssuer">Issuer</Label>
                {errors.takerGetsIssuer && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.takerGetsIssuer}
                  </span>
                )}
              </div>
              <Input
                id="takerGetsIssuer"
                type="text"
                placeholder="r..."
                className={`font-mono-address text-sm ${errors.takerGetsIssuer ? 'border-destructive' : ''}`}
                value={formData.takerGetsIssuer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, takerGetsIssuer: e.target.value }))
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">You Want (Taker Pays)</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="takerPaysAmount">Amount</Label>
              {errors.takerPaysAmount && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.takerPaysAmount}
                </span>
              )}
            </div>
            <Input
              id="takerPaysAmount"
              type="number"
              step="any"
              placeholder="0.00"
              className={`text-sm ${errors.takerPaysAmount ? 'border-destructive' : ''}`}
              value={formData.takerPaysAmount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, takerPaysAmount: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="takerPaysCurrency">Currency</Label>
            <Input
              id="takerPaysCurrency"
              type="text"
              placeholder="XRP or currency code"
              className="text-sm"
              value={formData.takerPaysCurrency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, takerPaysCurrency: e.target.value.toUpperCase() }))
              }
            />
          </div>

          {formData.takerPaysCurrency !== 'XRP' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="takerPaysIssuer">Issuer</Label>
                {errors.takerPaysIssuer && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.takerPaysIssuer}
                  </span>
                )}
              </div>
              <Input
                id="takerPaysIssuer"
                type="text"
                placeholder="r..."
                className={`font-mono-address text-sm ${errors.takerPaysIssuer ? 'border-destructive' : ''}`}
                value={formData.takerPaysIssuer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, takerPaysIssuer: e.target.value }))
                }
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="expiration">Expiration (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Ledger index after which the offer expires</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.expiration && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.expiration}
              </span>
            )}
          </div>
          <Input
            id="expiration"
            type="number"
            placeholder="Ledger index"
            className={`text-sm ${errors.expiration ? 'border-destructive' : ''}`}
            value={formData.expiration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expiration: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="offerSequence">Offer Sequence (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Sequence number of an existing offer to replace</p>
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
            placeholder="Sequence number"
            className={`text-sm ${errors.offerSequence ? 'border-destructive' : ''}`}
            value={formData.offerSequence}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, offerSequence: e.target.value }))
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
            t('common.submit')
          )}
        </Button>
      </form>
    </TooltipProvider>
  )
}
