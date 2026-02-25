import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  buildMPTokenAuthorize,
  MPT_AUTHORIZE_FLAGS,
  isValidMPTIssuanceID,
  isValidXRPLAddress,
} from '@/lib/xrpl/transactions/mpt';
import type { MPTokenAuthorize } from 'xrpl';

interface MPTokenAuthorizeFormData {
  mptIssuanceId: string;
  holder: string;
  unauthorize: boolean;
}

interface MPTokenAuthorizeFormProps {
  account: string;
  onSubmit: (transaction: MPTokenAuthorize) => void | Promise<void>;
  isSubmitting?: boolean;
  isConnected?: boolean;
  onConnectWallet?: () => void;
}

export function MPTokenAuthorizeForm({
  account,
  onSubmit,
  isSubmitting = false,
  isConnected = true,
  onConnectWallet,
}: MPTokenAuthorizeFormProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [transactionJson, setTransactionJson] = useState<MPTokenAuthorize | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },


  } = useForm<MPTokenAuthorizeFormData>({
    defaultValues: {
      mptIssuanceId: '',
      holder: '',
      unauthorize: false,
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
        const tx = buildMPTokenAuthorize({
          Account: account,
          MPTokenIssuanceID: watchedFields.mptIssuanceId,
          Holder: watchedFields.holder || undefined,
          Flags: watchedFields.unauthorize ? MPT_AUTHORIZE_FLAGS.tfMPTUnauthorize : undefined,
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

    const tx = buildMPTokenAuthorize({
      Account: account,
      MPTokenIssuanceID: watchedFields.mptIssuanceId,
      Holder: watchedFields.holder || undefined,
      Flags: watchedFields.unauthorize ? MPT_AUTHORIZE_FLAGS.tfMPTUnauthorize : undefined,
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

  const onFormSubmit = async (data: MPTokenAuthorizeFormData) => {
    const transaction = buildMPTokenAuthorize({
      Account: account,
      MPTokenIssuanceID: data.mptIssuanceId,
      Holder: data.holder || undefined,
      Flags: data.unauthorize ? MPT_AUTHORIZE_FLAGS.tfMPTUnauthorize : undefined,
    });

    await onSubmit(transaction);
  };

  return (
    
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="mptIssuanceId">MPT Issuance ID</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>The 48-character hexadecimal ID of the MPT issuance.</p>
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

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="holder">Holder Address (Optional)</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  <strong>For Issuers:</strong> Enter the holder address to authorize/unauthorize a specific account.<br />
                  <strong>For Holders:</strong> Leave empty to opt-in to holding this MPT.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="holder"
            type="text"
            placeholder="r..."
            className={`font-mono text-sm ${errors.holder ? 'border-destructive' : ''}`}
            {...register('holder', {
              validate: (value: string) => {
                if (!value) return true;
                if (!isValidXRPLAddress(value)) {
                  return 'Invalid XRPL address format';
                }
                return true;
              },
            })}
          />
          {errors.holder && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.holder.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Leave empty if you are a holder opting in to hold this MPT
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="unauthorize" className="cursor-pointer text-sm font-medium">
              Revoke Authorization
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Enable this to remove authorization from the holder instead of granting it.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            id="unauthorize"
            checked={watchedFields.unauthorize}
            onCheckedChange={(checked) => setValue('unauthorize', checked)}
          />
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
