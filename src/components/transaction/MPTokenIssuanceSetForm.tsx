import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { AlertCircle, Loader2, Eye, EyeOff, HelpCircle, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  buildMPTokenIssuanceSet,
  MPT_ISSUANCE_FLAGS,
  isValidMPTIssuanceID,
} from '@/lib/xrpl/transactions/mpt';
import type { MPTokenIssuanceSet } from 'xrpl';

interface MPTokenIssuanceSetFormData {
  mptIssuanceId: string;
  canLock: boolean;
  canClawback: boolean;
}

interface MPTokenIssuanceSetFormProps {
  account: string;
  onSubmit: (transaction: MPTokenIssuanceSet) => void | Promise<void>;
  isSubmitting?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
}

interface FlagConfig {
  key: keyof Pick<MPTokenIssuanceSetFormData, 'canLock' | 'canClawback'>;
  flagValue: number;
  labelKey: string;
  tooltipKey: string;
}

const FLAGS_CONFIG: FlagConfig[] = [
  {
    key: 'canLock',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanLock,
    labelKey: 'flagEnableLock',
    tooltipKey: 'flagEnableLockHint',
  },
  {
    key: 'canClawback',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanClawback,
    labelKey: 'flagEnableClawback',
    tooltipKey: 'flagEnableClawbackHint',
  },
];

export function MPTokenIssuanceSetForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTokenIssuanceSetFormProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [transactionJson, setTransactionJson] = useState<MPTokenIssuanceSet | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<MPTokenIssuanceSetFormData>({
    defaultValues: {
      mptIssuanceId: '',
      canLock: false,
      canClawback: false,
    },
  });

  const mptIssuanceId = watch('mptIssuanceId');
  const canLock = watch('canLock');
  const canClawback = watch('canClawback');

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return;

    const validateAndBuild = async () => {
      const isValid = await trigger(['mptIssuanceId']);
      if (!isValid) return;

      try {
        let flags = 0;
        for (const config of FLAGS_CONFIG) {
          if ((config.key === 'canLock' && canLock) || (config.key === 'canClawback' && canClawback)) {
            flags |= config.flagValue;
          }
        }

        const tx = buildMPTokenIssuanceSet({
          Account: account,
          MPTokenIssuanceID: mptIssuanceId,
          Flags: flags > 0 ? flags : undefined,
        });
        setTransactionJson(tx);
      } catch {
        // Silent fail on auto-refresh
      }
    };

    validateAndBuild();
  }, [mptIssuanceId, canLock, canClawback, showPreview, account, trigger]);

  const handlePreviewToggle = async () => {
    if (showPreview) {
      setShowPreview(false);
      setTransactionJson(null);
      return;
    }

    const isValid = await trigger();
    if (!isValid) return;

    let flags = 0;
    for (const config of FLAGS_CONFIG) {
      if ((config.key === 'canLock' && canLock) || (config.key === 'canClawback' && canClawback)) {
        flags |= config.flagValue;
      }
    }

    const tx = buildMPTokenIssuanceSet({
      Account: account,
      MPTokenIssuanceID: mptIssuanceId,
      Flags: flags > 0 ? flags : undefined,
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

  const onFormSubmit = async (data: MPTokenIssuanceSetFormData) => {
    let flags = 0;
    for (const config of FLAGS_CONFIG) {
      if (data[config.key]) {
        flags |= config.flagValue;
      }
    }

    const transaction = buildMPTokenIssuanceSet({
      Account: account,
      MPTokenIssuanceID: data.mptIssuanceId,
      Flags: flags > 0 ? flags : undefined,
    });

    await onSubmit(transaction);
  };

  return (
    
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="mptIssuanceId">{t('mpt.set.mptIssuanceId')}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t('mpt.set.mptIssuanceIdHint')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="mptIssuanceId"
            type="text"
            placeholder={t('mpt.set.mptIssuanceIdPlaceholder')}
            className={`font-mono text-sm ${errors.mptIssuanceId ? 'border-destructive' : ''}`}
            {...register('mptIssuanceId', {
              required: t('mpt.set.mptIssuanceIdRequired'),
              validate: (value: string) => {
                if (!isValidMPTIssuanceID(value)) {
                  return t('mpt.set.mptIssuanceIdInvalid');
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('mpt.set.flagsTitle')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('mpt.set.flagsNote')}
          </p>
          <div className="space-y-4">
            {FLAGS_CONFIG.map((config) => (
              <div
                key={config.key}
                className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4"
              >
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={config.key}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {t(`mpt.set.${config.labelKey}`)}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{t(`mpt.set.${config.tooltipKey}`)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id={config.key}
                  checked={config.key === 'canLock' ? canLock : canClawback}
                  onCheckedChange={(checked) => setValue(config.key, checked)}
                />
              </div>
            ))}
          </div>
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
