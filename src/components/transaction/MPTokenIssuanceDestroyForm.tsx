import { useState, useEffect } from 'react';
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

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return;

    const validateAndBuild = async () => {
      const isValid = await trigger(['mptIssuanceId']);
      if (!isValid) return;

      try {
        const tx = buildMPTokenIssuanceDestroy({
          Account: account,
          MPTokenIssuanceID: watchedFields.mptIssuanceId,
        });
        setTransactionJson(tx);
      } catch {
        // Silent fail on auto-refresh
      }
    };

    validateAndBuild();
  }, [watchedFields, showPreview, account, trigger]);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Connection check FIRST (no validation)
    if (!isConnected && onConnectWallet) {
      onConnectWallet();
      return;
    }

    // 2. Form validation SECOND - use react-hook-form's handleSubmit
    handleSubmit(onFormSubmit)();
  };

  const onFormSubmit = async (data: MPTokenIssuanceDestroyFormData) => {
    const transaction = buildMPTokenIssuanceDestroy({
      Account: account,
      MPTokenIssuanceID: data.mptIssuanceId,
    });

    await onSubmit(transaction);
  };

  return (
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {t('mpt.destroy.warningTitle')}
              </p>
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
                {t('mpt.destroy.warningDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="mptIssuanceId">{t('mpt.destroy.mptIssuanceId')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('mpt.destroy.mptIssuanceIdHint')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="mptIssuanceId"
            type="text"
            placeholder={t('mpt.destroy.mptIssuanceIdPlaceholder')}
            className={`font-mono text-sm ${errors.mptIssuanceId ? 'border-destructive' : ''}`}
            {...register('mptIssuanceId', {
              required: t('mpt.destroy.mptIssuanceIdRequired'),
              validate: (value: string) => {
                if (!isValidMPTIssuanceID(value)) {
                  return t('mpt.destroy.mptIssuanceIdInvalid');
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
  );
}
