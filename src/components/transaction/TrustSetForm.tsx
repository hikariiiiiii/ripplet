import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  buildTrustSet,
  isValidCurrency,
  isValidXRPLAddress,
} from '@/lib/xrpl/transactions/trustset'
import type { TrustSet } from 'xrpl'

interface TrustSetFormData {
  currency: string
  issuer: string
  limit: string
}

interface TrustSetFormProps {
  account: string
  onSubmit: (transaction: TrustSet) => void | Promise<void>
  isSubmitting?: boolean
}

export function TrustSetForm({
  account,
  onSubmit,
  isSubmitting = false,
}: TrustSetFormProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrustSetFormData>({
    defaultValues: {
      currency: '',
      issuer: '',
      limit: '',
    },
  })

  const onFormSubmit = async (data: TrustSetFormData) => {
    const transaction = buildTrustSet({
      Account: account,
      LimitAmount: {
        currency: data.currency.toUpperCase(),
        issuer: data.issuer,
        value: data.limit,
      },
    })

    await onSubmit(transaction)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currency">{t('trustset.currency')}</Label>
        <Input
          id="currency"
          type="text"
          placeholder="USD"
          maxLength={40}
          {...register('currency', {
            required: t('trustset.currencyRequired'),
            validate: (value: string) => {
              const upperValue = value.toUpperCase()
              if (!isValidCurrency(upperValue)) {
                return t('trustset.currencyInvalid')
              }
              return true
            },
          })}
          className={errors.currency ? 'border-destructive' : ''}
        />
        {errors.currency && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.currency.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('trustset.currencyHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="issuer">{t('trustset.issuer')}</Label>
        <Input
          id="issuer"
          type="text"
          placeholder="r..."
          {...register('issuer', {
            required: t('trustset.issuerRequired'),
            validate: (value: string) => {
              if (!isValidXRPLAddress(value)) {
                return t('trustset.issuerInvalid')
              }
              return true
            },
          })}
          className={errors.issuer ? 'border-destructive' : ''}
        />
        {errors.issuer && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.issuer.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('trustset.issuerHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="limit">{t('trustset.limit')}</Label>
        <Input
          id="limit"
          type="number"
          step="any"
          min="0"
          placeholder="0.00"
          {...register('limit', {
            required: t('trustset.limitRequired'),
            validate: (value: string) => {
              const num = parseFloat(value)
              if (isNaN(num) || num < 0) {
                return t('trustset.limitInvalid')
              }
              return true
            },
          })}
          className={errors.limit ? 'border-destructive' : ''}
        />
        {errors.limit && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.limit.message}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t('trustset.limitZeroInfo')}
          </p>
        </div>
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
  )
}
