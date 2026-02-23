import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { NFTokenAcceptOfferForm } from '@/components/transaction/NFTokenAcceptOfferForm';

export default function NFTokenAcceptOfferPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('nftAcceptOffer.title')}
      icon={<CheckCircle className="w-5 h-5 text-green-500" />}
      iconBgColor="bg-green-500/10"
      borderColor="border-green-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <NFTokenAcceptOfferForm
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
