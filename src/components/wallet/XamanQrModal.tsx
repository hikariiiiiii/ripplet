import { useTranslation } from 'react-i18next';
import { Smartphone, Loader2, CheckCircle2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface XamanQrModalProps {
  isOpen: boolean;
  qrUrl: string | null;
  payloadUrl: string | null;
  scanned: boolean;
  onClose: () => void;
}

export function XamanQrModal({ isOpen, qrUrl, payloadUrl, scanned, onClose }: XamanQrModalProps) {
  const { t } = useTranslation();

  // Mobile detection
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleOpenInXaman = () => {
    if (payloadUrl) {
      window.location.href = payloadUrl;
    }
  };

  const isScanned = scanned;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img 
              src="/xaman.webp" 
              alt="Xaman" 
              className="w-5 h-5 rounded-lg object-contain"
            />
            {isScanned ? t('wallet.confirmOnDevice', { defaultValue: 'Confirm on your device' }) : t('wallet.connect')}
          </DialogTitle>
          <DialogDescription>
            {isScanned 
              ? t('wallet.confirmTransaction', { defaultValue: 'Please confirm or reject the transaction in Xaman' })
              : t('wallet.scanQr')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {isScanned ? (
            // Show "waiting for confirmation" state
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-xrpl-green/10 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-xrpl-green" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 animate-pulse" />
                <span className="text-sm">{t('wallet.waitingConfirmation', { defaultValue: 'Waiting for confirmation...' })}</span>
              </div>
            </div>
          ) : qrUrl ? (
            // Show QR code
            <div className="relative">
              <img 
                src={qrUrl} 
                alt="Scan with Xaman" 
                className="w-48 h-48 rounded-xl bg-white p-2"
              />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-xl bg-secondary/30 border border-border/50 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-12 h-12 animate-spin text-xrpl-green" />
              <span className="text-sm text-muted-foreground">{t('wallet.loadingQr', { defaultValue: 'Loading QR code...' })}</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground mt-4 text-center">
            {isScanned 
              ? t('wallet.checkYourPhone', { defaultValue: 'Check your phone to complete the transaction' })
              : qrUrl ? t('wallet.scanQr') : t('wallet.connecting')
            }
          </p>
        </div>

        {/* Mobile deeplink button - only show when not scanned */}
        {!isScanned && isMobile && payloadUrl && (
          <Button
            onClick={handleOpenInXaman}
            className="w-full flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            {t('wallet.openInXaman', { defaultValue: 'Open in Xaman' })}
          </Button>
        )}

        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
