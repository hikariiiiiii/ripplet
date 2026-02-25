import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Loader2, HelpCircle, Wallet, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
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
  isConnected?: boolean
  onConnectWallet?: () => void
}

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export function NFTokenCreateOfferForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
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
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<NFTokenCreateOffer | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<NFTokenCreateOfferFormData> = {}

    if (!formData.nftokenId) {
      newErrors.nftokenId = t('nftCreateOffer.nftokenIdRequired')
    }

    if (!formData.amount) {
      newErrors.amount = t('nftCreateOffer.amountRequired')
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('nftCreateOffer.amountInvalid')
    }

    if (formData.amountCurrency !== 'XRP') {
      if (!formData.amountIssuer) {
        newErrors.amountIssuer = t('nftCreateOffer.issuerRequired')
      } else if (!isValidAddress(formData.amountIssuer)) {
        newErrors.amountIssuer = t('nftCreateOffer.issuerInvalid')
      }
    }

    if (formData.destination && !isValidAddress(formData.destination)) {
      newErrors.destination = t('nftCreateOffer.destinationInvalid')
    }

    if (formData.expiration) {
      const exp = parseInt(formData.expiration, 10)
      if (isNaN(exp) || exp < 0) {
        newErrors.expiration = t('nftCreateOffer.expirationInvalid')
      }
    }

    if (!formData.isSellOffer && !formData.owner) {
      newErrors.owner = t('nftCreateOffer.ownerRequired')
    } else if (formData.owner && !isValidAddress(formData.owner)) {
      newErrors.owner = t('nftCreateOffer.ownerInvalid')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    if (!validateForm()) return

    try {
      const amount = formData.amountCurrency === 'XRP'
        ? formData.amount
        : {
            currency: formData.amountCurrency,
            issuer: formData.amountIssuer,
            value: formData.amount,
          }

      const tx = buildNFTokenCreateOffer({
        Account: account,
        NFTokenID: formData.nftokenId,
        Amount: amount,
        Destination: formData.destination || undefined,
        Expiration: formData.expiration ? parseInt(formData.expiration, 10) : undefined,
        Owner: formData.owner || undefined,
        Flags: formData.isSellOffer ? 1 : 0,
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
      Flags: formData.isSellOffer ? 1 : 0,
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
      const amount = formData.amountCurrency === 'XRP'
        ? formData.amount
        : {
            currency: formData.amountCurrency,
            issuer: formData.amountIssuer,
            value: formData.amount,
          }

      const tx = buildNFTokenCreateOffer({
        Account: account,
        NFTokenID: formData.nftokenId,
        Amount: amount,
        Destination: formData.destination || undefined,
        Expiration: formData.expiration ? parseInt(formData.expiration, 10) : undefined,
        Owner: formData.owner || undefined,
        Flags: formData.isSellOffer ? 1 : 0,
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
              <span className="text-sm font-medium">{t('nftCreateOffer.offerType')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftCreateOffer.offerTypeHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="text-sm">{formData.isSellOffer ? t('nftCreateOffer.sellOffer') : t('nftCreateOffer.buyOffer')}</span>
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
              <Label htmlFor="nftokenId">{t('nftCreateOffer.nftokenId')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftCreateOffer.nftokenIdHint')}</p>
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
            placeholder={t('nftCreateOffer.nftokenIdPlaceholder')}
            className={`font-mono-address text-sm ${errors.nftokenId ? 'border-destructive' : ''}`}
            value={formData.nftokenId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nftokenId: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount">{t('nftCreateOffer.amount')}</Label>
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
          <Label htmlFor="amountCurrency">{t('nftCreateOffer.currency')}</Label>
          <Input
            id="amountCurrency"
            type="text"
            placeholder={t('nftCreateOffer.currencyPlaceholder')}
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
              <Label htmlFor="amountIssuer">{t('nftCreateOffer.issuer')}</Label>
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
                <Label htmlFor="owner">{t('nftCreateOffer.owner')}</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('nftCreateOffer.ownerHint')}</p>
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
              placeholder={t('nftCreateOffer.ownerPlaceholder')}
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
              <Label htmlFor="destination">{t('nftCreateOffer.destination')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftCreateOffer.destinationHint')}</p>
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
            placeholder={t('nftCreateOffer.destinationPlaceholder')}
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
              <Label htmlFor="expiration">{t('nftCreateOffer.expiration')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftCreateOffer.expirationHint')}</p>
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
            placeholder={t('nftCreateOffer.expirationPlaceholder')}
            className={`text-sm ${errors.expiration ? 'border-destructive' : ''}`}
            value={formData.expiration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expiration: e.target.value }))
            }
          />
        </div>

        {/* JSON Preview Toggle */}
        {transactionJson && showPreview && (
          <div className="code-block scanlines">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {t('common.transactionJson')}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(JSON.stringify(transactionJson, null, 2))}
                className="h-6 text-xs"
              >
                {t('common.copy')}
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
