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
}: MPTokenIssuanceSetFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MPTokenIssuanceSetFormData>({
    defaultValues: {
      mptIssuanceId: '',
      canLock: false,
      canClawback: false,
    },
  });

  const watchedFields = watch();

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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update MPT Issuance'
          )}
        </Button>
      </form>
    </TooltipProvider>
  );
}
