import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { IOUEscrowCreateForm } from '@/components/transaction/IOUEscrowCreateForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function IOUEscrowCreatePage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('ioudEscrowCreate.title')}
      subtitle={t('ioudEscrowCreate.subtitle')}
      icon={<Lock className="w-5 h-5 text-cyan-500" />}
      iconBgColor="bg-cyan-500/10"
      borderColor="border-cyan-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <IOUEscrowCreateForm
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
