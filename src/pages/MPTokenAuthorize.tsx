import { useTranslation } from 'react-i18next';
import { UserCheck } from 'lucide-react';
import { MPTokenAuthorizeForm } from '@/components/transaction/MPTokenAuthorizeForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function MPTokenAuthorizePage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mpt.authorize.title')}
      subtitle={t('mpt.authorize.subtitle')}
      icon={<UserCheck className="w-5 h-5 text-green-500" />}
      iconBgColor="bg-green-500/10"
      borderColor="border-green-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTokenAuthorizeForm
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
