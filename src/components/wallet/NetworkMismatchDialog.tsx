import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { WalletMismatchError } from '@/types';

interface NetworkMismatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: WalletMismatchError | null;
}

export function NetworkMismatchDialog({ open, onOpenChange, error }: NetworkMismatchDialogProps) {
  const { t } = useTranslation();

  if (!error) return null;

  const isNetworkMismatch = error.type === 'network';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
            {isNetworkMismatch 
              ? t('wallet.networkMismatch', 'Network Mismatch')
              : t('wallet.accountMismatch', 'Account Mismatch')
            }
          </DialogTitle>
          <DialogDescription className="pt-4 space-y-4">
            {isNetworkMismatch ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground">
                    {t('wallet.currentNetwork', 'Current Wallet Network')}
                  </span>
                  <span className="font-medium text-amber-500">
                    {error.current || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground">
                    {t('wallet.requiredNetwork', 'Required Network')}
                  </span>
                  <span className="font-medium text-green-500">
                    {error.expected || 'Unknown'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground">
                    {t('wallet.currentAccount', 'Current Wallet Account')}
                  </span>
                  <span className="font-mono text-xs text-amber-500">
                    {error.current?.slice(0, 8)}...{error.current?.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground">
                    {t('wallet.requiredAccount', 'Required Account')}
                  </span>
                  <span className="font-mono text-xs text-green-500">
                    {error.expected?.slice(0, 8)}...{error.expected?.slice(-6)}
                  </span>
                </div>
              </div>
            )}
            
            <p className="text-sm text-muted-foreground pt-2">
              {isNetworkMismatch
                ? t('wallet.switchNetworkHint', 'Please switch your wallet network to continue.')
                : t('wallet.switchAccountHint', 'Please switch your wallet account to continue.')
              }
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            {t('common.gotIt', 'Got it')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
