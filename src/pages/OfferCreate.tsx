import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import { OfferCreateForm } from '@/components/transaction/OfferCreateForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function OfferCreatePage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('offerCreate.title')}
      subtitle={t('offerCreate.subtitle')}
      icon={<TrendingUp className="w-5 h-5 text-blue-500" />}
      iconBgColor="bg-blue-500/10"
      borderColor="border-blue-500/20"
      docUrl={getXRPLTransactionDocUrl('OfferCreate')}
      conceptUrl={XRPL_DOC_CONCEPTS.dex}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <OfferCreateForm
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
