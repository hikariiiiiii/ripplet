import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { MPTTransferForm } from '@/components/transaction/MPTTransferForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function MPTTransferPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mptTransfer.title')}
      subtitle={t('mptTransfer.subtitle')}
      icon={<Send className="w-5 h-5 text-orange-500" />}
      iconBgColor="bg-orange-500/10"
      borderColor="border-orange-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTTransferForm
          account={address}
          onSubmit={(tx) => onSubmit(tx)}
          isSubmitting={isSubmitting}
          isConnected={isConnected}
          onConnectWallet={onConnectWallet}
        />
      )}
    </TransactionPageWrapper>
  );
}
