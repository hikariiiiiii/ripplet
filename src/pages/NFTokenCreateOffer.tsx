import { useTranslation } from 'react-i18next';
import { Tags } from 'lucide-react';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { NFTokenCreateOfferForm } from '@/components/transaction/NFTokenCreateOfferForm';

export default function NFTokenCreateOfferPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('nftCreateOffer.title')}
      icon={<Tags className="w-5 h-5 text-blue-500" />}
      iconBgColor="bg-blue-500/10"
      borderColor="border-blue-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <NFTokenCreateOfferForm
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
