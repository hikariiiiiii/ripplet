import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  buildPayment,
  isValidXRPLAddress,
  xrpToDrops,
} from '@/lib/xrpl/transactions/payment'
import type { Payment } from 'xrpl'

interface PaymentFormData {
  destination: string
  amount: string
  destinationTag: string
  memo: string
}

interface PaymentFormProps {
  account: string
  onSubmit: (transaction: Payment) => void | Promise<void>
  isSubmitting?: boolean
}

export function PaymentForm({
  account,
  onSubmit,
  isSubmitting = false,
}: PaymentFormProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      destination: '',
      amount: '',
      destinationTag: '',
      memo: '',
    },
  })

  const onFormSubmit = async (data: PaymentFormData) => {
    const drops = xrpToDrops(data.amount)

    const transaction = buildPayment({
      Account: account,
      Destination: data.destination,
      Amount: drops,
      DestinationTag: data.destinationTag
        ? parseInt(data.destinationTag, 10)
        : undefined,
      Memos: data.memo
        ? [{ data: data.memo }]
        : undefined,
    })

    await onSubmit(transaction)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="destination">{t('payment.destination')}</Label>
        <Input
          id="destination"
          type="text"
          placeholder={t('payment.destinationPlaceholder')}
          {...register('destination', {
            required: t('payment.destinationRequired'),
            validate: (value: string) => {
              if (!isValidXRPLAddress(value)) {
                return t('payment.destinationInvalid')
              }
              return true
            },
          })}
          className={errors.destination ? 'border-destructive' : ''}
        />
        {errors.destination && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.destination.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{t('payment.amount')}</Label>
        <Input
          id="amount"
          type="number"
          step="any"
          min="0.000001"
          placeholder={t('payment.amountPlaceholder')}
          {...register('amount', {
            required: t('payment.amountRequired'),
            validate: (value: string) => {
              const num = parseFloat(value)
              if (isNaN(num) || num <= 0) {
                return t('payment.amountInvalid')
              }
              return true
            },
          })}
          className={errors.amount ? 'border-destructive' : ''}
        />
        {errors.amount && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.amount.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="destinationTag">{t('payment.destinationTag')}</Label>
        <Input
          id="destinationTag"
          type="number"
          min="0"
          max="4294967295"
          placeholder={t('payment.destinationTagPlaceholder')}
          {...register('destinationTag', {
            validate: (value: string) => {
              if (!value) return true
              const num = parseInt(value, 10)
              if (isNaN(num) || num < 0 || num > 4294967295) {
                return t('payment.destinationTagInvalid')
              }
              return true
            },
          })}
          className={errors.destinationTag ? 'border-destructive' : ''}
        />
        {errors.destinationTag && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.destinationTag.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('payment.destinationTagHint')}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="memo">{t('payment.memo')}</Label>
        <Input
          id="memo"
          type="text"
          placeholder={t('payment.memoPlaceholder')}
          {...register('memo')}
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
  )
}
