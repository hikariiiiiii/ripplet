import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { MPTEscrowCreateForm } from '@/components/transaction/MPTEscrowCreateForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function MPTEscrowCreatePage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mpt.escrowCreate.title')}
      subtitle={t('mpt.escrowCreate.subtitle')}
      icon={<Lock className="w-5 h-5 text-orange-500" />}
      iconBgColor="bg-orange-500/10"
      borderColor="border-orange-500/20"
      docUrl={getXRPLTransactionDocUrl('MPTEscrowCreate')}
      conceptUrl={XRPL_DOC_CONCEPTS.mpt}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTEscrowCreateForm
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
