import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { CredentialAcceptForm } from '@/components/transaction/CredentialAcceptForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function CredentialAcceptPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('credentialAccept.title')}
      subtitle={t('credentialAccept.subtitle')}
      icon={<CheckCircle className="w-5 h-5 text-green-500" />}
      iconBgColor="bg-green-500/10"
      borderColor="border-green-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <CredentialAcceptForm
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
