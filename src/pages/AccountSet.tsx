import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { AccountSetForm } from '@/components/transaction/AccountSetForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function AccountSetPage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('accountset.title')}
      subtitle={t('accountset.subtitle')}
      icon={<Settings className="w-5 h-5 text-purple-500" />}
      iconBgColor="bg-purple-500/10"
      borderColor="border-purple-500/20"
      docUrl={getXRPLTransactionDocUrl('AccountSet')}
      conceptUrl={XRPL_DOC_CONCEPTS.account}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <AccountSetForm
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
