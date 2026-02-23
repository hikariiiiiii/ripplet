import { useForm } from 'react-hook-form';
import { AlertCircle, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
}

export function MPTokenAuthorizeForm({
  account,
  onSubmit,
  isSubmitting = false,
}: MPTokenAuthorizeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },


  } = useForm<MPTokenAuthorizeFormData>({
    defaultValues: {
      mptIssuanceId: '',
      holder: '',
      unauthorize: false,
    },
  });

  const watchedFields = watch();

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
    <TooltipProvider>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            watchedFields.unauthorize ? 'Revoke Authorization' : 'Authorize'
          )}
        </Button>
      </form>
    </TooltipProvider>
  );
}
