import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper'
import { EscrowCreateForm } from '@/components/transaction/EscrowCreateForm'
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls'

export default function EscrowCreatePage() {
  const { t } = useTranslation()

  return (
    <TransactionPageWrapper
      title={t('escrow.createTitle')}
      subtitle={t('escrow.createSubtitle')}
      icon={<Lock className="w-5 h-5 text-amber-500" />}
      iconBgColor="bg-amber-500/10"
      borderColor="border-amber-500/20"
      docUrl={getXRPLTransactionDocUrl('EscrowCreate')}
      conceptUrl={XRPL_DOC_CONCEPTS.escrow}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <EscrowCreateForm
          account={address}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          isConnected={isConnected}
          onConnectWallet={onConnectWallet}
        />
      )}
    </TransactionPageWrapper>
  )
}
