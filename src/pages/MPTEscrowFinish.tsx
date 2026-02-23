import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { MPTEscrowFinishForm } from '@/components/transaction/MPTEscrowFinishForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';

export default function MPTEscrowFinishPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('escrow.finishTitle')}
      subtitle={t('escrow.finishTitle')}
      icon={<Lock className="w-5 h-5 text-orange-500" />}
      iconBgColor="bg-orange-500/10"
      borderColor="border-orange-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTEscrowFinishForm
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
