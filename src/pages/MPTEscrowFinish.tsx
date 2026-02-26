import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { MPTEscrowFinishForm } from '@/components/transaction/MPTEscrowFinishForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function MPTEscrowFinishPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mpt.escrowFinish.title')}
      subtitle={t('mpt.escrowFinish.subtitle')}
      icon={<CheckCircle className="w-5 h-5 text-green-500" />}
      iconBgColor="bg-green-500/10"
      borderColor="border-green-500/20"
      docUrl={getXRPLTransactionDocUrl('MPTEscrowFinish')}
      conceptUrl={XRPL_DOC_CONCEPTS.mpt}
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
