import { useTranslation } from 'react-i18next';
import { Undo2 } from 'lucide-react';
import { MPTClawbackForm } from '@/components/transaction/MPTClawbackForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function MPTClawbackPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mptClawback.title')}
      subtitle={t('mptClawback.subtitle')}
      icon={<Undo2 className="w-5 h-5 text-purple-500" />}
      iconBgColor="bg-purple-500/10"
      borderColor="border-purple-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTClawbackForm
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
