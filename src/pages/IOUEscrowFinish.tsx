import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { IOUEscrowFinishForm } from '@/components/transaction/IOUEscrowFinishForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function IOUEscrowFinishPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('ioudEscrowFinish.title')}
      subtitle={t('ioudEscrowFinish.subtitle')}
      icon={<Lock className="w-5 h-5 text-cyan-500" />}
      iconBgColor="bg-cyan-500/10"
      borderColor="border-cyan-500/20"
      docUrl={getXRPLTransactionDocUrl('EscrowFinish')}
      conceptUrl={XRPL_DOC_CONCEPTS.escrow}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <IOUEscrowFinishForm
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
