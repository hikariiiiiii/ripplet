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
  buildCredentialAccept,
  isValidCredentialAddress,
} from '@/lib/xrpl/transactions/credential'
import type { CredentialAccept } from 'xrpl'

interface CredentialAcceptFormData {
  issuer: string
  credentialType: string
}

interface CredentialAcceptFormProps {
  account: string
  onSubmit: (transaction: CredentialAccept) => void | Promise<void>
  isSubmitting?: boolean
  isConnected?: boolean
  onConnectWallet?: () => void
}

export function CredentialAcceptForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: CredentialAcceptFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CredentialAcceptFormData>({
    issuer: '',
    credentialType: '',
  })
  const [errors, setErrors] = useState<Partial<CredentialAcceptFormData>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [transactionJson, setTransactionJson] = useState<CredentialAccept | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<CredentialAcceptFormData> = {}

    if (!formData.issuer) {
      newErrors.issuer = 'Issuer address is required'
    } else if (!isValidCredentialAddress(formData.issuer)) {
      newErrors.issuer = 'Invalid XRPL address format'
    }

    if (!formData.credentialType) {
      newErrors.credentialType = 'Credential type is required'
    }

    if (formData.issuer && formData.issuer === account) {
      newErrors.issuer = 'Issuer cannot be the same as your account'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return

    if (!validateForm()) return

    try {
      const tx = buildCredentialAccept({
        Account: account,
        Issuer: formData.issuer,
        CredentialType: formData.credentialType,
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
      const tx = buildCredentialAccept({
        Account: account,
        Issuer: formData.issuer,
        CredentialType: formData.credentialType,
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

    const transaction = buildCredentialAccept({
      Account: account,
      Issuer: formData.issuer,
      CredentialType: formData.credentialType,
    })

    await onSubmit(transaction)
  }

  return (
    
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="issuer">Issuer Address</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The account that created the credential you want to accept</p>
                </TooltipContent>
              </Tooltip>
            </div>
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
            placeholder="r..."
            className={`font-mono-address text-sm ${errors.issuer ? 'border-destructive' : ''}`}
            value={formData.issuer}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, issuer: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            The XRPL account address that issued the credential
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="credentialType">Credential Type</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The type of credential to accept (must match the issued credential)</p>
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
            placeholder="e.g., KYC"
            className={`text-sm ${errors.credentialType ? 'border-destructive' : ''}`}
            value={formData.credentialType}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, credentialType: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Must match the credential type that was issued to you
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
