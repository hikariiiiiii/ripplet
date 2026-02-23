import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper'
import { EscrowFinishForm } from '@/components/transaction/EscrowFinishForm'

export default function EscrowFinishPage() {
  const { t } = useTranslation()

  return (
    <TransactionPageWrapper
      title={t('escrow.finishTitle')}
      subtitle="Release funds from an escrow"
      icon={<Lock className="w-5 h-5 text-amber-500" />}
      iconBgColor="bg-amber-500/10"
      borderColor="border-amber-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <EscrowFinishForm
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
