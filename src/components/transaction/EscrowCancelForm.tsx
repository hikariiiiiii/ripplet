import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Eye, EyeOff, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildEscrowCancel } from '@/lib/xrpl/transactions/escrow'
import type { EscrowCancel } from 'xrpl'

interface EscrowCancelFormData {
  owner: string
  offerSequence: string
}

interface EscrowCancelFormErrors {
  owner?: string
  offerSequence?: string
}

interface EscrowCancelFormProps {
  account: string
  onSubmit: (transaction: EscrowCancel) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function EscrowCancelForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: EscrowCancelFormProps) {
  const { t } = useTranslation()
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<EscrowCancel | null>(null)
  const [formData, setFormData] = useState<EscrowCancelFormData>({
    owner: '',
    offerSequence: '',
  })
  const [errors, setErrors] = useState<EscrowCancelFormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: EscrowCancelFormErrors = {}

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
      const tx = buildEscrowCancel({
        Account: account,
        Owner: formData.owner,
        OfferSequence: parseInt(formData.offerSequence, 10),
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

    const tx = buildEscrowCancel({
      Account: account,
      Owner: formData.owner,
      OfferSequence: parseInt(formData.offerSequence, 10),
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

    const transaction = buildEscrowCancel({
      Account: account,
      Owner: formData.owner,
      OfferSequence: parseInt(formData.offerSequence, 10),
    })

    await onSubmit(transaction)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Warning: Irreversible Action
            </p>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
              This will cancel the escrow and release funds back to the owner. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>

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
          <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
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
