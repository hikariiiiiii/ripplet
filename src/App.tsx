import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Payment from '@/pages/Payment';
import TrustSet from '@/pages/TrustSet';
import AccountSet from '@/pages/AccountSet';
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
          <Route path="xrp/payment" element={<Payment />} />
          <Route path="iou/trustset" element={<TrustSet />} />
          <Route path="iou/accountset" element={<AccountSet />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
