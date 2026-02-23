import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Payment from '@/pages/Payment';
import TrustSet from '@/pages/TrustSet';
import AccountSet from '@/pages/AccountSet';
import AccountDelete from '@/pages/AccountDelete';
import EscrowCreate from '@/pages/EscrowCreate';
import EscrowFinish from '@/pages/EscrowFinish';
import EscrowCancel from '@/pages/EscrowCancel';
import MPTokenIssuanceCreate from '@/pages/MPTokenIssuanceCreate';
import MPTokenIssuanceSet from '@/pages/MPTokenIssuanceSet';
import MPTokenIssuanceDestroy from '@/pages/MPTokenIssuanceDestroy';
import MPTokenAuthorize from '@/pages/MPTokenAuthorize';
import CredentialCreate from '@/pages/CredentialCreate';
import CredentialAccept from '@/pages/CredentialAccept';
import CredentialDelete from '@/pages/CredentialDelete';
import OfferCreate from '@/pages/OfferCreate';
import OfferCancel from '@/pages/OfferCancel';
import NFTokenMint from '@/pages/NFTokenMint';
import NFTokenBurn from '@/pages/NFTokenBurn';
import NFTokenCreateOffer from '@/pages/NFTokenCreateOffer';
import NFTokenAcceptOffer from '@/pages/NFTokenAcceptOffer';
import IOUPayment from '@/pages/IOUPayment';
import IOUEscrowCreate from '@/pages/IOUEscrowCreate';
import IOUEscrowFinish from '@/pages/IOUEscrowFinish';
import MPTTransfer from '@/pages/MPTTransfer';
import MPTEscrowCreate from '@/pages/MPTEscrowCreate';
import MPTLock from '@/pages/MPTLock';
import MPTClawback from '@/pages/MPTClawback';
import { useWalletEvents } from '@/hooks/useWalletEvents';

function WalletEventListener() {
  useWalletEvents();
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <WalletEventListener />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="account/accountset" element={<AccountSet />} />
          <Route path="account/accountdelete" element={<AccountDelete />} />
          <Route path="xrp/payment" element={<Payment />} />
          <Route path="xrp/escrow/create" element={<EscrowCreate />} />
          <Route path="xrp/escrow/finish" element={<EscrowFinish />} />
          <Route path="xrp/escrow/cancel" element={<EscrowCancel />} />
          <Route path="iou/trustset" element={<TrustSet />} />
          <Route path="iou/accountset" element={<AccountSet />} />
          <Route path="iou/offercreate" element={<OfferCreate />} />
          <Route path="iou/payment" element={<IOUPayment />} />
          <Route path="iou/escrow/create" element={<IOUEscrowCreate />} />
          <Route path="iou/escrow/finish" element={<IOUEscrowFinish />} />
          <Route path="iou/offercancel" element={<OfferCancel />} />
          <Route path="mpt/create" element={<MPTokenIssuanceCreate />} />
          <Route path="mpt/set" element={<MPTokenIssuanceSet />} />
          <Route path="mpt/destroy" element={<MPTokenIssuanceDestroy />} />
          <Route path="mpt/authorize" element={<MPTokenAuthorize />} />
          <Route path="mpt/transfer" element={<MPTTransfer />} />
          <Route path="mpt/escrow/create" element={<MPTEscrowCreate />} />
          <Route path="mpt/lock" element={<MPTLock />} />
          <Route path="mpt/clawback" element={<MPTClawback />} />
          <Route path="credential/create" element={<CredentialCreate />} />
          <Route path="credential/accept" element={<CredentialAccept />} />
          <Route path="credential/delete" element={<CredentialDelete />} />
          <Route path="nft/mint" element={<NFTokenMint />} />
          <Route path="nft/burn" element={<NFTokenBurn />} />
          <Route path="nft/createoffer" element={<NFTokenCreateOffer />} />
          <Route path="nft/acceptoffer" element={<NFTokenAcceptOffer />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
