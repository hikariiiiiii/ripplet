import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Loader2, HelpCircle, Wallet, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
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
  isConnected?: boolean
  onConnectWallet?: () => void
}

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export function NFTokenAcceptOfferForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
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
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<NFTokenAcceptOffer | null>(null)

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

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    if (!validateForm()) return

    try {
      const brokerFee = formData.nftokenBrokerFee
        ? formData.nftokenBrokerFeeCurrency === 'XRP'
          ? formData.nftokenBrokerFee
          : {
              currency: formData.nftokenBrokerFeeCurrency,
              issuer: formData.nftokenBrokerFeeIssuer,
              value: formData.nftokenBrokerFee,
            }
        : undefined

      const tx = buildNFTokenAcceptOffer({
        Account: account,
        NFTokenSellOffer: formData.nftokenSellOffer || undefined,
        NFTokenBuyOffer: formData.nftokenBuyOffer || undefined,
        NFTokenBrokerFee: brokerFee,
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

  const handlePreviewToggle = () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }

    if (!validateForm()) return

    try {
      const brokerFee = formData.nftokenBrokerFee
        ? formData.nftokenBrokerFeeCurrency === 'XRP'
          ? formData.nftokenBrokerFee
          : {
              currency: formData.nftokenBrokerFeeCurrency,
              issuer: formData.nftokenBrokerFeeIssuer,
              value: formData.nftokenBrokerFee,
            }
        : undefined

      const tx = buildNFTokenAcceptOffer({
        Account: account,
        NFTokenSellOffer: formData.nftokenSellOffer || undefined,
        NFTokenBuyOffer: formData.nftokenBuyOffer || undefined,
        NFTokenBrokerFee: brokerFee,
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch {
      setTransactionJson(null)
    }
  }

  return (
    
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
                  placeholder="Currency code"
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


        {/* JSON Preview Toggle */}
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
