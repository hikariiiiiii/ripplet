import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { CredentialDeleteForm } from '@/components/transaction/CredentialDeleteForm';
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper';
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls';

export default function CredentialDeletePage() {
  const { t } = useTranslation();

  return (
    <TransactionPageWrapper
      title={t('credentialDelete.title')}
      subtitle={t('credentialDelete.subtitle')}
      icon={<Trash2 className="w-5 h-5 text-red-500" />}
      iconBgColor="bg-red-500/10"
      borderColor="border-red-500/20"
      docUrl={getXRPLTransactionDocUrl('CredentialDelete')}
      conceptUrl={XRPL_DOC_CONCEPTS.credential}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <CredentialDeleteForm
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
