import { useTranslation } from 'react-i18next';
import { BadgeCheck } from 'lucide-react';
import { CredentialCreateForm } from '@/components/transaction/CredentialCreateForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function CredentialCreatePage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('credentialCreate.title')}
      subtitle={t('credentialCreate.subtitle')}
      icon={<BadgeCheck className="w-5 h-5 text-indigo-500" />}
      iconBgColor="bg-indigo-500/10"
      borderColor="border-indigo-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <CredentialCreateForm
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
