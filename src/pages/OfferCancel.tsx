import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { OfferCancelForm } from '@/components/transaction/OfferCancelForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function OfferCancelPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('offerCancel.title')}
      subtitle={t('offerCancel.subtitle')}
      icon={<XCircle className="w-5 h-5 text-red-500" />}
      iconBgColor="bg-red-500/10"
      borderColor="border-red-500/20"
      docUrl={getXRPLTransactionDocUrl('OfferCancel')}
      conceptUrl={XRPL_DOC_CONCEPTS.dex}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <OfferCancelForm
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
