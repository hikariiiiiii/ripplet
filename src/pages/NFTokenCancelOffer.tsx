import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { NFTokenCancelOfferForm } from '@/components/transaction/NFTokenCancelOfferForm';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function NFTokenCancelOfferPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('nftCancelOffer.title')}
      subtitle={t('nftCancelOffer.subtitle')}
      icon={<XCircle className="w-5 h-5 text-red-500" />}
      iconBgColor="bg-red-500/10"
      borderColor="border-red-500/20"
      docUrl={getXRPLTransactionDocUrl('nftokencanceloffer')}
      conceptUrl={XRPL_DOC_CONCEPTS.nft}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <NFTokenCancelOfferForm
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
