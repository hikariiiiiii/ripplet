import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper'
import { EscrowCancelForm } from '@/components/transaction/EscrowCancelForm'
import { getXRPLTransactionDocUrl, XRPL_DOC_CONCEPTS } from '@/lib/xrpl/docUrls'

export default function EscrowCancelPage() {
  const { t } = useTranslation()

  return (
    <TransactionPageWrapper
      title={t('escrow.cancelTitle')}
      subtitle={t('escrow.cancelSubtitle')}
      icon={<Lock className="w-5 h-5 text-amber-500" />}
      iconBgColor="bg-amber-500/10"
      borderColor="border-amber-500/20"
      docUrl={getXRPLTransactionDocUrl('EscrowCancel')}
      conceptUrl={XRPL_DOC_CONCEPTS.escrow}
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <EscrowCancelForm
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
