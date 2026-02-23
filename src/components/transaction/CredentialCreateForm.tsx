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
}

export function CredentialCreateForm({
  account,
  onSubmit,
  isSubmitting = false,
}: CredentialCreateFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CredentialCreateFormData>({
    subject: '',
    credentialType: '',
    expiration: '',
    uri: '',
  })
  const [errors, setErrors] = useState<Partial<CredentialCreateFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CredentialCreateFormData> = {}

    if (!formData.subject) {
      newErrors.subject = 'Subject address is required'
    } else if (!isValidCredentialAddress(formData.subject)) {
      newErrors.subject = 'Invalid XRPL address format'
    }

    if (!formData.credentialType) {
      newErrors.credentialType = 'Credential type is required'
    }

    if (formData.subject && formData.subject === account) {
      newErrors.subject = 'Subject cannot be the same as your account'
    }

    if (formData.expiration) {
      const exp = parseInt(formData.expiration, 10)
      if (isNaN(exp) || exp < 0) {
        newErrors.expiration = 'Expiration must be a positive number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="subject">Subject Address</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The account that will receive this credential</p>
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
            placeholder="r..."
            className={`font-mono-address text-sm ${errors.subject ? 'border-destructive' : ''}`}
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            The XRPL account address that will receive this credential
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
                  <p>A type identifier for the credential (e.g., KYC, ID Verification)</p>
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
            Will be automatically hex-encoded for the transaction
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="expiration">Expiration (Optional)</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Ripple epoch time (seconds since 2000-01-01). Leave empty for no expiration.</p>
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
            placeholder="Ripple epoch time"
            className={`text-sm ${errors.expiration ? 'border-destructive' : ''}`}
            value={formData.expiration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expiration: e.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="uri">URI (Optional)</Label>
          <Input
            id="uri"
            type="text"
            placeholder="https://..."
            className="text-sm"
            value={formData.uri}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, uri: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Additional information about the credential
          </p>
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
