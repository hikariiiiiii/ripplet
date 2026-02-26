import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';
import { MPTLockForm } from '@/components/transaction/MPTLockForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function MPTLockPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('mptLock.title')}
      subtitle={t('mptLock.subtitle')}
      icon={<Lock className="w-5 h-5 text-red-500" />}
      iconBgColor="bg-red-500/10"
      borderColor="border-red-500/20"
      docUrl={getXRPLTransactionDocUrl('MPTLock')}
      conceptUrl={XRPL_DOC_CONCEPTS.mpt}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <MPTLockForm
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
