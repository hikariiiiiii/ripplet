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
}

export function CredentialAcceptForm({
  account,
  onSubmit,
  isSubmitting = false,
}: CredentialAcceptFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CredentialAcceptFormData>({
    issuer: '',
    credentialType: '',
  })
  const [errors, setErrors] = useState<Partial<CredentialAcceptFormData>>({})

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const transaction = buildCredentialAccept({
      Account: account,
      Issuer: formData.issuer,
      CredentialType: formData.credentialType,
    })

    await onSubmit(transaction)
  }

  return (
    <TooltipProvider>
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
