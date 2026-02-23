import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { PaymentForm } from '@/components/transaction/PaymentForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';



export default function PaymentPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('payment.title')}
      subtitle={t('payment.subtitle')}
      icon={<Send className="w-5 h-5 text-xrpl-green" />}
      iconBgColor="bg-xrpl-green/10"
      borderColor="border-xrpl-green/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <PaymentForm
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
