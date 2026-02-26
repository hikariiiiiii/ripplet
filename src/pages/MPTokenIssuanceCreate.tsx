import { useTranslation } from 'react-i18next';
import { Box } from 'lucide-react';
import { MPTokenIssuanceCreateForm } from '@/components/transaction/MPTokenIssuanceCreateForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function MPTokenIssuanceCreatePage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mpt.create.title')}
      subtitle={t('mpt.create.subtitle')}
      icon={<Box className="w-5 h-5 text-cyan-500" />}
      iconBgColor="bg-cyan-500/10"
      borderColor="border-cyan-500/20"
      docUrl={getXRPLTransactionDocUrl('MPTokenIssuanceCreate')}
      conceptUrl={XRPL_DOC_CONCEPTS.mpt}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTokenIssuanceCreateForm
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
