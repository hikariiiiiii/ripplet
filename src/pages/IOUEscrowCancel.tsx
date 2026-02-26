import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { IOUEscrowCancelForm } from '@/components/transaction/IOUEscrowCancelForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function IOUEscrowCancelPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('iouEscrowCancel.title')}
      subtitle={t('iouEscrowCancel.subtitle')}
      icon={<XCircle className="w-5 h-5 text-amber-500" />}
      iconBgColor="bg-amber-500/10"
      borderColor="border-amber-500/20"
      docUrl={getXRPLTransactionDocUrl('EscrowCancel')}
      conceptUrl={XRPL_DOC_CONCEPTS.escrow}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <IOUEscrowCancelForm
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
