import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { MPTEscrowCancelForm } from '@/components/transaction/MPTEscrowCancelForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function MPTEscrowCancelPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mpt.escrowCancel.title')}
      subtitle={t('mpt.escrowCancel.subtitle')}
      icon={<XCircle className="w-5 h-5 text-red-500" />}
      iconBgColor="bg-red-500/10"
      borderColor="border-red-500/20"
      docUrl={getXRPLTransactionDocUrl('MPTEscrowCancel')}
      conceptUrl={XRPL_DOC_CONCEPTS.mpt}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTEscrowCancelForm
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
