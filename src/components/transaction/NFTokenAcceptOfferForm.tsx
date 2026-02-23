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
  buildNFTokenAcceptOffer,
} from '@/lib/xrpl/transactions/nft'
import type { NFTokenAcceptOffer } from 'xrpl'

interface NFTokenAcceptOfferFormData {
  nftokenSellOffer: string
  nftokenBuyOffer: string
  nftokenBrokerFee: string
  nftokenBrokerFeeCurrency: string
  nftokenBrokerFeeIssuer: string
}

interface NFTokenAcceptOfferFormProps {
  account: string
  onSubmit: (transaction: NFTokenAcceptOffer) => void | Promise<void>
  isSubmitting?: boolean
}

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export function NFTokenAcceptOfferForm({
  account,
  onSubmit,
  isSubmitting = false,
}: NFTokenAcceptOfferFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<NFTokenAcceptOfferFormData>({
    nftokenSellOffer: '',
    nftokenBuyOffer: '',
    nftokenBrokerFee: '',
    nftokenBrokerFeeCurrency: 'XRP',
    nftokenBrokerFeeIssuer: '',
  })
  const [errors, setErrors] = useState<Partial<NFTokenAcceptOfferFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<NFTokenAcceptOfferFormData> = {}

    if (!formData.nftokenSellOffer && !formData.nftokenBuyOffer) {
      newErrors.nftokenSellOffer = 'Either sell offer or buy offer is required'
    }

    if (formData.nftokenBrokerFee) {
      if (parseFloat(formData.nftokenBrokerFee) <= 0) {
        newErrors.nftokenBrokerFee = 'Broker fee must be greater than 0'
      }
      if (formData.nftokenBrokerFeeCurrency !== 'XRP') {
        if (!formData.nftokenBrokerFeeIssuer) {
          newErrors.nftokenBrokerFeeIssuer = 'Issuer is required for non-XRP currency'
        } else if (!isValidAddress(formData.nftokenBrokerFeeIssuer)) {
          newErrors.nftokenBrokerFeeIssuer = 'Invalid issuer address format'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const brokerFee = formData.nftokenBrokerFee
      ? formData.nftokenBrokerFeeCurrency === 'XRP'
        ? formData.nftokenBrokerFee
        : {
            currency: formData.nftokenBrokerFeeCurrency,
            issuer: formData.nftokenBrokerFeeIssuer,
            value: formData.nftokenBrokerFee,
          }
      : undefined

    const transaction = buildNFTokenAcceptOffer({
      Account: account,
      NFTokenSellOffer: formData.nftokenSellOffer || undefined,
      NFTokenBuyOffer: formData.nftokenBuyOffer || undefined,
      NFTokenBrokerFee: brokerFee,
    })

    await onSubmit(transaction)
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="nftokenSellOffer">Sell Offer (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The NFTokenID of a sell offer to accept. Use this if you're buying the NFT.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.nftokenSellOffer && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.nftokenSellOffer}
              </span>
            )}
          </div>
          <Input
            id="nftokenSellOffer"
            type="text"
            placeholder="NFToken sell offer ID"
            className={`font-mono-address text-sm ${errors.nftokenSellOffer ? 'border-destructive' : ''}`}
            value={formData.nftokenSellOffer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nftokenSellOffer: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="nftokenBuyOffer">Buy Offer (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The NFTokenID of a buy offer to accept. Use this if you're selling your NFT.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.nftokenBuyOffer && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.nftokenBuyOffer}
              </span>
            )}
          </div>
          <Input
            id="nftokenBuyOffer"
            type="text"
            placeholder="NFToken buy offer ID"
            className={`font-mono-address text-sm ${errors.nftokenBuyOffer ? 'border-destructive' : ''}`}
            value={formData.nftokenBuyOffer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nftokenBuyOffer: e.target.value }))
            }
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Broker Fee (Optional) - Only for brokered transactions
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="nftokenBrokerFee">Fee Amount</Label>
              {errors.nftokenBrokerFee && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.nftokenBrokerFee}
                </span>
              )}
            </div>
            <Input
              id="nftokenBrokerFee"
              type="number"
              step="any"
              placeholder="0.00"
              className={`text-sm ${errors.nftokenBrokerFee ? 'border-destructive' : ''}`}
              value={formData.nftokenBrokerFee}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nftokenBrokerFee: e.target.value }))
              }
            />
          </div>

          {formData.nftokenBrokerFee && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nftokenBrokerFeeCurrency">Currency</Label>
                <Input
                  id="nftokenBrokerFeeCurrency"
                  type="text"
                  placeholder="XRP or currency code"
                  className="text-sm"
                  value={formData.nftokenBrokerFeeCurrency}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nftokenBrokerFeeCurrency: e.target.value.toUpperCase() }))
                  }
                />
              </div>

              {formData.nftokenBrokerFeeCurrency !== 'XRP' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="nftokenBrokerFeeIssuer">Issuer</Label>
                    {errors.nftokenBrokerFeeIssuer && (
                      <span className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.nftokenBrokerFeeIssuer}
                      </span>
                    )}
                  </div>
                  <Input
                    id="nftokenBrokerFeeIssuer"
                    type="text"
                    placeholder="r..."
                    className={`font-mono-address text-sm ${errors.nftokenBrokerFeeIssuer ? 'border-destructive' : ''}`}
                    value={formData.nftokenBrokerFeeIssuer}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nftokenBrokerFeeIssuer: e.target.value }))
                    }
                  />
                </div>
              )}
            </>
          )}
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
