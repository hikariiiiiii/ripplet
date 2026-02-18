import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Payment from '@/pages/Payment';
import TrustSet from '@/pages/TrustSet';
import AccountSet from '@/pages/AccountSet';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="payment" element={<Payment />} />
          <Route path="trustset" element={<TrustSet />} />
          <Route path="accountset" element={<AccountSet />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
