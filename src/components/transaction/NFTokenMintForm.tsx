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
  buildNFTokenMint,
  NFT_FLAGS,
} from '@/lib/xrpl/transactions/nft'
import type { NFTokenMint } from 'xrpl'

interface NFTokenMintFormData {
  nftokenTaxon: string
  uri: string
  transferFee: string
  issuer: string
  burnable: boolean
  onlyXrp: boolean
  trustLine: boolean
  transferable: boolean
}

interface NFTokenMintFormProps {
  account: string
  onSubmit: (transaction: NFTokenMint) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export function NFTokenMintForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: NFTokenMintFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<NFTokenMintFormData>({
    nftokenTaxon: '',
    uri: '',
    transferFee: '',
    issuer: '',
    burnable: false,
    onlyXrp: false,
    trustLine: false,
    transferable: true,
  })
  const [errors, setErrors] = useState<Partial<NFTokenMintFormData>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<NFTokenMint | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<NFTokenMintFormData> = {}

    if (!formData.nftokenTaxon) {
      newErrors.nftokenTaxon = t('nftMint.nftokenTaxonRequired')
    } else if (!Number.isInteger(parseInt(formData.nftokenTaxon, 10))) {
      newErrors.nftokenTaxon = t('nftMint.nftokenTaxonInvalid')
    }

    if (formData.transferFee) {
      const fee = parseInt(formData.transferFee, 10)
      if (isNaN(fee) || fee < 0 || fee > 50000) {
        newErrors.transferFee = t('nftMint.transferFeeInvalid')
      }
    }

    if (formData.issuer && !isValidAddress(formData.issuer)) {
      newErrors.issuer = t('nftMint.issuerInvalid')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    if (!validateForm()) return

    try {
      let flags = 0
      if (formData.burnable) flags |= NFT_FLAGS.tfBurnable
      if (formData.onlyXrp) flags |= NFT_FLAGS.tfOnlyXRP
      if (formData.trustLine) flags |= NFT_FLAGS.tfTrustLine
      if (formData.transferable) flags |= NFT_FLAGS.tfTransferable

      const tx = buildNFTokenMint({
        Account: account,
        NFTokenTaxon: parseInt(formData.nftokenTaxon, 10),
        URI: formData.uri || undefined,
        Flags: flags,
        TransferFee: formData.transferFee ? parseInt(formData.transferFee, 10) : undefined,
        Issuer: formData.issuer || undefined,
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

    let flags = 0
    if (formData.burnable) flags |= NFT_FLAGS.tfBurnable
    if (formData.onlyXrp) flags |= NFT_FLAGS.tfOnlyXRP
    if (formData.trustLine) flags |= NFT_FLAGS.tfTrustLine
    if (formData.transferable) flags |= NFT_FLAGS.tfTransferable

    const transaction = buildNFTokenMint({
      Account: account,
      NFTokenTaxon: parseInt(formData.nftokenTaxon, 10),
      URI: formData.uri || undefined,
      Flags: flags,
      TransferFee: formData.transferFee ? parseInt(formData.transferFee, 10) : undefined,
      Issuer: formData.issuer || undefined,
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
      let flags = 0
      if (formData.burnable) flags |= NFT_FLAGS.tfBurnable
      if (formData.onlyXrp) flags |= NFT_FLAGS.tfOnlyXRP
      if (formData.trustLine) flags |= NFT_FLAGS.tfTrustLine
      if (formData.transferable) flags |= NFT_FLAGS.tfTransferable

      const tx = buildNFTokenMint({
        Account: account,
        NFTokenTaxon: parseInt(formData.nftokenTaxon, 10),
        URI: formData.uri || undefined,
        Flags: flags,
        TransferFee: formData.transferFee ? parseInt(formData.transferFee, 10) : undefined,
        Issuer: formData.issuer || undefined,
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
              <Label htmlFor="nftokenTaxon">{t('nftMint.nftokenTaxon')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftMint.nftokenTaxonHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.nftokenTaxon && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.nftokenTaxon}
              </span>
            )}
          </div>
          <Input
            id="nftokenTaxon"
            type="number"
            placeholder={t('nftMint.nftokenTaxonPlaceholder')}
            className={`text-sm ${errors.nftokenTaxon ? 'border-destructive' : ''}`}
            value={formData.nftokenTaxon}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, nftokenTaxon: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="uri">{t('nftMint.uri')}</Label>
          <Input
            id="uri"
            type="text"
            placeholder={t('nftMint.uriPlaceholder')}
            className="text-sm"
            value={formData.uri}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, uri: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('nftMint.uriHelp')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="transferFee">{t('nftMint.transferFee')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftMint.transferFeeHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.transferFee && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.transferFee}
              </span>
            )}
          </div>
          <Input
            id="transferFee"
            type="number"
            placeholder={t('nftMint.transferFeePlaceholder')}
            className={`text-sm ${errors.transferFee ? 'border-destructive' : ''}`}
            value={formData.transferFee}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, transferFee: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="issuer">{t('nftMint.issuer')}</Label>
            {errors.issuer && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.issuer}
              </span>
            )}
          </div>
          <Input
            id="issuer"
            type="text"
            placeholder={t('nftMint.issuerPlaceholder')}
            className={`font-mono-address text-sm ${errors.issuer ? 'border-destructive' : ''}`}
            value={formData.issuer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, issuer: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('nftMint.issuerHelp')}
          </p>
        </div>

        <div className="space-y-4">
          <Label>{t('nftMint.flags')}</Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('nftMint.flagBurnable')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftMint.flagBurnableHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={formData.burnable}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, burnable: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('nftMint.flagOnlyXrp')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftMint.flagOnlyXrpHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={formData.onlyXrp}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, onlyXrp: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('nftMint.flagTrustLine')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftMint.flagTrustLineHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={formData.trustLine}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, trustLine: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{t('nftMint.flagTransferable')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('nftMint.flagTransferableHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              checked={formData.transferable}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, transferable: checked }))
              }
            />
          </div>
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
