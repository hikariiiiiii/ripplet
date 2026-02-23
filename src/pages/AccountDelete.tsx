import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { TransactionPageWrapper } from '@/components/transaction/TransactionPageWrapper'
import { AccountDeleteForm } from '@/components/transaction/AccountDeleteForm'

export default function AccountDeletePage() {
  const { t } = useTranslation()

  return (
    <TransactionPageWrapper
      title={t('accountdelete.title')}
      subtitle="Delete your XRPL account and transfer remaining XRP"
      icon={<Trash2 className="w-5 h-5 text-red-500" />}
      iconBgColor="bg-red-500/10"
      borderColor="border-red-500/20"
    >
      {({ address, onSubmit, isSubmitting, isConnected, onConnectWallet }) => (
        <AccountDeleteForm
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
