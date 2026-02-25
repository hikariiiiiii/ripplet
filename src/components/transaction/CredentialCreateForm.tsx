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
  buildCredentialCreate,
  isValidCredentialAddress,
} from '@/lib/xrpl/transactions/credential'
import type { CredentialCreate } from 'xrpl'

interface CredentialCreateFormData {
  subject: string
  credentialType: string
  expiration: string
  uri: string
}

interface CredentialCreateFormProps {
  account: string
  onSubmit: (transaction: CredentialCreate) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function CredentialCreateForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: CredentialCreateFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CredentialCreateFormData>({
    subject: '',
    credentialType: '',
    expiration: '',
    uri: '',
  })
  const [errors, setErrors] = useState<Partial<CredentialCreateFormData>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<CredentialCreate | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<CredentialCreateFormData> = {}

    if (!formData.subject) {
      newErrors.subject = t('credentialCreate.subjectRequired')
    } else if (!isValidCredentialAddress(formData.subject)) {
      newErrors.subject = t('credentialCreate.subjectInvalid')
    }

    if (!formData.credentialType) {
      newErrors.credentialType = t('credentialCreate.credentialTypeRequired')
    }

    if (formData.subject && formData.subject === account) {
      newErrors.subject = t('credentialCreate.subjectSameAsAccount')
    }

    if (formData.expiration) {
      const exp = parseInt(formData.expiration, 10)
      if (isNaN(exp) || exp < 0) {
        newErrors.expiration = t('credentialCreate.expirationInvalid')
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
      const tx = buildCredentialCreate({
        Account: account,
        Subject: formData.subject,
        CredentialType: formData.credentialType,
        Expiration: formData.expiration ? parseInt(formData.expiration, 10) : undefined,
        URI: formData.uri || undefined,
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
      const tx = buildCredentialCreate({
        Account: account,
        Subject: formData.subject,
        CredentialType: formData.credentialType,
        Expiration: formData.expiration ? parseInt(formData.expiration, 10) : undefined,
        URI: formData.uri || undefined,
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

    const transaction = buildCredentialCreate({
      Account: account,
      Subject: formData.subject,
      CredentialType: formData.credentialType,
      Expiration: formData.expiration ? parseInt(formData.expiration, 10) : undefined,
      URI: formData.uri || undefined,
    })

    await onSubmit(transaction)
  }

  return (
    
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="subject">{t('credentialCreate.subject')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('credentialCreate.subjectHint')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {errors.subject && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.subject}
              </span>
            )}
          </div>
          <Input
            id="subject"
            type="text"
            placeholder={t('credentialCreate.subjectPlaceholder')}
            className={`font-mono-address text-sm ${errors.subject ? 'border-destructive' : ''}`}
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('credentialCreate.subjectHelp')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="credentialType">{t('credentialCreate.credentialType')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('credentialCreate.credentialTypeHint')}</p>
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
            placeholder={t('credentialCreate.credentialTypePlaceholder')}
            className={`text-sm ${errors.credentialType ? 'border-destructive' : ''}`}
            value={formData.credentialType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, credentialType: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('credentialCreate.credentialTypeHelp')}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="expiration">{t('credentialCreate.expiration')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t('credentialCreate.expirationHint')}</p>
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
            placeholder={t('credentialCreate.expirationPlaceholder')}
            className={`text-sm ${errors.expiration ? 'border-destructive' : ''}`}
            value={formData.expiration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expiration: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="uri">{t('credentialCreate.uri')}</Label>
          <Input
            id="uri"
            type="text"
            placeholder={t('credentialCreate.uriPlaceholder')}
            className="text-sm"
            value={formData.uri}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, uri: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            {t('credentialCreate.uriHelp')}
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
