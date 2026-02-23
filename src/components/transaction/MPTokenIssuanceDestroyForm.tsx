import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Loader2, Eye, EyeOff, HelpCircle, AlertTriangle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  buildMPTokenIssuanceDestroy,
  isValidMPTIssuanceID,
} from '@/lib/xrpl/transactions/mpt';
import type { MPTokenIssuanceDestroy } from 'xrpl';

interface MPTokenIssuanceDestroyFormData {
  mptIssuanceId: string;
}

interface MPTokenIssuanceDestroyFormProps {
  account: string;
  onSubmit: (transaction: MPTokenIssuanceDestroy) => void | Promise<void>;
  isSubmitting?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
}

export function MPTokenIssuanceDestroyForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTokenIssuanceDestroyFormProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [transactionJson, setTransactionJson] = useState<MPTokenIssuanceDestroy | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<MPTokenIssuanceDestroyFormData>({
    defaultValues: {
      mptIssuanceId: '',
    },
  });

  const watchedFields = watch();

  const handlePreviewToggle = async () => {
    if (showPreview) {
      setShowPreview(false);
      setTransactionJson(null);
      return;
    }

    const isValid = await trigger();
    if (!isValid) return;

    const tx = buildMPTokenIssuanceDestroy({
      Account: account,
      MPTokenIssuanceID: watchedFields.mptIssuanceId,
    });
    setTransactionJson(tx);
    setShowPreview(true);
  };

  const onFormSubmit = async (data: MPTokenIssuanceDestroyFormData) => {
    if (!isConnected && onConnectWallet) {
      onConnectWallet();
      return;
    }

    const transaction = buildMPTokenIssuanceDestroy({
      Account: account,
      MPTokenIssuanceID: data.mptIssuanceId,
    });

    await onSubmit(transaction);
  };

  return (
    
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Warning: Irreversible Action
              </p>
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                Destroying an MPT issuance is permanent. This can only be done when no tokens are held by any accounts (all tokens have been burned).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="mptIssuanceId">MPT Issuance ID</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The 48-character hexadecimal ID of the MPT issuance to destroy.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="mptIssuanceId"
            type="text"
            placeholder="00070C4495F14B0E44F78A264E41713C64B5F89242540EE255534400000000000000"
            className={`font-mono text-sm ${errors.mptIssuanceId ? 'border-destructive' : ''}`}
            {...register('mptIssuanceId', {
              required: 'MPT Issuance ID is required',
              validate: (value: string) => {
                if (!isValidMPTIssuanceID(value)) {
                  return 'MPT Issuance ID must be a 48-character hexadecimal string';
                }
                return true;
              },
            })}
          />
          {errors.mptIssuanceId && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.mptIssuanceId.message}
            </p>
          )}
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
    
  );
}
