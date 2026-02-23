import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { MPTokenIssuanceDestroyForm } from '@/components/transaction/MPTokenIssuanceDestroyForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function MPTokenIssuanceDestroyPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mpt.destroy.title')}
      subtitle={t('mpt.destroy.subtitle')}
      icon={<Trash2 className="w-5 h-5 text-red-500" />}
      iconBgColor="bg-red-500/10"
      borderColor="border-red-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTokenIssuanceDestroyForm
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
