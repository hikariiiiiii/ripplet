import { useForm } from 'react-hook-form';
import { AlertCircle, Loader2, HelpCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
}

export function MPTokenIssuanceDestroyForm({
  account,
  onSubmit,
  isSubmitting = false,
}: MPTokenIssuanceDestroyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MPTokenIssuanceDestroyFormData>({
    defaultValues: {
      mptIssuanceId: '',
    },
  });

  const onFormSubmit = async (data: MPTokenIssuanceDestroyFormData) => {
    const transaction = buildMPTokenIssuanceDestroy({
      Account: account,
      MPTokenIssuanceID: data.mptIssuanceId,
    });

    await onSubmit(transaction);
  };

  return (
    <TooltipProvider>
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

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="destructive"
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Destroying...
            </>
          ) : (
            'Destroy MPT Issuance'
          )}
        </Button>
      </form>
    </TooltipProvider>
  );
}
