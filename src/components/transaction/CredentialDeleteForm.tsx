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
  buildCredentialDelete,
  isValidCredentialAddress,
} from '@/lib/xrpl/transactions/credential'
import type { CredentialDelete } from 'xrpl'

type DeleteMode = 'issuer' | 'subject'

interface CredentialDeleteFormData {
  deleteMode: DeleteMode
  targetAddress: string
  credentialType: string
}

interface CredentialDeleteFormProps {
  account: string
  onSubmit: (transaction: CredentialDelete) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function CredentialDeleteForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: CredentialDeleteFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CredentialDeleteFormData>({
    deleteMode: 'issuer',
    targetAddress: '',
    credentialType: '',
  })
  const [errors, setErrors] = useState<Partial<Omit<CredentialDeleteFormData, 'deleteMode'>>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<CredentialDelete | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<CredentialDeleteFormData, 'deleteMode'>> = {}

    if (!formData.targetAddress) {
      newErrors.targetAddress = formData.deleteMode === 'issuer' 
        ? t('credentialDelete.subjectRequired') 
        : t('credentialDelete.issuerRequired')
    } else if (!isValidCredentialAddress(formData.targetAddress)) {
      newErrors.targetAddress = t('credentialDelete.targetAddressInvalid')
    }

    if (!formData.credentialType) {
      newErrors.credentialType = t('credentialDelete.credentialTypeRequired')
    }

    if (formData.targetAddress && formData.targetAddress === account) {
      newErrors.targetAddress = t('credentialDelete.targetAddressSameAsAccount')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    if (!validateForm()) return

    try {
      const tx = buildCredentialDelete({
        Account: account,
        CredentialType: formData.credentialType,
        Subject: formData.deleteMode === 'issuer' ? formData.targetAddress : undefined,
        Issuer: formData.deleteMode === 'subject' ? formData.targetAddress : undefined,
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

    try {
      const tx = buildCredentialDelete({
        Account: account,
        CredentialType: formData.credentialType,
        Subject: formData.deleteMode === 'issuer' ? formData.targetAddress : undefined,
        Issuer: formData.deleteMode === 'subject' ? formData.targetAddress : undefined,
      })
      setTransactionJson(tx)
      setShowPreview(true)
    } catch {
      setTransactionJson(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Connection check FIRST (no validation)
    if (!isConnected && onConnectWallet) {
      onConnectWallet()
      return
    }

    // Form validation SECOND
    if (!validateForm()) return

    const transaction = buildCredentialDelete({
      Account: account,
      CredentialType: formData.credentialType,
      Subject: formData.deleteMode === 'issuer' ? formData.targetAddress : undefined,
      Issuer: formData.deleteMode === 'subject' ? formData.targetAddress : undefined,
    })

    await onSubmit(transaction)
  }

  const targetLabel = formData.deleteMode === 'issuer' ? t('credentialDelete.subjectAddress') : t('credentialDelete.issuerAddress')
  const targetPlaceholder = formData.deleteMode === 'issuer' 
    ? t('credentialDelete.targetAddressHintIssuer') 
    : t('credentialDelete.targetAddressHintSubject')

  return (
    
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label>{t('credentialDelete.deleteAs')}</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.deleteMode === 'issuer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, deleteMode: 'issuer', targetAddress: '' }))}
            >
              {t('credentialDelete.deleteAsIssuer')}
            </Button>
            <Button
              type="button"
              variant={formData.deleteMode === 'subject' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, deleteMode: 'subject', targetAddress: '' }))}
            >
              {t('credentialDelete.deleteAsSubject')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {formData.deleteMode === 'issuer'
              ? t('credentialDelete.deleteAsIssuerHelp')
              : t('credentialDelete.deleteAsSubjectHelp')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="targetAddress">{targetLabel}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{targetPlaceholder}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.targetAddress && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.targetAddress}
              </span>
            )}
          </div>
          <Input
            id="targetAddress"
            type="text"
            placeholder={t('credentialDelete.targetAddressPlaceholder')}
            className={`font-mono-address text-sm ${errors.targetAddress ? 'border-destructive' : ''}`}
            value={formData.targetAddress}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, targetAddress: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            {targetPlaceholder}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="credentialType">{t('credentialDelete.credentialType')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('credentialDelete.credentialTypeHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.credentialType && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.credentialType}
              </span>
            )}
          </div>
          <Input
            id="credentialType"
            type="text"
            placeholder={t('credentialDelete.credentialTypePlaceholder')}
            className={`text-sm ${errors.credentialType ? 'border-destructive' : ''}`}
            value={formData.credentialType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, credentialType: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('credentialDelete.credentialTypeHelp')}
          </p>
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
