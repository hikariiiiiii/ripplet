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
  label: string;
  tooltip: string;
}

const FLAGS_CONFIG: FlagConfig[] = [
  {
    key: 'canLock',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanLock,
    label: 'Enable Lock/Freeze',
    tooltip: 'Allow issuer to freeze/unfreeze individual holder balances',
  },
  {
    key: 'canClawback',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanClawback,
    label: 'Enable Clawback',
    tooltip: 'Allow issuer to claw back tokens from holders',
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

  const watchedFields = watch();

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return;

    const validateAndBuild = async () => {
      const isValid = await trigger(['mptIssuanceId']);
      if (!isValid) return;

      try {
        let flags = 0;
        for (const config of FLAGS_CONFIG) {
          if (watchedFields[config.key]) {
            flags |= config.flagValue;
          }
        }

        const tx = buildMPTokenIssuanceSet({
          Account: account,
          MPTokenIssuanceID: watchedFields.mptIssuanceId,
          Flags: flags > 0 ? flags : undefined,
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

    let flags = 0;
    for (const config of FLAGS_CONFIG) {
      if (watchedFields[config.key]) {
        flags |= config.flagValue;
      }
    }

    const tx = buildMPTokenIssuanceSet({
      Account: account,
      MPTokenIssuanceID: watchedFields.mptIssuanceId,
      Flags: flags > 0 ? flags : undefined,
    });
    setTransactionJson(tx);
    setShowPreview(true);
  };

  const onFormSubmit = async (data: MPTokenIssuanceSetFormData) => {
    if (!isConnected && onConnectWallet) {
      onConnectWallet();
      return;
    }

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
    
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="mptIssuanceId">MPT Issuance ID</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The 48-character hexadecimal ID of the MPT issuance to modify.</p>
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Flags to Enable</h3>
          <p className="text-sm text-muted-foreground">
            Note: Only certain flags can be changed after creation. You can only enable flags, not disable them.
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
                    {config.label}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{config.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id={config.key}
                  checked={watchedFields[config.key]}
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
