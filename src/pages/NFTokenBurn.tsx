import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { NFTokenBurnForm } from '@/components/transaction/NFTokenBurnForm';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function NFTokenBurnPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('nftBurn.title')}
      subtitle={t('nftBurn.subtitle')}
      icon={<Flame className="w-5 h-5 text-orange-500" />}
      iconBgColor="bg-orange-500/10"
      borderColor="border-orange-500/20"
      docUrl={getXRPLTransactionDocUrl('nftokenburn')}
      conceptUrl={XRPL_DOC_CONCEPTS.nft}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <NFTokenBurnForm
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
