import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { AlertCircle, Loader2, ChevronDown, ChevronUp, Eye, EyeOff, HelpCircle, Wallet } from 'lucide-react';
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
  buildMPTokenIssuanceCreate,
  MPT_ISSUANCE_FLAGS,
  isValidAssetScale,
  isValidTransferFee,
} from '@/lib/xrpl/transactions/mpt';
import type { MPTokenIssuanceCreate } from 'xrpl';

interface MPTokenIssuanceCreateFormData {
  assetScale: string;
  maximumAmount: string;
  transferFee: string;
  metadata: string;
  canTransfer: boolean;
  requireAuth: boolean;
  canLock: boolean;
  canClawback: boolean;
  canTrade: boolean;
  canEscrow: boolean;
}

interface MPTokenIssuanceCreateFormProps {
  account: string;
  onSubmit: (transaction: MPTokenIssuanceCreate) => void | Promise<void>;
  isSubmitting?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
}

interface FlagConfig {
  key: keyof Pick<MPTokenIssuanceCreateFormData, 'canTransfer' | 'requireAuth' | 'canLock' | 'canClawback' | 'canTrade' | 'canEscrow'>;
  flagValue: number;
  label: string;
  tooltip: string;
}

const FLAGS_CONFIG: FlagConfig[] = [
  {
    key: 'canTransfer',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanTransfer,
    label: 'Transferable',
    tooltip: 'Allow holders to transfer the token to each other',
  },
  {
    key: 'requireAuth',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTRequireAuth,
    label: 'Require Authorization',
    tooltip: 'Holders must get explicit approval from the issuer before they can hold this token',
  },
  {
    key: 'canLock',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanLock,
    label: 'Can Lock/Freeze',
    tooltip: 'Allow issuer to freeze/unfreeze individual holder balances',
  },
  {
    key: 'canClawback',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanClawback,
    label: 'Can Clawback',
    tooltip: 'Allow issuer to claw back tokens from holders',
  },
  {
    key: 'canTrade',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanTrade,
    label: 'Can Trade (DEX)',
    tooltip: 'Allow trading in the decentralized exchange (not currently implemented)',
  },
  {
    key: 'canEscrow',
    flagValue: MPT_ISSUANCE_FLAGS.lsfMPTCanEscrow,
    label: 'Can Escrow',
    tooltip: 'Allow placing tokens in escrow',
  },
];

export function MPTokenIssuanceCreateForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTokenIssuanceCreateFormProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [transactionJson, setTransactionJson] = useState<MPTokenIssuanceCreate | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<MPTokenIssuanceCreateFormData>({
    defaultValues: {
      assetScale: '0',
      maximumAmount: '',
      transferFee: '0',
      metadata: '',
      canTransfer: true,
      requireAuth: false,
      canLock: false,
      canClawback: false,
      canTrade: false,
      canEscrow: false,
    },
  });

  const watchedFields = watch();

  // Auto-refresh transaction JSON when form content changes and Preview is enabled
  useEffect(() => {
    if (!showPreview) return;

    const validateAndBuild = async () => {
      const isValid = await trigger();
      if (!isValid) return;

      try {
        const formValues = getValues();
        let flags = 0;
        for (const config of FLAGS_CONFIG) {
          if (formValues[config.key]) {
            flags |= config.flagValue;
          }
        }

        const tx = buildMPTokenIssuanceCreate({
          Account: account,
          AssetScale: formValues.assetScale ? parseInt(formValues.assetScale, 10) : undefined,
          MaximumAmount: formValues.maximumAmount || undefined,
          TransferFee: formValues.transferFee ? parseInt(formValues.transferFee, 10) : undefined,
          MPTokenMetadata: formValues.metadata || undefined,
          Flags: flags > 0 ? flags : undefined,
        });
        setTransactionJson(tx);
      } catch {
        // Silent fail on auto-refresh
      }
    };

    validateAndBuild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview, account]);

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

    const tx = buildMPTokenIssuanceCreate({
      Account: account,
      AssetScale: watchedFields.assetScale ? parseInt(watchedFields.assetScale, 10) : undefined,
      MaximumAmount: watchedFields.maximumAmount || undefined,
      TransferFee: watchedFields.transferFee ? parseInt(watchedFields.transferFee, 10) : undefined,
      MPTokenMetadata: watchedFields.metadata || undefined,
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

  const onFormSubmit = async (data: MPTokenIssuanceCreateFormData) => {
    let flags = 0;
    for (const config of FLAGS_CONFIG) {
      if (data[config.key]) {
        flags |= config.flagValue;
      }
    }

    const transaction = buildMPTokenIssuanceCreate({
      Account: account,
      AssetScale: data.assetScale ? parseInt(data.assetScale, 10) : undefined,
      MaximumAmount: data.maximumAmount || undefined,
      TransferFee: data.transferFee ? parseInt(data.transferFee, 10) : undefined,
      MPTokenMetadata: data.metadata || undefined,
      Flags: flags > 0 ? flags : undefined,
    });

    await onSubmit(transaction);
  };

  return (
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="assetScale">Asset Scale (Decimal Places)</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Number of decimal places for the token (0-19). For example, scale 6 means amounts are in millionths.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="assetScale"
            type="number"
            min="0"
            max="19"
            placeholder="0"
            {...register('assetScale', {
              validate: (value: string) => {
                if (!value) return true;
                const num = parseInt(value, 10);
                if (!isValidAssetScale(num)) {
                  return 'Asset scale must be between 0 and 19';
                }
                return true;
              },
            })}
            className={errors.assetScale ? 'border-destructive' : ''}
          />
          {errors.assetScale && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.assetScale.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="maximumAmount">Maximum Supply (Optional)</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Maximum number of tokens that can be issued. Leave empty for unlimited supply.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="maximumAmount"
            type="text"
            placeholder="Leave empty for unlimited"
            {...register('maximumAmount')}
          />
          <p className="text-xs text-muted-foreground">
            Enter as integer (e.g., 1000000 for 1 million tokens)
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Token Flags</h3>
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
                  {...register(config.key)}
                  checked={watchedFields[config.key]}
                  onCheckedChange={(checked) => {
                    setValue(config.key, checked, { shouldValidate: true })
                  }}
                />
              </div>
            ))}
          </div>
        </div>

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

        {showAdvanced && (
          <div className="space-y-4 pl-4 border-l-2 border-border/50 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="transferFee">Transfer Fee (basis points)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Fee charged on transfers between holders. 100 = 0.01%, 5000 = 0.5%, max 500000 = 50%</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="transferFee"
                type="number"
                min="0"
                max="500000"
                placeholder="0"
                {...register('transferFee', {
                  validate: (value: string) => {
                    if (!value) return true;
                    const num = parseInt(value, 10);
                    if (!isValidTransferFee(num)) {
                      return 'Transfer fee must be between 0 and 500000';
                    }
                    return true;
                  },
                })}
                className={errors.transferFee ? 'border-destructive' : ''}
              />
              {errors.transferFee && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.transferFee.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {watchedFields.transferFee && (
                  <>Fee: {(parseInt(watchedFields.transferFee, 10) / 10000).toFixed(4)}%</>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (JSON, max 1024 bytes)</Label>
              <Input
                id="metadata"
                type="text"
                placeholder='{"t":"TKN","n":"Token Name"}'
                {...register('metadata', {
                  validate: (value: string) => {
                    if (!value) return true;
                    if (value.length > 1024) {
                      return 'Metadata cannot exceed 1024 bytes';
                    }
                    return true;
                  },
                })}
                className={errors.metadata ? 'border-destructive' : ''}
              />
              {errors.metadata && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.metadata.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Optional JSON metadata following XLS-89 schema
              </p>
            </div>
          </div>
        )}

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
