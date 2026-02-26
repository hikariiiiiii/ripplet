import { useTranslation } from 'react-i18next';
import { Layers } from 'lucide-react';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { NFTokenMintForm } from '@/components/transaction/NFTokenMintForm';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function NFTokenMintPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('nftMint.title')}
      subtitle={t('nftMint.subtitle')}
      icon={<Layers className="w-5 h-5 text-purple-500" />}
      iconBgColor="bg-purple-500/10"
      borderColor="border-purple-500/20"
      docUrl={getXRPLTransactionDocUrl('nftokenmint')}
      conceptUrl={XRPL_DOC_CONCEPTS.nft}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <NFTokenMintForm
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
