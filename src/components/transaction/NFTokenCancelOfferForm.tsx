import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Loader2, HelpCircle, Wallet, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  buildNFTokenCancelOffer,
} from '@/lib/xrpl/transactions/nft'
import type { NFTokenCancelOffer } from 'xrpl'

interface NFTokenCancelOfferFormData {
  nftokenOffers: string[]
}

interface NFTokenCancelOfferFormProps {
  account: string
  onSubmit: (transaction: NFTokenCancelOffer) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function NFTokenCancelOfferForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: NFTokenCancelOfferFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<NFTokenCancelOfferFormData>({
    nftokenOffers: [''],
  })
  const [errors, setErrors] = useState<{ [key: number]: string }>({})
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<NFTokenCancelOffer | null>(null)

  const validateForm = (): boolean => {
    const newErrors: { [key: number]: string } = {}

    formData.nftokenOffers.forEach((offer, index) => {
      if (!offer || offer.trim() === '') {
        newErrors[index] = 'Offer ID is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    if (!validateForm()) return

    try {
      const tx = buildNFTokenCancelOffer({
        Account: account,
        NFTokenOffers: formData.nftokenOffers.filter(o => o.trim() !== ''),
      })
      setTransactionJson(tx)
    } catch {
      // Silent fail on auto-refresh
    }
  }, [formData, showPreview, account])

  const handleAddOffer = () => {
    setFormData((prev) => ({
      ...prev,
      nftokenOffers: [...prev.nftokenOffers, ''],
    }))
  }

  const handleRemoveOffer = (index: number) => {
    if (formData.nftokenOffers.length === 1) return
    setFormData((prev) => ({
      ...prev,
      nftokenOffers: prev.nftokenOffers.filter((_, i) => i !== index),
    }))
    // Clear error for removed field
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }

  const handleOfferChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      nftokenOffers: prev.nftokenOffers.map((offer, i) =>
        i === index ? value : offer
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    if (!validateForm()) return

    const transaction = buildNFTokenCancelOffer({
      Account: account,
      NFTokenOffers: formData.nftokenOffers.filter(o => o.trim() !== ''),
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
      const tx = buildNFTokenCancelOffer({
        Account: account,
        NFTokenOffers: formData.nftokenOffers.filter(o => o.trim() !== ''),
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch {
      setTransactionJson(null)
    }
  }

  return (
    
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>NFToken Offers</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The unique identifiers of the NFT buy or sell offers to cancel</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOffer}
              disabled={isSubmitting}
              className="h-7 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Offer
            </Button>
          </div>

          {formData.nftokenOffers.map((offer, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Offer #{index + 1}</span>
                    {errors[index] && (
                      <span className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors[index]}
                      </span>
                    )}
                  </div>
                  <Input
                    type="text"
                    placeholder="NFToken Offer ID"
                    className={`font-mono-address text-sm ${errors[index] ? 'border-destructive' : ''}`}
                    value={offer}
                    onChange={(e) => handleOfferChange(index, e.target.value)}
                  />
                </div>
                {formData.nftokenOffers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOffer(index)}
                    disabled={isSubmitting}
                    className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            Enter the offer IDs you want to cancel. You can cancel multiple offers in a single transaction.
          </p>
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
                {t('common.signAndSend')}
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
