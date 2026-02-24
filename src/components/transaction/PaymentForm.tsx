import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Info,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  buildPayment,
  isValidXRPLAddress,
  xrpToDrops,
} from '@/lib/xrpl/transactions/payment';
import type { Payment } from 'xrpl';

interface PaymentFormData {
  destination: string;
  amount: string;
  destinationTag: string;
  memo: string;
}

interface PaymentFormProps {
  account: string;
  onSubmit: (transaction: Payment) => void | Promise<void>;
  isSubmitting?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
}

export function PaymentForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: PaymentFormProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [transactionJson, setTransactionJson] = useState<Payment | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setFocus,
    formState: { errors },
  } = useForm<PaymentFormData>({
    defaultValues: {
      destination: '',
      amount: '',
      destinationTag: '',
      memo: '',
    },
  });

  const destination = watch('destination')
  const amount = watch('amount')
  const destinationTag = watch('destinationTag')
  const memo = watch('memo')

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return;

    const validateAndBuild = async () => {
      // Validate required fields only
      const isValid = await trigger(['destination', 'amount']);
      if (!isValid) return;

      try {
        const drops = xrpToDrops(amount);
        const tx = buildPayment({
          Account: account,
          Destination: destination,
          Amount: drops,
          DestinationTag: destinationTag
            ? parseInt(destinationTag, 10)
            : undefined,
          Memos: memo
            ? [{ data: memo }]
            : undefined,
        });
        setTransactionJson(tx);
      } catch {
        // Silent fail on auto-refresh
      }
    };

    validateAndBuild();
  }, [destination, amount, destinationTag, memo, showPreview, account, trigger]);

  const handlePreviewToggle = async () => {
    if (showPreview) {
      // If already showing, hide it
      setShowPreview(false);
      setTransactionJson(null);
      return;
    }

    // Validate form first
    const fieldsToValidate = ['destination', 'amount'] as const;
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      // Focus on the first field with an error
      for (const field of fieldsToValidate) {
        if (errors[field]) {
          setFocus(field);
          break;
        }
      }
      return;
    }

    // If validation passes, build and show preview
    try {
      const drops = xrpToDrops(amount);
      const tx = buildPayment({
        Account: account,
        Destination: destination,
        Amount: drops,
        DestinationTag: destinationTag
          ? parseInt(destinationTag, 10)
          : undefined,
        Memos: memo
          ? [{ data: memo }]
          : undefined,
      });
      setTransactionJson(tx);
      setShowPreview(true);
    } catch {
      setTransactionJson(null);
    }
  };

  const onFormSubmit = async (data: PaymentFormData) => {
    if (!isConnected && onConnectWallet) {
      onConnectWallet();
      return;
    }

    const drops = xrpToDrops(data.amount);
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
    });
    await onSubmit(transaction);
  };

  const estimatedFee = '0.000012'; // XRPL standard fee

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Destination Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="destination" className="text-sm font-medium">
            {t('payment.destination')}
          </Label>
          {errors.destination && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.destination.message}
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id="destination"
            type="text"
            placeholder="r..."
            className={`font-mono-address text-sm ${errors.destination ? 'border-destructive neon-border' : 'focus:border-white/40'}`}
            {...register('destination', {
              required: t('payment.destinationRequired'),
              validate: (value: string) => {
                if (!isValidXRPLAddress(value)) {
                  return t('payment.destinationInvalid');
                }
                return true;
              },
            })}
          />
          {destination && isValidXRPLAddress(destination) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 rounded-full bg-xrpl-green status-pulse" />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the XRPL account address to send XRP to
        </p>
      </div>

      {/* Amount Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="amount" className="text-sm font-medium">
            {t('payment.amount')}
          </Label>
          {errors.amount && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.amount.message}
            </span>
          )}
        </div>
        <Input
          id="amount"
          type="number"
          step="any"
          min="0.000001"
          placeholder="0.00"
          className={`font-mono-address text-sm ${errors.amount ? 'border-destructive' : 'focus:border-white/40'}`}
          {...register('amount', {
            required: t('payment.amountRequired'),
            validate: (value: string) => {
              const num = parseFloat(value);
              if (isNaN(num) || num <= 0) {
                return t('payment.amountInvalid');
              }
              return true;
            },
          })}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>Minimum: 0.000001 XRP (1 drop)</span>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        <span>{t('common.advancedOptions')}</span>
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 pl-4 border-l-2 border-border/50 animate-fade-in">
          {/* Destination Tag */}
          <div className="space-y-2">
            <Label htmlFor="destinationTag" className="text-sm">
              {t('payment.destinationTag')} (Optional)
            </Label>
            <Input
              id="destinationTag"
              type="number"
              min="0"
              max="4294967295"
              placeholder="e.g., 12345"
              className={`font-mono-address text-sm ${errors.destinationTag ? 'border-destructive' : ''}`}
              {...register('destinationTag', {
                validate: (value: string) => {
                  if (!value) return true;
                  const num = parseInt(value, 10);
                  if (isNaN(num) || num < 0 || num > 4294967295) {
                    return t('payment.destinationTagInvalid');
                  }
                  return true;
                },
              })}
            />
            {errors.destinationTag && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.destinationTag.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Required for exchanges and some wallets
            </p>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo" className="text-sm">
              {t('payment.memo')} (Optional)
            </Label>
            <Input
              id="memo"
              type="text"
              placeholder="Add a note..."
              className="text-sm"
              {...register('memo')}
            />
            <p className="text-xs text-muted-foreground">
              Add a message to this transaction
            </p>
          </div>
        </div>
      )}

      {/* Fee Estimate */}
      <div className="p-3 rounded-lg glass-card border border-border/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Network Fee</span>
          <span className="font-mono-address text-xrpl-green">~{estimatedFee} XRP</span>
        </div>
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
  );
}
