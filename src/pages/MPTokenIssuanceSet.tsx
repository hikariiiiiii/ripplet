import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { MPTokenIssuanceSetForm } from '@/components/transaction/MPTokenIssuanceSetForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function MPTokenIssuanceSetPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mpt.set.title')}
      subtitle={t('mpt.set.subtitle')}
      icon={<Settings className="w-5 h-5 text-cyan-500" />}
      iconBgColor="bg-cyan-500/10"
      borderColor="border-cyan-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTokenIssuanceSetForm
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
