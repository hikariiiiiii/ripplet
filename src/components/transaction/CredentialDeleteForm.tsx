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
}

export function CredentialDeleteForm({
  account,
  onSubmit,
  isSubmitting = false,
}: CredentialDeleteFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CredentialDeleteFormData>({
    deleteMode: 'issuer',
    targetAddress: '',
    credentialType: '',
  })
  const [errors, setErrors] = useState<Partial<Omit<CredentialDeleteFormData, 'deleteMode'>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Omit<CredentialDeleteFormData, 'deleteMode'>> = {}

    if (!formData.targetAddress) {
      newErrors.targetAddress = formData.deleteMode === 'issuer' 
        ? 'Subject address is required' 
        : 'Issuer address is required'
    } else if (!isValidCredentialAddress(formData.targetAddress)) {
      newErrors.targetAddress = 'Invalid XRPL address format'
    }

    if (!formData.credentialType) {
      newErrors.credentialType = 'Credential type is required'
    }

    if (formData.targetAddress && formData.targetAddress === account) {
      newErrors.targetAddress = 'Target address cannot be the same as your account'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const transaction = buildCredentialDelete({
      Account: account,
      CredentialType: formData.credentialType,
      Subject: formData.deleteMode === 'issuer' ? formData.targetAddress : undefined,
      Issuer: formData.deleteMode === 'subject' ? formData.targetAddress : undefined,
    })

    await onSubmit(transaction)
  }

  const targetLabel = formData.deleteMode === 'issuer' ? 'Subject Address' : 'Issuer Address'
  const targetPlaceholder = formData.deleteMode === 'issuer' 
    ? 'The account that received the credential' 
    : 'The account that issued the credential'

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label>I am deleting as...</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.deleteMode === 'issuer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, deleteMode: 'issuer', targetAddress: '' }))}
            >
              Issuer
            </Button>
            <Button
              type="button"
              variant={formData.deleteMode === 'subject' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, deleteMode: 'subject', targetAddress: '' }))}
            >
              Subject
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {formData.deleteMode === 'issuer'
              ? 'You created this credential and want to delete it'
              : 'You received this credential and want to delete it'}
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
            placeholder="r..."
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
              <Label htmlFor="credentialType">Credential Type</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The type of credential to delete</p>
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
            The type of the credential you want to delete
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
