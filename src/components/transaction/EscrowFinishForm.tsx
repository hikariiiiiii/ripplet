import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildEscrowFinish } from '@/lib/xrpl/transactions/escrow'
import type { EscrowFinish } from 'xrpl'

interface EscrowFinishFormData {
  owner: string
  offerSequence: string
  condition: string
  fulfillment: string
}

interface EscrowFinishFormErrors {
  owner?: string
  offerSequence?: string
}

interface EscrowFinishFormProps {
  account: string
  onSubmit: (transaction: EscrowFinish) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function EscrowFinishForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: EscrowFinishFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<EscrowFinish | null>(null)
  const [formData, setFormData] = useState<EscrowFinishFormData>({
    owner: '',
    offerSequence: '',
    condition: '',
    fulfillment: '',
  })
  const [errors, setErrors] = useState<EscrowFinishFormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: EscrowFinishFormErrors = {}

    if (!formData.owner.trim()) {
      newErrors.owner = t('escrow.ownerRequired')
    } else if (!/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(formData.owner)) {
      newErrors.owner = t('escrow.ownerInvalid')
    }

    if (!formData.offerSequence.trim()) {
      newErrors.offerSequence = t('escrow.offerSequenceRequired')
    } else {
      const seq = parseInt(formData.offerSequence, 10)
      if (isNaN(seq) || seq < 0) {
        newErrors.offerSequence = t('escrow.offerSequenceInvalid')
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
      const tx = buildEscrowFinish({
        Account: account,
        Owner: formData.owner,
        OfferSequence: parseInt(formData.offerSequence, 10),
        Condition: formData.condition || undefined,
        Fulfillment: formData.fulfillment || undefined,
      })
      setTransactionJson(tx)
    } catch {
      // Silent fail on auto-refresh
    }
  }, [formData, showPreview, account])

  const handlePreviewToggle = () => {
    if (showPreview) {
      setShowPreview(false)
      setTransactionJson(null)
      return
    }

    if (!validateForm()) return

    const tx = buildEscrowFinish({
      Account: account,
      Owner: formData.owner,
      OfferSequence: parseInt(formData.offerSequence, 10),
      Condition: formData.condition || undefined,
      Fulfillment: formData.fulfillment || undefined,
    })
    setTransactionJson(tx)
    setShowPreview(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    if (!validateForm()) return

    const transaction = buildEscrowFinish({
      Account: account,
      Owner: formData.owner,
      OfferSequence: parseInt(formData.offerSequence, 10),
      Condition: formData.condition || undefined,
      Fulfillment: formData.fulfillment || undefined,
    })

    await onSubmit(transaction)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="owner">{t('escrow.owner')}</Label>
        <Input
          id="owner"
          type="text"
          placeholder={t('escrow.ownerPlaceholder')}
          value={formData.owner}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, owner: e.target.value }))
          }
          className={errors.owner ? 'border-destructive' : ''}
        />
        {errors.owner && (
          <p className="text-sm text-destructive">{errors.owner}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('escrow.ownerHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="offerSequence">{t('escrow.offerSequence')}</Label>
        <Input
          id="offerSequence"
          type="number"
          placeholder="0"
          value={formData.offerSequence}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, offerSequence: e.target.value }))
          }
          className={errors.offerSequence ? 'border-destructive' : ''}
        />
        {errors.offerSequence && (
          <p className="text-sm text-destructive">{errors.offerSequence}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('escrow.offerSequenceHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">{t('escrow.condition')}</Label>
        <Input
          id="condition"
          type="text"
          placeholder={t('escrow.conditionPlaceholder')}
          value={formData.condition}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, condition: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          {t('escrow.conditionFinishHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fulfillment">{t('escrow.fulfillment')}</Label>
        <Input
          id="fulfillment"
          type="text"
          placeholder={t('escrow.fulfillmentPlaceholder')}
          value={formData.fulfillment}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fulfillment: e.target.value }))
          }
        />
        <p className="text-xs text-muted-foreground">
          {t('escrow.fulfillmentHint')}
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
