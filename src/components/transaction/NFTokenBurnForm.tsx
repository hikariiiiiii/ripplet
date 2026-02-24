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
  buildNFTokenBurn,
} from '@/lib/xrpl/transactions/nft'
import type { NFTokenBurn } from 'xrpl'

interface NFTokenBurnFormData {
  nftokenId: string
  owner: string
}

interface NFTokenBurnFormProps {
  account: string
  onSubmit: (transaction: NFTokenBurn) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export function NFTokenBurnForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: NFTokenBurnFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<NFTokenBurnFormData>({
    nftokenId: '',
    owner: '',
  })
  const [errors, setErrors] = useState<Partial<NFTokenBurnFormData>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<NFTokenBurn | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<NFTokenBurnFormData> = {}

    if (!formData.nftokenId) {
      newErrors.nftokenId = 'NFTokenID is required'
    }

    if (formData.owner && !isValidAddress(formData.owner)) {
      newErrors.owner = 'Invalid owner address format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    if (!validateForm()) return

    try {
      const tx = buildNFTokenBurn({
        Account: account,
        NFTokenID: formData.nftokenId,
        Owner: formData.owner || undefined,
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

    const transaction = buildNFTokenBurn({
      Account: account,
      NFTokenID: formData.nftokenId,
      Owner: formData.owner || undefined,
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
      const tx = buildNFTokenBurn({
        Account: account,
        NFTokenID: formData.nftokenId,
        Owner: formData.owner || undefined,
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
              <Label htmlFor="nftokenId">NFTokenID</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The unique identifier of the NFT to burn</p>
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
          <p className="text-xs text-muted-foreground">
            The 64-character hex identifier of the NFT
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="owner">Owner (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Only needed if burning an NFT owned by another account (requires burnable flag)</p>
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
