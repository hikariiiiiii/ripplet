import { useTranslation } from 'react-i18next';
import { Coins } from 'lucide-react';
import { IOUPaymentForm } from '@/components/transaction/IOUPaymentForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function IOUPaymentPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('ioudPayment.title')}
      subtitle={t('ioudPayment.subtitle')}
      icon={<Coins className="w-5 h-5 text-cyan-500" />}
      iconBgColor="bg-cyan-500/10"
      borderColor="border-cyan-500/20"
      docUrl={getXRPLTransactionDocUrl('Payment')}
      conceptUrl={XRPL_DOC_CONCEPTS.iou}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <IOUPaymentForm
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
