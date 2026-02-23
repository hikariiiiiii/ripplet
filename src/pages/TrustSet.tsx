import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { TrustSetForm } from '@/components/transaction/TrustSetForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function TrustSetPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('trustset.title')}
      subtitle={t('trustset.subtitle')}
      icon={<Shield className="w-5 h-5 text-cyan-500" />}
      iconBgColor="bg-cyan-500/10"
      borderColor="border-cyan-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <TrustSetForm
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
