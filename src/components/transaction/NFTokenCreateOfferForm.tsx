import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Loader2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  buildNFTokenCreateOffer,
} from '@/lib/xrpl/transactions/nft'
import type { NFTokenCreateOffer } from 'xrpl'

interface NFTokenCreateOfferFormData {
  nftokenId: string
  amount: string
  amountCurrency: string
  amountIssuer: string
  destination: string
  expiration: string
  owner: string
  isSellOffer: boolean
}

interface NFTokenCreateOfferFormProps {
  account: string
  onSubmit: (transaction: NFTokenCreateOffer) => void | Promise<void>
  isSubmitting?: boolean
}

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export function NFTokenCreateOfferForm({
  account,
  onSubmit,
  isSubmitting = false,
}: NFTokenCreateOfferFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<NFTokenCreateOfferFormData>({
    nftokenId: '',
    amount: '',
    amountCurrency: 'XRP',
    amountIssuer: '',
    destination: '',
    expiration: '',
    owner: '',
    isSellOffer: true,
  })
  const [errors, setErrors] = useState<Partial<NFTokenCreateOfferFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<NFTokenCreateOfferFormData> = {}

    if (!formData.nftokenId) {
      newErrors.nftokenId = 'NFTokenID is required'
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (formData.amountCurrency !== 'XRP') {
      if (!formData.amountIssuer) {
        newErrors.amountIssuer = 'Issuer is required for non-XRP currency'
      } else if (!isValidAddress(formData.amountIssuer)) {
        newErrors.amountIssuer = 'Invalid issuer address format'
      }
    }

    if (formData.destination && !isValidAddress(formData.destination)) {
      newErrors.destination = 'Invalid destination address format'
    }

    if (formData.expiration) {
      const exp = parseInt(formData.expiration, 10)
      if (isNaN(exp) || exp < 0) {
        newErrors.expiration = 'Expiration must be a positive number'
      }
    }

    if (!formData.isSellOffer && !formData.owner) {
      newErrors.owner = 'Owner is required for buy offers'
    } else if (formData.owner && !isValidAddress(formData.owner)) {
      newErrors.owner = 'Invalid owner address format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const amount = formData.amountCurrency === 'XRP'
      ? formData.amount
      : {
          currency: formData.amountCurrency,
          issuer: formData.amountIssuer,
          value: formData.amount,
        }

    const transaction = buildNFTokenCreateOffer({
      Account: account,
      NFTokenID: formData.nftokenId,
      Amount: amount,
      Destination: formData.destination || undefined,
      Expiration: formData.expiration ? parseInt(formData.expiration, 10) : undefined,
      Owner: formData.owner || undefined,
      Flags: formData.isSellOffer ? 1 : 0, // tfSellOffer flag
    })

    await onSubmit(transaction)
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Offer Type</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Sell Offer: You're selling your NFT. Buy Offer: You're offering to buy someone else's NFT.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="text-sm">{formData.isSellOffer ? 'Sell Offer' : 'Buy Offer'}</span>
            <Switch
              checked={formData.isSellOffer}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isSellOffer: checked }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="nftokenId">NFTokenID</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The unique identifier of the NFT</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.nftokenId && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.nftokenId}
              </span>
            )}
          </div>
          <Input
            id="nftokenId"
            type="text"
            placeholder="NFToken ID"
            className={`font-mono-address text-sm ${errors.nftokenId ? 'border-destructive' : ''}`}
            value={formData.nftokenId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nftokenId: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount">Amount</Label>
            {errors.amount && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.amount}
              </span>
            )}
          </div>
          <Input
            id="amount"
            type="number"
            step="any"
            placeholder="0.00"
            className={`text-sm ${errors.amount ? 'border-destructive' : ''}`}
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amountCurrency">Currency</Label>
          <Input
            id="amountCurrency"
            type="text"
            placeholder="XRP or currency code"
            className="text-sm"
            value={formData.amountCurrency}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amountCurrency: e.target.value.toUpperCase() }))
            }
          />
        </div>

        {formData.amountCurrency !== 'XRP' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amountIssuer">Issuer</Label>
              {errors.amountIssuer && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amountIssuer}
                </span>
              )}
            </div>
            <Input
              id="amountIssuer"
              type="text"
              placeholder="r..."
              className={`font-mono-address text-sm ${errors.amountIssuer ? 'border-destructive' : ''}`}
              value={formData.amountIssuer}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amountIssuer: e.target.value }))
              }
            />
          </div>
        )}

        {!formData.isSellOffer && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="owner">Owner</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The owner of the NFT you want to buy</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {errors.owner && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.owner}
                </span>
              )}
            </div>
            <Input
              id="owner"
              type="text"
              placeholder="r..."
              className={`font-mono-address text-sm ${errors.owner ? 'border-destructive' : ''}`}
              value={formData.owner}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, owner: e.target.value }))
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="destination">Destination (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Restrict this offer to a specific buyer/seller</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.destination && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.destination}
              </span>
            )}
          </div>
          <Input
            id="destination"
            type="text"
            placeholder="r..."
            className={`font-mono-address text-sm ${errors.destination ? 'border-destructive' : ''}`}
            value={formData.destination}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, destination: e.target.value }))
            }
          />
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
