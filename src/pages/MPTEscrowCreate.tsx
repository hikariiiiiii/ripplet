import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { MPTEscrowCreateForm } from '@/components/transaction/MPTEscrowCreateForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function MPTEscrowCreatePage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mptEscrowCreate.title')}
      subtitle={t('mptEscrowCreate.subtitle')}
      icon={<Lock className="w-5 h-5 text-orange-500" />}
      iconBgColor="bg-orange-500/10"
      borderColor="border-orange-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTEscrowCreateForm
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
