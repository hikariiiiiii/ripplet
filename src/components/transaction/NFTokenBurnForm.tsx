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
}

function isValidAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

export function NFTokenBurnForm({
  account,
  onSubmit,
  isSubmitting = false,
}: NFTokenBurnFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<NFTokenBurnFormData>({
    nftokenId: '',
    owner: '',
  })
  const [errors, setErrors] = useState<Partial<NFTokenBurnFormData>>({})

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const transaction = buildNFTokenBurn({
      Account: account,
      NFTokenID: formData.nftokenId,
      Owner: formData.owner || undefined,
    })

    await onSubmit(transaction)
  }

  return (
    <TooltipProvider>
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
